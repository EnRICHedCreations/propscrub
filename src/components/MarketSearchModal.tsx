import { X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface MarketSearchModalProps {
  initialValue: string;
  onClose: () => void;
  onContinue: (marketSearch: string) => void;
}

export const MarketSearchModal = ({ initialValue, onClose, onContinue }: MarketSearchModalProps) => {
  const [marketSearch, setMarketSearch] = useState(initialValue);

  // Parse market search to show tags
  const marketTags = marketSearch
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const handleContinue = () => {
    onContinue(marketSearch);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content market-search-modal">
        <div className="modal-header">
          <h2>Market Search</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="market-search-content">
            <p className="modal-description">
              Search the market where you pulled the list to help organize your data.
            </p>

            <div className="market-search-input-group">
              <label>
                <span className="input-label">Market Location(s)</span>
                <input
                  type="text"
                  placeholder="Search Zip Code, City or State. (Comma separated)"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="market-search-input"
                />
              </label>

              {marketTags.length > 0 && (
                <div className="market-tags">
                  {marketTags.map((tag, index) => (
                    <span key={index} className="market-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="market-search-help">
                💡 Tip: You can search multiple markets by separating them with commas
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="button-secondary">
            Cancel
          </button>
          <button onClick={handleContinue} className="button-primary">
            <span>Move to Export Settings</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
