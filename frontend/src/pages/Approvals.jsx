// src/pages/Approvals.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; 

const Approvals = () => {
  // 1. Unified State Management
  const [queueItems, setQueueItems] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // PO Configuration State (Maps directly to your PurchaseOrder entity)
  const [remarks, setRemarks] = useState('');
  const [shippingAddress, setShippingAddress] = useState('DDU Campus, Nadiad, Gujarat, India');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('vendorBridgeUser'))?.token;
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // 2. Fetch Queues on Mount
  useEffect(() => {
    const fetchPendingQueues = async () => {
      try {
        setLoading(true);
        const [rfqResponse, quoteResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/rfqs/drafted`, { headers: getHeaders() }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/quotations/officer`, { headers: getHeaders() }).catch(() => ({ data: [] }))
        ]); 
        
        const pendingRfqs = (rfqResponse.data || [])
          .filter(r => r.status === 'DRAFT' || r.status === 'PENDING_APPROVAL')
          .map(r => ({ ...r, queueType: 'RFQ', queueId: `RFQ-${r.id}` }));

        const pendingQuotes = (quoteResponse.data || [])
          .map(q => ({ ...q, queueType: 'QUOTATION', queueId: `QTN-${q.id}` }));

        const combinedQueue = [...pendingRfqs, ...pendingQuotes];
        setQueueItems(combinedQueue);
        
        if (combinedQueue.length > 0) {
          setSelectedQueueId(combinedQueue[0].queueId);
        }
      } catch (err) {
        setError("Failed to load the approval queues. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQueues();
  }, [API_BASE_URL]);

  const selectedItem = useMemo(() => {
    return queueItems.find(item => item.queueId === selectedQueueId);
  }, [queueItems, selectedQueueId]);

  // Handle Form Resets when changing selected items
  useEffect(() => {
    if (selectedItem?.queueType === 'QUOTATION') {
      // Set a default delivery date 14 days from today
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      setExpectedDeliveryDate(futureDate.toISOString().split('T')[0]);
      setShippingAddress('DDU Campus, Nadiad, Gujarat, India');
    }
    setRemarks('');
  }, [selectedItem]);

  // 3. Action Handlers
  const handleAction = async (decision) => {
    if (!selectedItem) return;
    
    if (selectedItem.queueType === 'QUOTATION' && decision === 'APPROVE') {
        if (!expectedDeliveryDate || !shippingAddress) {
            alert("Please provide a Shipping Address and Expected Delivery Date for the Purchase Order.");
            return;
        }
        const confirmPO = window.confirm("WARNING: Approving this quotation will instantly generate a legally binding Purchase Order and email it to the vendor. Proceed?");
        if (!confirmPO) return;
    }

    setActionLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      if (selectedItem.queueType === 'RFQ') {
          endpoint = decision === 'APPROVE' 
            ? `${API_BASE_URL}/rfqs/publish/${selectedItem.id}` 
            : `${API_BASE_URL}/rfqs/reject/${selectedItem.id}`;
          payload = { remarks };
      } else {
          endpoint = `${API_BASE_URL}/quotations/action/${selectedItem.id}`;
          payload = { 
            action: decision, 
            remarks: remarks,
            // Maps to your PurchaseOrder entity fields
            shippingAddress: shippingAddress,
            expectedDeliveryDate: expectedDeliveryDate ? `${expectedDeliveryDate}T23:59:59` : null
          };
      }

      await axios.put(endpoint, payload, { headers: getHeaders() });
      
      const actionText = decision === 'APPROVE' 
        ? (selectedItem.queueType === 'RFQ' ? 'RFQ Published' : 'Purchase Order Generated') 
        : 'Request Rejected';
        
      alert(`${actionText}!`);
      
      const updatedQueue = queueItems.filter(item => item.queueId !== selectedQueueId);
      setQueueItems(updatedQueue);
      setSelectedQueueId(updatedQueue.length > 0 ? updatedQueue[0].queueId : null);

    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your action queue...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div>
        <h2 className="text-2xl font-semibold text-[#212529]">Approver Dashboard</h2>
        <p className="text-gray-500 mt-1">Review RFQ publishing requests and configure final Purchase Orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 h-[calc(100vh-180px)] min-h-[600px]">
        
        {/* LEFT COLUMN: Queue */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Action Queue</h3>
            <span className="bg-[#017E84] text-white text-xs font-bold px-2 py-1 rounded-full">{queueItems.length}</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {queueItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Your queue is clear.</div>
            ) : (
              queueItems.map((item) => {
                const isRfq = item.queueType === 'RFQ';
                return (
                  <div 
                    key={item.queueId}
                    onClick={() => setSelectedQueueId(item.queueId)}
                    className={`p-4 rounded border cursor-pointer transition-all ${selectedQueueId === item.queueId ? 'border-[#017E84] bg-[#017E84]/5 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-[#017E84]">{item.queueId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isRfq ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {isRfq ? 'Publish RFQ' : 'Generate PO'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#212529] truncate">
                      {isRfq ? item.title : item.rfq?.title}
                    </h4>
                    {isRfq ? (
                      <p className="text-xs text-gray-500 mt-1 truncate">Officer: {item.createdBy?.email}</p>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 truncate">Vendor: {item.vendor?.companyName || item.vendor?.email.split('@')[0]}</p>
                        <p className="text-xs font-bold text-[#017E84]">₹{item.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Details & PO Configuration */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-y-auto p-6 md:p-8 relative">
          
          {!selectedItem ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select an item to review.</div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col">
              
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3 mb-3">
                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${selectedItem.queueType === 'RFQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                     {selectedItem.queueType === 'RFQ' ? 'Internal Approval: Publish RFQ to Vendors' : 'Final Authorization: Configure Purchase Order'}
                   </span>
                </div>
                <h2 className="text-2xl font-bold text-[#212529]">
                  {selectedItem.queueType === 'RFQ' ? selectedItem.title : selectedItem.rfq?.title}
                </h2>
                
                <div className="flex items-center space-x-4 mt-4 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                  {selectedItem.queueType === 'RFQ' ? (
                    <>
                      <span className="text-gray-600">Created By: <span className="font-semibold text-gray-800">{selectedItem.createdBy?.email}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">Deadline: <span className="font-bold text-[#017E84]">{new Date(selectedItem.deadline).toLocaleDateString()}</span></span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-600">Selected Vendor: <span className="font-semibold text-gray-800">{selectedItem.vendor?.companyName || selectedItem.vendor?.email}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">Total Contract Value: <span className="font-bold text-lg text-[#017E84]">₹{selectedItem.totalAmount?.toLocaleString('en-IN')}</span></span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                
                {/* Left: Items Display */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    {selectedItem.queueType === 'RFQ' ? 'Requested Line Items' : 'Purchase Order Line Items'}
                  </h3>
                  <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-5 shadow-sm max-h-[300px] overflow-y-auto">
                    {selectedItem.queueType === 'RFQ' ? (
                      selectedItem.lineItems?.map((line) => (
                        <div key={line.id || Math.random()} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="font-medium text-gray-700">{line.item}</span>
                          <span className="text-[#017E84] font-bold bg-[#017E84]/10 px-2 py-1 rounded">{line.quantity} {line.unit}</span>
                        </div>
                      ))
                    ) : (
                      selectedItem.items?.map((quoteItem) => (
                        <div key={quoteItem.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                          <div>
                            <span className="font-medium text-gray-800 block">{quoteItem.rfqLineItem?.item}</span>
                            <span className="text-xs text-gray-500">{quoteItem.rfqLineItem?.quantity} {quoteItem.rfqLineItem?.unit} @ ₹{quoteItem.unitPrice?.toLocaleString('en-IN')}/unit</span>
                          </div>
                          <span className="font-bold text-gray-900">₹{quoteItem.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Forms and Configurations */}
                <div className="flex flex-col space-y-4">
                  {selectedItem.queueType === 'RFQ' ? (
                    <>
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Targeted Vendors ({selectedItem.assignedVendors?.length || 0})</h3>
                        <div className="space-y-2 bg-[#F9F9F9] border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
                           {selectedItem.assignedVendors && selectedItem.assignedVendors.length > 0 ? (
                             selectedItem.assignedVendors.map(v => (
                               <div key={v.id} className="text-xs font-medium text-gray-600 bg-white p-2 border border-gray-100 rounded">{v.companyName || v.email}</div>
                             ))
                           ) : (
                             <span className="text-xs text-gray-500">Open to all registered vendors.</span>
                           )}
                        </div>
                      </div>
                      <div className="mt-auto">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Approver Remarks</h3>
                        <textarea 
                          rows="4" 
                          placeholder="Add internal notes before publishing..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#017E84] focus:ring-1 focus:ring-[#017E84] text-sm bg-white"
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    // PO Configuration Form
                    <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 h-full flex flex-col">
                      <h3 className="text-sm font-bold text-purple-900 border-b border-purple-200 pb-2 mb-4">Configure Purchase Order</h3>
                      
                      <div className="space-y-4 flex-1">
                        <div>
                          <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Expected Delivery Date *</label>
                          <input 
                            type="date" 
                            required
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-200 rounded focus:outline-none focus:border-purple-500 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Shipping Address *</label>
                          <textarea 
                            rows="2" 
                            required
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-200 rounded focus:outline-none focus:border-purple-500 text-sm resize-none"
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">PO Terms & Conditions (Remarks)</label>
                          <textarea 
                            rows="2" 
                            placeholder="Add specific terms for this PO..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full px-3 py-2 border border-purple-200 rounded focus:outline-none focus:border-purple-500 text-sm resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200 mt-auto">
                <button 
                  onClick={() => handleAction('APPROVE')}
                  disabled={actionLoading}
                  className={`flex-1 bg-[#017E84] hover:bg-[#01686d] text-white py-3.5 rounded font-semibold transition-colors shadow-sm flex justify-center items-center space-x-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedItem.queueType === 'QUOTATION' ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                  <span>
                    {actionLoading ? 'Processing...' : (selectedItem.queueType === 'RFQ' ? 'Approve & Publish RFQ' : 'Generate & Dispatch PO')}
                  </span>
                </button>
                
                <button 
                  onClick={() => handleAction('REJECT')}
                  disabled={actionLoading}
                  className={`px-8 border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded font-semibold transition-colors shadow-sm flex justify-center items-center space-x-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  <span>{actionLoading ? 'Processing...' : 'Reject'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Approvals;