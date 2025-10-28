#!/bin/bash

echo "=== PropScrub Quick Deployment Fix ==="
echo ""
echo "This script will help you deploy your Firebase Functions to fix the CORS error."
echo ""

# Check if functions/.env exists
if [ ! -f "functions/.env" ]; then
    echo "ERROR: functions/.env not found!"
    echo "Please create functions/.env with your Twilio credentials:"
    echo "TWILIO_ACCOUNT_SID=ACxxxxx"
    echo "TWILIO_AUTH_TOKEN=xxxxx"
    exit 1
fi

echo "Step 1: Reading Twilio credentials from functions/.env..."
source functions/.env

if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ]; then
    echo "ERROR: Twilio credentials not found in functions/.env"
    exit 1
fi

echo "Found credentials!"
echo ""

echo "Step 2: Setting Firebase Functions config..."
firebase functions:config:set \
    twilio.account_sid="$TWILIO_ACCOUNT_SID" \
    twilio.auth_token="$TWILIO_AUTH_TOKEN"

echo ""
echo "Step 3: Deploying Firebase Functions..."
firebase deploy --only functions

echo ""
echo "Step 4: Getting deployed function URL..."
firebase functions:list

echo ""
echo "=== NEXT STEPS ==="
echo "1. Copy the deployed function URL from above"
echo "2. Update .env.production with the URL:"
echo "   VITE_FIREBASE_FUNCTION_URL=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/validatePhone"
echo "3. Rebuild and redeploy:"
echo "   npm run build"
echo "   firebase deploy --only hosting"
echo ""
echo "Done!"
