'use client';
import Header from '@/components/Header';
import Analytics from './Analytics';
import SectionCard from '@/components/Card/SectionCard';
import { ChannelCard, VideoCard } from '@/components/Card/Card';
import { RiVideoAddLine } from 'react-icons/ri';
import * as Dialog from '@radix-ui/react-dialog';
import { IoMdClose } from 'react-icons/io';
import { CreateLivestream } from '@/components/CreateLivestream';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrivy } from '@privy-io/react-auth';
import { useDispatch, useSelector } from 'react-redux';
import { getAllStreams } from '@/features/streamAPI';
import { getAssets } from '@/features/assetsAPI';
import type { RootState, AppDispatch } from '@/store/store';
import image1 from '../../../../public/assets/images/image1.png';
import Spinner from '@/components/Spinner';
import UploadVideoAsset from '@/components/UploadVideoAsset';
import type { Asset, Stream } from '@/interfaces';
import MobileSidebar from '@/components/MobileSidebar';

const Dashboard = () => {
  const { user, ready, authenticated } = usePrivy();
  const navigate = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const solanaWalletAddress =
    user?.wallet?.chainType === 'solana' && user?.wallet?.address
      ? user.wallet.address 
      : useSelector((state: RootState) => state.user.solanaWalletAddress);
  const { streams, loading: streamsLoading, error: streamsError } = useSelector((state: RootState) => state.streams);
  const { assets, loading: assetsLoading, error: assetsError } = useSelector((state: RootState) => state.assets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const [filteredStreams, setFilteredStreams] = useState<Stream[]>([]);

  useEffect(() => {
    
      dispatch(getAllStreams());
      dispatch(getAssets());
    
  }, [dispatch, ready, authenticated]);

  // console.log(streams);
  useEffect(() => {
    console.log(streams);
  }, [streams]);
  useEffect(() => {
    if (streamsError) {
      toast.error('Failed to fetch streams: ' + streamsError);
    }
    if (assetsError) {
      toast.error('Failed to fetch assets: ' + assetsError);
    }
  }, [streamsError, assetsError]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      navigate.push('/auth/login');
    }
  }, [ready, authenticated, navigate]);

  // useEffect(() => {
  //   // const userAddress = user?.wallet?.address?.toLowerCase().trim();
  //   console.log(solanaWalletAddress);
  //   const filtered = streams.filter(
  //     (stream) =>
  //       !!stream.playbackId &&
  //       stream.creatorId?.value?.toLowerCase().trim() === solanaWalletAddress
  //   );
  //   setFilteredStreams(filtered);
  // }, [streams, solanaWalletAddress]);

// console.log(filteredStreams);

const filteredStreams = useMemo(() => {
  return streams.filter((stream) => !!stream.playbackId && stream.creatorId?.value === solanaWalletAddress);
}, [streams, solanaWalletAddress]); 

console.log(filteredStreams);
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => !!asset.playbackId && asset.creatorId?.value === solanaWalletAddress);
  }, [assets, solanaWalletAddress]);

  // NEW: only when not loading, no error, and zero existing streams
  const canCreateStream = !streamsLoading && !streamsError && filteredStreams.length === 0;

  const initiateLiveVideo = (id: string) => id && navigate.push(`/dashboard/stream?id=${id}`);
  const toggleSidebar = () => setSidebarCollapsed((x) => !x);
  // setSidebarCollapsed(!sidebarCollapsed)
  const toggleMobileMenu = () => setMobileMenuOpen((x) => !x);

  if (!ready || !authenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Spinner />
      </div>
    );
  }

  if (!user?.wallet?.address || !streams.length) {
    // Show loading spinner or nothing
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <MobileSidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <Header toggleMenu={toggleMobileMenu} mobileOpen={mobileMenuOpen} />

        <div className="m-2 pb-8">
          <Analytics />
          <SectionCard title="Your Channel">
            {streamsLoading ? (
              Array.from({ length: 1 }, (_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[180px] w-[318px] rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 md:w-[316px] rounded-md bg-white/10" />
                    <Skeleton className="h-7 w-[44px] rounded-md bg-white/10" />
                  </div>
                </div>
              ))
            ) : canCreateStream ? (
              // Show "Create Channel" dialog if no streams are available
              <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Trigger asChild>
                  <div className="flex w-full flex-col" onClick={() => setIsDialogOpen(true)}>
                    <div className="w-full justify-center flex items-center h-[180px] rounded-lg cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
                      <RiVideoAddLine className="text-purple-400 w-24 h-24" />
                    </div>
                    <div className="text-white text-xl font-bold pt-2">Create new stream channel</div>
                  </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] h-full w-[90vw] overflow-y-auto flex py-16 mt-10 flex-col justify-center items-center max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-900/95 backdrop-blur-sm border border-white/20 px-10 max-sm:px-6 shadow-2xl">
                    <Dialog.Title className="text-white text-center text-xl font-bold">Create New Channel</Dialog.Title>

                    <div className="w-full h-full my-5">
                      <CreateLivestream close={() => setIsDialogOpen(false)} />
                    </div>

                    <Dialog.Close asChild>
                      <button
                        className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-white hover:bg-white/10 focus:shadow-[0_0_0_2px] focus:shadow-purple-500 focus:outline-none transition-colors"
                        aria-label="Close"
                      >
                        <IoMdClose className="text-white font-medium text-4xl" />
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            ) : (
              // Show the single stream if available
              filteredStreams.map((stream) => (
                <div key={stream.id}>
                  <ChannelCard
                    title={stream.name}
                    image={image1}
                    goLive={() => initiateLiveVideo(stream.id)}
                    streamId={stream.id}
                    playbackId={stream.id}  
                    playb={stream.playbackId}
                    lastSeen={new Date(stream.lastSeen || 0)}
                    status={stream.isActive}
                  />
                </div>
              ))
            )}
          </SectionCard>

          <hr className="border-white/20" />
          <SectionCard title="Your Videos">
            <Dialog.Root open={isDialogOpen2} onOpenChange={setIsDialogOpen2}>
              <Dialog.Trigger asChild>
                <div className="flex w-full flex-col" onClick={() => setIsDialogOpen2(true)}>
                  <div className="w-full justify-center flex items-center h-[180px] rounded-lg cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
                    <RiVideoAddLine className="text-purple-400 w-24 h-24" />
                  </div>
                  <div className="text-white text-xl font-bold pt-2">Upload Asset</div>
                </div>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] flex mt-4 flex-col justify-center items-center max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-900/95 backdrop-blur-sm border border-white/20 px-10 max-sm:px-6 py-6 shadow-2xl">
                  <Dialog.Title className="text-white text-center flex items-center gap-2 my-4 text-xl font-bold">
                    <RiVideoAddLine className="text-purple-400 text-sm" /> Upload Video Asset
                  </Dialog.Title>
                  <UploadVideoAsset onClose={() => setIsDialogOpen2(false)} />
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-white hover:bg-white/10 focus:shadow-[0_0_0_2px] focus:shadow-purple-500 focus:outline-none transition-colors"
                      aria-label="Close"
                    >
                      <IoMdClose className="text-white font-medium text-4xl" />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {assetsLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex flex-col space-y-3 mb-4">
                  <Skeleton className="h-[180px] w-[318px] rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[316px] rounded-md bg-white/10" />
                    <Skeleton className="h-7 w-[44px] rounded-md bg-white/10" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {filteredAssets.length === 0 ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-gray-300">No Asset Available.</p>
                  </div>
                ) : (
                  filteredAssets.map((asset) => (
                    <div key={asset.id}>
                      <VideoCard
                        title={asset.name}
                        assetData={asset}
                        imageUrl={image1}
                        playbackId={asset.playbackId}
                        createdAt={new Date(asset.createdAt)}
                        format={(asset as any).videoSpec?.format}
                      />
                    </div>
                  ))
                )}
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
