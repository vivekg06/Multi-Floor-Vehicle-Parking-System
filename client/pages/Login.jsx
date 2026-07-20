import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Lock, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide all credentials');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token, data.user);
      
      // Redirect based on role
      if (data.user.role === 'staff') {
        navigate('/map');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Connection lost. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrefill = (role) => {
    const credentials = {
      admin: { u: 'admin', p: 'admin123' },
      supervisor: { u: 'supervisor', p: 'supervisor123' },
      staff: { u: 'staff', p: 'staff123' }
    };
    setUsername(credentials[role].u);
    setPassword(credentials[role].p);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* Decorative Animated Glowing Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Main Glassmorphic Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-4 z-10"
      >
        
        {/* Logo Icon / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-brand-600 to-emerald-600 rounded-3xl mb-4 shadow-xl shadow-brand-500/10">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SmartPark Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">Enterprise Facility Automation Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Shield size={20} className="text-emerald-500" />
            <span>Sign In to System</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-950/40 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-slate-100 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-brand-500/10 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Prefill Evaluation Panel */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Info size={14} className="text-brand-500" />
              <span>Demo Quick-Login Shortcuts</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPrefill('admin')}
                className="py-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-bold rounded-xl transition-all"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrefill('supervisor')}
                className="py-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-bold rounded-xl transition-all"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrefill('staff')}
                className="py-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-bold rounded-xl transition-all"
              >
                Staff
              </button>
            </div>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-center mt-6 text-xs text-slate-650">
          <span>&copy; {new Date().getFullYear()} SmartParkMS Systems Inc. All Rights Reserved.</span>
        </div>
      </motion.div>
    </div>
  );
};
