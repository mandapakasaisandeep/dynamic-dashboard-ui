import { useCallback, useEffect, useState } from "react";
import { Button, Card, Spin, Tooltip } from "antd";
import {
  DeleteOutlined,
  HolderOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { WidgetsApi } from "../api/client";
import type {
  ChartData,
  GaugeData,
  KpiData,
  MarkdownData,
  TableData,
  WidgetDto,
} from "../api/types";
import { readChartKind, readStyle } from "../widgetConfig";
import KpiWidget from "./widgets/KpiWidget";
import ChartWidget from "./widgets/ChartWidget";
import TableWidget from "./widgets/TableWidget";
import GaugeWidget from "./widgets/GaugeWidget";
import MarkdownWidget from "./widgets/MarkdownWidget";

interface Props {
  widget: WidgetDto;
  onDelete: (id: string) => void;
  onEdit?: (widget: WidgetDto) => void;
}

function renderBody(widget: WidgetDto, data: unknown) {
  switch (widget.widgetType.toUpperCase()) {
    case "KPI":
      return <KpiWidget data={data as KpiData} />;
    case "CHART":
      return <ChartWidget data={data as ChartData} kind={readChartKind(widget)} />;
    case "TABLE":
      return <TableWidget data={data as TableData} />;
    case "GAUGE":
      return <GaugeWidget data={data as GaugeData} />;
    case "MARKDOWN":
      return <MarkdownWidget data={data as MarkdownData} />;
    default:
      return <em>Unknown widget type: {widget.widgetType}</em>;
  }
}

export default function WidgetCard({ widget, onDelete, onEdit }: Props) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const style = readStyle(widget);
  const showTitle = style.showTitle !== false;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await WidgetsApi.data(widget.id);
      setData(res.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [widget.id]);

  useEffect(() => {
    load();
  }, [load]);

  const actions = (
    // .widget-action is excluded from drag by react-rnd's `cancel` selector.
    <span className="widget-action">
      <Tooltip title="Refresh">
        <Button type="text" size="small" icon={<ReloadOutlined />} onClick={load} />
      </Tooltip>
      {onEdit && (
        <Tooltip title="Settings">
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => onEdit(widget)}
          />
        </Tooltip>
      )}
      <Tooltip title="Remove">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(widget.id)}
        />
      </Tooltip>
    </span>
  );

  // The header doubles as the drag handle (class consumed by react-rnd).
  const handle = (
    <span
      className="widget-drag-handle"
      style={{ cursor: "move", userSelect: "none", color: style.color }}
    >
      <HolderOutlined style={{ marginRight: 6, color: "#bbb" }} />
      {showTitle && (widget.title || widget.widgetType)}
    </span>
  );

  return (
    <Card
      size="small"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: style.background,
        color: style.color,
        border: style.borderWidth
          ? `${style.borderWidth}px solid ${style.borderColor || "#d9d9d9"}`
          : undefined,
        borderRadius: style.radius,
        opacity: style.opacity,
        overflow: "hidden",
      }}
      styles={{
        header: { color: style.color, minHeight: 36 },
        body: {
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: style.padding,
          fontSize: style.fontSize,
          color: style.color,
        },
      }}
      title={handle}
      extra={actions}
    >
      {loading ? (
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <Spin />
        </div>
      ) : error ? (
        <div style={{ color: "#cf1322" }}>{error}</div>
      ) : (
        <div style={{ width: "100%", height: "100%" }}>{renderBody(widget, data)}</div>
      )}
    </Card>
  );
}
