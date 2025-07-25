import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/Authprovider';
import { useAuth } from './auth/useAuth';
import Login from './pages/login';
import VendorDashboard from './pages/dashboard/vendordashboard';
import SellerDashboard from './pages/dashboard/sellerdashboard';

const ProtectedRoute = ({ role, children }: { role: string; children: React.ReactElement }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={`/dashboard/${user.role}`} />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/vendor"
          element={
            <ProtectedRoute role="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/seller"
          element={
            <ProtectedRoute role="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
