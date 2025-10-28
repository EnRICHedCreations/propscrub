import { CleanedRow } from '../types';
import { FilterSettings } from '../components/FilterSettings';

/**
 * Filters cleaned data based on user-defined filter settings
 * @param data - Array of cleaned rows
 * @param settings - Filter settings to apply
 * @returns Filtered array of cleaned rows
 */
export const applyDataFilters = (
  data: CleanedRow[],
  settings: FilterSettings
): CleanedRow[] => {
  return data.filter(row => {
    // Filter out duplicates
    if (settings.removeDuplicates && row["Duplicate Phone"]) {
      return false;
    }

    // Filter out missing phone numbers
    if (settings.removeMissingPhone && row["Missing Phone"]) {
      return false;
    }

    // Filter out invalid emails
    if (settings.removeInvalidEmail && !row["Email Valid"]) {
      return false;
    }

    // Filter out invalid phones
    if (settings.removeInvalidPhone && !row["Phone Valid"]) {
      return false;
    }

    // Filter by market search (zip code, city, or state) - supports comma-separated values
    if (settings.marketSearch && settings.marketSearch.trim() !== '') {
      const searchTerms = settings.marketSearch
        .split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 0);

      const propertyAddress = String(row["Property Address"] || "").toLowerCase();

      // Check if property address contains ANY of the search terms
      const matchesAnyTerm = searchTerms.some(term => propertyAddress.includes(term));

      if (!matchesAnyTerm) {
        return false;
      }
    }

    // Keep the row if it passes all filters
    return true;
  });
};
