import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Optionally decode or verify token here or fetch user data
      setUser({ id: "currentUserId", email: "user@example.com" });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const signUp = async (email, password, full_name) => {
    const response = await fetch('/auth/signup', {   // <-- Use relative path here
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    const result = await response.json();
    if (response.ok && result.token) {
      setToken(result.token);
      localStorage.setItem('token', result.token);
      setUser(result.user);
    }
    return result;
  };

  const signIn = async (email, password) => {
    const response = await fetch('/auth/login', {   // <-- Use relative path here
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (response.ok && result.token) {
      setToken(result.token);
      localStorage.setItem('token', result.token);
      setUser(result.user);
    }
    return result;
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
