'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Player from '@livepeer/react/player';
import type { Src } from '@livepeer/react';
import {
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  LoadingIcon,
  MuteIcon,
  OfflineErrorIcon,
  PauseIcon,
  PictureInPictureIcon,
  PlayIcon,
  PrivateErrorIcon,
  UnmuteIcon,
} from '@livepeer/react/assets';
import { Clip } from './Clip';
import { Settings } from './Settings';
import { useViewMetrics } from '@/app/hook/useViewerMetrics';
import { Smile, Gift } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getAssets } from '@/features/assetsAPI';
import { toast } from 'sonner';
import { Asset } from '@/interfaces';
import image1 from '@/assets/image1.png';
import { StreamVideoCard } from '@/components/Card/Card';
import axios from 'axios';
import { ColorRing } from 'react-loader-spinner';
// import { DonationDialog } from './DonationDialog';

// Assuming your product objects have { id, name, image, price }
interface Product {
  id: string;
  name: string;
  imageUrl?: StaticImageData;
  price: number;
}

export function PlayerWithControls({
  src,
  id,
  title,
  playbackId,
}: {
  src: Src[];
  title: string;
  playbackId: string;
  id: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [customization, setCustomization] = useState({
    bgColor: '#ffffff',
    textColor: '#000000',
    fontSize: '16',
  });
  const { viewerMetrics: totalViewers } = useViewMetrics({ playbackId });
  const [isVerified, setIsVerified] = useState(false);
  const { assets, loading: assetsLoading, error: assetsError } = useSelector((state: RootState) => state.assets);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number>(0);

  // Instead of alert, define a function to open the donation dialog with the desired amount.
  const handleDonateClick = (amount: number) => {
    setDonationAmount(amount);
    setDonationDialogOpen(true);
  };
  // --- Existing assets fetch ---
  useEffect(() => {
    dispatch(getAssets());
  }, [dispatch]);

  useEffect(() => {
    if (assetsError) {
      toast.error('Failed to fetch assets: ' + assetsError);
    }
  }, [assetsError]);
  // Memoize the fetchProducts function

  const fetchProducts = useCallback(async () => {
    if (!id) return;

    setProductsLoading(true);
    setProductsError(null);

    try {
      const response = await axios.get(`https://chaintv.onrender.com/api/${id}/products`);
      setProducts(response.data.product || []);
      console.log('Products fetched successfully:', response.data.product);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductsError('Failed to load products. Please try again.');
      toast.error('Failed to load products. Please try again.');
    } finally {
      setProductsLoading(false);
    }
  }, [id]);

  // Fetch products when the component mounts or when `id` changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => !!asset.playbackId && asset.creatorId?.value === id);
  }, [assets, id]);

  useEffect(() => {
    const stored = localStorage.getItem('channelCustomization');
    if (stored) {
      setCustomization(JSON.parse(stored));
    }
  }, []);

  // --- Verification check ---
  useEffect(() => {
    const token = localStorage.getItem('viewerToken');
    if (token) {
      setIsVerified(true);
    }
  }, []);

  // --- Playback URL ---
  const host = process.env.NEXT_PUBLIC_BASE_URL;
  const playbackUrl =
    host && playbackId
      ? `${host.includes('localhost') ? 'http' : 'https'}://${host}/view/${playbackId}?streamName=${encodeURIComponent(
          title,
        )}`
      : null;

  const handleCopyLink = async () => {
    try {
      if (playbackUrl && id) {
        await navigator.clipboard.writeText(playbackUrl);
        toast.success('Stream link successfully copied!');
      } else {
        toast.error('No playback URL available to copy.');
      }
    } catch (err) {
      toast.error('Failed to copy the stream link.');
    }
  };
  // If not verified, show viewer verification UI (unchanged)
  if (!isVerified) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          backgroundColor: customization.bgColor,
          color: customization.textColor,
          fontSize: `${customization.fontSize}px`,
        }}
      >
        <div className="p-8 border rounded shadow-md bg-white">
          <h2 className="text-xl font-bold mb-4">Viewer Verification</h2>
          <p className="mb-4">This stream is gated and subscription is required </p>
          <button
            onClick={() => setIsVerified(true)}
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Proceed to subscribe
          </button>
        </div>
      </div>
    );
  }

  // --- Render UI ---
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: customization.bgColor,
        color: customization.textColor,
        fontSize: `${customization.fontSize}px`,
      }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Title Header */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between">
          <div className="flex-1 text-center text-xl font-semibold capitalize">{title}</div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 mt-6 pb-6">
          {/* Left Pane: Creator Videos List */}
          <div className="block lg:col-span-3">
            <div className="border rounded-lg h-full p-4">
              <h3 className="font-semibold text-lg mb-4">Creator Videos</h3>
              <ul className="space-y-3 overflow-y-auto max-h-[80vh]">
                {filteredAssets.map((video) => (
                  <StreamVideoCard
                    key={video.id}
                    title={video.name}
                    playbackId={playbackId}
                    assetData={video}
                    createdAt={new Date(video.createdAt)}
                    imageUrl={image1}
                    creatorId={id}
                  />
                ))}
              </ul>
            </div>
          </div>
          {/* Player Section */}
          <div className="col-span-12 lg:col-span-6 flex flex-col">
            <Player.Root autoPlay clipLength={30} src={src}>
              <Player.Container className="relative h-full w-full overflow-hidden rounded-md bg-gray-950 outline outline-1 outline-white/50 data-[playing=true]:outline-white/80 data-[playing=true]:outline-2 data-[fullscreen=true]:outline-none data-[fullscreen=true]:rounded-none transition-all">
                <Player.Video title="Live stream" className="max-sm:h-full md:h-[590px] w-full object-cover" />
                {/* Loading Indicator */}
                <Player.LoadingIndicator className="absolute inset-0 bg-black/50 backdrop-blur data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0">
                  <div className="flex h-full w-full items-center justify-center">
                    <LoadingIcon className="h-8 w-8 animate-spin text-white" />
                  </div>
                </Player.LoadingIndicator>
                {/* Generic Error Indicator */}
                <Player.ErrorIndicator
                  matcher="all"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-center backdrop-blur-lg data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
                >
                  <div className="flex items-center justify-center">
                    <LoadingIcon className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <p className="text-white">Starting...</p>
                </Player.ErrorIndicator>
                {/* Offline Indicator */}
                <Player.ErrorIndicator
                  matcher="offline"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-center backdrop-blur-lg data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
                >
                  <OfflineErrorIcon className="hidden h-[120px] w-full sm:flex" />
                  <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold text-white">Stream is offline</div>
                    <div className="text-sm text-gray-100">
                      Playback will start automatically once the stream has started
                    </div>
                  </div>
                </Player.ErrorIndicator>
                {/* Access Control / Private Stream Indicator */}
                <Player.ErrorIndicator
                  matcher="access-control"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-center backdrop-blur-lg data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
                >
                  <PrivateErrorIcon className="hidden h-[120px] w-full sm:flex" />
                  <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold text-white">Stream is private</div>
                    <div className="text-sm text-gray-100">
                      It looks like you don&apos;t have permission to view this content
                    </div>
                  </div>
                </Player.ErrorIndicator>
                {/* Player Controls */}
                <Player.Controls
                  autoHide={1000}
                  className="bg-gradient-to-b gap-1 px-3 md:px-3 py-2 flex-col-reverse flex from-black/20 via-80% via-black/30 duration-1000 to-black/60 data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:fade-out-0 data-[visible=true]:fade-in-0"
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex flex-1 items-center gap-3">
                      <Player.PlayPauseTrigger className="w-6 h-6 hover:scale-110 transition-all flex-shrink-0">
                        <Player.PlayingIndicator asChild matcher={false}>
                          <PlayIcon className="w-full h-full" />
                        </Player.PlayingIndicator>
                        <Player.PlayingIndicator asChild>
                          <PauseIcon className="w-full h-full text-white" />
                        </Player.PlayingIndicator>
                      </Player.PlayPauseTrigger>
                      <Player.LiveIndicator className="gap-2 flex items-center">
                        <div className="bg-red-600 h-1.5 w-1.5 rounded-full" />
                        <span className="text-sm text-white select-none">LIVE</span>
                      </Player.LiveIndicator>
                      <Player.LiveIndicator matcher={false} className="flex gap-2 items-center">
                        <Player.Time className="text-sm tabular-nums select-none text-white" />
                      </Player.LiveIndicator>
                      <Player.MuteTrigger className="w-6 h-6 hover:scale-110 transition-all flex-shrink-0">
                        <Player.VolumeIndicator asChild matcher={false}>
                          <MuteIcon className="w-full text-white h-full" />
                        </Player.VolumeIndicator>
                        <Player.VolumeIndicator asChild matcher={true}>
                          <UnmuteIcon className="w-full text-white h-full" />
                        </Player.VolumeIndicator>
                      </Player.MuteTrigger>
                      <Player.Volume className="relative mr-1 flex-1 group flex cursor-pointer items-center select-none touch-none max-w-[120px] h-5">
                        <Player.Track className="bg-white/30 relative grow rounded-full transition-all h-[2px] md:h-[3px] group-hover:h-[3px] group-hover:md:h-[4px]">
                          <Player.Range className="absolute bg-white rounded-full h-full" />
                        </Player.Track>
                        <Player.Thumb className="block transition-all group-hover:scale-110 w-3 h-3 bg-white rounded-full" />
                      </Player.Volume>
                    </div>
                    <div className="flex sm:flex-1 md:flex-[1.5] justify-end items-center gap-2.5">
                      <Player.FullscreenIndicator matcher={false} asChild>
                        <Settings className="w-6 h-6 transition-all text-white flex-shrink-0" />
                      </Player.FullscreenIndicator>
                      <Clip className="flex items-center text-white w-6 h-6 justify-center" />
                      <Player.PictureInPictureTrigger className="w-6 h-6 hover:scale-110 transition-all flex-shrink-0">
                        <PictureInPictureIcon className="w-full h-full text-white" />
                      </Player.PictureInPictureTrigger>
                      <Player.FullscreenTrigger className="w-6 h-6 hover:scale-110 transition-all flex-shrink-0">
                        <Player.FullscreenIndicator asChild>
                          <ExitFullscreenIcon className="w-full h-full text-white" />
                        </Player.FullscreenIndicator>
                        <Player.FullscreenIndicator matcher={false} asChild>
                          <EnterFullscreenIcon className="w-full h-full text-white" />
                        </Player.FullscreenIndicator>
                      </Player.FullscreenTrigger>
                    </div>
                  </div>
                  <Player.Seek className="relative group flex cursor-pointer items-center select-none touch-none w-full h-5">
                    <Player.Track className="bg-white/30 relative grow rounded-full transition-all h-[2px] md:h-[3px] group-hover:h-[3px] group-hover:md:h-[4px]">
                      <Player.SeekBuffer className="absolute bg-black/30 transition-all duration-1000 rounded-full h-full" />
                      <Player.Range className="absolute bg-white rounded-full h-full" />
                    </Player.Track>
                    <Player.Thumb className="block group-hover:scale-110 w-3 h-3 bg-white transition-all rounded-full" />
                  </Player.Seek>
                </Player.Controls>
              </Player.Container>
            </Player.Root>

            {/* Title and Viewer Count */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-semibold text-black">{title}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M1.13465 18.3333C0.874752 18.3333 0.662336 18.1219 0.680419 17.8626C0.921899 14.4003 3.80706 11.6666 7.33073 11.6666C10.9732 11.6666 13.9334 14.5877 13.9964 18.2152C13.9975 18.2801 13.9447 18.3333 13.8797 18.3333H1.13465ZM7.33073 10.8333C4.56823 10.8333 2.33073 8.59575 2.33073 5.83325C2.33073 3.07075 4.56823 0.833252 7.33073 0.833252C10.0932 0.833252 12.3307 3.07075 12.3307 5.83325C12.3307 8.59575 10.0932 10.8333 7.33073 10.8333ZM13.7277 12.9922C13.6526 12.9024 13.7358 12.7685 13.8472 12.8046C16.0719 13.5275 17.7493 15.4644 18.0974 17.8336C18.1369 18.1027 17.9199 18.3333 17.6478 18.3333H15.7817C15.7167 18.3333 15.6641 18.2804 15.6632 18.2155C15.6357 16.229 14.9131 14.4105 13.7277 12.9922ZM12.0353 10.8229C11.9351 10.8159 11.8957 10.6928 11.968 10.6229C13.2194 9.41095 13.9974 7.71297 13.9974 5.83325C13.9974 4.74321 13.7358 3.71428 13.2719 2.80581C13.2263 2.71635 13.3033 2.61265 13.4004 2.63835C15.1837 3.11026 16.4974 4.73431 16.4974 6.66659C16.4974 8.96867 14.6328 10.8333 12.3307 10.8333C12.2314 10.8333 12.1329 10.8298 12.0353 10.8229Z"
                    fill="black"
                  />
                </svg>
                <span className="text-black">
                  {totalViewers?.viewCount} {totalViewers?.viewCount === 0 ? 'viewer' : 'viewers'}
                </span>
              </div>
            </div>

            {/* Stream Description */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex  sm:flex-row items-center justify-center sm:items-start sm:space-x-4 mt-4 sm:mt-0">
                <h1 className="  mb-2 sm:mb-0">Donate</h1>{' '}
                <div className="flex space-x-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-transform transform hover:scale-110 animate-bounce"
                    style={{ animationDelay: '0s' }}
                    onClick={() => handleDonateClick(5)}
                  >
                    $5
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-transform transform hover:scale-110 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                    onClick={() => handleDonateClick(10)}
                  >
                    $10
                  </button>
                  <button
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-transform transform hover:scale-110 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                    onClick={() => handleDonateClick(20)}
                  >
                    $20
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#53525F] capitalize">
                  {`Join ${title}  `}
                  <span
                    onClick={handleCopyLink}
                    className="cursor-pointer text-main-blue hover:text-blue-800 underline"
                  >
                    Link
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-[#53525F]">
                {title} is a thriving web3 community at the intersection of decentralization and innovation. We believe
                in the power of global collaboration to shape the future of blockchain. Whether you&apos;re a founder,
                investor, or builder, WAGMI DAO provides the platform to connect, learn, and grow within a vibrant
                decentralized ecosystem.
              </p>
            </div>

            {/* New: Product Grid Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              {productsLoading ? (
                <div className="text-center">
                  {' '}
                  <ColorRing
                    visible={true}
                    height="100"
                    width="50"
                    ariaLabel="color-ring-loading"
                    wrapperStyle={{}}
                    wrapperClass="color-ring-wrapper"
                    colors={['#000000', '#000000', '#000000', '#000000', '#000000']}
                  />
                </div>
              ) : productsError ? (
                <div className="text-center text-red-500">{productsError}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-x-scroll">
                  {products.map((product: Product) => (
                    <div key={product.name} className="border rounded-lg p-4 flex flex-col ites-center">
                      <Image
                        width={200}
                        height={200}
                        src={
                          typeof product.imageUrl === 'string' ? product.imageUrl : product.imageUrl?.src || image1.src
                        }
                        alt={product.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <h4 className="mt-2 text-sm capitalize font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <button
                        className="mt-2 text-sm bg-main-blue text-white capitalize px-4 py-1 rounded-md hover:bg-blue-800 transition-transform transform hover:scale-110"
                        onClick={() => alert(`You clicked on ${product.name}`)}
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="col-span-12 lg:col-span-3">
            <div className="border rounded-lg h-ull flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Chat</h3>
              </div>
              {/* Chat messages area */}
              <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[500px] flex items-center justify-center text-gray-500">
                <p>Welcome to the chat!</p>
              </div>
              {/* Message input */}
              <div className="border-t p-3">
                <form className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Send message..."
                      className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" className="text-gray-500 hover:text-gray-700">
                      <Smile size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {}}
                      type="button"
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    >
                      <Gift size={18} />
                      <span>Gift</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <DonationDialog
        donationAmount={donationAmount}
        streamTitle={title}
        creatorAddress={id}
        open={donationDialogOpen}
        onOpenChange={setDonationDialogOpen}
      /> */}
    </div>
  );
}

/**
 * Minimal loading UI that appears before or during buffering.
 */
export const PlayerLoading = ({ children }: { children?: React.ReactNode }) => (
  <div className="relative mx-auto flex max-w-2xl flex-col-reverse gap-3 overflow-hidden rounded-sm bg-white/70 px-3 py-2 animate-pulse">
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-white/5" />
        <div className="h-6 w-16 animate-pulse rounded-lg bg-white/5 md:h-7 md:w-20" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-white/5" />
        <div className="h-6 w-6 animate-pulse rounded-lg bg-white/5" />
      </div>
    </div>
    <div className="h-2 w-full animate-pulse rounded-lg bg-white/5" />
    {children}
  </div>
);
