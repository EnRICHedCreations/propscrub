#!/bin/bash
# Setup Vercel Environment Variables
# Run this script to add all required environment variables to Vercel

echo "Setting up Vercel environment variables..."
echo ""

# GHL API Credentials
npx vercel env add GHL_API_URL production <<< "https://services.leadconnectorhq.com"
npx vercel env add GHL_PRIVATE_KEY production <<< "pit-5bc67c72-0396-4b9f-9a7c-3d061aa76d83"
npx vercel env add GHL_LOCATION_ID production <<< "5sLuFTeElBBpk6eVuqkW"

# GHL Custom Field IDs
npx vercel env add GHL_CUSTOM_FIELD_PROPERTY_ADDRESS production <<< "xPIKWiq6fNfk9VZP7kRK"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_2 production <<< "aeUzJqhFVuoh2bwA4RzS"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_3 production <<< "U91Jr6AMXZYyB9sibL7A"
npx vercel env add GHL_CUSTOM_FIELD_EMAIL_2 production <<< "DKQjCraMVUsysZdZZmOY"
npx vercel env add GHL_CUSTOM_FIELD_EMAIL_3 production <<< "o2FLve7plHG5Gpqd7Xp4"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_TYPE production <<< "podeiEQsn16uEk50os9B"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_STATUS production <<< "k7TaYQdjdmoIuc20FEIJ"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_2_TYPE production <<< "EET7VU5CwlXF9rYehwqI"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_2_STATUS production <<< "jaqyssHNtTn8QfdZRgSW"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_3_TYPE production <<< "ok6S4OaZspl3pCYv5yME"
npx vercel env add GHL_CUSTOM_FIELD_PHONE_3_STATUS production <<< "BPLB0hZu2xFbrKPu6ed0"

echo ""
echo "✓ All GHL environment variables added to Vercel!"
echo ""
echo "Note: You still need to add your HLRLookup credentials manually:"
echo "  - HLRLOOKUP_API_KEY"
echo "  - HLRLOOKUP_API_SECRET"
echo ""
echo "Next step: Deploy with 'npx vercel --prod'"
