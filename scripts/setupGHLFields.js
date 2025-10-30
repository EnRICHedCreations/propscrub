// scripts/setupGHLFields.js
// Standalone script to create GHL custom fields
// Run with: node scripts/setupGHLFields.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_PRIVATE_KEY = process.env.GHL_PRIVATE_KEY; // Private Integration Key
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Define all custom fields needed for PropScrub integration
// Note: GHL uses specific dataType values and requires objectKey + parentId
const CUSTOM_FIELDS_CONFIG = [
  // Basic Fields
  {
    name: 'Contact Type',
    dataType: 'SINGLE_OPTIONS', // Options will be added manually in GHL UI
    position: 1
    // options: ['Owner', 'Tenant', 'Agent', 'Property Manager', 'Other']
  },
  {
    name: 'Property Address',
    dataType: 'TEXT',
    position: 2
  },
  {
    name: 'Phone 2',
    dataType: 'PHONE',
    position: 3
  },
  {
    name: 'Phone 3',
    dataType: 'PHONE',
    position: 4
  },
  {
    name: 'Email 2',
    dataType: 'TEXT', // GHL API doesn't support EMAIL type
    position: 5
  },
  {
    name: 'Email 3',
    dataType: 'TEXT', // GHL API doesn't support EMAIL type
    position: 6
  },

  // Prison Scrub Fields (Phone 1)
  {
    name: 'Phone Type',
    dataType: 'SINGLE_OPTIONS',
    position: 7,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone Status',
    dataType: 'SINGLE_OPTIONS',
    position: 8,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  },

  // Prison Scrub Fields (Phone 2)
  {
    name: 'Phone 2 Type',
    dataType: 'SINGLE_OPTIONS',
    position: 9,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone 2 Status',
    dataType: 'SINGLE_OPTIONS',
    position: 10,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  },

  // Prison Scrub Fields (Phone 3)
  {
    name: 'Phone 3 Type',
    dataType: 'SINGLE_OPTIONS',
    position: 11,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone 3 Status',
    dataType: 'SINGLE_OPTIONS',
    position: 12,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  }
];

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

  const url = `${GHL_API_URL}${endpoint}`;
  console.log(`Making ${method} request to: ${url}`);

  const response = await fetch(url, options);
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`GHL API Error: ${response.status} - ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : {};
}

async function getExistingCustomFields() {
  try {
    const result = await ghlRequest(`/locations/${GHL_LOCATION_ID}/customFields`);
    return result.customFields || [];
  } catch (error) {
    console.error('Error fetching existing custom fields:', error.message);
    return [];
  }
}

async function createCustomField(fieldConfig) {
  // Generate a unique fieldKey from field name
  const fieldKey = fieldConfig.name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const payload = {
    name: fieldConfig.name,
    dataType: fieldConfig.dataType,
    position: fieldConfig.position
  };

  // Add options for dropdown fields (SINGLE_OPTIONS or MULTIPLE_OPTIONS)
  // Note: API uses "options" in CREATE request but "picklistOptions" in GET response
  if ((fieldConfig.dataType === 'SINGLE_OPTIONS' || fieldConfig.dataType === 'MULTIPLE_OPTIONS')
      && fieldConfig.options) {
    payload.options = fieldConfig.options;
  }

  try {
    const result = await ghlRequest(`/locations/${GHL_LOCATION_ID}/customFields`, 'POST', payload);
    console.log(`✓ Created: ${fieldConfig.name} (ID: ${result.id})`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to create ${fieldConfig.name}:`, error.message);
    throw error;
  }
}

async function setupCustomFields() {
  console.log('=================================================');
  console.log('PropScrub GHL Custom Fields Setup');
  console.log('=================================================\n');

  if (!GHL_PRIVATE_KEY) {
    console.error('❌ ERROR: GHL_PRIVATE_KEY environment variable not set');
    console.error('Add it to your .env file: GHL_PRIVATE_KEY=your_private_integration_key_here\n');
    console.error('Get your Private Integration Key from:');
    console.error('GHL → Settings → Private Integrations → Create New Integration\n');
    process.exit(1);
  }

  if (!GHL_LOCATION_ID) {
    console.error('❌ ERROR: GHL_LOCATION_ID environment variable not set');
    console.error('Add it to your .env file: GHL_LOCATION_ID=your_location_id_here\n');
    process.exit(1);
  }

  console.log(`Location ID: ${GHL_LOCATION_ID}`);
  console.log(`API URL: ${GHL_API_URL}\n`);

  console.log('Fetching existing custom fields...');
  const existingFields = await getExistingCustomFields();
  console.log(`Found ${existingFields.length} existing custom fields\n`);

  const existingFieldNames = existingFields.map(f => f.name.toLowerCase());
  const createdFields = [];
  const skippedFields = [];
  const failedFields = [];

  console.log('Creating custom fields...\n');

  for (const fieldConfig of CUSTOM_FIELDS_CONFIG) {
    if (existingFieldNames.includes(fieldConfig.name.toLowerCase())) {
      console.log(`⊘ Skipped: ${fieldConfig.name} (already exists)`);
      skippedFields.push(fieldConfig.name);
      continue;
    }

    try {
      await createCustomField(fieldConfig);
      createdFields.push(fieldConfig.name);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failedFields.push({
        name: fieldConfig.name,
        error: error.message
      });
    }
  }

  console.log('\n=================================================');
  console.log('Setup Complete');
  console.log('=================================================\n');
  console.log(`✓ Created: ${createdFields.length} fields`);
  console.log(`⊘ Skipped: ${skippedFields.length} fields`);
  console.log(`✗ Failed: ${failedFields.length} fields\n`);

  if (createdFields.length > 0) {
    console.log('Created Fields:');
    createdFields.forEach(name => console.log(`  - ${name}`));
    console.log();
  }

  if (skippedFields.length > 0) {
    console.log('Skipped Fields:');
    skippedFields.forEach(name => console.log(`  - ${name}`));
    console.log();
  }

  if (failedFields.length > 0) {
    console.log('Failed Fields:');
    failedFields.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    console.log();
  }

  console.log('Fetching final custom field IDs...\n');
  const allFields = await getExistingCustomFields();

  console.log('=================================================');
  console.log('Environment Variables for .env');
  console.log('=================================================\n');
  console.log('Copy these to your .env file or Vercel:\n');

  const envVars = {};
  CUSTOM_FIELDS_CONFIG.forEach(config => {
    const field = allFields.find(f => f.name.toLowerCase() === config.name.toLowerCase());
    if (field) {
      const envKey = `GHL_CUSTOM_FIELD_${config.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}`;
      envVars[envKey] = field.id;
      console.log(`${envKey}=${field.id}`);
    }
  });

  console.log('\n=================================================\n');
}

setupCustomFields()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
