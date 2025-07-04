import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

// Generate data with specified patterns to show assessment gaps
const generateChartData = () => {
  const data = []
  const endDate = new Date() // Current date (June 19, 2025)
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - 3) // 3 months backwards
  
  // Generate all dates
  const allDates = []
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d))
  }
  
  // Generate onsite data - 5 random instances over 3 months
  const onsiteIndices = new Set()
  while (onsiteIndices.size < 5) {
    onsiteIndices.add(Math.floor(Math.random() * allDates.length))
  }
  
  // Generate desktop data - once per week (every 7 days)
  const desktopIndices = new Set()
  for (let i = 0; i < allDates.length; i += 7) {
    desktopIndices.add(i)
  }
  
  // Create data points showing relative differences/gaps
  allDates.forEach((date, index) => {
    const hasDesktop = desktopIndices.has(index)
    const hasOnsite = onsiteIndices.has(index)
    
    // Base assessment scores
    const desktopBaseScore = hasDesktop ? Math.floor(Math.random() * 100) + 300 : 0 // 300-400
    const onsiteBaseScore = hasOnsite ? Math.floor(Math.random() * 100) + 350 : 0 // 350-450
    
    // Calculate relative differences (gaps)
    let desktopGap = 0
    let onsiteGap = 0
    
    if (hasDesktop && hasOnsite) {
      // When both exist, show the gap between them
      const gap = Math.abs(onsiteBaseScore - desktopBaseScore)
      desktopGap = gap * 0.6 // Desktop shows smaller portion of gap
      onsiteGap = gap * 0.4  // Onsite shows remaining gap
    } else if (hasDesktop) {
      // Only desktop assessment - show gap from ideal
      desktopGap = Math.floor(Math.random() * 80) + 20 // 20-100 gap
    } else if (hasOnsite) {
      // Only onsite assessment - show gap from ideal  
      onsiteGap = Math.floor(Math.random() * 60) + 10 // 10-70 gap
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      desktop: desktopGap,
      onsite: onsiteGap,
      realtime: 200 // 50% line (around middle of range)
    })
  })
  
  return data
}

const chartData = generateChartData()

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "#9B72FF", // Medium Purple
  },
  onsite: {
    label: "Onsite",
    color: "#001D73", // Lucky Point
  },
  realtime: {
    label: "Real Time",
    color: "#6B7280", // Grey - not connected
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date() // Current date
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Assessment Gap</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Gap for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 1 month</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 1 week</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 1 month
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 1 week
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOnsite" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-onsite)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-onsite)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="realtime"
              type="monotone"
              fill="transparent"
              stroke="var(--color-realtime)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Area
              dataKey="onsite"
              type="natural"
              fill="url(#fillOnsite)"
              stroke="var(--color-onsite)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}