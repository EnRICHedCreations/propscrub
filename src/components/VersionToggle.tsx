import { Lock, Unlock } from 'lucide-react';

export type ScrubVersion = 'basic' | 'prison';

interface VersionToggleProps {
  currentVersion: ScrubVersion;
  onVersionChange: (version: ScrubVersion) => void;
}

export const VersionToggle = ({ currentVersion, onVersionChange }: VersionToggleProps) => {
  return (
    <div className="version-toggle-wrapper">
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
            className={`version-option prison locked`}
            disabled
          >
            <Lock size={20} />
            <div className="version-info">
              <div className="version-name">Prison Scrub</div>
              <div className="version-price">Coming Soon</div>
            </div>
          </button>
        </div>

        <div className="version-features">
          {currentVersion === 'basic' ? (
            <p className="feature-description">
              Clean and organize your lead data with CSV formatting, duplicate detection, market targeting, email validation, and phone validation.
            </p>
          ) : (
            <p className="feature-description premium">
              All Basic Scrub features plus live phone status verification (LIVE/NOT LIVE) and phone type detection (mobile/landline/voip).
            </p>
          )}
        </div>
      </div>

      <div className="video-container">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="PropScrub Tutorial"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
