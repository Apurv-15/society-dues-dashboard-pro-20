import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Donation, Expense, ExpenseSource } from "@/store/donationStore";

export const firebaseService = {
  // Generic document methods
  async getDocument(collectionName: string, documentId: string): Promise<any> {
    try {
      console.log(`Getting document from ${collectionName}/${documentId}`);
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Document found:', docSnap.data());
        return docSnap.data();
      } else {
        console.log('Document does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  async addDocument(collectionName: string, data: any, documentId?: string): Promise<string> {
    try {
      console.log(`Adding document to ${collectionName}:`, data);
      
      if (documentId) {
        // Use setDoc for custom document ID
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, {
          ...data,
          createdAt: Timestamp.now()
        });
        console.log('Document added successfully with custom ID:', documentId);
        return documentId;
      } else {
        // Use addDoc for auto-generated ID
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: Timestamp.now()
        });
        console.log('Document added successfully with ID:', docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // Donations
  async addDonation(donation: Omit<Donation, 'id'>): Promise<string> {
    try {
      console.log('Adding donation to Firestore:', donation);
      
      // Clean the donation data - remove undefined values and ensure proper structure
      const cleanedDonation: any = {
        amount: Number(donation.amount),
        date: donation.date,
        paymentMethod: donation.paymentMethod,
        financialYear: donation.financialYear,
        createdAt: Timestamp.now(),
      };

      // Handle conditional fields properly - only add if they have values
      if (donation.isExternal) {
        cleanedDonation.isExternal = true;
        if (donation.contributorName) {
          cleanedDonation.contributorName = donation.contributorName;
        }
      } else {
        cleanedDonation.isExternal = false;
        if (donation.buildingNo !== undefined) {
          cleanedDonation.buildingNo = Number(donation.buildingNo);
        }
        if (donation.flatNo) {
          cleanedDonation.flatNo = donation.flatNo;
        }
      }

      // Only add receivedBy if it exists and is not empty
      if (donation.receivedBy && donation.receivedBy.trim() !== '') {
        cleanedDonation.receivedBy = donation.receivedBy.trim();
      }

      // Only add editHistory if it exists
      if (donation.editHistory && donation.editHistory.length > 0) {
        cleanedDonation.editHistory = donation.editHistory;
      }
      
      console.log('Cleaned donation data:', cleanedDonation);
      
      const docRef = await addDoc(collection(db, "donations"), cleanedDonation);
      console.log('Donation added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding donation to Firestore:', error);
      throw error;
    }
  },

  async updateDonation(id: string, updates: Partial<Donation>): Promise<void> {
    try {
      console.log('Updating donation in Firestore:', id, updates);
      
      // Clean the updates data - remove undefined values
      const cleanedUpdates: any = {};
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedUpdates[key] = value;
        }
      });
      
      const docRef = doc(db, "donations", id);
      await updateDoc(docRef, {
        ...cleanedUpdates,
        updatedAt: Timestamp.now()
      });
      console.log('Donation updated successfully');
    } catch (error) {
      console.error('Error updating donation in Firestore:', error);
      throw error;
    }
  },

  async deleteDonation(id: string): Promise<void> {
    try {
      console.log('Deleting donation from Firestore:', id);
      const docRef = doc(db, "donations", id);
      await deleteDoc(docRef);
      console.log('Donation deleted successfully');
    } catch (error) {
      console.error('Error deleting donation from Firestore:', error);
      throw error;
    }
  },

  async getDonations(): Promise<Donation[]> {
    try {
      console.log('Getting donations from Firestore');
      const querySnapshot = await getDocs(collection(db, "donations"));
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
      console.log('Donations retrieved successfully:', donations.length);
      return donations;
    } catch (error) {
      console.error('Error getting donations from Firestore:', error);
      throw error;
    }
  },

  subscribeToDonations(callback: (donations: Donation[]) => void) {
    console.log('Setting up real-time listener for donations');
    return onSnapshot(
      collection(db, "donations"), 
      (snapshot) => {
        console.log('Donations snapshot received, docs:', snapshot.docs.length);
        const donations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Donation[];
        callback(donations);
      },
      (error) => {
        console.error('Error in donations snapshot listener:', error);
      }
    );
  },

  // Expenses
  async addExpense(expense: Omit<Expense, 'id'>): Promise<string> {
    try {
      console.log('Adding expense to Firestore:', expense);
      
      // Clean the expense data
      const cleanedExpense: any = {
        amount: Number(expense.amount),
        date: expense.date,
        category: expense.category,
        description: expense.description,
        financialYear: expense.financialYear,
        createdAt: Timestamp.now(),
      };
      
      // Only add optional fields if they exist and are not empty
      if (expense.receipt && expense.receipt.trim() !== '') {
        cleanedExpense.receipt = expense.receipt.trim();
      }
      if (expense.expenseBy && expense.expenseBy.trim() !== '') {
        cleanedExpense.expenseBy = expense.expenseBy.trim();
      }
      
      const docRef = await addDoc(collection(db, "expenses"), cleanedExpense);
      console.log('Expense added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense to Firestore:', error);
      throw error;
    }
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    try {
      console.log('Updating expense in Firestore:', id, updates);
      
      // Clean the updates data
      const cleanedUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedUpdates[key] = value;
        }
      });
      
      const docRef = doc(db, "expenses", id);
      await updateDoc(docRef, {
        ...cleanedUpdates,
        updatedAt: Timestamp.now()
      });
      console.log('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense in Firestore:', error);
      throw error;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      console.log('Deleting expense from Firestore:', id);
      const docRef = doc(db, "expenses", id);
      await deleteDoc(docRef);
      console.log('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense from Firestore:', error);
      throw error;
    }
  },

  async getExpenses(): Promise<Expense[]> {
    try {
      console.log('Getting expenses from Firestore');
      const querySnapshot = await getDocs(collection(db, "expenses"));
      const expenses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      console.log('Expenses retrieved successfully:', expenses.length);
      return expenses;
    } catch (error) {
      console.error('Error getting expenses from Firestore:', error);
      throw error;
    }
  },

  subscribeToExpenses(callback: (expenses: Expense[]) => void) {
    console.log('Setting up real-time listener for expenses');
    return onSnapshot(
      collection(db, "expenses"), 
      (snapshot) => {
        console.log('Expenses snapshot received, docs:', snapshot.docs.length);
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Expense[];
        callback(expenses);
      },
      (error) => {
        console.error('Error in expenses snapshot listener:', error);
      }
    );
  },

  // Expense Sources
  async addExpenseSource(source: Omit<ExpenseSource, 'id'>): Promise<string> {
    try {
      console.log('Adding expense source to Firestore:', source);
      const docRef = await addDoc(collection(db, "expenseSources"), {
        ...source,
        createdAt: Timestamp.now()
      });
      console.log('Expense source added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense source to Firestore:', error);
      throw error;
    }
  },

  async updateExpenseSource(id: string, updates: Partial<ExpenseSource>): Promise<void> {
    try {
      console.log('Updating expense source in Firestore:', id, updates);
      const docRef = doc(db, "expenseSources", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('Expense source updated successfully');
    } catch (error) {
      console.error('Error updating expense source in Firestore:', error);
      throw error;
    }
  },

  async deleteExpenseSource(id: string): Promise<void> {
    try {
      console.log('Deleting expense source from Firestore:', id);
      const docRef = doc(db, "expenseSources", id);
      await deleteDoc(docRef);
      console.log('Expense source deleted successfully');
    } catch (error) {
      console.error('Error deleting expense source from Firestore:', error);
      throw error;
    }
  },

  async getExpenseSources(): Promise<ExpenseSource[]> {
    try {
      console.log('Getting expense sources from Firestore');
      const querySnapshot = await getDocs(collection(db, "expenseSources"));
      const sources = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExpenseSource[];
      console.log('Expense sources retrieved successfully:', sources.length);
      return sources;
    } catch (error) {
      console.error('Error getting expense sources from Firestore:', error);
      throw error;
    }
  },

  subscribeToExpenseSources(callback: (sources: ExpenseSource[]) => void) {
    console.log('Setting up real-time listener for expense sources');
    return onSnapshot(
      collection(db, "expenseSources"), 
      (snapshot) => {
        console.log('Expense sources snapshot received, docs:', snapshot.docs.length);
        const sources = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ExpenseSource[];
        callback(sources);
      },
      (error) => {
        console.error('Error in expense sources snapshot listener:', error);
      }
    );
  }
};
