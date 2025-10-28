# Custom CSV Column Mapping Feature

## Overview

PropScrub now includes a **Custom CSV Column Mapping Interface** that allows users to manually map CSV columns to target fields before validation begins.

## What's New

### Interactive Mapping Modal

After uploading a CSV file, users are presented with an interactive modal that:

1. **Auto-detects and maps recognized headers** using the existing `HEADER_MAP` dictionary
2. **Shows mapping statistics** - displays count of mapped vs unmapped columns
3. **Provides visual feedback** - green checkmarks indicate successfully mapped columns
4. **Allows manual mapping** - dropdown selectors for each CSV column
5. **Supports skipping columns** - option to ignore unwanted columns
6. **Includes reset functionality** - button to clear all mappings and start fresh

## User Flow

```
1. Upload CSV → 2. Review Auto-Mapping → 3. Adjust Mappings → 4. Confirm → 5. Validation
```

### Step-by-Step

1. **Upload CSV File**
   - User clicks "Select CSV File"
   - Chooses a CSV file

2. **Mapping Modal Appears**
   - Shows all detected CSV headers
   - Auto-maps recognized headers
   - Displays mapping statistics

3. **User Reviews Mappings**
   - Sees which columns were auto-mapped (green checkmark)
   - Can manually map unmapped columns using dropdowns
   - Can change auto-mapped columns if needed
   - Can skip columns by selecting "-- Skip Column --"

4. **User Confirms**
   - Clicks "Confirm Mapping" to proceed
   - Or clicks "Cancel" to abort and start over
   - Or clicks "Reset All" to clear mappings

5. **Processing Begins**
   - Data is normalized using the custom mapping
   - Phone validation starts
   - Application continues as normal

## Technical Implementation

### Components Added

**`src/components/HeaderMappingModal.tsx`**
- React modal component for column mapping
- Auto-mapping logic on mount
- Interactive dropdowns for manual mapping
- Real-time statistics
- Reset functionality

### Utilities Enhanced

**`src/utils/headerMapping.ts`**
- New function: `normalizeRowWithCustomMapping()`
- Takes raw CSV row and custom mapping dictionary
- Returns `CleanedRow` with user-defined mappings

### State Management

**`src/App.tsx`** - New state variables:
- `rawData` - Stores unparsed CSV data
- `detectedHeaders` - Array of CSV column names
- `showMappingModal` - Controls modal visibility

### Styling

**`src/App.css`** - Added styles for:
- Modal overlay and content
- Mapping rows with hover effects
- Dropdown selectors
- Button variants (secondary, cancel, confirm)
- Responsive layout for mobile

## Features

### Auto-Mapping
- Uses existing `HEADER_MAP` for automatic detection
- Case-insensitive matching
- Supports 30+ common header variations

### Manual Mapping
- Dropdown selector for each CSV column
- Shows all available target fields
- Option to skip columns
- Visual feedback when mapped

### Statistics
- **Mapped** badge - shows count of mapped columns (green)
- **Unmapped** badge - shows count of unmapped columns (orange)
- Warning message lists all unmapped columns

### Reset Functionality
- "Reset All" button clears all mappings
- Allows user to start fresh
- Does not close the modal

### Validation
- Warns user about unmapped columns
- Shows which columns will be skipped
- Allows proceeding with partial mapping

## UI/UX Design

### Modal Design
- **Overlay**: Semi-transparent dark background
- **Content**: White rounded card, max 800px wide
- **Scrollable**: Body scrolls independently if content is long
- **Responsive**: Stacks vertically on mobile devices

### Color Coding
- **Green**: Successfully mapped columns
- **Orange**: Unmapped columns (warning)
- **Purple**: Primary brand color (buttons, headers)
- **Gray**: Secondary/inactive elements

### Icons
- **Check (✓)**: Mapped column
- **X**: Close modal
- **Rotate**: Reset all mappings

## Benefits

1. **Flexibility**: Works with ANY CSV structure
2. **Control**: Users decide what gets imported
3. **Transparency**: Clear view of what's being mapped
4. **Efficiency**: Auto-mapping handles most cases
5. **Error Prevention**: Skip unwanted columns before processing

## Build Impact

- **Bundle size**: +3.5 KB (231 KB total, 73 KB gzipped)
- **Performance**: No impact on validation speed
- **Compatibility**: Works with all existing CSVs

## Future Enhancements

Potential improvements:
- Save mapping templates for reuse
- Import/export mapping configurations
- AI-powered column name suggestions
- Batch mapping (map multiple similar columns at once)
- Preview sample data before confirming

## Code References

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/HeaderMappingModal.tsx` | 1-116 | Modal component |
| `src/utils/headerMapping.ts` | 78-115 | Custom mapping function |
| `src/App.tsx` | 24-25, 27-77 | State and handlers |
| `src/App.css` | 287-570 | Modal styling |

## Testing

Test the feature with:

1. **Standard headers** - Should auto-map successfully
2. **Custom headers** - Should show as unmapped, allow manual mapping
3. **Mixed headers** - Some auto-mapped, some manual
4. **Skip columns** - Verify skipped columns don't appear in output
5. **Reset** - Verify all mappings clear and dropdown returns to "-- Skip Column --"

## Screenshots

### Modal on Initial Load
- Shows detected CSV headers
- Auto-mapped columns have green checkmarks
- Statistics show mapped/unmapped counts

### Manual Mapping
- User clicks dropdown for unmapped column
- Selects target field from list
- Checkmark appears when mapped

### Before Confirmation
- User reviews all mappings
- Sees warning about unmapped columns
- Clicks "Confirm Mapping" to proceed

---

**Feature implemented**: October 26, 2025
**Build version**: 1.1.0 with custom mapping
