import { Table } from "antd";
import type { TableData } from "../../api/types";

export default function TableWidget({ data }: { data: TableData }) {
  const columns = (data.columns ?? []).map((c) => ({
    title: c.label,
    dataIndex: c.key,
    key: c.key,
  }));
  const rows = (data.rows ?? []).map((r, i) => ({ key: i, ...r }));

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={rows}
      pagination={false}
      scroll={{ y: "100%" }}
    />
  );
}
