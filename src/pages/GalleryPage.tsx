import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Spin,
  Switch,
  Tag,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { DashboardsApi, UsersApi } from "../api/client";
import type { DashboardDto, UserDto } from "../api/types";

export default function GalleryPage() {
  const nav = useNavigate();
  const { message } = AntApp.useApp();
  const [dashboards, setDashboards] = useState<DashboardDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([DashboardsApi.list(), UsersApi.list()]);
      setDashboards(d);
      setUsers(u);
    } catch {
      message.error("Could not reach the API. Is the backend running on :5248?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    const values = await form.validateFields();
    const ownerId = values.ownerId ?? users[0]?.id;
    if (!ownerId) {
      message.error("No users exist to own this dashboard.");
      return;
    }
    setCreating(true);
    try {
      const created = await DashboardsApi.create({
        name: values.name,
        description: values.description,
        isShared: values.isShared ?? false,
        ownerId,
      });
      message.success("Dashboard created");
      setModalOpen(false);
      form.resetFields();
      nav(`/builder/${created.id}`);
    } catch {
      message.error("Failed to create dashboard");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await DashboardsApi.remove(id);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
      message.success("Deleted");
    } catch {
      message.error("Failed to delete");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Dashboards
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New dashboard
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "grid", placeItems: "center", height: 200 }}>
          <Spin size="large" />
        </div>
      ) : dashboards.length === 0 ? (
        <Empty description="No dashboards yet" />
      ) : (
        <Row gutter={[16, 16]}>
          {dashboards.map((d) => (
            <Col key={d.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => nav(`/builder/${d.id}`)}
                title={d.name}
                actions={[
                  <Popconfirm
                    key="del"
                    title="Delete this dashboard?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(d.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>,
                ]}
              >
                <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {d.description || "No description"}
                </Typography.Paragraph>
                {d.isShared && <Tag color="blue">Shared</Tag>}
                <Tag>{d.widgets?.length ?? 0} widgets</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="New dashboard"
        open={modalOpen}
        onOk={handleCreate}
        confirmLoading={creating}
        onCancel={() => setModalOpen(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. System Overview" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isShared" label="Shared" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
