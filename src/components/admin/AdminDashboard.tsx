import { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { StatsCards } from './StatsCards';
import { ContributionForm } from './ContributionForm';
import { DonationTable } from './DonationTable';
import { AnalyticsPanel } from './AnalyticsPanel';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseTable } from './ExpenseTable';
import { BalanceSheet } from './BalanceSheet';
import { UserManagement } from './UserManagement';
import { EventRegistrationManagement } from './EventRegistrationManagement';
import { EventManagement } from './EventManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useDonationStore } from '@/store/donationStore';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Settings, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    logout
  } = useAuthStore();
  const {
    selectedFinancialYear,
    setSelectedFinancialYear,
    getFinancialYears,
    dailyContributionDays,
    setDailyContributionDays
  } = useDonationStore();
  const financialYears = getFinancialYears();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempDays, setTempDays] = useState(dailyContributionDays);
  const handleSaveSettings = () => {
    setDailyContributionDays(tempDays);
    setIsSettingsOpen(false);
  };
  const handleGoHome = () => {
    logout();
    window.location.reload();
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white/60 to-green-50/80 backdrop-blur-xl">
      <AdminHeader />

      <header className="bg-white/30 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage users, contributions and analytics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Go to Home Page</span>
              </Button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dashboard Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="days">Recent Daily Contributions (Days)</Label>
                      <Input id="days" type="number" min="1" max="30" value={tempDays} onChange={e => setTempDays(parseInt(e.target.value) || 7)} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSettings}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600">Financial Year</p>
                <p className="text-sm sm:text-base font-semibold text-gray-800">{selectedFinancialYear}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <Card className="mb-6 border-0 shadow-lg bg-white/20 backdrop-blur-xl border border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <Label htmlFor="financial-year" className="text-sm font-medium text-gray-700">
                  Financial Year:
                </Label>
              </div>
              <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                <SelectTrigger className="w-full sm:w-48 bg-white/50 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Select financial year" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                  {financialYears.map(year => <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-8 min-w-[800px] sm:min-w-0 bg-white/30 backdrop-blur-xl border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Users
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Events
              </TabsTrigger>
              <TabsTrigger value="event-manage" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Manage Events
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">Donation</TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Expenses
              </TabsTrigger>
              <TabsTrigger value="balance" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Balance
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/70 data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-xs sm:text-sm">
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ContributionForm />
              <AnalyticsPanel compact />
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="events">
            <EventRegistrationManagement />
          </TabsContent>
          
          <TabsContent value="event-manage">
            <EventManagement />
          </TabsContent>
          
          <TabsContent value="manage">
            <DonationTable />
          </TabsContent>
          
          <TabsContent value="expenses" className="space-y-6">
            <ExpenseForm />
            <ExpenseTable />
          </TabsContent>
          
          <TabsContent value="balance">
            <BalanceSheet />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};