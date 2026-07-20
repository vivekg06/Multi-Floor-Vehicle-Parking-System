import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, Map, PlusCircle, MinusCircle, FileSpreadsheet, 
  TrendingUp, Sliders, Database, History, LogOut, Bell, Sun, Moon, 
  Menu, X, ShieldAlert, Sparkles, RefreshCw, CheckCircle, AlertTriangle, AlertCircle
} from 'lucide-react';
import { api } from '../utils/api.js';

export const ProtectedLayout = ({ children }) => {
  const { user, logout, isAdmin, isSupervisor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('smartpark_theme') === 'dark' || 
    (!localStorage.getItem('smartpark_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Navigation panel toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification menu toggle
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Custom Toast State
  const [toasts, setToasts] = useState([]);
  const [resetting, setResetting] = useState(false);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('smartpark_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('smartpark_theme', 'light');
    }
  }, [darkMode]);

  // Fetch notifications periodically (every 30 seconds)
  const fetchNotifications = async () => {
    try {
      const alerts = await api.get('/api/parking/notifications');
      setNotifications(alerts);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetDatabase = async () => {
    setResetting(true);
    try {
      const response = await api.post('/api/demo/reset');
      triggerToast(response.message || 'Database successfully reset to standard demo parameters.');
      
      // Refresh page content after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      triggerToast(error.message || 'Reset failed.', 'error');
    } finally {
      setResetting(false);
    }
  };

  // Sidebar Links based on Role
  const links = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard size={20} />, 
      show: isAdmin || isSupervisor 
    },
    { 
      name: 'Live Parking Map', 
      path: '/map', 
      icon: <Map size={20} />, 
      show: true 
    },
    { 
      name: 'Vehicle Entry', 
      path: '/entry', 
      icon: <PlusCircle size={20} />, 
      show: true 
    },
    { 
      name: 'Vehicle Exit', 
      path: '/exit', 
      icon: <MinusCircle size={20} />, 
      show: true 
    },
    { 
      name: 'Revenue Analytics', 
      path: '/analytics', 
      icon: <TrendingUp size={20} />, 
      show: isAdmin || isSupervisor 
    },
    { 
      name: 'Reports Panel', 
      path: '/reports', 
      icon: <FileSpreadsheet size={20} />, 
      show: isAdmin || isSupervisor 
    },
    { 
      name: 'Settings Manager', 
      path: '/settings', 
      icon: <Sliders size={20} />, 
      show: isAdmin 
    },
    { 
      name: 'Backup Manager', 
      path: '/backups', 
      icon: <Database size={20} />, 
      show: isAdmin 
    },
    { 
      name: 'Activity Logs', 
      path: '/logs', 
      icon: <History size={20} />, 
      show: isAdmin 
    },
  ];

  const getPageTitle = () => {
    const activeLink = links.find(l => l.path === location.pathname);
    return activeLink ? activeLink.name : 'SmartPark Facility';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight block">SmartPark</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">Enterprise MS</span>
            </div>
          </Link>
          
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg md:hidden text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {links.filter(l => l.show).map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md shadow-brand-600/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 uppercase">
              {user?.username.slice(0, 2)}
            </div>
            <div className="truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-350 text-sm block truncate">{user?.username}</span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-955/40 text-red-600 dark:text-red-400 font-medium rounded-xl transition-all"
          >
            <LogOut size={16} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-30 no-print">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-400 md:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-150">{getPageTitle()}</h2>
          </div>

          {/* Action Header Items */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Reset Trigger */}
            <button
              onClick={handleResetDatabase}
              disabled={resetting}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <RefreshCw size={13} className={resetting ? 'animate-spin' : ''} />
              <span>{resetting ? 'Resetting DB...' : 'Reset Demo Database'}</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 rounded-xl transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 rounded-xl transition-all relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notification Popover */}
              {notifOpen && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Facility Warnings</span>
                    {notifications.length > 0 && (
                      <span className="text-[10px] bg-red-100 dark:bg-red-955/60 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                        {notifications.length} alerts
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex gap-2.5 transition-colors">
                          <div className="shrink-0 mt-0.5">
                            {notif.type === 'error' && <ShieldAlert size={16} className="text-red-500" />}
                            {notif.type === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                            {notif.type === 'info' && <AlertCircle size={16} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No critical warnings. All systems operational.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Custom Global Toast Notifications container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm no-print">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-250 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300' :
              toast.type === 'error' ? 'bg-red-50 dark:bg-red-950/60 border-red-250 dark:border-red-900/60 text-red-800 dark:text-red-300' :
              toast.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-250 dark:border-amber-900/60 text-amber-800 dark:text-amber-355' :
              'bg-blue-50 dark:bg-blue-950/60 border-blue-250 dark:border-blue-900/60 text-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <AlertCircle size={18} />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-0.5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded text-slate-400 hover:text-slate-650"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
    </div>
  );
};
