# GHL OAuth Scopes Configuration

## Current Issue
Error: `"This route is not yet supported by the IAM Service. Please update your IAM config."`

This means your Private Integration Key (`pit-5bc67c72-0396-4b9f-9a7c-3d061aa76d83`) doesn't have the required OAuth scopes enabled.

## Required Scopes for PropScrub Integration

To use all PropScrub features with GHL API, you need these scopes:

### Essential Scopes (Required)
- **contacts.readonly** - Read contact data
- **contacts.write** - Create and update contacts
- **locations.readonly** - Read location information
- **locations/customFields.readonly** - Read custom field definitions
- **locations/customFields.write** - Create custom fields

### Optional Scopes (For Full Integration)
- **opportunities.readonly** - Read opportunities/deals
- **opportunities.write** - Create opportunities
- **calendars.readonly** - Read calendar/availability (if scheduling features needed)
- **conversations.readonly** - Read conversations (if chat integration needed)
- **conversations.write** - Send messages (if automated follow-ups needed)

## How to Configure OAuth Scopes

### Step 1: Navigate to Private Integrations
1. Log into your GoHighLevel account
2. Go to **Settings** (gear icon)
3. Click **Private Integrations** (under Integrations section)
4. Find your existing integration (the one with key `pit-5bc67c72-0396-4b9f-9a7c-3d061aa76d83`)

### Step 2: Edit Integration Scopes
1. Click **Edit** on your integration
2. Find the **Scopes** section
3. Enable the following scopes:

#### For Basic PropScrub Functionality:
```
✓ contacts.readonly
✓ contacts.write
✓ locations.readonly
✓ locations/customFields.readonly
✓ locations/customFields.write
```

#### For Full Integration (Optional):
```
✓ opportunities.readonly
✓ opportunities.write
✓ calendars.readonly (if using scheduling)
✓ conversations.readonly (if using messaging)
✓ conversations.write (if using automated follow-ups)
```

### Step 3: Save Changes
1. Click **Save** or **Update Integration**
2. Your existing API key will now have access to these scopes
3. No need to generate a new key

### Step 4: Test in Postman
After enabling scopes, test these requests in order:

1. **List All Custom Fields** - Should work (tests `locations/customFields.readonly`)
2. **Create Custom Field - Contact Type** - Should work (tests `locations/customFields.write`)
3. **Get All Contacts** - Should work (tests `contacts.readonly`)
4. **Create Contact (Basic)** - Should work (tests `contacts.write`)
5. **Get All Pipelines** - Should now work (tests `opportunities.readonly`)

## Known Limitations: Private Integration Keys

### Endpoints NOT Supported by Private Integration Keys

Some GHL API endpoints are not yet available to Private Integration Keys due to IAM (Identity and Access Management) service limitations. These endpoints only work with full OAuth Marketplace Apps:

**Confirmed Blocked Endpoints**:
- `GET /opportunities/pipelines/{locationId}` - Get all pipelines
- `POST /opportunities/search` - Search opportunities
- Other opportunity-related endpoints may also be blocked

**Error Message**:
```json
{
  "statusCode": 401,
  "message": "This route is not yet supported by the IAM Service. Please update your IAM config."
}
```

**What This Means for PropScrub**:
- ✅ Contact import/export works perfectly
- ✅ Custom fields work perfectly
- ✅ Tags work perfectly
- ❌ Opportunity creation requires OAuth Marketplace App
- ❌ Pipeline assignment requires OAuth Marketplace App

### Workaround Options

**Option 1: Skip Pipelines/Opportunities (Recommended for MVP)**
- Remove opportunity creation from the integration
- Focus on contact import with custom fields and tags
- Users can manually create opportunities in GHL after import
- This is still highly valuable - the core data cleaning is the main value prop

**Option 2: Upgrade to OAuth Marketplace App**
- Build a full marketplace application (more complex)
- Submit to GHL marketplace for approval
- Requires OAuth 2.0 flow implementation
- Required if pipelines/opportunities are essential

**Option 3: Hybrid Approach**
- Launch Phase 1 with contacts/custom fields only (Private Integration)
- Build Phase 2 with opportunities later (upgrade to OAuth app)

## Troubleshooting

### Error: "This route is not yet supported by the IAM Service"
**Cause**: Endpoint not available to Private Integration Keys (IAM limitation)
**Fix**:
1. If it's a pipelines/opportunities endpoint - this is a known limitation
2. Either skip that feature or upgrade to OAuth Marketplace App
3. Report to GHL support: https://developers.gohighlevel.com/support

### Error: 401 Unauthorized
**Cause**:
- API key is invalid or expired
- Scope was just added but not saved
- Integration is disabled

**Fix**:
1. Verify integration is **Enabled** (toggle switch)
2. Confirm you clicked **Save** after adding scopes
3. Wait 1-2 minutes for changes to propagate
4. Retry the request

### Error: 403 Forbidden
**Cause**:
- Scope exists but location doesn't allow this action
- Feature not available in your GHL plan

**Fix**:
- Verify your GHL plan includes the feature (e.g., opportunities/pipelines)
- Contact GHL support if feature should be available

## Scope Verification Checklist

After configuring scopes, verify each one works:

- [ ] `locations/customFields.readonly` - Run "List All Custom Fields"
- [ ] `locations/customFields.write` - Run "Create Custom Field - Contact Type"
- [ ] `contacts.readonly` - Run "Get All Contacts"
- [ ] `contacts.write` - Run "Create Contact (Basic)"
- [ ] `opportunities.readonly` - Run "Get All Pipelines"
- [ ] `opportunities.write` - Run "Create Opportunity"

## Minimum Scopes for Custom Field Setup

To run the `npm run setup-ghl` script and create all 21 custom fields, you only need:

```
✓ locations/customFields.readonly (to check existing fields)
✓ locations/customFields.write (to create new fields)
```

These two scopes are sufficient for the custom field setup phase.

## Next Steps

1. **Configure scopes** using the steps above
2. **Test "List All Custom Fields"** in Postman (should already work based on previous success)
3. **Test "Create Custom Field - Contact Type"** with the corrected payload:
   ```json
   {
     "name": "Contact Type",
     "dataType": "SINGLE_OPTIONS",
     "position": 1,
     "options": ["Owner", "Tenant", "Agent", "Property Manager", "Other"]
   }
   ```
4. **If successful**, we can proceed with `npm run setup-ghl` to create all 21 fields automatically
5. **Add additional scopes** (opportunities, conversations) when ready for full PropScrub integration

## Documentation Reference

Official GHL OAuth Scopes Documentation:
- https://highlevel.stoplight.io/docs/integrations/
- Settings → Private Integrations → Create/Edit Integration
