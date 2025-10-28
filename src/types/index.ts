export interface RawRow {
  [key: string]: string;
}

export interface CleanedRow {
  "First Name": string;
  "Last Name": string;
  "Contact Type": string;
  "Property Address": string;
  "Opportunity Name": string;
  "Stage": string;
  "Pipeline": string;
  "Tags": string;
  "Missing Phone": boolean;
  "Duplicate Phone": boolean;
  "Phone Valid": boolean;
  "Phone Type": string;
  "Email Valid": boolean;
  // Allow dynamic phone/email fields (Phone 1, Phone 2, Email 1, Email 2, etc.)
  [key: string]: string | boolean;
}

export interface ValidationResult {
  valid: boolean;
  type: string;
  carrier?: string;
  error?: string;
}

export interface PhoneCache {
  [phone: string]: ValidationResult;
}
