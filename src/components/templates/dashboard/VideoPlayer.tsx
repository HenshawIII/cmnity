'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { IoMdClose } from 'react-icons/io';
import VideoWithControl from '@/components/VideoWithControl';
import { PlayerLoading } from '../player/player/Player';
import { usePlaybackInfo } from '@/app/hook/usePlaybckInfo';
import { ColorRing } from 'react-loader-spinner';

interface VideoPlayerDialogProps {
  playbackId: string;
  data: any;
}

export const VideoPlayer: React.FC<VideoPlayerDialogProps> = ({ playbackId, data }) => {
  console.log('pybackId', data);
  const { src, loading, error } = usePlaybackInfo(playbackId);
  // console.log(src, loading, error);
  if (loading) {
    return (
      <PlayerLoading>
        <div className="absolute flex flex-col bg-black-secondary-text inset-0 justify-center items-center">
          <span className="text-sm text-white">Loading video...</span>
        </div>
      </PlayerLoading>
    );
  }

  if (error || !src) {
    return (
      <PlayerLoading>
        <div className="absolute flex flex-col bg-black-secondary-text inset-0 justify-center items-center">
          <span className="text-sm text-white">{error || 'Video is not available.'}</span>
          <span className="text-sm text-white">
            <ColorRing
              visible={true}
              height="100"
              width="50"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['#3351FF', '#3351FF', '#3351FF', '#3351FF', '#3351FF']}
            />
          </span>
        </div>
      </PlayerLoading>
    );
  }

  return (
    <div>
      <VideoWithControl src={src} />
    </div>
  );
};
