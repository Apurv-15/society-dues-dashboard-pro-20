
import { useDonationStore } from '@/store/donationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export const StatsCards = () => {
  const { donations, selectedFinancialYear } = useDonationStore();

  // Filter donations by selected financial year
  const filteredDonations = donations.filter(d => d.financialYear === selectedFinancialYear);

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const avgDonation = filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0;
  
  // Calculate this week's amount (last 7 days)
  const thisWeekAmount = filteredDonations.filter(d => {
    const donationDate = new Date(d.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return donationDate >= weekAgo;
  }).reduce((sum, d) => sum + d.amount, 0);

  const stats = [
    {
      title: 'Total Collected',
      value: `₹${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      iconBg: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Contributions',
      value: filteredDonations.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      iconBg: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Average Donation',
      value: `₹${Math.round(avgDonation).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      iconBg: 'from-purple-500 to-purple-600',
    },
    {
      title: 'This Week',
      value: `₹${thisWeekAmount.toLocaleString()}`,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'from-orange-500/20 to-orange-600/20',
      iconBg: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg bg-white/30 backdrop-blur-xl border border-white/20 hover:bg-white/40 transition-all duration-300 hover:shadow-xl hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${stat.bgColor} rounded-full mt-2`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
