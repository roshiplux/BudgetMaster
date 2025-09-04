import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight, Download, Filter, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

const Analytics = () => {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    loadData();
    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('budgetDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('budgetDataUpdated', handleDataUpdate);
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('budgetMasterData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Calculate analytics data
  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBalance = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  // Expense by category
  const expensesByCategory = data.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Monthly trends (simulated for demo)
  const monthlyData = [
    { month: 'Jan', income: 4500, expenses: 3200 },
    { month: 'Feb', income: 4800, expenses: 3400 },
    { month: 'Mar', income: 4600, expenses: 3100 },
    { month: 'Apr', income: 5200, expenses: 3800 },
    { month: 'May', income: 4900, expenses: 3500 },
    { month: 'Jun', income: 5100, expenses: 3700 }
  ];

  // Account distribution
  const accountsByType = data.bankAccounts.reduce((acc, account) => {
    acc[account.purpose] = (acc[account.purpose] || 0) + account.balance;
    return acc;
  }, {});

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 
    'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Analytics</h1>
            <p className="text-green-100">Insights and trends about your finances</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 lg:mt-0">
            <div className="text-center">
              <p className="text-sm text-green-100">Net Worth</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-100">Savings Rate</p>
              <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-300' : savingsRate >= 10 ? 'text-yellow-300' : 'text-red-300'}`}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            This Year
          </button>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Income</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <ArrowDownRight className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-red-600 mt-1">+5% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Account Balance</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-blue-600 mt-1">+8% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Budget Goal</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
          <p className="text-sm text-purple-600 mt-1">On track this month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses by Category</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {topCategories.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No expense data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center">
                    <div className="flex items-center flex-1">
                      <div className={`w-4 h-4 rounded-full ${colors[index]} mr-3`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                          <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-3">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Trends</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((month, index) => {
              const maxValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));
              const incomeWidth = (month.income / maxValue) * 100;
              const expenseWidth = (month.expenses / maxValue) * 100;
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month.month}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">↑ {formatCurrency(month.income)}</span>
                      <span className="text-red-600">↓ {formatCurrency(month.expenses)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${incomeWidth}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${expenseWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account Distribution</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(totalBalance)}
          </div>
        </div>
        
        {Object.keys(accountsByType).length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No account data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(accountsByType).map(([type, amount], index) => {
              const percentage = totalBalance > 0 ? (amount / totalBalance) * 100 : 0;
              return (
                <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-16 h-16 ${colors[index]} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    <span className="text-white font-bold text-xl">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{type}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Health Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Financial Health Score</h3>
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {Math.min(100, Math.max(0, Math.round(50 + savingsRate * 2))).toFixed(0)}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, 50 + savingsRate * 2))}%` }}
            ></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {savingsRate >= 20 ? "Excellent! You're building wealth effectively." :
             savingsRate >= 10 ? "Good! Consider increasing your savings rate." :
             savingsRate >= 0 ? "Fair. Focus on reducing expenses or increasing income." :
             "Needs attention. Your expenses exceed your income."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
