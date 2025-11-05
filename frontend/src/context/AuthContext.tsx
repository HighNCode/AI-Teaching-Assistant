import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { showSuccess, showError } from '@/lib/utils/toast.ts';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user: userData } = data;

        // Assuming the backend returns user info upon login
        const loggedInUser: User = {
          id: userData.id, // Adjust if the backend sends a different user structure
          email: userData.email,
          name: userData.full_name,
          createdAt: new Date().toISOString(), // Or get from backend if available
        };

        setUser(loggedInUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        localStorage.setItem('token', token);
        showSuccess('Logged in successfully!');
        return true;
      } else {
        const errorData = await response.json();
        showError(errorData.detail || 'Invalid email or password.');
        return false;
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user: userData } = data;

        const newUser: User = {
          id: userData.id,
          email: userData.email,
          name: userData.full_name,
          createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('token', token);
        showSuccess('Registration successful!');
        return true;
      } else {
        const errorData = await response.json();
        showError(errorData.detail || 'Registration failed.');
        return false;
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      showSuccess('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};