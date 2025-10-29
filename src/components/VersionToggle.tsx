import { Lock, Unlock } from 'lucide-react';

export type ScrubVersion = 'basic' | 'prison';

interface VersionToggleProps {
  currentVersion: ScrubVersion;
  onVersionChange: (version: ScrubVersion) => void;
}

export const VersionToggle = ({ currentVersion, onVersionChange }: VersionToggleProps) => {
  return (
    <div className="version-toggle-container">
      <div className="version-toggle">
        <button
          className={`version-option ${currentVersion === 'basic' ? 'active' : ''}`}
          onClick={() => onVersionChange('basic')}
        >
          <Unlock size={20} />
          <div className="version-info">
            <div className="version-name">Basic Scrub</div>
            <div className="version-price">10 bubbles per 50 records</div>
          </div>
        </button>

        <button
          className={`version-option prison ${currentVersion === 'prison' ? 'active' : ''}`}
          onClick={() => onVersionChange('prison')}
        >
          <Lock size={20} />
          <div className="version-info">
            <div className="version-name">Prison Scrub</div>
            <div className="version-price">25 bubbles per 50 records</div>
          </div>
        </button>
      </div>

      <div className="version-features">
        {currentVersion === 'basic' ? (
          <ul className="feature-list">
            <li>Header normalization</li>
            <li>Duplicate address detection</li>
            <li>Email validation</li>
            <li>CSV export</li>
          </ul>
        ) : (
          <ul className="feature-list premium">
            <li>All Basic Scrub features</li>
            <li>Live phone status (LIVE/NOT LIVE)</li>
            <li>Phone type detection (mobile/landline/voip)</li>
            <li>Carrier identification</li>
            <li>Ported number detection</li>
            <li>Roaming status</li>
          </ul>
        )}
      </div>
    </div>
  );
};
