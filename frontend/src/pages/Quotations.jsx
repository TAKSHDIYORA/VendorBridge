import React, { useState, useEffect } from "react";
import axios from "axios";
const Quotations = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
  const [availableRfqs, setAvailableRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [bids, setBids] = useState({}); 
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  useEffect(() => {
    const fetchRfqs = async () => {
      try {
        const userStr = localStorage.getItem("vendorBridgeUser");
        if (!userStr) return;
        const { token } = JSON.parse(userStr);
        const role = JSON.parse(localStorage.getItem("vendorBridgeUser"))?.role;
        let response;
        let Rfqs;
        if (role == "ROLE_VENDOR") {
          const response = await axios.get(`${API_BASE_URL}/rfqs/published`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(response);
          
          Rfqs = response.data;
        } else {
          const response = await axios.get(`${API_BASE_URL}/rfqs/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Rfqs = response.data;
                    console.log(response);

        }
        setAvailableRfqs(Rfqs);
      } catch (error) {
        console.error("Failed to fetch RFQs", error);
      }
    };
    fetchRfqs();
  }, []);
  const handleRfqSelect = (e) => {
    const rfqId = parseInt(e.target.value);
    const rfq = availableRfqs.find((r) => r.id === rfqId);
    setSelectedRfq(rfq || null);
    setBids({});
    setRemarks("");
    setMessage({ type: "", text: "" });
  };
  const handlePriceChange = (lineItemId, value) => {
    setBids((prev) => ({
      ...prev,
      [lineItemId]: parseFloat(value) || 0,
    }));
  };
  const calculateLineTotal = (lineItemId, quantity) => {
    const price = bids[lineItemId] || 0;
    return price * quantity;
  };
  const calculateGrandTotal = () => {
    if (!selectedRfq || !selectedRfq.lineItems) return 0;
    return selectedRfq.lineItems.reduce((total, item) => {
      return total + calculateLineTotal(item.id, item.quantity);
    }, 0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const userStr = localStorage.getItem("vendorBridgeUser");
      if (!userStr) throw new Error("Authentication missing.");
      const { token } = JSON.parse(userStr);
      const itemsPayload = selectedRfq.lineItems.map((item) => ({
        rfqLineItemId: item.id,
        unitPrice: bids[item.id] || 0,
      }));

      const payload = {
        rfqId: selectedRfq.id,
        remarks: remarks,
        items: itemsPayload,
      };
      let response = await axios.post(
        `${API_BASE_URL}/quotations/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log(response);
      setMessage({
        type: "success",
        text: "Quotation submitted successfully!",
      });
      setSelectedRfq(null); // Clear view on success
      setBids({});
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data || error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-semibold text-[#212529]">
          Submit Quotation
        </h2>
        <p className="text-gray-500 mt-1">
          Review open RFQs and submit your pricing
        </p>
      </div>
      {message.text && (
        <div
          className={`p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {message.text}
        </div>
      )}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select an Open RFQ to Bid On
        </label>
        <select
          onChange={handleRfqSelect}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none bg-white">
          <option value="">-- Select RFQ --</option>
          {availableRfqs.map((rfq) => (
            <option key={rfq.id} value={rfq.id}>
              {rfq.title} (Deadline:{" "}
              {new Date(rfq.deadline).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>
      {selectedRfq && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 border border-gray-200 rounded-lg shadow-sm space-y-8"
        >
          {/* RFQ Details Summary */}
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">
              {selectedRfq.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedRfq.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Provide Pricing
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium w-24 text-center">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-medium w-32">
                      Unit Price (₹)
                    </th>
                    <th className="px-4 py-3 font-medium w-32 text-right">
                      Line Total (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRfq.lineItems?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 bg-white"
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {item.item}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={bids[item.id] || ""}
                          onChange={(e) =>
                            handlePriceChange(item.id, e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded outline-none focus:border-[#714B67] text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#017E84]">
                        ₹{calculateLineTotal(item.id, item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-right font-bold text-gray-800"
                    >
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-xl text-[#714B67]">
                      ₹{calculateGrandTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks / Vendor Terms
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Delivery within 14 days of PO. Prices inclusive of all taxes."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#714B67] outline-none"
            ></textarea>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || calculateGrandTotal() === 0}
              className="bg-[#017E84] text-white px-8 py-2.5 rounded font-medium hover:bg-[#01686d] transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Official Quotation"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default Quotations;