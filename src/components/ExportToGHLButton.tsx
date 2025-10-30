import { Download } from 'lucide-react';
import './ExportToGHLButton.css';

interface ExportToGHLButtonProps {
  onExport: () => void;
  rowCount: number;
  isExporting?: boolean;
}

export function ExportToGHLButton({ onExport, rowCount, isExporting = false }: ExportToGHLButtonProps) {
  return (
    <button
      onClick={onExport}
      className="export-to-ghl-button"
      disabled={rowCount === 0 || isExporting}
    >
      <Download size={18} />
      <span>
        {isExporting ? 'Exporting to GHL...' : `Export to GHL (${rowCount.toLocaleString()} records)`}
      </span>
    </button>
  );
}
