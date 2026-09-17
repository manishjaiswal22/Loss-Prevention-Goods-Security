import React, { useState } from 'react';
import PageHeader from '../common/PageHeader';
import StoreFilter from '../common/StoreFilter';
import DateFilter from '../common/DateFilter';
import StatCard from '../common/StatCard';
import TagStatusDistributionChart from './TagStatusDistributionChart';
import TopStolenData from './TopStolenData';
import TheftByTimeOfDay from './TheftByTimeOfDay';
import TheftByDayOfWeek from './TheftByDayOfWeek';
import { Tag, TagX, AlertTriangle, TrendingDown } from 'lucide-react';

const AnalyticsView = () => {
  const [loading, setLoading] = useState(false);

  const handleStoreChange = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
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
          count="12,568"
          icon={Tag}
          variant="green"
          loading={loading}
        />
        <StatCard
          title="Untagged"
          count="315"
          icon={TagX}
          variant="blue"
          loading={loading}
        />
        <StatCard
          title="Theft Alerts"
          count="280"
          icon={AlertTriangle}
          variant="gray"
          loading={loading}
        />
        <StatCard
          title="Potential Loss"
          count="₹4,23,010"
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
