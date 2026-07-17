# Дентална клиника Ирис

Fictional Bulgarian clinic demonstration built by AutoSilas. All clinic names,
people, contact details, ratings and reviews are invented. The site is intentionally
`noindex` and does not accept real appointments or patient information.

## Local development

```sh
npm install
npm run dev
```

The local site runs at `http://localhost:4326`. Production is built with
`npm run build` and deployed to Cloudflare Pages.

## Fictional visual assets

The doctors, clinic scenes, reviews, address and map marker are fictional demonstration content. Production image derivatives live in `public/photos/iris/`; local source generations stay in ignored `.artifacts/`.

The hero uses Boyan's optimized, silent video with the existing poster as its loading,
autoplay-failure, and reduced-motion fallback. Processing details live in
`public/media/README.md`.

The map uses an illustrative OpenStreetMap point and must never be represented as a real clinic location or added to Dentist structured data.
