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
      existingId: existingContact.id
    };
  } else {
    // Create new contact
    console.log(`[GHL] Creating new contact`);
    const result = await createContact(contactData);
    return {
      contact: result.contact,
      isNew: true
    };
  }
}

export default {
  searchContact,
  createContact,
  updateContact,
  addTagsToContact,
  upsertContact
};
