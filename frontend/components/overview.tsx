"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Demo data for the chart
const demoData = [
  {
    name: "Jan",
    total: 1800,
  },
  {
    name: "Feb",
    total: 2200,
  },
  {
    name: "Mar",
    total: 2800,
  },
  {
    name: "Apr",
    total: 3500,
  },
  {
    name: "May",
    total: 2900,
  },
  {
    name: "Jun",
    total: 3700,
  },
  {
    name: "Jul",
    total: 4500,
  },
  {
    name: "Aug",
    total: 5200,
  },
  {
    name: "Sep",
    total: 4800,
  },
  {
    name: "Oct",
    total: 6000,
  },
  {
    name: "Nov",
    total: 5500,
  },
  {
    name: "Dec",
    total: 7000,
  },
]

export function Overview() {
  const [data, setData] = useState(demoData)

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value) => [`$${value}`, "Revenue"]}
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="total" fill="var(--purple-600)" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
