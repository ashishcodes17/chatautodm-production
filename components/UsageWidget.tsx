"use client"

import * as React from "react"
import useSWR from "swr"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"

interface UsageWidgetProps {
  userId: string
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json())

export function UsageWidget({ userId }: UsageWidgetProps) {
  const { data } = useSWR(
    userId ? `/api/workspaces/${userId}/usage` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const usage = {
    dmUsed: data?.usage?.dmUsed || 0,
    automationsUsed: data?.usage?.automationsUsed || 0,
    plan: data?.usage?.plan || "free",
    history: data?.usage?.history || [], // expects [{date, dms, automations}]
  }

  // fallback mock data if no API history is present
  const chartData = usage.history.length
    ? usage.history
    : [
        { date: "2024-09-01", dms: 10, automations: 5 },
        { date: "2024-09-02", dms: 20, automations: 12 },
        { date: "2024-09-03", dms: 18, automations: 15 },
        { date: "2024-09-04", dms: 30, automations: 22 },
      ]

  const chartConfig = {
    dms: {
      label: "DM Messages",
      color: "var(--chart-1)",
    },
    automations: {
      label: "Automations",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col sm:flex-row items-stretch border-b !p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Usage Overview
          </CardTitle>
          <CardDescription>
            Track DMs & Automations over time
          </CardDescription>
        </div>
        <Badge
          variant={usage.plan === "free" ? "secondary" : "default"}
          className="m-4"
        >
          {usage.plan.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Line
              dataKey="dms"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="automations"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>

        {/* Totals below chart */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {usage.dmUsed.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">DMs Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {usage.automationsUsed}
            </div>
            <div className="text-xs text-gray-500">Automations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
