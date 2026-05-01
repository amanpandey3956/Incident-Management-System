import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 px-6 flex items-center justify-between h-16 shadow-md border-b border-slate-700 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3">
        <span className="text-rose-500 text-xl font-bold tracking-tight">IMS</span>
        <span className="text-slate-400 text-sm border-l border-slate-600 pl-3">Incident Management System</span>
      </Link>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-slate-400 text-xs font-medium">Live</span>
      </div>
    </nav>
  );
};

export default Navbar;
