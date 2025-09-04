import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, ArrowRightLeft, Users, Target, Wallet, CreditCard, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const QuickAddModal = ({ type, onClose, onSuccess }) => {
  const [activeType, setActiveType] = useState(type === 'menu' ? 'income' : type);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    customCategory: '',
    date: new Date().toISOString().split('T')[0],
    account: '',
    fromAccount: '',
    toAccount: '',
    loanType: 'given',
    contactName: '',
    loanReason: '',
    savingGoal: '',
    notes: ''
  });

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState({
    income: [],
    expenses: [],
    loans: [],
    savings: []
  });

  useEffect(() => {
    loadAccountsAndCategories();
  }, []);

  const loadAccountsAndCategories = () => {
    try {
      const stored = localStorage.getItem('budgetMasterData');
      const categoriesStored = localStorage.getItem('budgetMasterCategories');
      
      if (stored) {
        const data = JSON.parse(stored);
        const accountsList = [
          { id: 'wallet', name: 'Wallet (Cash)', type: 'wallet' },
          ...data.bankAccounts.map(acc => ({ id: acc.id, name: acc.name, type: 'bank' }))
        ];
        setAccounts(accountsList);
      }

      if (categoriesStored) {
        setCategories(JSON.parse(categoriesStored));
      } else {
        // Default categories
        setCategories({
          income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
          expenses: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'],
          loans: ['Personal', 'Business', 'Emergency', 'Investment', 'Other'],
          savings: ['Emergency Fund', 'Vacation', 'Investment', 'Goal-based', 'Other']
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addCustomCategory = (type) => {
    if (formData.customCategory.trim()) {
      const newCategories = {
        ...categories,
        [type]: [...categories[type], formData.customCategory.trim()]
      };
      setCategories(newCategories);
      localStorage.setItem('budgetMasterCategories', JSON.stringify(newCategories));
      setFormData(prev => ({
        ...prev,
        category: formData.customCategory.trim(),
        customCategory: ''
      }));
    }
  };

  const handleSubmit = () => {
    try {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }

      const stored = localStorage.getItem('budgetMasterData');
      const data = stored ? JSON.parse(stored) : {
        income: [],
        expenses: [],
        bankAccounts: [],
        wallet: { balance: 0 },
        loans: [],
        savings: []
      };

      const baseTransaction = {
        id: Date.now(),
        amount,
        description: formData.description.trim(),
        date: formData.date,
        createdAt: new Date().toISOString()
      };

      switch (activeType) {
        case 'income':
          if (!formData.category) {
            toast.error('Please select a category');
            return;
          }
          data.income.push({
            ...baseTransaction,
            category: formData.category,
            account: formData.account || 'wallet'
          });
          
          // Add to account balance
          if (formData.account === 'wallet') {
            data.wallet.balance = (data.wallet.balance || 0) + amount;
          } else {
            const account = data.bankAccounts.find(acc => acc.id === formData.account);
            if (account) {
              account.balance += amount;
            }
          }
          break;

        case 'expense':
          if (!formData.category) {
            toast.error('Please select a category');
            return;
          }
          data.expenses.push({
            ...baseTransaction,
            category: formData.category,
            account: formData.account || 'wallet'
          });
          
          // Subtract from account balance
          if (formData.account === 'wallet') {
            data.wallet.balance = (data.wallet.balance || 0) - amount;
          } else {
            const account = data.bankAccounts.find(acc => acc.id === formData.account);
            if (account) {
              account.balance -= amount;
            }
          }
          break;

        case 'transfer':
          if (!formData.fromAccount || !formData.toAccount) {
            toast.error('Please select both accounts');
            return;
          }
          if (formData.fromAccount === formData.toAccount) {
            toast.error('Source and destination accounts must be different');
            return;
          }

          // Subtract from source
          if (formData.fromAccount === 'wallet') {
            if ((data.wallet.balance || 0) < amount) {
              toast.error('Insufficient wallet balance');
              return;
            }
            data.wallet.balance = (data.wallet.balance || 0) - amount;
          } else {
            const fromAccount = data.bankAccounts.find(acc => acc.id === formData.fromAccount);
            if (!fromAccount || fromAccount.balance < amount) {
              toast.error('Insufficient account balance');
              return;
            }
            fromAccount.balance -= amount;
          }

          // Add to destination
          if (formData.toAccount === 'wallet') {
            data.wallet.balance = (data.wallet.balance || 0) + amount;
          } else {
            const toAccount = data.bankAccounts.find(acc => acc.id === formData.toAccount);
            if (toAccount) {
              toAccount.balance += amount;
            }
          }

          // Record transfer in expenses for tracking
          data.expenses.push({
            ...baseTransaction,
            category: 'Transfer',
            account: formData.fromAccount,
            transferTo: formData.toAccount,
            type: 'transfer'
          });
          break;

        case 'loan':
          if (!formData.contactName.trim()) {
            toast.error('Please enter contact name');
            return;
          }
          if (!formData.category) {
            toast.error('Please select a loan category');
            return;
          }

          data.loans = data.loans || [];
          data.loans.push({
            ...baseTransaction,
            type: formData.loanType,
            contactName: formData.contactName.trim(),
            category: formData.category,
            reason: formData.loanReason.trim(),
            status: 'active',
            notes: formData.notes.trim()
          });

          // Adjust account balance
          if (formData.loanType === 'given') {
            // Money given out
            if (formData.account === 'wallet') {
              data.wallet.balance = (data.wallet.balance || 0) - amount;
            } else {
              const account = data.bankAccounts.find(acc => acc.id === formData.account);
              if (account) {
                account.balance -= amount;
              }
            }
          } else {
            // Money received
            if (formData.account === 'wallet') {
              data.wallet.balance = (data.wallet.balance || 0) + amount;
            } else {
              const account = data.bankAccounts.find(acc => acc.id === formData.account);
              if (account) {
                account.balance += amount;
              }
            }
          }
          break;

        case 'saving':
          if (!formData.savingGoal.trim()) {
            toast.error('Please enter saving goal');
            return;
          }
          if (!formData.category) {
            toast.error('Please select a saving category');
            return;
          }

          data.savings = data.savings || [];
          data.savings.push({
            ...baseTransaction,
            goal: formData.savingGoal.trim(),
            category: formData.category,
            account: formData.account || 'wallet',
            notes: formData.notes.trim()
          });

          // Subtract from account (money set aside for saving)
          if (formData.account === 'wallet') {
            data.wallet.balance = (data.wallet.balance || 0) - amount;
          } else {
            const account = data.bankAccounts.find(acc => acc.id === formData.account);
            if (account) {
              account.balance -= amount;
            }
          }
          break;

        default:
          toast.error('Invalid transaction type');
          return;
      }

      localStorage.setItem('budgetMasterData', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
      
      toast.success(`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} added successfully!`);
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const actionTypes = [
    { id: 'income', label: 'Income', icon: TrendingUp, color: 'text-green-600' },
    { id: 'expense', label: 'Expense', icon: TrendingDown, color: 'text-red-600' },
    { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-600' },
    { id: 'loan', label: 'Loan', icon: Users, color: 'text-purple-600' },
    { id: 'saving', label: 'Saving', icon: Target, color: 'text-indigo-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Add</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Action Type Tabs */}
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {actionTypes.map((actionType) => {
              const Icon = actionType.icon;
              return (
                <button
                  key={actionType.id}
                  onClick={() => setActiveType(actionType.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeType === actionType.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{actionType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type-specific fields */}
          {(activeType === 'income' || activeType === 'expense') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories[activeType].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                {/* Add custom category */}
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => handleInputChange('customCategory', e.target.value)}
                    placeholder="Add new category"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => addCustomCategory(activeType)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account
                </label>
                <select
                  value={formData.account}
                  onChange={(e) => handleInputChange('account', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeType === 'transfer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Account *
                  </label>
                  <select
                    value={formData.fromAccount}
                    onChange={(e) => handleInputChange('fromAccount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select source</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To Account *
                  </label>
                  <select
                    value={formData.toAccount}
                    onChange={(e) => handleInputChange('toAccount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select destination</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeType === 'loan' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Type *
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => handleInputChange('loanType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="given">Money Given (I lent)</option>
                    <option value="received">Money Received (I borrowed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account
                  </label>
                  <select
                    value={formData.account}
                    onChange={(e) => handleInputChange('account', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories.loans.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.loanReason}
                  onChange={(e) => handleInputChange('loanReason', e.target.value)}
                  placeholder="Reason for loan (optional)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {activeType === 'saving' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saving Goal *
                </label>
                <input
                  type="text"
                  value={formData.savingGoal}
                  onChange={(e) => handleInputChange('savingGoal', e.target.value)}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories.savings.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Account
                </label>
                <select
                  value={formData.account}
                  onChange={(e) => handleInputChange('account', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          {(activeType === 'loan' || activeType === 'saving') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes (optional)"
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
