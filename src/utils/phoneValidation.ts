import { ValidationResult, PhoneCache } from '../types';

// Firebase Function endpoint
// For local development: use Firebase emulator at localhost:5001
// For production: use your deployed Firebase function URL
const FIREBASE_FUNCTION_URL = import.meta.env.VITE_FIREBASE_FUNCTION_URL ||
  'http://127.0.0.1:5001/propscrub/us-central1/validatePhone';

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
    const response = await fetch(FIREBASE_FUNCTION_URL, {
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
