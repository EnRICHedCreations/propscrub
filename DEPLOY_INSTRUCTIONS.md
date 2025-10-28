# Firebase Deployment Instructions

## Issue: CORS Error with Production App

Your app at `https://propscrub.web.app` is trying to call the local emulator at `http://127.0.0.1:5001`, which causes a CORS error.

## Solution: Deploy Firebase Functions

### Step 1: Set Twilio Credentials in Firebase

Firebase Functions need environment variables set in the cloud (they don't use `.env` files in production).

Run these commands to set your Twilio credentials:

```bash
# Read your credentials from functions/.env
# Then set them in Firebase:

firebase functions:config:set twilio.account_sid="YOUR_TWILIO_ACCOUNT_SID"
firebase functions:config:set twilio.auth_token="YOUR_TWILIO_AUTH_TOKEN"
```

**Important**: Replace `YOUR_TWILIO_ACCOUNT_SID` and `YOUR_TWILIO_AUTH_TOKEN` with your actual Twilio credentials from `functions/.env`.

### Step 2: Update functions/index.js to Use Firebase Config

The function needs to read from Firebase config instead of process.env:

```javascript
// Change from:
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// To:
const config = functions.config();
const twilioClient = twilio(
  config.twilio.account_sid,
  config.twilio.auth_token
);
```

### Step 3: Deploy Firebase Functions

```bash
firebase deploy --only functions
```

This will output your deployed function URL, which should look like:
```
https://us-central1-propscrub.cloudfunctions.net/validatePhone
```

### Step 4: Update .env.production

Edit `.env.production` and replace with your actual deployed URL:

```
VITE_FIREBASE_FUNCTION_URL=https://us-central1-propscrub.cloudfunctions.net/validatePhone
```

### Step 5: Rebuild and Redeploy Frontend

```bash
npm run build
firebase deploy --only hosting
```

## Alternative: Use Firebase Emulator for Local Development

If you want to test locally instead:

1. Run Firebase emulators:
   ```bash
   firebase emulators:start
   ```

2. Run the app locally (not the deployed version):
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` (not the deployed `https://propscrub.web.app`)

## Verification

After deployment, check:
- Visit `https://propscrub.web.app`
- Upload a CSV file
- Open browser console (F12)
- Should see no CORS errors
- Phone validation should work

## Troubleshooting

### CORS Errors Persist
- Make sure you deployed the functions: `firebase deploy --only functions`
- Check `.env.production` has the correct deployed URL
- Rebuild the frontend: `npm run build && firebase deploy --only hosting`

### Twilio Errors
- Verify Firebase config: `firebase functions:config:get`
- Check Twilio account balance
- Ensure phone numbers are in E.164 format (+1XXXXXXXXXX)

### Function Not Found
- Check deployed functions: `firebase functions:list`
- Verify the URL in `.env.production` matches the deployed URL
- Check Firebase console: https://console.firebase.google.com
