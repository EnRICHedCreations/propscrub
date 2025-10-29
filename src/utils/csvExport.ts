import { CleanedRow } from '../types';

/**
 * Escapes CSV field values by wrapping in quotes if needed
 */
const escapeCsvField = (field: string | boolean): string => {
  const value = String(field);

  // Wrap in quotes if contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

/**
 * Converts array of objects to CSV string
 */
const convertToCSV = (data: CleanedRow[], fields: string[]): string => {
  // Create header row
  const header = fields.map(escapeCsvField).join(',');

  // Create data rows
  const rows = data.map(row => {
    return fields.map(field => {
      // @ts-ignore - dynamic field access
      const value = row[field] ?? '';
      return escapeCsvField(value);
    }).join(',');
  });

  return [header, ...rows].join('\n');
};

/**
 * Generates dynamic export fields based on phone/email column counts
 */
const generateExportFields = (numberOfPhones: number, numberOfEmails: number, isPrisonScrub: boolean): string[] => {
  const fields: string[] = [];

  // Add fields in the order they should appear
  fields.push("First Name");
  fields.push("Last Name");
  fields.push("Contact Type");

  // Add multiple phone columns with Type and Carrier for Prison Scrub
  for (let i = 1; i <= numberOfPhones; i++) {
    fields.push(`Phone ${i}`);
    if (isPrisonScrub) {
      fields.push(`Phone ${i} Type`);
      fields.push(`Phone ${i} Carrier`);
    }
  }

  // Add multiple email columns
  for (let i = 1; i <= numberOfEmails; i++) {
    fields.push(`Email ${i}`);
  }

  // Add remaining fields
  fields.push("Property Address");
  fields.push("Opportunity Name");
  fields.push("Stage");
  fields.push("Pipeline");
  fields.push("Tags");

  return fields;
};

/**
 * Transforms CleanedRow data to support multiple phone/email columns
 */
const transformDataForExport = (
  data: CleanedRow[],
  numberOfPhones: number,
  numberOfEmails: number,
  isPrisonScrub: boolean
): Record<string, string>[] => {
  return data.map(row => {
    const transformed: Record<string, string> = {};

    // Copy base fields
    transformed["First Name"] = String(row["First Name"] || "");
    transformed["Last Name"] = String(row["Last Name"] || "");
    transformed["Contact Type"] = String(row["Contact Type"] || "");
    transformed["Property Address"] = String(row["Property Address"] || "");
    transformed["Opportunity Name"] = String(row["Opportunity Name"] || "");
    transformed["Stage"] = String(row["Stage"] || "");
    transformed["Pipeline"] = String(row["Pipeline"] || "");
    transformed["Tags"] = String(row["Tags"] || "");

    // Add phone columns with Type and Carrier for Prison Scrub
    for (let i = 1; i <= numberOfPhones; i++) {
      const phoneField = `Phone ${i}`;
      transformed[phoneField] = String(row[phoneField] || "");

      if (isPrisonScrub) {
        transformed[`Phone ${i} Type`] = String(row[`Phone ${i} Type`] || "");
        transformed[`Phone ${i} Carrier`] = String(row[`Phone ${i} Carrier`] || "");
      }
    }

    // Add email columns (get from row data)
    for (let i = 1; i <= numberOfEmails; i++) {
      const emailField = `Email ${i}`;
      transformed[emailField] = String(row[emailField] || "");
    }

    return transformed;
  });
};

/**
 * Exports filtered data to CSV file with configurable phone/email columns
 */
export const exportToCSV = (
  data: CleanedRow[],
  filename: string,
  numberOfPhones: number = 1,
  numberOfEmails: number = 1,
  isPrisonScrub: boolean = false
) => {
  try {
    const exportFields = generateExportFields(numberOfPhones, numberOfEmails, isPrisonScrub);
    const transformedData = transformDataForExport(data, numberOfPhones, numberOfEmails, isPrisonScrub);

    const csv = convertToCSV(transformedData as any, exportFields);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};
