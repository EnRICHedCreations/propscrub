# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PropScrubber is a React web application (NOT React Native) for cleaning, normalizing, and validating lead data from CSV files. The application standardizes inconsistent CSV headers, validates phone numbers via HLRLookup.com API with live status checking, detects duplicates and missing data, and exports filtered results.

## Architecture

### Frontend (React TypeScript)
- **Entry Point**: `src/App.tsx` - Main application shell with state management
- **Component Structure**:
  - `components/FileUpload.tsx` - CSV file upload interface
  - `components/ProgressBar.tsx` - Real-time validation progress
  - `components/FilterToggles.tsx` - Toggle filters for duplicates/missing/invalid
  - `components/DataTable.tsx` - Display normalized and validated data
  - `components/ExportButton.tsx` - Export filtered CSV

### Backend (Vercel Serverless Functions)
- **Location**: `api/` directory
- **Function**: `validatePhone.js` - HTTP endpoint for HLRLookup.com API proxy
- **Local URL**: `http://localhost:3000/api/validatePhone`
- **Production URL**: `/api/validatePhone` (relative path, auto-resolves)
- **Purpose**: Keeps HLRLookup credentials server-side, serverless scaling, CORS handling

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
  - `CleanedRow`: Normalized data with validation flags (Missing Phone, Duplicate Phone, Phone Valid, Phone Type, Phone Status, Phone Carrier, Phone Ported, Phone Roaming)
  - `ValidationResult`: HLRLookup.com API response structure with HLR data (liveStatus, isPorted, isRoaming, carrier info)

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

# Install Vercel CLI
npm install -g vercel

# Configure HLRLookup credentials
# Create .env file in project root:
HLRLOOKUP_API_KEY=your_api_key
HLRLOOKUP_API_SECRET=your_api_secret
```

### Running the Application
```bash
# Start Vercel dev server (handles both frontend and API)
npm run dev
```

The app will be available at `http://localhost:3000` with API at `http://localhost:3000/api/*`.

### Environment Configuration
Create `.env` in project root:
```
HLRLOOKUP_API_KEY=your_api_key
HLRLOOKUP_API_SECRET=your_api_secret
```

For production, set environment variables in Vercel Dashboard or via:
```bash
vercel env add HLRLOOKUP_API_KEY
vercel env add HLRLOOKUP_API_SECRET
```

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
- **Validation Flags** (Basic Scrub):
  - `Missing Phone`: No phone number in row
  - `Duplicate Phone`: Phone number appeared earlier in CSV
- **HLR Validation Flags** (Prison Scrub only):
  - `Phone Valid`: HLRLookup validated successfully
  - `Phone Type`: mobile/landline/voip/invalid/missing/error
  - `Phone Status`: LIVE/NOT_LIVE status from HLR lookup
  - `Phone Carrier`: Current carrier name
  - `Phone Ported`: Yes/No - indicates if number was ported
  - `Phone Roaming`: Yes/No - current roaming status

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

Follow the 11-phase plan in `DevelopmentPlan.md` (adapted for Vercel):
1. Project scaffold (Vite + React + TypeScript, folder structure)
2. CSV upload & PapaParse integration
3. Header normalization
4. Backend API setup (Vercel Serverless Functions + HLRLookup.com)
5. Phone validation integration (Prison Scrub tier with HLR data)
6. Data filtering
7. Data table display
8. CSV export
9. UI polish & error handling
10. Testing & documentation
11. Deployment (Vercel Hosting + Functions)

Complete each phase sequentially and test before proceeding.

## Technical Constraints

- **Web Only**: Use React with Vite, NOT React Native or Expo
- **TypeScript Strict Mode**: Enable strict type checking
- **No Emojis in Code**: Use lucide-react icons for UI (✓ → Check icon)
- **Backend**: Vercel Serverless Functions, NOT Express.js or Firebase
- **CORS**: Vercel Function includes CORS middleware for allowed origins
- **CSV Library**: Use PapaParse for parsing, json2csv for export (not custom implementations)
- **Phone Format**: HLRLookup expects E.164 format (+1XXXXXXXXXX)

## Common Pitfalls

- **Don't normalize headers manually** - Use HEADER_MAP for extensibility
- **Don't validate same phone twice** - Always check cache first
- **Don't export all data** - Export filteredData, not cleanedData
- **Don't store HLRLookup creds in frontend** - Use Vercel Functions with environment variables
- **Don't batch API calls** - HLRLookup is single-phone-per-request
- **Don't forget env vars** - Set HLRLOOKUP credentials in Vercel Dashboard before deploying
- **Don't validate in Basic Scrub** - Phone validation (HLR data) is Prison Scrub only
