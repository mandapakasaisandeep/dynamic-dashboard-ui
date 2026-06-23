import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import type { GaugeData } from "../../api/types";

export default function GaugeWidget({ data }: { data: GaugeData }) {
  const min = data.min ?? 0;
  const max = data.max ?? 100;
  const pct = Math.max(0, Math.min(100, ((data.value - min) / (max - min)) * 100));

  // Pick a color from the highest threshold the value exceeds.
  let color = "#1677ff";
  for (const t of (data.thresholds ?? []).slice().sort((a, b) => a.value - b.value)) {
    if (data.value >= t.value) color = t.color;
  }

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={[{ value: pct, fill: color }]}
          startAngle={225}
          endAngle={-45}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 600 }}>{data.value}</span>
        {data.label && <span style={{ fontSize: 12, color: "#888" }}>{data.label}</span>}
      </div>
    </div>
  );
}
