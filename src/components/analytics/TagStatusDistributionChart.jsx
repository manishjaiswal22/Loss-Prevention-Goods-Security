import React, { useState } from 'react';
import { PieChart as PieIcon, Tag, TagX, AlertTriangle, TrendingDown } from 'lucide-react';
import { TAG_STATUS_DATA, STATCARD_METRICS } from '../../data/mockAnalyticsData';


export default function TagStatusDistributionChart({
  data = TAG_STATUS_DATA,
  metrics,
  className = '',
}) {
  const [activeSegment, setActiveSegment] = useState(null);

  // Parse numerical values from metrics or fallback to defaults
  const parsedTotal = metrics?.totalTags != null && metrics.totalTags !== '...'
    ? Number(String(metrics.totalTags).replace(/,/g, ''))
    : null;
  const parsedUntagged = metrics?.untagged != null && metrics.untagged !== '...'
    ? Number(String(metrics.untagged).replace(/,/g, ''))
    : null;
  const parsedLoss = metrics?.theftAlerts != null && metrics.theftAlerts !== '...'
    ? Number(String(metrics.theftAlerts).replace(/,/g, ''))
    : null;

  const totalNum = parsedTotal != null ? parsedTotal : (data?.total || STATCARD_METRICS.totalTags);
  const untaggedNum = parsedUntagged != null ? parsedUntagged : STATCARD_METRICS.untagged;
  const theftNum = parsedLoss != null ? parsedLoss : STATCARD_METRICS.theftAlerts;

  const untaggedPct = totalNum > 0 ? Number(((untaggedNum / totalNum) * 100).toFixed(1)) : 2.5;
  const theftPct = totalNum > 0 ? Number(((theftNum / totalNum) * 100).toFixed(1)) : 2.2;
  const safePct = Number(Math.max(0, 100 - untaggedPct - theftPct).toFixed(1));

  const potentialLossDisplay = metrics?.potentialLoss && metrics.potentialLoss !== '...'
    ? metrics.potentialLoss
    : STATCARD_METRICS.potentialLoss;

  // 3D Isometric Geometry Parameters
  const cx = 110;
  const cy = 56;
  const rx = 82;
  const ry = 42;
  const depth = 20;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg) => ({
    x: cx + rx * Math.cos(toRad(deg)),
    y: cy + ry * Math.sin(toRad(deg)),
  });

  // Slice configurations for the 3 StatCard data items
  const SLICES = [
    {
      id: 'total-tags',
      label: 'Total Tags',
      sublabel: 'Active & verified in store',
      count: totalNum,
      percentage: safePct,
      startDeg: 135,
      endDeg: 405, // 45 deg
      pullDx: 0,
      pullDy: -8,
      color: '#10b981',
      topGrad: 'url(#emeraldTop3D)',
      sideGrad: 'url(#emeraldSide3D)',
      icon: Tag,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'untagged',
      label: 'Untagged',
      sublabel: 'Tag not removed at POS',
      count: untaggedNum,
      percentage: untaggedPct,
      startDeg: 45,
      endDeg: 90,
      pullDx: 8,
      pullDy: 7,
      color: '#00a8e7',
      topGrad: 'url(#skyTop3D)',
      sideGrad: 'url(#skySide3D)',
      icon: TagX,
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 'theft-alerts',
      label: 'Theft Alerts',
      sublabel: 'Gate scanner alarms',
      count: theftNum,
      percentage: theftPct,
      startDeg: 90,
      endDeg: 135,
      pullDx: -8,
      pullDy: 7,
      color: '#f43f5e',
      topGrad: 'url(#roseTop3D)',
      sideGrad: 'url(#roseSide3D)',
      icon: AlertTriangle,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  // Render SVG paths for a slice in 3D
  const render3DSlice = (slice) => {
    const isHovered = activeSegment === slice.id;
    const transformStyle = isHovered
      ? `translate(${slice.pullDx}px, ${slice.pullDy}px)`
      : 'translate(0px, 0px)';

    if (slice.id === 'untagged') {
      // 45 deg to 90 deg (Front-Right)
      const p45 = pt(45);
      const p90 = pt(90);

      return (
        <g
          key={slice.id}
          className="cursor-pointer transition-transform duration-300 ease-out"
          style={{
            transform: transformStyle,
            filter: isHovered ? 'drop-shadow(0 10px 12px rgba(0,168,231,0.4))' : 'none',
          }}
          onMouseEnter={() => setActiveSegment(slice.id)}
          onMouseLeave={() => setActiveSegment(null)}
        >
          {/* Radial Wall at 45 deg */}
          <path
            d={`M ${cx} ${cy} L ${p45.x} ${p45.y} L ${p45.x} ${p45.y + depth} L ${cx} ${cy + depth} Z`}
            fill="#0369a1"
            opacity="0.9"
          />

          {/* Front Outer Rim Wall */}
          <path
            d={`M ${p45.x} ${p45.y} A ${rx} ${ry} 0 0 1 ${p90.x} ${p90.y} L ${p90.x} ${p90.y + depth} A ${rx} ${ry} 0 0 0 ${p45.x} ${p45.y + depth} Z`}
            fill={slice.sideGrad}
          />

          {/* Radial Wall at 90 deg */}
          <path
            d={`M ${cx} ${cy} L ${p90.x} ${p90.y} L ${p90.x} ${p90.y + depth} L ${cx} ${cy + depth} Z`}
            fill="#0284c7"
            opacity="0.95"
          />

          {/* Top Elliptical Face */}
          <path
            d={`M ${cx} ${cy} L ${p45.x} ${p45.y} A ${rx} ${ry} 0 0 1 ${p90.x} ${p90.y} Z`}
            fill={slice.topGrad}
            stroke="#e0f2fe"
            strokeWidth="0.75"
          />
        </g>
      );
    }

    if (slice.id === 'theft-alerts') {
      // 90 deg to 135 deg (Front-Left)
      const p90 = pt(90);
      const p135 = pt(135);

      return (
        <g
          key={slice.id}
          className="cursor-pointer transition-transform duration-300 ease-out"
          style={{
            transform: transformStyle,
            filter: isHovered ? 'drop-shadow(0 10px 12px rgba(244,63,94,0.45))' : 'none',
          }}
          onMouseEnter={() => setActiveSegment(slice.id)}
          onMouseLeave={() => setActiveSegment(null)}
        >
          {/* Radial Wall at 90 deg */}
          <path
            d={`M ${cx} ${cy} L ${p90.x} ${p90.y} L ${p90.x} ${p90.y + depth} L ${cx} ${cy + depth} Z`}
            fill="#9f1239"
            opacity="0.95"
          />

          {/* Front Outer Rim Wall */}
          <path
            d={`M ${p90.x} ${p90.y} A ${rx} ${ry} 0 0 1 ${p135.x} ${p135.y} L ${p135.x} ${p135.y + depth} A ${rx} ${ry} 0 0 0 ${p90.x} ${p90.y + depth} Z`}
            fill={slice.sideGrad}
          />

          {/* Radial Wall at 135 deg */}
          <path
            d={`M ${cx} ${cy} L ${p135.x} ${p135.y} L ${p135.x} ${p135.y + depth} L ${cx} ${cy + depth} Z`}
            fill="#be123c"
            opacity="0.9"
          />

          {/* Top Elliptical Face */}
          <path
            d={`M ${cx} ${cy} L ${p90.x} ${p90.y} A ${rx} ${ry} 0 0 1 ${p135.x} ${p135.y} Z`}
            fill={slice.topGrad}
            stroke="#ffe4e6"
            strokeWidth="0.75"
          />
        </g>
      );
    }

    // Default: Total Tags (135 deg to 405 deg / 45 deg, Clockwise across the back)
    const p135 = pt(135);
    const p45 = pt(45);
    const p0 = pt(0);
    const p180 = pt(180);

    return (
      <g
        key={slice.id}
        className="cursor-pointer transition-transform duration-300 ease-out"
        style={{
          transform: transformStyle,
          filter: isHovered ? 'drop-shadow(0 10px 14px rgba(16,185,129,0.35))' : 'none',
        }}
        onMouseEnter={() => setActiveSegment(slice.id)}
        onMouseLeave={() => setActiveSegment(null)}
      >
        {/* Visible Front-Right Rim (0 deg to 45 deg) */}
        <path
          d={`M ${p0.x} ${p0.y} A ${rx} ${ry} 0 0 1 ${p45.x} ${p45.y} L ${p45.x} ${p45.y + depth} A ${rx} ${ry} 0 0 0 ${p0.x} ${p0.y + depth} Z`}
          fill={slice.sideGrad}
        />

        {/* Visible Front-Left Rim (135 deg to 180 deg) */}
        <path
          d={`M ${p135.x} ${p135.y} A ${rx} ${ry} 0 0 1 ${p180.x} ${p180.y} L ${p180.x} ${p180.y + depth} A ${rx} ${ry} 0 0 0 ${p135.x} ${p135.y + depth} Z`}
          fill={slice.sideGrad}
        />

        {/* Radial Wall at 45 deg */}
        <path
          d={`M ${cx} ${cy} L ${p45.x} ${p45.y} L ${p45.x} ${p45.y + depth} L ${cx} ${cy + depth} Z`}
          fill="#047857"
          opacity="0.85"
        />

        {/* Radial Wall at 135 deg */}
        <path
          d={`M ${cx} ${cy} L ${p135.x} ${p135.y} L ${p135.x} ${p135.y + depth} L ${cx} ${cy + depth} Z`}
          fill="#065f46"
          opacity="0.85"
        />

        {/* Top Elliptical Face (Major Back Arc) */}
        <path
          d={`M ${cx} ${cy} L ${p135.x} ${p135.y} A ${rx} ${ry} 0 1 1 ${p45.x} ${p45.y} Z`}
          fill={slice.topGrad}
          stroke="#d1fae5"
          strokeWidth="0.75"
        />
      </g>
    );
  };

  const activeData = SLICES.find((s) => s.id === activeSegment);

  return (
    <div
      className={`bg-white border-2 border-emerald-200/70 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all hover:shadow-sm min-h-[310px] sm:min-h-[340px] xl:min-h-[385px] 2xl:min-h-[425px] ${className}`}
    >
      {/* 1. Creative Header Banner (Matching DashboardOverview Theme) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white px-3.5 py-2.5 sm:px-4 sm:py-3 xl:px-5 xl:py-3.5 border-b border-emerald-100 flex items-center justify-between gap-3 shrink-0 h-[56px] sm:h-[60px] xl:h-[64px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 xl:w-9 xl:h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shadow-emerald-500/25 shrink-0">
            <PieIcon className="w-4 h-4 xl:w-4.5 xl:h-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 block leading-none mb-0.5">
              3D Inventory Breakdown
            </span>
            <h3 className="text-xs sm:text-[13px] xl:text-sm 2xl:text-[15px] font-bold text-slate-900 tracking-tight truncate leading-tight">
              Tag Status Distribution (3D)
            </h3>
          </div>
        </div>

        {/* Total Tags Badge on Right Side */}
        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 shadow-2xs">
          {totalNum.toLocaleString('en-IN')} Total Tags
        </span>
      </div>

      {/* 2. Compact Body: 3D SVG Pie on Left, StatCard Legend on Right */}
      <div className="p-3 sm:p-4 xl:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 xl:gap-6 flex-1 bg-slate-50/20">
        {/* 3D SVG Pie Container with Floating Metric Badge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-34 sm:w-56 sm:h-40 xl:w-68 xl:h-48 2xl:w-80 2xl:h-56 flex items-center justify-center shrink-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 220 135"
            >
              <defs>
                {/* Emerald 3D Gradients */}
                <linearGradient id="emeraldTop3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="60%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="emeraldSide3D" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>

                {/* Sky 3D Gradients */}
                <linearGradient id="skyTop3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="60%" stopColor="#00a8e7" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="skySide3D" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>

                {/* Rose 3D Gradients */}
                <linearGradient id="roseTop3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="60%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
                <linearGradient id="roseSide3D" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>

                {/* Filter for realistic 3D cylinder drop shadow */}
                <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="150%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>

              {/* 3D Ambient Drop Shadow under Cylinder */}
              <ellipse
                cx={cx}
                cy={cy + depth + 10}
                rx={rx + 4}
                ry={ry + 2}
                fill="#0f172a"
                opacity="0.14"
                filter="url(#shadow3D)"
              />
              <ellipse
                cx={cx}
                cy={cy + depth + 4}
                rx={rx - 4}
                ry={ry * 0.88}
                fill="#0f172a"
                opacity="0.2"
                filter="url(#shadow3D)"
              />

              {/* Draw 3D Slices: Back slice first, Front slices on top */}
              {render3DSlice(SLICES[0])}
              {render3DSlice(SLICES[1])}
              {render3DSlice(SLICES[2])}
            </svg>
          </div>

          {/* Dynamic 3D Focus Indicator */}
          <div className="mt-1 text-center">
            {activeData ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200/90 shadow-2xs text-[10.5px]">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: activeData.color }}
                />
                <span className="font-semibold text-slate-800">
                  {activeData.label}:
                </span>
                <span className="font-bold text-slate-900">
                  {activeData.count.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  ({activeData.percentage}%)
                </span>
              </div>
            ) : (
              <span className="text-[10.5px] font-semibold text-slate-400">
                Hover slices to inspect 3D layers
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Exact StatCard Data Items (Clean Compact Rows matching Image 2) */}
        <div className="flex flex-col gap-2 xl:gap-2.5 2xl:gap-3 w-full flex-1 min-w-0">
          {SLICES.map((slice) => {
            const isHovered = activeSegment === slice.id;
            const Icon = slice.icon;

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setActiveSegment(slice.id)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2 sm:p-2.5 xl:p-3 2xl:p-3.5 rounded-xl transition-all border cursor-pointer ${
                  isHovered
                    ? 'bg-white shadow-xs border-slate-300 ring-1 ring-slate-200'
                    : 'bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                {/* Left: Icon + Clean Label matching Image 2 (NO parenthesis clutter) */}
                <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 min-w-0">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${slice.color}18`, color: slice.color }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-4.5 xl:h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-[13px] xl:text-sm 2xl:text-[14.5px] font-bold text-slate-900 truncate block">
                      {slice.label}
                    </span>
                    <span className="text-[10px] sm:text-[10.5px] xl:text-[11.5px] 2xl:text-xs text-slate-500 block truncate mt-0.5">
                      {slice.sublabel}
                    </span>
                  </div>
                </div>

                {/* Right: Count & Percentage Only (NO loss amount here) */}
                <div className="flex items-center gap-1.5 text-xs shrink-0 text-right">
                  <div className="flex flex-col items-end leading-tight">
                    <span className="font-bold text-slate-900 text-xs sm:text-[13px] xl:text-sm 2xl:text-base">
                      {slice.count.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] xl:text-[11px] 2xl:text-xs font-semibold text-slate-500">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Context Sub-bar: Potential Loss shown ONLY here */}
      <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 xl:px-5 xl:py-2.5 bg-emerald-50/40 border-t border-emerald-100/70 flex items-center justify-between text-[10.5px] sm:text-[11px] xl:text-xs h-7 sm:h-8 xl:h-9 shrink-0 cursor-pointer">
        <span className="truncate mr-2">
          Total Tags: <strong className="text-emerald-700 font-bold">{totalNum.toLocaleString('en-IN')}</strong> ({safePct}% Safe)
        </span>
        <span className="font-semibold text-rose-600 shrink-0 flex items-center gap-1">
          <TrendingDown className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
          Potential Loss: {potentialLossDisplay}
        </span>
      </div>
    </div>
  );
}
