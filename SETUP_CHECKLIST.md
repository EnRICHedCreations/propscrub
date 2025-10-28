# PropScrub Setup Checklist

Use this checklist to get PropScrub running on your machine.

## ✅ Pre-Setup (One-Time)

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Created Twilio account at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
- [ ] Created Firebase account at [console.firebase.google.com](https://console.firebase.google.com)

## 📦 Installation

- [ ] Run `npm install` in project root
- [ ] Run `npm run functions:install` to install Firebase Functions dependencies
- [ ] Install Firebase CLI: `npm install -g firebase-tools`

## 🔐 Firebase Configuration

- [ ] Run `firebase login` to authenticate
- [ ] Run `firebase init` and select:
  - [ ] Functions (JavaScript)
  - [ ] Hosting
- [ ] Create/select Firebase project
- [ ] Copy your Firebase project ID from console
- [ ] Edit `src/utils/phoneValidation.ts`:
  - [ ] Replace `YOUR_PROJECT_ID` with your actual project ID on line 7

## 🔑 Twilio Configuration

- [ ] Log into [Twilio Console](https://console.twilio.com/)
- [ ] Copy your **Account SID**
- [ ] Copy your **Auth Token**
- [ ] Create file `functions/.env` with:
  ```
  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_AUTH_TOKEN=your_auth_token_here
  ```

## 🚀 First Run

- [ ] Open Terminal 1: Run `npm run emulators`
  - [ ] Wait for "✔ All emulators ready!"
- [ ] Open Terminal 2: Run `npm run dev`
  - [ ] Wait for "Local: http://localhost:3000"
- [ ] Open browser to [http://localhost:3000](http://localhost:3000)
- [ ] You should see "PropScrub" header

## 🧪 Test the App

- [ ] Click "Select CSV File"
- [ ] Upload `sample-leads.csv` from project folder
- [ ] Watch progress bar validate phone numbers
- [ ] View the data table with color-coded rows
- [ ] Toggle filters (Duplicates, Missing Phones, Invalid Phones)
- [ ] Click "Export to CSV" to download cleaned data
- [ ] Open exported file in Excel/Google Sheets to verify

## ✅ Verification

If everything works:
- [ ] No errors in browser console (F12)
- [ ] Progress bar reaches 100%
- [ ] Data table shows validated records
- [ ] Export downloads a .csv file
- [ ] Sample file has 10 rows (2 duplicates, 1 missing, 1 invalid)

## 🐛 Troubleshooting

### "Cannot find Firebase project"
- Run `firebase use --add` and select your project

### "Authentication failed" (Twilio)
- Check `functions/.env` has correct credentials
- Ensure no extra spaces around = sign

### "CORS error"
- Ensure Firebase emulators are running
- Check Functions emulator is on port 5001

### "Cannot find module"
- Run `npm install` again
- Run `npm run functions:install` again
- Delete `node_modules` and reinstall

### Progress bar stuck at 0%
- Check browser console for errors
- Verify Firebase emulators are running
- Check `phoneValidation.ts` has correct project ID

## 🚢 Ready to Deploy?

After local testing works:
- [ ] Build production version: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Deploy functions: `npm run functions:deploy`
- [ ] Deploy everything: `npm run deploy`
- [ ] Update `.env.local` with production function URL

## 📚 Need Help?

- Check [QUICKSTART.md](./QUICKSTART.md) for detailed setup
- Read [README.md](./README.md) for full documentation
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture

---

**Once all boxes are checked, you're ready to clean some leads! 🎉**
