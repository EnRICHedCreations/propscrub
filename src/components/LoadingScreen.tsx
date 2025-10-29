import { useEffect, useState } from 'react';
import logo from '../images/Assigns-Logo.png';

interface LoadingScreenProps {
  progress: number;
}

const SAYINGS = [
  "Scrubbing lists cleaner than your browser history.",
  "Making your leads squeaky, so your pipeline stays freaky.",
  "Dirty data doesn't pay the bills."
];

export const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  const [saying] = useState(() => {
    // Pick random saying when component mounts
    return SAYINGS[Math.floor(Math.random() * SAYINGS.length)];
  });

  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Generate random bubbles
    const newBubbles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random position 0-100%
      size: Math.random() * 60 + 20, // Size between 20-80px
      delay: Math.random() * 2, // Delay between 0-2s
      duration: Math.random() * 3.75 + 2.5, // Duration between 2.5-6.25s (25% slower)
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="loading-screen">
      {/* Floating bubbles */}
      <div className="bubbles-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="loading-content">
        <img src={logo} alt="Assigns Logo" className="loading-logo" />

        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="loading-progress-text">{progress}%</span>
            </div>
          </div>
        </div>

        <p className="loading-saying">{saying}</p>
      </div>
    </div>
  );
};
