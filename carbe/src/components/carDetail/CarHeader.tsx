import React from 'react';

interface CarHeaderProps {
  name: string;
  description: string;
}

const CarHeader: React.FC<CarHeaderProps> = ({
  name,
  description,
}) => {
  return (
    <div className="w-full mb-6 lg:mb-8">
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-4">{name}</h1>
      <p className="text-gray-300 text-sm lg:text-base leading-relaxed lg:leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
};

export default CarHeader; 