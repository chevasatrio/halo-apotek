import { Routes, Route, Navigate } from "react-router-dom";

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
      </Route>

      // CART dibuat public
      <Route path="/cart" element={<CartPage />} />

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

          <Route path="transaksi" element={<ListTransaksi />} />
        <Route path="transaksi/:id" element={<TransaksiForm />} />
        <Route path="transaksi/:id/edit" element={<TransaksiForm />} />

        <Route path="driver" element={<DriverList />} />

        </Route>
      </Route>

      {/* <Route path="/buyer/checkout" element={<CheckoutPage />} /> */}
      <Route path="/buyer/checkout" element={<CheckoutPage />} />

      {/* UNAUTHORIZED */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* REDIRECT ROOT */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
