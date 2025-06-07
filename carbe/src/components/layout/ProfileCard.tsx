'use client';

import { User, Star, Edit3 } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ProfileCardProps {
  profile: {
    full_name?: string | null;
    profile_image?: string | null;
  } | null;
  user: {
    user_metadata?: {
      full_name?: string;
    };
  } | null;
  memberSince?: string;
  rating?: number;
  reviewCount?: number;
  onEditClick: () => void;
  showEditButton?: boolean;
}

export default function ProfileCard({ 
  profile, 
  user, 
  memberSince = 'New member',
  rating,
  reviewCount,
  onEditClick,
  showEditButton = true
}: ProfileCardProps) {
  const getRatingText = () => {
    if (rating && reviewCount) {
      return `${rating.toFixed(1)} rating (${reviewCount} reviews)`;
    }
    if (rating) {
      return `${rating.toFixed(1)} rating`;
    }
    return memberSince;
  };

  return (
    <Card variant="dark" padding="lg">
      <div className="flex items-center">
        <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 mr-4 overflow-hidden">
          {profile?.profile_image ? (
            <img 
              src={profile.profile_image} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User size={32} strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">
            {profile?.full_name || user?.user_metadata?.full_name || 'Your Name'}
          </h1>
          <p className="text-gray-400 text-sm">{memberSince}</p>
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-400">
              {getRatingText()}
            </span>
          </div>
        </div>
        {showEditButton && (
          <button 
            onClick={onEditClick}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Edit3 className="h-4 w-4 text-gray-300" />
          </button>
        )}
      </div>
    </Card>
  );
} 