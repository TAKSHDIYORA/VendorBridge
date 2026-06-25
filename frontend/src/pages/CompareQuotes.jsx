// src/pages/CompareQuotes.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const CompareQuotes = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api/';

  const [rfqs, setRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch available RFQs on load
  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        const userStr = localStorage.getItem('vendorBridgeUser');
        if (!userStr) return;
        const { token, role } = JSON.parse(userStr);
        
        // Officers see all, Vendors only see open ones
        const endpoint = role === 'ROLE_OFFICER' ? '/rfqs/all' : '/rfqs/open';
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRfqs(response.data);
      } catch (err) {
        console.error("Failed to fetch RFQs", err);
      }
    };
    fetchRfqs();
  }, [API_BASE_URL]);

  // 2. Handle RFQ Selection
  const handleRfqSelect = async (e) => {
    const rfqId = e.target.value;
    if (!rfqId) {
      setSelectedRfq(null);
      setQuotations([]);
      return;
    }

    const rfq = rfqs.find(r => r.id === parseInt(rfqId));
    setSelectedRfq(rfq);
    setError('');

    // Only fetch quotes if the RFQ is actually published, closed, or awarded
    if (rfq.status === 'PUBLISHED' || rfq.status === 'AWARDED' || rfq.status === 'CLOSED') {
      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem('vendorBridgeUser'))?.token;
        const response = await axios.get(`${API_BASE_URL}/quotations/rfq/${rfqId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setQuotations(response.data);
      } catch (err) {
        setError('Failed to load quotations for this RFQ.');
      } finally {
        setLoading(false);
      }
    } else {
      setQuotations([]);
    }
  };

  // 3. UI INTELLIGENCE: Sorting & Highlighting
  const sortedQuotations = useMemo(() => {
    return [...quotations].sort((a, b) => a.totalAmount - b.totalAmount);
  }, [quotations]);

  const lowestBidAmount = sortedQuotations.length > 0 ? sortedQuotations[0].totalAmount : 0;

  // 4. Handle Approving Contract
  const handleApprove = async (quotationId, vendorEmail, rfqId) => {
    if (window.confirm(`Forward contract to manager for ${vendorEmail}?`)) {
      try {
        const token = JSON.parse(localStorage.getItem('vendorBridgeUser'))?.token;
        
        await axios.put(`${API_BASE_URL}/quotations/approve/${rfqId}/${quotationId}`, {}, {
          headers : {'Authorization' : `Bearer ${token}`}
        });
        
        window.alert("Contract forwarded for final approval.");
        
        // Refresh the page data
        handleRfqSelect({ target: { value: rfqId } });
        
      } catch (err) {
        window.alert(err.response?.data || "An error occurred.");
      }
    }
  };

  // 5. Contextual Status Banners (ALL STATUSES HANDLED)
  const renderStatusBanner = () => {
    if (!selectedRfq) return null;

    switch (selectedRfq.status) {
      case 'DRAFT':
        return (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-gray-200 rounded-full text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Draft Status</h3>
              <p className="text-gray-600 mt-1">This RFQ is currently being drafted by an Officer and has not been submitted for manager approval yet.</p>
            </div>
          </div>
        );
      case 'PENDING_APPROVAL':
        return (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Awaiting Manager Approval</h3>
              <p className="text-yellow-700 mt-1">This RFQ has not been published to vendors yet. You will be able to compare bids once the Manager approves it.</p>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">RFQ Rejected</h3>
              <p className="text-red-700 mt-1">The Manager rejected this request. It was never sent to vendors.</p>
            </div>
          </div>
        );
      case 'PUBLISHED':
        return (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800">Published & Active</h3>
              <p className="text-blue-700 text-xs">This RFQ is live. Vendors are currently able to view it and submit their quotations below.</p>
            </div>
          </div>
        );
      case 'CLOSED':
        return (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg shadow-sm flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-800">Bidding Closed</h3>
              <p className="text-purple-700 text-xs">The deadline has passed. Vendors can no longer submit quotes. You may now evaluate and award the contract.</p>
            </div>
          </div>
        );
      case 'AWARDED':
        return (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Contract Awarded</h3>
              <p className="text-green-700 text-xs">A vendor has been selected for this RFQ. Below is the historical comparison data.</p>
            </div>
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="bg-gray-100 border border-gray-300 p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-gray-200 rounded-full text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">RFQ Cancelled</h3>
              <p className="text-gray-600 mt-1">This procurement request was cancelled and is no longer active.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#212529]">Compare Quotations</h2>
        <p className="text-gray-500 mt-1">Evaluate vendor bids side-by-side</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-800 rounded border border-red-200">{error}</div>}

      {/* RFQ Selector */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
        <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select an RFQ to Evaluate</label>
            <select 
              onChange={handleRfqSelect} 
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none"
            >
              <option value="">-- Choose RFQ --</option>
              {rfqs.map(rfq => (
                  <option key={rfq.id} value={rfq.id}>
                    {rfq.title} (Status: {rfq.status})
                  </option>
              ))}
            </select>
        </div>
      </div>

      {loading && <p className="text-[#017E84] font-medium animate-pulse">Analyzing vendor bids...</p>}

      {/* Dynamic Status Banners */}
      {!loading && renderStatusBanner()}

      {/* Comparison Table (Only visible if Published, Closed, or Awarded) */}
      {selectedRfq && !loading && (selectedRfq.status === 'PUBLISHED' || selectedRfq.status === 'AWARDED' || selectedRfq.status === 'CLOSED') && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          
          {sortedQuotations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No vendors have submitted quotes for this RFQ yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                
                {/* HEADERS */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-5 font-semibold text-gray-700 w-64 border-r align-bottom">Requested Item</th>
                    <th className="px-4 py-5 font-semibold text-gray-700 text-center border-r align-bottom">Qty</th>
                    
                    {sortedQuotations.map((quote) => {
                      const isLowest = quote.totalAmount === lowestBidAmount;
                      return (
                        <th key={quote.id} className={`px-6 py-4 font-semibold text-center border-r min-w-[220px] ${isLowest ? 'bg-green-50 border-t-4 border-t-green-500' : ''}`}>
                          {isLowest && <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider flex items-center justify-center gap-1">🏆 Best Price</div>}
                          <div className="text-[#714B67] text-base">{quote.vendor.email.split('@')[0]}</div>
                          <div className="text-xs text-yellow-500 mt-1">★★★★☆ (4.2)</div> 
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* BODY (Line Items) */}
                <tbody>
                  {selectedRfq.lineItems?.map(lineItem => (
                    <tr key={lineItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 border-r font-medium text-gray-800">{lineItem.item}</td>
                      <td className="px-4 py-3 border-r text-center text-gray-600">{lineItem.quantity} {lineItem.unit}</td>
                      
                      {sortedQuotations.map(quote => {
                        const bidItem = quote.items.find(qi => qi.rfqLineItem?.id === lineItem.id);
                        const isLowest = quote.totalAmount === lowestBidAmount;
                        return (
                          <td key={`${quote.id}-${lineItem.id}`} className={`px-6 py-3 border-r text-center ${isLowest ? 'bg-green-50/30 font-medium text-green-800' : 'text-gray-600'}`}>
                            {bidItem ? `₹${bidItem.unitPrice.toFixed(2)}` : <span className="text-gray-300">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>

                {/* FOOTER */}
                <tfoot className="border-t-2 border-gray-200">
                  {/* Totals */}
                  <tr>
                    <td colSpan="2" className="px-6 py-4 border-r text-right font-bold text-gray-800 uppercase tracking-wider bg-gray-50">
                      Total Bid Amount
                    </td>
                    {sortedQuotations.map(quote => {
                      const isLowest = quote.totalAmount === lowestBidAmount;
                      return (
                        <td key={quote.id} className={`px-6 py-4 border-r text-center font-bold text-lg ${isLowest ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-[#017E84]'}`}>
                          ₹{quote.totalAmount.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Remarks */}
                  <tr className="border-t border-gray-200 bg-white">
                    <td colSpan="2" className="px-6 py-4 border-r text-right font-medium text-gray-600">
                      Delivery & Terms
                    </td>
                    {sortedQuotations.map(quote => {
                      const isLowest = quote.totalAmount === lowestBidAmount;
                      return (
                        <td key={quote.id} className={`px-6 py-4 border-r text-center text-xs whitespace-normal ${isLowest ? 'bg-green-50/30' : ''}`}>
                          <p className="text-gray-600">{quote.remarks || "Standard terms apply."}</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Actions */}
                  <tr className="border-t border-gray-200">
                    <td colSpan="2" className="px-6 py-4 border-r text-right bg-gray-50"></td>
                    {sortedQuotations.map(quote => {
                      const isLowest = quote.totalAmount === lowestBidAmount;
                      return (
                        <td key={quote.id} className={`px-6 py-4 border-r text-center ${isLowest ? 'bg-green-50/50' : 'bg-gray-50'}`}>
                          {quote.status === 'PENDING_APPROVAL' ? (
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Awaiting Manager</span>
                          ) : quote.status === 'REJECTED' ? (
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">Rejected</span>
                          ) : (
                            <button 
                              onClick={() => handleApprove(quote.id, quote.vendor.email, selectedRfq.id)}
                              disabled={selectedRfq.status === 'AWARDED'}
                              className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full ${isLowest ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'bg-[#714B67] hover:bg-[#5a3c52] text-white disabled:opacity-50'}`}
                            >
                              {selectedRfq.status === 'AWARDED' ? 'Closed' : 'Select Vendor'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>

              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareQuotes;