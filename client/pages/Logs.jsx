import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ScrollText, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  
  const [actionFilter, setActionFilter] = useState('');
  const [userQuery, setUserQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/api/logs?page=${page}&limit=${limit}`;
      if (actionFilter) {
        url += `&action=${actionFilter}`;
      }
      if (userQuery) {
        url += `&username=${userQuery.trim()}`;
      }
      const data = await api.get(url);
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Could not retrieve system activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page on filter submit
    fetchLogs();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Search and Filters card panel */}
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800/80">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-end gap-4">
          
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Username Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search by operator username..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Action Filter</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-xs font-medium"
            >
              <option value="">All Operations</option>
              <option value="LOGIN">User Logins</option>
              <option value="CHECK_IN">Vehicle Check-In</option>
              <option value="CHECK_OUT">Vehicle Check-Out</option>
              <option value="SETTING_UPDATE">Settings Changed</option>
              <option value="BACKUP_CREATED">Backup Created</option>
              <option value="BACKUP_RESTORED">System State Restored</option>
              <option value="USER_CREATED">Users Added</option>
              <option value="USER_DELETED">Users Removed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => { setActionFilter(''); setUserQuery(''); setPage(1); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs"
            >
              Reset
            </button>
          </div>

        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="glass-card border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <ScrollText size={18} className="text-emerald-500" />
            <span>Operational Audit Trail ({total} logs)</span>
          </h4>
          <button
            onClick={fetchLogs}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Operator</th>
                <th className="px-6 py-3.5">Access Role</th>
                <th className="px-6 py-3.5">Action Executed</th>
                <th className="px-6 py-3.5">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 text-slate-450 dark:text-slate-500">{formatDate(log.timestamp)}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-205">{log.username}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider inline-block ${
                        log.action.includes('CHECK_IN') ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                        log.action.includes('CHECK_OUT') ? 'bg-red-50 dark:bg-red-955/30 text-red-650 dark:text-red-400' :
                        log.action.includes('SETTING_UPDATE') ? 'bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400' :
                        log.action.includes('LOGIN') ? 'bg-blue-50 dark:bg-blue-955/30 text-blue-600 dark:text-blue-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-350'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-350">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No activity logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
            <span className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 bg-white border dark:bg-slate-800 dark:border-slate-700/80 rounded-lg hover:bg-slate-55 text-slate-500 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 bg-white border dark:bg-slate-800 dark:border-slate-700/80 rounded-lg hover:bg-slate-55 text-slate-500 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default Logs;
