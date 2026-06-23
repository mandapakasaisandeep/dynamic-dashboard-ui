import { Statistic } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { KpiData } from "../../api/types";

export default function KpiWidget({ data }: { data: KpiData }) {
  const up = data.trendDirection !== "down";
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
      <Statistic title={data.label} value={data.value} />
      {data.trend && (
        <span style={{ color: up ? "#3f8600" : "#cf1322", fontSize: 13 }}>
          {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {data.trend}
        </span>
      )}
    </div>
  );
}
