import React from 'react';

const BadgeDisplay = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No badges earned yet. Complete missions to earn badges!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <div className="text-5xl mb-3">{badge.icon}</div>
          <h4 className="font-semibold text-gray-900 text-center text-sm mb-1">
            {badge.name}
          </h4>
          <p className="text-xs text-gray-500">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
