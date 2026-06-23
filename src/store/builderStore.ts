import { create } from "zustand";
import type { FreePosition, WidgetDto } from "../api/types";

// Scale factors used to migrate legacy 12-col grid positions to pixels.
const GRID_COL = 110;
const GRID_ROW = 80;

/**
 * Parse a widget's position JSON into a free-form pixel position. Legacy
 * positions stored as small grid units (e.g. {x:0,y:0,w:3,h:2}) are detected
 * and scaled to pixels so seeded dashboards still lay out sensibly.
 */
export function parsePosition(w: WidgetDto, index = 0): FreePosition {
  try {
    const p = JSON.parse(w.position || "{}");
    if (
      typeof p.x === "number" &&
      typeof p.y === "number" &&
      typeof p.w === "number" &&
      typeof p.h === "number"
    ) {
      const looksLikeGrid = p.w <= 24 && p.h <= 24;
      if (looksLikeGrid) {
        return {
          x: Math.round(p.x * GRID_COL),
          y: Math.round(p.y * GRID_ROW),
          w: Math.max(160, Math.round(p.w * GRID_COL)),
          h: Math.max(120, Math.round(p.h * GRID_ROW)),
          z: typeof p.z === "number" ? p.z : index + 1,
        };
      }
      return {
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        z: typeof p.z === "number" ? p.z : index + 1,
      };
    }
  } catch {
    /* fall through to cascade placement */
  }
  // Default: cascade new widgets so they don't stack exactly.
  const offset = (index % 6) * 32;
  return { x: 24 + offset, y: 24 + offset, w: 260, h: 180, z: index + 1 };
}

interface BuilderState {
  widgets: WidgetDto[];
  /** widget ids whose position changed since last save */
  dirty: Set<string>;
  setWidgets: (widgets: WidgetDto[]) => void;
  addWidget: (widget: WidgetDto) => void;
  updateWidget: (widget: WidgetDto) => void;
  removeWidget: (id: string) => void;
  setPosition: (id: string, pos: FreePosition) => void;
  bringToFront: (id: string) => void;
  clearDirty: () => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  widgets: [],
  dirty: new Set(),
  setWidgets: (widgets) => set({ widgets, dirty: new Set() }),
  addWidget: (widget) =>
    set((s) => ({ widgets: [...s.widgets, widget] })),
  updateWidget: (widget) =>
    set((s) => ({
      // Preserve the in-grid position; only metadata/config changed here.
      widgets: s.widgets.map((w) =>
        w.id === widget.id ? { ...widget, position: w.position } : w
      ),
    })),
  removeWidget: (id) =>
    set((s) => ({
      widgets: s.widgets.filter((w) => w.id !== id),
      dirty: new Set([...s.dirty].filter((d) => d !== id)),
    })),
  setPosition: (id, pos) =>
    set((s) => {
      let changed = false;
      const widgets = s.widgets.map((w) => {
        if (w.id !== id) return w;
        const next = JSON.stringify(pos);
        if (next === w.position) return w;
        changed = true;
        return { ...w, position: next };
      });
      if (!changed) return {};
      return { widgets, dirty: new Set(s.dirty).add(id) };
    }),
  bringToFront: (id) =>
    set((s) => {
      const maxZ = s.widgets.reduce((acc, w) => {
        try {
          const p = JSON.parse(w.position || "{}");
          return Math.max(acc, typeof p.z === "number" ? p.z : 0);
        } catch {
          return acc;
        }
      }, 0);
      const target = s.widgets.find((w) => w.id === id);
      if (!target) return {};
      let currentZ = 0;
      try {
        currentZ = JSON.parse(target.position || "{}").z ?? 0;
      } catch {
        /* ignore */
      }
      if (currentZ === maxZ && maxZ > 0) return {}; // already on top
      const widgets = s.widgets.map((w) => {
        if (w.id !== id) return w;
        let p: Record<string, unknown> = {};
        try {
          p = JSON.parse(w.position || "{}");
        } catch {
          /* ignore */
        }
        return { ...w, position: JSON.stringify({ ...p, z: maxZ + 1 }) };
      });
      return { widgets, dirty: new Set(s.dirty).add(id) };
    }),
  clearDirty: () => set({ dirty: new Set() }),
  reset: () => set({ widgets: [], dirty: new Set() }),
}));
