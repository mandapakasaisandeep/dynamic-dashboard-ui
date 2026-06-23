import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartData } from "../../api/types";
import type { ChartKind } from "../../widgetConfig";

const COLORS = ["#1677ff", "#52c41a", "#faad14", "#eb2f96", "#13c2c2"];

export default function ChartWidget({
  data,
  kind = "line",
}: {
  data: ChartData;
  kind?: ChartKind;
}) {
  // Merge per-series points into rows keyed by x: { x, [seriesName]: y }
  const rowsByX = new Map<string, Record<string, string | number>>();
  for (const s of data.series ?? []) {
    for (const p of s.points ?? []) {
      const row = rowsByX.get(p.x) ?? { x: p.x };
      row[s.name] = p.y;
      rowsByX.set(p.x, row);
    }
  }
  const rows = [...rowsByX.values()];
  const series = data.series ?? [];

  const common = {
    data: rows,
    margin: { top: 8, right: 16, bottom: 0, left: -8 },
  };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="x" tickFormatter={(v) => String(v).slice(11, 16)} fontSize={11} />
      <YAxis fontSize={11} />
      <Tooltip />
      <Legend />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === "bar" ? (
        <BarChart {...common}>
          {axes}
          {series.map((s, i) => (
            <Bar key={s.name} dataKey={s.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      ) : kind === "area" ? (
        <AreaChart {...common}>
          {axes}
          {series.map((s, i) => (
            <Area
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.2}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart {...common}>
          {axes}
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
