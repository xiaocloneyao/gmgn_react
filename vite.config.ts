import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ⭐ GitHub Pages 必须设置的 base
  base: mode === "production" ? "/gmgn_react/" : "/",

  server: {
    host: "::",
    port: 8080,

    proxy: {
      // ⭐ GMGN API CORS 代理
      "/api/gmgn": {
        target: "https://gmgn.ai",
        changeOrigin: true,
        secure: false,

        rewrite: (path) => {
          // /api/gmgn/tokens/trending → /api/v1/tokens/trending
          return path.replace(/^\/api\/gmgn/, "/api/v1");
        },

        configure: (proxy, _options) => {
          proxy.on("error", (err) => {
            console.log("GMGN proxy error", err);
          });

          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("Proxying GMGN request:", req.url);

            // ⭐ 添加必要请求头（反爬虫）
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            );
            proxyReq.setHeader("Referer", "https://gmgn.ai/");
            proxyReq.setHeader("Origin", "https://gmgn.ai");
            proxyReq.setHeader("Accept", "application/json");
          });

          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("GMGN proxy response:", req.url, proxyRes.statusCode);
          });
        },
      },
    },
  },

  plugins: [
    react(),
    // 开发环境注入 tagger
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
