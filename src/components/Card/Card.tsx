'use client';
import React, { useEffect, useState, useRef } from 'react';
import { BiSolidDownArrow, BiSolidUpArrow } from 'react-icons/bi';
import { AnalyticCardProps, ChannelCardProps, VideoCardProps } from '@/interfaces';
import { AssetPopup, Popup } from '../Popup';
import Image, { StaticImageData } from 'next/image';
import { FaPlay } from 'react-icons/fa';
import { VideoPlayer } from '../templates/dashboard/VideoPlayer';
import { useFetchPlaybackId, useFetchStreamPlaybackId } from '@/app/hook/usePlaybckInfo';
import { usePlaybackMetrics } from '@/app/hook/usePlaybackView';
import { Bars } from 'react-loader-spinner';
import { useViewMetrics } from '@/app/hook/useViewerMetrics';
import { FaLock } from 'react-icons/fa6';
import Link from 'next/link';
interface VideoStreamCardProps {
  playbackId: string;
  streamName: string;
  imageUrl: StaticImageData | string;
  creatorId: string;
  lastSeen: Date;
  status: boolean; // true means Live; false means Idle
}
// Analytic Card
export const AnalyticCard = ({ title, views, change, value, playtimeMins, loading }: AnalyticCardProps) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="border flex flex-col justify-between bg-background-gray border-border-gray rounded-lg p-4 gap-y-5 h-full">
        <div>
          <p className="text-2xl font-bold break-words">{title}</p>
        </div>
        {loading ? (
          <Bars width={25} height={25} color="#3351FF" />
        ) : (
          <div>
            {views ? (
              <p className="text-4xl font-extrabold tracking-wide">{views} Views</p>
            ) : (
              <p className="text-2xl font-bold tracking-wide">{playtimeMins}</p>
            )}
            <p className="text-xs flex items-center gap-1">
              <span className="text-black-secondary-text">{value}</span>
              <span>
                {value < 0 ? (
                  <BiSolidDownArrow className="text-orange-drop text-xs" />
                ) : (
                  <BiSolidUpArrow className="text-green-drop text-xs" />
                )}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
// Channel Card
export const ChannelCard: React.FC<ChannelCardProps> = ({
  title,
  goLive,
  streamId,
  playbackId,
  image,
  playb,
  lastSeen,
  status,
}) => {
  const { thumbnailUrl, loading } = useFetchStreamPlaybackId(playb);
  const { viewerMetrics: viewstream } = useViewMetrics({ playbackId: playb });
  return (
    <div className="w-full h-full flex flex-col group">
      <div className="w-full bg-gray rounded-md overflow-hidden relative">
        {loading ? (
          <div className="flex items-center w-full max-sm:h-[220px] h-[300px] lg:h-[200px] justify-center">
            <p>Loading</p>
          </div>
        ) : (
          <Image
            src={thumbnailUrl || image}
            alt={title}
            className="rounded-md w-full max-sm:h-[220px] h-[300px] lg:h-[200px] object-cover"
            width={400}
            height={180}
          />
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {viewstream?.viewCount} views
        </div>
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
          {status ? (
            <>
              <div className="bg-[#04EB2A] h-[6px] w-[6px] rounded-full" />
              <span className="text-xs text-black-primary-text font-medium select-none">Live</span>
            </>
          ) : (
            <>
              <div className="bg-gray-200 h-[6px] w-[6px] rounded-full" />
              <span className="text-xs text-gray-500 font-medium select-none">Idle</span>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div>
          <h3 className="font-bold text-black-primary-text text-lg capitalize pt-2 break-words">{title}</h3>
        </div>
        <div className="ml-auto pt-2">
          {streamId && playbackId && <Popup streamId={streamId} playbackId={playbackId} />}
        </div>
      </div>
      <div>
        <div className="text-sm text-[#838294] ">Last Active {lastSeen ? lastSeen.toDateString() : ''}</div>
      </div>
      <div className="flex justify-start mt-auto">
        <button
          className="mt-2 bg-main-blue cursor-pointer text-white py-2 text-sm font-bold px-4 rounded-[6px]"
          onClick={goLive}
        >
          Go Live
        </button>
      </div>
    </div>
  );
};
// Video Stream Card
export const VideoStreamCard: React.FC<VideoStreamCardProps> = ({
  playbackId,
  streamName,
  imageUrl,
  creatorId,
  lastSeen,
  status,
}) => {
  const { thumbnailUrl, loading } = useFetchStreamPlaybackId(playbackId);
  const { viewerMetrics: viewstream } = useViewMetrics({ playbackId: playbackId });
  const host = process.env.NEXT_PUBLIC_BASE_URL;

  const playbackUrl = host
    ? `${host.includes('localhost') ? 'http' : 'https'}://${host}/view/${playbackId}?streamName=${encodeURIComponent(
        streamName || '',
      )}&id=${encodeURIComponent(creatorId || '')}`
    : null;

  const handlePlayClick = () => {
    if (playbackUrl) {
      window.open(playbackUrl, '_blank');
    }
  };

  return (
    <div className="flex gap-3 p-2 cursor-pointer group">
      {/* Thumbnail Container */}
      <div className="relative flex-shrink-0 w-40 h-24">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <p className="text-sm">Loading...</p>
          </div>
        ) : (
          <>
            <Image
              src={thumbnailUrl || imageUrl || '/assets/default-thumbnail.jpg'}
              alt={streamName}
              fill
              className="rounded object-cover"
            />
            {/* Status overlay */}
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
              {status ? (
                <>
                  <div className="bg-[#04EB2A] h-[6px] w-[6px] rounded-full" />
                  <span className="text-xs text-black-primary-text font-medium select-none">Live</span>
                </>
              ) : (
                <>
                  <div className="bg-gray-200 h-[6px] w-[6px] rounded-full" />
                  <span className="text-xs text-gray-500 font-medium select-none">Idle</span>
                </>
              )}
            </div>
          </>
        )}

        {/* Hover overlay with play button */}
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-0 group-hover:bg-opacity-60 transition duration-300">
          <button onClick={handlePlayClick} className="text-white text-2xl opacity-0 group-hover:opacity-100">
            <FaPlay />
          </button>
        </div>
      </div>

      {/* Video Details */}
      <div className="flex flex-col justify-between flex-grow overflow-hidden">
        <p className="text-sm text-black capitalize line-clamp-2">{streamName}</p>
        <div>
          <p className="text-sm text-gray-500">{viewstream?.viewCount || 0} views</p>
          <p className="text-xs text-gray-500">Last Seen: {lastSeen.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export const VideoCard: React.FC<VideoCardProps> = ({ title, imageUrl, createdAt, playbackId, assetData, format }) => {
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { views: videocount } = usePlaybackMetrics(playbackId || '');
  const { thumbnailUrl, loading } = useFetchPlaybackId(assetData.playbackId);
  const handlePlayClick = () => {
    // setIsDialogOpen(true);
    if (assetData.playbackId) {
      window.open(`/player/${assetData.playbackId}`, '_blank');
    }
  };

  return (
    <div className="w-full h-full flex flex-col group">
      <div className="w-full bg-gray-200 rounded-md overflow-hidden relative">
        {loading ? (
          <div className="flex items-center w-full max-sm:h-[220px] h-[300px] lg:h-[200px] justify-center">
            <p>Loading</p>
          </div>
        ) : (
          <Image
            src={thumbnailUrl || imageUrl}
            alt={assetData.name}
            className="rounded-md w-full max-sm:h-[220px] h-[300px] lg:h-[200px] object-cover"
            width={400}
            height={180}
          />
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {videocount?.viewCount || 0} views
        </div>
        <div className="absolute inset-0 flex justify-center items-center group-hover:bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300">
          <button onClick={handlePlayClick} className="text-white text-4xl opacity-0 group-hover:opacity-100">
            <FaPlay />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div>
          <h2 className="font-bold text-black-primary-text text-lg capitalize pt-2 break-words">
            {title}
            {format ? `.${format}` : ''}
          </h2>
        </div>
        <div className="ml-auto">
          <AssetPopup asset={assetData} />
        </div>
      </div>
      <div className="flex justify-start">
        <p className="text-sm text-gray-500">{createdAt ? createdAt.toDateString() : ''}</p>
      </div>
      {/* <DemoPlay
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        playbackId={assetData.playbackId}
        title={assetData.name}
      /> */}
    </div>
  );
};

const PaymentDialog: React.FC<{
  onClose: () => void;
  onPaymentSuccess: () => void;
}> = ({ onClose, onPaymentSuccess }) => {
  const handlePayment = () => {
    // Simulate payment processing
    alert('Payment processing...');
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm mx-auto">
        <h2 className="text-lg font-bold mb-4">Payment Required</h2>
        <p className="mb-4">This video is gated. Please make a payment to watch this video.</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handlePayment} className="px-4 py-2 bg-blue-600 text-white rounded">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const StreamVideoCard: React.FC<VideoCardProps> = ({
  title,
  imageUrl,
  createdAt,
  playbackId,
  assetData,
  creatorId,
}) => {
  const [isGated, setIsGated] = useState(true);
  const [isLoadingGatedStatus, setIsLoadingGatedStatus] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Cache gated status to avoid redundant API calls
  const gatedStatusCache = useRef<Record<string, boolean>>({});

  const { views: videocount } = usePlaybackMetrics(playbackId || '');
  const { thumbnailUrl, loading } = useFetchPlaybackId(assetData.playbackId);

  // useEffect(() => {
  //   const checkGatedStatus = async () => {
  //     if (!creatorId || !assetData.playbackId) return;

  //     // Check if the gated status is already cached
  //     if (gatedStatusCache.current[assetData.playbackId] !== undefined) {
  //       // setIsGated(gatedStatusCache.current[assetData.playbackId]);
  //       return;
  //     }

  //     setIsLoadingGatedStatus(true); // Show loading state
  //     try {
  //       const response = await axios.get('https://chaintv.onrender.com/api/streams/findpayinguser', {
  //         params: { playbackId: assetData.playbackId, creatorId },
  //       });

  //       const isPaid = response.data?.isPaid ?? false;
  //       const gated = !isPaid; // If not paid, the video is gated
  //       gatedStatusCache.current[assetData.playbackId] = gated; // Cache the result
  //       // setIsGated(gated);
  //     } catch (error) {
  //       console.error('Error checking gated status:', error);
  //       setIsGated(false); // Default to not gated on error
  //     } finally {
  //       setIsLoadingGatedStatus(false); // Hide loading state
  //     }
  //   };

  //   checkGatedStatus();
  // }, [assetData.playbackId, creatorId]);

  // const handlePlayClick = () => {
  //   if (isLoadingGatedStatus) return; // Prevent interaction while loading

  //   if (isGated) {
  //     setShowPaymentDialog(true); // Show payment dialog if gated
  //   } else {
  //     setIsDialogOpen(true); // Open playback dialog if not gated
  //   }
  // };

  const handlePlayClick = () => {
    if (isLoadingGatedStatus) return;
    if (isGated) {
      setShowPaymentDialog(true); // Show payment dialog if gated
    } else {
      if (assetData.playbackId) {
        window.open(`/player/${assetData.playbackId}`, '_blank');
      }
    }
  };

  return (
    <>
      <div className="flex gap-3 p-2 cursor-pointer group">
        {/* Thumbnail Container */}
        <div className="relative flex-shrink-0 w-40 h-24">
          {loading || isLoadingGatedStatus ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-200">
              <p className="text-sm">Loading...</p>
            </div>
          ) : (
            <>
              <Image
                src={thumbnailUrl || imageUrl || '/assets/default-thumbnail.jpg'}
                alt={title}
                fill
                className="rounded object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                {assetData.videoSpec && assetData.videoSpec.duration
                  ? `${Math.floor(assetData.videoSpec.duration / 3600)
                      .toString()
                      .padStart(2, '0')}:${Math.floor((assetData.videoSpec.duration % 3600) / 60)
                      .toString()
                      .padStart(2, '0')}:${Math.floor(assetData.videoSpec.duration % 60)
                      .toString()
                      .padStart(2, '0')}`
                  : '00:00:00'}
              </span>
            </>
          )}

          {/* Hover overlay with play button */}
          <div className="absolute inset-0 flex justify-center items-center bg-opacity-0 group-hover:bg-opacity-60 transition duration-300">
            {isGated ? (
              <div onClick={handlePlayClick} className="text-main-blue text-4xl opacity-0 group-hover:opacity-100">
                <FaLock />
              </div>
            ) : (
              <button
                onClick={handlePlayClick}
                className="text-white text-4xl opacity-0 group-hover:opacity-100"
                disabled={isLoadingGatedStatus}
              >
                <FaPlay />
              </button>
            )}
          </div>
        </div>
        {/* Video Details */}
        <div className="flex flex-col justify-between flex-grow overflow-hiden">
          <p className="text-sm text-black capitalize line-clamp-2">{title}</p>
          <div className="">
            <p className="text-sm text-gray-500">{videocount?.viewCount} views</p>
            <p className="text-xs text-gray-500">{createdAt ? createdAt.toDateString() : ''}</p>
          </div>
        </div>
      </div>

      {/* Payment Dialog rendered conditionally */}
      {showPaymentDialog && (
        <PaymentDialog
          onClose={() => setShowPaymentDialog(false)}
          onPaymentSuccess={() => {
            setShowPaymentDialog(false);
            window.open(`/player/${assetData.playbackId}`, '_blank');
          }}
        />
      )}
    </>
  );
};
