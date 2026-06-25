import React from "react";
import Layout from "./components/LayOut";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import RFQs from "./pages/RFQs";
import Vendors from "./pages/Vendors";
import Quotations from "./pages/Quotations";
import CompareQuotes from "./pages/CompareQuotes";
import Approvals from "./pages/Approvals";
import PurchaseOrders from "./pages/PurchaseOrders";
import Activity from "./pages/Activity";
import Reports from "./pages/Reports";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyQuotations from "./pages/MyQuotation";
import Profile from "./pages/Profile";
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        
        <Routes>
          <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ROLE_OFFICER", "ROLE_VENDOR", "ROLE_ADMIN", "ROLE_APPROVER"]}
                />
              }
            >
               <Route path="/profile" element={<Profile/>}/>

            </Route>
           
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ROLE_OFFICER", "ROLE_VENDOR", "ROLE_ADMIN", "ROLE_APPROVER"]}
                />
              }
            >
             
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={["ROLE_OFFICER", "ROLE_ADMIN"]} />}
            >
              <Route path="/rfqs" element={<RFQs />} />
              <Route path="/vendors" element={<Vendors />} />
              
              <Route path="/reports" element={<Reports />} />
              <Route path="/activity" element={<Activity />} />
            </Route>
<Route
              element={<ProtectedRoute allowedRoles={["ROLE_OFFICER"]} />}
            >
<Route path="/compare" element={<CompareQuotes />} />
</Route>

            <Route
              element={<ProtectedRoute allowedRoles={["ROLE_APPROVER", "ROLE_ADMIN"]} />}
            >
              <Route path="/approvals" element={<Approvals />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ROLE_VENDOR"]} />}>
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/myquotation" element={<MyQuotations />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
