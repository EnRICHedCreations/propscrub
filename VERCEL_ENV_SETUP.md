# Vercel Environment Variables Setup

## Option 1: Using Vercel Dashboard (Recommended for Windows)

1. Go to https://vercel.com/dashboard
2. Select your PropScrub project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below:

### GHL API Credentials
```
GHL_API_URL = https://services.leadconnectorhq.com
GHL_PRIVATE_KEY = pit-5bc67c72-0396-4b9f-9a7c-3d061aa76d83
GHL_LOCATION_ID = 5sLuFTeElBBpk6eVuqkW
```

### GHL Custom Field IDs
```
GHL_CUSTOM_FIELD_PROPERTY_ADDRESS = xPIKWiq6fNfk9VZP7kRK
GHL_CUSTOM_FIELD_PHONE_2 = aeUzJqhFVuoh2bwA4RzS
GHL_CUSTOM_FIELD_PHONE_3 = U91Jr6AMXZYyB9sibL7A
GHL_CUSTOM_FIELD_EMAIL_2 = DKQjCraMVUsysZdZZmOY
GHL_CUSTOM_FIELD_EMAIL_3 = o2FLve7plHG5Gpqd7Xp4
GHL_CUSTOM_FIELD_PHONE_TYPE = podeiEQsn16uEk50os9B
GHL_CUSTOM_FIELD_PHONE_STATUS = k7TaYQdjdmoIuc20FEIJ
GHL_CUSTOM_FIELD_PHONE_2_TYPE = EET7VU5CwlXF9rYehwqI
GHL_CUSTOM_FIELD_PHONE_2_STATUS = jaqyssHNtTn8QfdZRgSW
GHL_CUSTOM_FIELD_PHONE_3_TYPE = ok6S4OaZspl3pCYv5yME
GHL_CUSTOM_FIELD_PHONE_3_STATUS = BPLB0hZu2xFbrKPu6ed0
```

### HLRLookup Credentials (Optional - for phone validation)
```
HLRLOOKUP_API_KEY = your_actual_key_here
HLRLOOKUP_API_SECRET = your_actual_secret_here
```

**Important**:
- For each variable, select **Production** environment
- You can also select **Preview** and **Development** if you want the same values for all environments

## Option 2: Using Vercel CLI (Command Line)

If you prefer using the command line, run these commands one by one in PowerShell or CMD:

```powershell
# Navigate to project directory first
cd "C:\Users\rfdec\OneDrive\OneNote\Coding Projects\Wholesailors\PropScrub"

# Link to Vercel project (if not already linked)
npx vercel link

# Add GHL API Credentials
npx vercel env add GHL_API_URL production
# When prompted, enter: https://services.leadconnectorhq.com

npx vercel env add GHL_PRIVATE_KEY production
# When prompted, enter: pit-5bc67c72-0396-4b9f-9a7c-3d061aa76d83

npx vercel env add GHL_LOCATION_ID production
# When prompted, enter: 5sLuFTeElBBpk6eVuqkW

# Add Custom Field IDs (repeat for each)
npx vercel env add GHL_CUSTOM_FIELD_PROPERTY_ADDRESS production
# Enter: xPIKWiq6fNfk9VZP7kRK

npx vercel env add GHL_CUSTOM_FIELD_PHONE_2 production
# Enter: aeUzJqhFVuoh2bwA4RzS

npx vercel env add GHL_CUSTOM_FIELD_PHONE_3 production
# Enter: U91Jr6AMXZYyB9sibL7A

npx vercel env add GHL_CUSTOM_FIELD_EMAIL_2 production
# Enter: DKQjCraMVUsysZdZZmOY

npx vercel env add GHL_CUSTOM_FIELD_EMAIL_3 production
# Enter: o2FLve7plHG5Gpqd7Xp4

npx vercel env add GHL_CUSTOM_FIELD_PHONE_TYPE production
# Enter: podeiEQsn16uEk50os9B

npx vercel env add GHL_CUSTOM_FIELD_PHONE_STATUS production
# Enter: k7TaYQdjdmoIuc20FEIJ

npx vercel env add GHL_CUSTOM_FIELD_PHONE_2_TYPE production
# Enter: EET7VU5CwlXF9rYehwqI

npx vercel env add GHL_CUSTOM_FIELD_PHONE_2_STATUS production
# Enter: jaqyssHNtTn8QfdZRgSW

npx vercel env add GHL_CUSTOM_FIELD_PHONE_3_TYPE production
# Enter: ok6S4OaZspl3pCYv5yME

npx vercel env add GHL_CUSTOM_FIELD_PHONE_3_STATUS production
# Enter: BPLB0hZu2xFbrKPu6ed0
```

## After Adding Environment Variables

Once all environment variables are added, deploy the project:

```bash
npx vercel --prod
```

Or wait for automatic deployment if you have GitHub integration enabled.

## Verify Deployment

1. Go to your Vercel deployment URL
2. Upload a test CSV file
3. Click "Export to GHL" button
4. Check your GHL account for the imported contacts

## Troubleshooting

If the export fails:
1. Check Vercel Function logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure GHL custom field IDs match your actual field IDs
4. Check that GHL_PRIVATE_KEY has correct permissions
