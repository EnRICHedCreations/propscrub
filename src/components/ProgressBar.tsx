import React from 'react';

interface ProgressBarProps {
  progress: number;
  message?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="progress-container">
      {message && <div className="progress-message">{message}</div>}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        >
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
