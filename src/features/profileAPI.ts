import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ProfileData {
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

// Fetch profile by creator address
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (creatorAddress: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://chaintv.onrender.com/api/creators/${creatorAddress}/profile`);
      return response.data?.profile || null;
    } catch (error: any) {
      // If profile doesn't exist, return null instead of error
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ creatorAddress, profileData }: { creatorAddress: string; profileData: ProfileData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `https://chaintv.onrender.com/api/creators/${creatorAddress}/profile`,
        { profile: profileData }
      );
      return response.data?.profile || profileData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Create new profile
export const createProfile = createAsyncThunk(
  'profile/createProfile',
  async ({ creatorAddress, profileData }: { creatorAddress: string; profileData: ProfileData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://chaintv.onrender.com/api/creators/${creatorAddress}/profile`,
        { profile: profileData }
      );
      return response.data?.profile || profileData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create profile');
    }
  }
);

