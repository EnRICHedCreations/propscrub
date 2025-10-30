# Postman Setup Guide for GHL API Testing

This guide will help you set up and use Postman to test GoHighLevel API endpoints before implementing them in PropScrub.

## Why Use Postman?

- **Test API calls** before writing code
- **Verify authentication** works correctly
- **Explore API responses** to understand data structure
- **Debug issues** by seeing exact request/response
- **Save time** by testing quickly without deploying code

---

## Step 1: Install Postman

### Download & Install
1. Go to https://www.postman.com/downloads/
2. Download for your operating system (Windows/Mac/Linux)
3. Install and create a free account (optional but recommended)

---

## Step 2: Import Collection & Environment

### Import the Collection
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop: `PropScrub-GHL-API.postman_collection.json`
4. Click **Import**

You should now see "PropScrub - GHL API Testing" in your Collections sidebar.

### Import the Environment
1. Click the **Environments** icon (gear icon on left sidebar)
2. Click **Import** at the bottom
3. Drag and drop: `PropScrub-GHL.postman_environment.json`
4. Click **Import**

---

## Step 3: Configure Environment Variables

### Set Your Private Integration Key

1. Click **Environments** tab (left sidebar)
2. Click on **PropScrub GHL Environment**
3. Update these values:

| Variable | Current Value | What to Put Here |
|----------|---------------|------------------|
| `ghl_base_url` | `https://services.leadconnectorhq.com` | Leave as-is |
| `ghl_private_key` | `YOUR_PRIVATE_INTEGRATION_KEY_HERE` | Paste your Private Integration Key |
| `location_id` | `YOUR_LOCATION_ID_HERE` | Paste your Location ID |

4. Click **Save** (Ctrl+S or Cmd+S)

### How to Get These Values

**Private Integration Key:**
1. Log into GoHighLevel
2. Select your Sub-Account
3. Go to: **Settings → Private Integrations**
4. Click **Create New Integration**
5. Name: "PropScrub Testing"
6. Select Scopes:
   - ✓ `contacts.readonly`
   - ✓ `contacts.write`
   - ✓ `opportunities.readonly`
   - ✓ `opportunities.write`
   - ✓ `locations/customFields.readonly`
   - ✓ `locations/customFields.write`
   - ✓ `locations/tags.readonly`
   - ✓ `locations/tags.write`
7. Copy the key (you'll only see it once!)

**Location ID:**
- Method 1: Look at GHL URL when logged into sub-account
  ```
  https://app.gohighlevel.com/location/{LOCATION_ID}/dashboard
  ```
- Method 2: Use Postman's "Test Authentication" request (see below)

---

## Step 4: Select the Environment

1. Look at the top-right corner of Postman
2. Click the dropdown that says "No Environment"
3. Select **PropScrub GHL Environment**

This tells Postman to use your configured variables.

---

## Step 5: Test Your Setup

### Run Your First Request

1. In Collections sidebar, expand: **1. Authentication & Setup**
2. Click on: **Test Authentication**
3. Click the blue **Send** button

**Expected Response (200 OK):**
```json
{
  "location": {
    "id": "abc123...",
    "name": "Your Location Name",
    "address": "...",
    ...
  }
}
```

✅ **Success!** Your Private Integration Key is working!

❌ **Error 401 Unauthorized?**
- Check your Private Integration Key is correct
- Verify it has the required scopes

---

## Understanding the Collection

### Folder 1: Authentication & Setup
- **Test Authentication** - Verifies your key works

### Folder 2: Custom Fields
- **List All Custom Fields** - See existing custom fields and their IDs
- **Create Custom Field - Contact Type** - Example: Create dropdown field
- **Create Custom Field - Property Address** - Example: Create text field

### Folder 3: Contacts
- **Get All Contacts** - Retrieve existing contacts
- **Create Contact (Basic)** - Create contact with standard fields
- **Create Contact (With Custom Fields)** - Create contact with custom fields populated
- **Lookup Contact** - Check if contact exists (duplicate detection)
- **Get Contact by ID** - Retrieve specific contact
- **Update Contact** - Modify existing contact
- **Add Tags to Contact** - Add tags to contact

### Folder 4: Opportunities (Pipelines)
- **Get All Pipelines** - See available pipelines and stages
- **Create Opportunity** - Create deal/opportunity for contact
- **Get All Opportunities** - List all opportunities

### Folder 5: Testing PropScrub Export
- **Full Export Simulation** - Test complete export with all fields

---

## Common Testing Workflows

### Workflow 1: First-Time Setup

**Goal:** Understand your GHL data structure

1. ✓ Run: **Test Authentication**
2. ✓ Run: **List All Custom Fields** (save the IDs you see)
3. ✓ Run: **Get All Pipelines** (note pipeline and stage IDs)
4. ✓ Run: **Get All Contacts** (see existing contact structure)

### Workflow 2: Test Custom Field Creation

**Goal:** Verify you can create custom fields

1. ✓ Run: **Create Custom Field - Contact Type**
2. ✓ Check response for field ID
3. ✓ Run: **List All Custom Fields** to verify it was created
4. ✓ Save the field ID for later use

### Workflow 3: Test Contact Creation

**Goal:** Simulate PropScrub export

1. ✓ Run: **Create Contact (Basic)** - Test basic contact creation
2. ✓ Copy the contact ID from response
3. ✓ Update **Create Contact (With Custom Fields)** request:
   - Replace `REPLACE_WITH_CONTACT_TYPE_FIELD_ID` with actual field ID
   - Replace `REPLACE_WITH_PROPERTY_ADDRESS_FIELD_ID` with actual field ID
4. ✓ Run updated request
5. ✓ Verify contact appears in GHL UI with custom fields populated

### Workflow 4: Test Duplicate Detection

**Goal:** Verify duplicate checking works

1. ✓ Run: **Create Contact (Basic)** with email `test@example.com`
2. ✓ Run: **Lookup Contact** with query parameter `email=test@example.com`
3. ✓ Should return the contact you just created
4. ✓ Try creating same contact again (should create duplicate or update)

### Workflow 5: Test Full PropScrub Flow

**Goal:** Simulate complete export process

1. ✓ Run: **List All Custom Fields** - Copy all PropScrub field IDs
2. ✓ Update **Full Export Simulation** request body with actual field IDs
3. ✓ Run **Full Export Simulation**
4. ✓ Verify contact created with all fields
5. ✓ Check GHL UI to see the contact

---

## Tips for Using Postman

### Understanding Responses

**200 OK** = Success ✅
- Request worked
- Check response body for returned data

**201 Created** = Successfully created resource ✅
- Used for POST requests that create new items
- Response includes the created item with its ID

**400 Bad Request** = Invalid data ❌
- Check your request body format
- Verify required fields are included
- Check data types (string vs number)

**401 Unauthorized** = Authentication failed ❌
- Verify Private Integration Key is correct
- Check key hasn't expired
- Ensure key has required scopes

**403 Forbidden** = No permission ❌
- Your key doesn't have access to this resource
- Check your scopes in GHL Private Integration settings

**404 Not Found** = Resource doesn't exist ❌
- Check URL is correct
- Verify IDs (contact ID, field ID, etc.) are valid

**429 Too Many Requests** = Rate limited ❌
- You're making too many requests
- Wait 60 seconds and try again
- Reduce request frequency

### Saving Responses

After running a request:
1. Click **Save Response** button
2. Name it descriptively
3. Use saved responses as reference when coding

### Using Variables

In any request, you can use variables like:
```
{{ghl_private_key}}
{{location_id}}
```

Create new variables:
1. Go to Environment settings
2. Add new variable
3. Use `{{variable_name}}` in requests

### Testing Multiple Requests

Use **Collection Runner**:
1. Right-click collection
2. Click **Run Collection**
3. Select requests to run
4. Click **Run**
5. See all results at once

---

## Debugging Failed Requests

### Check Authorization Header
1. Click on request
2. Go to **Headers** tab
3. Verify `Authorization: Bearer {{ghl_private_key}}`
4. Hover over `{{ghl_private_key}}` - should show actual value

### Check Request Body
1. Go to **Body** tab
2. Ensure format is **raw** and **JSON**
3. Verify JSON is valid (no syntax errors)
4. Check for missing required fields

### View Console Logs
1. Click **Console** button (bottom left)
2. Shows detailed request/response logs
3. See exact request sent and response received

### Compare with GHL Documentation
1. Check: https://marketplace.gohighlevel.com/docs
2. Compare your request structure with examples
3. Verify endpoint URL is correct
4. Check required vs optional fields

---

## Next Steps After Testing

Once you've successfully tested in Postman:

1. ✅ Verified authentication works
2. ✅ Created custom fields successfully
3. ✅ Created contacts with custom fields
4. ✅ Tested duplicate detection
5. ✅ Created opportunities

**You're ready to:**
- Update your `.env` file with working credentials
- Run `npm run setup-ghl` to create all custom fields
- Begin implementing GHL export in PropScrub
- Use Postman request structure as reference for your code

---

## Postman Pro Tips

### Save Frequently Used Values
Create environment variables for:
- Test contact IDs
- Custom field IDs
- Pipeline IDs
- Stage IDs

### Use Pre-request Scripts
Add this to requests to auto-generate test data:
```javascript
// Pre-request Script tab
pm.environment.set("timestamp", Date.now());
pm.environment.set("random_email", `test.${Date.now()}@example.com`);
```

### Use Tests Tab
Add this to verify responses:
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has contact ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.contact.id).to.exist;
});
```

### Share Collections
Export and share with team:
1. Right-click collection
2. Click **Export**
3. Share the JSON file
4. Team members import it

---

## Troubleshooting

### "Could not get any response"
**Cause:** Network issue or incorrect URL

**Fix:**
- Check internet connection
- Verify `ghl_base_url` is correct
- Try in browser: https://services.leadconnectorhq.com

### "Invalid JSON"
**Cause:** Syntax error in request body

**Fix:**
- Copy request body to JSON validator: https://jsonlint.com
- Check for missing commas, quotes, brackets
- Ensure proper escaping

### "Field not found"
**Cause:** Custom field ID doesn't exist

**Fix:**
- Run **List All Custom Fields** request
- Verify field ID is correct
- Check you're using correct location ID

### Variables not working
**Cause:** Environment not selected

**Fix:**
- Check top-right corner shows your environment
- Click dropdown and select **PropScrub GHL Environment**
- Verify variables have values (not placeholder text)

---

## Additional Resources

- **GHL API Docs**: https://marketplace.gohighlevel.com/docs
- **Postman Learning Center**: https://learning.postman.com
- **GHL Community**: https://community.gohighlevel.com
- **PropScrub Docs**: See `GHLWalkthrough.md` and `SETUP_GHL_FIELDS.md`

---

## Need Help?

If you're stuck:
1. Check the response body for error messages
2. Review GHL API documentation for that endpoint
3. Verify your Private Integration Key scopes
4. Check Postman Console for detailed logs
5. Test a simpler request first (e.g., "Test Authentication")

**Happy Testing! 🚀**
