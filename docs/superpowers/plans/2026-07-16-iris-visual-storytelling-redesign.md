# Iris Visual Storytelling Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the live fictional Iris clinic into a media-rich, believable demo with a video-ready hero, a fictional four-doctor team, coordinated clinic imagery, and a real map view with an explicitly illustrative Sofia marker.

**Architecture:** Keep `src/config/clinic.ts` as the typed content boundary. Add focused Astro components for team, gallery, and map; keep the hero poster-first and conditionally emit video only when Boyan supplies a source. Generate a consistent fictional image set locally, validate both the website and widget repos, and stop on local screenshots before any implementation commit, push, Worker deployment, or Pages deployment.

**Tech Stack:** Astro 5 static output, TypeScript, GSAP/ScrollTrigger, the existing AutoSilas Cloudflare Worker widget, OpenStreetMap embed, OpenAI image generation, bundled Sharp for image derivatives, gstack browser QA, Cloudflare Pages.

## Global Constraints

- Website workspace: `/Users/boyanbudakov/Documents/clients/iris-demo` on `main`.
- Widget workspace: `/Users/boyanbudakov/Documents/autosilas-widget` on `main`.
- Protected source workspace: `/Users/boyanbudakov/Documents/clients/denta-heal`; never edit, stage, commit, or deploy it.
- Approved design: `docs/superpowers/specs/2026-07-16-iris-visual-storytelling-redesign-design.md`.
- Preserve the demo ribbon, `noindex`, fictional-data disclosures, empty phone, empty webhook, and existing AutoSilas CTA destination.
- Keep the current live Pages site available at `https://iris-demo.pages.dev/` until Boyan approves the new local screenshots.
- The final hero video is not part of this execution. Build the interface with `videoSrc: ''` and a poster fallback; do not invent a video file.
- Use AI-generated fictional people only. Do not use real clinic photos, real doctors, generated logos, visible patient records, or readable text inside generated images.
- Use OpenStreetMap for an illustrative marker around Sofia's South Park area. Do not add coordinates to Dentist structured data.
- Synchronize the Iris widget's fictional team facts, but do not change its capture behavior, guardrails, origins, phone, webhook, theme, or deployment before visual approval.
- Do not commit implementation changes in either repo, push, deploy, create a backup, or change DNS before Boyan approves the local screenshots. Documentation commits `f5bbd5f` and the plan commit are allowed and already separate from implementation.
- Treat any unexpected dirty files as user-owned and stop before overlapping them.

---

## File Map

### Website files to create

- `scripts/validate-demo.mjs` — deterministic cross-repo content and build validator.
- `scripts/process-images.mjs` — converts fixed staging images into optimized WebP derivatives.
- `public/photos/iris/hero-poster.webp` — hero fallback and future video poster.
- `public/photos/iris/doctor-elena.webp` — lead doctor and first team portrait.
- `public/photos/iris/doctor-nikola.webp` — fictional implantology portrait.
- `public/photos/iris/doctor-mila.webp` — fictional pediatric dentistry portrait.
- `public/photos/iris/doctor-viktor.webp` — fictional preventive/orthodontic portrait.
- `public/photos/iris/clinic-reception.webp` — wide atmosphere and service backdrop.
- `public/photos/iris/clinic-treatment-room.webp` — vertical gallery asset.
- `public/photos/iris/clinic-consultation.webp` — vertical gallery asset.
- `public/media/README.md` — exact future hero-video handoff contract.
- `src/components/Team.astro` — typed fictional team grid.
- `src/components/ClinicGallery.astro` — atmosphere media grid and disclosures.
- `src/components/ClinicMap.astro` — OpenStreetMap embed, marker disclosure, and fallback.

### Website files to modify

- `.gitignore` — ignore local generated-source staging, not production derivatives.
- `package.json` — add `validate` and `check` scripts.
- `src/config/clinic.ts` — add doctor, media, gallery, and illustrative-map data.
- `src/pages/index.astro` — insert team and gallery in the approved order.
- `src/components/Hero.astro` — poster-first conditional video contract.
- `src/components/About.astro` — compact lead-doctor profile.
- `src/components/Services.astro` — restrained shared photographic background.
- `src/components/Contact.astro` — compose the real map component.
- `src/scripts/motion.ts` — keep media/reveal behavior safe with reduced motion.
- `src/styles/global.css` — shared media helpers and reduced-motion video rule.
- `README.md` — document image generation, future video handoff, and fictional map.

### Widget file to modify

- `/Users/boyanbudakov/Documents/autosilas-widget/configs/iris.json` — add the same four fictional doctors and illustrative-map fact; keep all behavior fields unchanged.

---

### Task 1: Add the Red-State Validator

**Files:**
- Create: `scripts/validate-demo.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: website root, built `dist/index.html`, and sibling widget root from `WIDGET_REPO` or `../../autosilas-widget`.
- Produces: `npm run validate` with exit code `0` only when the approved content, assets, widget facts, and safety constraints are present.

- [ ] **Step 1: Confirm protected repository baselines before edits**

Run:

```bash
git -C /Users/boyanbudakov/Documents/clients/iris-demo status --short
git -C /Users/boyanbudakov/Documents/autosilas-widget status --short
git -C /Users/boyanbudakov/Documents/clients/denta-heal status --short
git -C /Users/boyanbudakov/Documents/clients/denta-heal rev-parse HEAD
```

Expected: all three repos are clean; Denta Heal is still `9e9ba2b8489be3c85c06e5de6a21f66b4a7d0eba`. If not, record unexpected changes as protected and do not overwrite them.

- [ ] **Step 2: Create the validator**

Create `scripts/validate-demo.mjs` with:

```js
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

for (const doctor of ['д-р Елена Маринова', 'д-р Никола Георгиев', 'д-р Мила Петрова', 'д-р Виктор Илиев']) {
  requireText(clinic, doctor, 'clinic doctor');
  requireText(widget, doctor, 'widget doctor');
}

requireText(clinic, "videoSrc: ''", 'empty future video source');
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

for (const file of (await Promise.all(['src', 'public', 'dist'].map((dir) => walk(join(root, dir))))).flat()) {
  if (!/\.(?:astro|css|html|js|json|md|svg|ts|txt)$/i.test(file)) continue;
  const source = await readFile(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) errors.push(`forbidden residue ${pattern} in ${file.slice(root.length + 1)}`);
  }
}

if (errors.length) {
  console.error(`Iris validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log('Iris validation passed.');
```

- [ ] **Step 3: Register the scripts**

Update `package.json` scripts to exactly:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "validate": "node scripts/validate-demo.mjs",
  "check": "npm run build && npm run validate"
}
```

- [ ] **Step 4: Run the validator and confirm the intended red state**

Run:

```bash
npm run validate
```

Expected: non-zero exit with missing files, missing doctors, missing team/gallery, and missing hero-video-hook errors. If it passes, the validator is not guarding the redesign and must be corrected before proceeding.

---

### Task 2: Generate and Process the Coordinated Fictional Image Set

**Files:**
- Modify: `.gitignore`
- Create: `scripts/process-images.mjs`
- Create: eight `public/photos/iris/*.webp` files listed in the File Map

**Interfaces:**
- Consumes: eight reviewed image-generation outputs staged with fixed PNG names under `.artifacts/iris-source/`.
- Produces: optimized, correctly cropped WebP files referenced by `clinic.media` and doctor records.

- [ ] **Step 1: Read and use the imagegen skill**

Read `/Users/boyanbudakov/.codex/skills/.system/imagegen/SKILL.md` completely. Use the image-generation tool for every portrait and clinic scene. Do not use remote stock photography or Python-based image synthesis.

- [ ] **Step 2: Add staging exclusions**

Append to `.gitignore`:

```gitignore
# Local source generations; production derivatives live in public/photos/iris/
.artifacts/
```

Create `.artifacts/iris-source/` and `public/photos/iris/`.

- [ ] **Step 3: Generate the shared visual identity and hero poster**

Use this common art direction in every prompt:

```text
Photorealistic editorial photography for the same fictional modern dental clinic in Sofia. Warm ivory walls, muted teal details, pale oak, soft daylight, attainable contemporary interior, calm welcoming atmosphere, natural skin and hands, realistic dental environment, premium but not luxurious, no logos, no signs, no readable text, no patient records, no real brands. The people are entirely fictional and must not resemble public figures. Bulgarian/European casting, restrained warm color grade, documentary authenticity rather than glossy stock photography.
```

Generate `hero-poster.png` as a wide 16:9 composition: fictional lead dentist Elena, woman in her early forties with dark brown hair, speaking calmly with an adult patient in a bright treatment room; subjects placed mainly on the right and clean negative space on the left for Bulgarian hero copy; no active procedure and no visible private data.

Inspect at original detail. Reject malformed hands, teeth, tools, implausible anatomy, text, logos, or an overly staged stock-photo expression. Save the accepted output as `.artifacts/iris-source/hero-poster.png`.

- [ ] **Step 4: Generate four consistent portraits**

Generate one vertical 4:5 environmental portrait per doctor, using the common art direction and the exact character definitions:

```text
doctor-elena.png — fictional Bulgarian woman, early forties, dark brown hair, warm confident expression, lead dentist, ivory clinical jacket with a subtle muted-teal detail, standing in the clinic; editorial waist-up portrait.
doctor-nikola.png — fictional Bulgarian man, late thirties, short dark hair, calm serious expression, implantology and oral surgery, contemporary dark-teal clinical jacket, same clinic and lighting; editorial waist-up portrait.
doctor-mila.png — fictional Bulgarian woman, early thirties, light brown hair, open reassuring expression, pediatric dentist, soft ivory clinical jacket, same clinic and lighting; editorial waist-up portrait.
doctor-viktor.png — fictional Bulgarian man, early thirties, medium brown hair, approachable expression, preventive and orthodontic care, pale sage clinical jacket, same clinic and lighting; editorial waist-up portrait.
```

Inspect each at original detail and save accepted outputs under the matching `.artifacts/iris-source/*.png` path.

- [ ] **Step 5: Generate three coordinated clinic scenes**

Generate and inspect:

```text
clinic-reception.png — wide 3:2 establishing view of the same clinic reception and waiting area, warm daylight, pale oak desk, muted teal seating, a few plants, no people, no signage or text.
clinic-treatment-room.png — vertical 4:5 detail of the same clean treatment room, chair and equipment arranged realistically, warm daylight, no people, no logos, no text.
clinic-consultation.png — vertical 4:5 candid consultation in the same clinic, Elena and an adult patient seated at eye level discussing a generic blank tablet screen, no procedure, no records, no text.
```

Reject anything that visually belongs to a different clinic or introduces readable content.

- [ ] **Step 6: Add the deterministic image processor**

Create `scripts/process-images.mjs`:

```js
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('/Users/boyanbudakov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = resolve(new URL('..', import.meta.url).pathname);
const input = resolve(root, '.artifacts/iris-source');
const output = resolve(root, 'public/photos/iris');

const jobs = [
  ['hero-poster.png', 'hero-poster.webp', 2400, 1350, 'attention'],
  ['doctor-elena.png', 'doctor-elena.webp', 1200, 1500, 'attention'],
  ['doctor-nikola.png', 'doctor-nikola.webp', 1000, 1250, 'attention'],
  ['doctor-mila.png', 'doctor-mila.webp', 1000, 1250, 'attention'],
  ['doctor-viktor.png', 'doctor-viktor.webp', 1000, 1250, 'attention'],
  ['clinic-reception.png', 'clinic-reception.webp', 1800, 1200, 'attention'],
  ['clinic-treatment-room.png', 'clinic-treatment-room.webp', 1200, 1500, 'attention'],
  ['clinic-consultation.png', 'clinic-consultation.webp', 1200, 1500, 'attention'],
];

await mkdir(output, { recursive: true });

for (const [source, target, width, height, position] of jobs) {
  await sharp(resolve(input, source))
    .rotate()
    .resize({ width, height, fit: 'cover', position })
    .webp({ quality: 82, effort: 5 })
    .toFile(resolve(output, target));
  console.log(`created ${target} at ${width}x${height}`);
}
```

- [ ] **Step 7: Process and inspect all derivatives**

Run:

```bash
node scripts/process-images.mjs
```

Expected: eight `created ...` lines. Inspect every WebP with the local image viewer at original detail, especially crop integrity and team consistency. Regenerate individual sources rather than accepting conspicuous AI artifacts.

---

### Task 3: Define the Media, Team, and Map Data Contracts

**Files:**
- Modify: `src/config/clinic.ts`
- Modify: `/Users/boyanbudakov/Documents/autosilas-widget/configs/iris.json`
- Create: `public/media/README.md`

**Interfaces:**
- Produces: `Doctor`, `GalleryItem`, `clinic.doctors`, `clinic.media`, and `clinic.map`; later Astro components consume these exact names.
- Preserves: existing `clinic.services`, `clinic.reviews`, phone, hours, SEO, widget capture, webhook, theme, and guardrails.

- [ ] **Step 1: Add the website types**

Add after the `Review` interface:

```ts
export interface Doctor {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image: string;
  imageAlt: string;
  lead?: boolean;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  layout: 'wide' | 'portrait';
}
```

- [ ] **Step 2: Add the exact approved data inside `clinic`**

Add these properties before `services`:

```ts
  media: {
    hero: {
      posterSrc: '/photos/iris/hero-poster.webp',
      videoSrc: '',
      videoType: 'video/mp4',
    },
    serviceBackdrop: '/photos/iris/clinic-reception.webp',
  },

  doctors: [
    {
      name: 'д-р Елена Маринова',
      role: 'Водещ лекар',
      specialty: 'Естетична и възстановителна стоматология',
      bio: 'Съчетава внимателното изслушване с ясен план за естествен и устойчив резултат.',
      image: '/photos/iris/doctor-elena.webp',
      imageAlt: 'Измислен портрет на д-р Елена Маринова в демонстрационната клиника',
      lead: true,
    },
    {
      name: 'д-р Никола Георгиев',
      role: 'Лекар по дентална медицина',
      specialty: 'Имплантология и орална хирургия',
      bio: 'Обяснява всяка стъпка спокойно и поставя предвидимостта пред прибързаните решения.',
      image: '/photos/iris/doctor-nikola.webp',
      imageAlt: 'Измислен портрет на д-р Никола Георгиев в демонстрационната клиника',
    },
    {
      name: 'д-р Мила Петрова',
      role: 'Лекар по дентална медицина',
      specialty: 'Детска стоматология',
      bio: 'Помага на децата да опознаят кабинета постепенно, с търпение и чувство за сигурност.',
      image: '/photos/iris/doctor-mila.webp',
      imageAlt: 'Измислен портрет на д-р Мила Петрова в демонстрационната клиника',
    },
    {
      name: 'д-р Виктор Илиев',
      role: 'Лекар по дентална медицина',
      specialty: 'Профилактика и ортодонтска грижа',
      bio: 'Работи за навици и решения, които пациентите могат уверено да следват всеки ден.',
      image: '/photos/iris/doctor-viktor.webp',
      imageAlt: 'Измислен портрет на д-р Виктор Илиев в демонстрационната клиника',
    },
  ] satisfies Doctor[],

  gallery: [
    {
      src: '/photos/iris/clinic-reception.webp',
      alt: 'Измислена светла рецепция на демонстрационната клиника Ирис',
      caption: 'Светло посрещане и спокойна зона за изчакване.',
      layout: 'wide',
    },
    {
      src: '/photos/iris/clinic-treatment-room.webp',
      alt: 'Измислен модерен кабинет в демонстрационната клиника Ирис',
      caption: 'Подредена среда, която помага на пациента да се чувства сигурно.',
      layout: 'portrait',
    },
    {
      src: '/photos/iris/clinic-consultation.webp',
      alt: 'Измислена консултация между лекар и пациент в клиника Ирис',
      caption: 'Разговорът и ясното обяснение идват преди всяка следваща стъпка.',
      layout: 'portrait',
    },
  ] satisfies GalleryItem[],

  map: {
    latitude: 42.6718,
    longitude: 23.3094,
    label: 'Примерна локация · район Южен парк, София',
    embedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=23.2944%2C42.6628%2C23.3244%2C42.6808&layer=mapnik&marker=42.6718%2C23.3094',
    externalUrl: 'https://www.openstreetmap.org/?mlat=42.6718&mlon=23.3094#map=16/42.6718/23.3094',
  },
```

- [ ] **Step 3: Add the future-video contract**

Create `public/media/README.md`:

```markdown
# Iris hero video handoff

The final video is supplied separately by Boyan. When approved:

1. Save the optimized file as `public/media/iris-hero.mp4`.
2. Use H.264 MP4, muted visual content, 16:9 framing, 8–20 seconds, seamless loop, and no embedded text or audio.
3. Keep the file below 8 MB when practical.
4. Set `clinic.media.hero.videoSrc` to `/media/iris-hero.mp4`.

Until that file exists, `videoSrc` must remain an empty string and the hero renders only the poster.
```

- [ ] **Step 4: Synchronize widget facts without changing behavior**

In `configs/iris.json`, change `business.doctor` to:

```json
"д-р Елена Маринова — водещ лекар; демонстрационният екип включва още д-р Никола Георгиев, д-р Мила Петрова и д-р Виктор Илиев"
```

Append these exact `business.facts` entries:

```json
"Измисленият демонстрационен екип е: д-р Елена Маринова — естетична и възстановителна стоматология; д-р Никола Георгиев — имплантология и орална хирургия; д-р Мила Петрова — детска стоматология; д-р Виктор Илиев — профилактика и ортодонтска грижа.",
"Картата показва примерна точка около Южен парк в София и не обозначава реална клиника."
```

Do not alter any other widget field.

- [ ] **Step 5: Verify config syntax and widget compilation**

Run:

```bash
jq empty /Users/boyanbudakov/Documents/autosilas-widget/configs/iris.json
npm run typecheck
npm run build:widget
```

Run the npm commands from `/Users/boyanbudakov/Documents/autosilas-widget`. Expected: all exit `0`. Confirm `git diff -- configs/denta-heal.json` remains empty.

---

### Task 4: Build the Poster-First, Video-Ready Hero and Visual Services Layer

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Services.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `clinic.media.hero` and `clinic.media.serviceBackdrop` from Task 3.
- Produces: `[data-hero-video]` only when `videoSrc` is non-empty; otherwise a poster-only hero with identical layout.

- [ ] **Step 1: Replace hero media markup**

At the top of `Hero.astro`, add:

```ts
const { hero } = clinic.media;
```

Replace `.hero__bg` contents with:

```astro
<img
  class="hero__image"
  src={hero.posterSrc}
  alt=""
  width="2400"
  height="1350"
  fetchpriority="high"
/>
{
  hero.videoSrc && (
    <video
      class="hero__video"
      data-hero-video
      muted
      loop
      playsinline
      preload="metadata"
      poster={hero.posterSrc}
      aria-hidden="true"
    >
      <source src={hero.videoSrc} type={hero.videoType} />
    </video>
  )
}
<div class="hero__scrim"></div>
```

Add after the section:

```astro
<script>
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function syncHeroVideo() {
    if (!video) return;
    if (reducedMotion.matches) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    video.play().catch(() => {
      // The poster remains visible when autoplay is unavailable.
    });
  }

  syncHeroVideo();
  reducedMotion.addEventListener('change', syncHeroVideo);
</script>
```

- [ ] **Step 2: Add shared image/video sizing**

Replace the `.hero__image` rule with:

```css
  .hero__image,
  .hero__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .hero__video {
    z-index: 1;
  }
  .hero__scrim {
    z-index: 2;
  }
```

Keep the existing gradient values. Add to `global.css`:

```css
video {
  display: block;
  max-width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  [data-hero-video] {
    display: none;
  }
}
```

- [ ] **Step 3: Add restrained service background markup**

Change the services section opening tag to:

```astro
<section
  class="section services"
  id="services"
  style={`--services-backdrop: url('${clinic.media.serviceBackdrop}')`}
>
```

Add:

```css
  .services {
    position: relative;
    isolation: isolate;
    background: var(--bg);
  }
  .services::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(rgba(245, 242, 236, 0.9), rgba(245, 242, 236, 0.96)),
      var(--services-backdrop) center / cover;
  }
  .svc-card {
    background: color-mix(in srgb, var(--surface) 92%, transparent);
    backdrop-filter: blur(8px);
  }
  @media (max-width: 619px) {
    .services::before {
      background: linear-gradient(rgba(245, 242, 236, 0.96), rgba(245, 242, 236, 0.98)),
        var(--services-backdrop) center / cover;
    }
    .svc-card {
      backdrop-filter: none;
    }
  }
```

- [ ] **Step 4: Build-check the hero contract**

Run `npm run build`. Expected: one static page built and no request or markup for an empty video source. Confirm:

```bash
! rg '<video|src=""' dist/index.html
rg '/photos/iris/hero-poster.webp' dist/index.html
```

---

### Task 5: Replace the About Visual and Add the Complete Team

**Files:**
- Modify: `src/components/About.astro`
- Create: `src/components/Team.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `clinic.doctors`; `About` uses the record with `lead === true`, while `Team` renders the entire array.
- Produces: `#team`, the exact disclosure text `Измислен демонстрационен екип`, and responsive doctor cards.

- [ ] **Step 1: Make About data-driven and portrait-led**

Add in `About.astro` frontmatter:

```ts
const leadDoctor = clinic.doctors.find((doctor) => doctor.lead);
if (!leadDoctor) throw new Error('Iris requires one lead doctor');
```

Replace the current image with:

```astro
<figure class="about__visual reveal reveal-scale">
  <img
    class="about__photo"
    src={leadDoctor.image}
    alt={leadDoctor.imageAlt}
    width="1200"
    height="1500"
    loading="lazy"
  />
  <figcaption>
    <strong>{leadDoctor.name}</strong>
    <span>{leadDoctor.specialty}</span>
  </figcaption>
</figure>
```

Change the paragraph to use `{leadDoctor.name}` and add `{leadDoctor.bio}` as a separate paragraph. Replace the image CSS with:

```css
  .about__visual {
    position: relative;
    max-width: 520px;
  }
  .about__photo {
    width: 100%;
    aspect-ratio: 4 / 5;
    max-height: 620px;
    object-fit: cover;
    object-position: center top;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
  }
  .about__visual figcaption {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
    display: grid;
    gap: 0.1rem;
    padding: 0.9rem 1rem;
    border-radius: var(--radius-sm);
    background: rgba(255, 253, 248, 0.92);
    backdrop-filter: blur(10px);
  }
  .about__visual figcaption span {
    color: var(--ink-soft);
    font-size: 0.86rem;
  }
```

- [ ] **Step 2: Create `Team.astro`**

Use this complete structure:

```astro
---
import { clinic } from '../config/clinic';
---

<section class="section team" id="team" aria-labelledby="team-title">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow">Нашият екип</span>
      <h2 id="team-title">Четири гледни точки, една спокойна грижа</h2>
      <p>
        Измислен демонстрационен екип, който показва как реална клиника може ясно да представи
        хората, опита и направленията си.
      </p>
    </div>
    <div class="team__grid">
      {
        clinic.doctors.map((doctor) => (
          <article class:list={['team-card', 'reveal', { 'team-card--lead': doctor.lead }]}>
            <img src={doctor.image} alt={doctor.imageAlt} width="1000" height="1250" loading="lazy" />
            <div class="team-card__copy">
              <span>{doctor.role}</span>
              <h3>{doctor.name}</h3>
              <strong>{doctor.specialty}</strong>
              <p>{doctor.bio}</p>
            </div>
          </article>
        ))
      }
    </div>
  </div>
</section>

<style>
  .team { background: var(--bg); }
  .team__grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  .team-card { overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-sm); }
  .team-card img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; object-position: center top; }
  .team-card__copy { padding: 1.25rem; }
  .team-card__copy > span { color: var(--accent-deep); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
  .team-card h3 { margin-top: 0.45rem; font-size: 1.45rem; }
  .team-card strong { display: block; margin-top: 0.4rem; color: var(--ink-soft); font-size: 0.88rem; font-weight: 600; }
  .team-card p { margin-top: 0.8rem; color: var(--ink-soft); font-size: 0.92rem; }
  .team-card--lead { border-color: color-mix(in srgb, var(--accent) 38%, var(--line)); }
  @media (min-width: 620px) { .team__grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1080px) { .team__grid { grid-template-columns: repeat(4, 1fr); } }
</style>
```

- [ ] **Step 3: Insert the team in page order**

Import `Team` and render it directly after `<About />` in `src/pages/index.astro`.

- [ ] **Step 4: Verify the lead and team output**

Run `npm run build`. Expected: four doctor cards, one lead portrait, and the fictional-team disclosure in `dist/index.html`.

---

### Task 6: Add the Clinic Atmosphere Gallery

**Files:**
- Create: `src/components/ClinicGallery.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `clinic.gallery` with `layout: 'wide' | 'portrait'`.
- Produces: a three-item media grid that can later replace the wide image with a short video without changing surrounding layout.

- [ ] **Step 1: Create `ClinicGallery.astro`**

```astro
---
import { clinic } from '../config/clinic';
---

<section class="section clinic-gallery" aria-labelledby="clinic-gallery-title">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow">Вътре в Ирис</span>
      <h2 id="clinic-gallery-title">Пространство, създадено за спокойствие</h2>
      <p>Измислени изображения на една последователна демонстрационна клиника.</p>
    </div>
    <div class="clinic-gallery__grid">
      {
        clinic.gallery.map((item) => (
          <figure class:list={['clinic-gallery__item', 'reveal', 'reveal-scale', `clinic-gallery__item--${item.layout}`]}>
            <img src={item.src} alt={item.alt} width={item.layout === 'wide' ? 1800 : 1200} height={item.layout === 'wide' ? 1200 : 1500} loading="lazy" />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))
      }
    </div>
  </div>
</section>

<style>
  .clinic-gallery { background: var(--ink); color: #f2f1ec; }
  .clinic-gallery :global(.section-head h2), .clinic-gallery :global(.eyebrow) { color: #f2f1ec; }
  .clinic-gallery :global(.section-head p) { color: rgba(242, 241, 236, 0.72); }
  .clinic-gallery__grid { display: grid; gap: 1rem; }
  .clinic-gallery__item { position: relative; overflow: hidden; min-height: 330px; border-radius: var(--radius); }
  .clinic-gallery__item img { width: 100%; height: 100%; object-fit: cover; transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1); }
  .clinic-gallery__item:hover img { transform: scale(1.025); }
  .clinic-gallery__item figcaption { position: absolute; right: 0.9rem; bottom: 0.9rem; left: 0.9rem; padding: 0.8rem 0.9rem; border-radius: var(--radius-sm); background: rgba(23, 32, 29, 0.78); color: #fff; font-size: 0.9rem; backdrop-filter: blur(8px); }
  @media (min-width: 800px) {
    .clinic-gallery__grid { grid-template-columns: 1.35fr 0.8fr 0.8fr; }
    .clinic-gallery__item { min-height: 520px; }
  }
  @media (prefers-reduced-motion: reduce) { .clinic-gallery__item img { transition: none; } }
</style>
```

- [ ] **Step 2: Insert the gallery in page order**

Import `ClinicGallery` and render it directly after `<Team />`, before `<Reviews />`.

- [ ] **Step 3: Verify gallery semantics and loading**

Run `npm run build` and confirm three `<figure>` elements in the gallery, three useful alt strings, and `loading="lazy"` on all gallery images.

---

### Task 7: Replace the Pseudo-Map with a Real Illustrative Map

**Files:**
- Create: `src/components/ClinicMap.astro`
- Modify: `src/components/Contact.astro`

**Interfaces:**
- Consumes: `clinic.map.embedUrl`, `externalUrl`, and `label`.
- Produces: lazy OpenStreetMap iframe with title, visible fictional-location disclosure, and fallback link.

- [ ] **Step 1: Create `ClinicMap.astro`**

```astro
---
import { clinic } from '../config/clinic';
---

<figure class="clinic-map reveal reveal-scale">
  <iframe
    src={clinic.map.embedUrl}
    title="Карта с примерна локация на измислената клиника Ирис"
    loading="lazy"
    referrerpolicy="no-referrer"
  ></iframe>
  <figcaption>
    <strong>{clinic.map.label}</strong>
    <span>Маркерът е илюстративен и не обозначава реална клиника.</span>
    <a href={clinic.map.externalUrl} target="_blank" rel="noreferrer">Отворете примерната локация в OpenStreetMap ↗</a>
  </figcaption>
</figure>

<style>
  .clinic-map { position: relative; min-height: 420px; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow-md); }
  .clinic-map iframe { width: 100%; min-height: 420px; height: 100%; border: 0; filter: saturate(0.75) contrast(0.94); }
  .clinic-map figcaption { position: absolute; right: 1rem; bottom: 1rem; left: 1rem; display: grid; gap: 0.2rem; padding: 0.9rem 1rem; border-radius: var(--radius-sm); background: rgba(255, 253, 248, 0.94); backdrop-filter: blur(10px); }
  .clinic-map figcaption span { color: var(--ink-soft); font-size: 0.86rem; }
  .clinic-map figcaption a { margin-top: 0.35rem; color: var(--accent-deep); font-size: 0.86rem; font-weight: 600; }
  @media (max-width: 599px) { .clinic-map, .clinic-map iframe { min-height: 360px; } }
</style>
```

- [ ] **Step 2: Compose the map in Contact**

Import `ClinicMap` in `Contact.astro`. Replace the entire `.contact__map--demo` block with `<ClinicMap />`. Remove obsolete `.contact__map`, `.contact__map--demo`, and `.contact__pin` styles; keep the contact grid and copy.

Change the lead copy to:

```astro
<p class="contact__lead">
  Адресът, часовете и маркерът са измислени демонстрационни данни. Картата показва как реална
  клиника може да насочи пациента, но този сайт не приема записвания.
</p>
```

- [ ] **Step 3: Verify map safety**

Run `npm run build`. Confirm the built HTML contains `openstreetmap.org`, the iframe title, and `Маркерът е илюстративен`, while containing no Google Maps URL, `geo` property, real phone link, or real clinic claims.

---

### Task 8: Integrate, Document, and Reach Green State

**Files:**
- Modify: `README.md`
- No other planned file changes; diagnose any failed check before changing its owning component.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: `npm run check` green in the website repo and widget build/typecheck green without deployment.

- [ ] **Step 1: Document the redesign workflow**

Append to `README.md`:

```markdown
## Fictional visual assets

The doctors, clinic scenes, reviews, address and map marker are fictional demonstration content. Production image derivatives live in `public/photos/iris/`; local source generations stay in ignored `.artifacts/`.

The hero is poster-first. See `public/media/README.md` before adding Boyan's final video. An empty `clinic.media.hero.videoSrc` must emit no video request.

The map uses an illustrative OpenStreetMap point and must never be represented as a real clinic location or added to Dentist structured data.
```

- [ ] **Step 2: Run formatter-independent integrity checks**

Run:

```bash
git diff --check
npm run check
```

Expected: both pass and the validator prints `Iris validation passed.`

- [ ] **Step 3: Verify widget and source-repo isolation**

Run:

```bash
jq empty /Users/boyanbudakov/Documents/autosilas-widget/configs/iris.json
npm run typecheck
npm run build:widget
git diff -- configs/denta-heal.json
git -C /Users/boyanbudakov/Documents/clients/denta-heal status --short
git -C /Users/boyanbudakov/Documents/clients/denta-heal rev-parse HEAD
```

Expected: widget commands pass, both Denta Heal checks show no change, and its HEAD remains `9e9ba2b8489be3c85c06e5de6a21f66b4a7d0eba`.

- [ ] **Step 4: Review the complete uncommitted diff**

Run `git diff --stat`, `git diff -- src`, and widget `git diff -- configs/iris.json`. Confirm only approved files changed and no generated source files under `.artifacts/` appear in Git status.

---

### Task 9: Local Responsive, Accessibility, Motion, and Widget QA

**Files:**
- No planned source changes; fix only defects proven by this QA and rerun all checks.

**Interfaces:**
- Produces: local screenshot set and a written QA summary for Boyan's visual approval.

- [ ] **Step 1: Start isolated persistent processes**

Start `caffeinate -i -m`. Start `npm run preview -- --host localhost --port 8787` from the website repo; this exact origin is already allowed by the production Iris widget and avoids the known unrelated listener on 4326. Record both session IDs and do not kill any process that did not originate in this task.

- [ ] **Step 2: Verify the actual Iris document before screenshots**

Open `http://localhost:8787/` and assert the document title is `Дентална клиника Ирис — демонстрационен сайт на АвтоСилас`. Never accept screenshots until that assertion passes.

- [ ] **Step 3: Run viewport checks**

At 375×812, 768×1024, and 1440×1000 verify:

```js
({
  title: document.title,
  overflow: document.documentElement.scrollWidth > innerWidth,
  doctors: document.querySelectorAll('.team-card').length,
  galleryItems: document.querySelectorAll('.clinic-gallery__item').length,
  mapFrames: document.querySelectorAll('.clinic-map iframe').length,
  telLinks: document.querySelectorAll('a[href^="tel:"]').length,
  videoElements: document.querySelectorAll('[data-hero-video]').length,
  robots: document.querySelector('meta[name="robots"]')?.content,
})
```

Expected: correct title, `overflow: false`, doctors `4`, gallery `3`, map `1`, tel links `0`, video elements `0` while `videoSrc` is empty, and robots `noindex, nofollow`.

- [ ] **Step 4: Run accessibility and reduced-motion checks**

Inspect the accessibility tree and keyboard-tab order. Verify one H1, ordered H2 sections, useful portrait/gallery alt text, visible focus, iframe title, no doctor information hidden behind hover, and a functional skip link.

Emulate `prefers-reduced-motion: reduce`, reload, and assert `motion-pending` clears, all text has opacity `1`, gallery images do not animate, and a future video element would be hidden by CSS.

- [ ] **Step 5: Verify network and console health**

Confirm no console errors, no failed local image requests, no empty media request, no mixed content, and a successful OpenStreetMap iframe request or graceful visible fallback copy if it is blocked.

- [ ] **Step 6: Verify widget continuity**

Open the production Iris widget on the local page. Confirm the title `Дентална клиника Ирис`, subtitle `AI асистент · демонстрация`, fictional-clinic greeting, no phone action, and mobile full-screen behavior.

Then start the modified widget locally from `/Users/boyanbudakov/Documents/autosilas-widget` with:

```bash
npm run dev -- --port 8788
```

Use the existing local `.dev.vars` without printing or copying any secret. Test the updated facts:

```bash
curl -sS -H 'Origin: http://localhost:8787' \
  'http://127.0.0.1:8788/config?client=iris' | jq '.business.doctor, .business.facts'

curl -sS -H 'Origin: http://localhost:8787' \
  -H 'Content-Type: application/json' \
  --data '{"clientId":"iris","sessionId":"iris-redesign-local-qa","messages":[{"role":"user","content":"Кои лекари работят в Ирис и реална клиника ли е?"}]}' \
  'http://127.0.0.1:8788/chat' | jq -r '.reply'
```

Expected: all four fictional doctor names appear across config/answer, the answer says Iris is fictional, and it does not offer a real appointment or phone call. Do not deploy the Worker yet.

- [ ] **Step 7: Capture the required approval set**

Capture and visually inspect:

```text
/private/tmp/iris-redesign-mobile-375.png
/private/tmp/iris-redesign-tablet-768.png
/private/tmp/iris-redesign-desktop-1440.png
/private/tmp/iris-redesign-team.png
/private/tmp/iris-redesign-gallery.png
/private/tmp/iris-redesign-map.png
/private/tmp/iris-redesign-widget-open.png
```

Wait for motion to settle before every screenshot. Use full-page or clipped screenshots as appropriate, but never crop away disclosures that are part of the reviewed component.

- [ ] **Step 8: Stop for Boyan's visual approval**

Present the live local preview URL, QA results, and screenshots. Do not stage implementation changes, commit, push, deploy the Worker, deploy Pages, alter DNS, or delete the rollback deployment. This is the only user approval gate during local execution.

---

### Task 10: Publish Only After Explicit Visual Approval

**Files:**
- No new planned files; this task publishes the approved diff.

**Interfaces:**
- Consumes: Boyan's explicit approval of Task 9 screenshots.
- Produces: matching clean `main` branches in website/widget origins and a verified Pages production deployment.

- [ ] **Step 1: Re-run fresh verification after approval**

Run website `npm run check` and `git diff --check`; run widget `jq empty configs/iris.json`, `npm run typecheck`, and `npm run build:widget`. Reconfirm Denta Heal clean and unchanged.

- [ ] **Step 2: Commit and push widget facts**

Stage only `configs/iris.json`, verify the cached diff, commit with `Sync Iris fictional team facts`, and push `main`. Deploy the Worker with `npm run deploy`. Record the resulting Worker version. Do not stage any unrelated widget file.

- [ ] **Step 3: Live-test the updated widget**

Query `/config?client=iris` from the Pages origin and post a chat question `Кои лекари работят в Ирис и реална клиника ли е?`. Confirm the reply names the fictional team, states the clinic is fictional, and does not offer a real appointment or phone call.

- [ ] **Step 4: Commit and push the approved website**

Stage only the approved website files and production derivatives; never stage `.artifacts/`. Verify `git diff --cached --check`, commit with `Add Iris team and visual storytelling`, push `main`, and confirm `HEAD == origin/main`.

- [ ] **Step 5: Deploy the exact website commit**

Run:

```bash
npm run build
/Users/boyanbudakov/Documents/autosilas-widget/node_modules/.bin/wrangler pages deploy dist \
  --project-name iris-demo \
  --branch main \
  --commit-hash "$(git rev-parse HEAD)" \
  --commit-message "Add Iris team and visual storytelling"
```

Expected: production deployment succeeds for the exact website commit.

- [ ] **Step 6: Repeat live production QA**

At `https://iris-demo.pages.dev/`, repeat the 375 and 1440 viewport checks, console/network checks, no-residue/no-real-phone gates, map disclosure, team/gallery counts, widget chat, and screenshot comparison. Confirm HTTP 200, `noindex`, and no regression in the demo ribbon.

- [ ] **Step 7: Final repository and process cleanup**

Confirm website and widget repos are clean and match `origin/main`; Denta Heal remains clean at its original HEAD. Stop only the preview/browser/caffeinate processes started by the execution task. Report the Pages URL, both commits, Worker version, live checks, and the remaining manual hero-video handoff.
