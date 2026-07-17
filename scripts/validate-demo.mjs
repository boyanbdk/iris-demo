import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const widgetRoot = process.env.WIDGET_REPO
  ? resolve(process.env.WIDGET_REPO)
  : resolve(root, '..', '..', 'autosilas-widget');
const errors = [];

async function text(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    errors.push(`missing readable file: ${path}`);
    return '';
  }
}

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

function requireText(source, value, label) {
  if (!source.includes(value)) errors.push(`missing ${label}: ${value}`);
}

const requiredFiles = [
  'public/photos/iris/hero-poster.webp',
  'public/photos/iris/doctor-elena.webp',
  'public/photos/iris/doctor-nikola.webp',
  'public/photos/iris/doctor-mila.webp',
  'public/photos/iris/doctor-viktor.webp',
  'public/photos/iris/clinic-reception.webp',
  'public/photos/iris/clinic-treatment-room.webp',
  'public/photos/iris/clinic-consultation.webp',
  'public/media/iris-hero.mp4',
  'public/media/README.md',
  'src/components/Team.astro',
  'src/components/ClinicGallery.astro',
  'src/components/ClinicMap.astro',
];

for (const relative of requiredFiles) {
  if (!(await exists(join(root, relative)))) errors.push(`missing required file: ${relative}`);
}

const clinic = await text(join(root, 'src/config/clinic.ts'));
const hero = await text(join(root, 'src/components/Hero.astro'));
const page = await text(join(root, 'src/pages/index.astro'));
const widget = await text(join(widgetRoot, 'configs/iris.json'));
const built = await text(join(root, 'dist/index.html'));

for (const doctor of [
  'д-р Елена Маринова',
  'д-р Никола Георгиев',
  'д-р Мила Петрова',
  'д-р Виктор Илиев',
]) {
  requireText(clinic, doctor, 'clinic doctor');
  requireText(widget, doctor, 'widget doctor');
}

requireText(clinic, "videoSrc: '/media/iris-hero.mp4'", 'approved hero video source');
requireText(hero, 'data-hero-video', 'conditional hero video hook');
requireText(page, '<Team />', 'team page section');
requireText(page, '<ClinicGallery />', 'gallery page section');
requireText(built, 'noindex, nofollow', 'noindex meta');
requireText(built, 'Демонстрационен сайт на АвтоСилас', 'demo ribbon');
requireText(built, 'Измислен демонстрационен екип', 'team disclosure');
requireText(built, 'Маркерът е илюстративен', 'map disclosure');
requireText(built, 'data-client="iris"', 'Iris widget embed');
requireText(widget, '"phone": ""', 'empty widget phone');
requireText(widget, '"webhook": ""', 'empty widget webhook');

const forbidden = [
  /Denta Heal/i,
  /denta-heal/i,
  /д-р Василев/i,
  /Златица/i,
  /Хаджи Димитър/i,
  /href=["']tel:/i,
  /google\.(?:com|bg)\/maps/i,
  /maps\.google/i,
];

for (const file of (
  await Promise.all(['src', 'public', 'dist'].map((dir) => walk(join(root, dir))))
).flat()) {
  if (!/\.(?:astro|css|html|js|json|md|svg|ts|txt)$/i.test(file)) continue;
  const source = await readFile(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) {
      errors.push(`forbidden residue ${pattern} in ${file.slice(root.length + 1)}`);
    }
  }
}

if (errors.length) {
  console.error(`Iris validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('Iris validation passed.');
