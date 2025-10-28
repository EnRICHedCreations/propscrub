# PropScrub

A React web application for cleaning, normalizing, and validating lead data from CSV files. PropScrub standardizes inconsistent CSV headers, validates phone numbers via Twilio Lookup API, detects duplicates and missing data, and exports filtered results.

## Features

- **CSV Upload & Parsing** - Import lead data from CSV files with any header format
- **Smart Header Normalization** - Automatically maps inconsistent headers to a standardized schema
- **Phone Validation** - Validates phone numbers using Twilio Lookup API v2
- **Duplicate Detection** - Identifies duplicate phone numbers across your dataset
- **Missing Data Detection** - Flags rows with missing phone numbers
- **Advanced Filtering** - Toggle visibility of duplicates, missing phones, and invalid phones
- **CSV Export** - Export cleaned and filtered data to CSV format
- **Real-time Progress** - Visual progress tracking during phone validation
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Firebase Cloud Functions
- **Phone Validation**: Twilio Lookup API v2
- **CSV Processing**: PapaParse & json2csv
- **UI Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Firebase account ([console.firebase.google.com](https://console.firebase.google.com))
- Twilio account with Lookup API access ([twilio.com/console](https://www.twilio.com/console))
- Modern web browser

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd PropScrub
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Firebase Functions dependencies
npm run functions:install
```

### 3. Set Up Firebase

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Functions and Hosting)
firebase init

# Select your Firebase project or create a new one
```

### 4. Configure Twilio Credentials

Create a `functions/.env` file with your Twilio credentials:

```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
```

Get your credentials from the [Twilio Console](https://console.twilio.com/).

### 5. Update Firebase Function URL

Edit `src/utils/phoneValidation.ts` and replace `YOUR_PROJECT_ID` with your actual Firebase project ID:

```typescript
const FIREBASE_FUNCTION_URL = import.meta.env.VITE_FIREBASE_FUNCTION_URL ||
  'http://127.0.0.1:5001/your-actual-project-id/us-central1/validatePhone';
```

## Development

### Running Locally with Firebase Emulators

**Terminal 1 - Start Firebase Emulators:**
```bash
npm run emulators
```

This starts the Firebase Functions emulator at `http://127.0.0.1:5001`.

**Terminal 2 - Start Vite Dev Server:**
```bash
npm run dev
```

This starts the React app at `http://localhost:3000`.

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Without Firebase Emulators (Production Mode)

If you've already deployed your Firebase Functions:

1. Set environment variable for production function URL:
   ```bash
   # Create .env.local file
   echo "VITE_FIREBASE_FUNCTION_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/validatePhone" > .env.local
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploy Firebase Functions

```bash
npm run functions:deploy
```

### Deploy Full Application (Functions + Hosting)

```bash
npm run deploy
```

This builds the React app and deploys both the frontend and Firebase Functions.

Your app will be available at: `https://YOUR_PROJECT_ID.web.app`

## Usage

1. **Upload CSV File**
   - Click "Select CSV File" button
   - Choose a CSV file containing lead data
   - Supported headers include: first name, last name, phone, email, address, etc.

2. **Map CSV Columns (NEW!)**
   - After upload, a mapping modal appears automatically
   - PropScrub auto-maps recognized headers (shown with green checkmark)
   - Manually map any unmapped columns using the dropdowns
   - Columns mapped to "-- Skip Column --" will be ignored
   - View stats showing how many columns are mapped/unmapped
   - Click "Confirm Mapping" to proceed or "Cancel" to start over

3. **Automatic Processing**
   - PropScrub validates all phone numbers via Twilio
   - Detects duplicates and missing data
   - Progress bar shows real-time validation status

4. **Filter Results**
   - Use toggle buttons to show/hide:
     - Duplicate phone numbers
     - Missing phone numbers
     - Invalid phone numbers
   - View stats showing total, displayed, and excluded rows

5. **Export Clean Data**
   - Click "Export to CSV" button
   - Downloads filtered data with standardized headers
   - Filename includes timestamp: `propscrub_cleaned_2025-10-26T12-30-45.csv`

## Header Mapping

### Automatic Mapping

PropScrub automatically detects and maps common header variations:

| Standard Header | Recognized Variations |
|----------------|----------------------|
| First Name | fname, first, firstname, first name, first_name |
| Last Name | lname, last, lastname, last name, last_name |
| Phone | phone, phone_number, mobile, cell |
| Email | email, email_address, mail |
| Property Address | address, property address, street address |
| Contact Type | contact, contact type |
| Opportunity Name | deal, opportunity, name, client name, full name |

### Custom Mapping Interface

The new custom mapping modal allows you to:
- **Review auto-detected mappings** - See which columns were automatically matched
- **Manually map columns** - Use dropdowns to map any CSV column to target fields
- **Skip unwanted columns** - Select "-- Skip Column --" to ignore certain columns
- **Reset mappings** - Use "Reset All" button to clear all mappings and start fresh
- **View statistics** - See counts of mapped vs unmapped columns in real-time

To extend automatic mapping, edit `src/utils/headerMapping.ts`.

## Project Structure

```
PropScrub/
├── functions/                 # Firebase Cloud Functions
│   ├── index.js              # Phone validation endpoint
│   └── package.json
├── src/
│   ├── components/           # React components
│   │   ├── FileUpload.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── FilterToggles.tsx
│   │   ├── DataTable.tsx
│   │   └── ExportButton.tsx
│   ├── utils/                # Utility functions
│   │   ├── headerMapping.ts  # Header normalization logic
│   │   ├── csvParser.ts      # CSV parsing
│   │   ├── phoneValidation.ts # Phone validation API client
│   │   └── csvExport.ts      # CSV export
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx               # Main application
│   ├── App.css               # Application styles
│   └── main.tsx              # React entry point
├── firebase.json             # Firebase configuration
├── package.json
└── README.md
```

## Configuration

### Twilio Lookup API

PropScrub uses Twilio Lookup API v2 with Line Type Intelligence:
- Validates phone number format
- Returns phone type (mobile, landline, voip)
- Provides carrier information

**Pricing**: Check [Twilio Lookup Pricing](https://www.twilio.com/lookup/pricing) for current rates.

### Environment Variables

**Frontend (.env.local):**
```bash
VITE_FIREBASE_FUNCTION_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/validatePhone
```

**Backend (functions/.env):**
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

## Performance

- **Caching**: Duplicate phone numbers are validated only once per session
- **Progress Tracking**: Real-time validation progress updates
- **Batch Processing**: Processes large datasets efficiently
- **Responsive**: Handles 1000+ row CSVs

## Troubleshooting

### Functions Not Working Locally

Ensure Firebase emulators are running:
```bash
npm run emulators
```

### Twilio API Errors

- Verify credentials in `functions/.env`
- Check Twilio account balance
- Ensure phone numbers are in E.164 format (+1XXXXXXXXXX)

### Build Errors

Clear build cache and reinstall:
```bash
rm -rf node_modules functions/node_modules dist
npm install
npm run functions:install
```

### CORS Errors

The Firebase Function includes CORS headers. If issues persist:
1. Check Firebase Function logs: `firebase functions:log`
2. Verify the function URL in `phoneValidation.ts`

## Development Tips

- Use Firebase emulators for local development to avoid API costs
- Test with small CSV files first
- Monitor Twilio usage in the Twilio Console
- Check browser console for detailed error messages

## Future Enhancements

- User authentication for multi-user support
- Saved validation history in Firestore
- Webhook integration with CRMs (HubSpot, Salesforce)
- Advanced filters (by state, zip code, date)
- Column reordering in data table
- Dark mode support
- Batch processing for very large files (10k+ rows)

## License

ISC

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Firebase Functions logs: `firebase functions:log`
3. Check browser console for errors
4. Verify Twilio account status

## Credits

Built with:
- [React](https://react.dev/)
- [Firebase](https://firebase.google.com/)
- [Twilio](https://www.twilio.com/)
- [Vite](https://vitejs.dev/)
- [PapaParse](https://www.papaparse.com/)
- [Lucide Icons](https://lucide.dev/)
