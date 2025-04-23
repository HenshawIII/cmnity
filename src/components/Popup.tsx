'use client';
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-56 rounded-md py-1 border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

//Usage
import { useState } from 'react';
import { AiOutlineCloudDownload, AiOutlineEdit } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiLink } from 'react-icons/hi';
import { PiCalendarCheckBold } from 'react-icons/pi';
import { RiDeleteBin6Line, RiTokenSwapFill } from 'react-icons/ri';
import { AlertDialogs } from './Alert';
import { AssetPopProps, PopupProps } from '@/interfaces/index';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { deleteStream, getAllStreams } from '@/features/streamAPI';
import { AppDispatch, RootState } from '@/store/store';
import { RotatingLines } from 'react-loader-spinner';
import { resetStreamStatus } from '@/features/streamSlice';
import { deleteAsset, getAssets } from '@/features/assetsAPI';
import { resetAssetStatus } from '@/features/assetsSlice';
import { UpdateLivestream } from './UpdateLivestream';
import { CustomizeChannelDialog } from './Dialog';
import axios from 'axios';

const listItemClassNames = {
  option: 'flex items-center text-lg px-5 py-2 hover:bg-gray-100 cursor-pointer',
  icon: 'text-black-primary-text text-xl font-bold',
};

export const Popup = ({ playbackId, streamId }: PopupProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.streams);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const host = process.env.NEXT_PUBLIC_BASE_URL;
  const playbackUrl =
    host && playbackId ? `${host.includes('localhost') ? 'http' : 'https'}://${host}/view/${playbackId}` : null;

  const handleEditDetails = () => {
    setIsDialogOpen(true);
  };

  const handleCopyStreamLink = () => {
    if (playbackUrl) {
      navigator.clipboard
        .writeText(playbackUrl)
        .then(() => {
          toast.success('Stream link copied!');
        })
        .catch(() => {
          toast.error("Stream link isn't available.");
        });
    } else {
      toast.error("Stream link isn't available.");
    }
  };

  const handleScheduleStream = () => {
    toast('Schedule stream clicked');
    // TODO: Open schedule modal or navigate accordingly.
  };

  // const handleCustomizeChannel = () => {
  //   toast('Customize channel clicked');
  //   // TODO: Open customization modal or navigate accordingly.
  // };

  const handleDeleteChannel = () => {
    // Simply open the alert dialog.
    setAlertOpen(true);
  };
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      // First, make a request to the `/deletestream` endpoint with the playbackId
      const response = await axios.delete(`https://chaintv.onrender.com/api/streams/deletestream?${playbackId}`);
      if (response.status !== 200) {
        throw new Error(response.data.error || 'Failed to delete stream from external system');
      }
      // If the above request is successful, proceed to delete the stream from the Redux store
      await dispatch(deleteStream(streamId)).unwrap();
      toast.success('Channel deleted successfully');
      dispatch(resetStreamStatus());
      dispatch(getAllStreams());
      setAlertOpen(false);
    } catch (err: any) {
      toast.error(err.message || error || 'Failed to delete channel');
    }
    setIsLoading(false);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-2">
            <BsThreeDotsVertical className="text-lg cursor-pointer text-black-primary-text focus:bg-main-blue focus:ring-2 focus:ring-offset-2" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="min-w-[200px] min-h-[200px] z-50 bg-white rounded shadow-md p-2">
          <DropdownMenu.Item onSelect={handleEditDetails} className={listItemClassNames.option}>
            <HiLink className={listItemClassNames.icon} />
            <p className="ml-2 text-sm text-black-primary-text font-medium">Edit Livestream/Channel</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={handleCopyStreamLink} className={listItemClassNames.option}>
            <AiOutlineEdit className={listItemClassNames.icon} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Copy Stream Link</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={handleScheduleStream} className={listItemClassNames.option}>
            <PiCalendarCheckBold className={listItemClassNames.icon} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Schedule stream</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={handleDeleteChannel} className={listItemClassNames.option}>
            <RiDeleteBin6Line className={`${listItemClassNames.icon} text-red-700`} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Delete channel</p>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <AlertDialogs
        open={alertOpen}
        setOpen={setAlertOpen}
        title="Delete Channel"
        description="Are you sure you want to delete this channel? This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Yes, delete channel"
        onConfirm={confirmDelete}
        loading={isLoading}
      />
      {isDialogOpen && <UpdateLivestream open={isDialogOpen} onClose={() => setIsDialogOpen(false)} id={streamId} />}
    </>
  );
};

// deletevideo
export const AssetPopup = ({ asset }: AssetPopProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.assets);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAsset = () => {
    // Simply open the alert dialog.
    setAlertOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
            // First, make a request to the `/deletestream` endpoint with the playbackId
            const response = await axios.delete(`https://chaintv.onrender.com/api/videos/deletevideo?playbackId=${asset.playbackId}`);
            if (response.status !== 200) {
              throw new Error(response.data.error || 'Failed to delete stream from external system');
            }
      await dispatch(deleteAsset(asset.id)).unwrap();
      toast.success('Asset deleted successfully');
      dispatch(resetAssetStatus());
      // Refresh assets list
      dispatch(getAssets());
      setAlertOpen(false); // close the dialog after successful delete
    } catch (err: any) {
      toast.error(error || 'Failed to delete asset');
    }
    setIsLoading(false);
  };
  const handleCopyAssetLink = () => {
    // Copy the stream link to the clipboard.
    if (asset.downloadUrl) {
      navigator.clipboard
        .writeText(asset.downloadUrl)
        .then(() => {
          toast.success('Download Link copied!');
        })
        .catch(() => {
          toast.error("Download Link isn't available.");
        });
    }
  };
  const handleDownloadAds = () => {
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Download URL not available.');
    }
  };
  const handlePlaybackId = () => {
    // Copy the stream link to the clipboard.
    if (asset.playbackId) {
      navigator.clipboard
        .writeText(asset.playbackId)
        .then(() => {
          toast.success('Playback ID copied!');
        })
        .catch(() => {
          toast.error("Playback ID isn't available.");
        });
    }
  };
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-2">
            <BsThreeDotsVertical className="text-lg cursor-pointer text-black-primary-text focus:bg-main-blue focus:ring-2 focus:ring-offset-2" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="min-w-[200px] min-h-[100px] z-50 bg-white rounded shadow-md p-2">
          <DropdownMenu.Item onSelect={handleCopyAssetLink} className={listItemClassNames.option}>
            <RiTokenSwapFill className={listItemClassNames.icon} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Copy Download URL</p>
          </DropdownMenu.Item>

          <DropdownMenu.Item onSelect={handleDownloadAds} className={listItemClassNames.option}>
            <AiOutlineCloudDownload className={listItemClassNames.icon} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Download video</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={handlePlaybackId} className={listItemClassNames.option}>
            <HiLink className={listItemClassNames.icon} />
            <p className="ml-2 text-sm text-black-primary-text font-medium">Copy PlaybackId</p>
          </DropdownMenu.Item>

          <DropdownMenu.Item onSelect={handleDeleteAsset} className={listItemClassNames.option}>
            <RiDeleteBin6Line className={`${listItemClassNames.icon} text-red-700`} />
            <p className="ml-2 text-sm font-medium text-black-primary-text">Delete video</p>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <AlertDialogs
        open={alertOpen}
        setOpen={setAlertOpen}
        title="Delete Asset"
        description="Are you sure you want to delete this Video? This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Yes, Delete Asset"
        onConfirm={confirmDelete}
        loading={isLoading}
      />
    </>
  );
};
