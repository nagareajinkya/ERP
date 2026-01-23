import React from 'react';

const StatsOverview = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((stat, index) => (
        <div key={index} className={`${stat.bg} ${stat.border} border p-5 rounded-xl`}>
          <p className={`text-sm font-medium ${stat.text} mb-2`}>{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.text}`}>{stat.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;