import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === "production" ? "/gmgn_react/" : "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // GMGN API 代理 - 绕过 CORS
      '/api/gmgn': {
        target: 'https://gmgn.ai',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // /api/gmgn/tokens/trending -> /api/v1/tokens/trending
          // /api/gmgn/wallets/trending -> /api/v1/wallets/trending
          // /api/gmgn/search -> /api/v1/search
          const newPath = path.replace(/^\/api\/gmgn/, '/api/v1');
          console.log('Proxying:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('GMGN proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying GMGN request:', req.url);
            // 添加必要的请求头
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Referer', 'https://gmgn.ai/');
            proxyReq.setHeader('Origin', 'https://gmgn.ai');
            proxyReq.setHeader('Accept', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('GMGN proxy response:', req.url, proxyRes.statusCode);
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
