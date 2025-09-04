import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Edit, Trash2, DollarSign, Building } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bankAccounts: []
  });
  const [loading, setLoading] = useState(true);

  // Bank account form state
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountPurpose: '',
    bankBalance: ''
  });

  useEffect(() => {
    loadAccounts();
    // Listen for data updates from other components
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
    // Trigger a custom event to update other components
    window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
  };

  const handleAddBankAccount = (e) => {
    e.preventDefault();
    const { bankName, accountPurpose, bankBalance } = accountForm;

    if (!bankName.trim() || !accountPurpose || !bankBalance || parseFloat(bankBalance) < 0) {
      toast.error('Please fill in all bank account details with valid values.');
      return;
    }

    const account = {
      id: Date.now(),
      name: bankName.trim(),
      purpose: accountPurpose,
      balance: parseFloat(bankBalance),
      createdDate: new Date().toLocaleDateString()
    };

    const newData = {
      ...data,
      bankAccounts: [...data.bankAccounts, account]
    };

    saveData(newData);
    setAccountForm({ bankName: '', accountPurpose: '', bankBalance: '' });
    toast.success('Bank account added successfully!');
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      const newData = {
        ...data,
        bankAccounts: data.bankAccounts.filter(account => account.id !== accountId)
      };
      saveData(newData);
      toast.success('Account deleted successfully!');
    }
  };

  const handleUpdateBalance = (accountId, action) => {
    const amount = prompt(`Enter amount to ${action === 'add' ? 'add to' : 'subtract from'} account:`);
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    const newData = {
      ...data,
      bankAccounts: data.bankAccounts.map(account => {
        if (account.id === accountId) {
          return {
            ...account,
            balance: action === 'add' ? account.balance + numAmount : account.balance - numAmount
          };
        }
        return account;
      })
    };

    saveData(newData);
    toast.success(`Account balance ${action === 'add' ? 'increased' : 'decreased'} successfully!`);
  };

  const accountTypes = [
    'Checking', 'Savings', 'Emergency', 'Investment', 'Business', 'Other'
  ];

  const totalBalance = data.bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your bank accounts and balances
          </p>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 text-sm sm:text-base">Total Bank Balance</p>
            <p className="text-3xl sm:text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
            <p className="text-blue-200 text-sm mt-1">{data.bankAccounts.length} account(s)</p>
          </div>
          <Building className="text-3xl sm:text-4xl text-blue-200 h-12 w-12" />
        </div>
      </div>

      {/* Add Bank Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
          <Building className="mr-2 text-blue-500 h-5 w-5" />
          Add Bank Account
        </h2>
        
        <form onSubmit={handleAddBankAccount} className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Bank Name" 
              value={accountForm.bankName}
              onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
            <select 
              value={accountForm.accountPurpose}
              onChange={(e) => setAccountForm({ ...accountForm, accountPurpose: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm sm:text-base"
            >
              <option value="">Select Purpose</option>
              {accountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Balance" 
              step="0.01"
              value={accountForm.bankBalance}
              onChange={(e) => setAccountForm({ ...accountForm, bankBalance: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors mobile-touch-button text-sm sm:text-base"
          >
            <Plus className="inline mr-2 h-4 w-4" />
            Add Bank Account
          </button>
        </form>
      </div>

      {/* Bank Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.bankAccounts.map(account => (
          <div key={account.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6 border border-blue-200 dark:border-blue-700 transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">{account.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">{account.purpose}</p>
              </div>
              <button 
                onClick={() => handleDeleteAccount(account.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(account.balance)}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleUpdateBalance(account.id, 'add')}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  title="Add money"
                >
                  +
                </button>
                <button 
                  onClick={() => handleUpdateBalance(account.id, 'subtract')}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  title="Subtract money"
                >
                  -
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Added: {account.createdDate}
            </p>
          </div>
        ))}

        {data.bankAccounts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bank accounts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by adding your first bank account to track your balances
            </p>
          </div>
        )}
      </div>

      {/* Account Summary */}
      {data.bankAccounts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accountTypes.map(type => {
              const accountsOfType = data.bankAccounts.filter(account => account.purpose === type);
              const totalForType = accountsOfType.reduce((sum, account) => sum + account.balance, 0);
              
              if (accountsOfType.length === 0) return null;
              
              return (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{type}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalForType)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{accountsOfType.length} account(s)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
