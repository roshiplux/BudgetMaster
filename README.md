# BudgetMaster 2.0 - React + Firebase

A modern, responsive personal finance management application built with React and Firebase.

## 🚀 Features

- **User Authentication** - Secure login/register with Firebase Auth
- **Transaction Management** - Add, edit, delete income and expenses
- **Bank Account Management** - Track multiple accounts and balances
- **Real-time Sync** - Data syncs across devices in real-time
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Dark/Light Theme** - Toggle between themes with system preference support
- **Multi-currency Support** - Support for 20+ currencies
- **Offline Support** - Works offline with automatic sync when online
- **Data Security** - Enterprise-grade security with Firebase

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Hosting, Storage)
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Hot Toast
- **Charts**: Chart.js with React Chart.js 2
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/               # Authentication components
│   ├── common/             # Reusable components
│   ├── dashboard/          # Dashboard components
│   ├── transactions/       # Transaction management
│   ├── accounts/           # Bank account management
│   ├── settings/           # User settings
│   └── layout/             # Layout components
├── contexts/               # React contexts
├── services/               # Firebase services
├── utils/                  # Utility functions
├── App.jsx                 # Main app component
└── index.js               # App entry point
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd BudgetMaster
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Hosting
5. Get your Firebase config from Project Settings

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Security Rules

Deploy the security rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select your project)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

### 5. Run the Application

```bash
# Development
npm start

# Production build
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 🔥 Firebase Configuration

### Firestore Collections

- `users/{userId}` - User profiles and settings
- `transactions/{transactionId}` - Financial transactions
- `bankAccounts/{accountId}` - Bank account information

### Security Rules

The app includes comprehensive security rules that:
- Ensure users can only access their own data
- Validate data structure and types
- Prevent unauthorized access
- Limit file upload sizes

### Firestore Indexes

Indexes are automatically created for common queries:
- Transactions by userId and date
- Bank accounts by userId
- User settings by userId

## 📱 Mobile Support

The app is fully responsive and includes:
- Touch-friendly interface
- Mobile-optimized layouts
- Progressive Web App (PWA) capabilities
- Offline functionality

## 🎨 Theming

- **Light Theme** - Clean, bright interface
- **Dark Theme** - Easy on the eyes for night use
- **System Theme** - Automatically matches device preference
- **Custom CSS Variables** - Easy theme customization

## 🔒 Security Features

- **Firebase Authentication** - Industry-standard security
- **Firestore Security Rules** - Server-side data protection
- **Input Validation** - Client and server-side validation
- **HTTPS Only** - All data transmitted securely
- **No Sensitive Data Exposure** - API keys are properly configured

## 📊 Data Migration

To migrate from the old HTML version:

1. Export your data from localStorage (if any)
2. Use the Firebase Admin SDK to import data
3. Follow the data structure in `src/services/firestore.js`

## 🚦 Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Firebase Emulators

For development, you can use Firebase emulators:

```bash
firebase emulators:start
```

This starts local emulators for Auth, Firestore, and Storage.

## 🔄 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Other Platforms

The build folder can be deployed to:
- Netlify
- Vercel
- AWS S3
- Any static hosting service

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Config Errors**
   - Ensure all environment variables are set
   - Check Firebase project settings
   - Verify API keys are correct

2. **Authentication Issues**
   - Enable Email/Password auth in Firebase Console
   - Check auth domain configuration
   - Verify security rules allow user creation

3. **Firestore Permission Errors**
   - Deploy security rules: `firebase deploy --only firestore:rules`
   - Check user authentication status
   - Verify data structure matches rules

### Performance

- The app uses React.memo and useCallback for optimization
- Firestore queries are limited and indexed
- Images are optimized and served from CDN
- Code splitting reduces initial bundle size

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please create an issue in the GitHub repository.

---

**BudgetMaster 2.0** - Modern personal finance management made simple! 💰✨
