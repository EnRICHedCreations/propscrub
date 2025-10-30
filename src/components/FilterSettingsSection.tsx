import { Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FilterSettings } from './FilterSettings';

interface FilterSettingsSectionProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
}

export const FilterSettingsSection = ({ settings, onSettingsChange }: FilterSettingsSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggle = (key: keyof FilterSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <section className="filter-settings-section">
      <div
        className="filter-settings-header clickable"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer' }}
      >
        {isCollapsed ? <ChevronRight size={24} /> : <ChevronDown size={24} />}
        <Settings size={24} />
        <h2>Default Settings</h2>
      </div>

      {!isCollapsed && (
        <div className="filter-settings-content">
        <div className="filter-toggles">
          <h4>Remove Records:</h4>

          <div className="toggle-item">
            <label>
              <span>Duplicates</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.removeDuplicates}
                  onChange={() => handleToggle('removeDuplicates')}
                />
                <span className="toggle-label">
                  {settings.removeDuplicates ? 'Yes (Remove)' : 'No (Keep)'}
                </span>
              </div>
            </label>
          </div>

          <div className="toggle-item">
            <label>
              <span>Missing Phone Number</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.removeMissingPhone}
                  onChange={() => handleToggle('removeMissingPhone')}
                />
                <span className="toggle-label">
                  {settings.removeMissingPhone ? 'Yes (Remove)' : 'No (Keep)'}
                </span>
              </div>
            </label>
          </div>

          <div className="toggle-item">
            <label>
              <span>Invalid Emails</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.removeInvalidEmail}
                  onChange={() => handleToggle('removeInvalidEmail')}
                />
                <span className="toggle-label">
                  {settings.removeInvalidEmail ? 'Yes (Remove)' : 'No (Keep)'}
                </span>
              </div>
            </label>
          </div>

          <div className="toggle-item">
            <label>
              <span>Invalid Phone</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.removeInvalidPhone}
                  onChange={() => handleToggle('removeInvalidPhone')}
                />
                <span className="toggle-label">
                  {settings.removeInvalidPhone ? 'Yes (Remove)' : 'No (Keep)'}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
      )}
    </section>
  );
};
