import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Income and Expense form states
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadTransactions();
    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadTransactions();
    };
    window.addEventListener('budgetDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('budgetDataUpdated', handleDataUpdate);
  }, []);

  const loadTransactions = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('budgetMasterData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  const saveData = (newData) => {
    localStorage.setItem('budgetMasterData', JSON.stringify(newData));
    setData(newData);
    // Trigger a custom event to update other components
    window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
  };

  const handleAddIncome = (e) => {
    e.preventDefault();
    const { source, amount } = incomeForm;

    if (!source.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid income source and amount.');
      return;
    }

    const income = {
      id: Date.now(),
      source: source.trim(),
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString(),
      type: 'income'
    };

    const newData = {
      ...data,
      income: [...data.income, income]
    };

    saveData(newData);
    setIncomeForm({ source: '', amount: '' });
    toast.success('Income added successfully!');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const { category, amount, description } = expenseForm;

    if (!category || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a category and enter a valid amount.');
      return;
    }

    const expense = {
      id: Date.now(),
      category,
      amount: parseFloat(amount),
      description: description.trim() || category,
      date: new Date().toLocaleDateString(),
      type: 'expense'
    };

    const newData = {
      ...data,
      expenses: [...data.expenses, expense]
    };

    saveData(newData);
    setExpenseForm({ category: '', amount: '', description: '' });
    toast.success('Expense added successfully!');
  };

  const handleDeleteTransaction = (type, id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const newData = {
        ...data,
        [type]: data[type].filter(item => item.id !== id)
      };
      saveData(newData);
      toast.success('Transaction deleted successfully!');
    }
  };

  // Combine all transactions for display
  const allTransactions = [
    ...data.income.map(item => ({...item, type: 'income'})),
    ...data.expenses.map(item => ({...item, type: 'expense'}))
  ].sort((a, b) => b.id - a.id);

  // Filter transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      (transaction.type === 'income' ? transaction.source : transaction.description)
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || transaction.category === filterCategory;
    const matchesType = filterType === '' || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const expenseCategories = [
    'Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Travel', 'Insurance', 
    'Debt Payment', 'Savings', 'Investment', 'Charity', 'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your income and expenses
          </p>
        </div>
      </div>

      {/* Add Income Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
          <TrendingUp className="mr-2 text-green-500 h-5 w-5" />
          Add Income
        </h2>
        
        <form onSubmit={handleAddIncome} className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Income Source (e.g., Salary, Freelance)" 
              value={incomeForm.source}
              onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
            <input 
              type="number" 
              placeholder="Amount" 
              step="0.01"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors mobile-touch-button text-sm sm:text-base"
          >
            <TrendingUp className="inline mr-2 h-4 w-4" />
            Add Income
          </button>
        </form>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.income.map(income => (
            <div key={income.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700 transition-colors duration-300">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{income.source}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{income.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-green-600 dark:text-green-400">+{formatCurrency(income.amount)}</span>
                <button 
                  onClick={() => handleDeleteTransaction('income', income.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {data.income.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No income entries yet</p>
          )}
        </div>
      </div>

      {/* Add Expense Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
          <TrendingDown className="mr-2 text-red-500 h-5 w-5" />
          Add Expense
        </h2>
        
        <form onSubmit={handleAddExpense} className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <select 
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            >
              <option value="">Select Category</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Amount" 
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
            <input 
              type="text" 
              placeholder="Description (optional)" 
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors mobile-touch-button text-sm sm:text-base"
          >
            <TrendingDown className="inline mr-2 h-4 w-4" />
            Add Expense
          </button>
        </form>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.expenses.map(expense => (
            <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700 transition-colors duration-300">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{expense.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{expense.category} • {expense.date}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(expense.amount)}</span>
                <button 
                  onClick={() => handleDeleteTransaction('expenses', expense.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {data.expenses.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No expense entries yet</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* All Transactions List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Transactions</h3>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              {searchTerm || filterCategory || filterType ? (
                <Search className="h-12 w-12 mx-auto" />
              ) : (
                <TrendingUp className="h-12 w-12 mx-auto" />
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterCategory || filterType ? 'No transactions match your filters' : 'No transactions yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {searchTerm || filterCategory || filterType ? 'Try adjusting your search criteria' : 'Start by adding some income or expenses'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.map(transaction => {
              const isIncome = transaction.type === 'income';
              return (
                <div key={transaction.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                  isIncome 
                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                } transition-colors duration-300`}>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {isIncome ? transaction.source : transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isIncome ? 'Income' : transaction.category} • {transaction.date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(transaction.type === 'income' ? 'income' : 'expenses', transaction.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
