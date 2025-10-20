import React from 'react';

const StatsCard = ({ icon, label, value, subtitle, gradient }) => {
  return (
    <div className={`card ${gradient || 'bg-gradient-to-br from-primary-500 to-primary-600'} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-xs mt-2">{subtitle}</p>
          )}
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
