import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App as AntApp, Button, Space, Spin, Tag, Typography } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Rnd } from "react-rnd";
import { DashboardsApi, WidgetsApi, WidgetTypesApi } from "../api/client";
import type { DashboardDto, WidgetDto, WidgetTypeSchema } from "../api/types";
import { parsePosition, useBuilderStore } from "../store/builderStore";
import {
  metaFor,
  schemaIdFor,
  type WidgetTypeMeta,
} from "../components/widgets/registry";
import WidgetPalette, { DRAG_MIME } from "../components/WidgetPalette";
import WidgetCard from "../components/WidgetCard";
import WidgetConfigModal from "../components/WidgetConfigModal";

const CANVAS_HEIGHT = 1400;

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { message } = AntApp.useApp();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [dashboard, setDashboard] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schemas, setSchemas] = useState<WidgetTypeSchema[]>([]);
  const [editing, setEditing] = useState<WidgetDto | null>(null);

  const widgets = useBuilderStore((s) => s.widgets);
  const dirty = useBuilderStore((s) => s.dirty);
  const setWidgets = useBuilderStore((s) => s.setWidgets);
  const addWidget = useBuilderStore((s) => s.addWidget);
  const updateWidget = useBuilderStore((s) => s.updateWidget);
  const removeWidget = useBuilderStore((s) => s.removeWidget);
  const setPosition = useBuilderStore((s) => s.setPosition);
  const bringToFront = useBuilderStore((s) => s.bringToFront);
  const clearDirty = useBuilderStore((s) => s.clearDirty);
  const reset = useBuilderStore((s) => s.reset);

  useEffect(() => {
    WidgetTypesApi.list()
      .then(setSchemas)
      .catch(() => setSchemas([]));
  }, []);

  function schemaForWidget(widgetType: string) {
    const sid = schemaIdFor(widgetType);
    return schemas.find((s) => s.type.toLowerCase() === sid.toLowerCase())?.schema;
  }

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [d, w] = await Promise.all([
          DashboardsApi.get(id),
          WidgetsApi.byDashboard(id),
        ]);
        if (!active) return;
        setDashboard(d);
        setWidgets(w);
      } catch {
        message.error("Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      reset();
    };
  }, [id]);

  function nextZ() {
    return (
      widgets.reduce((acc, w) => Math.max(acc, parsePosition(w).z), 0) + 1
    );
  }

  // Read the freshest z from the store (bringToFront may have just bumped it),
  // avoiding the stale value captured in this render's closure.
  function currentZ(widgetId: string) {
    const w = useBuilderStore.getState().widgets.find((x) => x.id === widgetId);
    return w ? parsePosition(w).z : 1;
  }

  async function createWidgetAt(meta: WidgetTypeMeta, x: number, y: number) {
    if (!id) return;
    const position = {
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      w: meta.defaultSize.w,
      h: meta.defaultSize.h,
      z: nextZ(),
    };
    try {
      const created = await WidgetsApi.create(id, {
        widgetType: meta.type,
        title: meta.label,
        config: JSON.stringify(meta.defaultConfig),
        position: JSON.stringify(position),
      });
      addWidget(created);
    } catch {
      message.error("Failed to add widget");
    }
  }

  // Click in palette: cascade near the top-left.
  function handlePaletteAdd(meta: WidgetTypeMeta) {
    const offset = (widgets.length % 6) * 32;
    createWidgetAt(meta, 24 + offset, 24 + offset);
  }

  function handleCanvasDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const type = e.dataTransfer.getData(DRAG_MIME);
    const meta = type ? metaFor(type) : undefined;
    if (!meta || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Drop so the widget is roughly centered under the cursor.
    createWidgetAt(
      meta,
      e.clientX - rect.left - meta.defaultSize.w / 2,
      e.clientY - rect.top - 16
    );
  }

  async function handleDelete(widgetId: string) {
    try {
      await WidgetsApi.remove(widgetId);
      removeWidget(widgetId);
    } catch {
      message.error("Failed to remove widget");
    }
  }

  async function handleSave() {
    if (dirty.size === 0) {
      message.info("Nothing to save");
      return;
    }
    setSaving(true);
    try {
      const toSave = widgets.filter((w) => dirty.has(w.id));
      await Promise.all(toSave.map((w) => WidgetsApi.update(w.id, w)));
      clearDirty();
      message.success(
        `Saved (${toSave.length} widget${toSave.length === 1 ? "" : "s"})`
      );
    } catch {
      message.error("Failed to save layout");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => nav("/")}>
            Back
          </Button>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {dashboard?.name}
          </Typography.Title>
          {dirty.size > 0 && <Tag color="orange">Unsaved changes</Tag>}
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          disabled={dirty.size === 0}
          onClick={handleSave}
        >
          Save layout
        </Button>
      </div>

      <WidgetPalette onAdd={handlePaletteAdd} />

      <div
        style={{
          overflow: "auto",
          border: "1px solid #e8e8e8",
          borderRadius: 8,
          background:
            "#ffffff radial-gradient(#e9e9e9 1px, transparent 1px) 0 0 / 24px 24px",
          maxHeight: "calc(100vh - 280px)",
        }}
      >
        <div
          ref={canvasRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleCanvasDrop}
          style={{ position: "relative", width: "100%", height: CANVAS_HEIGHT }}
        >
          {widgets.length === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: "#999",
                pointerEvents: "none",
              }}
            >
              Drag a widget here, or click one in the palette above.
            </div>
          )}

          {widgets.map((w, i) => {
            const pos = parsePosition(w, i);
            return (
              <Rnd
                key={w.id}
                bounds="parent"
                size={{ width: pos.w, height: pos.h }}
                position={{ x: pos.x, y: pos.y }}
                minWidth={140}
                minHeight={90}
                style={{ zIndex: pos.z }}
                dragHandleClassName="widget-drag-handle"
                cancel=".widget-action"
                onDragStart={() => bringToFront(w.id)}
                onDragStop={(_e, d) =>
                  setPosition(w.id, {
                    x: d.x,
                    y: d.y,
                    w: pos.w,
                    h: pos.h,
                    z: currentZ(w.id),
                  })
                }
                onResizeStop={(_e, _dir, ref, _delta, position) =>
                  setPosition(w.id, {
                    x: position.x,
                    y: position.y,
                    w: ref.offsetWidth,
                    h: ref.offsetHeight,
                    z: currentZ(w.id),
                  })
                }
              >
                <WidgetCard widget={w} onDelete={handleDelete} onEdit={setEditing} />
              </Rnd>
            );
          })}
        </div>
      </div>

      <WidgetConfigModal
        widget={editing}
        schema={editing ? schemaForWidget(editing.widgetType) : undefined}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={(w) => updateWidget(w)}
      />
    </div>
  );
}
