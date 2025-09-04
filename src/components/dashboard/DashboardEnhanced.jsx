import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, PiggyBank, ArrowRightLeft, Users, Banknote, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import QuickAddModal from './QuickAddModal';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardEnhanced = () => {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: [],
    wallet: { balance: 0 },
    loans: [],
    savings: []
  });
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    loadData();
    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgetDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('budgetDataUpdated', handleDataUpdate);
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('budgetMasterData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(prev => ({
          ...prev,
          ...parsedData
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Calculate totals
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBankBalance = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const walletBalance = data.wallet?.balance || 0;
  const totalBalance = totalBankBalance + walletBalance;
  const netIncome = totalIncome - totalExpenses;
  
  // Loans calculations
  const loansGiven = data.loans.filter(loan => loan.type === 'given').reduce((sum, loan) => sum + loan.amount, 0);
  const loansReceived = data.loans.filter(loan => loan.type === 'received').reduce((sum, loan) => sum + loan.amount, 0);
  const netLoans = loansGiven - loansReceived;

  // Savings total
  const totalSavings = data.savings.reduce((sum, saving) => sum + saving.amount, 0);

  const quickActions = [
    { id: 'income', label: 'Add Income', icon: TrendingUp, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { id: 'expense', label: 'Add Expense', icon: TrendingDown, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    { id: 'transfer', label: 'Money Transfer', icon: ArrowRightLeft, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { id: 'loan', label: 'Add Loan', icon: Users, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { id: 'saving', label: 'Add Saving', icon: Target, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' }
  ];

  const handleQuickAction = (actionType) => {
    setShowQuickAdd(actionType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Add */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Financial Overview</h1>
              <p className="text-blue-100">Your complete financial dashboard</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={() => setShowQuickAdd('menu')}
                className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm"
              >
                <Plus className="h-5 w-5" />
                <span>Quick Add</span>
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className={`${action.bgColor} ${action.textColor} p-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200 dark:border-gray-700`}
            >
              <Icon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm font-medium text-center">{action.label}</p>
            </button>
          );
        })}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Bank Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBankBalance)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Wallet Cash</p>
              <p className="text-2xl font-bold">{formatCurrency(walletBalance)}</p>
            </div>
            <Wallet className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Worth</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Assets</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalBalance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Net Income</span>
              <span className={`font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Savings</span>
              <span className="font-medium text-indigo-600">{formatCurrency(totalSavings)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loans & Debts</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Loans Given</span>
              <span className="font-medium text-green-600">{formatCurrency(loansGiven)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Loans Received</span>
              <span className="font-medium text-red-600">{formatCurrency(loansReceived)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Net Position</span>
              <span className={`font-medium ${netLoans >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netLoans)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bank Accounts</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.bankAccounts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Transactions</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.income.length + data.expenses.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Loans</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.loans.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...data.income.slice(-3), ...data.expenses.slice(-3)]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    data.income.includes(transaction) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {data.income.includes(transaction) ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <span className={`font-medium ${
                  data.income.includes(transaction) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.income.includes(transaction) ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          type={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default DashboardEnhanced;
