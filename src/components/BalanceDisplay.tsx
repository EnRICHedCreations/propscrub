import { Plus } from 'lucide-react';
import { UserBalance } from '../types/currency';

interface BalanceDisplayProps {
  balance: UserBalance;
  onPurchaseClick: () => void;
}

export const BalanceDisplay = ({ balance, onPurchaseClick }: BalanceDisplayProps) => {
  return (
    <div className="balance-display">
      <div className="balance-items">
        <div className="balance-item bubbles">
          <span className="balance-icon">💧</span>
          <div className="balance-info">
            <span className="balance-label">Bubbles</span>
            <span className="balance-value">{balance.bubbles}</span>
          </div>
        </div>
      </div>
      <button onClick={onPurchaseClick} className="add-balance-button" title="Purchase Currency">
        <Plus size={18} />
        <span>Add</span>
      </button>
    </div>
  );
};
