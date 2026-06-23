import { Form, Input, InputNumber, Select, Switch } from "antd";
import type { JsonObjectSchema, JsonSchemaProperty } from "../api/types";

// Fields that read better as a multi-line textarea.
const MULTILINE = new Set(["content", "query"]);

function controlFor(key: string, prop: JsonSchemaProperty) {
  if (prop.enum) {
    return (
      <Select
        options={prop.enum.map((v) => ({ value: v, label: String(v) }))}
        allowClear
      />
    );
  }
  switch (prop.type) {
    case "number":
    case "integer":
      return <InputNumber style={{ width: "100%" }} />;
    case "boolean":
      return <Switch />;
    case "array":
      return <Input.TextArea rows={4} placeholder="JSON array, e.g. []" />;
    default:
      return MULTILINE.has(key) ? <Input.TextArea rows={3} /> : <Input />;
  }
}

/**
 * Renders antd Form.Items from a JSON Schema object. Must be used inside a
 * parent <Form>. Array-typed properties are edited as JSON text; the parent is
 * responsible for parse/stringify (see WidgetConfigModal).
 */
export default function SchemaForm({ schema }: { schema: JsonObjectSchema }) {
  const required = new Set(schema.required ?? []);
  const props = schema.properties ?? {};

  return (
    <>
      {Object.entries(props).map(([key, prop]) => (
        <Form.Item
          key={key}
          name={key}
          label={prop.title ?? key}
          valuePropName={prop.type === "boolean" ? "checked" : "value"}
          rules={
            required.has(key)
              ? [{ required: true, message: `${prop.title ?? key} is required` }]
              : []
          }
        >
          {controlFor(key, prop)}
        </Form.Item>
      ))}
    </>
  );
}
