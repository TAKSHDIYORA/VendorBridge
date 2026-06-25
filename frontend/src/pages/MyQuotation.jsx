// src/pages/MyQuotations.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyQuotations = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api/';

  const [myQuotes, setMyQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyQuotes = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('vendorBridgeUser'))?.token;
        const response = await axios.get(`${API_BASE_URL}/quotations/my-quotes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Sort by newest first
        const sortedQuotes = response.data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setMyQuotes(sortedQuotes);
      } catch (err) {
        console.error("Failed to fetch quotations", err);
        setError('Failed to load your quotation history.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyQuotes();
  }, []);

  // Helper to render beautiful status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">Under Review</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">Shortlisted (Pending Manager)</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">Awarded (PO Generating)</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">Not Selected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-full border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-[#212529]">My Quotations</h2>
        <p className="text-gray-500 mt-1">Track the status of your submitted bids and contracts</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-800 rounded border border-red-200">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#017E84] animate-pulse font-medium">Loading your history...</div>
        ) : myQuotes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-800">No Quotations Found</p>
            <p className="text-sm mt-1">You haven't submitted any bids yet. Check the RFQ board to find open requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">RFQ Title</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Date Submitted</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Total Bid Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Current Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#714B67]">{quote.rfq.title}</div>
                      <div className="text-xs text-gray-500 mt-1">Ref ID: #{quote.rfq.id}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {new Date(quote.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      ₹{quote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {quote.status === 'ACCEPTED' ? (
                        <button className="text-[#017E84] hover:text-[#01686d] font-medium text-sm border border-[#017E84] px-3 py-1.5 rounded hover:bg-[#017E84] hover:text-white transition-colors">
                          View PO
                        </button>
                      ) : (
                        <button className="text-gray-500 hover:text-[#714B67] font-medium text-sm underline underline-offset-2">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuotations;