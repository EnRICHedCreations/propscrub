// api/setupGHLCustomFields.js
// One-time setup script to create all required custom fields in GoHighLevel

const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_PRIVATE_KEY = process.env.GHL_PRIVATE_KEY; // Private Integration Key
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
    dataType: 'TEXT', // GHL doesn't have EMAIL type, use TEXT with validation
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
      'Authorization': `Bearer ${GHL_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28' // GHL API version
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

  // Add options for dropdown fields
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

  // Validate environment variables
  if (!GHL_PRIVATE_KEY) {
    console.error('❌ ERROR: GHL_PRIVATE_KEY environment variable not set');
    console.error('Get your Private Integration Key from:');
    console.error('GHL → Settings → Private Integrations → Create New Integration');
    process.exit(1);
  }

  if (!GHL_LOCATION_ID) {
    console.error('❌ ERROR: GHL_LOCATION_ID environment variable not set');
    process.exit(1);
  }

  console.log(`Location ID: ${GHL_LOCATION_ID}`);
  console.log(`API URL: ${GHL_API_URL}\n`);

  // Fetch existing custom fields
  console.log('Fetching existing custom fields...');
  const existingFields = await getExistingCustomFields();
  console.log(`Found ${existingFields.length} existing custom fields\n`);

  const existingFieldNames = existingFields.map(f => f.name.toLowerCase());
  const createdFields = [];
  const skippedFields = [];
  const failedFields = [];

  // Create each custom field
  console.log('Creating custom fields...\n');

  for (const fieldConfig of CUSTOM_FIELDS_CONFIG) {
    // Check if field already exists
    if (existingFieldNames.includes(fieldConfig.name.toLowerCase())) {
      console.log(`⊘ Skipped: ${fieldConfig.name} (already exists)`);
      skippedFields.push(fieldConfig.name);
      continue;
    }

    // Create the field
    try {
      await createCustomField(fieldConfig);
      createdFields.push(fieldConfig.name);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failedFields.push({
        name: fieldConfig.name,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n=================================================');
  console.log('Setup Complete');
  console.log('=================================================\n');
  console.log(`✓ Created: ${createdFields.length} fields`);
  console.log(`⊘ Skipped: ${skippedFields.length} fields (already existed)`);
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

  // Now fetch all fields and display their IDs for .env configuration
  console.log('Fetching final custom field IDs...\n');
  const allFields = await getExistingCustomFields();

  console.log('=================================================');
  console.log('Environment Variables for .env');
  console.log('=================================================\n');
  console.log('Copy these to your .env file or Vercel environment variables:\n');

  // Generate env var mapping
  const envVars = {};
  CUSTOM_FIELDS_CONFIG.forEach(config => {
    const field = allFields.find(f => f.name.toLowerCase() === config.name.toLowerCase());
    if (field) {
      const envKey = `GHL_CUSTOM_FIELD_${config.name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')}`;
      envVars[envKey] = field.id;
    }
  });

  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

  console.log('\n=================================================\n');

  return {
    created: createdFields.length,
    skipped: skippedFields.length,
    failed: failedFields.length,
    envVars
  };
}

// Serverless function handler for Vercel
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to run setup.' });
  }

  try {
    const result = await setupCustomFields();
    return res.status(200).json({
      success: true,
      message: 'Custom fields setup completed',
      ...result
    });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Setup failed',
      details: error.message
    });
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCustomFields()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}
