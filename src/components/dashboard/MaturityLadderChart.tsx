"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatIndianCurrency } from "@/lib/formatters";

interface MaturityLadderItem {
  month: string;
  activeSum: number;
  expiringCount: number;
}

interface MaturityLadderChartProps {
  data: MaturityLadderItem[];
}

export function MaturityLadderChart({ data }: MaturityLadderChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 bg-paper-50 border border-ink-border rounded flex items-center justify-center text-xs text-ink-muted">
        Loading regulatory maturity ladder...
      </div>
    );
  }

  // Format data for chart display (Sum in Lakhs)
  const chartData = data.map((d) => ({
    month: d.month,
    amountLakhs: Math.round(d.activeSum / 100000),
    activeSum: d.activeSum,
    count: d.expiringCount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-paper-50 border border-ink-border p-2.5 rounded shadow-ledger font-mono text-xs space-y-1">
          <div className="font-semibold text-ink-primary">{label}</div>
          <div className="text-saffron">
            Maturing Sum: {formatIndianCurrency(p.activeSum)}
          </div>
          <div className="text-ink-muted text-[10px]">
            Instruments: {p.count} deposit(s)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-5 liquid-glass-card rounded-[22px] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            12-Month Regulatory Maturity Ladder
          </h3>
          <p className="text-[11px] text-ink-muted">
            Projected security deposit maturity schedule across all regional offices
          </p>
        </div>
        <div className="font-mono text-xs text-ink-muted shrink-0">Unit: ₹ Lakhs</div>
      </div>

      <div className="h-52 sm:h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ink-border)" opacity={0.6} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "var(--ink-border)" }}
              tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "var(--font-mono)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "var(--ink-border)" }}
              tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "var(--font-mono)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amountLakhs"
              fill="var(--saffron-primary)"
              radius={[2, 2, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

