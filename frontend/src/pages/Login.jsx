// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  // --- UPDATED: Form State now matches registerRequest DTO ---
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    companyName: '', 
    gstNumber: '', 
    vendorCategory: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // --- EXECUTE LOGIN (All Roles) ---
        await login(formData.email, formData.password);
        navigate('/dashboard'); 
      } else {
        // --- EXECUTE REGISTER (Forced as VENDOR) ---
        const registerPayload = {
            ...formData,
            role: 'VENDOR' 
        };
        
        await register(registerPayload);
        alert("Vendor registration successful! Please login.");
        setIsLogin(true); // Flip back to login view
      }
    } catch (err) {
      // console.log(err.response);
      
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4 py-12">
      <div className={`bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full transition-all duration-300 flex flex-col items-center ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        
        {/* Logo Area */}
        <div className="w-24 h-24 rounded-full border-2 border-[#714B67] flex items-center justify-center mb-6 bg-[#714B67]/5">
          <span className="text-[#714B67] font-bold text-xl">VB</span>
        </div>
        
        <h2 className="text-xl font-bold text-[#212529] mb-2 w-full text-center">
          {isLogin ? 'Login to VendorBridge' : 'Vendor Registration'}
        </h2>

        {error && <div className="w-full p-3 mb-4 bg-red-50 text-red-600 text-sm rounded text-center border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="w-full mt-4">
          
          {/* ----- LOGIN FIELDS ----- */}
          {isLogin && (
            <div className="space-y-4">
              <input 
                type="email" name="email" placeholder="Email Address" required
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] text-sm"
              />
              <input 
                type="password" name="password" placeholder="Password" required
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] text-sm"
              />
            </div>
          )}

          {/* ----- VENDOR REGISTRATION FIELDS ----- */}
          {!isLogin && (
            <div className="space-y-5">
              <div className="bg-blue-50 text-blue-800 p-3 rounded text-xs mb-4">
                Note: This portal is for external vendor registration only. Internal staff accounts are provisioned by the Administrator.
              </div>
              
              {/* UPDATED: Inputs matching backend DTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" name="companyName" placeholder="Company Name" 
                  onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67] md:col-span-2" 
                />
                <input 
                  type="email" name="email" placeholder="Company Email Address" 
                  onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" 
                />
                <input 
                  type="password" name="password" placeholder="Password" 
                  onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" 
                />
                <input 
                  type="text" name="gstNumber" placeholder="GST Number" 
                  onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" 
                  minLength={15}
                  maxLength={15}
                />
                <input 
                  type="text" name="vendorCategory" placeholder="Vendor Category (e.g., IT, Logistics)" 
                  onChange={handleChange} required 
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" 
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <button type="submit" className="w-full max-w-xs bg-[#714B67] hover:bg-[#5a3c52] text-white py-2.5 rounded transition-colors font-medium text-sm">
              {isLogin ? 'Login' : 'Submit Vendor Application'}
            </button>
          </div>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 pt-6 border-t border-gray-100 w-full text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Want to become a supplier? " : "Already registered? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} type="button" className="text-[#714B67] font-semibold hover:underline">
              {isLogin ? 'Apply here' : 'Login here'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;