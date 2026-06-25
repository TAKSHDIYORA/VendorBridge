// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';
  
  // --- STATE MANAGEMENT ---
  const [vendorData, setVendorData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const token = JSON.parse(localStorage.getItem('vendorBridgeUser'))?.token;

  // --- FETCH PROFILE DATA ---
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }); 
        setVendorData(response.data);
        setIsLoadingProfile(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setIsLoadingProfile(false);
      }
    };

    if (user?.role === 'ROLE_VENDOR') {
      fetchVendorProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [user, API_BASE_URL, token]);

  // --- EDIT PROFILE HANDLERS ---
  const handleEditToggle = () => {
    setProfileMessage({ type: '', text: '' });
    if (!isEditing) {
      // Populate form with current data when opening edit mode
      setEditFormData({
        
        companyName: vendorData?.companyName || '',
        gstNumber: vendorData?.gstNumber || '',
        vendorCategory: vendorData?.vendorCategory || '',
        address: vendorData?.address || '',
        city: vendorData?.city || '',
        state: vendorData?.state || '',
        country: vendorData?.country || '',
        postalCode: vendorData?.postalCode || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setIsSavingProfile(true);

    try {
      // Assuming your backend uses PUT or PATCH to update the profile
      let requestData = {...editFormData,"email": `${user.email}`};
      
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the main display data with the newly saved data
      setVendorData({ ...vendorData, ...editFormData });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false); // Close edit mode
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- PASSWORD HANDLERS ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }
    if (passwords.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
    }

    try {
      setIsChangingPassword(true);
      const reqData = {currentPassword : `${passwords.currentPassword}`, newPassword : `${passwords.newPassword}`};
       const respons = await axios.put(`${API_BASE_URL}/auth/password`, reqData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // --- REUSABLE COMPONENTS ---
  const InfoField = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded border border-gray-100">
        {value || <span className="text-gray-400 italic">Not Provided</span>}
      </span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-[#714B67]">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: User Identity Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1 h-fit flex flex-col items-center text-center space-y-5">
          <div className="w-28 h-28 rounded-full bg-[#017E84] flex items-center justify-center text-white text-5xl font-bold shadow-md uppercase">
            {user?.email ? user.email.charAt(0) : "U"}
          </div>
          
          <div className="w-full border-b pb-5">
            <h2 className="text-xl font-bold text-gray-800">
              {vendorData?.companyName || user?.email?.split('@')[0] || "User"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-[#714B67]/10 text-[#714B67] font-semibold text-xs rounded-full">
                {user?.role ? user.role.replace('ROLE_', '') : "Role Unknown"}
              </span>
              {vendorData?.status && (
                <span className={`px-3 py-1 font-semibold text-xs rounded-full ${
                  vendorData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {vendorData.status}
                </span>
              )}
            </div>
          </div>

          {vendorData?.rating !== undefined && (
            <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Vendor Rating</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold text-[#017E84]">{vendorData.rating}</span>
                <span className="text-gray-400">/ 5.0</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: Vendor Information */}
          {user?.role === 'ROLE_VENDOR' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">Business Details</h3>
                {!isEditing && (
                  <button onClick={handleEditToggle} className="text-sm text-[#714B67] hover:underline font-medium px-2 py-1">
                    Edit
                  </button>
                )}
              </div>

              {profileMessage.text && (
                <div className={`p-3 mb-4 text-sm rounded border ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {profileMessage.text}
                </div>
              )}

              {isLoadingProfile ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : isEditing ? (
                // --- EDIT MODE FORM ---
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                      <input type="text" name="companyName" value={editFormData.companyName} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GST Number</label>
                      <input type="text" name="gstNumber" value={editFormData.gstNumber} onChange={handleEditChange} maxLength={15} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vendor Category</label>
                      <input type="text" name="vendorCategory" value={editFormData.vendorCategory} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Location Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                        <input type="text" name="address" value={editFormData.address} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                        <input type="text" name="city" value={editFormData.city} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">State</label>
                        <input type="text" name="state" value={editFormData.state} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                        <input type="text" name="country" value={editFormData.country} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Postal Code</label>
                        <input type="text" name="postalCode" value={editFormData.postalCode} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2 border-t">
                    <button type="button" onClick={handleEditToggle} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSavingProfile} className="px-6 py-2 text-sm font-medium text-white bg-[#714B67] hover:bg-[#5a3c52] rounded transition-colors disabled:opacity-70">
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                // --- VIEW MODE ---
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoField label="Company Name" value={vendorData?.companyName} />
                    <InfoField label="GST Number" value={vendorData?.gstNumber} />
                    <InfoField label="Vendor Category" value={vendorData?.vendorCategory} />
                    <InfoField label="Member Since" value={vendorData?.createdAt ? new Date(vendorData.createdAt).toLocaleDateString() : null} />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Location Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <div className="sm:col-span-2">
                        <InfoField label="Street Address" value={vendorData?.address} />
                      </div>
                      <InfoField label="City" value={vendorData?.city} />
                      <InfoField label="State" value={vendorData?.state} />
                      <InfoField label="Country" value={vendorData?.country} />
                      <InfoField label="Postal Code" value={vendorData?.postalCode} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Change Password */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Security Settings</h3>
            
            {message.text && (
              <div className={`p-3 mb-4 text-sm rounded border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:border-[#714B67] focus:outline-none focus:ring-1 focus:ring-[#714B67]" />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isChangingPassword} className="bg-[#714B67] hover:bg-[#5a3c52] text-white px-6 py-2 rounded font-medium text-sm transition-colors disabled:opacity-70">
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;