'use client';

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLivepeerAnalytics } from '@/app/hook/useLivepeerAnalytics';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function TopChart() {
  const { metrics, loading } = useLivepeerAnalytics({ timeRange: '7d' });

  // Generate empty data for the last 7 days if no data is available
  const emptyData = Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), 'EEE'),
    views: 0,
    watchTime: 0,
  }));

  const chartData =
    metrics?.timeSeriesData?.map((item) => ({
      day: format(new Date(item.timestamp), 'EEE'),
      views: item.views,
      watchTime: item.watchTime / 60, // Convert to miutes
    })) || emptyData;

  if (loading) {
    return (
      <Card className="w-full h-[520px] overflow-hidden border border-[#DFE0E1]">
        <CardHeader>
          <CardTitle>Viewer Trends</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] w-full">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[520px] overflow-hidden border border-[#DFE0E1]">
      <CardHeader>
        <CardTitle>Viewer Trends</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'watchTime') return [`${value.toFixed(1)} minutes`, 'Watch Time'];
                return [value.toLocaleString(), 'Views'];
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="views" stroke="#3351FF" fill="#3351FF66" name="Views" />
            <Area type="monotone" dataKey="watchTime" stroke="#4CAF50" fill="#4CAF5066" name="Watch Time" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
