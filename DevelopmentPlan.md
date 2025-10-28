# PropScrubber Development Plan for Claude Code

## Project Overview
PropScrubber is a React Native Web application for cleaning, normalizing, and validating lead data from CSV files. It standardizes headers, validates phone numbers via Twilio, detects duplicates/missing data, and exports filtered results.

---

## Prerequisites & Setup

### Environment Requirements
- Node.js 18+ and npm/yarn
- Twilio account with API credentials
- Modern web browser for testing

### Initial Setup Commands
```bash
# Create new React app (not React Native - web only)
npx create-react-app propscrubber --template typescript
cd propscrubber

# Install core dependencies
npm install papaparse json2csv
npm install --save-dev @types/papaparse

# Install UI library (optional but recommended)
npm install lucide-react
```

---

## Phase 1: Project Scaffold & Basic UI
**Goal:** Set up project structure and basic upload interface

### Tasks:
1. **Clean up default CRA files**
   - Remove unnecessary boilerplate from `src/App.tsx`
   - Clear default CSS, keep minimal styling

2. **Create base component structure**
   ```
   src/
   ├── components/
   │   ├── FileUpload.tsx
   │   ├── ProgressBar.tsx
   │   ├── FilterToggles.tsx
   │   ├── DataTable.tsx
   │   └── ExportButton.tsx
   ├── utils/
   │   ├── headerMapping.ts
   │   ├── phoneValidation.ts
   │   └── csvExport.ts
   ├── types/
   │   └── index.ts
   └── App.tsx
   ```

3. **Define TypeScript interfaces**
   ```typescript
   // types/index.ts
   export interface RawRow {
     [key: string]: string;
   }

   export interface CleanedRow {
     "First Name": string;
     "Last Name": string;
     "Contact Type": string;
     "Phone": string;
     "Email": string;
     "Property Address": string;
     "Opportunity": string;
     "Name": string;
     "Stage": string;
     "Pipeline": string;
     "Tags": string;
     "Missing Phone": boolean;
     "Duplicate Phone": boolean;
     "Phone Valid": boolean;
     "Phone Type": string;
   }

   export interface ValidationResult {
     valid: boolean;
     type: string;
   }
   ```

4. **Create basic App.tsx shell**
   - State management setup (useState hooks)
   - Basic layout with sections for upload, filters, table, export

### Acceptance Criteria:
- [ ] Project runs without errors (`npm start`)
- [ ] Basic UI shows upload button and placeholder content
- [ ] TypeScript compiles without errors

---

## Phase 2: CSV Upload & Parsing
**Goal:** Enable file upload and parse CSV into structured data

### Tasks:
1. **Implement FileUpload component**
   - File input with accept=".csv"
   - Display selected filename
   - Handle file reading with FileReader API

2. **Integrate PapaParse**
   ```typescript
   // utils/csvParser.ts
   import Papa from 'papaparse';

   export const parseCSV = (file: File): Promise<any[]> => {
     return new Promise((resolve, reject) => {
       Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: (results) => resolve(results.data),
         error: (error) => reject(error)
       });
     });
   };
   ```

3. **Display raw data count**
   - Show "X rows loaded" after successful parse

### Acceptance Criteria:
- [ ] Can upload CSV file via file input
- [ ] PapaParse successfully parses CSV into array of objects
- [ ] Row count displays correctly
- [ ] Error handling for invalid files

---

## Phase 3: Header Normalization
**Goal:** Map inconsistent headers to standardized schema

### Tasks:
1. **Define header mapping constants**
   ```typescript
   // utils/headerMapping.ts
   export const TARGET_HEADERS = [
     "First Name", "Last Name", "Contact Type", "Phone", "Email",
     "Property Address", "Opportunity", "Name", "Stage", "Pipeline", "Tags"
   ] as const;

   export const HEADER_MAP: Record<string, string> = {
     fname: "First Name",
     first: "First Name",
     "first name": "First Name",
     firstname: "First Name",
     lastname: "Last Name",
     "last name": "Last Name",
     contact: "Contact Type",
     phone_number: "Phone",
     phone: "Phone",
     "phone number": "Phone",
     email_address: "Email",
     email: "Email",
     address: "Property Address",
     "property address": "Property Address",
     deal: "Opportunity",
     opportunity: "Opportunity",
     client_name: "Name",
     name: "Name"
   };
   ```

2. **Implement normalization function**
   ```typescript
   export const normalizeRow = (rawRow: RawRow): Partial<CleanedRow> => {
     const normalized: any = {};
     
     TARGET_HEADERS.forEach(targetHeader => {
       const sourceKey = Object.keys(rawRow).find(key => {
         const lowerKey = key.toLowerCase().trim();
         return HEADER_MAP[lowerKey] === targetHeader || 
                lowerKey === targetHeader.toLowerCase();
       });
       
       normalized[targetHeader] = sourceKey ? rawRow[sourceKey]?.trim() : "";
     });

     // Add defaults
     normalized["Stage"] = "New";
     normalized["Pipeline"] = "Default";
     normalized["Tags"] = "";
     
     return normalized;
   };
   ```

3. **Process uploaded data through normalization**
   - Apply normalization to all rows after parsing
   - Display normalized data in simple table

### Acceptance Criteria:
- [ ] Headers correctly map from various formats to standard schema
- [ ] Missing headers result in empty strings
- [ ] Default values (Stage, Pipeline, Tags) auto-populate
- [ ] Can view normalized data in UI

---

## Phase 4: Backend Setup for Twilio Validation
**Goal:** Create API endpoint for phone validation

### Tasks:
1. **Choose backend approach**
   - **Option A:** Express.js server in `/server` directory
   - **Option B:** Serverless function (Vercel/Netlify)
   - **Recommended:** Express.js for development

2. **Set up Express server**
   ```bash
   mkdir server
   cd server
   npm init -y
   npm install express twilio dotenv cors
   npm install --save-dev @types/express @types/cors typescript ts-node
   ```

3. **Create validation endpoint**
   ```typescript
   // server/index.ts
   import express from 'express';
   import twilio from 'twilio';
   import cors from 'cors';
   import dotenv from 'dotenv';

   dotenv.config();

   const app = express();
   app.use(cors());
   app.use(express.json());

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   app.post('/api/validate-phone', async (req, res) => {
     try {
       const { phone } = req.body;
       
       if (!phone) {
         return res.json({ valid: false, type: 'missing' });
       }

       const lookup = await client.lookups.v2
         .phoneNumbers(phone)
         .fetch({ fields: 'line_type_intelligence' });

       res.json({
         valid: true,
         type: lookup.lineTypeIntelligence?.type || 'unknown',
         carrier: lookup.lineTypeIntelligence?.carrierName || 'unknown'
       });
     } catch (error: any) {
       res.json({
         valid: false,
         type: 'invalid',
         error: error.message
       });
     }
   });

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

4. **Create .env file**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   PORT=3001
   ```

5. **Add server scripts to package.json**
   ```json
   "scripts": {
     "server": "cd server && ts-node index.ts",
     "dev": "concurrently \"npm start\" \"npm run server\""
   }
   ```

### Acceptance Criteria:
- [ ] Server runs on port 3001
- [ ] `/api/validate-phone` endpoint responds correctly
- [ ] Valid phones return `{ valid: true, type: 'mobile' }`
- [ ] Invalid phones return `{ valid: false, type: 'invalid' }`
- [ ] CORS properly configured for frontend requests

---

## Phase 5: Phone Validation Integration
**Goal:** Validate phone numbers and display results

### Tasks:
1. **Create phone validation utility**
   ```typescript
   // utils/phoneValidation.ts
   export interface PhoneCache {
     [phone: string]: ValidationResult;
   }

   export const validatePhone = async (
     phone: string,
     cache: PhoneCache
   ): Promise<ValidationResult> => {
     if (cache[phone]) {
       return cache[phone];
     }

     try {
       const response = await fetch('http://localhost:3001/api/validate-phone', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone })
       });

       const result = await response.json();
       cache[phone] = result;
       return result;
     } catch (error) {
       const fallback = { valid: false, type: 'error' };
       cache[phone] = fallback;
       return fallback;
     }
   };
   ```

2. **Implement batch validation with progress**
   ```typescript
   const validateAllPhones = async (rows: CleanedRow[]) => {
     setIsValidating(true);
     const cache: PhoneCache = {};
     const seenPhones = new Set<string>();

     for (let i = 0; i < rows.length; i++) {
       const row = rows[i];
       const phone = row.Phone;

       // Check for missing phone
       row["Missing Phone"] = !phone;

       // Check for duplicate
       row["Duplicate Phone"] = seenPhones.has(phone);
       if (phone) seenPhones.add(phone);

       // Validate phone
       if (phone) {
         const result = await validatePhone(phone, cache);
         row["Phone Valid"] = result.valid;
         row["Phone Type"] = result.type;
       } else {
         row["Phone Valid"] = false;
         row["Phone Type"] = "missing";
       }

       setProgress(Math.round(((i + 1) / rows.length) * 100));
     }

     setIsValidating(false);
     setCleanedData(rows);
   };
   ```

3. **Create ProgressBar component**
   - Show percentage complete
   - Visual progress bar
   - "Validating phones..." message

4. **Add rate limiting / batch size control**
   - Process in chunks if dataset is large (>1000 rows)
   - Add delay between requests if needed

### Acceptance Criteria:
- [ ] Phone validation runs for all rows
- [ ] Progress bar updates in real-time
- [ ] Duplicate phones detected correctly
- [ ] Missing phones flagged
- [ ] Results stored in cleanedData state
- [ ] Caching prevents redundant API calls

---

## Phase 6: Data Filtering
**Goal:** Allow users to filter visible rows

### Tasks:
1. **Create FilterToggles component**
   ```typescript
   interface FilterTogglesProps {
     showDuplicates: boolean;
     showMissingPhones: boolean;
     showInvalidPhones: boolean;
     onToggleDuplicates: () => void;
     onToggleMissingPhones: () => void;
     onToggleInvalidPhones: () => void;
   }
   ```

2. **Implement filter logic**
   ```typescript
   const filteredData = useMemo(() => {
     return cleanedData.filter(row => {
       if (!showDuplicates && row["Duplicate Phone"]) return false;
       if (!showMissingPhones && row["Missing Phone"]) return false;
       if (!showInvalidPhones && !row["Phone Valid"]) return false;
       return true;
     });
   }, [cleanedData, showDuplicates, showMissingPhones, showInvalidPhones]);
   ```

3. **Display filter stats**
   - Show total rows, filtered rows, excluded rows
   - Example: "Showing 450 of 500 rows (50 excluded)"

### Acceptance Criteria:
- [ ] Toggle buttons work correctly
- [ ] Filtered data updates immediately
- [ ] Stats display accurately
- [ ] Can combine multiple filters

---

## Phase 7: Data Display
**Goal:** Show cleaned data in readable table format

### Tasks:
1. **Create DataTable component**
   - Display all TARGET_HEADERS columns
   - Show validation status icons (✅ ❌ ⚠️)
   - Make responsive (horizontal scroll on mobile)

2. **Add conditional styling**
   - Highlight duplicate rows
   - Highlight missing phone rows
   - Highlight invalid phone rows

3. **Optional: Add pagination**
   - If dataset is large, paginate results
   - Show 50-100 rows per page

### Acceptance Criteria:
- [ ] All data displays in table
- [ ] Validation indicators visible
- [ ] Table is readable and scrollable
- [ ] Styling makes issues obvious

---

## Phase 8: CSV Export
**Goal:** Export filtered data as CSV

### Tasks:
1. **Create export utility**
   ```typescript
   // utils/csvExport.ts
   import { Parser } from 'json2csv';

   export const exportToCSV = (data: CleanedRow[], filename: string) => {
     const parser = new Parser({ 
       fields: TARGET_HEADERS 
     });
     
     const csv = parser.parse(data);
     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', filename);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   };
   ```

2. **Create ExportButton component**
   - Button to trigger export
   - Export only filtered data (not all data)
   - Filename: `propscrubber_cleaned_${timestamp}.csv`

3. **Add export stats**
   - Show "Exporting X rows..." toast/notification

### Acceptance Criteria:
- [ ] Export button triggers download
- [ ] CSV contains only filtered rows
- [ ] CSV headers match TARGET_HEADERS
- [ ] Downloaded file opens correctly in Excel/Sheets

---

## Phase 9: UI Polish & Error Handling
**Goal:** Improve UX and handle edge cases

### Tasks:
1. **Add loading states**
   - Spinner during file parsing
   - Disabled buttons during validation
   - Loading skeleton for table

2. **Add error handling**
   - Invalid CSV format
   - Network errors during validation
   - Empty CSV file
   - CSV with no phone column

3. **Add notifications/toasts**
   - Success: "CSV uploaded successfully"
   - Success: "Validation complete"
   - Error: "Failed to validate phones"
   - Info: "Exported 450 rows"

4. **Improve styling**
   - Use Tailwind CSS or styled-components
   - Add consistent spacing and colors
   - Make mobile-responsive

5. **Add help text/tooltips**
   - Explain what each filter does
   - Show example of header mapping
   - Link to Twilio Lookup API docs

### Acceptance Criteria:
- [ ] All error cases handled gracefully
- [ ] Loading states provide clear feedback
- [ ] UI is visually polished and professional
- [ ] Works well on mobile and desktop

---

## Phase 10: Testing & Documentation
**Goal:** Ensure quality and maintainability

### Tasks:
1. **Write unit tests**
   - Test header normalization logic
   - Test phone validation caching
   - Test filter logic
   - Test CSV export

2. **Create test CSV files**
   - Various header formats
   - Mix of valid/invalid phones
   - Duplicate entries
   - Missing data

3. **Write README.md**
   ```markdown
   # PropScrubber

   ## Setup
   1. Clone repo
   2. Install dependencies: `npm install`
   3. Set up Twilio credentials in `server/.env`
   4. Run: `npm run dev`

   ## Features
   - CSV upload and parsing
   - Header normalization
   - Phone validation via Twilio
   - Duplicate detection
   - CSV export

   ## Configuration
   - Modify TARGET_HEADERS in `utils/headerMapping.ts`
   - Add custom header mappings in HEADER_MAP

   ## API
   - POST /api/validate-phone
     - Body: `{ phone: string }`
     - Returns: `{ valid: boolean, type: string }`
   ```

4. **Add inline code comments**
   - Document complex logic
   - Explain caching strategy
   - Note any Twilio API limitations

### Acceptance Criteria:
- [ ] Tests run and pass
- [ ] README is complete and accurate
- [ ] Code is well-commented
- [ ] Test files validate all functionality

---

## Phase 11: Deployment (Optional)
**Goal:** Deploy to production

### Tasks:
1. **Choose deployment platform**
   - Frontend: GitHub Pages
   - Backend: Firebase

2. **Configure environment variables**
   - Set Twilio credentials in hosting platform
   - Update API endpoint URL in frontend

3. **Set up CI/CD**
   - GitHub Actions for automated testing
   - Auto-deploy on push to main branch

4. **Add analytics (optional)**
   - Track usage with Google Analytics
   - Monitor API errors with Sentry

### Acceptance Criteria:
- [ ] App deployed and accessible via URL
- [ ] Environment variables configured
- [ ] Phone validation works in production
- [ ] No console errors in production

---

## Optional Enhancements (Future)
- **Firebase/Firestore integration** for saving cleaned data
- **User authentication** for multi-user support
- **Batch processing** for very large files (10k+ rows)
- **CSV template download** with example headers
- **Webhook integration** to sync with CRMs (HubSpot, Salesforce)
- **Advanced filters** (by state, zip code, date added)
- **Undo/redo** functionality
- **Column reordering** in table
- **Dark mode**

---

## Success Metrics
- [ ] Can process 1000-row CSV in under 5 minutes
- [ ] Phone validation accuracy >95%
- [ ] Zero data loss during processing
- [ ] Exported CSV opens correctly in Excel/Sheets
- [ ] UI is responsive on mobile and desktop

---

## Notes for Claude Code
- Start with Phase 1 and complete sequentially
- Test each phase before moving to next
- Use TypeScript strictly for type safety
- Prioritize functionality over visual polish initially
- Ask for clarification if requirements are ambiguous
- Commit code after each completed phase