import { useEffect } from "react";
import {
  App as AntApp,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Slider,
  Switch,
  Tabs,
  Typography,
} from "antd";
import type { JsonObjectSchema, WidgetDto, WidgetStyle } from "../api/types";
import { WidgetsApi } from "../api/client";
import { readConfig } from "../widgetConfig";
import SchemaForm from "./SchemaForm";

interface Props {
  widget: WidgetDto | null;
  schema?: JsonObjectSchema;
  open: boolean;
  onClose: () => void;
  onSaved: (w: WidgetDto) => void;
}

const TITLE_FIELD = "__title";

// antd ColorPicker hands back a Color object; persist a hex string.
function normColor(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v || undefined;
  const c = v as { toHexString?: () => string };
  return typeof c.toHexString === "function" ? c.toHexString() : undefined;
}

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

export default function WidgetConfigModal({
  widget,
  schema,
  open,
  onClose,
  onSaved,
}: Props) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const isChart = widget?.widgetType?.toUpperCase() === "CHART";

  useEffect(() => {
    if (!open || !widget) return;
    const config = readConfig(widget);
    const style = (config._style as WidgetStyle) ?? {};

    const init: Record<string, unknown> = {
      [TITLE_FIELD]: widget.title,
      chartKind: config.chartKind ?? "line",
      style_showTitle: style.showTitle !== false,
      style_background: style.background,
      style_color: style.color,
      style_borderWidth: style.borderWidth,
      style_borderColor: style.borderColor,
      style_radius: style.radius,
      style_padding: style.padding,
      style_fontSize: style.fontSize,
      style_opacity: style.opacity ?? 1,
    };
    for (const [key, prop] of Object.entries(schema?.properties ?? {})) {
      const v = config[key];
      init[key] =
        prop.type === "array" && v != null
          ? JSON.stringify(v, null, 2)
          : v ?? prop.default;
    }
    form.setFieldsValue(init);
  }, [open, widget, schema, form]);

  async function handleOk() {
    if (!widget) return;
    const values = await form.validateFields();

    // Data fields (from the JSON schema)
    const config: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(schema?.properties ?? {})) {
      let v = values[key];
      if (prop.type === "array" && typeof v === "string") {
        try {
          v = v.trim() ? JSON.parse(v) : [];
        } catch {
          message.error(`"${prop.title ?? key}" must be valid JSON`);
          return Promise.reject(new Error("invalid json"));
        }
      }
      if (v !== undefined && v !== null && v !== "") config[key] = v;
    }

    // Per-widget options
    if (isChart) config.chartKind = values.chartKind;

    // Appearance
    const style: WidgetStyle = clean({
      showTitle: values.style_showTitle,
      background: normColor(values.style_background),
      color: normColor(values.style_color),
      borderWidth: values.style_borderWidth,
      borderColor: normColor(values.style_borderColor),
      radius: values.style_radius,
      padding: values.style_padding,
      fontSize: values.style_fontSize,
      opacity: values.style_opacity,
    });
    // showTitle:false is meaningful even though it's "falsy" — keep it explicitly.
    if (values.style_showTitle === false) style.showTitle = false;
    if (Object.keys(style).length > 0) config._style = style;

    const updated: WidgetDto = {
      ...widget,
      title: values[TITLE_FIELD] ?? widget.title,
      config: JSON.stringify(config),
    };

    try {
      await WidgetsApi.update(widget.id, updated);
      onSaved(updated);
      message.success("Widget updated");
      onClose();
    } catch {
      message.error("Failed to save widget");
      return Promise.reject(new Error("save failed"));
    }
  }

  const optionsTab = (
    <>
      <Form.Item name={TITLE_FIELD} label="Title">
        <Input placeholder="Widget title" />
      </Form.Item>
      {isChart && (
        <Form.Item name="chartKind" label="Chart type">
          <Select
            options={[
              { value: "line", label: "Line" },
              { value: "bar", label: "Bar" },
              { value: "area", label: "Area" },
            ]}
          />
        </Form.Item>
      )}
      {!isChart && (
        <Typography.Text type="secondary">
          No type-specific options for this widget.
        </Typography.Text>
      )}
    </>
  );

  const appearanceTab = (
    <>
      <Form.Item name="style_showTitle" label="Show title bar" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="style_background" label="Background">
        <ColorPicker allowClear showText />
      </Form.Item>
      <Form.Item name="style_color" label="Text color">
        <ColorPicker allowClear showText />
      </Form.Item>
      <Form.Item name="style_borderWidth" label="Border width (px)">
        <InputNumber min={0} max={12} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="style_borderColor" label="Border color">
        <ColorPicker allowClear showText />
      </Form.Item>
      <Form.Item name="style_radius" label="Corner radius (px)">
        <InputNumber min={0} max={40} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="style_padding" label="Padding (px)">
        <InputNumber min={0} max={48} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="style_fontSize" label="Font size (px)">
        <InputNumber min={8} max={48} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="style_opacity" label="Opacity">
        <Slider min={0.2} max={1} step={0.05} />
      </Form.Item>
    </>
  );

  const dataTab = schema ? (
    <SchemaForm schema={schema} />
  ) : (
    <Typography.Text type="secondary">No data schema for this type.</Typography.Text>
  );

  return (
    <Modal
      title="Widget settings"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Save"
      width={560}
    >
      <Form form={form} layout="vertical">
        <Tabs
          items={[
            { key: "options", label: "Options", children: optionsTab, forceRender: true },
            { key: "appearance", label: "Appearance", children: appearanceTab, forceRender: true },
            { key: "data", label: "Data", children: dataTab, forceRender: true },
          ]}
        />
      </Form>
    </Modal>
  );
}
