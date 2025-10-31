// api/exportToGHL.js
// Export cleaned PropScrub contacts to GoHighLevel

import { upsertContact, upsertOpportunity } from './utils/ghlClient.js';

// Custom field IDs from environment
const CUSTOM_FIELD_IDS = {
  propertyAddress: process.env.GHL_CUSTOM_FIELD_PROPERTY_ADDRESS,
  phone2: process.env.GHL_CUSTOM_FIELD_PHONE_2,
  phone3: process.env.GHL_CUSTOM_FIELD_PHONE_3,
  email2: process.env.GHL_CUSTOM_FIELD_EMAIL_2,
  email3: process.env.GHL_CUSTOM_FIELD_EMAIL_3,
  phoneType: process.env.GHL_CUSTOM_FIELD_PHONE_TYPE,
  phoneStatus: process.env.GHL_CUSTOM_FIELD_PHONE_STATUS,
  phone2Type: process.env.GHL_CUSTOM_FIELD_PHONE_2_TYPE,
  phone2Status: process.env.GHL_CUSTOM_FIELD_PHONE_2_STATUS,
  phone3Type: process.env.GHL_CUSTOM_FIELD_PHONE_3_TYPE,
  phone3Status: process.env.GHL_CUSTOM_FIELD_PHONE_3_STATUS
};

/**
 * Map PropScrub row to GHL contact format
 */
function mapRowToGHLContact(row, options = {}) {
  const { defaultType = 'Seller', additionalTags = [] } = options;

  // Build custom fields array (only include fields with values)
  const customFields = [];

  if (row['Property Address']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.propertyAddress,
      value: row['Property Address']
    });
  }

  if (row['Phone 2']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone2,
      value: row['Phone 2']
    });
  }

  if (row['Phone 3']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone3,
      value: row['Phone 3']
    });
  }

  if (row['Email 2']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.email2,
      value: row['Email 2']
    });
  }

  if (row['Email 3']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.email3,
      value: row['Email 3']
    });
  }

  if (row['Phone Type']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phoneType,
      value: row['Phone Type']
    });
  }

  if (row['Phone Status']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phoneStatus,
      value: row['Phone Status']
    });
  }

  if (row['Phone 2 Type']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone2Type,
      value: row['Phone 2 Type']
    });
  }

  if (row['Phone 2 Status']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone2Status,
      value: row['Phone 2 Status']
    });
  }

  if (row['Phone 3 Type']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone3Type,
      value: row['Phone 3 Type']
    });
  }

  if (row['Phone 3 Status']) {
    customFields.push({
      id: CUSTOM_FIELD_IDS.phone3Status,
      value: row['Phone 3 Status']
    });
  }

  // Build contact object
  const contact = {
    firstName: row['First Name'] || row['Name'] || 'Unknown',
    lastName: row['Last Name'] || '',
    email: row['Email'] || undefined,
    phone: row['Phone'] || undefined,
    type: row['Contact Type'] || defaultType,
    tags: ['propscrub-import', ...additionalTags],
    customFields: customFields.length > 0 ? customFields : undefined
  };

  // Remove undefined fields
  Object.keys(contact).forEach(key => {
    if (contact[key] === undefined) {
      delete contact[key];
    }
  });

  return contact;
}

/**
 * Export handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { contacts, options = {} } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide an array of contacts to export'
      });
    }

    console.log(`[Export] Starting export of ${contacts.length} contacts to GHL`);
    console.log(`[Export] First row data:`, JSON.stringify(contacts[0], null, 2));

    const results = {
      total: contacts.length,
      created: 0,
      updated: 0,
      failed: 0,
      opportunitiesCreated: 0,
      opportunitiesUpdated: 0,
      errors: []
    };

    // Process contacts sequentially to avoid rate limiting
    for (let i = 0; i < contacts.length; i++) {
      const row = contacts[i];

      try {
        // Map row to GHL contact format
        const contactData = mapRowToGHLContact(row, options);

        // Upsert contact (create or update)
        const result = await upsertContact(contactData);

        if (result.isNew) {
          results.created++;
        } else {
          results.updated++;
        }

        console.log(`[Export] ${i + 1}/${contacts.length} - ${result.isNew ? 'Created' : 'Updated'}: ${contactData.email || contactData.phone}`);
        console.log(`[Export] Contact ID: ${result.contactId}`);

        // Debug: Log row GHL fields
        console.log(`[Export] Row GHL fields - Pipeline: ${row['Pipeline']}, Stage: ${row['Stage']}, Opportunity Name: ${row['Opportunity Name']}`);

        // Create opportunity if pipeline/stage data is provided
        if (row['Pipeline'] && row['Stage'] && result.contactId) {
          try {
            const opportunityData = {
              pipelineId: row['Pipeline'],
              pipelineStageId: row['Stage'],
              name: row['Opportunity Name'] || row['Property Address'] || 'PropScrub Lead',
              status: 'open'
            };

            console.log(`[Export] Creating opportunity with data:`, JSON.stringify(opportunityData, null, 2));

            const oppResult = await upsertOpportunity(result.contactId, opportunityData);

            if (oppResult.isNew) {
              results.opportunitiesCreated++;
            } else {
              results.opportunitiesUpdated++;
            }

            console.log(`[Export] ${i + 1}/${contacts.length} - ${oppResult.isNew ? 'Created' : 'Updated'} opportunity: ${opportunityData.name}`);
            console.log(`[Export] Opportunity ID: ${oppResult.opportunityId}`);

          } catch (oppError) {
            console.error(`[Export] Failed to create opportunity for contact ${i + 1}:`, oppError.message);
            console.error(`[Export] Opportunity error details:`, oppError);
            // Don't fail the entire contact export if opportunity creation fails
          }
        } else {
          console.log(`[Export] Skipping opportunity - Pipeline: ${row['Pipeline']}, Stage: ${row['Stage']}, ContactId: ${result.contactId}`);
        }

        // Small delay to avoid rate limiting (500ms between requests)
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          contact: row['Email'] || row['Phone'] || `Row ${i + 1}`,
          error: error.message
        });
        console.error(`[Export] Failed to export contact ${i + 1}:`, error.message);
      }
    }

    console.log(`[Export] Complete - Contacts Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`);
    console.log(`[Export] Opportunities - Created: ${results.opportunitiesCreated}, Updated: ${results.opportunitiesUpdated}`);

    return res.status(200).json({
      success: true,
      message: 'Export completed',
      results
    });

  } catch (error) {
    console.error('[Export] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Export failed',
      details: error.message
    });
  }
}
