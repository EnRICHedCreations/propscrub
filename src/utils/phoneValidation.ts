import { ValidationResult, PhoneCache } from '../types';

// Vercel API endpoint
// For local development: uses Vercel dev server at localhost:3000
// For production: uses relative path /api/validatePhone (auto-resolves to deployed URL)
const API_ENDPOINT = import.meta.env.PROD
  ? '/api/validatePhone'
  : 'http://localhost:3000/api/validatePhone';

export const validatePhone = async (  
  phone: string,
  cache: PhoneCache
): Promise<ValidationResult> => {
  // Check cache first
  if (cache[phone]) {
    return cache[phone];
  }

  // Handle empty phone
  if (!phone || phone.trim() === '') {
    const result = { valid: false, type: 'missing' };
    cache[phone] = result;
    return result;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    cache[phone] = result;
    return result;
  } catch (error) {
    console.error('Error validating phone:', error);
    const fallback = { valid: false, type: 'error', error: String(error) };
    cache[phone] = fallback;
    return fallback;
  }
};
