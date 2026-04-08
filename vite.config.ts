import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.iterator',
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Code-split vendor libraries to reduce main bundle size
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['lucide-react', 'recharts', 'react-hot-toast'],
          'vendor-forms': ['react-hook-form', 'zod'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
        },
      },
    },
    // Increase chunk size warning to 600KB (after splitting, each chunk should be < 300KB)
    chunkSizeWarningLimit: 600,
  },
});
