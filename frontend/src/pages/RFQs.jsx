// src/pages/RFQs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RFQs = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';

  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [myRfqs, setMyRfqs] = useState([]);
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [currentRfqStatus, setCurrentRfqStatus] = useState('');

  const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });
  const [lineItems, setLineItems] = useState([{ item: '', quantity: '', unit: 'NOS' }]);
  
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userStr = localStorage.getItem('vendorBridgeUser');
        if (!userStr) return;
        const { token, role } = JSON.parse(userStr);
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Vendors
        const vendorRes = await axios.get(`${API_BASE_URL}/auth/users/vendors`, { headers });
        if (Array.isArray(vendorRes.data)) {
          setAvailableVendors(vendorRes.data);
        } else if (vendorRes.data && Array.isArray(vendorRes.data.content)) {
          setAvailableVendors(vendorRes.data.content);
        }

        // 2. Fetch Existing RFQs (for the dropdown in Edit mode)
        // Assuming officers have an endpoint to see RFQs they can edit. 
        // Using /rfqs/all as placeholder, adjust to /rfqs/my if you have a specific officer endpoint.
        const rfqEndpoint = role === 'ROLE_OFFICER' ? '/rfqs/all' : '/rfqs/published';
        const rfqRes = await axios.get(`${API_BASE_URL}${rfqEndpoint}`, { headers });
        
        // Filter out closed/awarded/cancelled ones, we only want actionable ones
        const editableRfqs = (rfqRes.data || []).filter(
          r => r.status === 'DRAFT' || r.status === 'PUBLISHED' || r.status === 'REJECTED'
        );
        setMyRfqs(editableRfqs);

      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchInitialData();
  }, [API_BASE_URL]);

  // --- HANDLERS ---
  const resetForm = () => {
    setFormData({ title: '', description: '', deadline: '' });
    setLineItems([{ item: '', quantity: '', unit: 'NOS' }]);
    setSelectedVendorIds([]);
    setSelectedRfqId('');
    setCurrentRfqStatus('');
    setMessage({ type: '', text: '' });
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleRfqSelect = (e) => {
    const id = e.target.value;
    setSelectedRfqId(id);
    setMessage({ type: '', text: '' });

    if (!id) {
      resetForm();
      return;
    }

    const rfq = myRfqs.find(r => r.id === parseInt(id));
    if (rfq) {
      // Populate form
      setFormData({
        title: rfq.title || '',
        description: rfq.description || '',
        // Extract YYYY-MM-DD from the datetime string
        deadline: rfq.deadline ? rfq.deadline.split('T')[0] : ''
      });
      
      if (rfq.lineItems && rfq.lineItems.length > 0) {
        setLineItems(rfq.lineItems);
      } else {
        setLineItems([{ item: '', quantity: '', unit: 'NOS' }]);
      }

      if (rfq.assignedVendors) {
        setSelectedVendorIds(rfq.assignedVendors.map(v => v.id));
      } else {
        setSelectedVendorIds([]);
      }

      setCurrentRfqStatus(rfq.status);
    }
  };

  const handleBasicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index][field] = value;
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item: '', quantity: '', unit: 'NOS' }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  const toggleVendor = (vendorId) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  // --- SUBMIT LOGIC ---AC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userStr = localStorage.getItem('vendorBridgeUser');
      if (!userStr) throw new Error("Authentication missing. Please log in.");
      const { token } = JSON.parse(userStr);

      const payload = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline ? `${formData.deadline}T23:59:59` : null,
        lineItems: lineItems.map(li => ({
          item: li.item,
          quantity: parseInt(li.quantity, 10),
          unit: li.unit
        })),
        vendorIds: selectedVendorIds
      };

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (mode === 'create') {
        // Create Request
        await axios.post(`${API_BASE_URL}/rfqs/create`, payload, { headers });
        setMessage({ type: 'success', text: 'RFQ successfully created and submitted!' });
        resetForm();
      } else {
        // Edit Request
        if (!selectedRfqId) throw new Error("Please select an RFQ to update.");
        await axios.put(`${API_BASE_URL}/rfqs/update/${selectedRfqId}`, payload, { headers });
        setMessage({ type: 'success', text: 'RFQ successfully updated!' });
        
        // Optionally refresh the RFQ list here so the dropdown has the latest data
      }

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.response?.data || error.message });
    } finally {
      setLoading(false);
    }
  };

  // --- UI INTELLIGENCE: Core Locking ---
  // If editing and the status is PUBLISHED (or anything other than DRAFT/REJECTED), lock core fields.
  const isCoreLocked = mode === 'edit' && currentRfqStatus === 'PUBLISHED';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* HEADER & MODE TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#212529]">
            {mode === 'create' ? 'Create New RFQ' : 'Edit RFQ'}
          </h2>
          <p className="text-gray-500 mt-1">
            {mode === 'create' ? 'Configure a new request for quotation.' : 'Update an existing procurement request.'}
          </p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shadow-sm w-fit">
          <button 
            type="button"
            onClick={() => handleModeSwitch('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white text-[#017E84] shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Create New
          </button>
          <button 
            type="button"
            onClick={() => handleModeSwitch('edit')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'edit' ? 'bg-white text-[#017E84] shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Edit Existing
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {message.text && (
        <div className={`p-4 rounded-md shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* EDIT MODE: RFQ SELECTOR */}
        {mode === 'edit' && (
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select RFQ to Edit</label>
            <select 
              value={selectedRfqId}
              onChange={handleRfqSelect}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none"
            >
              <option value="">-- Select an RFQ --</option>
              {myRfqs.map(r => (
                <option key={r.id} value={r.id}>
                  RFQ-{String(r.id).padStart(3, '0')} : {r.title} (Status: {r.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MAIN FORM AREA */}
        {/* Only show the form if creating, or if an RFQ is actually selected for editing */}
        {(mode === 'create' || (mode === 'edit' && selectedRfqId)) && (
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-lg shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 relative">
            
            {/* Lock Overlay Banner if Published */}
            {isCoreLocked && (
              <div className="absolute top-0 left-0 right-0 bg-blue-50 border-b border-blue-200 px-6 py-3 rounded-t-lg flex items-start md:items-center space-x-3 z-10">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 md:mt-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <div>
                  <h4 className="text-sm font-bold text-blue-800">Core Details Locked</h4>
                  <p className="text-xs text-blue-700">This RFQ is currently PUBLISHED. To protect bidding integrity, you may only add or remove target vendors.</p>
                </div>
              </div>
            )}

            {/* LEFT COLUMN: Basic Details */}
            <div className={`space-y-5 ${isCoreLocked ? 'mt-12 opacity-60 pointer-events-none grayscale-[30%]' : ''}`}>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">1. Basic Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFQ Title*</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleBasicChange} required
                  disabled={isCoreLocked}
                  placeholder="e.g., Q3 Laptops Procurement" 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none disabled:bg-gray-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline*</label>
                <input 
                  type="date" name="deadline" value={formData.deadline} onChange={handleBasicChange} required
                  disabled={isCoreLocked}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none disabled:bg-gray-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="4" name="description" value={formData.description} onChange={handleBasicChange}
                  disabled={isCoreLocked}
                  placeholder="Detailed requirements or instructions..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none disabled:bg-gray-100"
                ></textarea>
              </div>
            </div>

            {/* RIGHT COLUMN: Line Items & Vendors */}
            <div className={`space-y-8 ${isCoreLocked ? 'mt-12' : ''}`}>
              
              {/* Line Items Section (Locked if Published) */}
              <div className={`${isCoreLocked ? 'opacity-60 pointer-events-none grayscale-[30%]' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">2. Line Items</h3>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-medium">Item Description</th>
                        <th className="px-3 py-2 font-medium w-24">Qty</th>
                        <th className="px-3 py-2 font-medium w-24">Unit</th>
                        {!isCoreLocked && <th className="px-3 py-2 font-medium w-10"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li, index) => (
                        <tr key={index} className="border-b border-gray-100 bg-white">
                          <td className="p-2">
                            <input type="text" required value={li.item} onChange={(e) => handleLineItemChange(index, 'item', e.target.value)} disabled={isCoreLocked} placeholder="Item name..." className="w-full px-2 py-1 border border-gray-300 rounded outline-none focus:border-[#714B67] disabled:bg-transparent disabled:border-transparent" />
                          </td>
                          <td className="p-2">
                            <input type="number" required min="1" value={li.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} disabled={isCoreLocked} className="w-full px-2 py-1 border border-gray-300 rounded outline-none focus:border-[#714B67] disabled:bg-transparent disabled:border-transparent" />
                          </td>
                          <td className="p-2">
                            <select value={li.unit} onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)} disabled={isCoreLocked} className="w-full px-2 py-1 border border-gray-300 rounded outline-none focus:border-[#714B67] bg-white disabled:bg-transparent disabled:border-transparent disabled:appearance-none">
                              <option value="NOS">NOS</option>
                              <option value="KG">KG</option>
                              <option value="LTR">LTR</option>
                              <option value="BOX">BOX</option>
                            </select>
                          </td>
                          {!isCoreLocked && (
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeLineItem(index)} className="text-red-400 hover:text-red-600 font-bold" title="Remove item">×</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!isCoreLocked && (
                  <button type="button" onClick={addLineItem} className="mt-3 text-sm text-[#017E84] font-medium hover:underline">+ Add another item</button>
                )}
              </div>

              {/* Vendor Selection Section (ALWAYS EDITABLE) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  {isCoreLocked ? '2. Update Target Vendors' : '3. Select Target Vendors'}
                </h3>
                {availableVendors.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No vendors found in the system.</p>
                ) : (
                  <div className={`border rounded p-3 max-h-48 overflow-y-auto space-y-2 ${isCoreLocked ? 'border-[#017E84] bg-[#017E84]/5 ring-2 ring-[#017E84]/20' : 'border-gray-200 bg-gray-50'}`}>
                    {availableVendors.map(vendor => (
                      <label key={vendor.id} className="flex items-center p-2 bg-white border border-gray-100 rounded cursor-pointer hover:border-[#714B67] transition-colors shadow-sm">
                        <input 
                          type="checkbox" 
                          checked={selectedVendorIds.includes(vendor.id)}
                          onChange={() => toggleVendor(vendor.id)}
                          className="w-4 h-4 text-[#714B67] rounded focus:ring-[#714B67]"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">{vendor.email} ({vendor.companyName})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Submit Actions */}
        {(mode === 'create' || (mode === 'edit' && selectedRfqId)) && (
          <div className="flex space-x-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-[#017E84] text-white px-8 py-3 rounded font-medium hover:bg-[#01686d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Processing...' : (mode === 'create' ? 'Submit New RFQ' : 'Save Changes')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RFQs;