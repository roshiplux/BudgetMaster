import { VALIDATION_RULES } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} Validation result
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength info
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'none' };
  }
  
  if (password.length < VALIDATION_RULES.USER.PASSWORD.MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION_RULES.USER.PASSWORD.MIN_LENGTH} characters long`,
      strength: 'weak'
    };
  }
  
  if (password.length > VALIDATION_RULES.USER.PASSWORD.MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be less than ${VALIDATION_RULES.USER.PASSWORD.MAX_LENGTH} characters`,
      strength: 'none'
    };
  }
  
  // Calculate password strength
  let strength = 'weak';
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { isValid: true, strength };
};

/**
 * Validate transaction data
 * @param {object} transaction - Transaction object to validate
 * @returns {object} Validation result
 */
export const validateTransaction = (transaction) => {
  const errors = {};
  
  // Validate description
  if (!transaction.description || transaction.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (transaction.description.length > VALIDATION_RULES.TRANSACTION.DESCRIPTION.MAX_LENGTH) {
    errors.description = `Description must be less than ${VALIDATION_RULES.TRANSACTION.DESCRIPTION.MAX_LENGTH} characters`;
  }
  
  // Validate amount
  const amount = parseFloat(transaction.amount);
  if (!transaction.amount || isNaN(amount)) {
    errors.amount = 'Amount is required and must be a valid number';
  } else if (amount < VALIDATION_RULES.TRANSACTION.AMOUNT.MIN) {
    errors.amount = `Amount must be at least $${VALIDATION_RULES.TRANSACTION.AMOUNT.MIN}`;
  } else if (amount > VALIDATION_RULES.TRANSACTION.AMOUNT.MAX) {
    errors.amount = `Amount cannot exceed $${VALIDATION_RULES.TRANSACTION.AMOUNT.MAX.toLocaleString()}`;
  }
  
  // Validate category
  if (!transaction.category || transaction.category.trim().length === 0) {
    errors.category = 'Category is required';
  }
  
  // Validate type
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.type = 'Transaction type must be income or expense';
  }
  
  // Validate date
  if (!transaction.date) {
    errors.date = 'Date is required';
  } else {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.date = 'Please enter a valid date';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate bank account data
 * @param {object} account - Account object to validate
 * @returns {object} Validation result
 */
export const validateBankAccount = (account) => {
  const errors = {};
  
  // Validate name
  if (!account.name || account.name.trim().length === 0) {
    errors.name = 'Account name is required';
  } else if (account.name.length > VALIDATION_RULES.ACCOUNT.NAME.MAX_LENGTH) {
    errors.name = `Account name must be less than ${VALIDATION_RULES.ACCOUNT.NAME.MAX_LENGTH} characters`;
  }
  
  // Validate balance
  const balance = parseFloat(account.balance);
  if (account.balance !== undefined && account.balance !== null && account.balance !== '') {
    if (isNaN(balance)) {
      errors.balance = 'Balance must be a valid number';
    } else if (balance < VALIDATION_RULES.ACCOUNT.BALANCE.MIN) {
      errors.balance = `Balance cannot be less than $${VALIDATION_RULES.ACCOUNT.BALANCE.MIN.toLocaleString()}`;
    } else if (balance > VALIDATION_RULES.ACCOUNT.BALANCE.MAX) {
      errors.balance = `Balance cannot exceed $${VALIDATION_RULES.ACCOUNT.BALANCE.MAX.toLocaleString()}`;
    }
  }
  
  // Validate type
  if (!account.type || account.type.trim().length === 0) {
    errors.type = 'Account type is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user profile data
 * @param {object} profile - Profile object to validate
 * @returns {object} Validation result
 */
export const validateUserProfile = (profile) => {
  const errors = {};
  
  // Validate display name
  if (!profile.displayName || profile.displayName.trim().length === 0) {
    errors.displayName = 'Display name is required';
  } else if (profile.displayName.length < VALIDATION_RULES.USER.DISPLAY_NAME.MIN_LENGTH) {
    errors.displayName = `Display name must be at least ${VALIDATION_RULES.USER.DISPLAY_NAME.MIN_LENGTH} characters`;
  } else if (profile.displayName.length > VALIDATION_RULES.USER.DISPLAY_NAME.MAX_LENGTH) {
    errors.displayName = `Display name must be less than ${VALIDATION_RULES.USER.DISPLAY_NAME.MAX_LENGTH} characters`;
  }
  
  // Validate email if provided
  if (profile.email) {
    const emailValidation = validateEmail(profile.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize and clean input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/^\s+|\s+$/g, '') // Remove leading/trailing whitespace
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with single space
};

/**
 * Validate amount input and return sanitized number
 * @param {string|number} amount - Amount to validate
 * @returns {object} Validation result with sanitized amount
 */
export const validateAmount = (amount) => {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, message: 'Amount is required', value: 0 };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Amount must be a valid number', value: 0 };
  }
  
  if (numAmount < 0) {
    return { isValid: false, message: 'Amount cannot be negative', value: 0 };
  }
  
  if (numAmount > VALIDATION_RULES.TRANSACTION.AMOUNT.MAX) {
    return { 
      isValid: false, 
      message: `Amount cannot exceed $${VALIDATION_RULES.TRANSACTION.AMOUNT.MAX.toLocaleString()}`,
      value: 0
    };
  }
  
  // Round to 2 decimal places
  const roundedAmount = Math.round(numAmount * 100) / 100;
  
  return { isValid: true, value: roundedAmount };
};

/**
 * Validate date input
 * @param {string|Date} date - Date to validate
 * @returns {object} Validation result
 */
export const validateDate = (date) => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  // Check if date is not too far in the future
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  if (dateObj > maxDate) {
    return { isValid: false, message: 'Date cannot be more than 1 year in the future' };
  }
  
  // Check if date is not too far in the past
  const minDate = new Date('1900-01-01');
  
  if (dateObj < minDate) {
    return { isValid: false, message: 'Date cannot be before 1900' };
  }
  
  return { isValid: true, value: dateObj };
};

/**
 * Check if input contains only alphanumeric characters and common punctuation
 * @param {string} input - Input to validate
 * @returns {boolean} True if safe, false otherwise
 */
export const isSafeInput = (input) => {
  if (typeof input !== 'string') {
    return false;
  }
  
  // Allow alphanumeric, spaces, and common punctuation
  const safePattern = /^[a-zA-Z0-9\s.,!?'"()\-_@#$%&+=/]*$/;
  return safePattern.test(input);
};
