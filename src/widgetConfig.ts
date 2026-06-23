import type { WidgetDto, WidgetStyle } from "./api/types";

/** Parse a widget's config JSON string safely. */
export function readConfig(w: WidgetDto): Record<string, unknown> {
  try {
    const c = JSON.parse(w.config || "{}");
    return c && typeof c === "object" ? c : {};
  } catch {
    return {};
  }
}

export function readStyle(w: WidgetDto): WidgetStyle {
  const s = readConfig(w)._style;
  return s && typeof s === "object" ? (s as WidgetStyle) : {};
}

export type ChartKind = "line" | "bar" | "area";

export function readChartKind(w: WidgetDto): ChartKind {
  const k = readConfig(w).chartKind;
  return k === "bar" || k === "area" ? k : "line";
}
