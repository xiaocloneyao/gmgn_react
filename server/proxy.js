// GMGN API 代理服务器
// 用于绕过 CORS 限制
// 运行: node server/proxy.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// 启用 CORS
app.use(cors());
app.use(express.json());

// GMGN API 代理端点
app.get('/api/gmgn/tokens/trending', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const endpoints = [
      `https://gmgn.ai/api/v1/tokens/trending?limit=${limit}`,
      `https://gmgn.ai/api/v1/sol/tokens/trending?limit=${limit}`,
      `https://gmgn.ai/api/v1/trending?limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gmgn.ai/',
            'Origin': 'https://gmgn.ai',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}:`, err.message);
        continue;
      }
    }

    res.status(500).json({ error: 'All GMGN endpoints failed' });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gmgn/wallets/trending', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const endpoints = [
      `https://gmgn.ai/api/v1/sol/wallets/trending?limit=${limit}`,
      `https://gmgn.ai/api/v1/wallets/trending?chain=solana&limit=${limit}`,
      `https://gmgn.ai/api/v1/wallets/trending?limit=${limit}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://gmgn.ai/',
            'Origin': 'https://gmgn.ai',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}:`, err.message);
        continue;
      }
    }

    res.status(500).json({ error: 'All GMGN endpoints failed' });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gmgn/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const endpoint = `https://gmgn.ai/api/v1/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://gmgn.ai/',
        'Origin': 'https://gmgn.ai',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }

    res.status(response.status).json({ error: 'GMGN search failed' });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GMGN Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to GMGN.ai`);
});

