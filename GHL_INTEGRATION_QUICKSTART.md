# GHL Integration Quick Start Guide

**Start here if you're new to the PropScrub + GoHighLevel integration.**

---

## 🎯 Your Goal

Integrate PropScrub with GoHighLevel so cleaned contact data can be exported directly into GHL with one click.

---

## 📋 What You Have Now

All the tools and documentation you need:

### 1. **Postman Collection** (Test API First)
- `postman/PropScrub-GHL-API.postman_collection.json`
- `postman/PropScrub-GHL.postman_environment.json`
- `postman/POSTMAN_SETUP.md` - Complete setup guide

### 2. **Custom Fields Setup** (Automated)
- `scripts/setupGHLFields.js` - Creates all 21 custom fields
- `api/setupGHLCustomFields.js` - Vercel function version
- `SETUP_GHL_FIELDS.md` - Setup instructions

### 3. **Integration Documentation**
- `GHLWalkthrough.md` - Complete integration guide (8 parts)
- This file - Quick start overview

---

## 🚀 Getting Started (Step-by-Step)

### Phase 1: Learn & Explore (Start Here)

**Objective:** Understand how GHL API works before writing code

#### Step 1: Read Your Developer's Guide
Your developer provided excellent starter guidance. Review these links:
- GHL API Docs: https://marketplace.gohighlevel.com/docs/oauth/GettingStarted
- Private Integrations: https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken

#### Step 2: Create Your Private Integration
1. Log into GoHighLevel
2. Select your Sub-Account (e.g., "Wholesale Softwares")
3. Go to **Settings → Private Integrations**
4. Click **Create New Integration**
5. Name: "PropScrub Integration"
6. Select these scopes:
   - ✓ `contacts.readonly`
   - ✓ `contacts.write`
   - ✓ `opportunities.readonly`
   - ✓ `opportunities.write`
   - ✓ `locations/customFields.readonly`
   - ✓ `locations/customFields.write`
   - ✓ `locations/tags.readonly`
   - ✓ `locations/tags.write`
7. **Copy the Private Integration Key** (save it securely!)

#### Step 3: Get Your Location ID
Look at your GHL URL when logged into the sub-account:
```
https://app.gohighlevel.com/location/{LOCATION_ID}/dashboard
```
Copy the `LOCATION_ID` part.

#### Step 4: Test with Postman
**This is critical - do this before running any setup scripts!**

1. Download Postman: https://www.postman.com/downloads/
2. Open Postman
3. Import collection: `postman/PropScrub-GHL-API.postman_collection.json`
4. Import environment: `postman/PropScrub-GHL.postman_environment.json`
5. Update environment variables:
   - `ghl_private_key`: Paste your Private Integration Key
   - `location_id`: Paste your Location ID
6. Select "PropScrub GHL Environment" in top-right dropdown
7. Run: **1. Authentication & Setup → Test Authentication**
8. Should get 200 OK response ✅

**See `postman/POSTMAN_SETUP.md` for detailed Postman guide**

#### Step 5: Explore in Postman
Run these requests to understand your GHL data:
1. **List All Custom Fields** - See what fields already exist
2. **Get All Pipelines** - See your pipelines and stages
3. **Get All Contacts** (first 10) - See contact structure
4. **Create Contact (Basic)** - Test creating a contact
5. **Lookup Contact** - Test duplicate detection

**Spend time here! The more you understand the API, the easier implementation will be.**

---

### Phase 2: Setup Custom Fields

**Objective:** Create all 21 custom fields in GHL programmatically

#### Step 1: Update Your .env File
Create/update `.env` in project root:
```env
GHL_PRIVATE_KEY=your_private_integration_key_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_URL=https://services.leadconnectorhq.com
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Run Setup Script
```bash
npm run setup-ghl
```

**Expected Output:**
```
✓ Created: 21 fields
⊘ Skipped: 0 fields
✗ Failed: 0 fields
```

#### Step 4: Copy Environment Variables
The script outputs all custom field IDs. Copy them to your `.env`:
```env
GHL_CUSTOM_FIELD_CONTACT_TYPE=cf_xxxxx
GHL_CUSTOM_FIELD_PROPERTY_ADDRESS=cf_xxxxx
# ... all 21 fields
```

#### Step 5: Verify in GHL
1. Go to GoHighLevel
2. Open any contact
3. Scroll down to custom fields
4. You should see all 21 new fields ✅

**See `SETUP_GHL_FIELDS.md` for troubleshooting**

---

### Phase 3: Understand the Integration (Read Only)

**Objective:** Understand the complete integration architecture

#### Read the Full Walkthrough
Open `GHLWalkthrough.md` and read through:
- Part 0: Testing with Postman ← You just did this!
- Part 1: Iframe Embedding
- Part 2: GHL API Setup
- Part 3: Backend Implementation
- Part 4: Frontend Implementation
- Part 5: Data Mapping
- Part 6: Testing Strategy
- Part 7: Common Challenges
- Part 8: Deployment

**Don't code yet - just read and understand the flow.**

---

### Phase 4: Implement the Integration (Coming Next)

Once you've completed Phases 1-3, you'll be ready to:

1. **Iframe Embedding**: Add PropScrub to GHL sidebar
2. **Backend Functions**: Create `api/exportToGHL.js` and utilities
3. **Frontend Components**: Add "Export to GHL" button and modal
4. **Testing**: Test with sample data
5. **Deployment**: Deploy to Vercel production

**Each step has detailed code examples in `GHLWalkthrough.md`**

---

## 📚 Document Quick Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **GHL_INTEGRATION_QUICKSTART.md** (this file) | Overview and getting started | Start here |
| **postman/POSTMAN_SETUP.md** | Postman testing guide | Phase 1 - Before any coding |
| **SETUP_GHL_FIELDS.md** | Custom fields setup | Phase 2 - Create fields |
| **GHLWalkthrough.md** | Complete integration guide | Phase 3-4 - Implementation |

---

## ✅ Current Progress Checklist

### Phase 1: Learn & Explore
- [ ] Read GHL API documentation
- [ ] Create Private Integration in GHL
- [ ] Get Location ID
- [ ] Install Postman
- [ ] Import Postman collection & environment
- [ ] Configure Postman variables
- [ ] Test authentication (200 OK)
- [ ] Explore GHL data (fields, pipelines, contacts)

### Phase 2: Setup Custom Fields
- [ ] Update `.env` with credentials
- [ ] Run `npm install`
- [ ] Run `npm run setup-ghl`
- [ ] Copy custom field IDs to `.env`
- [ ] Verify fields in GHL UI

### Phase 3: Understand Integration
- [ ] Read Part 0: Postman Testing
- [ ] Read Part 1: Iframe Embedding
- [ ] Read Part 2: GHL API Setup
- [ ] Read Part 3: Backend Implementation
- [ ] Read Part 4: Frontend Implementation
- [ ] Read Part 5: Data Mapping
- [ ] Understand data flow diagram
- [ ] Review code examples

### Phase 4: Implement (Not Started Yet)
- [ ] TBD after completing Phases 1-3

---

## 🆘 Getting Help

### Common Issues

**"I can't find Private Integrations in GHL"**
- Check you're in the correct sub-account
- Try: Settings → Integrations → Private Integration
- May need admin permissions

**"Postman returns 401 Unauthorized"**
- Verify Private Integration Key is correct
- Check you selected all required scopes
- Try creating a new Private Integration

**"Custom fields script fails"**
- Verify `.env` file exists and has correct values
- Check `GHL_PRIVATE_KEY` doesn't have extra spaces
- See `SETUP_GHL_FIELDS.md` Troubleshooting section

### Where to Look

1. **Postman issues**: See `postman/POSTMAN_SETUP.md`
2. **Setup script issues**: See `SETUP_GHL_FIELDS.md`
3. **Integration questions**: See `GHLWalkthrough.md`
4. **GHL API questions**: https://marketplace.gohighlevel.com/docs

---

## 🎓 Learning Tips

### For New Developers
1. **Don't skip Postman** - It teaches you how the API works
2. **Read the docs** - GHL API docs are your friend
3. **Test incrementally** - Test each piece before moving on
4. **Ask AI** - ChatGPT/Claude can help explain concepts

### For Experienced Developers
1. **Postman still useful** - Quickly test endpoints without deploying
2. **Private Integration != API Key** - Different auth approach
3. **Rate limits matter** - 100 requests/minute
4. **Custom fields need IDs** - Use our setup script

---

## 🏁 Next Steps

**You are here:** Phase 1 - Learn & Explore

**Next:**
1. Complete the Phase 1 checklist above
2. Use Postman to test all basic operations
3. Once comfortable, move to Phase 2
4. Run the custom fields setup script
5. Then proceed to Phase 3 (reading the full walkthrough)

**Don't rush!** Taking time to understand in Phases 1-3 will make Phase 4 (implementation) much faster and smoother.

---

## 💡 Pro Tips

- **Save your Postman requests** - You'll reference them when coding
- **Test duplicate detection** - Important for PropScrub integration
- **Check custom field IDs** - You'll use these constantly
- **Understand pipelines** - Need to map stages correctly
- **Keep credentials safe** - Never commit `.env` to git

---

**Ready to start?** Begin with Phase 1, Step 1! 🚀
