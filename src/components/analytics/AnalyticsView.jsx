import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../common/PageHeader';
import StoreFilter from '../common/StoreFilter';
import DateFilter from '../common/DateFilter';
import StatCard from '../common/StatCard';
import TagStatusDistributionChart from './TagStatusDistributionChart';
import TopStolenData from './TopStolenData';
import TheftByTimeOfDay from './TheftByTimeOfDay';
import TheftByDayOfWeek from './TheftByDayOfWeek';
import { Tag, TagX, AlertTriangle, TrendingDown } from 'lucide-react';
import { fetchAnalyticsDashboard } from '../../utils/dashboardApi';

const formatApiDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AnalyticsView = () => {
  const [loading, setLoading] = useState(false);
  const [datePayload, setDatePayload] = useState({ Preset: 'Today' });
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const [metrics, setMetrics] = useState({
    totalTags: '0',
    untagged: '0',
    theftAlerts: '0',
    potentialLoss: '₹0'
  });

  const loadMetrics = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsDashboard(payload);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load analytics dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await fetchAnalyticsDashboard(datePayload);
        if (!ignore && data) {
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to load analytics dashboard metrics:', error);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDateChange = (label, rangeInfo) => {
    let payload = { Preset: 'Today' };

    if (label === 'Today') {
      payload = { Preset: 'Today' };
    } else if (label === 'Last 7 Days' || label === 'Last7Days') {
      payload = { Preset: 'Last7Days' };
    } else if (label === 'Last 30 Days' || label === 'Last30Days') {
      payload = { Preset: 'Last30Days' };
    } else if (rangeInfo?.startDate && rangeInfo?.endDate) {
      payload = {
        Preset: 'Custom',
        FromDate: formatApiDate(rangeInfo.startDate),
        ToDate: formatApiDate(rangeInfo.endDate),
      };
    } else {
      payload = { Preset: label };
    }

    if (currentStoreId) {
      payload.StoreId = currentStoreId;
    }

    setDatePayload(payload);
    loadMetrics(payload);
  };

  const handleStoreChange = (storeId) => {
    setCurrentStoreId(storeId || null);
    setLoading(true);
    setTimeout(async () => {
      const payload = { ...datePayload };
      if (storeId) {
        payload.StoreId = storeId;
      } else {
        delete payload.StoreId;
      }
      await loadMetrics(payload);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-4 sm:space-y-5 xl:space-y-6">
      {/* 1. Header with Store & Date Range Filters */}
      <PageHeader title="Analytics">
        <StoreFilter onStoreChange={handleStoreChange} />
        <DateFilter onDateChange={handleDateChange} />
      </PageHeader>

      {/* 2. Key Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5 xl:gap-5">
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

      {/* 3. Analytics Visualizations Grid (2x2 Balanced Cards, Responsive & Generous on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 xl:gap-6 items-stretch">
        {/* Row 1, Left: Tag Status Distribution (3D Isometric Pie Chart) */}
        <TagStatusDistributionChart className="h-full" metrics={metrics} />

        {/* Row 1, Right: Top Stolen Items (Target Articles & Theft Counts) */}
        <TopStolenData className="h-full" highIncidentTargets={metrics?.highIncidentTargets} />

        {/* Row 2, Left: Theft by Time of Day (Hourly Incident Bar Chart) */}
        <TheftByTimeOfDay className="h-full" hourlyThefts={metrics?.hourlyThefts} />

        {/* Row 2, Right: Theft by Day of Week (Weekly Incident Bar Chart) */}
        <TheftByDayOfWeek className="h-full" weeklyThefts={metrics?.weeklyThefts} />
      </div>
    </div>
  );
};

export default AnalyticsView;
