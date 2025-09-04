import React, { useState, useEffect } from 'react';
import { Plus, Users, TrendingUp, TrendingDown, Calendar, DollarSign, User, Phone, Mail, Trash2, Edit3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import QuickAddModal from '../dashboard/QuickAddModal';
import toast from 'react-hot-toast';

const Loans = () => {
  const [data, setData] = useState({
    loans: [],
    contacts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    loadData();
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
          loans: parsedData.loans || [],
          contacts: parsedData.contacts || []
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getFilteredLoans = () => {
    let filtered = data.loans;

    // Filter by tab
    switch (activeTab) {
      case 'given':
        filtered = filtered.filter(loan => loan.type === 'given');
        break;
      case 'received':
        filtered = filtered.filter(loan => loan.type === 'received');
        break;
      case 'active':
        filtered = filtered.filter(loan => loan.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(loan => loan.status === 'completed');
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const markLoanAsCompleted = (loanId) => {
    try {
      const stored = localStorage.getItem('budgetMasterData');
      const data = stored ? JSON.parse(stored) : {};
      
      const loanIndex = data.loans.findIndex(loan => loan.id === loanId);
      if (loanIndex !== -1) {
        data.loans[loanIndex].status = 'completed';
        data.loans[loanIndex].completedDate = new Date().toISOString();
        
        localStorage.setItem('budgetMasterData', JSON.stringify(data));
        loadData();
        window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
        toast.success('Loan marked as completed');
      }
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error('Failed to update loan');
    }
  };

  const deleteLoan = (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        const stored = localStorage.getItem('budgetMasterData');
        const data = stored ? JSON.parse(stored) : {};
        
        data.loans = data.loans.filter(loan => loan.id !== loanId);
        
        localStorage.setItem('budgetMasterData', JSON.stringify(data));
        loadData();
        window.dispatchEvent(new CustomEvent('budgetDataUpdated'));
        toast.success('Loan deleted successfully');
      } catch (error) {
        console.error('Error deleting loan:', error);
        toast.error('Failed to delete loan');
      }
    }
  };

  const loansGiven = data.loans.filter(loan => loan.type === 'given');
  const loansReceived = data.loans.filter(loan => loan.type === 'received');
  const activeLoans = data.loans.filter(loan => loan.status === 'active');
  const completedLoans = data.loans.filter(loan => loan.status === 'completed');

  const totalGiven = loansGiven.reduce((sum, loan) => sum + loan.amount, 0);
  const totalReceived = loansReceived.reduce((sum, loan) => sum + loan.amount, 0);
  const netPosition = totalGiven - totalReceived;

  const tabs = [
    { id: 'all', label: 'All Loans', count: data.loans.length },
    { id: 'given', label: 'Money Lent', count: loansGiven.length },
    { id: 'received', label: 'Money Borrowed', count: loansReceived.length },
    { id: 'active', label: 'Active', count: activeLoans.length },
    { id: 'completed', label: 'Completed', count: completedLoans.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading loans..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Loans & Debts</h1>
            <p className="text-purple-100">Track money lent and borrowed</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowQuickAdd('loan')}
              className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Loan</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Money Lent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGiven)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Money Borrowed</p>
                <p className="text-2xl font-bold">{formatCurrency(totalReceived)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-pink-200" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Net Position</p>
                <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {formatCurrency(netPosition)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search loans by contact name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Loans List */}
        <div className="p-6">
          {getFilteredLoans().length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No loans found</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Add your first loan to get started'}
              </p>
              <button
                onClick={() => setShowQuickAdd('loan')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Loan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredLoans().map((loan) => (
                <div key={loan.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        loan.type === 'given' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {loan.type === 'given' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {loan.contactName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            loan.status === 'active' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {loan.status === 'active' ? 'Active' : 'Completed'}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{loan.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(loan.date).toLocaleDateString()}</span>
                          </span>
                          <span>{loan.category}</span>
                          {loan.reason && <span>• {loan.reason}</span>}
                        </div>
                        {loan.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            Note: {loan.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          loan.type === 'given' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {loan.type === 'given' ? '+' : '-'}{formatCurrency(loan.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {loan.type === 'given' ? 'You lent' : 'You borrowed'}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {loan.status === 'active' && (
                          <button
                            onClick={() => markLoanAsCompleted(loan.id)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLoan(loan.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Delete loan"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default Loans;
