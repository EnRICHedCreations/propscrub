// scripts/setupGHLFields.js
// Standalone script to create GHL custom fields
// Run with: node scripts/setupGHLFields.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Define all custom fields needed for PropScrub integration
const CUSTOM_FIELDS_CONFIG = [
  // Basic Fields
  {
    name: 'Contact Type',
    fieldKey: 'contact.contact_type',
    dataType: 'DROPDOWN',
    position: 1,
    options: ['Owner', 'Tenant', 'Agent', 'Property Manager', 'Other']
  },
  {
    name: 'Property Address',
    fieldKey: 'contact.property_address',
    dataType: 'TEXT',
    position: 2
  },
  {
    name: 'Phone 2',
    fieldKey: 'contact.phone_2',
    dataType: 'PHONE',
    position: 3
  },
  {
    name: 'Phone 3',
    fieldKey: 'contact.phone_3',
    dataType: 'PHONE',
    position: 4
  },
  {
    name: 'Email 2',
    fieldKey: 'contact.email_2',
    dataType: 'TEXT',
    position: 5
  },
  {
    name: 'Email 3',
    fieldKey: 'contact.email_3',
    dataType: 'TEXT',
    position: 6
  },

  // Prison Scrub Fields (Phone 1)
  {
    name: 'Phone Type',
    fieldKey: 'contact.phone_type',
    dataType: 'DROPDOWN',
    position: 7,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone Status',
    fieldKey: 'contact.phone_status',
    dataType: 'DROPDOWN',
    position: 8,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  },
  {
    name: 'Phone Carrier',
    fieldKey: 'contact.phone_carrier',
    dataType: 'TEXT',
    position: 9
  },
  {
    name: 'Phone Ported',
    fieldKey: 'contact.phone_ported',
    dataType: 'DROPDOWN',
    position: 10,
    options: ['Yes', 'No', 'Unknown']
  },
  {
    name: 'Phone Roaming',
    fieldKey: 'contact.phone_roaming',
    dataType: 'DROPDOWN',
    position: 11,
    options: ['Yes', 'No', 'Unknown']
  },

  // Prison Scrub Fields (Phone 2)
  {
    name: 'Phone 2 Type',
    fieldKey: 'contact.phone_2_type',
    dataType: 'DROPDOWN',
    position: 12,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone 2 Status',
    fieldKey: 'contact.phone_2_status',
    dataType: 'DROPDOWN',
    position: 13,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  },
  {
    name: 'Phone 2 Carrier',
    fieldKey: 'contact.phone_2_carrier',
    dataType: 'TEXT',
    position: 14
  },
  {
    name: 'Phone 2 Ported',
    fieldKey: 'contact.phone_2_ported',
    dataType: 'DROPDOWN',
    position: 15,
    options: ['Yes', 'No', 'Unknown']
  },
  {
    name: 'Phone 2 Roaming',
    fieldKey: 'contact.phone_2_roaming',
    dataType: 'DROPDOWN',
    position: 16,
    options: ['Yes', 'No', 'Unknown']
  },

  // Prison Scrub Fields (Phone 3)
  {
    name: 'Phone 3 Type',
    fieldKey: 'contact.phone_3_type',
    dataType: 'DROPDOWN',
    position: 17,
    options: ['Mobile', 'Landline', 'VoIP', 'Unknown']
  },
  {
    name: 'Phone 3 Status',
    fieldKey: 'contact.phone_3_status',
    dataType: 'DROPDOWN',
    position: 18,
    options: ['LIVE', 'NOT_LIVE', 'Unknown']
  },
  {
    name: 'Phone 3 Carrier',
    fieldKey: 'contact.phone_3_carrier',
    dataType: 'TEXT',
    position: 19
  },
  {
    name: 'Phone 3 Ported',
    fieldKey: 'contact.phone_3_ported',
    dataType: 'DROPDOWN',
    position: 20,
    options: ['Yes', 'No', 'Unknown']
  },
  {
    name: 'Phone 3 Roaming',
    fieldKey: 'contact.phone_3_roaming',
    dataType: 'DROPDOWN',
    position: 21,
    options: ['Yes', 'No', 'Unknown']
  }
];

async function ghlRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
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
    const result = await ghlRequest(`/custom-fields/?locationId=${GHL_LOCATION_ID}`);
    return result.customFields || [];
  } catch (error) {
    console.error('Error fetching existing custom fields:', error.message);
    return [];
  }
}

async function createCustomField(fieldConfig) {
  const payload = {
    locationId: GHL_LOCATION_ID,
    name: fieldConfig.name,
    fieldKey: fieldConfig.fieldKey,
    dataType: fieldConfig.dataType,
    position: fieldConfig.position
  };

  if (fieldConfig.dataType === 'DROPDOWN' && fieldConfig.options) {
    payload.options = fieldConfig.options;
  }

  try {
    const result = await ghlRequest('/custom-fields/', 'POST', payload);
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

  if (!GHL_API_KEY) {
    console.error('❌ ERROR: GHL_API_KEY environment variable not set');
    console.error('Add it to your .env file: GHL_API_KEY=your_api_key_here\n');
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
