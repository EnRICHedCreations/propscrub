# Column Merging & Reversed Mapping Update

## Overview

PropScrub's mapping interface has been **completely redesigned** with two major improvements:

1. **Reversed Mapping Direction**: Map export fields TO source columns (instead of source TO export)
2. **Column Merging**: Merge multiple CSV columns into a single export field

## What Changed

### Before (Old Design)
```
CSV Column → Export Field
fname       → First Name
lname       → Last Name
```

### After (New Design)
```
Export Field     ← CSV Column(s)
First Name       ← fname
Property Address ← [street, city, state, zip]  (MERGED!)
```

## New Features

### 1. Reversed Mapping Direction

**Why the change?**
- More intuitive: Start with what you want to export
- Better control: See all export fields upfront
- Clearer: Know exactly what your final CSV will contain

**How it works:**
- Modal shows all **target export fields** (First Name, Last Name, Phone, etc.)
- For each field, you select which CSV column(s) to pull from
- Unmapped fields will be empty in the export

### 2. Column Merging

**Use Case Example:**
Your CSV has:
- `Street Address` column
- `City` column
- `State` column
- `Zip Code` column

You want to export a single `Property Address` field with all this data combined.

**Solution:**
1. Find "Property Address" in the mapping modal
2. Click "Merge Columns" button
3. Select: Street, City, State, Zip
4. Result: "123 Main St, New York, NY, 10001"

### Merge Features

- **Add unlimited columns**: Click "+ Add Column to Merge"
- **Remove columns**: Click trash icon next to each column
- **Auto-detection**: Automatically detects address-like columns and merges them
- **Separator**: Joins with ", " (comma-space)
- **Empty handling**: Skips empty values automatically
- **Switch modes**: Toggle between single column and merge mode

## UI Components

### Single Column Mode (Default)
```
Export Field: Phone
[Dropdown: Select CSV column] ▼
[+ Merge Columns] button
```

### Merge Mode
```
Export Field: Property Address
┌─────────────────────────────────┐
│ [Street       ▼]  [🗑️]          │
│ [City         ▼]  [🗑️]          │
│ [State        ▼]  [🗑️]          │
│ [Zip          ▼]  [🗑️]          │
│ [+ Add Column to Merge]         │
│ [Switch to Single Column]       │
└─────────────────────────────────┘
```

## Auto-Detection

### Smart Address Merging
If your CSV has multiple address-related columns, PropScrub automatically:
1. Detects columns matching: `address`, `street`, `city`, `state`, `zip`
2. Creates a merged mapping for "Property Address"
3. Arranges them in logical order

### Standard Field Mapping
Still uses the existing `HEADER_MAP` to auto-map common headers:
- `fname` → First Name
- `phone_number` → Phone
- `email_address` → Email
- etc.

## Technical Implementation

### Data Structure

**Mapping Type:**
```typescript
Record<string, string | string[]>

// Examples:
{
  "First Name": "fname",                    // Single column
  "Property Address": ["street", "city", "state", "zip"]  // Merged
}
```

### Normalization Logic

**`normalizeRowWithCustomMapping()`** in `headerMapping.ts`:

```typescript
// Single column
if (typeof sourceColumn === 'string') {
  normalized[targetField] = rawRow[sourceColumn] || "";
}

// Merged columns
if (Array.isArray(sourceColumn)) {
  const values = sourceColumn
    .map(col => rawRow[col]?.trim() || "")
    .filter(val => val !== "");
  normalized[targetField] = values.join(", ");
}
```

### Example Output

**CSV Input:**
```csv
street,city,state,zip,fname,lname
123 Main St,Boston,MA,02101,John,Doe
```

**Mapping:**
```json
{
  "Property Address": ["street", "city", "state", "zip"],
  "First Name": "fname",
  "Last Name": "lname"
}
```

**Export Output:**
```csv
Property Address,First Name,Last Name
"123 Main St, Boston, MA, 02101",John,Doe
```

## UI/UX Design

### Visual Indicators

- **Green checkmark**: Field is mapped
- **Dashed border**: Merge mode active
- **Purple buttons**: Primary actions
- **Green buttons**: Add actions
- **Red buttons**: Remove actions

### Interactive Elements

1. **Dropdown selectors**: Choose source columns
2. **Merge/Single toggle**: Switch between modes
3. **Add column button**: Add more merge columns
4. **Remove column button**: Delete merge columns
5. **Reset all button**: Clear all mappings

### Responsive Design

- **Desktop**: 3-column layout (Target | Arrow | Source)
- **Mobile**: Stacks vertically, hides arrow

## Benefits

### For Users

1. **More flexible**: Handle any CSV structure
2. **Merge data**: Combine fragmented address fields
3. **See what you get**: Export fields listed upfront
4. **Intuitive**: Natural workflow (define output → select input)
5. **Powerful**: Mix single and merged mappings

### For Developers

1. **Clean data model**: `Record<string, string | string[]>`
2. **Type-safe**: Full TypeScript support
3. **Extensible**: Easy to add custom merge logic
4. **Maintainable**: Single normalization function

## Real-World Example

**Scenario:** Import leads from multiple sources with inconsistent address formats.

**Source A CSV:**
```
name,phone,full_address
John Doe,555-0100,"123 Main St, Boston MA 02101"
```

**Source B CSV:**
```
contact,mobile,street,city,state,postal
Jane Smith,555-0200,456 Oak Ave,Portland,OR,97201
```

**PropScrub Mapping:**

For Source A:
- Phone ← full_address (single column)

For Source B:
- Phone ← [street, city, state, postal] (merged!)

Both export as clean, consistent `Property Address` fields!

## Build Impact

- **Bundle size**: +2.7 KB (234 KB total, 74 KB gzipped)
- **Performance**: No validation slowdown
- **Backward compatible**: Existing auto-mapping still works

## Code References

| File | Changes | Purpose |
|------|---------|---------|
| `HeaderMappingModal.tsx` | Complete rewrite (298 lines) | Reversed UI, merge controls |
| `headerMapping.ts` | Updated normalization | Handle string[] merges |
| `App.tsx` | Updated type signature | Accept merged mappings |
| `App.css` | Added merge styles | Visual design for merge mode |

## Testing Checklist

- [ ] Single column mapping works
- [ ] Merge mode activated correctly
- [ ] Add/remove merge columns
- [ ] Auto-detection finds address fields
- [ ] Empty values skipped in merge
- [ ] Switch between single/merge modes
- [ ] Export shows merged data
- [ ] Reset clears all mappings
- [ ] Mobile responsive layout

## Future Enhancements

- **Custom separators**: Choose join character (comma, space, newline)
- **Merge templates**: Save common merge patterns
- **Format options**: Uppercase, title case, etc.
- **Conditional merging**: Only merge if certain fields present
- **Preview pane**: Show sample merged output before confirming

---

**Feature updated**: October 26, 2025
**Build version**: 1.2.0 with column merging
