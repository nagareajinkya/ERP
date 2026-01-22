import React from 'react';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
  const topGrid = [
    {id: 1, name:"To Receive", money:"$45,240", color:"green"},
    {id: 1, name:"To Pay", money:"$45,240", color:"red"},
    {id: 1, name:"Net Balance", money:"$45,240", color:"blue"},
    {id: 1, name:"Today's Sales", money:"$45,240", color:"violet"}
  ]



  return (
    <div className="p-6">
      <div>
      <p className='text-sm text-gray-500'>Welcome,</p>
      <h1 className="text-xl font-medium">Gurudev Kirana Store</h1>
      </div>
      
      <div className="flex gap-3">
        {topGrid.map((item) => (
          <div className={`bg-${item.color}-50  p-1`} key={item.id}>
          <p>{item.name}</p>
          <p>{item.money}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;