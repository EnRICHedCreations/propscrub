import { Settings } from 'lucide-react';

export interface FilterSettings {
  removeDuplicates: boolean;
  removeMissingPhone: boolean;
  removeInvalidEmail: boolean;
  removeInvalidPhone: boolean;
  numberOfPhones: number;
  numberOfEmails: number;
  marketSearch: string;
}

interface FilterSettingsProps {
  settings: FilterSettings;
  onSettingsChange: (settings: FilterSettings) => void;
}

export const FilterSettingsComponent = ({ settings, onSettingsChange }: FilterSettingsProps) => {
  const handleToggle = (key: keyof FilterSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleDropdownChange = (key: 'numberOfPhones' | 'numberOfEmails', value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleMarketSearchChange = (value: string) => {
    onSettingsChange({
      ...settings,
      marketSearch: value
    });
  };

  return (
    <div className="filter-settings-container">
      <div className="filter-settings-header">
        <Settings size={20} />
        <h3>Data Filters & Export Settings</h3>
      </div>

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

        <div className="column-settings">
          <h4>Export Columns:</h4>

          <div className="dropdown-item">
            <label>
              <span># of Phones</span>
              <select
                value={settings.numberOfPhones}
                onChange={(e) => handleDropdownChange('numberOfPhones', Number(e.target.value))}
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
                value={settings.numberOfEmails}
                onChange={(e) => handleDropdownChange('numberOfEmails', Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </label>
          </div>

          <div className="market-search-item">
            <label>
              <span>Search the market where you pulled the list?</span>
              <input
                type="text"
                placeholder="Search Zip Code, City or State"
                value={settings.marketSearch}
                onChange={(e) => handleMarketSearchChange(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
