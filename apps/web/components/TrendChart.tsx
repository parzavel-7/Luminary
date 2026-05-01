"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface TrendChartProps {
  data: { date: string; score: number }[];
}

export default function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-black/5 rounded-3xl border border-dashed border-black/10">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Insufficient data for trend analysis</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full glass-3d-panel !p-8">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-muted-foreground">Accessibility Velocity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b83f5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b83f5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(0,0,0,0.3)' }}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: 'rgba(0,0,0,0.3)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.8)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3b83f5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
