import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="fixed top-8 left-8 z-10">
      <div className="flex flex-col items-center">
        <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
          <span className="text-white text-2xl font-bold">Meril</span>
        </div>
        <p className="text-white/70 text-sm mt-2">More to Life</p>
      </div>
    </div>
  );
};

export default Logo;