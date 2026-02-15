'use client';

import * as React from 'react';
import { Label, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AGTWeights {
  COG: number;
  EMO: number;
  ENV: number;
}

interface JETTUXProps {
  agtWeights: AGTWeights;
  frameCount: number;
  showRadar?: boolean;
  showDonut?: boolean;
  className?: string;
  activeTensor?: 'COG' | 'EMO' | 'ENV' | null;
  isActive?: boolean;
  cursorPosition?: { x: number; y: number };
  currentSector?: 'COG' | 'EMO' | 'ENV' | 'CENTER';
  isSpacePressed?: boolean;
}

export function JETTUX({
  agtWeights,
  frameCount,
  showRadar = true,
  showDonut = true,
  className = '',
  activeTensor = null,
  isActive = false,
  cursorPosition = { x: 50, y: 50 },
  currentSector = 'CENTER',
  isSpacePressed = false,
}: JETTUXProps) {
  const [hoveredTensor, setHoveredTensor] = React.useState<string | null>(null);

  // Use placeholder data if no training has started yet
  const hasData = agtWeights.COG > 0 || agtWeights.EMO > 0 || agtWeights.ENV > 0;
  const displayWeights = hasData
    ? agtWeights
    : { COG: 33, EMO: 33, ENV: 34 }; // Equal distribution placeholder

  const totalWeight = displayWeights.COG + displayWeights.EMO + displayWeights.ENV || 1;

  // Radar chart data - 6 points with 3 AGT tensors labeled
  // COG at top, ENV at bottom right, EMO at bottom left
  const radarData = [
    {
      tensor: 'COG',
      value: displayWeights.COG,
      percentage: ((displayWeights.COG / totalWeight) * 100).toFixed(0),
      showLabel: true,
    },
    {
      tensor: '',
      value: 0,
      percentage: '0',
      showLabel: false,
    },
    {
      tensor: 'ENV',
      value: displayWeights.ENV,
      percentage: ((displayWeights.ENV / totalWeight) * 100).toFixed(0),
      showLabel: true,
    },
    {
      tensor: '',
      value: 0,
      percentage: '0',
      showLabel: false,
    },
    {
      tensor: 'EMO',
      value: displayWeights.EMO,
      percentage: ((displayWeights.EMO / totalWeight) * 100).toFixed(0),
      showLabel: true,
    },
    {
      tensor: '',
      value: 0,
      percentage: '0',
      showLabel: false,
    },
  ];

  // Donut chart data
  const donutData = [
    {
      name: 'COG',
      value: displayWeights.COG || 1,
      fill: 'oklch(0.82 0.18 95)',
      emoji: '🧠'
    },
    {
      name: 'EMO',
      value: displayWeights.EMO || 1,
      fill: 'oklch(0.65 0.25 25)',
      emoji: '❤️'
    },
    {
      name: 'ENV',
      value: displayWeights.ENV || 1,
      fill: 'oklch(0.60 0.20 250)',
      emoji: '🌍'
    },
  ];

  const chartConfig = {
    COG: {
      label: 'Cognitive',
      color: 'oklch(0.82 0.18 95)',
    },
    EMO: {
      label: 'Emotional',
      color: 'oklch(0.65 0.25 25)',
    },
    ENV: {
      label: 'Environmental',
      color: 'oklch(0.60 0.20 250)',
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      {!hasData && (
        <div className="text-center mb-3 p-2 bg-orange-500/10 rounded border border-orange-500/20">
          <p className="text-xs text-orange-400 font-medium">
            ⚡ Start training to see live AGT tensor data
          </p>
        </div>
      )}
      <div className={`flex gap-2 items-center justify-center ${className}`}>
        {/* Radar Chart */}
        {showRadar && (
          <div className="flex-1 max-w-[280px] relative">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[200px]"
            >
            <RadarChart
              data={radarData}
              margin={{
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <PolarAngleAxis
                dataKey="tensor"
                tick={({ x, y, textAnchor, index, ...props }: { x: number; y: number; textAnchor: 'end' | 'inherit' | 'middle' | 'start'; index: number; [key: string]: unknown }) => {
                  const data = radarData[index];

                  // Only show labels for AGT tensors
                  if (!data?.showLabel) {
                    return <g />;
                  }

                  const emoji = data.tensor === 'COG' ? '🧠' : data.tensor === 'ENV' ? '🌍' : '❤️';

                  return (
                    <text
                      x={x}
                      y={index === 0 ? y - 10 : y}
                      textAnchor={textAnchor}
                      fontSize={14}
                      fontWeight={600}
                      {...props}
                      className="fill-white"
                    >
                      <tspan className="text-lg">{emoji}</tspan>
                      <tspan
                        x={x}
                        dy={'1.2rem'}
                        fontSize={12}
                        className="fill-orange-500 font-bold"
                      >
                        {data.percentage}%
                      </tspan>
                      <tspan
                        x={x}
                        dy={'1rem'}
                        fontSize={10}
                        className="fill-muted-foreground"
                      >
                        {data.tensor}
                      </tspan>
                    </text>
                  );
                }}
              />
              <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
              <Radar
                dataKey="value"
                stroke="oklch(0.646 0.222 41.116)"
                fill="oklch(0.646 0.222 41.116)"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ChartContainer>

          {/* AGT Cursor Overlay - synced with camera feed */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <circle
              cx={cursorPosition.x}
              cy={cursorPosition.y}
              r={isSpacePressed ? "2.5" : "2"}
              fill={
                currentSector === 'COG' ? 'oklch(0.82 0.18 95)' :
                currentSector === 'EMO' ? 'oklch(0.65 0.25 25)' :
                currentSector === 'ENV' ? 'oklch(0.60 0.20 250)' :
                'oklch(0.646 0.222 41.116)'
              }
              opacity={isSpacePressed ? "1" : "0.8"}
              style={{
                transition: 'all 0.3s ease',
                filter: isSpacePressed ? 'drop-shadow(0 0 6px currentColor)' : 'none'
              }}
            >
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      )}

      {/* Donut Chart */}
      {showDonut && (
        <div className="flex-1 max-w-[280px]">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[200px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
                stroke="rgba(0, 0, 0, 0.5)"
                startAngle={30}
                endAngle={390}
                onMouseEnter={(_, index) => setHoveredTensor(donutData[index].name)}
                onMouseLeave={() => setHoveredTensor(null)}
              >
                {donutData.map((entry, index) => {
                  const isHovered = hoveredTensor === entry.name;
                  const isActiveSegment = isActive && activeTensor === entry.name;
                  const opacity = isActiveSegment ? 1 : isHovered ? 0.8 : 0.6;

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      opacity={opacity}
                      className={isHovered || isActiveSegment ? 'cursor-pointer' : ''}
                      style={{
                        filter: isActiveSegment ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  );
                })}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-white text-3xl font-bold"
                          >
                            {totalWeight.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-orange-500 text-sm font-semibold"
                          >
                            Tensors
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      )}
      </div>
    </div>
  );
}
