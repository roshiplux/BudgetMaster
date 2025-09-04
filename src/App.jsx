import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';

// Components
import Dashboard from './components/dashboard/DashboardEnhanced';
import Transactions from './components/transactions/TransactionsEnhanced';
import Accounts from './components/accounts/AccountsEnhanced';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/SettingsEnhanced';
import Loans from './components/loans/Loans';
import Layout from './components/layout/Layout';

function App() {
  const { isDark } = useTheme();

  // Add CSS variables for toast styling
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--toast-bg', '#374151');
      root.style.setProperty('--toast-color', '#F9FAFB');
      root.style.setProperty('--toast-border', '#4B5563');
    } else {
      root.style.setProperty('--toast-bg', '#FFFFFF');
      root.style.setProperty('--toast-color', '#111827');
      root.style.setProperty('--toast-border', '#E5E7EB');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/transactions" element={
            <Layout>
              <Transactions />
            </Layout>
          } />
          <Route path="/accounts" element={
            <Layout>
              <Accounts />
            </Layout>
          } />
          <Route path="/analytics" element={
            <Layout>
              <Analytics />
            </Layout>
          } />
          <Route path="/loans" element={
            <Layout>
              <Loans />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
