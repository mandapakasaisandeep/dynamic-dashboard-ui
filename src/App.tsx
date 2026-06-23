import { Layout, Typography } from "antd";
import { Link, Route, Routes } from "react-router-dom";
import { DashboardOutlined } from "@ant-design/icons";
import GalleryPage from "./pages/GalleryPage";
import BuilderPage from "./pages/BuilderPage";

const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <DashboardOutlined style={{ color: "#fff", fontSize: 20 }} />
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            DynamicDash
          </Typography.Title>
        </Link>
      </Header>
      <Content style={{ background: "#f5f5f5" }}>
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/builder/:id" element={<BuilderPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
