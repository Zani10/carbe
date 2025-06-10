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
  const iconClassName = "h-7 w-7 lg:h-8 lg:w-8 text-[#FF4646]";
  
  switch (type) {
    case 'range':
      return <Battery className={iconClassName} />;
    case 'seats':
      return <Users className={iconClassName} />;
    case 'powertrain':
      return <Zap className={iconClassName} />;
    default:
      return null;
  }
};

const SpecsGrid: React.FC<SpecsGridProps> = ({ specs }) => {
  return (
    <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-8">
      {specs.map((spec, index) => (
        <div
          key={index}
          className="bg-[#2A2A2A] rounded-xl p-4 lg:p-6 flex flex-col items-center justify-center text-center"
        >
          <SpecIcon type={spec.icon} />
          <div className="mt-3">
            <div className="font-bold text-white text-base lg:text-lg">{spec.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{spec.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecsGrid; 