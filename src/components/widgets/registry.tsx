import type { WidgetType } from "../../api/types";
import {
  BarChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  NumberOutlined,
  TableOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

export interface WidgetTypeMeta {
  type: WidgetType;
  label: string;
  icon: ReactNode;
  /** Default config (stored as JSON string on the widget). */
  defaultConfig: Record<string, unknown>;
  /** Initial size in pixels for the free-form canvas. */
  defaultSize: { w: number; h: number };
}

export const WIDGET_TYPES: WidgetTypeMeta[] = [
  {
    type: "KPI",
    label: "KPI Tile",
    icon: <NumberOutlined />,
    defaultConfig: { unit: "" },
    defaultSize: { w: 220, h: 150 },
  },
  {
    type: "CHART",
    label: "Chart",
    icon: <BarChartOutlined />,
    defaultConfig: { timeWindow: "1h", chartKind: "line" },
    defaultSize: { w: 380, h: 260 },
  },
  {
    type: "TABLE",
    label: "Table",
    icon: <TableOutlined />,
    defaultConfig: { pageSize: 25 },
    defaultSize: { w: 380, h: 260 },
  },
  {
    type: "GAUGE",
    label: "Gauge",
    icon: <DashboardOutlined />,
    defaultConfig: { min: 0, max: 1000 },
    defaultSize: { w: 220, h: 220 },
  },
  {
    type: "MARKDOWN",
    label: "Markdown",
    icon: <FileTextOutlined />,
    defaultConfig: { content: "### New note\nEdit me." },
    defaultSize: { w: 280, h: 180 },
  },
];

export function metaFor(type: string): WidgetTypeMeta | undefined {
  return WIDGET_TYPES.find((t) => t.type === type.toUpperCase());
}

/**
 * Canonical widget type -> id used by GET /api/widget-types. The palette uses
 * coarse types (CHART) while the schema endpoint is finer-grained (lineChart).
 */
export const SCHEMA_ID_BY_TYPE: Record<string, string> = {
  KPI: "kpi",
  CHART: "lineChart",
  TABLE: "table",
  GAUGE: "gauge",
  MARKDOWN: "markdown",
};

export function schemaIdFor(widgetType: string): string {
  return SCHEMA_ID_BY_TYPE[widgetType.toUpperCase()] ?? widgetType;
}
