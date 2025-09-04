import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, FileText, Tag } from 'lucide-react';
import { validateBankAccount } from '../../utils/validation';

const AccountModal = ({ isOpen, onClose, onSubmit, account, accountTypes }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        type: account.type || '',
        balance: account.balance?.toString() || '',
        description: account.description || ''
      });
    } else {
      setFormData({
        name: '',
        type: accountTypes[0] || '',
        balance: '',
        description: ''
      });
    }
    setErrors({});
  }, [account, accountTypes, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateBankAccount({
      ...formData,
      balance: formData.balance ? parseFloat(formData.balance) : 0
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const accountData = {
        name: formData.name.trim(),
        type: formData.type,
        balance: formData.balance ? parseFloat(formData.balance) : 0,
        description: formData.description.trim()
      };

      await onSubmit(accountData);
    } catch (error) {
      console.error('Error submitting account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {account ? 'Edit Account' : 'Add Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mobile-touch-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter account name"
                required
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Type
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              >
                <option value="">Select account type</option>
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
            )}
          </div>

          {/* Initial Balance */}
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Balance
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                id="balance"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className={`form-input pl-10 ${errors.balance ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {errors.balance && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.balance}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`form-input pl-10 ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Optional description for this account"
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (account ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;
