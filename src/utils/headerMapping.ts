import { RawRow, CleanedRow } from '../types';

export const TARGET_HEADERS = [
  "First Name", "Last Name", "Contact Type", "Phone", "Email",
  "Property Address", "Opportunity Name", "Stage", "Pipeline", "Tags"
] as const;

export const HEADER_MAP: Record<string, string> = {
  fname: "First Name",
  first: "First Name",
  "first name": "First Name",
  firstname: "First Name",
  "first_name": "First Name",
  lname: "Last Name",
  last: "Last Name",
  lastname: "Last Name",
  "last name": "Last Name",
  "last_name": "Last Name",
  contact: "Contact Type",
  "contact type": "Contact Type",
  "contact_type": "Contact Type",
  phone_number: "Phone",
  phone: "Phone",
  "phone number": "Phone",
  mobile: "Phone",
  cell: "Phone",
  email_address: "Email",
  email: "Email",
  "email address": "Email",
  mail: "Email",
  address: "Property Address",
  "property address": "Property Address",
  "property_address": "Property Address",
  "street address": "Property Address",
  deal: "Opportunity Name",
  opportunity: "Opportunity Name",
  "opportunity name": "Opportunity Name",
  "opportunity_name": "Opportunity Name",
  client_name: "Opportunity Name",
  name: "Opportunity Name",
  "client name": "Opportunity Name",
  "full name": "Opportunity Name",
  stage: "Stage",
  pipeline: "Pipeline",
  tags: "Tags",
  tag: "Tags"
};

/**
 * Normalize a row using automatic header detection
 */
export const normalizeRow = (rawRow: RawRow): CleanedRow => {
  const normalized: Partial<CleanedRow> = {};

  TARGET_HEADERS.forEach(targetHeader => {
    const sourceKey = Object.keys(rawRow).find(key => {
      const lowerKey = key.toLowerCase().trim();
      return HEADER_MAP[lowerKey] === targetHeader ||
             lowerKey === targetHeader.toLowerCase();
    });

    // @ts-ignore - dynamic assignment
    normalized[targetHeader] = sourceKey ? (rawRow[sourceKey]?.trim() || "") : "";
  });

  // Add defaults (only for truly optional fields)
  normalized["Tags"] = normalized["Tags"] || "";

  // Initialize validation flags
  normalized["Missing Phone"] = false;
  normalized["Duplicate Phone"] = false;
  normalized["Phone Valid"] = false;
  normalized["Phone Type"] = "";
  normalized["Email Valid"] = false;

  return normalized as CleanedRow;
};

/**
 * Normalize a row using custom user-defined mapping
 * @param rawRow - The raw CSV row
 * @param customMapping - Map of target header to source column(s)
 *                       string = single column, string[] = merged columns
 * @param targetHeaders - Array of target header names (dynamically generated based on phone/email counts)
 */
export const normalizeRowWithCustomMapping = (
  rawRow: RawRow,
  customMapping: Record<string, string | string[]>,
  targetHeaders?: string[]
): CleanedRow => {
  const normalized: Partial<CleanedRow> = {};
  const headers = targetHeaders || TARGET_HEADERS;

  // Initialize all target headers with empty strings
  headers.forEach(targetHeader => {
    // @ts-ignore - dynamic assignment
    normalized[targetHeader] = "";
  });

  // Apply custom mapping (reversed: target -> source)
  Object.entries(customMapping).forEach(([targetHeader, sourceColumn]) => {
    if (!sourceColumn) {
      // Skip if empty
      return;
    }

    if (Array.isArray(sourceColumn)) {
      // Merge multiple columns with comma-space separator
      const values = sourceColumn
        .map(col => rawRow[col]?.trim() || "")
        .filter(val => val !== "");

      // @ts-ignore - dynamic assignment
      normalized[targetHeader] = values.join(", ");
    } else {
      // Single column mapping
      if (rawRow[sourceColumn] !== undefined) {
        // @ts-ignore - dynamic assignment
        normalized[targetHeader] = rawRow[sourceColumn]?.trim() || "";
      }
    }
  });

  // Add defaults (only for truly optional fields)
  normalized["Tags"] = normalized["Tags"] || "";

  // Initialize validation flags
  normalized["Missing Phone"] = false;
  normalized["Duplicate Phone"] = false;
  normalized["Phone Valid"] = false;
  normalized["Phone Type"] = "";
  normalized["Email Valid"] = false;

  return normalized as CleanedRow;
};
