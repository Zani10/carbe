'use client';

import { ChevronRight, Plus, Pen, Home, Building, GraduationCap, Languages, UserCircle } from 'lucide-react';

interface ProfileInfoProps {
  profile: {
    location?: string | null;
    work?: string | null;
    education?: string | null;
    languages?: string[] | null;
    bio?: string | null;
  } | null;
  onEditPersonalInfo: () => void;
}

export default function ProfileInfo({ profile, onEditPersonalInfo }: ProfileInfoProps) {
  const ProfileInfoItem = ({ 
    icon: Icon, 
    title, 
    value, 
    hasValue = false, 
    onClick 
  }: {
    icon: React.ElementType;
    title: string;
    value?: string | string[] | null;
    hasValue?: boolean;
    onClick?: () => void;
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
    >
      <div className="flex items-center">
        <Icon className="h-5 w-5 text-gray-400 mr-3" />
        <div className="text-left">
          <p className="text-white font-medium">{title}</p>
          {hasValue && value && (
            <p className="text-sm text-gray-400">
              {Array.isArray(value) ? value.join(', ') : value}
            </p>
          )}
          {!hasValue && (
            <p className="text-sm text-gray-500">Not provided</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {!hasValue && <Plus className="h-4 w-4 text-gray-500 mr-1" />}
        {hasValue && <Pen className="h-4 w-4 text-gray-500 mr-1" />}
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </button>
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Personal info</h2>
      <div className="space-y-3">
        <ProfileInfoItem
          icon={Home}
          title="Where you live"
          value={profile?.location}
          hasValue={!!profile?.location}
          onClick={onEditPersonalInfo}
        />
        <ProfileInfoItem
          icon={Building}
          title="Work"
          value={profile?.work}
          hasValue={!!profile?.work}
          onClick={onEditPersonalInfo}
        />
        <ProfileInfoItem
          icon={GraduationCap}
          title="Education"
          value={profile?.education}
          hasValue={!!profile?.education}
          onClick={onEditPersonalInfo}
        />
        <ProfileInfoItem
          icon={Languages}
          title="Languages"
          value={profile?.languages}
          hasValue={!!profile?.languages && profile.languages.length > 0}
          onClick={onEditPersonalInfo}
        />
        <ProfileInfoItem
          icon={UserCircle}
          title="About you"
          value={profile?.bio}
          hasValue={!!profile?.bio}
          onClick={onEditPersonalInfo}
        />
      </div>
    </div>
  );
} 