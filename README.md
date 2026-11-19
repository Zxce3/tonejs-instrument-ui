# Tone Instruments

SvelteKit + Tailwind v4 UI for the [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) sample library.
Samples stream straight from GitHub via jsDelivr (fallback: raw.githubusercontent.com) — nothing is bundled.

```
npm i
npm run dev            # http://localhost:5173  (?i=harp deep-links an instrument)
npm run build          # static site in ./build (adapter-static)
npm run gen:instruments # re-scan the upstream repo → src/lib/data/manifest.json
```

Keyboard: `A S D F …` / `W E T Y …` play notes, `Z/X` octave, `C/V` velocity, `Space` sustain,
`↑/↓` or `[ ]` switch instrument, `1–0` / `⇧1–⇧0` jump to instrument 1–20, `−/=` volume, `,/.` reverb,
`B/N` release, `⌫` reset effects, `I` lite samples, `M` mute, `/` search, `?` help.
