'use client'

import React, { useState } from 'react';
import clsx from 'clsx';

interface TabBarProps {
  tabs: string[];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  initialTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0] || '');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-4 mb-4">
      <div 
        className="w-full flex justify-center"
        style={{
          backdropFilter: 'blur(25px) brightness(1)',
          WebkitBackdropFilter: 'blur(25px) brightness(1)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '30px',
        }}
      >
        <div className="flex w-full py-2.5 px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={clsx(
                "py-2 px-6 text-sm font-medium rounded-full transition-all duration-200 flex-1",
                activeTab === tab 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:text-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabBar; 