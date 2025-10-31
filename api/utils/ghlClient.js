// api/utils/ghlClient.js
// GoHighLevel API client helper functions

import fetch from 'node-fetch';

const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_PRIVATE_KEY = process.env.GHL_PRIVATE_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

/**
 * Make authenticated request to GHL API
 */
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
  console.log(`[GHL API] ${method} ${url}`);

  const response = await fetch(url, options);
  const responseText = await response.text();

  if (!response.ok) {
    const error = new Error(`GHL API Error: ${response.status} - ${responseText}`);
    error.status = response.status;
    error.response = responseText;
    throw error;
  }

  return responseText ? JSON.parse(responseText) : {};
}

/**
 * Search for contact by email or phone
 * Returns contact if found, null otherwise
 */
export async function searchContact(emailOrPhone) {
  try {
    const result = await ghlRequest(
      `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(emailOrPhone)}`
    );

    // Return first match if any contacts found
    if (result.contacts && result.contacts.length > 0) {
      return result.contacts[0];
    }

    return null;
  } catch (error) {
    console.error('[GHL] Contact search error:', error.message);
    return null;
  }
}

/**
 * Create new contact in GHL
 */
export async function createContact(contactData) {
  const payload = {
    locationId: GHL_LOCATION_ID,
    ...contactData
  };

  return await ghlRequest('/contacts/', 'POST', payload);
}

/**
 * Update existing contact in GHL
 */
export async function updateContact(contactId, contactData) {
  const payload = {
    ...contactData
  };

  return await ghlRequest(`/contacts/${contactId}`, 'PUT', payload);
}

/**
 * Add tags to contact
 */
export async function addTagsToContact(contactId, tags) {
  return await ghlRequest(`/contacts/${contactId}/tags`, 'POST', { tags });
}

/**
 * Create or update contact (upsert)
 * Checks if contact exists by email, creates or updates accordingly
 */
export async function upsertContact(contactData) {
  const { email, phone } = contactData;

  // Try to find existing contact by email first, then phone
  let existingContact = null;

  if (email) {
    existingContact = await searchContact(email);
  }

  if (!existingContact && phone) {
    existingContact = await searchContact(phone);
  }

  if (existingContact) {
    // Update existing contact
    console.log(`[GHL] Updating existing contact: ${existingContact.id}`);
    return {
      contact: await updateContact(existingContact.id, contactData),
      isNew: false,
      existingId: existingContact.id,
      contactId: existingContact.id
    };
  } else {
    // Create new contact
    console.log(`[GHL] Creating new contact`);
    const result = await createContact(contactData);
    return {
      contact: result.contact,
      isNew: true,
      contactId: result.contact.id
    };
  }
}

/**
 * Search opportunities by contact ID
 */
export async function searchOpportunitiesByContact(contactId) {
  try {
    const result = await ghlRequest(
      `/opportunities/search?location_id=${GHL_LOCATION_ID}&contact_id=${contactId}`
    );
    return result.opportunities || [];
  } catch (error) {
    console.error('[GHL] Opportunity search error:', error.message);
    return [];
  }
}

/**
 * Create new opportunity in GHL
 */
export async function createOpportunity(opportunityData) {
  const payload = {
    locationId: GHL_LOCATION_ID,
    ...opportunityData
  };

  console.log('[GHL] Creating opportunity with payload:', JSON.stringify(payload, null, 2));
  const result = await ghlRequest('/opportunities/', 'POST', payload);
  console.log('[GHL] Create opportunity result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Update existing opportunity in GHL
 */
export async function updateOpportunity(opportunityId, opportunityData) {
  return await ghlRequest(`/opportunities/${opportunityId}`, 'PUT', opportunityData);
}

/**
 * Create or update opportunity for a contact
 */
export async function upsertOpportunity(contactId, opportunityData) {
  console.log(`[GHL] upsertOpportunity called with contactId: ${contactId}, opportunityData:`, JSON.stringify(opportunityData, null, 2));

  // Search for existing opportunity for this contact with same name
  const existingOpportunities = await searchOpportunitiesByContact(contactId);
  console.log(`[GHL] Found ${existingOpportunities.length} existing opportunities for contact ${contactId}`);

  const existingOpportunity = existingOpportunities.find(
    opp => opp.name === opportunityData.name && opp.status === 'open'
  );

  if (existingOpportunity) {
    console.log(`[GHL] Updating existing opportunity: ${existingOpportunity.id}`);
    return {
      opportunity: await updateOpportunity(existingOpportunity.id, opportunityData),
      isNew: false,
      opportunityId: existingOpportunity.id
    };
  } else {
    console.log(`[GHL] Creating new opportunity for contact ${contactId}`);
    const result = await createOpportunity({
      ...opportunityData,
      contactId: contactId
    });
    console.log(`[GHL] Opportunity creation result:`, JSON.stringify(result, null, 2));
    return {
      opportunity: result.opportunity,
      isNew: true,
      opportunityId: result.opportunity?.id
    };
  }
}

export default {
  searchContact,
  createContact,
  updateContact,
  addTagsToContact,
  upsertContact,
  searchOpportunitiesByContact,
  createOpportunity,
  updateOpportunity,
  upsertOpportunity
};
