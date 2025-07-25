import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useState } from 'react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'vendor' | 'seller'>('vendor');

  const handleLogin = () => {
    const mockUser = {
      name: 'Demo User',
      role,
      token: 'demo-token'
    };
    login(mockUser);
    navigate(role === 'vendor' ? '/dashboard/vendor' : '/dashboard/seller');
  };

  return (
    <div className="p-8 max-w-sm mx-auto bg-white rounded shadow">
      <h1 className="text-xl mb-4">Login</h1>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'vendor' | 'seller')}
        className="w-full p-2 border mb-4"
      >
        <option value="vendor">Vendor</option>
        <option value="seller">Seller</option>
      </select>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 w-full"
      >
        Login as {role}
      </button>
    </div>
  );
};

export default Login;
