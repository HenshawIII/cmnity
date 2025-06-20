'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllStreams } from '@/features/streamAPI';
import { getAssets } from '@/features/assetsAPI';
import { AppDispatch, RootState } from '@/store/store';
import { Stream, Asset } from '@/interfaces';
import { VideoCard } from '@/components/Card/Card';
import { StreamCard } from './StreamCard';
import image1 from '@/assets/image1.png';
import { Bars } from 'react-loader-spinner';
import { toast } from 'sonner';
import axios from 'axios';
import Link from 'next/link';

interface CreatorProfileData {
  creatorId: string;
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
  isVerified: boolean;
  totalViews: number;
  totalStreams: number;
  totalVideos: number;
}

interface CreatorProfileProps {
  creatorId: string;
}

export function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { streams, loading: streamsLoading, error: streamsError } = useSelector((state: RootState) => state.streams);
  const { assets, loading: assetsLoading, error: assetsError } = useSelector((state: RootState) => state.assets);
  
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch creator profile data
  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://chaintv.onrender.com/api/creators/${creatorId}/profile`);
        console.log('response', response);
        setCreatorProfile(response.data.profile);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch creator profile');
        toast.error('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchCreatorProfile();
    }
  }, [creatorId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Page URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  // Fetch streams and assets for this creator
  useEffect(() => {
    if (creatorId) {
      dispatch(getAllStreams());
      dispatch(getAssets());
    }
  }, [dispatch, creatorId]);

  // Filter streams and assets for this creator
  const creatorStreams = streams.filter((stream: Stream) => 
    stream.creatorId?.value === creatorId && !!stream.playbackId
  );

// console.log('creatorStreams', creatorStreams);

  const creatorAssets = assets.filter((asset: Asset) => 
    asset.creatorId?.value === creatorId && !!asset.playbackId
  );

  // Handle errors
  useEffect(() => {
    if (streamsError) {
      toast.error('Failed to fetch streams: ' + streamsError);
    }
    if (assetsError) {
      toast.error('Failed to fetch assets: ' + assetsError);
    }
  }, [streamsError, assetsError]);

  if (loading) {
    return <CreatorProfileLoading />;
  }

  if (error || !creatorProfile) {
    console.log('error', error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Creator Not Found</h2>
          <p className="text-gray-600">This creator profile doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundColor: creatorProfile?.theme?.backgroundColor,
        color: creatorProfile?.theme?.textColor,
      }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Creator Header */}
        <div className="flex flex-col  items-center justify-between mb-8">
          <div className="flex flex-col items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
              <img
                src={creatorProfile?.avatar || '/assets/images/default-avatar.png'}
                alt={creatorProfile?.displayName}
                className="w-20 h-20 rounded-full object-cover border-4"
                style={{ borderColor: creatorProfile?.theme?.accentColor }}
              />
              {creatorProfile?.isVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{creatorProfile?.displayName}</h1>
              <p className="text-lg opacity-80">{creatorProfile?.bio}</p>
             
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-3">
            {creatorProfile?.socialLinks?.twitter && (
              <a
                href={creatorProfile?.socialLinks?.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                style={{ backgroundColor: `${creatorProfile?.theme?.accentColor}20` }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            )}
            {creatorProfile?.socialLinks?.instagram && (
              <a
                href={creatorProfile?.socialLinks?.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                style={{ backgroundColor: `${creatorProfile?.theme?.accentColor}20` }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.875-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
            )}
            {creatorProfile?.socialLinks?.youtube && (
              <a
                href={creatorProfile?.socialLinks?.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                style={{ backgroundColor: `${creatorProfile?.theme?.accentColor}20` }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {creatorProfile?.socialLinks?.website && (
              <a
                href={creatorProfile?.socialLinks?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                style={{ backgroundColor: `${creatorProfile?.theme?.accentColor}20` }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1 16.057v-3.057h2v3.057c1.14-.102 2-.317 2-.735 0-.418-.86-.633-2-.735V9.057c1.14-.102 2-.317 2-.735 0-.418-.86-.633-2-.735V5.057c1.14-.102 2-.317 2-.735 0-.418-.86-.633-2-.735V2h-2v1.057c-1.14.102-2 .317-2 .735 0 .418.86.633 2 .735v2.53c-1.14.102-2 .317-2 .735 0 .418.86.633 2 .735v2.53c-1.14.102-2 .317-2 .735 0 .418.86.633 2 .735z"/>
                </svg>
              </a>
            )}
          </div>
          <div>
          <button 
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation
              handleShare();
            }}
            className="w-full border mt-4 border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Page
          </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-6">
          {/* Live Streams Section */}
          <div className="">
            <h2 className="text-2xl font-bold mb-4">Live Streams</h2>
            {streamsLoading ? (
              <div className="flex justify-center py-8">
                <Bars width={40} height={40} color={creatorProfile?.theme?.accentColor} />
              </div>
            ) : creatorStreams.length > 0 ? (
              <div className="space-y-4">
                {creatorStreams.map((stream) => (
                  <Link 
                    key={stream.id}
                    href={`/view/${stream.playbackId}?streamName=${stream.name}&id=${creatorId}`}
                    className="block transition-transform hover:scale-[1.01]"
                  >
                    <StreamCard
                      title={stream.name}
                      thumbnailUrl={stream.thumbnailUrl || image1.src}
                      lastSeen={new Date(stream.lastSeen)}
                      isActive={stream.isActive}
                      viewerCount={stream.viewerCount}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-60">
                <p>No live streams available</p>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="">
            <h2 className="text-2xl font-bold mb-4 mt-8 md:mt-16 border-t-[1px] border-gray-200 pt-4">Videos</h2>
            {assetsLoading ? (
              <div className="flex justify-center py-8">
                <Bars width={40} height={40} color={creatorProfile?.theme?.accentColor} />
              </div>
            ) : creatorAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatorAssets.slice(0, 6).map((asset) => (
                  <VideoCard
                    key={asset.id}
                    title={asset.name}
                    assetData={asset}
                    imageUrl={image1}
                    playbackId={asset.playbackId}
                    createdAt={new Date(asset.createdAt)}
                    format={asset.videoSpec?.format}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-60">
                <p>No videos available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatorProfileLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Bars width={40} height={40} color="#3351FF" />
        <p className="mt-4">Loading creator profile...</p>
      </div>
    </div>
  );
} 