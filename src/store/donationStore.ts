import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { firebaseService } from '@/services/firebaseService';

export interface Donation {
  id: string;
  name?: string;
  buildingNo?: number;
  flatNo?: string;
  contributorName?: string;
  isExternal?: boolean;
  amount: number;
  paymentMethod: 'Cash' | 'UPI';
  date: string;
  financialYear: string;
  receivedBy?: string;
  editHistory?: EditHistoryEntry[];
}

export interface EditHistoryEntry {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  editedAt: string;
  editedBy: string;
  changes: Record<string, { old: any; new: any }>;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI';
  date: string;
  financialYear: string;
  receipt?: string;
  expenseBy?: string;
}

export interface ExpenseSource {
  id: string;
  name: string;
}

interface DonationStore {
  donations: Donation[];
  expenses: Expense[];
  expenseSources: ExpenseSource[];
  selectedFinancialYear: string;
  dailyContributionDays: number;
  isLoading: boolean;
  
  // Firebase sync methods
  initializeFirebase: () => Promise<void>;
  
  // Donation methods
  addDonation: (donation: Omit<Donation, 'id' | 'financialYear'>) => Promise<boolean>;
  updateDonation: (id: string, donation: Partial<Donation>) => Promise<boolean>;
  deleteDonation: (id: string) => Promise<void>;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Expense source methods
  addExpenseSource: (source: Omit<ExpenseSource, 'id'>) => Promise<void>;
  updateExpenseSource: (id: string, source: Partial<ExpenseSource>) => Promise<void>;
  deleteExpenseSource: (id: string) => Promise<void>;
  
  // Utility methods
  setSelectedFinancialYear: (year: string) => void;
  setDailyContributionDays: (days: number) => void;
  getFinancialYears: () => string[];
  getCurrentFinancialYear: () => string;
  getTotalIncome: (financialYear?: string) => number;
  getTotalExpenses: (financialYear?: string) => number;
  getBalance: (financialYear?: string) => number;
  
  // New methods for missing functionality
  exportToExcel: () => void;
  getEditHistory: (donationId: string) => EditHistoryEntry[];
  getDonationByFlat: (buildingNo: number, flatNo: string) => Donation | null;
}

const getCurrentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Financial year starts from April (month 3, 0-indexed)
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const useDonationStore = create<DonationStore>()(
  persist(
    (set, get) => ({
      donations: [],
      expenses: [],
      expenseSources: [
        { id: '1', name: 'Society Fund' },
        { id: '2', name: 'Maintenance Fund' },
        { id: '3', name: 'Emergency Fund' }
      ],
      selectedFinancialYear: getCurrentFinancialYear(),
      dailyContributionDays: 7,
      isLoading: false,

      initializeFirebase: async () => {
        try {
          console.log('Initializing Firebase...');
          set({ isLoading: true });
          
          // Initialize with default expense sources if none exist
          const existingSources = await firebaseService.getExpenseSources();
          console.log('Existing expense sources:', existingSources.length);
          
          if (existingSources.length === 0) {
            console.log('Creating default expense sources...');
            await firebaseService.addExpenseSource({ name: 'Society Fund' });
            await firebaseService.addExpenseSource({ name: 'Maintenance Fund' });
            await firebaseService.addExpenseSource({ name: 'Emergency Fund' });
          }

          // Set up real-time listeners
          console.log('Setting up real-time listeners...');
          firebaseService.subscribeToDonations((donations) => {
            console.log('Donations updated from Firebase:', donations.length);
            set({ donations });
          });

          firebaseService.subscribeToExpenses((expenses) => {
            console.log('Expenses updated from Firebase:', expenses.length);
            set({ expenses });
          });

          firebaseService.subscribeToExpenseSources((expenseSources) => {
            console.log('Expense sources updated from Firebase:', expenseSources.length);
            set({ expenseSources });
          });

          console.log('Firebase initialization completed');
          set({ isLoading: false });
        } catch (error) {
          console.error('Firebase initialization error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      addDonation: async (donation) => {
        const { donations, selectedFinancialYear } = get();
        
        console.log('Adding donation:', donation);
        console.log('Current donations:', donations.length);
        console.log('Selected financial year:', selectedFinancialYear);
        
        // Check for duplicate flat (for internal contributions)
        if (!donation.isExternal && donation.flatNo) {
          const existingDonation = donations.find(d => 
            !d.isExternal && 
            d.flatNo === donation.flatNo && 
            d.financialYear === selectedFinancialYear
          );
          if (existingDonation) {
            console.log('Duplicate flat found:', existingDonation);
            return false;
          }
        }

        try {
          const newDonation = {
            ...donation,
            financialYear: selectedFinancialYear,
            editHistory: [{
              id: Date.now().toString(),
              action: 'created' as const,
              editedAt: new Date().toISOString(),
              editedBy: 'Admin',
              changes: {}
            }]
          };
          
          console.log('Adding donation to Firebase:', newDonation);
          const id = await firebaseService.addDonation(newDonation);
          console.log('Donation added successfully with ID:', id);
          return true;
        } catch (error) {
          console.error('Error adding donation:', error);
          throw error;
        }
      },

      updateDonation: async (id, updatedDonation) => {
        const { donations, selectedFinancialYear } = get();
        const existingDonation = donations.find(d => d.id === id);
        
        if (!existingDonation) {
          console.log('Donation not found for update:', id);
          return false;
        }
        
        // Check for duplicate flat if updating flat number
        if (updatedDonation.flatNo && !updatedDonation.isExternal) {
          const duplicateCheck = donations.find(d => 
            d.id !== id &&
            !d.isExternal && 
            d.flatNo === updatedDonation.flatNo && 
            d.financialYear === selectedFinancialYear
          );
          if (duplicateCheck) {
            console.log('Duplicate flat found during update:', duplicateCheck);
            return false;
          }
        }

        try {
          // Create edit history entry
          const changes: Record<string, { old: any; new: any }> = {};
          Object.keys(updatedDonation).forEach(key => {
            const oldValue = (existingDonation as any)[key];
            const newValue = (updatedDonation as any)[key];
            if (oldValue !== newValue) {
              changes[key] = { old: oldValue, new: newValue };
            }
          });

          const editHistoryEntry: EditHistoryEntry = {
            id: Date.now().toString(),
            action: 'updated',
            editedAt: new Date().toISOString(),
            editedBy: 'Admin',
            changes
          };

          await firebaseService.updateDonation(id, {
            ...updatedDonation,
            editHistory: [...(existingDonation.editHistory || []), editHistoryEntry]
          });
          
          return true;
        } catch (error) {
          console.error('Error updating donation:', error);
          throw error;
        }
      },

      deleteDonation: async (id) => {
        try {
          await firebaseService.deleteDonation(id);
        } catch (error) {
          console.error('Error deleting donation:', error);
          throw error;
        }
      },

      addExpense: async (expense) => {
        try {
          await firebaseService.addExpense(expense);
        } catch (error) {
          console.error('Error adding expense:', error);
          throw error;
        }
      },

      updateExpense: async (id, updatedExpense) => {
        try {
          await firebaseService.updateExpense(id, updatedExpense);
        } catch (error) {
          console.error('Error updating expense:', error);
          throw error;
        }
      },

      deleteExpense: async (id) => {
        try {
          await firebaseService.deleteExpense(id);
        } catch (error) {
          console.error('Error deleting expense:', error);
          throw error;
        }
      },

      addExpenseSource: async (source) => {
        try {
          await firebaseService.addExpenseSource(source);
        } catch (error) {
          console.error('Error adding expense source:', error);
          throw error;
        }
      },

      updateExpenseSource: async (id, updatedSource) => {
        try {
          await firebaseService.updateExpenseSource(id, updatedSource);
        } catch (error) {
          console.error('Error updating expense source:', error);
          throw error;
        }
      },

      deleteExpenseSource: async (id) => {
        try {
          await firebaseService.deleteExpenseSource(id);
        } catch (error) {
          console.error('Error deleting expense source:', error);
          throw error;
        }
      },

      setSelectedFinancialYear: (year) => {
        set({ selectedFinancialYear: year });
      },

      setDailyContributionDays: (days) => {
        set({ dailyContributionDays: Math.max(1, Math.min(30, days)) });
      },

      getFinancialYears: () => {
        const { donations, expenses } = get();
        const allYears = new Set([
          ...donations.map(d => d.financialYear),
          ...expenses.map(e => e.financialYear),
          getCurrentFinancialYear()
        ]);
        return Array.from(allYears).sort().reverse();
      },

      getCurrentFinancialYear,

      getTotalIncome: (financialYear) => {
        const { donations, selectedFinancialYear } = get();
        const year = financialYear || selectedFinancialYear;
        return donations
          .filter(d => d.financialYear === year)
          .reduce((sum, d) => sum + d.amount, 0);
      },

      getTotalExpenses: (financialYear) => {
        const { expenses, selectedFinancialYear } = get();
        const year = financialYear || selectedFinancialYear;
        return expenses
          .filter(e => e.financialYear === year)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getBalance: (financialYear) => {
        const { getTotalIncome, getTotalExpenses } = get();
        const year = financialYear;
        return getTotalIncome(year) - getTotalExpenses(year);
      },

      exportToExcel: () => {
        const { donations, selectedFinancialYear } = get();
        const filteredDonations = donations.filter(d => d.financialYear === selectedFinancialYear);
        
        const exportData = filteredDonations.map(donation => ({
          'Type': donation.isExternal ? 'External' : 'Internal',
          'Building': donation.isExternal ? 'N/A' : donation.buildingNo,
          'Flat/Contributor': donation.isExternal ? donation.contributorName : donation.flatNo,
          'Amount': donation.amount,
          'Payment Method': donation.paymentMethod,
          'Date': donation.date,
          'Received By': donation.receivedBy || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
        XLSX.writeFile(workbook, `donations_${selectedFinancialYear}.xlsx`);
      },

      getEditHistory: (donationId) => {
        const { donations } = get();
        const donation = donations.find(d => d.id === donationId);
        return donation?.editHistory || [];
      },

      getDonationByFlat: (buildingNo, flatNo) => {
        const { donations, selectedFinancialYear } = get();
        return donations.find(d => 
          !d.isExternal && 
          d.buildingNo === buildingNo && 
          d.flatNo === `${buildingNo}/${flatNo}` &&
          d.financialYear === selectedFinancialYear
        ) || null;
      },
    }),
    {
      name: 'donation-storage',
      partialize: (state) => ({
        selectedFinancialYear: state.selectedFinancialYear,
        dailyContributionDays: state.dailyContributionDays,
      }),
    }
  )
);
