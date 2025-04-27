"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PerformanceProps {
  metrics: {
    viewCount?: number
    playtimeMins?: number
    ttffMs?: number
    rebufferRatio?: number
    errorRate?: number
    exitsBeforeStart?: number
  }
  loading: boolean
}

const Performance: React.FC<PerformanceProps> = ({ metrics, loading }) => {
  // true only on the very first load (no data yet)
  const initialLoad = loading && metrics.viewCount == null

  if (initialLoad) {
    return (
      <div className="w-full overflow-hidden rounded-md border shadow-md p-6 border-[#DFE0E1]">
        <h1 className="font-semibold text-lg text-black pb-6">Performance Metrics</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const metricItems = [
    {
      title: "Total Views",
      value: metrics.viewCount?.toLocaleString() ?? "0",
      trend: "up",
      description: "Total number of views across all content",
    },
    {
      title: "Total Watch Time",
      value: metrics.playtimeMins
        ? `${Math.floor(metrics.playtimeMins / 60)}h ${Math.floor(metrics.playtimeMins % 60)}m`
        : "0h 0m",
      trend: "up",
      description: "Cumulative time viewers spent watching",
    },
    {
      title: "Time to First Frame",
      value: metrics.ttffMs != null ? `${metrics.ttffMs.toFixed(0)} ms` : "0 ms",
      trend: "up",
      description: "Average time to display first video frame",
    },
    {
      title: "Rebuffer Ratio",
      value: metrics.rebufferRatio != null ? `${(metrics.rebufferRatio * 100).toFixed(1)}%` : "0%",
      trend: "up",
      description: "Percentage of time spent buffering",
    },
    {
      title: "Error Rate",
      value: metrics.errorRate != null ? `${(metrics.errorRate * 100).toFixed(1)}%` : "0%",
      trend: "down",
      description: "Percentage of playback attempts that failed",
    },
    {
      title: "Exits Before Start",
      value: metrics.exitsBeforeStart?.toString() ?? "0",
      trend: "down",
      description: "Viewers who left before content started playing",
    },
  ]

  return (
    <div className="w-full overflow-hidden rounded-md border shadow-md p-6 border-[#DFE0E1]">
      <h1 className="font-semibold text-lg text-black flex items-center justify-between pb-6">Performance Metrics</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="font-bold border-b border-[#DFE0E1]">
              <th className="py-2 text-left">Metric</th>
              <th className="py-2 text-left">Value</th>
              <th className="py-2 text-left">Trend</th>
              <th className="py-2 text-left hidden md:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {metricItems.map((item, idx) => (
              <tr key={idx} className="border-b border-[#DFE0E1] hover:bg-gray-50">
                <td className="py-4 font-medium">{item.title}</td>
                <td className="py-4">{item.value}</td>
                <td className="py-4">
                  {item.trend === "up" ? (
                    <ArrowUpRight className="text-green-500" />
                  ) : (
                    <ArrowDownRight className="text-red-500" />
                  )}
                </td>
                <td className="py-4 text-sm text-gray-500 hidden md:table-cell">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Performance
