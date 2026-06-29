import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor-vendor': ['@uiw/react-codemirror', '@codemirror/theme-one-dark'],
          'motion': ['framer-motion'],
        },
      },
    },
  },
  server: { port: 5173 },
});
