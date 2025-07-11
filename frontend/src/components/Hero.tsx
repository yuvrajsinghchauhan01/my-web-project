import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-start pl-16 pr-8">
      <div className="max-w-xl">
        <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
          "Where tech
          <br />
          meets
          <br />
          <span className="font-normal">compassion</span>"
        </h1>
      </div>
    </div>
  );
};

export default Hero;