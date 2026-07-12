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
import InventoryReceive from "./pages/admin/InventoryReceive";
import CustomerOrders from "./pages/admin/CustomerOrders";
import Reports from "./pages/admin/Reports";
import ApprovalQueue from "./pages/admin/ApprovalQueue";
import AdminProfile from "./pages/admin/AdminProfile";
import ShopSettings from "./pages/admin/ShopSettings";
import "./index.css";

// ປ່ຽນ Guard ໃຫ້ຮັບ allowedRoles ເປັນ Array
function Guard({ allowedRoles, children }) {
  const { user, ready } = useAuth();

  if (!ready) return <div className="loading-screen">⏳ ກຳລັງໂຫລດ...</div>;

  // ຖ້າຍັງບໍ່ທັນ Login ໃຫ້ໄປໜ້າ Login
  if (!user) return <Navigate to="/login" replace />;

  // ຖ້າ Login ແລ້ວ ແຕ່ບົດບາດ (Role) ບໍ່ມີຢູ່ໃນສິດທີ່ກຳນົດ ໃຫ້ເຕະໄປໜ້າທີ່ເໝາະສົມ
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "cashier") return <Navigate to="/cashier" replace />;
    if (user.role === "customer") return <Navigate to="/customer" replace />;
    return <Navigate to="/" replace />; // ກໍລະນີອື່ນໆ
  }

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          {/* ໜ້າສາທາລະນະ ໃຜກໍເຂົ້າໄດ້ */}
          <Route path="/" element={<PublicShop />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/staff" element={<StaffLogin />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/employee" element={<RegisterEmployee />} />

          {/* ໜ້າສະເພາະ Customer */}
          <Route
            path="/customer"
            element={
              <Guard allowedRoles={["customer"]}>
                <CustomerPage />
              </Guard>
            }
          />

          {/* ໜ້າສະເພາະ Cashier (ຫຼືໃຫ້ Admin ເຂົ້າໄດ້ນຳ ໂດຍໃສ່ ["cashier", "admin"]) */}
          <Route
            path="/cashier"
            element={
              <Guard allowedRoles={["cashier", "admin"]}>
                <CashierDashboard />
              </Guard>
            }
          />
          <Route
            path="/pos"
            element={
              <Guard allowedRoles={["cashier", "admin"]}>
                <CashierPOS />
              </Guard>
            }
          />

          {/* ໜ້າສະເພາະ Admin ເທົ່ານັ້ນ */}
          <Route
            path="/admin"
            element={
              <Guard allowedRoles={["admin"]}>
                <AdminLayout />
              </Guard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="purchases" element={<PurchaseOrders />} />
            <Route path="inventory" element={<InventoryReceive />} />
            <Route path="customer-orders" element={<CustomerOrders />} />
            <Route path="reports" element={<Reports />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<ShopSettings />} />
          </Route>

          {/* ຖ້າພິມ URL ມົ່ວ ໃຫ້ເຕະກັບໄປໜ້າແລກ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
