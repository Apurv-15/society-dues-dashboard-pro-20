
import { useState } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { ChartBar, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

export const CustomChartsPanel = () => {
  const { donations, selectedFinancialYear } = useDonationStore();
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [dataType, setDataType] = useState<'building' | 'payment' | 'monthly'>('building');
  
  const filteredDonations = donations.filter(d => d.financialYear === selectedFinancialYear);

  const generateChartData = () => {
    switch (dataType) {
      case 'building':
        return Array.from({ length: 19 }, (_, i) => {
          const buildingNo = i + 1;
          const amount = filteredDonations
            .filter(d => d.buildingNo === buildingNo)
            .reduce((sum, d) => sum + d.amount, 0);
          return {
            label: `Building ${buildingNo}`,
            value: amount,
            building: buildingNo,
            amount
          };
        }).filter(item => item.value > 0);

      case 'payment':
        const paymentData = filteredDonations.reduce((acc, d) => {
          acc[d.paymentMethod] = (acc[d.paymentMethod] || 0) + d.amount;
          return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(paymentData).map(([method, amount]) => ({
          label: method,
          value: amount,
          method,
          amount
        }));

      case 'monthly':
        const monthlyData = filteredDonations.reduce((acc, d) => {
          const month = new Date(d.date).toLocaleDateString('en-US', { month: 'short' });
          acc[month] = (acc[month] || 0) + d.amount;
          return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(monthlyData).map(([month, amount]) => ({
          label: month,
          value: amount,
          month,
          amount
        }));

      default:
        return [];
    }
  };

  const chartData = generateChartData();

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected criteria
        </div>
      );
    }

    const commonProps = {
      height: 400,
      margin: { top: 20, bottom: 60, left: 80, right: 20 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            dataset={chartData}
            xAxis={[{ 
              scaleType: 'band' as const, 
              dataKey: dataType === 'building' ? 'building' : 'label',
              tickLabelStyle: { fontSize: 12 }
            }]}
            yAxis={[{ 
              tickLabelStyle: { fontSize: 12 }
            }]}
            series={[{
              dataKey: 'value',
              label: 'Amount (₹)',
              color: '#3b82f6',
              valueFormatter: (value) => `₹${value?.toLocaleString()}`
            }]}
            {...commonProps}
          />
        );

      case 'pie':
        return (
          <PieChart
            series={[{
              data: chartData.map(item => ({
                label: item.label,
                value: item.value
              })),
              highlightScope: { fade: 'global', highlight: 'item' },
            }]}
            height={400}
            margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
        );

      case 'line':
        return (
          <LineChart
            dataset={chartData}
            xAxis={[{ 
              scaleType: 'point' as const, 
              dataKey: 'label',
              tickLabelStyle: { fontSize: 12 }
            }]}
            yAxis={[{ 
              tickLabelStyle: { fontSize: 12 }
            }]}
            series={[{
              dataKey: 'value',
              label: 'Amount (₹)',
              color: '#10b981',
              valueFormatter: (value) => `₹${value?.toLocaleString()}`
            }]}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            Custom Chart Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(value: 'bar' | 'pie' | 'line') => setChartType(value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <ChartBar className="w-4 h-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Type</Label>
              <Select value={dataType} onValueChange={(value: 'building' | 'payment' | 'monthly') => setDataType(value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="building">Building-wise</SelectItem>
                  <SelectItem value="payment">Payment Method</SelectItem>
                  <SelectItem value="monthly">Monthly Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  // Force re-render
                  setChartType(chartType);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Generate Chart
              </Button>
            </div>
          </div>

          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
