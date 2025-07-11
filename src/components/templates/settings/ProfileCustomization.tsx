'use client';
import React, { useState, useEffect ,useMemo} from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { Bars } from 'react-loader-spinner';
import axios from 'axios';
import InputField from '@/components/ui/InputField';
import { Copy, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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
  const solanaWalletAddress = useSelector((state: RootState) => state.user.solanaWalletAddress);
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

  const creatorAddress = useMemo(() => user?.wallet?.chainType === 'solana' ? user.wallet.address : solanaWalletAddress, [user?.wallet?.address, solanaWalletAddress]);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!creatorAddress) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`https://chaintv.onrender.com/api/creators/${creatorAddress}/profile`);
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
  }, [creatorAddress]);

  // Generate profile URL
  useEffect(() => {
   
    if (creatorAddress) {
      const host = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      setProfileUrl(`${host}/creator/${creatorAddress}`);
    }
  }, [creatorAddress]);

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
    if (!creatorAddress) {
      toast.error('Wallet not connected');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const endpoint = `https://chaintv.onrender.com/api/creators/${creatorAddress}/profile`;
      const method = isExistingProfile ? 'put' : 'post';
      
      await axios({
        method,
        url: endpoint,
        data: {
          ...profileData,
          creatorId: creatorAddress
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
        <Bars width={40} height={40} color="#A855F7" />
      </div>
    );
  }

  const hasRequiredFields = profileData.displayName.trim() && profileData.bio.trim();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h3 className="text-xl font-bold mb-2 text-white">Creator Profile</h3>
        <p className="text-gray-300">Customize your public profile that viewers will see</p>
      </div>

      {/* Profile URL Section - only show if required fields are filled */}
      {hasRequiredFields && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-white">Your Profile URL</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded text-white"
            />
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded transition-colors"
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePreview}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded hover:bg-white/20 transition-colors"
              title="Preview Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">Basic Information</h4>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Display Name <span className="text-red-400">*</span>
          </label>
          <InputField
            type="text"
            value={profileData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Enter your display name"
            className={`w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 ${errors.displayName ? 'border-red-400' : ''}`}
          />
          {errors.displayName && (
            <p className="text-red-400 text-xs mt-1">{errors.displayName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Bio <span className="text-red-400">*</span>
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell viewers about yourself..."
            className={`w-full p-3 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg resize-none h-24 text-white placeholder-gray-400 ${errors.bio ? 'border-red-400' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-300">{profileData.bio.length}/500 characters</p>
            {errors.bio && (
              <p className="text-red-400 text-xs">{errors.bio}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-white">Profile Picture</label>
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
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 hover:file:from-purple-700 hover:file:to-pink-700 file:text-white"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h4 className="font-semibold text-white">Social Links <span className="text-sm font-normal text-gray-300">(Optional)</span></h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Twitter </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Instagram </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              placeholder="https://instagram.com/username"
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white">YouTube </label>
            <InputField
              type="url"
              value={profileData.socialLinks?.youtube || ''}
              onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@channel"
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Website</label>
            <InputField
              type="url"
              value={profileData.socialLinks?.website || ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-white/20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <Bars width={16} height={16} color="#ffffff" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Profile'
          )}
        </button>
      </div>
    </div>
  );
} 