import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

// Premium light-theme custom tooltip component with sleek glassmorphism
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-[18px] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const isRisk = entry.name === "Workload Risk";
            return (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.stroke || entry.color }} 
                  />
                  <span className="text-xs font-semibold text-slate-600">{entry.name}</span>
                </div>
                <span className={`text-xs font-black font-mono ${isRisk ? "text-rose-600" : "text-indigo-600"}`}>
                  {entry.value}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function InsightsChart() {
  const chartData = [
    { day: "Mon", "Workload Risk": 20, "Rescue Capacity": 80, "Streak Level": 10 },
    { day: "Tue", "Workload Risk": 45, "Rescue Capacity": 80, "Streak Level": 30 },
    { day: "Wed", "Workload Risk": 85, "Rescue Capacity": 75, "Streak Level": 65 },
    { day: "Thu", "Workload Risk": 55, "Rescue Capacity": 85, "Streak Level": 80 },
    { day: "Fri", "Workload Risk": 30, "Rescue Capacity": 90, "Streak Level": 95 },
    { day: "Sat", "Workload Risk": 15, "Rescue Capacity": 95, "Streak Level": 98 },
    { day: "Sun", "Workload Risk": 10, "Rescue Capacity": 98, "Streak Level": 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
      >
        <defs>
          {/* Workload Risk (Rose Accent) - ultra-subtle fade */}
          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.06}/>
            <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0}/>
          </linearGradient>
          {/* Rescue Capacity (Indigo Accent) - ultra-subtle fade */}
          <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(79, 70, 229)" stopOpacity={0.06}/>
            <stop offset="95%" stopColor="rgb(79, 70, 229)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <XAxis 
          dataKey="day" 
          stroke="rgb(148, 163, 184)" 
          opacity={0.6} 
          fontSize={10} 
          fontWeight={600}
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        
        <YAxis 
          stroke="rgb(148, 163, 184)" 
          opacity={0.6} 
          fontSize={10} 
          fontWeight={600}
          tickLine={false} 
          axisLine={false} 
          dx={-10}
        />
        
        <CartesianGrid 
          strokeDasharray="4 4" 
          stroke="rgba(148, 163, 184, 0.04)" 
          vertical={false} 
        />
        
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ stroke: "rgba(148, 163, 184, 0.12)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
        />
        
        <Area 
          type="monotone" 
          dataKey="Workload Risk" 
          stroke="rgb(244, 63, 94)" 
          fillOpacity={1} 
          fill="url(#colorRisk)" 
          strokeWidth={3} 
          activeDot={{ 
            r: 6, 
            strokeWidth: 2, 
            stroke: "white", 
            fill: "rgb(244, 63, 94)",
            style: { filter: "drop-shadow(0 2px 4px rgba(244, 63, 94, 0.2))" }
          }}
        />
        
        <Area 
          type="monotone" 
          dataKey="Rescue Capacity" 
          stroke="rgb(79, 70, 229)" 
          fillOpacity={1} 
          fill="url(#colorCapacity)" 
          strokeWidth={3} 
          activeDot={{ 
            r: 6, 
            strokeWidth: 2, 
            stroke: "white", 
            fill: "rgb(79, 70, 229)",
            style: { filter: "drop-shadow(0 2px 4px rgba(79, 70, 229, 0.2))" }
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
