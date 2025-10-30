import { X } from 'lucide-react';
import { useState } from 'react';

interface ExportColumnsModalProps {
  initialPhones: number;
  initialEmails: number;
  onClose: () => void;
  onMapCSV: (numberOfPhones: number, numberOfEmails: number) => void;
}

export const ExportColumnsModal = ({
  initialPhones,
  initialEmails,
  onClose,
  onMapCSV
}: ExportColumnsModalProps) => {
  const [numberOfPhones, setNumberOfPhones] = useState(initialPhones);
  const [numberOfEmails, setNumberOfEmails] = useState(initialEmails);

  const handleMapCSV = () => {
    onMapCSV(numberOfPhones, numberOfEmails);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content export-columns-modal">
        <div className="modal-header">
          <h2>Export Settings</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="export-columns-content">
            <h4>Export Columns:</h4>
            <p className="export-columns-description">
              Select how many phone and email columns to include in your export.
              You'll map these in the next step.
            </p>

            <div className="column-settings">
              <div className="dropdown-item">
                <label>
                  <span># of Phones</span>
                  <select
                    value={numberOfPhones}
                    onChange={(e) => setNumberOfPhones(Number(e.target.value))}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </label>
              </div>

              <div className="dropdown-item">
                <label>
                  <span># of Emails</span>
                  <select
                    value={numberOfEmails}
                    onChange={(e) => setNumberOfEmails(Number(e.target.value))}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="button-secondary">
            Cancel
          </button>
          <button onClick={handleMapCSV} className="button-primary">
            <span>Map CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
