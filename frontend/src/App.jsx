import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ObatList from "./pages/ObatList.jsx";
import ObatForm from "./pages/ObatForm.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected pages (butuh login) */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/obat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ObatList />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/obat/tambah"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ObatForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/obat/:id/edit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ObatForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
