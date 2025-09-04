import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

export class FirestoreService {
  constructor() {
    this.unsubscribes = new Map();
  }

  // Transactions
  async addTransaction(userId, transaction) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId,
        amount: parseFloat(transaction.amount),
        date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : Timestamp.fromDate(new Date(transaction.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw new Error('Failed to add transaction');
    }
  }

  async getTransactions(userId, limitCount = 100) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  async updateTransaction(transactionId, updates) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      await updateDoc(docRef, {
        ...updates,
        amount: updates.amount ? parseFloat(updates.amount) : undefined,
        date: updates.date instanceof Date ? Timestamp.fromDate(updates.date) : updates.date ? Timestamp.fromDate(new Date(updates.date)) : undefined,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  async deleteTransaction(transactionId) {
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  // Real-time listener for transactions
  subscribeToTransactions(userId, callback, limitCount = 100) {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        callback(transactions);
      },
      (error) => {
        console.error('Error in transactions subscription:', error);
        callback([]);
      }
    );

    this.unsubscribes.set(`transactions_${userId}`, unsubscribe);
    return unsubscribe;
  }

  // Bank Accounts
  async addBankAccount(userId, account) {
    try {
      const docRef = await addDoc(collection(db, 'bankAccounts'), {
        ...account,
        userId,
        balance: parseFloat(account.balance || 0),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding bank account:', error);
      throw new Error('Failed to add bank account');
    }
  }

  async getBankAccounts(userId) {
    try {
      const q = query(
        collection(db, 'bankAccounts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      throw new Error('Failed to fetch bank accounts');
    }
  }

  async updateBankAccount(accountId, updates) {
    try {
      const docRef = doc(db, 'bankAccounts', accountId);
      await updateDoc(docRef, {
        ...updates,
        balance: updates.balance ? parseFloat(updates.balance) : undefined,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating bank account:', error);
      throw new Error('Failed to update bank account');
    }
  }

  async deleteBankAccount(accountId) {
    try {
      await deleteDoc(doc(db, 'bankAccounts', accountId));
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw new Error('Failed to delete bank account');
    }
  }

  // Real-time listener for bank accounts
  subscribeToBankAccounts(userId, callback) {
    const q = query(
      collection(db, 'bankAccounts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const accounts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        callback(accounts);
      },
      (error) => {
        console.error('Error in bank accounts subscription:', error);
        callback([]);
      }
    );

    this.unsubscribes.set(`bankAccounts_${userId}`, unsubscribe);
    return unsubscribe;
  }

  // User Settings
  async updateUserSettings(userId, settings) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        settings: {
          ...settings,
          updatedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  async getUserSettings(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.settings || {};
      }
      return {};
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  }

  // Analytics and Statistics
  async getTransactionsByCategory(userId, startDate, endDate) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting transactions by category:', error);
      return [];
    }
  }

  async getMonthlyStats(userId, year, month) {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const transactions = await this.getTransactionsByCategory(userId, startDate, endDate);
      
      const stats = {
        totalIncome: 0,
        totalExpenses: 0,
        transactionCount: transactions.length,
        categories: {}
      };

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          stats.totalIncome += transaction.amount;
        } else {
          stats.totalExpenses += transaction.amount;
          stats.categories[transaction.category] = (stats.categories[transaction.category] || 0) + transaction.amount;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      return { totalIncome: 0, totalExpenses: 0, transactionCount: 0, categories: {} };
    }
  }

  // Batch operations
  async batchAddTransactions(userId, transactions) {
    try {
      const batch = writeBatch(db);
      const results = [];

      transactions.forEach(transaction => {
        const docRef = doc(collection(db, 'transactions'));
        batch.set(docRef, {
          ...transaction,
          userId,
          amount: parseFloat(transaction.amount),
          date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : Timestamp.fromDate(new Date(transaction.date)),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        results.push(docRef.id);
      });

      await batch.commit();
      return results;
    } catch (error) {
      console.error('Error batch adding transactions:', error);
      throw new Error('Failed to add transactions');
    }
  }

  // Cleanup subscriptions
  unsubscribeAll() {
    this.unsubscribes.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.unsubscribes.clear();
  }

  unsubscribe(key) {
    const unsubscribe = this.unsubscribes.get(key);
    if (typeof unsubscribe === 'function') {
      unsubscribe();
      this.unsubscribes.delete(key);
    }
  }
}

export const firestoreService = new FirestoreService();
