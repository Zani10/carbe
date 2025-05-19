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
    <div className="w-full mb-6 pt-4">
      <h1 className="text-2xl font-bold text-white mb-2">{name}</h1>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
};

export default CarHeader; 