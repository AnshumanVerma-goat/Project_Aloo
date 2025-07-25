import { createBrowserRouter } from 'react-router-dom';
import SellerDashboard from '../pages/sellerdashboard';
import Login from '../pages/login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/seller-dashboard',
    element: <SellerDashboard />,
  },
]);
