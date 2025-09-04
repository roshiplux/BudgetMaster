import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, CalendarDays, Wallet, PieChart, BarChart3, Target, AlertCircle, ArrowUpRight, ArrowDownRight, Plus, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: []
  });

  const [dailySummary, setDailySummary] = useState({
    todayIncome: 0,
    todayExpenses: 0,
    weekExpenses: 0,
    monthExpenses: 0
  });

  const [budgetGoals, setBudgetGoals] = useState({
    monthlyBudget: 3000,
    savingsGoal: 10000,
    currentSavings: 0
  });

  useEffect(() => {
    const loadData = async () => {
      await loadDashboardData();
    };
    loadData();
    
    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadDashboardData();
    };
    window.addEventListener('budgetDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('budgetDataUpdated', handleDataUpdate);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from localStorage
      const saved = localStorage.getItem('budgetMasterData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
        updateDailySummary(parsedData);
      } else {
        // Add sample data if no data exists
        addSampleDataIfEmpty();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const addSampleDataIfEmpty = () => {
    const sampleData = {
      bankAccounts: [
        { id: 1001, name: "Chase Checking", purpose: "Checking", balance: 2500.00, createdDate: "12/1/2024" },
        { id: 1002, name: "Savings Account", purpose: "Savings", balance: 8500.00, createdDate: "12/1/2024" },
        { id: 1003, name: "Emergency Fund", purpose: "Emergency", balance: 5000.00, createdDate: "12/1/2024" }
      ],
      income: [
        { id: 2001, source: "Salary", amount: 4500.00, date: "12/1/2024", type: "income" },
        { id: 2002, source: "Freelance Work", amount: 800.00, date: "12/5/2024", type: "income" },
        { id: 2003, source: "Investment Returns", amount: 150.00, date: "12/10/2024", type: "income" }
      ],
      expenses: [
        { id: 3001, category: "Housing", amount: 1200.00, description: "Monthly Rent", date: "12/1/2024", type: "expense" },
        { id: 3002, category: "Food", amount: 85.50, description: "Grocery Shopping", date: "12/2/2024", type: "expense" },
        { id: 3003, category: "Transportation", amount: 45.00, description: "Gas Station", date: "12/3/2024", type: "expense" },
        { id: 3004, category: "Utilities", amount: 120.00, description: "Electricity Bill", date: "12/4/2024", type: "expense" },
        { id: 3005, category: "Entertainment", amount: 25.00, description: "Movie Tickets", date: "12/5/2024", type: "expense" }
      ]
    };
    
    setData(sampleData);
    updateDailySummary(sampleData);
    localStorage.setItem('budgetMasterData', JSON.stringify(sampleData));
  };

  const updateDailySummary = (budgetData) => {
    const today = new Date().toLocaleDateString();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    // Today's transactions
    const todayIncome = budgetData.income
      .filter(item => item.date === today)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const todayExpenses = budgetData.expenses
      .filter(item => item.date === today)
      .reduce((sum, item) => sum + item.amount, 0);

    // This week's expenses
    const weekExpenses = budgetData.expenses
      .filter(item => new Date(item.date) >= startOfWeek)
      .reduce((sum, item) => sum + item.amount, 0);

    // This month's expenses
    const monthExpenses = budgetData.expenses
      .filter(item => new Date(item.date) >= startOfMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    setDailySummary({
      todayIncome,
      todayExpenses,
      weekExpenses,
      monthExpenses
    });
  };

  const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBankBalance = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  const budgetProgress = (dailySummary.monthExpenses / budgetGoals.monthlyBudget) * 100;

  // Calculate expense categories for chart
  const expensesByCategory = data.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const AdvancedStatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendValue }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="flex items-center space-x-1">
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          ) : null}
          {trendValue && (
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {trendValue}%
            </span>
          )}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {showBalances ? formatCurrency(value) : '••••'}
      </p>
    </div>
  );

  const BudgetProgressCard = () => (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>
        <Target className="h-6 w-6" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-90">Spent this month</span>
            <span className="text-sm font-medium">{formatCurrency(dailySummary.monthExpenses)} / {formatCurrency(budgetGoals.monthlyBudget)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${budgetProgress > 90 ? 'bg-red-300' : budgetProgress > 70 ? 'bg-yellow-300' : 'bg-green-300'}`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">Remaining</span>
          <span className="text-lg font-bold">{formatCurrency(Math.max(0, budgetGoals.monthlyBudget - dailySummary.monthExpenses))}</span>
        </div>
      </div>
    </div>
  );

  const CategorySpendingCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Spending Categories</h3>
        <PieChart className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {topExpenseCategories.map(([category, amount], index) => {
          const percentage = (amount / totalExpenses) * 100;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
          return (
            <div key={category} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
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
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const DailyStatCard = ({ title, amount, icon: Icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{title}</p>
          <p className={`text-lg sm:text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`${color} text-sm sm:text-base h-5 w-5`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            Welcome to BudgetMaster! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your complete financial overview for today.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="text-sm">{showBalances ? 'Hide' : 'Show'} Balances</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdvancedStatCard
          title="Total Income"
          value={totalIncome}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-100 dark:bg-green-900"
          trend="up"
          trendValue="12.5"
        />
        <AdvancedStatCard
          title="Total Expenses"
          value={totalExpenses}
          icon={TrendingDown}
          color="text-red-600"
          bgColor="bg-red-100 dark:bg-red-900"
          trend="down"
          trendValue="8.3"
        />
        <AdvancedStatCard
          title="Net Worth"
          value={netWorth}
          icon={Wallet}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900"
          trend={netWorth > 0 ? "up" : "down"}
          trendValue="15.2"
        />
        <AdvancedStatCard
          title="Savings Rate"
          value={savingsRate}
          icon={Target}
          color="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900"
          trend="up"
          trendValue="3.1"
        />
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DailyStatCard
          title="Today's Income"
          amount={dailySummary.todayIncome}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-100 dark:bg-green-900"
        />
        <DailyStatCard
          title="Today's Expenses"
          amount={dailySummary.todayExpenses}
          icon={TrendingDown}
          color="text-red-600 dark:text-red-400"
          bgColor="bg-red-100 dark:bg-red-900"
        />
        <DailyStatCard
          title="This Week"
          amount={dailySummary.weekExpenses}
          icon={Calendar}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900"
        />
        <DailyStatCard
          title="This Month"
          amount={dailySummary.monthExpenses}
          icon={CalendarDays}
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900"
        />
      </div>

      {/* Budget Progress and Category Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgressCard />
        <CategorySpendingCard />
      </div>

      {/* Insights and Alerts */}
      {budgetProgress > 80 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Budget Alert</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You've used {budgetProgress.toFixed(1)}% of your monthly budget. Consider reviewing your spending.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="mr-3 text-blue-500 h-6 w-6" />
            Recent Transactions
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
        
        {data.income.length === 0 && data.expenses.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No transactions yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Start by adding your first transaction to see your financial activity
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {[
              ...data.income.map(item => ({...item, type: 'income'})),
              ...data.expenses.map(item => ({...item, type: 'expense'}))
            ]
            .sort((a, b) => b.id - a.id)
            .slice(0, 10)
            .map((transaction) => {
              const isIncome = transaction.type === 'income';
              return (
                <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                  isIncome 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-300' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 hover:border-red-300'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                      {isIncome ? (
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {isIncome ? transaction.source : transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isIncome ? 'Income' : transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isIncome ? '+' : '-'}{showBalances ? formatCurrency(transaction.amount) : '••••'}
                    </p>
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

export default Dashboard;
