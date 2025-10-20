import React from 'react';

const XPProgressBar = ({ currentXP, level }) => {
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Level {level}
        </span>
        <span className="text-sm text-gray-600">
          {xpNeeded} XP to Level {level + 1}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <span className="text-xs text-white px-2">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPProgressBar;
