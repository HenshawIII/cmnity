'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Channel {
  id: string;
  name: string;
  playbackId?: string;
  creatorId?: { value: string };
}

interface ChannelSelectorProps {
  filteredStreams: Channel[];
  streamsLoading: boolean;
}

export const ChannelSelector = ({}: ChannelSelectorProps) => {
  const [streamEnabled, setStreamEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [togglingStream, setTogglingStream] = useState<boolean>(false);
  const [togglingVideo, setTogglingVideo] = useState<boolean>(false);

  const handleStreamToggle = async () => {
    const newState = !streamEnabled;
    setTogglingStream(true);
    try {
      await axios.post('https://chaintv.onrender.com/api/streams/disable', {
        disable: !newState,
      });
      setStreamEnabled(newState);
      toast.success(
        newState ? 'Live streams enabled' : 'Live streams disabled'
      );
    } catch (err) {
      toast.error('Failed to update live stream status');
    } finally {
      setTogglingStream(false);
    }
  };

  const handleVideoToggle = async () => {
    const newState = !videoEnabled;
    setTogglingVideo(true);
    try {
      await axios.post('https://chaintv.onrender.com/api/videos/disable', {
        disable: !newState,
      });
      setVideoEnabled(newState);
      toast.success(
        newState ? 'Video assets enabled' : 'Video assets disabled'
      );
    } catch (err) {
      toast.error('Failed to update video asset status');
    } finally {
      setTogglingVideo(false);
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Live Stream Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="stream-toggle"
          className="text-lg font-medium"
        >
          Stream Switch
        </Label>
        <Switch
          id="stream-toggle"
          checked={streamEnabled}
          onCheckedChange={handleStreamToggle}
          disabled={togglingStream}
        />
      </div>

      {/* Video Asset Toggle */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="video-toggle"
          className="text-lg font-medium"
        >
          Video Switch
        </Label>
        <Switch
          id="video-toggle"
          checked={videoEnabled}
          onCheckedChange={handleVideoToggle}
          disabled={togglingVideo}
        />
      </div>

    </div>
  );
};
