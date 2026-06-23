import { Card, Typography } from "antd";
import { WIDGET_TYPES, type WidgetTypeMeta } from "./widgets/registry";

export const DRAG_MIME = "application/x-dd-widget-type";

interface Props {
  onAdd: (meta: WidgetTypeMeta) => void;
}

export default function WidgetPalette({ onAdd }: Props) {
  return (
    <Card size="small" title="Widgets" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {WIDGET_TYPES.map((meta) => (
          <div
            key={meta.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_MIME, meta.type);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(meta)}
            title="Drag onto the canvas, or click to add"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              cursor: "grab",
              background: "#fafafa",
              userSelect: "none",
            }}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </div>
        ))}
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Drag a widget onto the canvas, or click to drop it in.
      </Typography.Text>
    </Card>
  );
}
