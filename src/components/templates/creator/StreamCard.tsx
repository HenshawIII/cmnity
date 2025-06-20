import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface StreamCardProps {
  title: string;
  thumbnailUrl?: string;
  lastSeen: Date;
  isActive: boolean;
  viewerCount?: number;
}

export function StreamCard({ title, thumbnailUrl, lastSeen, isActive, viewerCount }: StreamCardProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Page URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="flex relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-gray-100 w-1/2">
        <img
          src={thumbnailUrl || '/assets/images/background.jpeg'}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {isActive && (
          <div className="absolute top-2 left-2 flex items-center space-x-2 rounded-full bg-red-500 px-3 py-1 text-sm text-white">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
            <span>LIVE</span>
            {viewerCount !== undefined && (
              <span className="text-xs">• {viewerCount} watching</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between items-center w-1/2">
        <div className="text-center">
          <h3 className="mb-1 line-clamp-1 font-extrabold text-2xl text-gray-900">
            {title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {isActive ? (
              <span>Started {formatDistanceToNow(lastSeen)} ago</span>
            ) : (
              <span>Last streamed {formatDistanceToNow(lastSeen)} ago</span>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col w-full gap-2 mt-4">
          <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Join the Stream
          </button>
         
        </div>
      </div>
    </div>
  );
} 