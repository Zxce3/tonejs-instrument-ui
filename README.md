# Tone Instruments

SvelteKit + Tailwind v4 UI for the [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) sample library.
Samples stream straight from GitHub via jsDelivr (fallback: raw.githubusercontent.com) — nothing is bundled.

```
npm i
npm run dev            # http://localhost:5173  (?i=harp deep-links an instrument)
npm run build          # static site in ./build (adapter-static)
npm run gen:instruments # re-scan the upstream repo → src/lib/data/manifest.json
```

Keyboard: the whole keyboard plays notes in two piano rows (lower `Z S X D C V G B H N J M , L . ; /`,
upper `Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P [ = ]`, one octave higher). `←/→` octave, `Space` sustain, `Esc` release all, `F1` help.
