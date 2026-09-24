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
import { fetchDashboardRecord } from '../../utils/dashboardApi';

const AnalyticsView = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalTags: '...',
    untagged: '...',
    theftAlerts: '...',
    potentialLoss: 'N/A'
  });

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardRecord();
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
      setLoading(true);
      try {
        const data = await fetchDashboardRecord();
        if (!ignore) {
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to load analytics dashboard metrics:', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleStoreChange = () => {
    loadMetrics();
  };

  return (
    <div className="space-y-4 sm:space-y-5 xl:space-y-6">
      {/* 1. Header with Store & Date Range Filters */}
      <PageHeader title="Analytics">
        <StoreFilter onStoreChange={handleStoreChange} />
        <DateFilter />
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
        <TagStatusDistributionChart className="h-full" />

        {/* Row 1, Right: Top Stolen Items (Target Articles & Theft Counts) */}
        <TopStolenData className="h-full" />

        {/* Row 2, Left: Theft by Time of Day (Hourly Incident Bar Chart) */}
        <TheftByTimeOfDay className="h-full" />

        {/* Row 2, Right: Theft by Day of Week (Weekly Incident Bar Chart) */}
        <TheftByDayOfWeek className="h-full" />
      </div>
    </div>
  );
};

export default AnalyticsView;
