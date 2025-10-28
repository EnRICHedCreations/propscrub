import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FilterTogglesProps {
  showDuplicates: boolean;
  showMissingPhones: boolean;
  showInvalidPhones: boolean;
  onToggleDuplicates: () => void;
  onToggleMissingPhones: () => void;
  onToggleInvalidPhones: () => void;
  duplicateCount: number;
  missingCount: number;
  invalidCount: number;
}

export const FilterToggles: React.FC<FilterTogglesProps> = ({
  showDuplicates,
  showMissingPhones,
  showInvalidPhones,
  onToggleDuplicates,
  onToggleMissingPhones,
  onToggleInvalidPhones,
  duplicateCount,
  missingCount,
  invalidCount,
}) => {
  return (
    <div className="filter-toggles">
      <h3>Filters</h3>
      <div className="filter-buttons">
        <button
          className={`filter-button ${!showDuplicates ? 'hidden' : ''}`}
          onClick={onToggleDuplicates}
        >
          {showDuplicates ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>Duplicates ({duplicateCount})</span>
        </button>

        <button
          className={`filter-button ${!showMissingPhones ? 'hidden' : ''}`}
          onClick={onToggleMissingPhones}
        >
          {showMissingPhones ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>Missing Phones ({missingCount})</span>
        </button>

        <button
          className={`filter-button ${!showInvalidPhones ? 'hidden' : ''}`}
          onClick={onToggleInvalidPhones}
        >
          {showInvalidPhones ? <Eye size={16} /> : <EyeOff size={16} />}
          <span>Invalid Phones ({invalidCount})</span>
        </button>
      </div>
    </div>
  );
};
