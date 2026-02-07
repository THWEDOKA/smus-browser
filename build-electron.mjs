import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';

// Build main process
await build({
  entryPoints: [join(__dirname, 'electron/main.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist-electron/main.js',
  external: ['electron'],
  sourcemap: !isProd,
  minify: isProd,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});

// Build preload script
await build({
  entryPoints: [join(__dirname, 'electron/preload.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist-electron/preload.js',
  external: ['electron'],
  sourcemap: !isProd,
  minify: isProd,
});

console.log('✅ Electron files compiled successfully!');
