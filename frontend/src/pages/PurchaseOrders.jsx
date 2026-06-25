// src/pages/PurchaseOrders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('vendorBridgeUser'));

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const endpoint = user.role === 'ROLE_VENDOR' ? '/quotations/po/my-orders' : '/quotations/po/all';
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPos(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePoAction = async (id, action) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/quotations/po/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchPOs(); // Refresh list
    } catch (err) { alert("Failed to update PO status"); }
  };

  const getStatusStyle = (status) => {
    const styles = {
      ISSUED: "bg-blue-100 text-blue-700",
      ACCEPTED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      DELIVERED: "bg-purple-100 text-purple-700"
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#212529]">Purchase Orders</h2>
          <p className="text-gray-500">Track procurement contracts and delivery status.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 uppercase text-gray-500 text-xs">
            <tr>
              <th className="py-4 px-6">PO Number</th>
              <th className="py-4 px-6">Vendor/Client</th>
              <th className="py-4 px-6">Total Amount</th>
              <th className="py-4 px-6">Delivery Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pos.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-semibold text-[#017E84]">{po.poNumber}</td>
                <td className="py-4 px-6">{user.role === 'ROLE_VENDOR' ? 'You' : po.vendor?.companyName}</td>
                <td className="py-4 px-6">₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                <td className="py-4 px-6">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(po.status)}`}>
                    {po.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  {/* Vendor Actions */}
                  {user.role === 'ROLE_VENDOR' && po.status === 'ISSUED' && (
                    <>
                      <button onClick={() => handlePoAction(po.id, 'accept')} className="text-green-600 font-bold hover:underline">Accept</button>
                      <button onClick={() => handlePoAction(po.id, 'reject')} className="text-red-600 font-bold hover:underline">Reject</button>
                    </>
                  )}
                  {/* Officer Actions */}
                  {user.role !== 'ROLE_VENDOR' && po.status === 'ACCEPTED' && (
                    <button onClick={() => handlePoAction(po.id, 'mark-delivered')} className="text-purple-600 font-bold hover:underline">Mark Delivered</button>
                  )}
                  <button className="text-gray-500 hover:text-gray-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;