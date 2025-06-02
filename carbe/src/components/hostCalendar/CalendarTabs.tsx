import React from 'react';

interface CalendarTabsProps {
  activeTab: 'availability' | 'pricing';
  onTabChange: (tab: 'availability' | 'pricing') => void;
}

export default function CalendarTabs({ activeTab, onTabChange }: CalendarTabsProps) {
  const tabs = [
    {
      id: 'availability' as const,
      label: 'Availability',
      description: 'Tap dates to block/unblock availability'
    },
    {
      id: 'pricing' as const,
      label: 'Pricing',
      description: 'Tap dates to set custom pricing'
    }
  ];

  return (
    <div className="mb-6">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-base font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#FF2800] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Description */}
      <div className="mt-3 px-1">
        <p className="text-xs text-gray-500">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
} 