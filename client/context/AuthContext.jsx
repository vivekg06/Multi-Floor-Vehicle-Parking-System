import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('smartpark_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize token state and local storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('smartpark_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('smartpark_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          userId: data._id || data.userId,
          username: data.username,
          role: data.role
        });
      } else {
        // Token might have expired or be invalid
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (authToken, userProfile) => {
    setToken(authToken);
    setUser(userProfile);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      isSupervisor,
      isStaff
    }}>
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
