import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Database, RefreshCw, Plus, ArrowDown, History, CheckCircle2, AlertTriangle, CloudLightning, Download 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/backups');
      setBackups(data);
    } catch (err) {
      console.error('Failed to load backups list:', err);
      setError('Could not retrieve backup history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleTriggerBackup = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.post('/api/backups/trigger');
      setSuccess(response.message || 'System backup snapshot saved successfully!');
      
      // Update backups list
      setBackups(prev => [response.backup, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to complete database backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`WARNING: Restoring will overwrite all current system data with the backup file "${filename}". Are you sure you want to proceed?`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/backups/restore', { filename });
      setSuccess(response.message || 'System data restored successfully!');
      
      // Clear logs or refresh data if required
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Restoration failed.');
      setActionLoading(false);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      // Hits the streaming download endpoint in our API utility which appends JWT
      const blob = await api.get(`/api/backups/download/${filename}`);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download the selected backup file.');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Action Header Card */}
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">System Backups Manager</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Automatic daily cron backups schedule runs at 00:00 midnight</p>
          </div>
        </div>

        <button
          onClick={handleTriggerBackup}
          disabled={actionLoading}
          className="px-5 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Trigger Manual Backup</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Backups List Table */}
      <div className="glass-card border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
            <History size={18} className="text-emerald-500" />
            <span>Backup Snapshot History</span>
          </h4>
          <button
            onClick={fetchBackups}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Backup Filename</th>
                <th className="px-6 py-3.5">Created Date & Time</th>
                <th className="px-6 py-3.5">Records Size</th>
                <th className="px-6 py-3.5">Total Rows</th>
                <th className="px-6 py-3.5">Backup Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded"></div>
                    </td>
                  </tr>
                ))
              ) : backups.length > 0 ? (
                backups.map((backup, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-350">{backup.filename}</td>
                    <td className="px-6 py-4 text-slate-450 dark:text-slate-500">{formatDate(backup.date)}</td>
                    <td className="px-6 py-4 text-slate-450">{formatBytes(backup.size)}</td>
                    <td className="px-6 py-4 text-slate-450">{backup.recordsCount} records</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider inline-block ${
                        backup.status === 'success' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-50 dark:bg-red-955/30 text-red-650 dark:text-red-400'
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.filename)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-xl transition-all"
                          title="Download Backup JSON"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.filename)}
                          disabled={actionLoading || backup.status !== 'success'}
                          className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold rounded-lg transition-all disabled:opacity-40"
                          title="Restore Data state"
                        >
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No system backups logged in database registry history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default Backup;
