import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel }) => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600 font-medium mb-1 truncate">
            {title}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </h3>
          
          {trend !== undefined && trendLabel && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex text-sm font-medium
                  ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}
                `}
              >
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-gray-500 truncate">
                {trendLabel}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex-shrink-0 p-2 md:p-3 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.number,
  trendLabel: PropTypes.string
};

export default StatsCard;