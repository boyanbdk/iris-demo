# Iris hero video

The active hero video lives at `public/media/iris-hero.mp4` and is configured through
`clinic.media.hero.videoSrc`.

The supplied 16:9 source contained a moving corner watermark. The web derivative uses
a centered 1920×720 cinematic crop that removes every watermark position without a blur
or artificial patch. It is H.264, has no audio track, keeps fast-start metadata at the
front of the file, and remains below the 8 MB delivery budget.

Keep `hero-poster.webp` as the loading, autoplay-failure, and reduced-motion fallback.
