// Mirrors the .NET DTOs (System.Text.Json default camelCase casing).

export interface UserDto {
  id: string;
  fullName?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface WidgetDto {
  id: string;
  dashboardId: string;
  widgetType: string;
  title?: string;
  /** JSON string, e.g. '{"unit":"%"}' */
  config: string;
  /** JSON string of GridPosition, e.g. '{"x":0,"y":0,"w":4,"h":3}' */
  position: string;
  createdAt: string;
}

export interface DashboardDto {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  isShared: boolean;
  createdAt: string;
  user?: UserDto;
  widgets: WidgetDto[];
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Free-form absolute position in pixels, plus stacking order. */
export interface FreePosition {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

/** Per-widget appearance overrides, stored under config._style. */
export interface WidgetStyle {
  background?: string;
  color?: string;
  borderWidth?: number;
  borderColor?: string;
  radius?: number;
  padding?: number;
  fontSize?: number;
  opacity?: number;
  showTitle?: boolean;
}

/** Response shape of POST /api/widgets/{id}/data */
export interface WidgetDataResponse {
  widgetId: string;
  data: unknown;
  timestamp: string;
}

// ---- Widget data payload shapes returned by the mock data endpoint ----

export interface KpiData {
  value: number;
  label: string;
  trend?: string;
  trendDirection?: "up" | "down";
}

export interface ChartSeries {
  name: string;
  points: { x: string; y: number }[];
}

export interface ChartData {
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface TableData {
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}

export interface GaugeData {
  value: number;
  min: number;
  max: number;
  label?: string;
  thresholds?: { value: number; color: string }[];
}

export interface MarkdownData {
  content: string;
}

/** Canonical widget types understood by the backend mock-data endpoint. */
export type WidgetType = "KPI" | "CHART" | "TABLE" | "GAUGE" | "MARKDOWN";

// ---- Widget type config schemas (GET /api/widget-types) ----

export interface JsonSchemaProperty {
  type: string;
  title?: string;
  enum?: (string | number)[];
  default?: unknown;
  items?: unknown;
}

export interface JsonObjectSchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface WidgetTypeSchema {
  type: string;
  displayName: string;
  schema: JsonObjectSchema;
}
