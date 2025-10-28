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
- **Backend**: Vercel Serverless Functions
- **Hosting**: Vercel
- **Phone Validation**: Twilio Lookup API v2
- **CSV Processing**: PapaParse & json2csv
- **UI Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Vercel account ([vercel.com](https://vercel.com))
- Twilio account with Lookup API access ([twilio.com/console](https://www.twilio.com/console))
- Modern web browser

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/EnRICHedCreations/propscrub.git
cd propscrub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Vercel CLI

```bash
npm install -g vercel
```

### 4. Link to Vercel Project

```bash
vercel link
```

### 5. Configure Environment Variables

Set up Twilio credentials in Vercel:

```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
```

Or via Vercel Dashboard → Project Settings → Environment Variables:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token

Get your credentials from the [Twilio Console](https://console.twilio.com/).

## Development

### Running Locally

Start the Vercel development server (includes both frontend and API):

```bash
npm run dev
```

This starts:
- React app at `http://localhost:3000`
- API endpoints at `http://localhost:3000/api/*`

The Vercel dev server automatically handles both the frontend and serverless functions.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

#### Option 1: Automatic Deployment (Recommended)

1. Push code to GitHub:
   ```bash
   git push origin master
   ```

2. Import project in Vercel:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add environment variables:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
   - Click "Deploy"

3. Auto-deployment is now active:
   - Every push to `master` automatically deploys to production
   - Pull requests generate preview deployments

#### Option 2: Manual Deployment via CLI

```bash
vercel --prod
```

Your app will be available at: `https://your-project.vercel.app`

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
├── api/                       # Vercel Serverless Functions
│   ├── validatePhone.js      # Phone validation endpoint
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
├── vercel.json               # Vercel configuration
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

**Vercel Environment Variables (Production):**
Set in Vercel Dashboard or via CLI:
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

**Local Development:**
Create `.env` file in project root:
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

### API Not Working Locally

Ensure Vercel dev server is running:
```bash
npm run dev
```

### Twilio API Errors

- Verify credentials in Vercel environment variables
- Check Twilio account balance
- Ensure phone numbers are in E.164 format (+1XXXXXXXXXX)

### Build Errors

Clear build cache and reinstall:
```bash
rm -rf node_modules api/node_modules dist .vercel
npm install
```

### CORS Errors

The Vercel function includes CORS headers. If issues persist:
1. Check Vercel Function logs in dashboard
2. Verify the API endpoint in `phoneValidation.ts`

## Development Tips

- Use `vercel dev` for local development to test the full stack
- Test with small CSV files first
- Monitor Twilio usage in the Twilio Console
- Check browser console for detailed error messages
- View Vercel deployment logs for production debugging

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
2. Review Vercel deployment logs in dashboard
3. Check browser console for errors
4. Verify Twilio account status

## Credits

Built with:
- [React](https://react.dev/)
- [Vercel](https://vercel.com/)
- [Twilio](https://www.twilio.com/)
- [Vite](https://vitejs.dev/)
- [PapaParse](https://www.papaparse.com/)
- [Lucide Icons](https://lucide.dev/)
