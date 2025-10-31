// api/getGHLOptions.js
// Fetch GHL options for mapping (pipelines, stages, tags, contact types)

import fetch from 'node-fetch';

const GHL_API_URL = process.env.GHL_API_URL || 'https://services.leadconnectorhq.com';
const GHL_PRIVATE_KEY = process.env.GHL_PRIVATE_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

/**
 * Make authenticated request to GHL API
 */
async function ghlRequest(endpoint, method = 'GET') {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  };

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
 * API handler
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    console.log('[GHL Options] Fetching pipelines, tags, and contact types...');

    // Fetch pipelines (includes stages)
    const pipelinesResponse = await ghlRequest(`/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);

    // Fetch tags
    const tagsResponse = await ghlRequest(`/locations/${GHL_LOCATION_ID}/tags`);

    // Contact types are standard in GHL
    const contactTypes = [
      { id: 'lead', name: 'Lead' },
      { id: 'seller', name: 'Seller' },
      { id: 'buyer', name: 'Buyer' },
      { id: 'wholesaler', name: 'Wholesaler' },
      { id: 'agent', name: 'Agent' },
      { id: 'other', name: 'Other' }
    ];

    // Transform pipelines to include stages
    const pipelines = (pipelinesResponse.pipelines || []).map(pipeline => ({
      id: pipeline.id,
      name: pipeline.name,
      stages: (pipeline.stages || []).map(stage => ({
        id: stage.id,
        name: stage.name
      }))
    }));

    // Transform tags
    const tags = (tagsResponse.tags || []).map(tag => ({
      id: tag.id,
      name: tag.name
    }));

    console.log(`[GHL Options] Found ${pipelines.length} pipelines, ${tags.length} tags`);

    return res.status(200).json({
      success: true,
      data: {
        contactTypes,
        pipelines,
        tags
      }
    });

  } catch (error) {
    console.error('[GHL Options] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch GHL options',
      details: error.message
    });
  }
}
