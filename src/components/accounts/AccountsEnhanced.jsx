import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building, CreditCard, Wallet, TrendingUp, TrendingDown, DollarSign, Edit3, Eye, EyeOff, Building2, PiggyBank, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { CURRENCIES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: []
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Bank account form state
  const [accountForm, setAccountForm] = useState({
    name: '',
    purpose: 'Checking',
    balance: '',
    currency: 'USD',
    bank: '',
    accountNumber: '',
    notes: ''
  });

  const [balanceUpdateForm, setBalanceUpdateForm] = useState({
    accountId: null,
    newBalance: '',
    transactionType: 'adjustment',
    description: ''
  });

  useEffect(() => {
    loadAccounts();
    const handleDataUpdate = () => {
      loadAccounts();
    };
    window.addEventListener('budgetDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('budgetDataUpdated', handleDataUpdate);
  }, []);

  const loadAccounts = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('budgetMasterData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
      setLoading(false);
    }
  };

  const saveData = (newData) => {
    localStorage.setItem('budgetMasterData', JSON.stringify(newData));
    setData(newData);
    window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    const { name, purpose, balance, currency, bank, accountNumber, notes } = accountForm;

    if (!name.trim() || !balance || parseFloat(balance) < 0) {
      toast.error('Please enter a valid account name and balance.');
      return;
    }

    const newAccount = {
      id: Date.now(),
      name: name.trim(),
      purpose,
      balance: parseFloat(balance),
      currency,
      bank: bank.trim(),
      accountNumber: accountNumber.trim(),
      notes: notes.trim(),
      createdDate: new Date().toLocaleDateString(),
      lastUpdated: new Date().toLocaleDateString()
    };

    const newData = {
      ...data,
      bankAccounts: [...data.bankAccounts, newAccount]
    };

    saveData(newData);
    setAccountForm({
      name: '',
      purpose: 'Checking',
      balance: '',
      currency: 'USD',
      bank: '',
      accountNumber: '',
      notes: ''
    });
    setShowAddForm(false);
    toast.success('Account added successfully!');
  };

  const handleUpdateBalance = (e) => {
    e.preventDefault();
    const { accountId, newBalance, transactionType, description } = balanceUpdateForm;

    if (!accountId || !newBalance || parseFloat(newBalance) < 0) {
      toast.error('Please enter a valid balance.');
      return;
    }

    const accountIndex = data.bankAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      toast.error('Account not found.');
      return;
    }

    const updatedAccounts = [...data.bankAccounts];
    const oldBalance = updatedAccounts[accountIndex].balance;
    updatedAccounts[accountIndex].balance = parseFloat(newBalance);
    updatedAccounts[accountIndex].lastUpdated = new Date().toLocaleDateString();

    const newData = {
      ...data,
      bankAccounts: updatedAccounts
    };

    saveData(newData);
    setBalanceUpdateForm({
      accountId: null,
      newBalance: '',
      transactionType: 'adjustment',
      description: ''
    });
    
    const difference = parseFloat(newBalance) - oldBalance;
    toast.success(`Balance updated! ${difference >= 0 ? 'Added' : 'Removed'} ${formatCurrency(Math.abs(difference))}`);
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      const newData = {
        ...data,
        bankAccounts: data.bankAccounts.filter(account => account.id !== id)
      };
      saveData(newData);
      toast.success('Account deleted successfully!');
    }
  };

  const accountPurposes = [
    'Checking', 'Savings', 'Emergency', 'Investment', 'Credit Card', 'Business', 'Joint', 'Other'
  ];

  const totalBalance = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const accountsByPurpose = data.bankAccounts.reduce((acc, account) => {
    acc[account.purpose] = (acc[account.purpose] || 0) + account.balance;
    return acc;
  }, {});

  const getAccountIcon = (purpose) => {
    switch (purpose) {
      case 'Checking': return CreditCard;
      case 'Savings': return PiggyBank;
      case 'Investment': return TrendingUp;
      case 'Emergency': return Target;
      case 'Credit Card': return CreditCard;
      case 'Business': return Building;
      default: return Wallet;
    }
  };

  const getAccountColor = (purpose) => {
    switch (purpose) {
      case 'Checking': return 'from-blue-500 to-blue-600';
      case 'Savings': return 'from-green-500 to-green-600';
      case 'Investment': return 'from-purple-500 to-purple-600';
      case 'Emergency': return 'from-orange-500 to-orange-600';
      case 'Credit Card': return 'from-red-500 to-red-600';
      case 'Business': return 'from-gray-500 to-gray-600';
      default: return 'from-indigo-500 to-indigo-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bank Accounts</h1>
            <p className="text-indigo-100">Manage your financial accounts and track balances</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="text-center">
              <p className="text-sm text-indigo-100">Total Balance</p>
              <p className="text-3xl font-bold">
                {showBalances ? formatCurrency(totalBalance) : '••••••'}
              </p>
              <p className="text-sm text-indigo-200 mt-1">{data.bankAccounts.length} accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            List View
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(accountsByPurpose).map(([purpose, amount]) => {
          const Icon = getAccountIcon(purpose);
          return (
            <div key={purpose} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {data.bankAccounts.filter(acc => acc.purpose === purpose).length}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{purpose}</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {showBalances ? formatCurrency(amount) : '••••'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Account</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chase Checking"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={accountForm.purpose}
                    onChange={(e) => setAccountForm({...accountForm, purpose: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {accountPurposes.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Balance
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={accountForm.balance}
                      onChange={(e) => setAccountForm({...accountForm, balance: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={accountForm.currency}
                      onChange={(e) => setAccountForm({...accountForm, currency: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chase Bank"
                    value={accountForm.bank}
                    onChange={(e) => setAccountForm({...accountForm, bank: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="****1234"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({...accountForm, accountNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Additional notes..."
                    value={accountForm.notes}
                    onChange={(e) => setAccountForm({...accountForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Accounts List/Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Your Accounts ({data.bankAccounts.length})
          </h3>

          {data.bankAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No accounts yet</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Add your first bank account to start tracking your finances
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Account
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.bankAccounts.map((account) => {
                const Icon = getAccountIcon(account.purpose);
                const colorGradient = getAccountColor(account.purpose);
                return (
                  <div key={account.id} className={`bg-gradient-to-br ${colorGradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setBalanceUpdateForm({...balanceUpdateForm, accountId: account.id, newBalance: account.balance})}
                          className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                          title="Update balance"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xl font-bold mb-1">{account.name}</h4>
                      <p className="text-sm opacity-90">{account.purpose}</p>
                      {account.bank && <p className="text-xs opacity-75">{account.bank}</p>}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm opacity-90">Balance</p>
                      <p className="text-2xl font-bold">
                        {showBalances ? formatCurrency(account.balance) : '••••••'}
                      </p>
                    </div>
                    
                    <div className="text-xs opacity-75">
                      <p>Created: {account.createdDate}</p>
                      {account.lastUpdated && account.lastUpdated !== account.createdDate && (
                        <p>Updated: {account.lastUpdated}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {data.bankAccounts.map((account) => {
                const Icon = getAccountIcon(account.purpose);
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{account.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {account.purpose} {account.bank && `• ${account.bank}`}
                        </p>
                        {account.accountNumber && (
                          <p className="text-xs text-gray-400">****{account.accountNumber.slice(-4)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {showBalances ? formatCurrency(account.balance) : '••••••'}
                        </p>
                        <p className="text-xs text-gray-500">Updated: {account.lastUpdated || account.createdDate}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setBalanceUpdateForm({...balanceUpdateForm, accountId: account.id, newBalance: account.balance})}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Update balance"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Balance Update Modal */}
      {balanceUpdateForm.accountId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Update Balance</h2>
                <button
                  onClick={() => setBalanceUpdateForm({accountId: null, newBalance: '', transactionType: 'adjustment', description: ''})}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleUpdateBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Balance
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={balanceUpdateForm.newBalance}
                    onChange={(e) => setBalanceUpdateForm({...balanceUpdateForm, newBalance: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Reason for balance update..."
                    value={balanceUpdateForm.description}
                    onChange={(e) => setBalanceUpdateForm({...balanceUpdateForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Update Balance
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
