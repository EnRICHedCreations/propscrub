# PropScrub Quick Start Guide

Get PropScrub running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Twilio account ([sign up free](https://www.twilio.com/try-twilio))
- A Firebase account ([sign up free](https://console.firebase.google.com))

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
npm run functions:install
```

### 2. Set Up Firebase

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize your project
firebase init
```

**When prompted:**
- Select: **Functions** and **Hosting**
- Choose: **Create a new project** or **Use existing project**
- Language: **JavaScript**
- ESLint: **No** (optional)
- Install dependencies: **Yes**
- Public directory: **dist**
- Single-page app: **Yes**
- GitHub deploys: **No** (optional)

### 3. Get Your Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token**
3. Note them down

### 4. Configure Environment Variables

Create `functions/.env`:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### 5. Update Firebase Project ID

Edit `src/utils/phoneValidation.ts`:

Replace `YOUR_PROJECT_ID` on line 7 with your actual Firebase project ID (from the Firebase console).

Example:
```typescript
'http://127.0.0.1:5001/my-propscrub-app/us-central1/validatePhone';
```

### 6. Run the Application

**Terminal 1 - Firebase Emulators:**
```bash
npm run emulators
```

Wait for: ✔ All emulators ready!

**Terminal 2 - React App:**
```bash
npm run dev
```

### 7. Test It Out!

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload the included `sample-leads.csv` file
3. Watch it validate phone numbers in real-time!
4. Filter and export your cleaned data

## Common Issues

### "Firebase project not found"
Run: `firebase use --add` and select your project

### "Twilio authentication failed"
Double-check your credentials in `functions/.env`

### "CORS error"
Make sure Firebase emulators are running in Terminal 1

### "Cannot find module 'firebase-functions'"
Run: `npm run functions:install`

## Next Steps

- Customize header mappings in `src/utils/headerMapping.ts`
- Add your own test CSV files
- Deploy to production: `npm run deploy`

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.
