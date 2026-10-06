import React, { useState, useEffect, useRef } from 'react';
import { Store, MapPin } from 'lucide-react';

export default function SelectedStore({
  storeCode = 'HD44',
  storeName = 'UTTAM NAGAR',
  location = 'Delhi',
  className = '',
  showInfoPopover = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!showInfoPopover) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showInfoPopover]);

  const handleToggle = () => {
    if (showInfoPopover) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button / Badge */}
      <button
        type="button"
        onClick={handleToggle}
        className="h-8.5 px-3 bg-white border border-slate-200/90 hover:border-slate-300 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-700 shadow-2xs transition-all cursor-pointer select-none"
        title={`Selected Store: ${storeCode} - ${storeName}${location ? ` (${location})` : ''}`}
        aria-label={`Selected Store: ${storeCode} ${storeName}`}
        aria-expanded={isOpen}
      >
        <Store className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
        <span className="inline-flex items-center text-[10.5px] font-bold text-[#007ba8] bg-sky-50 border border-sky-200/80 px-1.5 py-0.5 rounded tracking-wide">
          {storeCode}
        </span>
        <span className="font-semibold text-slate-800 tracking-tight whitespace-nowrap">
          {storeName}
        </span>
      </button>

      {/* Info Popover */}
      {showInfoPopover && isOpen && (
        <div className="absolute right-0 mt-2 w-68 bg-white rounded-xl shadow-lg border border-slate-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#00a8e7]" />
              <span className="text-xs font-bold text-slate-900">Active Store</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-[11px] text-slate-400 font-medium">Store Code</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                {storeCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-[11px] text-slate-400 font-medium">Store Name</span>
              <span className="font-semibold text-slate-800">{storeName}</span>
            </div>
            {location && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Region
                </span>
                <span className="font-medium text-slate-700">{location}</span>
              </div>
            )}
          </div>

          <p className="mt-2.5 pt-2 border-t border-slate-100 text-[10.5px] text-slate-500 leading-relaxed">
            All telemetry metrics, gate sensors, and theft incident alerts are localized to this store facility.
          </p>
        </div>
      )}
    </div>
  );
}

export { SelectedStore as SelectedStoreBadge };
