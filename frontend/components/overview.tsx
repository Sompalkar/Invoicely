"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { reportsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface RevenueData {
  date: string
  total: number
}

export function Overview() {
  const [data, setData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true)
      const revenueData = await reportsAPI.getRevenueReport()
      setData(revenueData)
    } catch (error: any) {
      toast({
        title: "Error fetching revenue data",
        description: error.response?.data?.message || "Could not load revenue data. Please try again.",
        variant: "destructive",
      })
      // Set some default data if the API fails
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Format the month names for display
  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleString("default", { month: "short" })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[350px] text-muted-foreground">
        No revenue data available yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis 
          dataKey="date" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={formatMonth}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, "Revenue"]}
          labelFormatter={(label) => formatMonth(label)}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar 
          dataKey="total" 
          fill="url(#colorGradient)" 
          radius={[4, 4, 0, 0]} 
          className="fill-primary" 
        />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--purple-600)" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="var(--violet-600)" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  )
}
