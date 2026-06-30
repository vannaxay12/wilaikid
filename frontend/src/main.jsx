import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import PublicShop from "./pages/PublicShop";
import LoginPage from "./pages/LoginPage";
import StaffLogin from "./pages/StaffLogin";
import RegisterEmployee from "./pages/RegisterEmployee";
import RegisterCustomer from "./pages/RegisterCustomer";
import CustomerPage from "./pages/CustomerPage";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import CashierPOS from "./pages/cashier/CashierPOS";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Employees from "./pages/admin/Employees";
import Suppliers from "./pages/admin/Suppliers";
import PurchaseOrders from "./pages/admin/PurchaseOrders";
import CustomerOrders from "./pages/admin/CustomerOrders";
import Reports from "./pages/admin/Reports";
import ApprovalQueue from "./pages/admin/ApprovalQueue";
import AdminProfile from "./pages/admin/AdminProfile";
import ShopSettings from "./pages/admin/ShopSettings";
import "./index.css";

function Guard({ adminOnly, customerOnly, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading-screen">⏳ ກຳລັງໂຫລດ...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/cashier" replace />;
  if (customerOnly && user.role !== "customer")
    return <Navigate to="/" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<PublicShop />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route
            path="/customer"
            element={
              <Guard customerOnly>
                <CustomerPage />
              </Guard>
            }
          />
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/register/employee" element={<RegisterEmployee />} />
          <Route
            path="/cashier"
            element={
              <Guard>
                <CashierDashboard />
              </Guard>
            }
          />
          <Route
            path="/pos"
            element={
              <Guard>
                <CashierPOS />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard adminOnly>
                <AdminLayout />
              </Guard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="purchases" element={<PurchaseOrders />} />
            <Route path="customer-orders" element={<CustomerOrders />} />
            <Route path="reports" element={<Reports />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<ShopSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
