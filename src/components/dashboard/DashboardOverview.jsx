import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../common/PageHeader';
import CurrentDateOption from '../common/CurrentDateOption';
import StoreFilter from '../common/StoreFilter';
import StatCard from '../common/StatCard';
import EpcCard from '../common/EpcCard';
import { Tag, TagX, AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';
import {
  fetchDashboardRecord,
  subscribeToLiveStream,
  normalizeDashboardData,
  normalizeSingleIncident,
} from '../../utils/dashboardApi';

const DashboardOverview = () => {
  const [loading, setLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const selectedStoreRef = useRef('');
  const [metrics, setMetrics] = useState({
    date: null,
    totalTags: '0',
    untagged: '0',
    theftAlerts: '0',
    potentialLoss: '₹0',
    incidents: []
  });

  // Central data loader: loads snapshot from todayDashboard for selected store
  const loadData = useCallback(async (storeId = selectedStoreRef.current) => {
    try {
      const payload = storeId ? { StoreId: storeId } : {};
      const data = await fetchDashboardRecord(payload);
      if (data) {
        setMetrics(data);
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        setLastSyncTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    }
  }, []);

  // Real-time Live Stream processor: instantly updates UI without refreshing or calling todayDashboard
  const handleLiveStreamData = useCallback((livePayload) => {
    if (!livePayload) return;

    // Case 1: Full dashboard update (has Summary, TotalTags, or SecurityIncidents)
    if (livePayload.Summary || livePayload.TotalTags != null || livePayload.SecurityIncidents || livePayload.Incidents) {
      const normalized = normalizeDashboardData(livePayload);
      if (normalized) {
        setMetrics(normalized);
      }
    }
    // Case 2: Array of incidents pushed in real time
    else if (Array.isArray(livePayload)) {
      const newIncidents = livePayload.map(normalizeSingleIncident).filter(Boolean);
      setMetrics((prev) => {
        const existingEpcs = new Set(prev.incidents.map((i) => i.epc || i.id));
        const uniqueNew = newIncidents.filter((i) => !existingEpcs.has(i.epc || i.id));
        if (uniqueNew.length === 0) return prev;

        const combined = [...uniqueNew, ...prev.incidents];
        const addedLoss = uniqueNew.reduce((sum, item) => sum + (item.amount || 0), 0);
        const prevLossNum = Number(String(prev.potentialLoss || 0).replace(/[₹,\s]/g, '')) || 0;

        return {
          ...prev,
          theftAlerts: String(Number(prev.theftAlerts || 0) + uniqueNew.length),
          totalTags: String(Number(prev.totalTags || 0) + uniqueNew.length),
          potentialLoss: `₹${(prevLossNum + addedLoss).toLocaleString('en-IN')}`,
          incidents: combined,
        };
      });
    }
    // Case 3: Single incident pushed in real time (RFID gate alarm event)
    else if (livePayload.EPC || livePayload.EpcCode || livePayload.ArticleDescription || livePayload.ArticleNo) {
      const newInc = normalizeSingleIncident(livePayload);
      if (newInc) {
        setMetrics((prev) => {
          const exists = prev.incidents.some((i) => (i.epc && i.epc === newInc.epc) || i.id === newInc.id);
          if (exists) return prev;

          const updatedIncidents = [newInc, ...prev.incidents];
          const prevLossNum = Number(String(prev.potentialLoss || 0).replace(/[₹,\s]/g, '')) || 0;

          return {
            ...prev,
            theftAlerts: String(Number(prev.theftAlerts || 0) + 1),
            totalTags: String(Number(prev.totalTags || 0) + 1),
            potentialLoss: `₹${(prevLossNum + (newInc.amount || 0)).toLocaleString('en-IN')}`,
            incidents: updatedIncidents,
          };
        });
      }
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    setLastSyncTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    setStreamStatus('connected');
  }, []);

  useEffect(() => {
    let ignore = false;

    // 1. Initial snapshot fetch
    loadData();

    // 2. Real-time Live Stream (SSE) subscription
    const unsubscribe = subscribeToLiveStream(
      (liveData) => {
        if (!ignore && liveData) {
          handleLiveStreamData(liveData);
        }
      },
      (error) => {
        console.warn('Live stream disconnected or retrying:', error);
      },
      (status) => {
        if (!ignore) {
          setStreamStatus(status);
          if (status === 'connected') {
            loadData();
          }
        }
      }
    );

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, [loadData, handleLiveStreamData]);

  const handleStoreChange = (storeId) => {
    selectedStoreRef.current = storeId || '';
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loadData(storeId);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Page Header: Title on the left, Live Stream status, CurrentDateOption and StoreFilter on the right */}
      <PageHeader title="Dashboard">
        {/* Live Stream Connection Status Indicator */}
        {streamStatus === 'connected' && (
          <div
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs cursor-default transition-all"
            title={`Real-Time Live Stream: Connected${lastSyncTime ? ` (Last sync: ${lastSyncTime})` : ''}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">Live Connected</span>
            {lastSyncTime && (
              <span className="hidden sm:inline-block text-[10px] font-medium text-emerald-600/80 ml-0.5">
                • {lastSyncTime}
              </span>
            )}
          </div>
        )}

        {streamStatus === 'connecting' && (
          <div
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs cursor-default transition-all"
            title="Connecting to Real-Time Live Stream..."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="tracking-wide">Connecting...</span>
          </div>
        )}

        {streamStatus === 'disconnected' && (
          <div
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs cursor-default transition-all"
            title="Live Stream disconnected. Browser will automatically retry."
          >
            <span className="relative flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="tracking-wide">Disconnected</span>
          </div>
        )}

        <CurrentDateOption date={metrics.date} />
        <StoreFilter onStoreChange={handleStoreChange} />
      </PageHeader>

      {/* 1. Compact Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tags"
          count={metrics.totalTags}
          icon={Tag}
          variant="green"
          loading={loading}
        />
        <StatCard
          title="Untagged"
          count={metrics.untagged}
          icon={TagX}
          variant="blue"
          loading={loading}
        />
        <StatCard
          title="Theft Alerts"
          count={metrics.theftAlerts}
          icon={AlertTriangle}
          variant="gray"
          loading={loading}
        />
        <StatCard
          title="Potential Loss"
          count={metrics.potentialLoss}
          icon={TrendingDown}
          variant="rose"
          loading={loading}
        />
      </div>

      {/* 2. Bottom Screen: Distinctly Themed Untagged vs Theft Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-5 pt-1 items-stretch">

        {/* <div className="bg-white border-2 border-sky-200/70 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[420px] sm:h-[460px] lg:h-[calc(100vh-345px)] lg:min-h-[400px] lg:max-h-[850px]">
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

             <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-[#006e96] border border-sky-200 shrink-0 shadow-2xs cursor-pointer">
              30 Items
            </span>
          </div>

          <div className="px-4 py-1.5 bg-sky-50/40 border-b border-sky-100/70 flex items-center justify-between text-[11px] text-slate-500 h-8 shrink-0 cursor-pointer">
            <span className="truncate mr-2">Articles sold or billed where security tag was not detached</span>
            <span className="font-semibold text-sky-700 shrink-0">Action: Detach Tag</span>
          </div>

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
              />
            ))}
          </div>
        </div> */}


        <div className="bg-white border-2 border-rose-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[350px] sm:h-[400px] lg:h-[calc(100vh-345px)] lg:min-h-[350px] lg:max-h-[700px]">
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

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {metrics.theftAlerts || (metrics.incidents ? metrics.incidents.length : 0)} Alarms
            </span>
          </div>

          <div className="px-4 py-1.5 bg-rose-50/40 border-b border-rose-100/70 flex items-center justify-between text-[11px] text-slate-500 h-8 shrink-0 cursor-pointer">
            <span className="truncate mr-2">Unauthorized articles passed through exit boundary scanners</span>
            <span className="font-semibold text-rose-600 shrink-0">Action: Security Check</span>
          </div>

          <div className="p-3 sm:p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5 content-start overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1 min-h-0">
            {metrics.incidents && metrics.incidents.length > 0 ? (
              metrics.incidents.map((item) => (
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
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                No theft alerts found
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
