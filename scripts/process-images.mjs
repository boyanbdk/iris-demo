import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(
  '/Users/boyanbudakov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp',
);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const input = resolve(root, '.artifacts/iris-source');
const output = resolve(root, 'public/photos/iris');

const jobs = [
  ['hero-poster.png', 'hero-poster.webp', 2400, 1350, 'attention'],
  [
    'doctor-elena.png',
    'doctor-elena.webp',
    1200,
    1500,
    'attention',
    { left: 100, top: 180, width: 800, height: 1000 },
  ],
  ['doctor-nikola.png', 'doctor-nikola.webp', 1000, 1250, 'attention'],
  ['doctor-mila.png', 'doctor-mila.webp', 1000, 1250, 'attention'],
  [
    'doctor-viktor.png',
    'doctor-viktor.webp',
    1000,
    1250,
    'attention',
    { left: 52, top: 260, width: 900, height: 1125 },
  ],
  ['clinic-reception.png', 'clinic-reception.webp', 1800, 1200, 'attention'],
  ['clinic-treatment-room.png', 'clinic-treatment-room.webp', 1200, 1500, 'attention'],
  ['clinic-consultation.png', 'clinic-consultation.webp', 1200, 1500, 'attention'],
];

await mkdir(output, { recursive: true });

for (const [source, target, width, height, position, extract] of jobs) {
  let image = sharp(resolve(input, source)).rotate();
  if (extract) image = image.extract(extract);

  await image
    .resize({ width, height, fit: 'cover', position })
    .webp({ quality: 82, effort: 5 })
    .toFile(resolve(output, target));
  console.log(`created ${target} at ${width}x${height}`);
}
