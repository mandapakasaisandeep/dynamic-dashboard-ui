// react-draggable (used by react-rnd) reads `process.env` at runtime on drag
// start. `process` is undefined in the browser under Vite, which throws and
// blanks the app. Provide a minimal shim before anything renders.
if (typeof (globalThis as unknown as { process?: unknown }).process === "undefined") {
  (globalThis as unknown as { process: { env: Record<string, unknown> } }).process = {
    env: {},
  };
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import "antd/dist/reset.css";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
