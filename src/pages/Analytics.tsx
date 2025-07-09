
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { CustomChartsPanel } from '@/components/admin/CustomChartsPanel';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white/60 to-green-50/80 backdrop-blur-xl">
      <div className="p-4 sm:p-6">
        <div className="space-y-6">
          <AnalyticsPanel />
          <CustomChartsPanel />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
