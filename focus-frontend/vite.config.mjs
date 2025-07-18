import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Treat BOTH .jsx *and* .js inside /src as JSX-capable
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,   // js, jsx, ts, tsx inside /src
  },
});