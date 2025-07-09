
import { useEffect, useRef } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@mui/x-charts';
import { gsap } from 'gsap';

interface AnalyticsPanelProps {
  compact?: boolean;
}

export const AnalyticsPanel = ({ compact = false }: AnalyticsPanelProps) => {
  const { donations, selectedFinancialYear, dailyContributionDays } = useDonationStore();
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter donations by selected financial year
  const filteredDonations = donations.filter(d => d.financialYear === selectedFinancialYear);

  // Building-wise data (ensure all 19 buildings are represented)
  const buildingData = Array.from({ length: 19 }, (_, i) => {
    const buildingNo = i + 1;
    const amount = filteredDonations
      .filter(donation => donation.buildingNo === buildingNo)
      .reduce((sum, donation) => sum + donation.amount, 0);
    return {
      building: buildingNo,
      amount,
      label: `Building ${buildingNo}`,
    };
  });

  // Payment method data with amounts
  const paymentData = filteredDonations.reduce((acc, donation) => {
    if (!acc[donation.paymentMethod]) {
      acc[donation.paymentMethod] = { count: 0, amount: 0 };
    }
    acc[donation.paymentMethod].count += 1;
    acc[donation.paymentMethod].amount += donation.amount;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const paymentChartData = Object.entries(paymentData).map(([method, data]) => ({
    label: `${method} (₹${data.amount.toLocaleString()})`,
    value: data.count,
  }));

  // Calculate totals for Quick Analytics
  const totalCash = paymentData.Cash?.amount || 0;
  const totalUPI = paymentData.UPI?.amount || 0;
  const cashTransactions = paymentData.Cash?.count || 0;
  const upiTransactions = paymentData.UPI?.count || 0;

  // Configurable daily contributions
  const recentDays = Array.from({ length: dailyContributionDays }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (dailyContributionDays - 1 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyChartData = recentDays.map(date => {
    const amount = filteredDonations
      .filter(donation => donation.date === date)
      .reduce((sum, donation) => sum + donation.amount, 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount,
    };
  }).filter(item => item.amount > 0);

  useEffect(() => {
    // GSAP animations for chart containers
    chartRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(ref, 
          { opacity: 0, y: 50, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.8,
            delay: index * 0.2,
            ease: "power3.out"
          }
        );
      }
    });
  }, [filteredDonations, dailyContributionDays]);

  if (compact) {
    return (
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50/80 p-3 rounded-lg backdrop-blur-sm">
                <div className="font-semibold text-green-800">Cash</div>
                <div className="text-green-600">₹{totalCash.toLocaleString()} ({cashTransactions} transactions)</div>
              </div>
              <div className="bg-blue-50/80 p-3 rounded-lg backdrop-blur-sm">
                <div className="font-semibold text-blue-800">UPI</div>
                <div className="text-blue-600">₹{totalUPI.toLocaleString()} ({upiTransactions} transactions)</div>
              </div>
            </div>
          </div>
          <div ref={el => chartRefs.current[0] = el} className="h-64">
            <PieChart
              series={[{
                data: paymentChartData,
                highlightScope: { fade: 'global', highlight: 'item' },
              }]}
              height={200}
              margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Full Width Building-wise Contributions */}
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Building-wise Contributions (All Buildings)</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={el => chartRefs.current[1] = el} className="h-80 w-full">
            <BarChart
              dataset={buildingData}
              xAxis={[{ 
                scaleType: 'band', 
                dataKey: 'building',
                tickLabelStyle: { fontSize: 12 }
              }]}
              yAxis={[{ 
                tickLabelStyle: { fontSize: 12 }
              }]}
              series={[{
                dataKey: 'amount',
                label: 'Amount (₹)',
                color: '#10b981',
                valueFormatter: (value) => `₹${value?.toLocaleString()}`
              }]}
              height={300}
              margin={{ top: 20, bottom: 40, left: 80, right: 20 }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Split with Amounts */}
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={el => chartRefs.current[2] = el} className="h-64">
              <PieChart
                series={[{
                  data: paymentChartData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                }]}
                height={200}
                margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Daily Contributions - Configurable */}
        {dailyChartData.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Last {dailyContributionDays} Days Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={el => chartRefs.current[3] = el} className="h-64">
                <BarChart
                  dataset={dailyChartData}
                  xAxis={[{ 
                    scaleType: 'band', 
                    dataKey: 'date',
                    tickLabelStyle: { fontSize: 12 }
                  }]}
                  yAxis={[{ 
                    tickLabelStyle: { fontSize: 12 }
                  }]}
                  series={[{
                    dataKey: 'amount',
                    label: 'Daily Amount (₹)',
                    color: '#3b82f6',
                    valueFormatter: (value) => `₹${value?.toLocaleString()}`
                  }]}
                  height={200}
                  margin={{ top: 20, bottom: 40, left: 60, right: 20 }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
