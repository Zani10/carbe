'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Edit3,
  Save,
  Camera,
  X,
  Plus
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface ProfileFormData {
  full_name: string;
  location: string;
  work: string;
  education: string;
  bio: string;
  languages: string[];
  nationality: string;
  profile_image: string;
}

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Polish', 'Turkish'
];

export default function PersonalSettingsPage() {
  const { user, profile, isHostMode } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    location: '',
    work: '',
    education: '',
    bio: '',
    languages: [],
    nationality: '',
    profile_image: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        location: profile.location || '',
        work: profile.work || '',
        education: profile.education || '',
        bio: profile.bio || '',
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        nationality: profile.nationality || '',
        profile_image: profile.profile_image || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setFormData(prev => ({ ...prev, profile_image: url }));
        toast.success('Photo uploaded successfully!');
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const addLanguage = (language: string) => {
    if (!formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
    setShowLanguageSelector(false);
    setLanguageSearch('');
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const filteredLanguages = COMMON_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !formData.languages.includes(lang)
  );

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Refresh the page to update the auth context
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !isHostMode) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Host Access Required</h2>
          <p className="text-gray-400 mt-2">You need to be a host to access settings.</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => router.push('/host/setup')}
          >
            Become a Host
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Personal Info</h1>
          </div>
          
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || '',
                      location: profile.location || '',
                      work: profile.work || '',
                      education: profile.education || '',
                      bio: profile.bio || '',
                      languages: Array.isArray(profile.languages) ? profile.languages : [],
                      nationality: profile.nationality || '',
                      profile_image: profile.profile_image || '',
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#FF4646] hover:bg-[#FF4646]/90"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Photo */}
        <Card variant="dark" padding="lg">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-20 w-20 bg-gray-700 rounded-full flex items-center justify-center text-gray-200 overflow-hidden">
                {formData.profile_image ? (
                  <img
                    src={formData.profile_image}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 bg-[#FF4646] text-white p-2 rounded-full hover:bg-[#FF4646]/90 transition-colors disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
              <p className="text-sm text-gray-400">
                {isEditing ? 'Click the camera icon to change your photo' : 'This helps guests recognize you'}
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646]"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-white py-3">{formData.full_name || 'Not provided'}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">{user.email}</span>
                <span className="text-xs text-gray-500">Email cannot be changed here</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646]"
                  placeholder="City, Country"
                />
              ) : (
                <p className="text-white py-3">{formData.location || 'Not provided'}</p>
              )}
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nationality
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646]"
                  placeholder="Your nationality"
                />
              ) : (
                <p className="text-white py-3">{formData.nationality || 'Not provided'}</p>
              )}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Languages
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  {/* Language Tags */}
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-[#FF4646]/20 border border-[#FF4646]/50 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-sm text-white">{language}</span>
                        <button
                          onClick={() => removeLanguage(language)}
                          className="text-[#FF4646] hover:text-[#FF4646]/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowLanguageSelector(true)}
                      className="flex items-center space-x-2 border-2 border-dashed border-gray-600 rounded-lg px-3 py-1.5 text-gray-400 hover:border-[#FF4646] hover:text-[#FF4646] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span className="text-sm">Add Language</span>
                    </button>
                  </div>

                  {/* Language Selector */}
                  {showLanguageSelector && (
                    <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
                      <input
                        type="text"
                        placeholder="Search languages..."
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-[#333333] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646] mb-3"
                      />
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {filteredLanguages.map((language) => (
                          <button
                            key={language}
                            onClick={() => addLanguage(language)}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#FF4646]/20 rounded-lg transition-colors"
                          >
                            {language}
                          </button>
                        ))}
                        {languageSearch && !filteredLanguages.some(lang => lang.toLowerCase() === languageSearch.toLowerCase()) && (
                          <button
                            onClick={() => addLanguage(languageSearch)}
                            className="w-full text-left px-3 py-2 text-sm text-[#FF4646] hover:bg-[#FF4646]/20 rounded-lg transition-colors"
                          >
                            Add "{languageSearch}"
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setShowLanguageSelector(false);
                          setLanguageSearch('');
                        }}
                        className="mt-3 w-full px-3 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3">
                  {formData.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-lg"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No languages added</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
          <div className="space-y-4">
            {/* Work */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Work
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.work}
                  onChange={(e) => handleInputChange('work', e.target.value)}
                  className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646]"
                  placeholder="Your job or profession"
                />
              ) : (
                <p className="text-white py-3">{formData.work || 'Not provided'}</p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Education
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646]"
                  placeholder="Your education background"
                />
              ) : (
                <p className="text-white py-3">{formData.education || 'Not provided'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* About You */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">About You</h3>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646] resize-none"
              rows={4}
              placeholder="Tell guests a bit about yourself..."
            />
          ) : (
            <p className="text-white whitespace-pre-wrap">
              {formData.bio || 'No bio provided'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
} 