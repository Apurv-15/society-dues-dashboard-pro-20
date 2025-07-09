
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDonationStore } from '@/store/donationStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export const BalanceSheet = () => {
  const { 
    selectedFinancialYear, 
    getTotalIncome, 
    getTotalExpenses, 
    getBalance,
    donations,
    expenses,
    getFinancialYears
  } = useDonationStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const financialYears = getFinancialYears();

  // Yearly comparison data
  const yearlyData = financialYears.slice(0, 3).map(year => ({
    year: year.split('-')[0],
    income: getTotalIncome(year),
    expenses: getTotalExpenses(year),
    balance: getBalance(year)
  }));

  // Category-wise expenses
  const expensesByCategory = expenses
    .filter(e => e.financialYear === selectedFinancialYear)
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Payment method breakdown
  const paymentBreakdown = [
    {
      name: 'Income - Cash',
      value: donations.filter(d => d.financialYear === selectedFinancialYear && d.paymentMethod === 'Cash')
        .reduce((sum, d) => sum + d.amount, 0)
    },
    {
      name: 'Income - UPI',
      value: donations.filter(d => d.financialYear === selectedFinancialYear && d.paymentMethod === 'UPI')
        .reduce((sum, d) => sum + d.amount, 0)
    },
    {
      name: 'Expenses - Cash',
      value: expenses.filter(e => e.financialYear === selectedFinancialYear && e.paymentMethod === 'Cash')
        .reduce((sum, e) => sum + e.amount, 0)
    },
    {
      name: 'Expenses - UPI',
      value: expenses.filter(e => e.financialYear === selectedFinancialYear && e.paymentMethod === 'UPI')
        .reduce((sum, e) => sum + e.amount, 0)
    }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Total Income</p>
                <p className="text-2xl font-bold text-green-900">₹{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg ${balance >= 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Net Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>₹{balance.toLocaleString()}</p>
              </div>
              <DollarSign className={`w-8 h-8 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Expense Ratio</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0'}%
                </p>
              </div>
              <Calculator className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Comparison */}
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Yearly Financial Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category-wise Expenses */}
        <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
