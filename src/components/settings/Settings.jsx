import React, { useState, useEffect } from 'react';
import { Save, User, Globe, Palette, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestore';
import { CURRENCIES, THEMES, DEFAULT_CATEGORIES } from '../../utils/constants';
import { validateUserProfile } from '../../utils/validation';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: ''
  });

  const [appSettings, setAppSettings] = useState({
    currency: 'USD',
    theme: 'light',
    categories: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && userProfile) {
      setProfileData({
        displayName: userProfile.displayName || user.displayName || '',
        email: user.email || ''
      });

      setAppSettings({
        currency: userProfile.settings?.currency || 'USD',
        theme: userProfile.settings?.theme || 'light',
        categories: userProfile.settings?.categories || DEFAULT_CATEGORIES
      });
    }
  }, [user, userProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setAppSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setAppSettings(prev => ({
      ...prev,
      theme: newTheme
    }));
  };

  const handleSaveProfile = async () => {
    const validation = validateUserProfile(profileData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        displayName: profileData.displayName
      });

      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await firestoreService.updateUserSettings(user.uid, appSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'currency', name: 'Currency', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mobile-touch-item ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Profile Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your account profile information
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
                      className={`form-input ${errors.displayName ? 'border-red-500' : ''}`}
                      placeholder="Your display name"
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="form-input bg-gray-100 dark:bg-gray-700"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Appearance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customize how the app looks and feels
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="space-y-2">
                    {Object.entries(themes).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="radio"
                          name="theme"
                          value={value}
                          checked={theme === value}
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            )}

            {/* Currency Tab */}
            {activeTab === 'currency' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Currency Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred currency for displaying amounts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Currency
                  </label>
                  <select
                    name="currency"
                    value={appSettings.currency}
                    onChange={handleSettingsChange}
                    className="form-input"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Currency'}</span>
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Security
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your account security settings
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Password changes:</strong> To change your password, please use the "Forgot Password" 
                      link on the login page to reset it securely.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Account Security:</strong> Your account is protected by Firebase Authentication, 
                      which provides enterprise-grade security for your data.
                    </p>
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
