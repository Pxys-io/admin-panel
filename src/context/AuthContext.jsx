import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      auth.getProfile()
        .then(response => {
          setUser(response.data.admin);
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await auth.login({ email, password });
    const { accessToken, ...userData } = response.data;

    localStorage.setItem('adminToken', accessToken);

    // Get full admin profile
    const profileResponse = await auth.getProfile();
    const adminData = profileResponse.data.admin;

    setUser(adminData);
    localStorage.setItem('adminUser', JSON.stringify(adminData));

    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
