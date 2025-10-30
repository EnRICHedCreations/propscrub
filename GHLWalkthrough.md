# GoHighLevel Integration Walkthrough

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Part 1: Iframe Embedding](#part-1-iframe-embedding)
5. [Part 2: GHL API Setup](#part-2-ghl-api-setup)
6. [Part 3: Backend Implementation](#part-3-backend-implementation)
7. [Part 4: Frontend Implementation](#part-4-frontend-implementation)
8. [Part 5: Data Mapping](#part-5-data-mapping)
9. [Part 6: Testing Strategy](#part-6-testing-strategy)
10. [Part 7: Common Challenges & Solutions](#part-7-common-challenges--solutions)
11. [Part 8: Deployment Checklist](#part-8-deployment-checklist)

---

## Overview

This document provides a complete walkthrough for integrating PropScrub into GoHighLevel (GHL) as an embedded iframe application with full API integration for exporting cleaned contact data directly into GHL.

### Integration Goals
- Embed PropScrub inside GHL's interface via iframe
- Allow users to export cleaned CSV data directly to GHL contacts
- Create opportunities with proper pipeline/stage assignment
- Apply tags based on market search data
- Handle multiple phones/emails via custom fields
- Support Prison Scrub data (phone type, status, carrier)

### High-Level Flow
```
User in GHL → Opens PropScrub iframe → Uploads CSV → Cleans data
→ Clicks "Export to GHL" → Data sent to backend → Backend calls GHL API
→ Contacts/Opportunities created → Success message shown
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     GoHighLevel Platform                         │
│  - Custom Menu Item (Sidebar)                                   │
│  - Iframe Container                                             │
│  - API Endpoints (contacts, opportunities, custom fields)       │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  PropScrub Frontend (React)                      │
│  - Iframe detection logic                                       │
│  - CSV upload & cleaning UI                                     │
│  - "Export to GHL" button                                       │
│  - Progress tracking                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│            PropScrub Backend (Vercel Functions)                  │
│  - api/exportToGHL.js - Main export endpoint                   │
│  - api/getGHLPipelines.js - Fetch available pipelines          │
│  - api/getGHLCustomFields.js - Fetch custom fields             │
│  - Rate limiting & batching logic                              │
│  - Error handling & logging                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React + TypeScript (existing PropScrub app)
- **Backend**: Vercel Serverless Functions (Node.js)
- **API**: GoHighLevel REST API v2
- **Authentication**: GHL API Key (Agency or Location level)
- **Communication**: PostMessage API (iframe ↔ parent)

---

## Prerequisites

### 1. GoHighLevel Access Requirements

#### Required Permissions:
- [ ] Sub-account access (or Agency-level for white-label)
- [ ] Private Integration creation permission
- [ ] Custom menu item creation permission
- [ ] Custom fields creation permission

#### API Credentials Needed:
- [ ] **Private Integration Key** (OAuth-based authentication)
- [ ] **Location ID** (target sub-account ID)

#### How to Get Private Integration Key:
1. Log into GoHighLevel
2. **Select the Sub-Account** you want to integrate with
3. Go to **Settings → Private Integrations**
4. Click **Create New Integration**
5. Fill in:
   - **Name**: "PropScrub Integration"
   - **Description**: "Lead cleaning and validation tool"
6. Select **Required Scopes**:
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
- Private Integrations: https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken
- OAuth Guide: https://marketplace.gohighlevel.com/docs/oauth/GettingStarted

#### How to Get Location ID:
1. Go to target sub-account in GHL
2. Look at URL: `https://app.gohighlevel.com/location/{LOCATION_ID}/...`
3. Copy the location ID

---

### 2. GHL Custom Fields Setup

Before integration, create these custom fields in GHL:

#### Required Custom Fields:

| Field Name | Type | Options | Purpose |
|-----------|------|---------|---------|
| Contact Type | Dropdown | Owner, Tenant, Agent, Property Manager, Other | Categorize contact |
| Property Address | Text | - | Store full property address |
| Phone 2 | Phone | - | Secondary phone number |
| Phone 3 | Phone | - | Tertiary phone number |
| Email 2 | Email | - | Secondary email |
| Email 3 | Email | - | Tertiary email |

#### Prison Scrub Custom Fields (Optional):

| Field Name | Type | Options | Purpose |
|-----------|------|---------|---------|
| Phone Type | Dropdown | Mobile, Landline, VoIP, Unknown | HLR validation result |
| Phone Status | Dropdown | LIVE, NOT_LIVE, Unknown | Live status from HLR |
| Phone Carrier | Text | - | Carrier name from HLR |
| Phone 2 Type | Dropdown | Mobile, Landline, VoIP, Unknown | For Phone 2 |
| Phone 2 Status | Dropdown | LIVE, NOT_LIVE, Unknown | For Phone 2 |
| Phone 2 Carrier | Text | - | For Phone 2 |
| Phone 3 Type | Dropdown | Mobile, Landline, VoIP, Unknown | For Phone 3 |
| Phone 3 Status | Dropdown | LIVE, NOT_LIVE, Unknown | For Phone 3 |
| Phone 3 Carrier | Text | - | For Phone 3 |

#### How to Create Custom Fields:
1. In GHL, go to **Settings → Custom Fields**
2. Click **Add Custom Field**
3. Select **Contact** as the object type
4. Fill in field name, type, and options
5. Click **Save**
6. **Copy the Custom Field ID** (you'll need this for API mapping)

---

### 3. GHL Pipeline Configuration

#### Identify Target Pipeline:
1. Go to **Settings → Pipelines**
2. Choose which pipeline to use for imported opportunities
3. Note the **Pipeline Name**
4. Note all **Stage Names** in that pipeline

#### Default Mapping Recommendation:
- PropScrub "Stage: New" → GHL Pipeline Stage 1 (e.g., "New Lead")
- PropScrub "Pipeline: Default" → Your main GHL pipeline

#### Get Pipeline IDs Programmatically:
You'll fetch these via API in the implementation:
```
GET https://services.leadconnectorhq.com/opportunities/pipelines
```

---

### 4. PropScrub Environment Variables

Add these to your Vercel project:

```bash
# GHL Private Integration Configuration
GHL_PRIVATE_KEY=your_private_integration_key_here
GHL_LOCATION_ID=your_target_location_id_here

# GHL API Base URL
GHL_API_URL=https://services.leadconnectorhq.com

# Custom Field IDs (get these after creating custom fields)
GHL_CUSTOM_FIELD_CONTACT_TYPE=custom_field_id_here
GHL_CUSTOM_FIELD_PROPERTY_ADDRESS=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_2=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_3=custom_field_id_here
GHL_CUSTOM_FIELD_EMAIL_2=custom_field_id_here
GHL_CUSTOM_FIELD_EMAIL_3=custom_field_id_here

# Prison Scrub Fields (Optional)
GHL_CUSTOM_FIELD_PHONE_TYPE=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_STATUS=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_CARRIER=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_2_TYPE=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_2_STATUS=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_2_CARRIER=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_3_TYPE=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_3_STATUS=custom_field_id_here
GHL_CUSTOM_FIELD_PHONE_3_CARRIER=custom_field_id_here

# Export Configuration
GHL_BATCH_SIZE=50
GHL_BATCH_DELAY_MS=1000
GHL_ENABLE_DUPLICATE_CHECK=true

# Bubble Cost for GHL Export (optional)
GHL_EXPORT_COST_PER_100_RECORDS=10
```

#### How to Add to Vercel:
```bash
vercel env add GHL_PRIVATE_KEY
vercel env add GHL_LOCATION_ID
# ... repeat for all variables
```

Or use Vercel Dashboard:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development

---

## Part 0: Testing with Postman (Recommended First Step)

Before implementing the integration, test your GHL API access using Postman. This helps verify credentials and understand API behavior.

### Why Start with Postman?

- ✅ Verify Private Integration Key works
- ✅ Test API endpoints before coding
- ✅ Understand request/response structure
- ✅ Debug authentication issues quickly
- ✅ Explore GHL data (pipelines, custom fields, contacts)

### Quick Postman Setup

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import Collection**: `postman/PropScrub-GHL-API.postman_collection.json`
3. **Import Environment**: `postman/PropScrub-GHL.postman_environment.json`
4. **Configure Variables**:
   - `ghl_private_key`: Your Private Integration Key
   - `location_id`: Your Location ID
5. **Test Authentication**: Run "Test Authentication" request

### Recommended Testing Workflow

1. ✓ Test Authentication (verify credentials)
2. ✓ List All Custom Fields (see existing fields)
3. ✓ Get All Pipelines (find pipeline/stage IDs)
4. ✓ Create Test Contact (verify contact creation works)
5. ✓ Create Custom Field (test field creation)

**Full Postman Guide**: See `postman/POSTMAN_SETUP.md`

### Learning Resources

- **GHL API Docs**: https://marketplace.gohighlevel.com/docs
- **Private Integrations Guide**: https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken
- **OAuth Getting Started**: https://marketplace.gohighlevel.com/docs/oauth/GettingStarted

---

## Part 1: Iframe Embedding

### Step 1: Create Custom Menu Item in GHL

#### Instructions:
1. Log into GHL Agency/White-label account
2. Navigate to **Settings → Business Profile → Custom Menu Links**
3. Click **Add Custom Menu Item**

#### Configuration:
- **Name**: `PropScrub` (or your white-label name)
- **Type**: `iFrame`
- **URL**: `https://propscrub.vercel.app` (your production URL)
- **Icon**: Choose a relevant icon (e.g., file, database, or cleaning icon)
- **Position**: Choose sidebar position (recommend placing near "Contacts")
- **Access**: Select which user roles can access (Admin, User, etc.)

#### Result:
Users will see "PropScrub" in their GHL sidebar. Clicking it opens your app in an iframe.

---

### Step 2: Configure PropScrub for Iframe Display

#### Frontend Changes Needed:

**1. Detect Iframe Context** (src/App.tsx):
```typescript
const [isInGHL, setIsInGHL] = useState(false);

useEffect(() => {
  // Detect if running in iframe
  const inIframe = window.self !== window.top;

  // Optional: Verify parent is GHL domain
  try {
    const parentHostname = document.referrer;
    const isGHLDomain = parentHostname.includes('gohighlevel.com');
    setIsInGHL(inIframe && isGHLDomain);
  } catch (e) {
    // Cross-origin restriction - assume GHL if in iframe
    setIsInGHL(inIframe);
  }
}, []);
```

**2. Adjust UI for Iframe**:
- Hide/adjust header (GHL already has navigation)
- Ensure responsive design fits iframe dimensions
- Consider removing "Clean Another List" if keeping persistent iframe

---

### Step 3: Handle Cross-Origin Communication

#### PostMessage Setup:

**Sending Data from PropScrub to GHL**:
```typescript
// When user clicks "Export to GHL"
const sendToGHLParent = (data: any) => {
  window.parent.postMessage({
    type: 'PROPSCRUB_EXPORT',
    payload: data,
    timestamp: Date.now()
  }, 'https://app.gohighlevel.com');
};
```

**Receiving Messages from GHL** (if needed):
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Verify origin
    if (event.origin !== 'https://app.gohighlevel.com') return;

    // Handle message
    if (event.data.type === 'GHL_LOCATION_ID') {
      setLocationId(event.data.payload);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## Part 2: GHL API Setup

### API Endpoints Reference

#### Base URL:
```
https://services.leadconnectorhq.com
```

#### Authentication Header:
```
Authorization: Bearer {API_KEY}
```

---

### Key API Endpoints

#### 1. Create/Update Contact
```http
POST /contacts/
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "locationId": "location_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+15555551234",
  "address1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "tags": ["market-tampa", "wholesale"],
  "customFields": [
    {
      "id": "custom_field_id",
      "value": "Owner"
    }
  ]
}
```

**Response**:
```json
{
  "contact": {
    "id": "contact_id_here",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

---

#### 2. Search Contacts (Duplicate Check)
```http
GET /contacts/?locationId={locationId}&query={email_or_phone}
Authorization: Bearer {PRIVATE_KEY}
Version: 2021-07-28
```

**Parameters:**
- `locationId` - Your location ID (required)
- `query` - Search term (email, phone, or name)
- `limit` - Number of results (optional, default 20)

**Response**:
```json
{
  "contacts": [
    {
      "id": "existing_contact_id",
      "email": "john@example.com",
      "phone": "+15555551234",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "meta": {
    "total": 1,
    "currentPage": 1
  }
}
```

---

#### 3. Create Opportunity
```http
POST /opportunities/
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "locationId": "location_id",
  "pipelineId": "pipeline_id",
  "name": "123 Main St - Wholesale Deal",
  "status": "open",
  "contactId": "contact_id_from_step_1",
  "pipelineStageId": "stage_id",
  "monetaryValue": 0
}
```

---

#### 4. Get Pipelines
```http
GET /opportunities/pipelines?locationId={locationId}
Authorization: Bearer {API_KEY}
```

**Response**:
```json
{
  "pipelines": [
    {
      "id": "pipeline_id",
      "name": "Wholesale Pipeline",
      "stages": [
        {
          "id": "stage_id_1",
          "name": "New Lead"
        },
        {
          "id": "stage_id_2",
          "name": "Contacted"
        }
      ]
    }
  ]
}
```

---

#### 5. Get Custom Fields
```http
GET /custom-fields/?locationId={locationId}
Authorization: Bearer {API_KEY}
```

**Response**:
```json
{
  "customFields": [
    {
      "id": "custom_field_id",
      "name": "Contact Type",
      "fieldKey": "contact.contact_type",
      "dataType": "DROPDOWN",
      "options": ["Owner", "Tenant", "Agent"]
    }
  ]
}
```

---

#### 6. Add Tags to Contact
```http
POST /contacts/{contactId}/tags
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "tags": ["market-tampa", "wholesale", "new-lead"]
}
```

---

### API Rate Limits

**GHL Rate Limits** (as of 2024):
- **100 requests per minute** per location
- **10,000 requests per day** per location

**Our Strategy**:
- Batch contacts in groups of 50
- Add 1-second delay between batches
- Implement exponential backoff on 429 errors
- Show progress bar to user

---

## Part 3: Backend Implementation

### File Structure
```
api/
├── exportToGHL.js          # Main export endpoint
├── getGHLPipelines.js      # Fetch available pipelines
├── getGHLCustomFields.js   # Fetch custom field IDs
└── utils/
    ├── ghlClient.js        # GHL API wrapper
    ├── rateLimiter.js      # Rate limiting logic
    └── dataTransformer.js  # PropScrub → GHL format
```

---

### Implementation: api/exportToGHL.js

```javascript
// api/exportToGHL.js
import { createContact, createOpportunity, addTags } from './utils/ghlClient.js';
import { transformPropScrubToGHL } from './utils/dataTransformer.js';
import { RateLimiter } from './utils/rateLimiter.js';

const rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

export default async function handler(req, res) {
  // CORS headers for iframe
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contacts, locationId, pipelineId, userId } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid contacts data' });
    }

    const results = {
      success: [],
      failed: [],
      duplicates: []
    };

    // Process in batches
    const BATCH_SIZE = parseInt(process.env.GHL_BATCH_SIZE) || 50;
    const BATCH_DELAY = parseInt(process.env.GHL_BATCH_DELAY_MS) || 1000;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);

      // Process batch in parallel (with rate limiting)
      const batchPromises = batch.map(async (contact) => {
        await rateLimiter.acquire();

        try {
          // Transform PropScrub data to GHL format
          const ghlContact = transformPropScrubToGHL(contact, locationId);

          // Check for duplicates (optional)
          if (process.env.GHL_ENABLE_DUPLICATE_CHECK === 'true') {
            // Search by email first, then by phone if no email
            const searchQuery = ghlContact.email || ghlContact.phone;
            const existing = await searchContact(searchQuery, locationId);
            if (existing) {
              results.duplicates.push({
                propScrubData: contact,
                existingGHLId: existing.id
              });
              return;
            }
          }

          // Create contact in GHL
          const createdContact = await createContact(ghlContact);

          // Add tags (market search)
          if (contact.Tags) {
            const tags = contact.Tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tags.length > 0) {
              await addTags(createdContact.id, tags);
            }
          }

          // Create opportunity if applicable
          if (contact["Opportunity Name"] && pipelineId) {
            await createOpportunity({
              locationId,
              pipelineId,
              name: contact["Opportunity Name"],
              contactId: createdContact.id,
              // Map stage (default to first stage if "New")
              status: 'open'
            });
          }

          results.success.push({
            propScrubData: contact,
            ghlContactId: createdContact.id
          });
        } catch (error) {
          results.failed.push({
            propScrubData: contact,
            error: error.message
          });
        }
      });

      await Promise.all(batchPromises);

      // Delay between batches
      if (i + BATCH_SIZE < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return res.status(200).json({
      message: 'Export completed',
      summary: {
        total: contacts.length,
        successful: results.success.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      },
      details: results
    });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
```

---

### Implementation: api/utils/ghlClient.js

```javascript
// api/utils/ghlClient.js
const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_PRIVATE_KEY = process.env.GHL_PRIVATE_KEY;

async function ghlRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${GHL_API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createContact(contactData) {
  return ghlRequest('/contacts/', 'POST', contactData);
}

export async function searchContact(searchQuery, locationId) {
  // Search by email or phone using the query parameter
  const params = new URLSearchParams({
    locationId,
    query: searchQuery, // Can be email, phone, or name
    limit: '1' // Only need first result for duplicate check
  });

  const result = await ghlRequest(`/contacts/?${params}`);
  return result.contacts?.[0] || null;
}

export async function createOpportunity(opportunityData) {
  return ghlRequest('/opportunities/', 'POST', opportunityData);
}

export async function addTags(contactId, tags) {
  return ghlRequest(`/contacts/${contactId}/tags`, 'POST', { tags });
}

export async function getPipelines(locationId) {
  return ghlRequest(`/opportunities/pipelines?locationId=${locationId}`);
}

export async function getCustomFields(locationId) {
  return ghlRequest(`/custom-fields/?locationId=${locationId}`);
}
```

---

### Implementation: api/utils/dataTransformer.js

```javascript
// api/utils/dataTransformer.js

export function transformPropScrubToGHL(propScrubContact, locationId) {
  const ghlContact = {
    locationId,
    firstName: propScrubContact["First Name"] || '',
    lastName: propScrubContact["Last Name"] || '',
    email: propScrubContact["Email"] || '',
    phone: propScrubContact["Phone"] || '',
    customFields: []
  };

  // Property Address → Custom Field
  if (propScrubContact["Property Address"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PROPERTY_ADDRESS,
      value: propScrubContact["Property Address"]
    });
  }

  // Contact Type → Custom Field
  if (propScrubContact["Contact Type"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_CONTACT_TYPE,
      value: propScrubContact["Contact Type"]
    });
  }

  // Phone 2 → Custom Field
  if (propScrubContact["Phone 2"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PHONE_2,
      value: propScrubContact["Phone 2"]
    });
  }

  // Phone 3 → Custom Field
  if (propScrubContact["Phone 3"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PHONE_3,
      value: propScrubContact["Phone 3"]
    });
  }

  // Email 2 → Custom Field
  if (propScrubContact["Email 2"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_EMAIL_2,
      value: propScrubContact["Email 2"]
    });
  }

  // Email 3 → Custom Field
  if (propScrubContact["Email 3"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_EMAIL_3,
      value: propScrubContact["Email 3"]
    });
  }

  // Prison Scrub fields (if present)
  if (propScrubContact["Phone Type"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PHONE_TYPE,
      value: propScrubContact["Phone Type"]
    });
  }

  if (propScrubContact["Phone Status"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PHONE_STATUS,
      value: propScrubContact["Phone Status"]
    });
  }

  if (propScrubContact["Phone Carrier"]) {
    ghlContact.customFields.push({
      id: process.env.GHL_CUSTOM_FIELD_PHONE_CARRIER,
      value: propScrubContact["Phone Carrier"]
    });
  }

  // Similar for Phone 2 and Phone 3 Prison Scrub fields...

  return ghlContact;
}
```

---

### Implementation: api/utils/rateLimiter.js

```javascript
// api/utils/rateLimiter.js

export class RateLimiter {
  constructor(maxRequests, timeWindowMs) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();

    // Remove requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindowMs);

    // If at limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire(); // Retry
    }

    // Record this request
    this.requests.push(now);
  }
}
```

---

### Implementation: api/getGHLPipelines.js

```javascript
// api/getGHLPipelines.js
import { getPipelines } from './utils/ghlClient.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { locationId } = req.query;

    if (!locationId) {
      return res.status(400).json({ error: 'locationId required' });
    }

    const pipelines = await getPipelines(locationId);

    return res.status(200).json(pipelines);
  } catch (error) {
    console.error('Get pipelines error:', error);
    return res.status(500).json({ error: 'Failed to fetch pipelines', details: error.message });
  }
}
```

---

## Part 4: Frontend Implementation

### Step 1: Add GHL Export Button

**File: src/components/GHLExportButton.tsx (NEW FILE)**

```typescript
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface GHLExportButtonProps {
  data: any[];
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (result: any) => void;
  onExportError?: (error: string) => void;
}

export const GHLExportButton: React.FC<GHLExportButtonProps> = ({
  data,
  disabled,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    onExportStart?.();

    try {
      // Call backend API
      const response = await fetch('/api/exportToGHL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contacts: data,
          locationId: process.env.REACT_APP_GHL_LOCATION_ID,
          pipelineId: process.env.REACT_APP_GHL_PIPELINE_ID
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();
      onExportComplete?.(result);
    } catch (error) {
      console.error('GHL Export error:', error);
      onExportError?.(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="ghl-export-button"
    >
      <Upload size={18} />
      <span>{isExporting ? 'Exporting to GHL...' : 'Export to GoHighLevel'}</span>
    </button>
  );
};
```

---

### Step 2: Add GHL Export Progress Modal

**File: src/components/GHLExportModal.tsx (NEW FILE)**

```typescript
import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface GHLExportModalProps {
  isOpen: boolean;
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    duplicates: number;
  };
  isComplete: boolean;
  error?: string;
  onClose: () => void;
}

export const GHLExportModal: React.FC<GHLExportModalProps> = ({
  isOpen,
  progress,
  isComplete,
  error,
  onClose
}) => {
  if (!isOpen) return null;

  const percentage = progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content ghl-export-modal">
        <div className="modal-header">
          <h2>Exporting to GoHighLevel</h2>
          {isComplete && (
            <button onClick={onClose} className="close-button">
              <X size={24} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {error ? (
            <div className="export-error">
              <AlertCircle size={48} color="#ff4444" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="export-progress-bar">
                <div
                  className="export-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="export-stats">
                <div className="export-stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{progress.total}</span>
                </div>
                <div className="export-stat">
                  <span className="stat-label">Processed:</span>
                  <span className="stat-value">{progress.processed}</span>
                </div>
                <div className="export-stat success">
                  <span className="stat-label">Successful:</span>
                  <span className="stat-value">{progress.successful}</span>
                </div>
                {progress.failed > 0 && (
                  <div className="export-stat failed">
                    <span className="stat-label">Failed:</span>
                    <span className="stat-value">{progress.failed}</span>
                  </div>
                )}
                {progress.duplicates > 0 && (
                  <div className="export-stat duplicate">
                    <span className="stat-label">Duplicates:</span>
                    <span className="stat-value">{progress.duplicates}</span>
                  </div>
                )}
              </div>

              {isComplete && (
                <div className="export-complete">
                  <Check size={48} color="#00d4ff" />
                  <p>Export completed successfully!</p>
                </div>
              )}
            </>
          )}
        </div>

        {isComplete && (
          <div className="modal-footer">
            <button onClick={onClose} className="button-confirm">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Step 3: Integrate into App.tsx

**Modifications to src/App.tsx:**

```typescript
import { GHLExportButton } from './components/GHLExportButton';
import { GHLExportModal } from './components/GHLExportModal';

function App() {
  // Existing state...
  const [isInGHL, setIsInGHL] = useState(false);
  const [showGHLExportModal, setShowGHLExportModal] = useState(false);
  const [ghlExportProgress, setGHLExportProgress] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    duplicates: 0
  });
  const [ghlExportComplete, setGHLExportComplete] = useState(false);
  const [ghlExportError, setGHLExportError] = useState('');

  // Detect iframe on mount
  useEffect(() => {
    const inIframe = window.self !== window.top;
    setIsInGHL(inIframe);
  }, []);

  const handleGHLExportStart = () => {
    setShowGHLExportModal(true);
    setGHLExportComplete(false);
    setGHLExportError('');
    setGHLExportProgress({
      total: filteredData.length,
      processed: 0,
      successful: 0,
      failed: 0,
      duplicates: 0
    });
  };

  const handleGHLExportComplete = (result: any) => {
    setGHLExportProgress({
      total: result.summary.total,
      processed: result.summary.total,
      successful: result.summary.successful,
      failed: result.summary.failed,
      duplicates: result.summary.duplicates
    });
    setGHLExportComplete(true);
  };

  const handleGHLExportError = (error: string) => {
    setGHLExportError(error);
    setGHLExportComplete(true);
  };

  return (
    <div className="app">
      {/* Existing JSX... */}

      {/* Show GHL Export button when in iframe and data is ready */}
      {isInGHL && cleanedData.length > 0 && !isValidating && (
        <section className="ghl-export-section">
          <GHLExportButton
            data={filteredData}
            onExportStart={handleGHLExportStart}
            onExportComplete={handleGHLExportComplete}
            onExportError={handleGHLExportError}
          />
        </section>
      )}

      {/* GHL Export Modal */}
      <GHLExportModal
        isOpen={showGHLExportModal}
        progress={ghlExportProgress}
        isComplete={ghlExportComplete}
        error={ghlExportError}
        onClose={() => setShowGHLExportModal(false)}
      />
    </div>
  );
}
```

---

### Step 4: Add CSS Styling

**Add to src/App.css:**

```css
/* GHL Export Button */
.ghl-export-section {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.ghl-export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #00d4ff, #1a4d7a);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ghl-export-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.ghl-export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* GHL Export Modal */
.ghl-export-modal {
  max-width: 600px;
}

.export-progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e4e8;
  border-radius: 15px;
  overflow: hidden;
  margin: 1.5rem 0;
}

.export-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #1a4d7a);
  transition: width 0.3s ease;
}

.export-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.export-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f5f7fa;
  border-radius: 8px;
}

.export-stat.success {
  background: #e6f7ed;
  color: #00a854;
}

.export-stat.failed {
  background: #ffebee;
  color: #f44336;
}

.export-stat.duplicate {
  background: #fff3e0;
  color: #ff9800;
}

.export-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.export-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: #f44336;
}
```

---

## Part 5: Data Mapping

### Complete Field Mapping Table

| PropScrub Field | GHL Standard Field | GHL Custom Field | Prison Scrub Only | Notes |
|----------------|-------------------|------------------|-------------------|-------|
| First Name | `firstName` | - | No | Direct API field |
| Last Name | `lastName` | - | No | Direct API field |
| Phone | `phone` | - | No | Direct API field (primary) |
| Phone 2 | - | `Phone 2` | No | Custom field required |
| Phone 3 | - | `Phone 3` | No | Custom field required |
| Email | `email` | - | No | Direct API field (primary) |
| Email 2 | - | `Email 2` | No | Custom field required |
| Email 3 | - | `Email 3` | No | Custom field required |
| Property Address | - | `Property Address` | No | Custom field (or use `address1`) |
| Contact Type | - | `Contact Type` | No | Custom dropdown field |
| Opportunity Name | Opportunity `name` | - | No | Goes to Opportunities API |
| Stage | Opportunity `pipelineStageId` | - | No | Must map to actual stage ID |
| Pipeline | Opportunity `pipelineId` | - | No | Must map to actual pipeline ID |
| Tags | `tags` array | - | No | Direct API field (array) |
| Phone Type | - | `Phone Type` | Yes | HLR result |
| Phone Status | - | `Phone Status` | Yes | HLR result (LIVE/NOT_LIVE) |
| Phone Carrier | - | `Phone Carrier` | Yes | HLR result |
| Phone Ported | - | `Phone Ported` | Yes | HLR result (Yes/No) |
| Phone Roaming | - | `Phone Roaming` | Yes | HLR result (Yes/No) |
| Phone 2 Type | - | `Phone 2 Type` | Yes | HLR result for Phone 2 |
| Phone 2 Status | - | `Phone 2 Status` | Yes | HLR result for Phone 2 |
| Phone 2 Carrier | - | `Phone 2 Carrier` | Yes | HLR result for Phone 2 |
| Phone 3 Type | - | `Phone 3 Type` | Yes | HLR result for Phone 3 |
| Phone 3 Status | - | `Phone 3 Status` | Yes | HLR result for Phone 3 |
| Phone 3 Carrier | - | `Phone 3 Carrier` | Yes | HLR result for Phone 3 |

---

### Pipeline/Stage Mapping Strategy

**Option 1: Default Mapping (Simplest)**
```javascript
// In dataTransformer.js
const DEFAULT_STAGE_MAPPING = {
  'New': 'first_stage_id_in_pipeline'
};

// Use first pipeline if none specified
const pipelineId = process.env.GHL_DEFAULT_PIPELINE_ID;
```

**Option 2: Dynamic Fetching (Recommended)**
```javascript
// Fetch pipelines on first export, cache results
const pipelines = await getPipelines(locationId);
const defaultPipeline = pipelines.pipelines[0];
const firstStage = defaultPipeline.stages[0];

// Map PropScrub "New" → first stage
const stageId = firstStage.id;
```

**Option 3: User Selection (Most Flexible)**
- Add dropdown in PropScrub UI
- User selects target pipeline before export
- Store selection in localStorage

---

### Tags Strategy

**Market Search → Tags:**
- PropScrub Market Search: "Tampa, FL, Wholesale"
- Split by comma: `["Tampa", "FL", "Wholesale"]`
- Convert to GHL tags: `["market-tampa", "market-fl", "type-wholesale"]`

```javascript
function convertMarketSearchToTags(marketSearch) {
  if (!marketSearch) return [];

  return marketSearch
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean)
    .map(tag => `market-${tag.replace(/\s+/g, '-')}`);
}
```

---

## Part 6: Testing Strategy

### Phase 1: Local Development Testing

#### Test 1: Iframe Display
- [ ] Deploy to Vercel staging
- [ ] Add custom menu in GHL test account
- [ ] Verify PropScrub loads without errors
- [ ] Check console for CORS issues
- [ ] Verify responsive design in iframe

#### Test 2: API Authentication
- [ ] Test `/api/getGHLPipelines` endpoint
- [ ] Verify API key works
- [ ] Check pipeline data returns correctly
- [ ] Test custom fields endpoint

---

### Phase 2: Single Contact Export

#### Test 3: Minimal Contact
Create test CSV with one contact:
```csv
First Name,Last Name,Phone,Email
John,Doe,5555551234,john@test.com
```

- [ ] Upload CSV
- [ ] Clean data
- [ ] Click "Export to GHL"
- [ ] Verify contact appears in GHL
- [ ] Check all fields mapped correctly
- [ ] Verify no duplicates created

#### Test 4: Full Contact (All Fields)
```csv
First Name,Last Name,Phone,Phone 2,Email,Email 2,Property Address,Contact Type,Opportunity Name,Stage,Tags
Jane,Smith,5555551235,5555551236,jane@test.com,jane2@test.com,123 Main St,Owner,123 Main St Deal,New,Tampa
```

- [ ] Verify all fields populate
- [ ] Check custom fields
- [ ] Verify opportunity created
- [ ] Check tags applied

---

### Phase 3: Batch Testing

#### Test 5: Small Batch (50 contacts)
- [ ] Upload 50-contact CSV
- [ ] Monitor export progress
- [ ] Verify all 50 contacts created
- [ ] Check for rate limit issues
- [ ] Verify batch delay working

#### Test 6: Large Batch (500 contacts)
- [ ] Upload 500-contact CSV
- [ ] Monitor progress bar accuracy
- [ ] Verify batching works (should take ~10 batches)
- [ ] Check all contacts created successfully
- [ ] Verify no API errors

---

### Phase 4: Error Handling

#### Test 7: Duplicate Contacts
- [ ] Export same contact twice
- [ ] Verify duplicate detection works
- [ ] Check duplicate count in results
- [ ] Ensure no double-creation

#### Test 8: Invalid Data
- [ ] Test with missing required fields
- [ ] Test with invalid email format
- [ ] Test with invalid phone format
- [ ] Verify error handling
- [ ] Check failed count in results

#### Test 9: API Failures
- [ ] Temporarily invalidate API key
- [ ] Verify error message shown
- [ ] Test rate limit handling (429 errors)
- [ ] Test timeout scenarios

---

### Phase 5: Prison Scrub Data

#### Test 10: Prison Scrub Fields
- [ ] Upload CSV with Prison Scrub data
- [ ] Verify Phone Type populates
- [ ] Verify Phone Status populates
- [ ] Verify Phone Carrier populates
- [ ] Check all custom fields map correctly

---

### Test Checklist Summary

```
✓ Iframe loads in GHL
✓ API authentication works
✓ Single contact export successful
✓ All fields map correctly
✓ Custom fields populate
✓ Opportunities created
✓ Tags applied correctly
✓ Batch processing works
✓ Progress tracking accurate
✓ Duplicate detection works
✓ Error handling functional
✓ Prison Scrub data exports
✓ Rate limiting respected
✓ No data loss on failures
```

---

## Part 7: Common Challenges & Solutions

### Challenge 1: CORS Issues

**Problem**: Iframe can't communicate with backend due to CORS

**Solution**:
```javascript
// In all api/*.js files
res.setHeader('Access-Control-Allow-Origin', 'https://app.gohighlevel.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

---

### Challenge 2: Custom Field IDs Change

**Problem**: Custom field IDs are environment-specific

**Solution**: Create initialization endpoint
```javascript
// api/initGHL.js
// Fetches and returns all custom field IDs
// Run once per environment, store IDs in env vars
```

---

### Challenge 3: Rate Limiting

**Problem**: Hitting GHL's 100 req/min limit

**Symptoms**:
- 429 errors from GHL API
- Export failures mid-batch
- Incomplete contact creation

**Solution**:
```javascript
// Implement exponential backoff
async function ghlRequestWithRetry(endpoint, method, body, retries = 3) {
  try {
    return await ghlRequest(endpoint, method, body);
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      // Wait 2^(4-retries) seconds
      const delay = Math.pow(2, 4 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return ghlRequestWithRetry(endpoint, method, body, retries - 1);
    }
    throw error;
  }
}
```

---

### Challenge 4: Pipeline Stage Validation

**Problem**: PropScrub "Stage" value doesn't match GHL

**Solution**: Create stage mapping utility
```javascript
// Cache pipelines on first call
let cachedPipelines = null;

async function getStageIdByName(stageName, pipelineId, locationId) {
  if (!cachedPipelines) {
    cachedPipelines = await getPipelines(locationId);
  }

  const pipeline = cachedPipelines.pipelines.find(p => p.id === pipelineId);
  const stage = pipeline?.stages.find(s =>
    s.name.toLowerCase() === stageName.toLowerCase()
  );

  return stage?.id || pipeline?.stages[0]?.id; // Default to first stage
}
```

---

### Challenge 5: Large Dataset Memory Issues

**Problem**: Exporting 10,000+ contacts causes memory issues

**Solution**: Stream processing
```javascript
// Process contacts in chunks, don't load all into memory
async function* streamContacts(contacts, chunkSize = 100) {
  for (let i = 0; i < contacts.length; i += chunkSize) {
    yield contacts.slice(i, i + chunkSize);
  }
}

// Usage
for await (const chunk of streamContacts(allContacts)) {
  await processChunk(chunk);
}
```

---

### Challenge 6: Opportunity Creation Failures

**Problem**: Opportunities fail to create for some contacts

**Cause**: Contact must exist before creating opportunity

**Solution**: Sequential creation
```javascript
// 1. Create contact first
const contact = await createContact(ghlContact);

// 2. Then create opportunity (if needed)
if (opportunityName) {
  await createOpportunity({
    contactId: contact.id, // Use returned contact ID
    name: opportunityName,
    pipelineId,
    pipelineStageId
  });
}
```

---

### Challenge 7: Phone Number Formatting

**Problem**: GHL expects specific phone format

**Solution**: Normalize phones before sending
```javascript
function normalizePhoneForGHL(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Add +1 for US numbers if missing
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }

  return `+${digits}`;
}
```

---

## Part 8: Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Custom fields created in GHL
- [ ] API key tested and working
- [ ] Pipeline IDs identified
- [ ] Iframe menu item configured
- [ ] All local tests passing

---

### Vercel Deployment

```bash
# 1. Set environment variables
vercel env add GHL_API_KEY
vercel env add GHL_LOCATION_ID
# ... (all other env vars)

# 2. Deploy to production
vercel --prod

# 3. Verify deployment
vercel logs
```

---

### Post-Deployment Testing

- [ ] Test in GHL iframe (production)
- [ ] Export 1 test contact
- [ ] Verify contact in GHL
- [ ] Test batch export (10 contacts)
- [ ] Verify all fields map correctly
- [ ] Test error scenarios
- [ ] Monitor Vercel logs for errors

---

### Rollback Plan

If issues occur:
```bash
# View previous deployments
vercel list

# Rollback to previous version
vercel rollback [deployment-url]
```

---

### Monitoring Setup

**Vercel Logs**:
```bash
# Real-time logs
vercel logs --follow

# Filter by function
vercel logs --follow api/exportToGHL.js
```

**Error Tracking**:
- Consider adding Sentry or similar for error tracking
- Log all failed exports to a database for review
- Set up alerts for high failure rates

---

## Success Metrics

Track these metrics to measure integration success:

- **Export Success Rate**: Target >95%
- **Average Export Time**: Should be <1 min per 100 contacts
- **Duplicate Detection Accuracy**: Should catch all duplicates
- **API Error Rate**: Target <1%
- **User Satisfaction**: Gather feedback on UX

---

## Future Enhancements

Consider adding these features later:

1. **Bulk Update**: Update existing contacts instead of just create
2. **Selective Export**: Choose which contacts to export
3. **Field Mapping UI**: Let users customize field mappings
4. **Export History**: Track previous exports
5. **GHL Contact Sync**: Bi-directional sync
6. **Multi-Pipeline Support**: Export to different pipelines based on criteria
7. **Automated Tagging**: AI-based tag suggestions
8. **Export Scheduling**: Schedule recurring exports

---

## Support & Troubleshooting

### Common Error Messages

**"Insufficient balance"**
- User needs more Bubbles
- Direct to purchase modal

**"Invalid API key"**
- Check environment variables
- Verify API key in GHL

**"Rate limit exceeded"**
- Reduce batch size
- Increase delay between batches

**"Pipeline not found"**
- Verify pipeline ID
- Check location ID is correct

**"Custom field not found"**
- Verify custom field IDs
- Re-run field initialization

---

## Conclusion

This walkthrough provides a complete guide to integrating PropScrub with GoHighLevel. Follow the phases sequentially, test thoroughly at each step, and refer back to the troubleshooting section when issues arise.

**Next Steps:**
1. Complete Prerequisites (Part 3)
2. Implement Backend (Part 3)
3. Implement Frontend (Part 4)
4. Test Locally (Part 6)
5. Deploy to Production (Part 8)

Good luck with your integration!
