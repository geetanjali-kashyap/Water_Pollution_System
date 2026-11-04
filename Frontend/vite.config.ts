import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const API_PROXY_TARGET =
    env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: API_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
