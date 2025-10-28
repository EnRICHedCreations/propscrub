# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PropScrubber is a React web application (NOT React Native) for cleaning, normalizing, and validating lead data from CSV files. The application standardizes inconsistent CSV headers, validates phone numbers via Twilio Lookup API, detects duplicates and missing data, and exports filtered results.

## Architecture

### Frontend (React TypeScript)
- **Entry Point**: `src/App.tsx` - Main application shell with state management
- **Component Structure**:
  - `components/FileUpload.tsx` - CSV file upload interface
  - `components/ProgressBar.tsx` - Real-time validation progress
  - `components/FilterToggles.tsx` - Toggle filters for duplicates/missing/invalid
  - `components/DataTable.tsx` - Display normalized and validated data
  - `components/ExportButton.tsx` - Export filtered CSV

### Backend (Firebase Cloud Functions)
- **Location**: `functions/` directory
- **Function**: `validatePhone` - HTTP endpoint for Twilio Lookup API proxy
- **Local URL**: `http://127.0.0.1:5001/PROJECT_ID/us-central1/validatePhone`
- **Purpose**: Keeps Twilio credentials server-side, serverless scaling, CORS handling

### Core Utilities
- `utils/headerMapping.ts` - Maps inconsistent CSV headers to standardized schema
  - `TARGET_HEADERS`: Canonical header list (First Name, Last Name, Phone, etc.)
  - `HEADER_MAP`: Mapping dictionary for common variations
  - `normalizeRow()`: Transforms raw CSV row to CleanedRow format
- `utils/phoneValidation.ts` - Phone validation with caching layer
  - `validatePhone()`: Calls backend API, caches results by phone number
  - `PhoneCache`: In-memory cache to prevent redundant API calls
- `utils/csvParser.ts` - PapaParse wrapper for CSV ingestion
- `utils/csvExport.ts` - json2csv wrapper for export

### Type System
- `types/index.ts` defines:
  - `RawRow`: Unprocessed CSV data with arbitrary headers
  - `CleanedRow`: Normalized data with validation flags (Missing Phone, Duplicate Phone, Phone Valid, Phone Type)
  - `ValidationResult`: Twilio API response structure

## Data Flow

1. **Upload** → PapaParse converts CSV to RawRow[]
2. **Normalize** → Map headers via `normalizeRow()` to CleanedRow[]
3. **Validate** → Batch process phones through backend API, update validation flags
4. **Filter** → useMemo hook filters based on toggle states
5. **Export** → json2csv exports filtered data only

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install
npm run functions:install

# Set up Firebase
firebase login
firebase init  # Select Functions and Hosting

# Configure Twilio credentials
# Create functions/.env with:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

### Running the Application
```bash
# Terminal 1 - Start Firebase emulators
npm run emulators

# Terminal 2 - Start Vite dev server
npm run dev
```

The app will be available at `http://localhost:3000` and Firebase Functions at `http://127.0.0.1:5001`.

### Environment Configuration
Create `functions/.env`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

Update `src/utils/phoneValidation.ts` with your Firebase project ID in the FIREBASE_FUNCTION_URL constant.

## Key Implementation Details

### Header Normalization
- Case-insensitive matching: "firstname", "First Name", "FIRSTNAME" all map to "First Name"
- Missing headers default to empty strings
- Default values auto-populate: Stage="New", Pipeline="Default", Tags=""

### Phone Validation Strategy
- **Caching**: Duplicate phone numbers validated only once per session
- **Duplicate Detection**: Uses Set to track seen phone numbers in order
- **Batch Processing**: Processes rows sequentially with progress updates
- **Rate Limiting**: For large datasets (>1000 rows), implement chunking and delays
- **Validation Flags**:
  - `Missing Phone`: No phone number in row
  - `Duplicate Phone`: Phone number appeared earlier in CSV
  - `Phone Valid`: Twilio validated successfully
  - `Phone Type`: mobile/landline/voip/invalid/missing/error

### Filter Logic
Filters are **inclusive** by default (show all). When toggled off:
- `!showDuplicates` → Hide rows where `Duplicate Phone === true`
- `!showMissingPhones` → Hide rows where `Missing Phone === true`
- `!showInvalidPhones` → Hide rows where `Phone Valid === false`

Filters combine with AND logic (all active filters must pass).

### Export Behavior
- Exports **only filtered rows** (not all rows)
- Filename format: `propscrubber_cleaned_${timestamp}.csv`
- Uses TARGET_HEADERS for column order
- Excludes validation flags (Missing Phone, etc.) from export

## Development Phases

Follow the 11-phase plan in `DevelopmentPlan.md` (adapted for Firebase):
1. Project scaffold (Vite + React + TypeScript, folder structure)
2. CSV upload & PapaParse integration
3. Header normalization
4. Backend API setup (Firebase Functions + Twilio)
5. Phone validation integration
6. Data filtering
7. Data table display
8. CSV export
9. UI polish & error handling
10. Testing & documentation
11. Deployment (Firebase Hosting + Functions)

Complete each phase sequentially and test before proceeding.

## Technical Constraints

- **Web Only**: Use React with Vite, NOT React Native or Expo
- **TypeScript Strict Mode**: Enable strict type checking
- **No Emojis in Code**: Use lucide-react icons for UI (✓ → Check icon)
- **Backend**: Firebase Cloud Functions (serverless), NOT Express.js
- **CORS**: Firebase Function includes CORS middleware for all origins during development
- **CSV Library**: Use PapaParse for parsing, json2csv for export (not custom implementations)
- **Phone Format**: Twilio expects E.164 format (+1XXXXXXXXXX)

## Common Pitfalls

- **Don't normalize headers manually** - Use HEADER_MAP for extensibility
- **Don't validate same phone twice** - Always check cache first
- **Don't export all data** - Export filteredData, not cleanedData
- **Don't store Twilio creds in frontend** - Use Firebase Functions with environment variables
- **Don't batch API calls** - Twilio Lookup is single-phone-per-request
- **Don't deploy without updating PROJECT_ID** - Update the Firebase project ID in phoneValidation.ts before deploying
