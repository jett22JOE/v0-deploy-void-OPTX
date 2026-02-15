'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AGTLineChartsProps {
  cogHistory: Array<{ time: number; value: number }>;
  emoHistory: Array<{ time: number; value: number }>;
  envHistory: Array<{ time: number; value: number }>;
}

const cogChartConfig = {
  value: {
    label: 'COG Weight/s',
    color: 'oklch(0.82 0.18 95)',
  },
} satisfies ChartConfig;

const emoChartConfig = {
  value: {
    label: 'EMO Weight/s',
    color: 'oklch(0.65 0.25 25)',
  },
} satisfies ChartConfig;

const envChartConfig = {
  value: {
    label: 'ENV Weight/s',
    color: 'oklch(0.60 0.20 250)',
  },
} satisfies ChartConfig;

export function AGTLineCharts({ cogHistory, emoHistory, envHistory }: AGTLineChartsProps) {
  const formatTime = (time: number) => {
    return `${time}s`;
  };

  const totalCOG = cogHistory.reduce((acc, curr) => acc + curr.value, 0);
  const totalEMO = emoHistory.reduce((acc, curr) => acc + curr.value, 0);
  const totalENV = envHistory.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {/* COG Line Chart */}
      <Card className="border-orange-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur shadow-lg shadow-yellow-500/5">
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-orange-300 font-semibold flex items-center gap-1">
              🧠 Cognitive
            </CardTitle>
            <div className="text-right">
              <p className="text-[10px] text-orange-400/70">Total</p>
              <p className="text-sm font-bold text-yellow-400">{totalCOG}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ChartContainer
            config={cogChartConfig}
            className="aspect-square w-full max-h-[120px]"
          >
            <LineChart
              data={cogHistory}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatTime}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-black/90 border-yellow-500/30"
                    labelFormatter={formatTime}
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="oklch(0.82 0.18 95)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.82 0.18 95)' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* EMO Line Chart */}
      <Card className="border-orange-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5 backdrop-blur shadow-lg shadow-red-500/5">
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-orange-300 font-semibold flex items-center gap-1">
              ❤️ Emotional
            </CardTitle>
            <div className="text-right">
              <p className="text-[10px] text-orange-400/70">Total</p>
              <p className="text-sm font-bold text-red-400">{totalEMO}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ChartContainer
            config={emoChartConfig}
            className="aspect-square w-full max-h-[120px]"
          >
            <LineChart
              data={emoHistory}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatTime}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-black/90 border-red-500/30"
                    labelFormatter={formatTime}
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="oklch(0.65 0.25 25)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.65 0.25 25)' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ENV Line Chart */}
      <Card className="border-orange-500/30 bg-gradient-to-br from-blue-500/10 to-orange-500/5 backdrop-blur shadow-lg shadow-blue-500/5">
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-orange-300 font-semibold flex items-center gap-1">
              🌍 Environmental
            </CardTitle>
            <div className="text-right">
              <p className="text-[10px] text-orange-400/70">Total</p>
              <p className="text-sm font-bold text-blue-400">{totalENV}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ChartContainer
            config={envChartConfig}
            className="aspect-square w-full max-h-[120px]"
          >
            <LineChart
              data={envHistory}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatTime}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="rgba(255, 255, 255, 0.3)"
                fontSize={10}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-black/90 border-blue-500/30"
                    labelFormatter={formatTime}
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="oklch(0.60 0.20 250)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.60 0.20 250)' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
