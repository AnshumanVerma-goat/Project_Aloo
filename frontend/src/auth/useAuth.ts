import { createContext, useContext } from 'react';

// User type definition
export type User = {
  name: string;
  role: 'vendor' | 'seller';
  token: string;
};

// Define the shape of context value
type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

// Create a default context (for IntelliSense)
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

// Hook to use context
export const useAuth = () => useContext(AuthContext);
