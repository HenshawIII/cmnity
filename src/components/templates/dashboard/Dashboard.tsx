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
  const { streams, loading: streamsLoading, error: streamsError } = useSelector((state: RootState) => state.streams);
  const { assets, loading: assetsLoading, error: assetsError } = useSelector((state: RootState) => state.assets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpen2, setIsDialogOpen2] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      dispatch(getAllStreams());
      dispatch(getAssets());
    }
  }, [dispatch, ready, authenticated]);

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

  const filteredStreams = useMemo(() => {
    return streams.filter((stream: Stream) => !!stream.playbackId && stream.creatorId?.value === user?.wallet?.address);
  }, [streams, user?.wallet?.address]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => !!asset.playbackId && asset.creatorId?.value === user?.wallet?.address);
  }, [assets, user?.wallet?.address]);

  // NEW: only when not loading, no error, and zero existing streams
  const canCreateStream = !streamsLoading && !streamsError && filteredStreams.length === 0;

  const initiateLiveVideo = (id: string) => id && navigate.push(`/dashboard/stream?id=${id}`);
  const toggleSidebar = () => setSidebarCollapsed((x) => !x);
  // setSidebarCollapsed(!sidebarCollapsed)
  const toggleMobileMenu = () => setMobileMenuOpen((x) => !x);

  if (!ready || !authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
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
                  <Skeleton className="h-[180px] w-[318px] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 md:w-[316px] rounded-md" />
                    <Skeleton className="h-7 w-[44px] rounded-md" />
                  </div>
                </div>
              ))
            ) : canCreateStream ? (
              // Show "Create Channel" dialog if no streams are available
              <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Trigger asChild>
                  <div className="flex w-full flex-col" onClick={() => setIsDialogOpen(true)}>
                    <div className="w-full justify-center flex items-center h-[180px] rounded-lg cursor-pointer bg-background-gray">
                      <RiVideoAddLine className="text-main-blue w-24 h-24" />
                    </div>
                    <div className="text-black-primary-text text-xl font-bold pt-2">Create new stream channel</div>
                  </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] h-full w-[90vw] overflow-y-auto flex py-16 mt-10 flex-col justify-center items-center max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-10 max-sm:px-6  shadow-lg">
                    <Dialog.Title className="text-black text-center text-xl font-bold">Create New Channel</Dialog.Title>

                    <div className="w-full h-full my-5">
                      <CreateLivestream close={() => setIsDialogOpen(false)} />
                    </div>

                    <Dialog.Close asChild>
                      <button
                        className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                        aria-label="Close"
                      >
                        <IoMdClose className="text-black-primary-text font-medium text-4xl" />
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
                    lastSeen={new Date(stream.lastSeen)}
                    status={stream.isActive}
                  />
                </div>
              ))
            )}
          </SectionCard>

          <hr className="border-border-gray" />
          <SectionCard title="Your Videos">
            <Dialog.Root open={isDialogOpen2} onOpenChange={setIsDialogOpen2}>
              <Dialog.Trigger asChild>
                <div className="flex w-full flex-col" onClick={() => setIsDialogOpen2(true)}>
                  <div className="w-full justify-center flex items-center h-[180px] rounded-lg cursor-pointer bg-background-gray">
                    <RiVideoAddLine className="text-main-blue w-24 h-24" />
                  </div>
                  <div className="text-black-primary-text text-xl font-bold pt-2">Upload Asset</div>
                </div>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
                <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] flex mt-4 flex-col justify-center items-center max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-10 max-sm:px-6 py-6 shadow-lg">
                  <Dialog.Title className="text-black-primary-text text-center flex items-center gap-2 my-4 text-xl font-bold">
                    <RiVideoAddLine className="text-main-blue text-sm" /> Upload Video Asset
                  </Dialog.Title>
                  <UploadVideoAsset onClose={() => setIsDialogOpen2(false)} />
                  <Dialog.Close asChild>
                    <button
                      className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                      aria-label="Close"
                    >
                      <IoMdClose className="text-black-primary-text font-medium text-4xl" />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {assetsLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex flex-col space-y-3 mb-4">
                  <Skeleton className="h-[180px] w-[318px] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[316px] rounded-md" />
                    <Skeleton className="h-7 w-[44px] rounded-md" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {filteredAssets.length === 0 ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-black-primary-text">No Asset Available.</p>
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

{
  /* <SectionCard title="Your Channels">
<Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <Dialog.Trigger asChild>
    <div className="flex w-full flex-col" onClick={() => setIsDialogOpen(true)}>
      <div className="w-full justify-center flex items-center h-[180px] rounded-lg cursor-pointer bg-background-gray">
        <RiVideoAddLine className="text-main-blue w-24 h-24" />
      </div>
      <div className="text-black-primary-text text-xl font-bold pt-2">Create new stream channel</div>
    </div>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />
    <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] flex mt-4 flex-col justify-center items-center max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-10 max-sm:px-6 py-6 shadow-lg">
      <Dialog.Title className="text-black-primary-text text-center my-4 text-base font-bold">
        Create New Channel
      </Dialog.Title>
      <CreateLivestream close={() => setIsDialogOpen(false)} />
      <Dialog.Close asChild>
        <button
          className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
          aria-label="Close"
        >
          <IoMdClose className="text-black-primary-text font-medium text-4xl" />
        </button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

{streamsLoading ? (
  Array.from({ length: 5 }, (_, index) => (
    <div key={index} className="flex flex-col space-y-3">
      <Skeleton className="h-[180px] w-[318px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 md:w-[316px] rounded-md" />
        <Skeleton className="h-7 w-[44px] rounded-md" />
      </div>
    </div>
  ))
) : (
  <>
    {filteredStreams.length === 0 ? (
      <div className="flex justify-center items-center h-60">
        <p className="text-black-primary-text">No streams available.</p>
      </div>
    ) : (
      paginatedStreams.map((stream) => (
        <div key={stream.id}>
          <ChannelCard
            title={stream.name}
            image={image1}
            goLive={() => initiateLiveVideo(stream.id)}
            streamId={stream.id}
            playbackId={stream.id}
            playb={stream.playbackId}
            lastSeen={new Date(stream.lastSeen)}
            status={stream.isActive}
          />
        </div>
      ))
    )}
  </>
)}
{/* Pagination */
}
// {totalPages > 1 && (
//   <div className="flex justify-end items-end col-span-1 lg:col-span-3 mt-6 space-x-4">
//     {/* Previous Button */}
//     <button
//       className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
//       onClick={() => handlePageChange(currentPage - 1)}
//       disabled={currentPage === 1}
//     >
//       <IoChevronBack className="w-5 h-5 text-black" />
//     </button>

//     {/* Page Numbers */}
//     <div className="flex space-x-2">
//       {Array.from({ length: totalPages }, (_, index) => (
//         <button
//           key={index}
//           className={clsx(
//             'px-4 py-2 rounded-lg text-sm font-medium transition',
//             currentPage === index + 1
//               ? 'bg-main-blue text-white shadow-md'
//               : 'bg-gray-100 text-black hover:bg-gray-200',
//           )}
//           onClick={() => handlePageChange(index + 1)}
//         >
//           {index + 1}
//         </button>
//       ))}
//     </div>

//     {/* Next Button */}
//     <button
//       className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
//       onClick={() => handlePageChange(currentPage + 1)}
//       disabled={currentPage === totalPages}
//     >
//       <IoChevronForward className="w-5 h-5 text-black" />
//     </button>
//   </div> */}
