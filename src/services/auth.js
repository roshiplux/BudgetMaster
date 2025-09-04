import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export class AuthService {
  constructor() {
    this.user = null;
    this.listeners = [];
  }

  // Authentication methods
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });
      
      return user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to logout. Please try again.');
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await updateProfile(user, updates);
      await this.updateUserDocument(user.uid, updates);
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  // User document management
  async createUserDocument(user, additionalData = {}) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          settings: {
            currency: 'USD',
            theme: 'light',
            categories: [
              'Food & Dining',
              'Transportation',
              'Shopping',
              'Entertainment',
              'Bills & Utilities',
              'Healthcare',
              'Education',
              'Travel',
              'Other'
            ]
          },
          ...additionalData
        };
        
        await setDoc(userDocRef, userData);
      }
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }

  async updateUserDocument(uid, updates) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, updates, { merge: true });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  }

  async getUserDocument(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user document:', error);
      return null;
    }
  }

  // Auth state management
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  isAuthenticated() {
    return !!auth.currentUser;
  }

  // Error handling
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

export const authService = new AuthService();
