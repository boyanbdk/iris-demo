# Iris Visual Storytelling Redesign

**Date:** 2026-07-16

**Status:** Approved design

**Project:** `/Users/boyanbudakov/Documents/clients/iris-demo`

## Goal

Evolve the fictional Iris clinic from a polished one-page template into a believable demonstration of a modern dental-clinic website. The redesign must make the clinic feel inhabited by a real team and grounded in a real place while continuing to state clearly that every person, review, metric, address, and location is fictional.

The visual direction is a cinematic/editorial hybrid: one immersive hero, strong portraits, a controlled clinic gallery, and quieter content sections. The page must not become a collage in which every surface competes for attention.

## Approved Principles

- Use AI-generated, clearly fictional people rather than identifiable real doctors or unrelated stock portraits.
- Generate one visually consistent clinic and team: shared wardrobe, lighting, color temperature, and architectural language.
- Reserve motion for the hero and one future clinic-atmosphere slot. Photography carries the rest of the page.
- Keep services, proof, reviews, and calls to action easy to scan.
- Preserve the demo ribbon, `noindex`, fictional-data disclosures, absence of a real phone or lead webhook, and the existing Iris AI assistant.
- A supplied hero video will be integrated later. This iteration makes the hero video-ready without inventing or generating the final video.

## Approaches Considered

### 1. Cinematic clinic

Full-bleed video and photographic backgrounds throughout the page. This is immersive, but it risks slow loading, poor text contrast, and a generic luxury-advertising feel.

### 2. Editorial clinic

Portraits, disciplined grids, white space, and minimal motion. This produces the strongest credibility and performance, but undersells the future hero video and the richer website capability AutoSilas wants to demonstrate.

### 3. Cinematic/editorial hybrid — selected

Use the cinematic treatment where it has the greatest impact—the hero and one atmosphere section—and use editorial portraits and grids for the doctors. This provides visual richness without losing clarity or speed.

## Page Architecture

The final page order is:

1. Demo disclosure ribbon and navigation.
2. Full-bleed, video-ready hero.
3. Compact proof/statistics strip.
4. Services section with restrained photographic depth.
5. Lead-doctor editorial profile.
6. Complete fictional team grid.
7. Clinic-atmosphere gallery with a future secondary-video slot.
8. Clearly fictional reviews.
9. Contact details and a real map view with an illustrative marker.
10. AutoSilas conversion band and footer.

This order moves from promise, to capability, to people, to place, to proof, and finally to conversion.

## Hero Media System

The hero remains full-height and full-bleed, with all headline, supporting copy, proof, and calls to action layered over the media.

The media interface has two states:

- **Current state:** an optimized poster image fills the hero.
- **Video state:** when Boyan supplies the final file, a muted, looping, `playsinline` video uses the same frame and copy without requiring a layout rewrite.

The hero configuration stores an optional video source and a required poster source. When the video source is empty, no empty or failing video request is emitted. When present, the video uses the poster while loading and falls back visually to that poster if playback fails.

The text-side gradient must maintain readable contrast across desktop and mobile. Under `prefers-reduced-motion: reduce`, autoplay is suppressed and the poster remains visible. The video is decorative and receives no misleading transcript or accessible label.

## Lead Doctor

The existing equipment/interior image is replaced with a fictional portrait of **д-р Елена Маринова**. The portrait is a warm, confident environmental portrait inside the same fictional clinic used throughout the generated imagery.

The section uses a compact editorial split:

- Portrait ratio near 4:5 rather than the current extended landscape treatment.
- A bounded desktop height so the image does not dominate the entire viewport.
- Name, role, concise philosophy, and four care principles beside the portrait.
- On mobile, the portrait appears above the copy and remains short enough that the section's message is visible without excessive scrolling.

## Fictional Team

The team contains four doctors:

1. **д-р Елена Маринова** — водещ лекар · естетична и възстановителна стоматология.
2. **д-р Никола Георгиев** — имплантология и орална хирургия.
3. **д-р Мила Петрова** — детска стоматология.
4. **д-р Виктор Илиев** — профилактика и ортодонтска грижа.

Each card includes a consistent AI-generated portrait, name, specialty, and one short human-centered sentence. The lead doctor is visually distinguished without making the other doctors appear secondary or unavailable.

Desktop uses a four-column editorial grid. Tablet uses two columns. Mobile uses one or two columns according to available width, with names and specialties always visible without hover. The section copy explicitly says the team is fictional and demonstrates how a real clinic's staff could be presented.

## Clinic Atmosphere

A new section titled **„Пространство, създадено за спокойствие“** adds environmental storytelling without filling every section with media.

It uses three coordinated assets:

- A wide establishing view of the reception or waiting area.
- A treatment-room detail with natural, non-clinical visual warmth.
- A calm doctor-patient consultation moment with no visible procedure or private medical information.

The wide item is designed to accept a future short secondary video, but it ships as an image in this iteration. Captions explain what each image demonstrates. Images never contain fabricated logos, readable patient records, or text generated inside the image.

## Services Visual Treatment

Services remain content-first. The redesign does not put a different busy photograph behind every card.

Instead:

- The section receives one low-contrast clinic image or texture across the background.
- Cards keep solid or translucent surfaces and strong text contrast.
- Two or three cards may use small image crops or visual accents only if they improve differentiation at desktop sizes.
- Mobile falls back to clean surfaces with no text placed directly over detailed imagery.

This demonstrates richer art direction while protecting scanability.

## Map and Fictional Location

The decorative pseudo-map is replaced by a real OpenStreetMap embed centered on an illustrative point in Sofia. The marker is labelled as a **примерна локация**, not a real clinic.

The existing fictional address remains visibly fictional. Coordinates are not added to Dentist structured data, because doing so would create a machine-readable claim that a real clinic exists at that point.

The map component includes:

- A lazy-loaded iframe with a meaningful title.
- A clear overlay or caption stating that the marker is illustrative.
- A normal OpenStreetMap link as a fallback when embedding is unavailable.
- A non-map visual fallback so the contact section remains complete if the third-party request is blocked.

No Google Business profile, review link, routing claim, or real clinic phone number is introduced.

## Asset Generation

The implementation produces a coordinated asset set rather than independent one-off portraits.

Portrait requirements:

- Bulgarian/European fictional clinicians with varied but plausible ages and appearances.
- Contemporary professional clothing; no visible real brand marks.
- Soft daylight, ivory and muted teal palette, warm editorial finish.
- Consistent fictional clinic background and lens language.
- Natural hands and dental details; reject visibly malformed outputs.
- No names, signs, logos, UI, charts, or other generated text inside images.

Clinic-scene requirements:

- The same architectural palette as the portraits.
- Modern but attainable clinic, not a luxury hotel or science-fiction facility.
- No identifiable patients, real documents, or invasive procedures.
- Empty-room scenes may be used where human anatomy or equipment quality is unreliable.

All accepted assets are stored locally in `public/photos/iris/`, given descriptive names, resized to their actual display needs, and compressed to modern web formats. Source generations are not shipped when substantially larger than the production derivative.

## Component and Data Boundaries

`src/config/clinic.ts` remains the single source of truth for fictional clinic content. It gains typed collections for doctors, media, and map presentation data.

Components have one responsibility each:

- `Hero.astro`: renders the poster/video media contract and hero content.
- `About.astro`: presents the lead doctor only.
- `Team.astro`: renders the complete doctor collection.
- `ClinicGallery.astro`: renders atmosphere media and captions.
- `Contact.astro`: presents fictional contact data and composes the map.
- `ClinicMap.astro`: owns the embed, illustrative marker disclosure, and fallback link.

No component embeds names, specialties, coordinates, or asset paths that belong in the configuration. The separate Iris widget configuration is synchronized with the fictional team and illustrative-location facts so its answers match the website. Its no-phone, no-webhook, demo disclosure, guardrails, and lead-capture behavior do not change.

## Failure and Fallback Behavior

- Missing hero video: render the poster only; do not show a broken player.
- Video playback failure: poster remains behind the video element.
- Reduced motion: poster-only hero.
- Missing optional gallery video: render its image equivalent.
- Map blocked or unavailable: preserve the caption, fictional address, and external OpenStreetMap fallback.
- Image loading failure: layout dimensions remain reserved and nearby text still explains the section.
- Widget failure: the website remains navigable and all demo disclosures remain visible.

## Performance and Accessibility

- Declare image width and height to prevent layout shifts.
- Use responsive source sizes and lazy loading outside the hero.
- Keep the hero poster prioritized; do not preload every portrait or gallery image.
- Ship no audio and no unmuted autoplay.
- Maintain readable contrast over all media at 375 px through wide desktop sizes.
- Give informative images concise Bulgarian alt text; decorative backgrounds use empty alt text or CSS.
- Preserve semantic headings, keyboard navigation, focus visibility, and the skip link.
- Do not make hover the only way to discover doctor information.

## Verification

Before visual approval:

1. Run the production build and `git diff --check`.
2. Confirm no Denta Heal names, contacts, assets, filenames, coordinates, or map links remain.
3. Confirm `noindex`, the demo ribbon, fictional review/team/map disclosures, and `data-client="iris"` in built HTML.
4. Verify responsive layouts at 375, 768, and 1440 px.
5. Verify reduced-motion behavior, keyboard navigation, heading structure, alt text, iframe title, and focus styles.
6. Verify no horizontal overflow, console errors, broken images, failed local asset requests, or cumulative layout shifts caused by media.
7. Open the Iris widget and confirm its demo greeting, fictional-clinic answer, and team answer match the redesigned website.
8. Capture desktop, mobile, team, gallery, map, and open-widget screenshots for Boyan.

Because generated people and visual density require subjective judgment, implementation stops for Boyan's visual approval before committing, pushing, or replacing the live Cloudflare Pages deployment.

After approval, rebuild from a clean state, commit, push `main`, deploy the exact commit to the existing `iris-demo` Pages project, and repeat the live checks at `https://iris-demo.pages.dev/`.

## Non-Goals

- Producing the final hero video.
- Adding real clinic contact information, patient intake, appointment persistence, analytics, or lead delivery.
- Creating Google Business or review profiles.
- Removing the demo disclosures or making the fictional clinic indexable.
- Rewriting the AutoSilas widget or the original Denta Heal repository.
- Adding individual doctor detail pages in this iteration.

## Rollback

The current live baseline is commit `88dbb1bc4de81343b4d60cda4afd235e88a854c5`. If the approved redesign causes a production regression, Cloudflare Pages can be redeployed from that commit's build while the new work is corrected locally.
