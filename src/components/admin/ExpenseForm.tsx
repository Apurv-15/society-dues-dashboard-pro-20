
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDonationStore } from '@/store/donationStore';
import { toast } from 'sonner';
import { Receipt, Plus, Settings } from 'lucide-react';

const expenseCategories = [
  'Ganpati',
  'Holi', 
  'Dahi Handi',
  'Independence Day',
  'Republic Day',
  'Navratri',
  'Maintenance',
  'Utilities',
  'Security',
  'Cleaning',
  'Repairs',
  'Insurance',
  'Legal',
  'Administrative',
  'Garden/Landscaping',
  'Equipment',
  'Other'
];

export const ExpenseForm = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseBy, setExpenseBy] = useState('');
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  
  const { addExpense, getCurrentFinancialYear, expenseSources, addExpenseSource } = useDonationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !category || !amount || !expenseBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addExpense({
      description: description.trim(),
      category,
      amount: expenseAmount,
      paymentMethod,
      date,
      expenseBy,
      financialYear: getCurrentFinancialYear(),
    });

    // Reset form
    setDescription('');
    setCategory('');
    setAmount('');
    setPaymentMethod('Cash');
    setDate(new Date().toISOString().split('T')[0]);
    setExpenseBy('');
    
    toast.success('Expense added successfully!');
  };

  const handleAddSource = () => {
    if (!newSourceName.trim()) {
      toast.error('Please enter a source name');
      return;
    }

    addExpenseSource({ name: newSourceName.trim() });
    setNewSourceName('');
    setIsSourceDialogOpen(false);
    toast.success('Expense source added successfully!');
  };

  return (
    <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Receipt className="w-5 h-5" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter expense description"
                className="bg-white/70 border-white/30 mt-1 min-h-[80px] text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-white/70 border-white/30 mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 max-h-[200px]">
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="expense-by" className="text-sm font-medium">Expense Made By *</Label>
              <div className="flex gap-2 mt-1">
                <Select value={expenseBy} onValueChange={setExpenseBy} required>
                  <SelectTrigger className="bg-white/70 border-white/30 flex-1">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30">
                    {expenseSources.map(source => (
                      <SelectItem key={source.id} value={source.name} className="text-sm">{source.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" className="bg-white/50 px-3">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-xl border-white/30 max-w-sm mx-4">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Add Expense Source</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-source" className="text-sm font-medium">Source Name</Label>
                        <Input
                          id="new-source"
                          value={newSourceName}
                          onChange={(e) => setNewSourceName(e.target.value)}
                          placeholder="Enter source name"
                          className="bg-white/70 border-white/30 mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsSourceDialogOpen(false)} className="text-sm">
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddSource} className="text-sm">
                          Add Source
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="bg-white/70 border-white/30 mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="payment-method" className="text-sm font-medium">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: 'Cash' | 'UPI') => setPaymentMethod(value)}>
                <SelectTrigger className="bg-white/70 border-white/30 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30">
                  <SelectItem value="Cash" className="text-sm">Cash</SelectItem>
                  <SelectItem value="UPI" className="text-sm">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/70 border-white/30 mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm sm:text-base py-2 sm:py-2.5">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
