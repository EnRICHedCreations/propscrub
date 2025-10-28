const {onRequest} = require("firebase-functions/v2/https");
const twilio = require('twilio');

/**
 * HTTP endpoint to validate phone numbers using Twilio Lookup API
 * Uses Firebase Functions v2 (2nd generation) with manual CORS headers
 */
exports.validatePhone = onRequest({
  timeoutSeconds: 60,
  memory: "256MiB",
  invoker: "public",
}, async (req, res) => {
  // Set CORS headers manually
  const allowedOrigins = ['https://propscrub.web.app', 'http://localhost:3000', 'http://localhost:5000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Twilio credentials from environment variables
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error('Twilio credentials not configured');
      return res.status(500).json({
        valid: false,
        type: 'error',
        error: 'Twilio credentials not configured'
      });
    }

    // Initialize Twilio client
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

    const { phone } = req.body;

    // Validate input
    if (!phone || typeof phone !== 'string') {
      return res.json({
        valid: false,
        type: 'missing',
        error: 'Phone number is required'
      });
    }

    // Trim whitespace
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return res.json({
        valid: false,
        type: 'missing',
        error: 'Phone number is empty'
      });
    }

    // Call Twilio Lookup API v2
    const lookup = await twilioClient.lookups.v2
      .phoneNumbers(cleanPhone)
      .fetch({ fields: 'line_type_intelligence' });

    // Return successful validation result
    return res.json({
      valid: true,
      type: lookup.lineTypeIntelligence?.type || 'unknown',
      carrier: lookup.lineTypeIntelligence?.carrierName || 'unknown'
    });

  } catch (error) {
    console.error('Twilio validation error:', error);

    // Handle Twilio-specific errors
    if (error.status === 404) {
      return res.json({
        valid: false,
        type: 'invalid',
        error: 'Invalid phone number format'
      });
    }

    // Handle other errors
    return res.json({
      valid: false,
      type: 'error',
      error: error.message || 'Unknown error occurred'
    });
  }
});
