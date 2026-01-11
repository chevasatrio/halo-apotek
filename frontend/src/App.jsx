import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";

import ObatList from "./pages/ObatList.jsx";
import ObatForm from "./pages/ObatForm.jsx";

import ListPegawai from "./pages/ListPegawai.jsx";
import PegawaiForm from "./pages/PegawaiForm.jsx";

import LandingBuyer from "./pages/LandingBuyer";
import BuyerObatPage from "./pages/BuyerObatPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import DeliveryPage from "./pages/DeliveryPage.jsx";


import ListTransaksi from "./pages/ListTransaksi.jsx";
import TransaksiForm from "./pages/TransaksiForm.jsx";
import DriverList from "./pages/ListDriver.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white border rounded-2xl shadow p-6 text-center">
        <h1 className="text-xl font-semibold text-slate-800">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-slate-600">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { token, user, booting } = useAuth();

  if (booting) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Memuat...</div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  const role = String(user?.role || "").toLowerCase().trim();

  if (role === "pembeli") return <Navigate to="/pembeli" replace />;
  if (role === "admin" || role === "kasir" || role === "driver")
    return <Navigate to="/dashboard" replace />;

  return <Navigate to="/unauthorized" replace />;
}

function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* BUYER (WAJIB LOGIN, ROLE = pembeli) */}
      <Route element={<ProtectedRoute role="pembeli" />}>
        <Route path="/pembeli" element={<LandingBuyer />} />
        <Route path="/pembeli/obat" element={<BuyerObatPage />} />
        <Route path="/pembeli/cart" element={<CartPage />} />
        <Route path="/pembeli/checkout" element={<CheckoutPage />} />
        <Route path="/pembeli/payment" element={<PaymentPage />} />
        <Route path="/pembeli/delivery" element={<DeliveryPage />} />
      </Route>

      {/* DASHBOARD (WAJIB LOGIN, ROLE = admin) */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />

          {/* OBAT */}
          <Route path="obat" element={<ObatList />} />
          <Route path="obat/tambah" element={<ObatForm />} />
          <Route path="obat/:id/edit" element={<ObatForm />} />

          {/* PEGAWAI */}
          <Route path="pegawai" element={<ListPegawai />} />
          <Route path="pegawai/tambah" element={<PegawaiForm />} />
          <Route path="pegawai/:id/edit" element={<PegawaiForm />} />

          {/* TRANSAKSI */}
          <Route path="transaksi" element={<ListTransaksi />} />
          <Route path="transaksi/:id" element={<TransaksiForm />} />
          <Route path="transaksi/:id/edit" element={<TransaksiForm />} />

          {/* DRIVER */}
          <Route path="driver" element={<DriverList />} />
        </Route>
      </Route>

      {/* UNAUTHORIZED */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ROOT & 404 -> redirect sesuai role */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
