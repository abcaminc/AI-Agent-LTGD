
import React from 'react';
import {
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../types';

interface ChartCardProps {
  chartData: ChartData;
}

const chartColors = ['#22d3ee', '#a5f3fc', '#06b6d4', '#0891b2', '#0e7490'];

const ChartCard: React.FC<ChartCardProps> = ({ chartData }) => {
  const { chartType, data, dataKeys, xAxisKey } = chartData;

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 5, right: 20, left: -10, bottom: 5 },
    };

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
      <ChartComponent {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis dataKey={xAxisKey} stroke="#a0aec0" tick={{ fontSize: 12 }} />
        <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#2d3748',
            borderColor: '#4a5568',
            color: '#e2e8f0',
          }}
          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }}/>
        {dataKeys.map((key, index) => (
          <DataComponent
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chartColors[index % chartColors.length]}
            fill={chartColors[index % chartColors.length]}
            dot={chartType === 'line' ? { r: 4, strokeWidth: 2 } : false}
            activeDot={chartType === 'line' ? { r: 6 } : undefined}
          />
        ))}
      </ChartComponent>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4 border border-gray-700">
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
