import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RecentKeyword } from "@/services/firestore-user";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface ChartData {
  date: string;
  political: number;
  existential: number;
  snarky: number;
}

interface SearchHeatmapProps {
  recentKeywords: RecentKeyword[];
}

export function SearchHeatmap({ recentKeywords }: SearchHeatmapProps) {
  if (!recentKeywords || recentKeywords.length === 0) {
    return <div>No recent keywords to display.</div>;
  }

  const dayGrouped: {
    [key: string]: { political: number; existential: number; snarky: number };
  } = {};

  for (const item of recentKeywords) {
    const day = format(new Date(item.searchedAt), "yyyy-MM-dd", {
      locale: enUS,
    });
    if (!dayGrouped[day]) {
      dayGrouped[day] = { political: 0, existential: 0, snarky: 0 };
    }
    if (item.tag) {
      dayGrouped[day][item.tag] += 1;
    }
  }

  const chartData: ChartData[] = Object.entries(dayGrouped)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, counts]) => ({
      date,
      ...counts,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="political" fill="#82ca9d" stackId="tags" />
        <Bar dataKey="existential" fill="#8884d8" stackId="tags" />
        <Bar dataKey="snarky" fill="#ff7373" stackId="tags" />
      </BarChart>
    </ResponsiveContainer>
  );
}