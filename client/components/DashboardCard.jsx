import React from 'react';
import { motion } from 'framer-motion';

export const DashboardCard = ({
  title,
  value,
  icon,
  color = 'brand',
  subtitle,
  delay = 0,
  onClick
}) => {
  const colorMap = {
    brand: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
    red: 'from-red-500/10 to-red-500/5 text-red-600 dark:text-red-400 border-red-500/20',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={`glass-card p-6 flex items-center justify-between border-slate-200 dark:border-slate-800/80 hover:shadow-xl dark:hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer select-none active:scale-[0.99]' : ''}`}
    >
      {/* Background Decorative Gradient Glow */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-tr ${colorMap[color]} blur-2xl opacity-40 rounded-full group-hover:scale-125 transition-transform duration-500`}></div>

      <div className="space-y-2 z-10">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-gradient-to-tr ${colorMap[color]} shadow-sm z-10`}>
        {icon}
      </div>
    </motion.div>
  );
};
