import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { HEADER_MAP } from '../utils/headerMapping';

interface HeaderMappingModalProps {
  detectedHeaders: string[];
  numberOfPhones: number;
  numberOfEmails: number;
  isInIframe?: boolean;
  onConfirm: (mapping: Record<string, string | string[]>) => void;
  onCancel: () => void;
}

export const HeaderMappingModal: React.FC<HeaderMappingModalProps> = ({
  detectedHeaders,
  numberOfPhones,
  numberOfEmails,
  isInIframe = false,
  onConfirm,
  onCancel,
}) => {
  // Generate dynamic target headers based on phone/email counts
  const TARGET_HEADERS = useMemo(() => {
    const headers: string[] = ["First Name", "Last Name"];

    // Add phone columns
    for (let i = 1; i <= numberOfPhones; i++) {
      headers.push(numberOfPhones === 1 ? "Phone" : `Phone ${i}`);
    }

    // Add email columns
    for (let i = 1; i <= numberOfEmails; i++) {
      headers.push(numberOfEmails === 1 ? "Email" : `Email ${i}`);
    }

    // Add Property Address (always included)
    headers.push("Property Address");

    // Add GHL fields only if in iframe mode
    if (isInIframe) {
      headers.push("Contact Type", "Opportunity Name", "Stage", "Pipeline", "Tags");
    }

    return headers;
  }, [numberOfPhones, numberOfEmails, isInIframe]);

  // Mapping: Target field -> Source column(s)
  // String = single column, String[] = merged columns
  const [mapping, setMapping] = useState<Record<string, string | string[]>>({});
  const [autoMapped, setAutoMapped] = useState(0);

  // Auto-map headers on mount
  useEffect(() => {
    const initialMapping: Record<string, string | string[]> = {};
    let mappedCount = 0;

    // Track used columns to avoid duplicate mappings
    const usedColumns = new Set<string>();

    // Try to auto-map each target header
    TARGET_HEADERS.forEach(targetHeader => {
      // Special handling for Phone, Phone 1, Phone 2, etc.
      if (targetHeader === 'Phone' || targetHeader.startsWith('Phone ')) {
        const phoneCols = detectedHeaders.filter(h => {
          const lowerHeader = h.toLowerCase().trim();
          return !usedColumns.has(h) && (
            lowerHeader.includes('phone') ||
            lowerHeader.includes('mobile') ||
            lowerHeader.includes('cell')
          );
        });

        if (phoneCols.length > 0) {
          initialMapping[targetHeader] = phoneCols[0];
          usedColumns.add(phoneCols[0]);
          mappedCount++;
        } else {
          initialMapping[targetHeader] = '';
        }
        return;
      }

      // Special handling for Email, Email 1, Email 2, etc.
      if (targetHeader === 'Email' || targetHeader.startsWith('Email ')) {
        const emailCols = detectedHeaders.filter(h => {
          const lowerHeader = h.toLowerCase().trim();
          return !usedColumns.has(h) && (
            lowerHeader.includes('email') ||
            lowerHeader.includes('mail')
          );
        });

        if (emailCols.length > 0) {
          initialMapping[targetHeader] = emailCols[0];
          usedColumns.add(emailCols[0]);
          mappedCount++;
        } else {
          initialMapping[targetHeader] = '';
        }
        return;
      }

      // Find a matching CSV column for other fields
      const matchedColumn = detectedHeaders.find(csvHeader => {
        if (usedColumns.has(csvHeader)) return false;
        const lowerHeader = csvHeader.toLowerCase().trim();
        return HEADER_MAP[lowerHeader] === targetHeader ||
               lowerHeader === targetHeader.toLowerCase();
      });

      if (matchedColumn) {
        initialMapping[targetHeader] = matchedColumn;
        usedColumns.add(matchedColumn);
        mappedCount++;
      } else {
        initialMapping[targetHeader] = ''; // Unmapped
      }
    });

    // Special case: Auto-detect address merge
    if (!initialMapping["Property Address"] || initialMapping["Property Address"] === '') {
      const addressCols = detectedHeaders.filter(h =>
        /address|street|city|state|zip/i.test(h)
      );
      if (addressCols.length > 1) {
        initialMapping["Property Address"] = addressCols;
        mappedCount++;
      }
    }

    setMapping(initialMapping);
    setAutoMapped(mappedCount);
  }, [detectedHeaders, TARGET_HEADERS]);

  const handleMappingChange = (targetField: string, sourceColumn: string) => {
    setMapping(prev => ({
      ...prev,
      [targetField]: sourceColumn,
    }));
  };

  const handleMergeModeToggle = (targetField: string) => {
    const current = mapping[targetField];
    if (Array.isArray(current)) {
      // Switch to single column mode
      setMapping(prev => ({
        ...prev,
        [targetField]: current[0] || '',
      }));
    } else {
      // Switch to merge mode with current column
      setMapping(prev => ({
        ...prev,
        [targetField]: current ? [current] : [],
      }));
    }
  };

  const handleAddMergeColumn = (targetField: string) => {
    const current = mapping[targetField];
    if (Array.isArray(current)) {
      setMapping(prev => ({
        ...prev,
        [targetField]: [...current, ''],
      }));
    }
  };

  const handleRemoveMergeColumn = (targetField: string, index: number) => {
    const current = mapping[targetField];
    if (Array.isArray(current)) {
      const updated = current.filter((_, i) => i !== index);
      setMapping(prev => ({
        ...prev,
        [targetField]: updated.length === 0 ? '' : updated,
      }));
    }
  };

  const handleMergeColumnChange = (targetField: string, index: number, value: string) => {
    const current = mapping[targetField];
    if (Array.isArray(current)) {
      const updated = [...current];
      updated[index] = value;
      setMapping(prev => ({
        ...prev,
        [targetField]: updated,
      }));
    }
  };

  const handleReset = () => {
    const resetMapping: Record<string, string | string[]> = {};
    TARGET_HEADERS.forEach(header => {
      resetMapping[header] = '';
    });
    setMapping(resetMapping);
    setAutoMapped(0);
  };

  const handleConfirm = () => {
    onConfirm(mapping);
  };

  const getMappedCount = () => {
    return Object.values(mapping).filter(val => {
      if (Array.isArray(val)) {
        return val.length > 0 && val.some(v => v !== '');
      }
      return val !== '';
    }).length;
  };

  const getUnmappedTargets = () => {
    return TARGET_HEADERS.filter(target => {
      const val = mapping[target];
      if (Array.isArray(val)) {
        return val.length === 0 || !val.some(v => v !== '');
      }
      return !val || val === '';
    });
  };

  const isMapped = (targetField: string) => {
    const val = mapping[targetField];
    if (Array.isArray(val)) {
      return val.length > 0 && val.some(v => v !== '');
    }
    return val !== '';
  };

  const renderMappingControl = (targetField: string) => {
    const value = mapping[targetField];
    const isMergeMode = Array.isArray(value);

    if (isMergeMode) {
      return (
        <div className="merge-mode">
          {value.map((col, index) => (
            <div key={index} className="merge-row">
              <select
                value={col}
                onChange={(e) => handleMergeColumnChange(targetField, index, e.target.value)}
                className="mapping-select merge-select"
              >
                <option value="">-- Select Column --</option>
                {detectedHeaders.map(header => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveMergeColumn(targetField, index)}
                className="remove-merge-button"
                title="Remove column"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleAddMergeColumn(targetField)}
            className="add-merge-button"
          >
            <Plus size={16} />
            <span>Add Column to Merge</span>
          </button>
          <button
            onClick={() => handleMergeModeToggle(targetField)}
            className="toggle-merge-button"
          >
            Switch to Single Column
          </button>
        </div>
      );
    }

    return (
      <div className="single-mode">
        <select
          value={value as string}
          onChange={(e) => handleMappingChange(targetField, e.target.value)}
          className="mapping-select"
        >
          <option value="">-- Skip Field --</option>
          {detectedHeaders.map(header => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleMergeModeToggle(targetField)}
          className="toggle-merge-button"
        >
          <Plus size={16} />
          <span>Merge Columns</span>
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content mapping-modal-large">
        <div className="modal-header">
          <h2>Map Export Fields to CSV Columns</h2>
          <button onClick={onCancel} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body mapping-modal-body">
          <div className="mapping-left-panel">
            <div className="mapping-info">
              <p>
                Your CSV has <strong>{detectedHeaders.length}</strong> columns.
                Auto-mapped <strong>{autoMapped}</strong> fields.
              </p>
              <p className="help-text">
                For each export field, select which CSV column(s) to use. You can merge multiple columns together (e.g., Street + City + State + Zip → Property Address).
              </p>
            </div>

          <div className="mapping-stats">
            <span className="stat-badge mapped">
              {getMappedCount()} Mapped
            </span>
            <span className="stat-badge unmapped">
              {getUnmappedTargets().length} Unmapped
            </span>
          </div>

          <div className="mapping-list">
            {TARGET_HEADERS.map(targetField => (
              <div key={targetField} className="mapping-row-new">
                <div className="target-field">
                  <label>{targetField}</label>
                  {isMapped(targetField) && <Check size={16} className="icon-mapped" />}
                </div>
                <div className="arrow">←</div>
                <div className="source-control">
                  {renderMappingControl(targetField)}
                </div>
              </div>
            ))}
          </div>

          {getUnmappedTargets().length > 0 && (
            <div className="unmapped-warning">
              <strong>Note:</strong> The following fields will be empty: {' '}
              {getUnmappedTargets().join(', ')}
            </div>
          )}
          </div>

          <div className="mapping-right-panel">
            <div className="mapping-video-container">
              <h3>How to Map Your CSV</h3>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="CSV Mapping Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset} className="button-secondary">
            <RotateCcw size={18} />
            <span>Reset All</span>
          </button>
          <div className="button-group">
            <button onClick={onCancel} className="button-cancel">
              Cancel
            </button>
            <button onClick={handleConfirm} className="button-confirm">
              <Check size={18} />
              <span>Scrub'a'dub dub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
