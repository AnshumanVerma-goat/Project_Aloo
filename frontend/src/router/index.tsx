import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/login';
import SellerDashboard from '../pages/sellerdashboard';
import ProductsPage from '../pages/products';
import OrdersPage from '../pages/orders';

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/seller-dashboard',
    element: <ProtectedRoute element={<SellerDashboard />} />,
  },
  {
    path: '/products',
    element: <ProtectedRoute element={<ProductsPage />} />,
  },
  {
    path: '/orders',
    element: <ProtectedRoute element={<OrdersPage />} />,
  },
]);
