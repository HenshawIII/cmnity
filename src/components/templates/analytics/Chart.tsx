'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLivepeerAnalytics } from '@/app/hook/useLivepeerAnalytics';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function ChartComponent() {
  const { metrics, loading } = useLivepeerAnalytics({ timeRange: '30d' });

  // Generate empty data for the last 30 days if no data is available
  const emptyData = Array.from({ length: 30 }, (_, i) => ({
    name: format(subDays(new Date(), 29 - i), 'MMM d'),
    time: 0,
    views: 0,
  }));

  const chartData =
    metrics?.timeSeriesData?.map((item) => ({
      name: format(new Date(item.timestamp), 'MMM d'),
      time: item.watchTime / 60, // Convert to minutes
      views: item.views,
    })) || emptyData;

  if (loading) {
    return (
      <Card className="w-full h-[500px] overflow-hidden rounded-md border border-[#DFE0E1]">
        <CardHeader>
          <CardTitle>Watch time distribution</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[420px] w-full">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[500px] overflow-hidden rounded-md border border-[#DFE0E1]">
      <CardHeader>
        <CardTitle>Watch time distribution</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `${value.toLocaleString()}m`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'time') return [`${value.toFixed(1)} minutes`, 'Watch Time'];
                return [value.toLocaleString(), 'Views'];
              }}
            />
            <Legend />
            <Bar dataKey="time" fill="#3351FF" radius={[8, 8, 0, 0]} name="Watch Time" />
            <Bar dataKey="views" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
