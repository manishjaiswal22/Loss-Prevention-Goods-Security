import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, isCollapsed = true }) {
  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0d1b2e] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${isCollapsed ? 'lg:w-20 w-60' : 'w-60'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header & Navigation */}
        <div className={`flex flex-col flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>

          {/* Brand Header */}
          <div className="h-20 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
            {isCollapsed ? (
              /* Mini Mode Circular Logo Badge matching reference */
              <div className="mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg p-1.5 transition-transform hover:scale-105 cursor-pointer">
                <img
                  src="/assets/vyapti_logo.png"
                  alt="Vyapti Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              /* Expanded Mode Wide Logo */
              <>
                <div className="flex items-center">
                  <img
                    src="/assets/vyapti_logo_white.png"
                    alt="Vyapti Logo"
                    className="h-12 sm:h-14 w-auto max-w-[200px] object-contain"
                  />
                </div>
                {/* Mobile close button */}
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Navigation Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`py-4 space-y-3 ${isCollapsed ? 'px-2 overflow-visible' : 'p-4'}`}>

            {/* 1. Dashboard Menu */}
            <NavLink
              to="/dashboard"
              onClick={handleNavClick}
              className={({ isActive }) =>
                isCollapsed
                  ? `relative group w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-tr from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/35 ring-2 ring-[#00a8e7]/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`
                  : `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-r from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
              }
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {isCollapsed ? (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 border border-slate-700 flex items-center">
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
                  Dashboard
                </div>
              ) : (
                <span>Dashboard</span>
              )}
            </NavLink>

            {/* 2. Analytics Menu */}
            <NavLink
              to="/analytics"
              onClick={handleNavClick}
              className={({ isActive }) =>
                isCollapsed
                  ? `relative group w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-tr from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/35 ring-2 ring-[#00a8e7]/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`
                  : `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-r from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
              }
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              {isCollapsed ? (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 border border-slate-700 flex items-center">
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
                  Analytics
                </div>
              ) : (
                <span>Analytics</span>
              )}
            </NavLink>

            {/* 3. Reports Menu */}
            <NavLink
              to="/reports"
              onClick={handleNavClick}
              className={({ isActive }) =>
                isCollapsed
                  ? `relative group w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-tr from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/35 ring-2 ring-[#00a8e7]/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`
                  : `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                    ? 'bg-gradient-to-r from-[#00a8e7] via-[#2672e5] to-[#5236df] text-white shadow-lg shadow-[#00a8e7]/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
              }
            >
              <FileText className="w-5 h-5 shrink-0" />
              {isCollapsed ? (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 border border-slate-700 flex items-center">
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700 rotate-45" />
                  Reports
                </div>
              ) : (
                <span>Reports</span>
              )}
            </NavLink>

          </nav>
        </div>

        {/* Bottom Section: Hidden when sidebar is collapsed */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-800/80">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00a8e7]/20 to-[#5236df]/20 text-[#00a8e7] flex items-center justify-center shrink-0 mt-0.5 border border-[#00a8e7]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11.5px] leading-snug">
                <p className="font-semibold text-white">Secure Inventory</p>
                <p className="text-slate-400">Reduce Losses</p>
                <p className="text-slate-400">Increase Profits</p>
              </div>
            </div>
          </div>
        )}

      </aside>
    </>
  );
}
