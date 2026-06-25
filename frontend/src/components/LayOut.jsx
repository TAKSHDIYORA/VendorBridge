// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-adjust sidebar based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // --- ROLE-BASED MENU CONFIGURATION ---
  // Perfectly synced with App.jsx ProtectedRoutes
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_VENDOR", "ROLE_ADMIN", "ROLE_APPROVER"] 
    },
    { 
      name: "Vendors", 
      path: "/vendors", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_ADMIN"] 
    },
    { 
      name: "RFQ's", 
      path: "/rfqs", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_ADMIN"] 
    },
    { 
      name: "Quotations", 
      path: "/quotations", 
      allowedRoles: ["ROLE_VENDOR"] 
    },
    { 
      name: "Compare Quotes", 
      path: "/compare", 
      allowedRoles: ["ROLE_OFFICER"] 
    },
    { 
      name: "Approvals", 
      path: "/approvals", 
      allowedRoles: ["ROLE_APPROVER", "ROLE_ADMIN"] 
    },
    { 
      name: "Purchase Orders", 
      path: "/purchase-orders", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_VENDOR", "ROLE_ADMIN", "ROLE_APPROVER"] 
    },
    { 
      name: "Reports", 
      path: "/reports", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_ADMIN"] 
    },
    { 
      name: "Activity", 
      path: "/activity", 
      allowedRoles: ["ROLE_OFFICER", "ROLE_ADMIN"] 
    },
    {
      name: "MyQuotation",
      path : "/myquotation",
      allowedRoles: ["ROLE_VENDOR"]
    }

  ];

  // --- FILTER MENU ITEMS ---
  const userRole = user?.role || "";
  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="flex h-screen bg-[#F9F9F9] font-sans text-[#212529] overflow-hidden">
      {/* Mobile Overlay Background */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:-ml-64"}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-[#714B67]">VendorBridge</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`block px-6 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#714B67] bg-[#714B67]/10 border-r-4 border-[#714B67]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#714B67]"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {!isSidebarOpen && (
              <h1 className="text-xl font-bold text-[#714B67] hidden md:block">
                VendorBridge
              </h1>
            )}
          </div>

          {/* Right Side: Profile Info */}
         <div className="flex items-center space-x-4">
  <div className="text-right hidden sm:block">
    <p className="text-sm font-semibold text-gray-800 capitalize">
      {user?.email ? user.email.split('@')[0] : "User"}
    </p>
    <p className="text-xs text-gray-500 font-medium tracking-wide">
      {userRole ? userRole.replace('ROLE_', '').replace('_', ' ') : ""}
    </p>
  </div>
  
  {/* UPDATED: Avatar is now a clickable Link to /profile */}
  <Link 
    to="/profile" 
    title="View Profile"
    className="w-9 h-9 rounded-full bg-[#017E84] flex items-center justify-center text-white font-bold shadow-sm uppercase cursor-pointer hover:ring-2 hover:ring-[#017E84] hover:ring-offset-2 transition-all"
  >
    {user?.email ? user.email.charAt(0) : "U"}
  </Link>

  <button
    onClick={logout}
    className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-100 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors"
  >
    Logout
  </button>
</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;