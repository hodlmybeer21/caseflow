import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
execSync('rm -rf dist', { cwd: __dirname });

await esbuild.build({
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  outfile: resolve(__dirname, 'dist/index.js'),
  format: 'esm',
  platform: 'node',
  bundle: true,
  minify: false,
  sourcemap: false,
  target: 'node20',
  loader: { '.ts': 'ts' },
  external: [
    'pg',
    'drizzle-orm',
    'drizzle-orm/node-postgres',
    'dotenv',
    'bcryptjs',
    'express',
    'express-session',
    'cookie-parser',
    'cors',
    'path',
    'fs',
    'fs/promises',
    'stream/promises',
    'url',
  ],
});

console.log('Build complete: dist/index.js');
