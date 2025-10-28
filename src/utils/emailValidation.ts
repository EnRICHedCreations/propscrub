/**
 * Email validation utility using comprehensive regex pattern
 * This is a free, client-side solution with no API dependencies
 */

// RFC 5322 compliant email regex (simplified for practical use)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Common disposable email domains to flag
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'trashmail.com', 'yopmail.com', 'temp-mail.org'
];

export interface EmailValidationResult {
  valid: boolean;
  isDisposable?: boolean;
  error?: string;
}

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns EmailValidationResult with validation status
 */
export const validateEmail = (email: string): EmailValidationResult => {
  // Handle empty or non-string values
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is empty or invalid type'
    };
  }

  // Trim whitespace
  const trimmedEmail = email.trim().toLowerCase();

  // Check if empty after trim
  if (!trimmedEmail) {
    return {
      valid: false,
      error: 'Email is empty'
    };
  }

  // Check length constraints
  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      error: 'Email is too long'
    };
  }

  // Check for valid format using regex
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  // Split into local and domain parts
  const [localPart, domain] = trimmedEmail.split('@');

  // Validate local part length (max 64 characters)
  if (localPart.length > 64) {
    return {
      valid: false,
      error: 'Email local part is too long'
    };
  }

  // Check for disposable email domains
  const isDisposable = DISPOSABLE_DOMAINS.some(disposableDomain =>
    domain.endsWith(disposableDomain)
  );

  return {
    valid: true,
    isDisposable
  };
};

/**
 * Batch validate multiple email addresses
 * @param emails - Array of email addresses
 * @returns Map of email to validation result
 */
export const validateEmails = (emails: string[]): Map<string, EmailValidationResult> => {
  const results = new Map<string, EmailValidationResult>();

  for (const email of emails) {
    results.set(email, validateEmail(email));
  }

  return results;
};
