import React, { useState } from 'react';
import PageHeader from '../common/PageHeader';
import CurrentDateOption from '../common/CurrentDateOption';
import StoreFilter from '../common/StoreFilter';
import StatCard from '../common/StatCard';
import EpcCard from '../common/EpcCard';
import { Tag, TagX, AlertTriangle, TrendingDown } from 'lucide-react';
import { MOCK_UNTAGGED_ITEMS, MOCK_THEFT_ALERTS } from '../../data/mockEpcData';

const DashboardOverview = () => {
  const [loading, setLoading] = useState(false);

  const handleStoreChange = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Page Header: Title on the left, CurrentDateOption and StoreFilter on the right */}
      <PageHeader title="Dashboard">
        <CurrentDateOption />
        <StoreFilter onStoreChange={handleStoreChange} />
      </PageHeader>

      {/* 1. Compact Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tags"
          count="100"
          icon={Tag}
          variant="green"
          loading={loading}
        />
        <StatCard
          title="Untagged"
          count="30"
          icon={TagX}
          variant="blue"
          loading={loading}
        />
        <StatCard
          title="Theft Alerts"
          count="12"
          icon={AlertTriangle}
          variant="gray"
          loading={loading}
        />
        <StatCard
          title="Potential Loss"
          count="₹4,250"
          icon={TrendingDown}
          variant="rose"
          loading={loading}
        />
      </div>

      {/* 2. Bottom Screen: Distinctly Themed Untagged vs Theft Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1 items-stretch">
        
       
        <div className="bg-white border-2 border-sky-200/70 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[420px] sm:h-[460px] lg:h-[calc(100vh-345px)] lg:min-h-[400px] lg:max-h-[850px]">
          {/* Section Header with Distinct Blue Banner & Right-Aligned Count */}
          <div className="bg-gradient-to-r from-sky-50 via-sky-50/60 to-white px-4 py-3 border-b border-sky-100 flex items-center justify-between gap-3 h-[60px] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#00a8e7] text-white flex items-center justify-center shadow-xs shadow-sky-500/25 shrink-0">
                <TagX className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0084b6] block leading-none mb-1">
                  Checkout Exception
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
                  Untagged (Tag Not Removed)
                </h3>
              </div>
            </div>

            {/* Count Badge on Right Side */}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-[#006e96] border border-sky-200 shrink-0 shadow-2xs cursor-pointer">
              30 Items
            </span>
          </div>

          {/* Sub-bar / Context Helper */}
          <div className="px-4 py-1.5 bg-sky-50/40 border-b border-sky-100/70 flex items-center justify-between text-[11px] text-slate-500 h-8 shrink-0 cursor-pointer">
            <span className="truncate mr-2">Articles sold or billed where security tag was not detached</span>
            <span className="font-semibold text-sky-700 shrink-0">Action: Detach Tag</span>
          </div>

          {/* 1 by 1 Compact Cards Stack */}
          <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1 min-h-0">
            {MOCK_UNTAGGED_ITEMS.map((item) => (
              <EpcCard
                key={item.id}
                articleDescription={item.articleDescription}
                articleNo={item.articleNo}
                epc={item.epc}
                amount={item.amount}
                date={item.date}
                time={item.time}
                status={item.status}
                variant="untagged"
                loading={loading}
              />
            ))}
          </div>
        </div>

       
        <div className="bg-white border-2 border-rose-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[420px] sm:h-[460px] lg:h-[calc(100vh-345px)] lg:min-h-[400px] lg:max-h-[850px]">
          {/* Section Header with Distinct Red Banner & Right-Aligned Count */}
          <div className="bg-gradient-to-r from-rose-50 via-rose-50/60 to-white px-4 py-3 border-b border-rose-100 flex items-center justify-between gap-3 h-[60px] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shadow-rose-500/25 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block leading-none mb-1">
                  Security Incidents
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
                  Theft & Gate Alarms
                </h3>
              </div>
            </div>

            {/* Count Badge on Right Side with Live Pulsing Dot */}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              12 Alarms
            </span>
          </div>

          {/* Sub-bar / Context Helper */}
          <div className="px-4 py-1.5 bg-rose-50/40 border-b border-rose-100/70 flex items-center justify-between text-[11px] text-slate-500 h-8 shrink-0 cursor-pointer">
            <span className="truncate mr-2">Unauthorized articles passed through exit boundary scanners</span>
            <span className="font-semibold text-rose-600 shrink-0">Action: Security Check</span>
          </div>

          {/* 1 by 1 Compact Cards Stack */}
          <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1 min-h-0">
            {MOCK_THEFT_ALERTS.map((item) => (
              <EpcCard
                key={item.id}
                articleDescription={item.articleDescription}
                articleNo={item.articleNo}
                epc={item.epc}
                amount={item.amount}
                date={item.date}
                time={item.time}
                status={item.status}
                variant="theft"
                loading={loading}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
