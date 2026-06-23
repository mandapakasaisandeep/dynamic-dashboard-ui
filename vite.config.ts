import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the .NET backend so the frontend can use same-origin
      // relative URLs (no CORS in the browser). Target the HTTPS endpoint because
      // the API does http->https redirect; `secure: false` accepts the dev cert.
      "/api": {
        target: "https://localhost:7017",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
