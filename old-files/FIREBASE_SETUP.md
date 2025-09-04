# Firebase Configuration Setup

## How to Configure Firebase for BudgetMaster

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "budgetmaster-app")
4. Disable Google Analytics (optional for this app)
5. Click "Create project"

### Step 2: Add Web App
1. In project overview, click the web icon (</>)
2. Register app with nickname "BudgetMaster Web"
3. Don't enable Firebase Hosting yet
4. Copy the configuration object

### Step 3: Enable Firestore
1. Go to "Firestore Database" in left sidebar
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location closest to your users
5. Click "Done"

### Step 4: Enable Authentication (Optional)
1. Go to "Authentication" in left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain to authorized domains

### Step 5: Configure Your App

#### Option A: Global Configuration (Recommended)
Add this to the `<head>` section of your HTML, before the BudgetMaster script:

```html
<script>
window.FIREBASE_CONFIG = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
</script>
```

#### Option B: Environment Variables (For Development)
If using a build system, create a `.env` file:

```env
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 6: Test Configuration
1. Open your BudgetMaster app
2. If configured correctly, you should see:
   - No "Firebase not configured" errors in console
   - "Connect" button in settings works
   - Can sign in with Google

### Step 7: Production Setup

#### Firestore Security Rules
Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own budget data
    match /budgetMaster/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Authentication Settings
1. Go to Authentication > Settings
2. Add your production domain to "Authorized domains"
3. Configure OAuth consent screen in Google Cloud Console

### Troubleshooting

#### Common Issues:

1. **"Firebase not configured" error**
   - Check if `window.FIREBASE_CONFIG` is set before the app loads
   - Verify all config values are correct (no placeholder text)

2. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure user is authenticated before accessing data

3. **"Failed to get document" errors**
   - Verify project ID is correct
   - Check network connectivity
   - Ensure Firestore is enabled

4. **Authentication not working**
   - Add your domain to authorized domains
   - Check OAuth consent screen configuration
   - Verify API key has correct permissions

### Sample Configuration

Here's what a complete configuration looks like:

```html
<!DOCTYPE html>
<html>
<head>
    <title>BudgetMaster</title>
    <!-- Firebase Configuration -->
    <script>
    window.FIREBASE_CONFIG = {
        apiKey: "AIzaSyC4XzK1J2M3N4O5P6Q7R8S9T0U1V2W3X4Y",
        authDomain: "budgetmaster-12345.firebaseapp.com",
        projectId: "budgetmaster-12345",
        storageBucket: "budgetmaster-12345.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:abc123def456ghi789"
    };
    </script>
    <!-- Rest of your HTML -->
</head>
<body>
    <!-- Your BudgetMaster app -->
</body>
</html>
```

### Security Best Practices

1. **Never expose private keys** - Only use public Firebase config
2. **Use Firestore security rules** - Don't rely on client-side security
3. **Enable App Check** (optional) - For production apps
4. **Monitor usage** - Set up billing alerts
5. **Regular backups** - Export Firestore data periodically

### Local Development

For local development without Firebase:
- The app works in "local-only" mode
- Data is stored in browser localStorage
- No cloud sync functionality
- Perfect for testing and development
