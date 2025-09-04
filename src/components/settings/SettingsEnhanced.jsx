import React, { useState, useEffect } from 'react';
import { Save, User, Globe, Palette, Shield, Bell, Download, Upload, Trash2, RefreshCw, Moon, Sun, Monitor, DollarSign, Lock, Database, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { CURRENCIES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    // General settings
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    language: 'en',
    timezone: 'UTC',
    
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    compactMode: false,
    
    // Notifications
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    
    // Privacy & Security
    showBalances: true,
    requirePasswordForTransactions: false,
    autoLogout: 30,
    
    // Data & Backup
    autoBackup: true,
    backupFrequency: 'weekly',
    dataRetention: '2years'
  });

  const [profileData, setProfileData] = useState({
    name: 'Budget User',
    email: 'user@example.com',
    avatar: null
  });

  const [budgetGoals, setBudgetGoals] = useState({
    monthlyBudget: 3000,
    savingsGoal: 10000,
    emergencyFund: 6000
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('budgetMasterSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
      
      const savedProfile = localStorage.getItem('budgetMasterProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsedProfile }));
      }
      
      const savedGoals = localStorage.getItem('budgetMasterGoals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setBudgetGoals(prev => ({ ...prev, ...parsedGoals }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = () => {
    try {
      setSaving(true);
      localStorage.setItem('budgetMasterSettings', JSON.stringify(settings));
      localStorage.setItem('budgetMasterProfile', JSON.stringify(profileData));
      localStorage.setItem('budgetMasterGoals', JSON.stringify(budgetGoals));
      
      // Apply theme change
      if (settings.theme !== theme) {
        setTheme(settings.theme);
      }
      
      toast.success('Settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (key, value) => {
    setProfileData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGoalChange = (key, value) => {
    setBudgetGoals(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const exportData = () => {
    try {
      const data = {
        transactions: JSON.parse(localStorage.getItem('budgetMasterData') || '{}'),
        settings: settings,
        profile: profileData,
        goals: budgetGoals,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-master-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.transactions) {
          localStorage.setItem('budgetMasterData', JSON.stringify(data.transactions));
        }
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('budgetMasterSettings', JSON.stringify(data.settings));
        }
        if (data.profile) {
          setProfileData(data.profile);
          localStorage.setItem('budgetMasterProfile', JSON.stringify(data.profile));
        }
        if (data.goals) {
          setBudgetGoals(data.goals);
          localStorage.setItem('budgetMasterGoals', JSON.stringify(data.goals));
        }
        
        window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
        toast.success('Data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('budgetMasterData');
      localStorage.removeItem('budgetMasterSettings');
      localStorage.removeItem('budgetMasterProfile');
      localStorage.removeItem('budgetMasterGoals');
      
      window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
      toast.success('All data cleared successfully!');
      
      // Reset to defaults
      loadSettings();
    }
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'goals', label: 'Budget Goals', icon: DollarSign },
    { id: 'data', label: 'Data & Backup', icon: Database }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-purple-100">Customize your BudgetMaster experience</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                      <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                      <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {themes.map((themeOption) => {
                      const Icon = themeOption.icon;
                      return (
                        <button
                          key={themeOption.value}
                          onClick={() => handleSettingChange('theme', themeOption.value)}
                          className={`p-4 border-2 rounded-lg transition-colors ${
                            settings.theme === themeOption.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{themeOption.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Compact Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.budgetAlerts}
                      onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Budget Alerts</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.weeklyReports}
                      onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Weekly Reports</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.monthlyReports}
                      onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Monthly Reports</span>
                  </label>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Privacy</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.showBalances}
                      onChange={(e) => handleSettingChange('showBalances', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Show Account Balances by Default</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requirePasswordForTransactions}
                      onChange={(e) => handleSettingChange('requirePasswordForTransactions', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Require Password for Transactions</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Auto Logout (minutes)
                    </label>
                    <select
                      value={settings.autoLogout}
                      onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Goals */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Goals</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Budget
                    </label>
                    <input
                      type="number"
                      value={budgetGoals.monthlyBudget}
                      onChange={(e) => handleGoalChange('monthlyBudget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Target monthly spending limit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Savings Goal
                    </label>
                    <input
                      type="number"
                      value={budgetGoals.savingsGoal}
                      onChange={(e) => handleGoalChange('savingsGoal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Long-term savings target</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency Fund
                    </label>
                    <input
                      type="number"
                      value={budgetGoals.emergencyFund}
                      onChange={(e) => handleGoalChange('emergencyFund', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Emergency fund target</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Goal Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Monthly Budget</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(budgetGoals.monthlyBudget)}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Savings Goal</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(budgetGoals.savingsGoal)}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Emergency Fund</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(budgetGoals.emergencyFund)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Backup */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data & Backup</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download all your financial data as a JSON file for backup or migration.
                    </p>
                    <button
                      onClick={exportData}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Restore your data from a previously exported backup file.
                    </p>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                        id="import-file"
                      />
                      <label
                        htmlFor="import-file"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import Data</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete all your data. This action cannot be undone.
                    </p>
                    <button
                      onClick={clearAllData}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
