import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedLayout } from './components/ProtectedLayout.jsx';
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ParkingMap } from './pages/ParkingMap.jsx';
import { Entry } from './pages/Entry.jsx';
import { Exit } from './pages/Exit.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Reports } from './pages/Reports.jsx';
import { SettingsPage } from './pages/Settings.jsx';
import { Backup } from './pages/Backup.jsx';
import { Logs } from './pages/Logs.jsx';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 font-sans">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-xs font-bold uppercase tracking-wider">Validating User Credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to role-specific index
    return <Navigate to={user.role === 'staff' ? '/map' : '/dashboard'} replace />;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
};

// Root Router Redirector
const HomeRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'staff' ? '/map' : '/dashboard'} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes wrapped in layouts & guards */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <ParkingMap />
            </ProtectedRoute>
          } />

          <Route path="/entry" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Entry />
            </ProtectedRoute>
          } />

          <Route path="/exit" element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <Exit />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/backups" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Backup />
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Logs />
            </ProtectedRoute>
          } />

          {/* Wildcard Fallbacks */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
export default App;
