import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Clock,
  Store,
  TagX,
  AlertTriangle,
} from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'Theft',
    articleDescription: 'Men Slim Fit Denim Jeans',
    articleNo: 'ART-10492',
    storeCode: 'HD55',
    storeName: 'Dwarka',
    time: '14:22',
  },
  {
    id: 2,
    type: 'Untagged',
    articleDescription: 'Wireless Noise Cancelling Headphones',
    articleNo: 'ART-20491',
    storeCode: 'HD44',
    storeName: 'Uttam - Nagar 2',
    time: '14:08',
  },
];

export default function TopNavbar({ onToggleSidebar, user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Close notifications or profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const username = user?.username || 'Manish';
  const userInitials = username.slice(0, 2).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left Section: Menu Toggle (Mobile) & Title with Real-time Text */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
          title="Toggle Sidebar (Mini / Expanded)"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Platform Title & Subtitle */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
            Loss Prevention & Goods Security
          </h1>
          <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-snug">
            Real-time monitoring of your store's inventory, tag status and theft analytics
          </p>
        </div>
      </div>

      {/* Right Section: Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">

        {/* Notification Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors relative cursor-pointer shadow-2xs"
            title="Theft & Security Alerts"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {/* Notification Badge - Positioned at corner without covering bell */}
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
              {NOTIFICATIONS.length}
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Security Alerts</span>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  {NOTIFICATIONS.length} New
                </span>
              </div>
              <div className="space-y-2.5 mt-3">
                {NOTIFICATIONS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100/90 hover:border-slate-200 transition-all cursor-pointer"
                  >
                    {/* Themed Severity Icon */}
                    <div
                      className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        item.type === 'Theft'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-sky-100 text-[#00a8e7]'
                      }`}
                    >
                      {item.type === 'Theft' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <TagX className="w-4 h-4" />
                      )}
                    </div>

                    {/* Notification Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Row 1: Article Description as Main on Left, Event Type Badge on Right */}
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-[12.5px] truncate leading-tight">
                          {item.articleDescription}
                        </h4>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                            item.type === 'Theft'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      {/* Row 2: Article Number */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="text-slate-400 font-medium">Article No:</span>
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[10px] border border-slate-200/80">
                          {item.articleNo}
                        </span>
                      </div>

                      {/* Row 3: Store Code & Store Name on Left, Time on Right */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10.5px]">
                        <div className="flex items-center gap-1 text-slate-600 truncate min-w-0">
                          <Store className="w-3 h-3 text-[#00a8e7] shrink-0" />
                          <span className="truncate">
                            <strong className="text-slate-900 font-semibold">{item.storeCode} - {item.storeName}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500 shrink-0 font-medium">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {/* User Avatar Initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5236df] to-[#7c3aed] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitials}
            </div>
            
            {/* User Greeting */}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                Welcome, {username}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-xs text-slate-900">{username}</p>
                <p className="text-[11.5px] text-slate-600 font-medium">Store Manager</p>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
