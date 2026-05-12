"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "@/lib/format";

export function FinanceChart({
  data
}: {
  data: Array<{ label: string; receita: number; despesa: number; lucro: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f8f9b" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#0f8f9b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e45b6a" stopOpacity={0.26} />
              <stop offset="95%" stopColor="#e45b6a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `R$ ${Number(value) / 1000}k`}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 40px -24px rgba(15, 23, 42, 0.45)"
            }}
          />
          <Area type="monotone" dataKey="receita" stroke="#0f8f9b" fillOpacity={1} fill="url(#receita)" />
          <Area type="monotone" dataKey="lucro" stroke="#e45b6a" fillOpacity={1} fill="url(#lucro)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
