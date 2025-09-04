import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { firestoreService } from '../services/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch user profile from Firestore
          const profile = await authService.getUserDocument(firebaseUser.uid);
          setUserProfile(profile);
          
          // Create user document if it doesn't exist
          if (!profile) {
            await authService.createUserDocument(firebaseUser);
            const newProfile = await authService.getUserDocument(firebaseUser.uid);
            setUserProfile(newProfile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          // Clean up any active subscriptions
          firestoreService.unsubscribeAll();
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const user = await authService.login(email, password);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    try {
      setLoading(true);
      const user = await authService.register(email, password, displayName);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setUserProfile(null);
      firestoreService.unsubscribeAll();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      await authService.updateUserProfile(updates);
      
      // Update local state
      setUserProfile(prev => ({ ...prev, ...updates }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await authService.updateUserPassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await authService.getUserDocument(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    updatePassword,
    refreshUserProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
