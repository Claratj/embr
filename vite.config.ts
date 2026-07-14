import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      // The consumer brings React. Bundling it would give them two copies and break hooks.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        // One output file per source module, rather than a single bundle. This is what makes
        // the package genuinely tree-shakeable: importing Button pulls in Button, not Embr.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    // `npm run build` also emits .d.ts and the CSS entries; don't wipe them between steps.
    emptyOutDir: false,
  },
});
