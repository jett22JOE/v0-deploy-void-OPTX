'use client';

import * as React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AGTRadarLegendProps {
  agtWeights: { COG: number; EMO: number; ENV: number };
  className?: string;
}

const TENSOR_COLORS = {
  COG: 'oklch(0.82 0.18 95)',
  EMO: 'oklch(0.65 0.25 25)',
  ENV: 'oklch(0.60 0.20 250)',
};

const chartConfig = {
  value: {
    label: 'Augment Level',
    color: 'oklch(0.646 0.222 41.116)',
  },
} satisfies ChartConfig;

export function AGTRadarLegend({ agtWeights, className = '' }: AGTRadarLegendProps) {
  const total = agtWeights.COG + agtWeights.EMO + agtWeights.ENV || 1;
  const cogPct = Math.round((agtWeights.COG / total) * 100);
  const emoPct = Math.round((agtWeights.EMO / total) * 100);
  const envPct = Math.round((agtWeights.ENV / total) * 100);

  const radarData = [
    { subject: 'COG', value: cogPct, fullMark: 100, color: TENSOR_COLORS.COG },
    { subject: 'EMO', value: emoPct, fullMark: 100, color: TENSOR_COLORS.EMO },
    { subject: 'ENV', value: envPct, fullMark: 100, color: TENSOR_COLORS.ENV },
  ];

  return (
    <div className={className}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, textAnchor, index, ...props }: { x: number; y: number; textAnchor: string; index: number; [key: string]: unknown }) => {
              const data = radarData[index];
              const emoji = data.subject === 'COG' ? '\u{1F9E0}' : data.subject === 'EMO' ? '\u{2764}\u{FE0F}' : '\u{1F30D}';
              return (
                <text
                  x={x}
                  y={index === 0 ? y - 12 : y}
                  textAnchor={textAnchor}
                  fontSize={14}
                  fontWeight={600}
                  {...props}
                >
                  <tspan className="text-lg">{emoji}</tspan>
                  <tspan
                    x={x}
                    dy="1.2rem"
                    fontSize={13}
                    fontWeight={700}
                    fill={data.color}
                  >
                    {data.value}%
                  </tspan>
                  <tspan
                    x={x}
                    dy="1rem"
                    fontSize={10}
                    className="fill-muted-foreground"
                  >
                    {data.subject}
                  </tspan>
                </text>
              );
            }}
          />
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
          <Radar
            dataKey="value"
            stroke="oklch(0.646 0.222 41.116)"
            fill="oklch(0.646 0.222 41.116)"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {radarData.map((d) => (
          <div key={d.subject} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs font-mono text-orange-300">
              {d.subject === 'COG' ? 'Cognitive' : d.subject === 'EMO' ? 'Emotional' : 'Environmental'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
