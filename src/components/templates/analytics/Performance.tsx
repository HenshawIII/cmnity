'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { useLivepeerAnalytics } from '@/app/hook/useLivepeerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const Performance = () => {
  const { metrics, loading } = useLivepeerAnalytics({ timeRange: 'all' });

  const performanceData = [
    {
      title: 'Total Views',
      value: metrics?.totalViews?.toLocaleString() || '0',
      metric: 'views',
      trend: <ArrowUpRight className="text-green-500" />,
    },
    {
      title: 'Average Watch Time',
      value: metrics?.averageWatchTime ? `${Math.floor(metrics.averageWatchTime / 60)}m ${Math.floor(metrics.averageWatchTime % 60)}s` : '0m 0s',
      metric: 'watchTime',
      trend: <ArrowUpRight className="text-green-500" />,
    },
    {
      title: 'Peak Concurrent Viewers',
      value: metrics?.peakConcurrentViewers?.toLocaleString() || '0',
      metric: 'concurrent',
      trend: <ArrowUpRight className="text-green-500" />,
    },
    {
      title: 'Viewer Engagement',
      value: metrics?.viewerEngagement ? `${(metrics.viewerEngagement * 100).toFixed(1)}%` : '0%',
      metric: 'engagement',
      trend: <ArrowUpRight className="text-green-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-md border shadow-md p-6 border-[#DFE0E1]">
        <h1 className="font-semibold leading-none tracking-tight text-lg text-black pb-6">Performance Metrics</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md border shadow-md p-6 border-[#DFE0E1]">
      <h1 className="font-semibold leading-none tracking-tight text-lg text-black pb-6">Performance Metrics</h1>
      <div className="w-full flex items-center justify-center">
        <table className="w-full">
          <thead>
            <tr className="font-bold border-b border-[#DFE0E1]">
              <th className="py-2 text-left">Metric</th>
              <th className="py-2 text-left">Value</th>
              <th className="py-2 text-left">Trend</th>
            </tr>
          </thead>
          <tbody className="pt-4">
            {performanceData.map((item, index) => (
              <tr key={index} className="border-b border-[#DFE0E1]">
                <td className="py-5">{item.title}</td>
                <td className="py-5">{item.value}</td>
                <td className="py-5">{item.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;
