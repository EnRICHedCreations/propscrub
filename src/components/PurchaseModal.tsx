import { X, CreditCard } from 'lucide-react';
import { PURCHASE_OPTIONS, PurchaseOption } from '../types/currency';

interface PurchaseModalProps {
  onClose: () => void;
  onPurchase: (option: PurchaseOption) => void;
}

export const PurchaseModal = ({ onClose, onPurchase }: PurchaseModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content purchase-modal">
        <div className="modal-header">
          <h2>Purchase Currency</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="purchase-info">
            <p className="purchase-description">
              PropScrub uses Bubbles 💧 to process your lists. Basic Scrub costs <strong>10 Bubbles per 50 records</strong>.
            </p>
            <p className="dev-mode-notice">
              🚧 <strong>Development Mode:</strong> No real charges will be made. This is for testing purposes only.
            </p>
          </div>

          <div className="purchase-options">
            {PURCHASE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`purchase-option ${option.popular ? 'popular' : ''}`}
              >
                {option.popular && <div className="popular-badge">Most Popular</div>}
                <div className="option-header">
                  <h3>{option.name}</h3>
                  <span className="option-icon">💧</span>
                </div>
                <div className="option-details">
                  <p className="option-amount">{option.bubbles} Bubbles</p>
                </div>
                <div className="option-footer">
                  <div className="option-price">${option.priceUSD.toFixed(2)}</div>
                  <button
                    onClick={() => onPurchase(option)}
                    className="purchase-button"
                  >
                    <CreditCard size={18} />
                    <span>Purchase</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="button-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
