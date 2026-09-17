import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { TOP_STOLEN_ITEMS_DATA } from '../../data/mockAnalyticsData';

/**
 * TopStolenData Component
 * Displays top stolen merchandise articles and their theft counts.
 * Features full-width progress bars with article number clearly displayed below the bar.
 */
export default function TopStolenData({
  items = TOP_STOLEN_ITEMS_DATA,
  className = '',
}) {
  const totalThefts = Math.max(
    items.reduce((sum, i) => sum + i.theftCount, 0),
    1
  );

  return (
    <div
      className={`bg-white border-2 border-rose-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all hover:shadow-sm min-h-[310px] sm:min-h-[340px] xl:min-h-[385px] 2xl:min-h-[425px] ${className}`}
    >
      {/* 1. Creative Header Banner (Matching DashboardOverview Theme) */}
      <div className="bg-gradient-to-r from-rose-50 via-rose-50/60 to-white px-3.5 py-2.5 sm:px-4 sm:py-3 xl:px-5 xl:py-3.5 border-b border-rose-100 flex items-center justify-between gap-3 shrink-0 h-[56px] sm:h-[60px] xl:h-[64px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shadow-rose-500/25 shrink-0">
            <ShieldAlert className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-rose-600 block leading-none mb-0.5">
              High Incident Targets
            </span>
            <h3 className="text-xs sm:text-[13px] xl:text-sm 2xl:text-[15px] font-bold text-slate-900 tracking-tight truncate leading-tight">
              Top 5 Stolen Items
            </h3>
          </div>
        </div>

        {/* Count Badge on Right Side with Live Pulsing Dot */}
        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
          {items.length} Articles · {totalThefts} Thefts
        </span>
      </div>

      {/* 2. Compact Full-Width Progress Bar Items with Distinct Card Containers */}
      <div className="p-3 sm:p-4 xl:p-5 bg-slate-50/20 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-2 sm:gap-2.5 xl:gap-3 h-[200px] sm:h-[225px] xl:h-[275px] 2xl:h-[315px] overflow-y-auto custom-scrollbar pr-1.5">
          {items.map((item) => {
            const sharePercent = ((item.theftCount / totalThefts) * 100).toFixed(1);

            return (
              <div
                key={item.articleNumber}
                className="p-2.5 sm:p-3 xl:p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-rose-200 hover:shadow-xs transition-all flex flex-col gap-1.5 sm:gap-2"
              >
                {/* Line 1: Item Description on Left, Theft Count & Highlighted Share % on Right */}
                <div className="flex items-center justify-between text-xs sm:text-[13px] xl:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800 text-xs sm:text-[13px] xl:text-sm 2xl:text-[14.5px] truncate">
                      {item.itemDescription}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-[12.5px]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-rose-600 text-xs sm:text-[13px] xl:text-sm">
                        {item.theftCount}
                      </span>
                      <span className="text-[10px] sm:text-[10.5px] xl:text-[11px] font-medium text-slate-500">
                        {item.theftCount === 1 ? 'theft' : 'thefts'}
                      </span>
                    </div>
                    {/* Highlighted Percentage Badge with High Contrast */}
                    <span className="text-[10px] sm:text-[10.5px] xl:text-[11.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md shadow-2xs">
                      {sharePercent}%
                    </span>
                  </div>
                </div>

                {/* Line 2: Full-Width Progress Bar (Share of Total) */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 xl:h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out shadow-2xs"
                    style={{
                      width: `${sharePercent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {/* Line 3: Article Number clearly grouped inside item container on Left, Loss Value on Right */}
                <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] xl:text-[11.5px] 2xl:text-xs text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Article No:</span>
                    <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70 text-[9.5px] sm:text-[10px] xl:text-[11px]">
                      {item.articleNumber}
                    </span>
                  </div>

                  <div className="font-medium text-slate-500">
                    Loss: <span className="font-bold text-slate-900 text-[10.5px] sm:text-[11.5px] xl:text-[12.5px] 2xl:text-[13.5px]">₹{item.lossValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

