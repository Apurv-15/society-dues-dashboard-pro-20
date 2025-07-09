
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDonationStore } from '@/store/donationStore';
import { toast } from 'sonner';
import { Edit, Trash2, Receipt, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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

export const ExpenseTable = () => {
  const { expenses, selectedFinancialYear, updateExpense, deleteExpense, expenseSources } = useDonationStore();
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredExpenses = expenses.filter(e => e.financialYear === selectedFinancialYear);

  const handleEdit = (expense: any) => {
    setEditingExpense({ ...expense });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingExpense.description.trim() || !editingExpense.category || !editingExpense.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(editingExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    updateExpense(editingExpense.id, {
      ...editingExpense,
      amount
    });
    
    setIsEditOpen(false);
    setEditingExpense(null);
    toast.success('Expense updated successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      toast.success('Expense deleted successfully!');
    }
  };

  const exportToExcel = () => {
    const data = filteredExpenses.map(expense => ({
      Date: expense.date,
      Description: expense.description,
      Category: expense.category,
      Amount: expense.amount,
      'Payment Method': expense.paymentMethod,
      'Expense By': expense.expenseBy || 'N/A',
      'Financial Year': expense.financialYear
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `expenses_${selectedFinancialYear}.xlsx`);
    toast.success('Excel file downloaded successfully!');
  };

  return (
    <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Receipt className="w-5 h-5" />
            Expenses ({selectedFinancialYear})
          </CardTitle>
          <Button onClick={exportToExcel} variant="outline" className="bg-white/50 text-sm w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm min-w-[120px]">Description</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Category</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Payment</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Expense By</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">{expense.date}</TableCell>
                      <TableCell className="text-xs sm:text-sm max-w-[100px] sm:max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">{expense.category}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                          expense.paymentMethod === 'Cash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {expense.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm max-w-[80px] sm:max-w-none truncate">
                        {expense.expenseBy || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                        No expenses found for {selectedFinancialYear}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-white/30 max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Edit Expense</DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingExpense.description}
                    onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
                    className="bg-white/70 border-white/30 mt-1 min-h-[60px]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category" className="text-sm font-medium">Category</Label>
                    <Select 
                      value={editingExpense.category} 
                      onValueChange={(value) => setEditingExpense({...editingExpense, category: value})}
                    >
                      <SelectTrigger className="bg-white/70 border-white/30 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 max-h-[200px]">
                        {expenseCategories.map(cat => (
                          <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-expense-by" className="text-sm font-medium">Expense By</Label>
                    <Select 
                      value={editingExpense.expenseBy || ''} 
                      onValueChange={(value) => setEditingExpense({...editingExpense, expenseBy: value})}
                    >
                      <SelectTrigger className="bg-white/70 border-white/30 mt-1">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30">
                        {expenseSources.map(source => (
                          <SelectItem key={source.id} value={source.name} className="text-sm">{source.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-amount" className="text-sm font-medium">Amount</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                      className="bg-white/70 border-white/30 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-payment" className="text-sm font-medium">Payment Method</Label>
                    <Select 
                      value={editingExpense.paymentMethod} 
                      onValueChange={(value) => setEditingExpense({...editingExpense, paymentMethod: value})}
                    >
                      <SelectTrigger className="bg-white/70 border-white/30 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30">
                        <SelectItem value="Cash" className="text-sm">Cash</SelectItem>
                        <SelectItem value="UPI" className="text-sm">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-date" className="text-sm font-medium">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                    className="bg-white/70 border-white/30 mt-1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="text-sm">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
