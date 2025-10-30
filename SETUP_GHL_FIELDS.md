# GHL Custom Fields Setup Guide

This guide will help you automatically create all required custom fields in GoHighLevel for the PropScrub integration.

## Overview

Instead of manually creating custom fields through the GHL UI, this script uses the GHL API to programmatically create all 21 required custom fields.

## Prerequisites

### 1. Create Your Private Integration Key

**Important:** PropScrub uses GHL's **Private Integration** (OAuth-based) for secure authentication, not the simple API Key.

**Steps:**
1. Log into your GoHighLevel account
2. **Select the Sub-Account** you want to integrate with (e.g., "Wholesale Softwares")
3. Go to **Settings → Private Integrations**
4. Click **Create New Integration**
5. Fill in the form:
   - **Name**: "PropScrub Integration"
   - **Description**: "Lead cleaning and validation tool"
6. Select **Scopes** (checkboxes):
   - ✓ `contacts.readonly`
   - ✓ `contacts.write`
   - ✓ `opportunities.readonly`
   - ✓ `opportunities.write`
   - ✓ `locations/customFields.readonly`
   - ✓ `locations/customFields.write`
   - ✓ `locations/tags.readonly`
   - ✓ `locations/tags.write`
7. Click **Create**
8. **Copy the Private Integration Key** (you'll only see this once!)

**Documentation:**
- Private Integrations Guide: https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken
- OAuth Getting Started: https://marketplace.gohighlevel.com/docs/oauth/GettingStarted

### 2. Get Your Location ID

The Location ID is your GHL sub-account ID.

**Method 1 - From URL:**
1. Log into the GHL sub-account where you want to create fields
2. Look at the browser URL
3. Find the location ID in the URL pattern:
   ```
   https://app.gohighlevel.com/location/{LOCATION_ID}/dashboard
   ```
4. Copy the alphanumeric ID (e.g., `abc123def456`)

**Method 2 - From API:**
```bash
curl -X GET "https://services.leadconnectorhq.com/locations/" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. Update Your .env File

Add these variables to your `.env` file in the project root:

```env
# GHL Private Integration Configuration
GHL_PRIVATE_KEY=your_private_integration_key_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_URL=https://services.leadconnectorhq.com
```

**Security Note:** Never commit your `.env` file to git. It should be in `.gitignore`.

## Before Running the Script: Test with Postman

**Highly Recommended:** Test your Private Integration Key in Postman first before running the setup script.

### Why Test First?
- Verify your credentials work
- Understand GHL API responses
- Debug auth issues quickly
- See exact request/response data

### Quick Postman Setup:
1. Install Postman: https://www.postman.com/downloads/
2. Import collection: `postman/PropScrub-GHL-API.postman_collection.json`
3. Import environment: `postman/PropScrub-GHL.postman_environment.json`
4. Update environment variables with your Private Integration Key and Location ID
5. Run "Test Authentication" request

**Full Guide:** See `postman/POSTMAN_SETUP.md` for detailed instructions

---

## Installation

### Install Required Dependencies

```bash
npm install node-fetch dotenv
```

Or if using the Vercel function, these are already in your dependencies.

## Running the Setup Script

### Option 1: Run as Standalone Script (Recommended)

```bash
node scripts/setupGHLFields.js
```

**Expected Output:**
```
=================================================
PropScrub GHL Custom Fields Setup
=================================================

Location ID: abc123def456
API URL: https://services.leadconnectorhq.com

Fetching existing custom fields...
Found 5 existing custom fields

Creating custom fields...

✓ Created: Contact Type (ID: cf_abc123)
✓ Created: Property Address (ID: cf_def456)
✓ Created: Phone 2 (ID: cf_ghi789)
...

=================================================
Setup Complete
=================================================

✓ Created: 21 fields
⊘ Skipped: 0 fields
✗ Failed: 0 fields

=================================================
Environment Variables for .env
=================================================

GHL_CUSTOM_FIELD_CONTACT_TYPE=cf_abc123
GHL_CUSTOM_FIELD_PROPERTY_ADDRESS=cf_def456
GHL_CUSTOM_FIELD_PHONE_2=cf_ghi789
...
```

### Option 2: Run via Vercel Function

After deploying to Vercel, you can trigger it via HTTP:

```bash
curl -X POST https://your-app.vercel.app/api/setupGHLCustomFields
```

Or visit in browser:
```
https://your-app.vercel.app/api/setupGHLCustomFields
```

## Custom Fields Created

The script creates **21 custom fields** in total:

### Basic Fields (6)
1. **Contact Type** (Dropdown) - Owner, Tenant, Agent, Property Manager, Other
2. **Property Address** (Text)
3. **Phone 2** (Phone)
4. **Phone 3** (Phone)
5. **Email 2** (Text)
6. **Email 3** (Text)

### Prison Scrub Fields - Phone 1 (5)
7. **Phone Type** (Dropdown) - Mobile, Landline, VoIP, Unknown
8. **Phone Status** (Dropdown) - LIVE, NOT_LIVE, Unknown
9. **Phone Carrier** (Text)
10. **Phone Ported** (Dropdown) - Yes, No, Unknown
11. **Phone Roaming** (Dropdown) - Yes, No, Unknown

### Prison Scrub Fields - Phone 2 (5)
12. **Phone 2 Type** (Dropdown)
13. **Phone 2 Status** (Dropdown)
14. **Phone 2 Carrier** (Text)
15. **Phone 2 Ported** (Dropdown)
16. **Phone 2 Roaming** (Dropdown)

### Prison Scrub Fields - Phone 3 (5)
17. **Phone 3 Type** (Dropdown)
18. **Phone 3 Status** (Dropdown)
19. **Phone 3 Carrier** (Text)
20. **Phone 3 Ported** (Dropdown)
21. **Phone 3 Roaming** (Dropdown)

## After Setup: Configure Environment Variables

After running the script, it will output all the custom field IDs. You need to add these to your environment:

### For Local Development

Add to `.env`:
```env
GHL_CUSTOM_FIELD_CONTACT_TYPE=cf_xxxxx
GHL_CUSTOM_FIELD_PROPERTY_ADDRESS=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3=cf_xxxxx
GHL_CUSTOM_FIELD_EMAIL_2=cf_xxxxx
GHL_CUSTOM_FIELD_EMAIL_3=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_TYPE=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_STATUS=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_CARRIER=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_PORTED=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_ROAMING=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2_TYPE=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2_STATUS=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2_CARRIER=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2_PORTED=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_2_ROAMING=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3_TYPE=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3_STATUS=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3_CARRIER=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3_PORTED=cf_xxxxx
GHL_CUSTOM_FIELD_PHONE_3_ROAMING=cf_xxxxx
```

### For Vercel Production

Add each variable in Vercel Dashboard:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable for **Production**, **Preview**, and **Development**

Or use Vercel CLI:
```bash
vercel env add GHL_CUSTOM_FIELD_CONTACT_TYPE
# Paste the value when prompted
# Repeat for all fields
```

## Troubleshooting

### Error: "GHL_PRIVATE_KEY environment variable not set"

**Solution**: Make sure `.env` file exists and contains:
```env
GHL_PRIVATE_KEY=your_actual_private_integration_key
```

### Error: "401 Unauthorized"

**Causes**:
- Invalid Private Integration Key
- Key doesn't have required scopes
- Key was deleted or revoked

**Solution**:
1. Verify Private Integration Key is correct (copy-paste again from GHL)
2. Check scopes in GHL (Settings → Private Integrations)
3. Ensure all required scopes are enabled (see Prerequisites section)
4. Generate a new Private Integration if needed

### Error: "403 Forbidden"

**Causes**:
- Private Integration Key doesn't have required scopes
- Key created in different sub-account than target location

**Solution**:
- Verify you created the Private Integration in the correct sub-account
- Check `GHL_LOCATION_ID` matches the sub-account where you created the integration
- Ensure all required scopes are selected (see Prerequisites)

### Error: "404 Not Found"

**Causes**:
- Wrong API URL
- Invalid location ID

**Solution**:
- Verify `GHL_API_URL=https://services.leadconnectorhq.com` (no trailing slash)
- Double-check `GHL_LOCATION_ID` is correct

### Error: "429 Rate Limit Exceeded"

**Cause**: Making too many requests too quickly

**Solution**: The script already includes 500ms delays. If this still occurs:
1. Increase delay in script (line: `await new Promise(resolve => setTimeout(resolve, 500));`)
2. Change 500 to 1000 (1 second)

### Some Fields Already Exist

**Expected Behavior**: The script will skip existing fields and only create new ones.

**Output Example**:
```
⊘ Skipped: Contact Type (already exists)
✓ Created: Property Address (ID: cf_new123)
```

This is safe and expected if you're running the script multiple times.

### Field Created But Not Showing in GHL

**Solutions**:
1. **Refresh GHL**: Hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check Correct Location**: Verify you're viewing the same location you created fields in
3. **Wait**: Sometimes GHL takes 1-2 minutes to sync across servers
4. **Check Field Location**: Fields might be under:
   - Contacts → Contact Details → Custom Fields section
   - Settings → Custom Fields (if you have access)

## Verifying Setup

### Method 1: Check in GHL UI

1. Go to **Contacts** in GHL
2. Open any contact
3. Scroll down to custom fields section
4. You should see all 21 new fields

### Method 2: API Verification

Run this command to list all custom fields:

```bash
curl -X GET "https://services.leadconnectorhq.com/custom-fields/?locationId=YOUR_LOCATION_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Look for the fields with names matching the PropScrub fields.

## Re-running the Script

**Safe to re-run**: The script checks for existing fields and only creates missing ones.

**Use cases for re-running**:
- You deleted some fields and want to recreate them
- You're setting up a new GHL location
- Initial run failed partway through

## Next Steps

After successfully creating custom fields:

1. ✓ Copy all environment variables output by the script
2. ✓ Add them to `.env` (local) and Vercel (production)
3. ✓ Verify fields appear in GHL UI
4. → Continue with GHL integration (see `GHLWalkthrough.md`)
5. → Implement the export functionality
6. → Test with sample data

## Support

If you encounter issues:

1. **Check the error message** - Most errors are self-explanatory
2. **Verify credentials** - 90% of issues are incorrect API key or Location ID
3. **Check GHL documentation** - https://highlevel.stoplight.io/
4. **Check script logs** - The script outputs detailed logs of what it's doing

## Customization

### Adding More Custom Fields

Edit `scripts/setupGHLFields.js` and add to `CUSTOM_FIELDS_CONFIG`:

```javascript
{
  name: 'Your Field Name',
  fieldKey: 'contact.your_field_key',
  dataType: 'TEXT', // or DROPDOWN, PHONE, NUMBER, etc.
  position: 22,
  options: ['Option 1', 'Option 2'] // Only for DROPDOWN
}
```

### Removing Fields You Don't Need

If you don't need Prison Scrub fields:

1. Edit `scripts/setupGHLFields.js`
2. Remove the Prison Scrub field configurations (positions 7-21)
3. Run the script

### Field Data Types

Available GHL data types:
- `TEXT` - Single line text
- `TEXTAREA` - Multi-line text
- `PHONE` - Phone number with validation
- `EMAIL` - Email with validation
- `NUMBER` - Numeric values
- `DROPDOWN` - Select from options
- `DATE` - Date picker
- `CHECKBOX` - Yes/No checkbox

## Security Notes

⚠️ **Never commit your `.env` file to git**

Your `.env` should be in `.gitignore`:
```gitignore
.env
.env.local
.env.*.local
```

⚠️ **API Key Security**:
- Store API keys in environment variables only
- Never hardcode API keys in source code
- Rotate API keys periodically
- Use minimum required permissions

## FAQ

**Q: Do I need to run this for every GHL location?**
A: Yes, custom fields are per-location. Run the script once per location.

**Q: Can I delete these fields later?**
A: Yes, delete them through GHL UI or via DELETE API endpoint.

**Q: Will this affect existing contacts?**
A: No, it only creates field definitions. Existing contacts will have these fields empty until you populate them.

**Q: Can I modify field options after creation?**
A: Yes, you can edit dropdown options in GHL UI or via API.

**Q: What if I use a different field name in PropScrub?**
A: You'll need to update the data transformer mapping in `api/utils/dataTransformer.js`.

---

**Ready to proceed?** Run the script and copy the environment variables it outputs!
