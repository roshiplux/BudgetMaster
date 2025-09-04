// App constants
export const APP_NAME = 'BudgetMaster';
export const APP_VERSION = '2.0.0';

// Default categories
export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Gas & Fuel',
  'Insurance',
  'Investment',
  'Savings',
  'Rent/Mortgage',
  'Other'
];

// Currency list (comprehensive list of world currencies)
export const CURRENCIES = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  
  // Asia Pacific
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  
  // Middle East & Africa
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£S' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
  
  // Europe
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
  
  // Americas
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
  { code: 'ECU', name: 'Ecuadorian Sucre', symbol: 'S/.' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$' },
  
  // Oceania
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
  { code: 'PGK', name: 'Papua New Guinea Kina', symbol: 'K' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
  
  // Central Asian
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʻm' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
  
  // Digital/Crypto (for reference)
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
];

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// Account types
export const ACCOUNT_TYPES = [
  'Checking',
  'Savings',
  'Credit Card',
  'Investment',
  'Cash',
  'Other'
];

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd'
};

// Validation rules
export const VALIDATION_RULES = {
  TRANSACTION: {
    DESCRIPTION: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100
    },
    AMOUNT: {
      MIN: 0.01,
      MAX: 999999999.99
    }
  },
  ACCOUNT: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50
    },
    BALANCE: {
      MIN: -999999999.99,
      MAX: 999999999.99
    }
  },
  USER: {
    DISPLAY_NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50
    },
    PASSWORD: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 128
    }
  }
};

// Firebase collection names
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  BANK_ACCOUNTS: 'bankAccounts',
  CATEGORIES: 'categories'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'budgetmaster_theme',
  CURRENCY: 'budgetmaster_currency',
  LAST_LOGIN: 'budgetmaster_last_login'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  GENERAL: 'An unexpected error occurred. Please try again.',
  TRANSACTION_NOT_FOUND: 'Transaction not found.',
  ACCOUNT_NOT_FOUND: 'Account not found.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_ADDED: 'Transaction added successfully',
  TRANSACTION_UPDATED: 'Transaction updated successfully',
  TRANSACTION_DELETED: 'Transaction deleted successfully',
  ACCOUNT_ADDED: 'Account added successfully',
  ACCOUNT_UPDATED: 'Account updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PASSWORD_RESET: 'Password reset email sent successfully'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Chart configuration
export const CHART_CONFIG = {
  RESPONSIVE: true,
  MAINTAIN_ASPECT_RATIO: false,
  DEFAULT_HEIGHT: 300,
  MOBILE_HEIGHT: 250
};
