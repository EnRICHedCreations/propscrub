import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  rowCount: number;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled,
  rowCount,
}) => {
  return (
    <button
      onClick={onExport}
      disabled={disabled || rowCount === 0}
      className="export-button"
    >
      <Download size={20} />
      <span>Export {rowCount} Rows to CSV</span>
    </button>
  );
};
