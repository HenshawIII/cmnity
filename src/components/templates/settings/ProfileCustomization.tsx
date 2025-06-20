'use client';
import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { Bars } from 'react-loader-spinner';
import axios from 'axios';
import InputField from '@/components/ui/InputField';
import { Copy, ExternalLink } from 'lucide-react';

interface ProfileData {
  displayName: string;
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  isPublic: boolean;
}

export function ProfileCustomization() {
  const { user } = usePrivy();
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    bio: '',
    avatar: '',
    socialLinks: {},
    theme: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#3351ff',
    },
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [errors, setErrors] = useState<{
    displayName?: string;
    bio?: string;
  }>({});
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.wallet?.address) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`https://chaintv.onrender.com/api/creators/${user.wallet.address}/profile`);
        console.log('response', response);
        if (response.data) {
          setProfileData(response.data.profile);
          setIsExistingProfile(true);
        }
      } catch (error) {
        console.log('No existing profile found');
        setIsExistingProfile(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.wallet?.address]);

  // Generate profile URL
  useEffect(() => {
    if (user?.wallet?.address) {
      const host = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      setProfileUrl(`${host}/creator/${user.wallet.address}`);
    }
  }, [user?.wallet?.address]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleThemeChange = (property: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [property]: value
      }
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileData(prev => ({
        ...prev,
        avatar: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!profileData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user?.wallet?.address) {
      toast.error('Wallet not connected');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const endpoint = `https://chaintv.onrender.com/api/creators/${user.wallet.address}/profile`;
      const method = isExistingProfile ? 'put' : 'post';
      
      await axios({
        method,
        url: endpoint,
        data: {
          ...profileData,
          creatorId: user.wallet.address
        }
      });

      if (!isExistingProfile) {
        setIsExistingProfile(true);
      }
      
      toast.success(`Profile ${isExistingProfile ? 'updated' : 'saved'} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isExistingProfile ? 'update' : 'save'} profile`);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handlePreview = () => {
    window.open(profileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Bars width={40} height={40} color="#3351FF" />
      </div>
    );
  }

  const hasRequiredFields = profileData.displayName.trim() && profileData.bio.trim();

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold mb-2">Creator Profile</h3>
        <p className="text-gray-600">Customize your public profile that viewers will see</p>
      </div>

      {/* Profile URL Section - only show if required fields are filled */}
      {hasRequiredFields && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Your Profile URL</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 p-2 border rounded bg-white"
            />
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-main-blue text-white rounded hover:bg-blue-600 transition-colors"
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePreview}
              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              title="Preview Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold">Basic Information</h4>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Display Name <span className="text-red-500">*</span>
          </label>
          <InputField
            type="text"
            value={profileData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            className={`w-full ${errors.displayName ? 'border-red-500' : ''}`}
          />
          {errors.displayName && (
            <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell viewers about yourself..."
            className={`w-full p-3 border rounded-lg resize-none h-24 ${errors.bio ? 'border-red-500' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">{profileData.bio.length}/500 characters</p>
            {errors.bio && (
              <p className="text-red-500 text-xs">{errors.bio}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profile Picture</label>
          <div className="flex items-center space-x-4">
            {profileData.avatar && (
              <img
                src={profileData.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main-blue file:text-white hover:file:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h4 className="font-semibold">Social Links <span className="text-sm font-normal text-gray-500">(Optional)</span></h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Twitter </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Instagram </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              placeholder="https://instagram.com/username"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">YouTube </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.youtube || ''}
              onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@channel"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <InputField
              type="url"
              value={profileData.socialLinks?.website || ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Theme Customization */}
      {/* <div className="space-y-4">
        <h4 className="font-semibold">Theme Customization</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={profileData?.theme?.backgroundColor}
                onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                className="w-12 h-10 border rounded"
              />
              <InputField
                type="text"
                value={profileData?.theme?.backgroundColor}
                onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={profileData?.theme?.textColor}
                onChange={(e) => handleThemeChange('textColor', e.target.value)}
                className="w-12 h-10 border rounded"
              />
              <InputField
                type="text"
                value={profileData?.theme?.textColor}
                onChange={(e) => handleThemeChange('textColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={profileData?.theme?.accentColor}
                onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                className="w-12 h-10 border rounded"
              />
              <InputField
                type="text"
                value={profileData?.theme?.accentColor}
                onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      {/* <div className="space-y-4">
        <h4 className="font-semibold">Privacy Settings</h4>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={profileData?.isPublic}
            onChange={(e) => handleInputChange('isPublic', e.target.checked.toString())}
            className="w-4 h-4 text-main-blue bg-gray-100 border-gray-300 rounded focus:ring-main-blue"
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            Make my profile public
          </label>
        </div>
        <p className="text-xs text-gray-500">
          When enabled, your profile will be visible to anyone with the link
        </p>
      </div> */}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-main-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <Bars width={16} height={16} color="#ffffff" />
              <span>{isExistingProfile ? 'Updating...' : 'Saving...'}</span>
            </div>
          ) : (
            isExistingProfile ? 'Update Profile' : 'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
} 