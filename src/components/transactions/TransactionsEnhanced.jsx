import React, { useState, useEffect } from 'react';
import { Search, Trash2, TrendingUp, TrendingDown, Filter, Plus, Calendar, DollarSign, Tag, FileText, Download, Upload, X, Edit3, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    source: '',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTransactions();
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
    window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const { type, source, category, amount, description, date } = transactionForm;

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (type === 'income' && !source.trim()) {
      toast.error('Please enter an income source.');
      return;
    }

    if (type === 'expense' && !category) {
      toast.error('Please select a category.');
      return;
    }

    const transaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      date: date || new Date().toLocaleDateString(),
      type
    };

    if (type === 'income') {
      transaction.source = source.trim();
    } else {
      transaction.category = category;
      transaction.description = description.trim() || category;
    }

    const newData = {
      ...data,
      [type === 'income' ? 'income' : 'expenses']: [
        ...data[type === 'income' ? 'income' : 'expenses'],
        transaction
      ]
    };

    saveData(newData);
    setTransactionForm({
      type: 'expense',
      source: '',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
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
    const matchesTab = activeTab === 'all' || transaction.type === activeTab;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const diffTime = Math.abs(today - transactionDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch(dateFilter) {
        case 'today':
          matchesDate = diffDays <= 1;
          break;
        case 'week':
          matchesDate = diffDays <= 7;
          break;
        case 'month':
          matchesDate = diffDays <= 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesTab && matchesDate;
  });

  const expenseCategories = [
    'Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Travel', 'Insurance', 
    'Debt Payment', 'Savings', 'Investment', 'Charity', 'Other'
  ];

  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading transactions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-blue-100">Track and manage your financial activities</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0">
            <div className="text-center">
              <p className="text-sm text-blue-100">Total Income</p>
              <p className="text-2xl font-bold text-green-300">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-100">Total Expenses</p>
              <p className="text-2xl font-bold text-red-300">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'income' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'expense' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Expenses
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Transaction Type */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTransactionForm({...transactionForm, type: 'income'})}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      transactionForm.type === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 inline mr-2" />
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionForm({...transactionForm, type: 'expense'})}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      transactionForm.type === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4 inline mr-2" />
                    Expense
                  </button>
                </div>

                {/* Source/Category */}
                {transactionForm.type === 'income' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Income Source
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Salary, Freelance"
                      value={transactionForm.source}
                      onChange={(e) => setTransactionForm({...transactionForm, source: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {expenseCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                {transactionForm.type === 'expense' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    transactionForm.type === 'income'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Add {transactionForm.type === 'income' ? 'Income' : 'Expense'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transaction History ({filteredTransactions.length})
            </h3>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Upload className="h-5 w-5" />
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No transactions found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {allTransactions.length === 0 
                  ? "Start by adding your first transaction"
                  : "Try adjusting your filters or search terms"
                }
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                return (
                  <div key={transaction.id} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isIncome 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-300' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 hover:border-red-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                          {isIncome ? (
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {isIncome ? transaction.source : transaction.description}
                            </h4>
                            {!isIncome && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                                {transaction.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(transaction.type === 'income' ? 'income' : 'expenses', transaction.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
