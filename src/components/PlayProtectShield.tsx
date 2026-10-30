import React from 'react';

interface PlayProtectShieldProps {
  className?: string;
  size?: number | string;
  isScanning?: boolean;
}

/**
 * Official Google Play Protect vector shield component with verified checkmark
 * and optional scanning animation for real-time security verification.
 */
export const PlayProtectShield: React.FC<PlayProtectShieldProps> = ({
  className = 'w-4 h-4',
  size,
  isScanning = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className} shrink-0`}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={`w-full h-full ${isScanning ? 'animate-pulse' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gppGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34A853" />
            <stop offset="100%" stop-color="#01875F" />
          </linearGradient>
          <filter id="gppShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-opacity="0.15" />
          </filter>
        </defs>

        {/* Outer security shield shape */}
        <path
          d="M12 2L4 5.5V11.2C4 16.5 7.4 21.4 12 22.8C16.6 21.4 20 16.5 20 11.2V5.5L12 2Z"
          fill="url(#gppGradient)"
          filter="url(#gppShadow)"
        />

        {/* Inner subtle bevel ring */}
        <path
          d="M12 3.3L5.5 6.2V11.2C5.5 15.6 8.3 19.8 12 21.2C15.7 19.8 18.5 15.6 18.5 11.2V6.2L12 3.3Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="0.8"
        />

        {/* Crisp checkmark */}
        <path
          d="M9.5 11.8L11.2 13.5L14.8 9.5"
          stroke="#FFFFFF"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
