import React from 'react';
import { Battery, Users, Zap } from 'lucide-react';

interface Spec {
  icon: 'range' | 'seats' | 'powertrain';
  value: string;
  subtext: string;
}

interface SpecsGridProps {
  specs: Spec[];
}

const SpecIcon: React.FC<{ type: Spec['icon'] }> = ({ type }) => {
  switch (type) {
    case 'range':
      return <Battery className="h-6 w-6 text-red-500" />;
    case 'seats':
      return <Users className="h-6 w-6 text-red-500" />;
    case 'powertrain':
      return <Zap className="h-6 w-6 text-red-500" />;
    default:
      return null;
  }
};

const SpecsGrid: React.FC<SpecsGridProps> = ({ specs }) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {specs.map((spec, index) => (
        <div
          key={index}
          className="bg-[#2A2A2A] rounded-xl p-4 flex flex-col items-center justify-center text-center"
        >
          <SpecIcon type={spec.icon} />
          <div className="mt-2">
            <div className="font-semibold text-white">{spec.value}</div>
            <div className="text-xs text-gray-400">{spec.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecsGrid; 