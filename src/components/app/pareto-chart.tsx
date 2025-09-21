'use client';

import type { ParetoChartDataPoint } from '@/ai/flows/pareto-types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';

type ParetoChartProps = {
  data: ParetoChartDataPoint[];
};

export function ParetoChart({ data }: ParetoChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercentage = 0;
  
  const chartData = data.map(item => {
    cumulativePercentage += (item.value / total) * 100;
    return {
      ...item,
      cumulative: cumulativePercentage,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={60} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" />
        <Tooltip />
        <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
        <Bar dataKey="value" yAxisId="left" fill="hsl(var(--primary))" name="Valor" />
        <Line type="monotone" dataKey="cumulative" yAxisId="right" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="% Acumulada" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
