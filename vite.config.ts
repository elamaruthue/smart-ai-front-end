import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load .env.local so VITE_BACKEND_PORT is available at config time
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backendPort = env.VITE_BACKEND_PORT ?? '4000';

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      proxy: {
        // All /api/* calls are forwarded to the Express backend
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});


