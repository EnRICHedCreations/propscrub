/**
 * Vercel Serverless Function to validate phone numbers using HLRLookup.com API
 * Endpoint: /api/validatePhone
 */
module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    'https://propscrub.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173' // Vite default port
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get HLRLookup credentials from environment variables
    const apiKey = process.env.HLRLOOKUP_API_KEY;
    const apiSecret = process.env.HLRLOOKUP_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('HLRLookup credentials not configured');
      return res.status(500).json({
        valid: false,
        type: 'error',
        liveStatus: 'ERROR',
        error: 'HLRLookup credentials not configured'
      });
    }

    const { phone } = req.body;

    // Validate input
    if (!phone || typeof phone !== 'string') {
      return res.json({
        valid: false,
        type: 'missing',
        liveStatus: 'MISSING',
        error: 'Phone number is required'
      });
    }

    // Trim whitespace
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return res.json({
        valid: false,
        type: 'missing',
        liveStatus: 'MISSING',
        error: 'Phone number is empty'
      });
    }

    // Call HLRLookup API
    const response = await fetch('https://api.hlrlookup.com/apiv2/hlr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        api_secret: apiSecret,
        requests: [{
          telephone_number: cleanPhone
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HLRLookup API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract result from HLRLookup response
    const result = data.body?.results?.[0];

    if (!result) {
      throw new Error('Invalid response from HLRLookup API');
    }

    // Check for errors
    if (result.error !== 'NONE') {
      return res.json({
        valid: false,
        type: 'invalid',
        liveStatus: 'ERROR',
        error: result.error
      });
    }

    // Map HLRLookup response to our format
    const isLive = result.live_status === 'LIVE';
    const phoneType = result.telephone_number_type?.toLowerCase() || 'unknown';
    const carrier = result.current_network_details?.name || result.original_network_details?.name || 'unknown';
    const isPorted = result.is_ported === 'YES';
    const isRoaming = result.current_network !== result.original_network && result.current_network !== 'UNAVAILABLE';

    // Return successful validation result
    return res.json({
      valid: isLive,
      type: phoneType,
      carrier: carrier,
      liveStatus: result.live_status,
      isPorted: isPorted,
      isRoaming: isRoaming,
      originalCarrier: result.original_network_details?.name || 'unknown',
      currentCarrier: result.current_network_details?.name || carrier
    });

  } catch (error) {
    console.error('HLRLookup validation error:', error);

    // Handle errors
    return res.json({
      valid: false,
      type: 'error',
      liveStatus: 'ERROR',
      error: error.message || 'Unknown error occurred'
    });
  }
};
