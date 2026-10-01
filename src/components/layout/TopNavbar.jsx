import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  ChevronUp,
  LogOut,
  Clock,
  Store,
  TagX,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchDashboardRecord,
  subscribeToLiveStream,
  normalizeSingleIncident,
  onDashboardSync,
  isTodayIncident,
} from '../../utils/dashboardApi';

export default function TopNavbar({ onToggleSidebar, user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [theftCount, setTheftCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [isBlinkingBadge, setIsBlinkingBadge] = useState(false);
  const [blinkingAlertId, setBlinkingAlertId] = useState(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const prevCountRef = useRef(0);
  const prevAlertIdsRef = useRef([]);
  const badgeTimerRef = useRef(null);

  const isInitialMountRef = useRef(true);

  // Trigger bell wobble and 10-second badge blinking
  const triggerNotificationBlink = useCallback((latestId) => {
    setHasNewAlert(true);
    setIsBlinkingBadge(true);
    if (latestId) setBlinkingAlertId(latestId);

    if (badgeTimerRef.current) {
      clearTimeout(badgeTimerRef.current);
    }
    // Blink count for 10s
    badgeTimerRef.current = setTimeout(() => {
      setHasNewAlert(false);
      setIsBlinkingBadge(false);
      setBlinkingAlertId(null);
    }, 10000);
  }, []);

  const loadTheftAlerts = useCallback((forceBlink = false) => {
    fetchDashboardRecord()
      .then((data) => {
        if (data) {
          handleIncomingDashboardData(data, forceBlink);
        }
      })
      .catch((err) => {
        console.error('Failed to load theft alerts in navbar:', err);
      });
  }, []);

  const handleIncomingDashboardData = useCallback((data, forceBlink = false) => {
    if (!data) return;

    // Handle new_record event from liveCheck
    if (data.event === 'new_record' || data.hasNew) {
      loadTheftAlerts(true);
      return;
    }

    // Case 1: Full dashboard update (has Summary, totalTags, theftAlerts, or incidents)
    if (data.Summary || data.totalTags != null || data.theftAlerts != null || Array.isArray(data.incidents)) {
      const incidentList = Array.isArray(data.incidents) ? [...data.incidents] : [];
      const currentDayAlerts = incidentList.filter((item) => isTodayIncident(item.date));
      let finalAlerts = currentDayAlerts.length > 0 ? currentDayAlerts : incidentList;

      // Identify newly arrived alerts
      const prevIds = new Set(prevAlertIdsRef.current);
      const newlyAdded = finalAlerts.filter((item) => !prevIds.has(item.id || item.epc));

      const count = data.theftAlerts != null
        ? Number(String(data.theftAlerts).replace(/[^\d]/g, ''))
        : finalAlerts.length;

      const shouldBlink = forceBlink || (
        !isInitialMountRef.current && (
          newlyAdded.length > 0 ||
          count > prevCountRef.current ||
          finalAlerts.length > prevAlertIdsRef.current.length
        )
      );

      if (shouldBlink && finalAlerts.length > 0) {
        const latestItem = newlyAdded.length > 0 ? newlyAdded[0] : finalAlerts[0];
        // Put the newest incident at index 0 (top of notifications)
        finalAlerts = [
          latestItem,
          ...finalAlerts.filter((i) => (i.id || i.epc) !== (latestItem.id || latestItem.epc)),
        ];
        triggerNotificationBlink(latestItem.id);
      } else if (shouldBlink && count > 0) {
        triggerNotificationBlink();
      }

      isInitialMountRef.current = false;
      prevAlertIdsRef.current = finalAlerts.map((i) => i.id || i.epc);
      prevCountRef.current = count;
      setAlerts(finalAlerts);
      setTheftCount(count);
    }
    // Case 2: Array of incidents
    else if (Array.isArray(data)) {
      const newAlerts = data.map(normalizeSingleIncident).filter(Boolean);
      if (newAlerts.length > 0) {
        const latestItem = newAlerts[0];
        setAlerts((prev) => {
          const existingEpcs = new Set(prev.map((a) => a.epc || a.id));
          const unique = newAlerts.filter((a) => !existingEpcs.has(a.epc || a.id));
          if (unique.length === 0) return prev;
          // Put latest at index 0 (top)
          const updated = [...unique, ...prev];
          prevAlertIdsRef.current = updated.map((i) => i.id || i.epc);
          prevCountRef.current = updated.length;
          setTheftCount(updated.length);
          triggerNotificationBlink(latestItem.id);
          return updated;
        });
      }
    }
    // Case 3: Single incident (real-time gate alarm)
    else if (data.EPC || data.EpcCode || data.ArticleDescription) {
      const newAlert = normalizeSingleIncident(data);
      if (newAlert) {
        setAlerts((prev) => {
          const exists = prev.some((a) => (a.epc && a.epc === newAlert.epc) || a.id === newAlert.id);
          if (exists) return prev;
          // Put latest at index 0 (top)
          const updated = [newAlert, ...prev];
          prevAlertIdsRef.current = updated.map((i) => i.id || i.epc);
          prevCountRef.current = updated.length;
          setTheftCount(updated.length);
          triggerNotificationBlink(newAlert.id);
          return updated;
        });
      }
    }
  }, [triggerNotificationBlink, loadTheftAlerts]);

  useEffect(() => {
    // 1. Initial snapshot fetch
    loadTheftAlerts();

    // 2. Sync with any dashboard data fetched across the application
    const unsubscribeSync = onDashboardSync((syncedData) => {
      handleIncomingDashboardData(syncedData);
    });

    // 3. Direct SSE / live check subscription
    const unsubscribeStream = subscribeToLiveStream(
      (liveData) => {
        handleIncomingDashboardData(liveData);
      },
      (err) => {
        console.warn('Navbar live stream error/retry:', err);
      },
      (status) => {
        // Status updates tracked silently
      }
    );

    return () => {
      unsubscribeSync();
      unsubscribeStream();
    };
  }, [loadTheftAlerts, handleIncomingDashboardData]);

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
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer shrink-0 active:scale-95 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
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
            onClick={() => {
              const nextState = !notificationsOpen;
              setNotificationsOpen(nextState);
              if (nextState) {
                loadTheftAlerts();
              }
            }}
            className={`w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all relative cursor-pointer shadow-2xs outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${
              isBlinkingBadge ? 'border-rose-300 bg-rose-50/40' : ''
            }`}
            title="Theft & Security Alerts"
          >
            <Bell className={`w-5 h-5 transition-colors ${isBlinkingBadge ? 'text-rose-600' : 'text-slate-700'}`} />
            {/* Notification Badge - Positioned at corner without covering bell, blinks for 10s */}
            <span
              className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs transition-all duration-300 ${
                isBlinkingBadge ? 'animate-badge-blink' : ''
              }`}
            >
              {theftCount}
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Security Alerts</span>
                  <span className="text-[10px] font-bold text-[#007ba8] bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  {theftCount} New
                </span>
              </div>
              {alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No security alerts for today
                </div>
              ) : (
                <div className={`space-y-2.5 mt-3 ${showAllAlerts ? 'max-h-72 sm:max-h-80 overflow-y-auto custom-scrollbar pr-1' : ''}`}>
                  {(showAllAlerts ? alerts : alerts.slice(0, 3)).map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        item.id === blinkingAlertId
                          ? 'bg-rose-50/80 border-2 border-rose-500 shadow-md ring-2 ring-rose-400/40 animate-pulse'
                          : 'hover:bg-slate-50 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {/* Themed Severity Icon */}
                      <div
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                          item.type === 'Untagged' || item.status === 'Untagged'
                            ? 'bg-sky-100 text-[#00a8e7]'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {item.type === 'Untagged' || item.status === 'Untagged' ? (
                          <TagX className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>

                      {/* Notification Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Row 1: Article Description as Main on Left, Event Type Badge on Right */}
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-[12.5px] truncate leading-tight">
                            {item.articleDescription}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {item.id === blinkingAlertId && (
                              <span className="shrink-0 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-rose-600 text-white rounded shadow-xs animate-pulse">
                                Latest
                              </span>
                            )}
                            <span
                              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                                item.type === 'Untagged' || item.status === 'Untagged'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {item.status || item.type || 'Theft'}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Article Number */}
                        <div className="flex items-center justify-between gap-1.5 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Article No:</span>
                            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[10px] border border-slate-200/80">
                              {item.articleNo}
                            </span>
                          </div>
                          {item.amount && item.amount !== 'N/A' && item.amount !== 'NA' ? (
                            <span className="font-semibold text-slate-900 text-[10.5px]">
                              {String(item.amount).startsWith('₹') ? item.amount : `₹${item.amount}`}
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-900 text-[10.5px]">
                              ₹0
                            </span>
                          )}
                        </div>

                        {/* Row 3: Store Code & Store Name on Left, Time on Right */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10.5px]">
                          <div className="flex items-center gap-1 text-slate-600 truncate min-w-0">
                            <Store className="w-3 h-3 text-[#00a8e7] shrink-0" />
                            <span className="truncate">
                              <strong className="text-slate-900 font-semibold">
                                {item.storeCode && item.storeName
                                  ? `${item.storeCode} - ${item.storeName}`
                                  : (item.storeName || item.storeCode || item.date || 'Main Store')}
                              </strong>
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
              )}

              {/* View More / View Less Option */}
              {alerts.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="w-full mt-3 py-1.5 px-3 text-xs font-semibold text-[#00a8e7] hover:text-[#0084b6] hover:bg-sky-50 rounded-xl transition-all border border-sky-100 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>
                    {showAllAlerts ? 'View Less' : `View More (${alerts.length - 3} more)`}
                  </span>
                  {showAllAlerts ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
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
