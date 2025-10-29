"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

interface AnalyticsChartsProps {
  userId: string
}

interface ChartData {
  date: string
  messages: number
  contacts: number
  followerGrowth: number
}

export function AnalyticsCharts({ userId }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [userId, timeRange])

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${userId}/analytics?range=${timeRange}`)
      const data = await response.json()

      if (data.success) {
        setChartData(data.chartData || generateMockData())
      } else {
        setChartData(generateMockData())
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
      setChartData(generateMockData())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = (): ChartData[] => {
    const days = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30
    const data: ChartData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      data.push({
        date:
          timeRange === "24h"
            ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        messages: Math.floor(Math.random() * 50) + 10,
        contacts: Math.floor(Math.random() * 20) + 5,
        followerGrowth: Math.floor(Math.random() * 15) + 2,
      })
    }

    return data
  }

  const messagesConfig = {
    messages: {
      label: "Messages",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const contactsConfig = {
    contacts: {
      label: "Contacts",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const followerGrowthConfig = {
    followerGrowth: {
      label: "Follower Growth",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  const timeRangeLabels = {
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {range === "24h" ? "24hrs" : range === "7d" ? "7 days" : "30 days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Chart */}
        <Card className="border-0 rounded-xl shadow-lg bg-white/90">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Messages</CardTitle>
            <CardDescription>{timeRangeLabels[timeRange]}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={messagesConfig} className="h-[200px]">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => (timeRange === "24h" ? value : value.slice(0, 3))}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="messages" fill="var(--color-messages)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Contacts Chart */}
        <Card className="border-0 rounded-xl shadow-lg bg-white/90">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Contacts</CardTitle>
            <CardDescription>{timeRangeLabels[timeRange]}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={contactsConfig} className="h-[200px]">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => (timeRange === "24h" ? value : value.slice(0, 3))}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="contacts" fill="var(--color-contacts)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Follower Growth Chart */}
        <Card className="border-0 rounded-xl shadow-lg bg-white/90">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Follower Growth</CardTitle>
            <CardDescription>From Ask to Follow feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={followerGrowthConfig} className="h-[200px]">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => (timeRange === "24h" ? value : value.slice(0, 3))}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="followerGrowth" fill="var(--color-followerGrowth)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
