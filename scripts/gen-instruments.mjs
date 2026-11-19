// Builds src/lib/data/manifest.json: { instrument: ["A#1","C2",...] } from the upstream repo tree.
import { writeFileSync } from 'node:fs';
const url = 'https://api.github.com/repos/nbrosowsky/tonejs-instruments/git/trees/master?recursive=1';
const tree = (await (await fetch(url)).json()).tree;
const idx = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => (+n.slice(-1) + 1) * 12 + idx[n[0]] + (n[1] === 's' ? 1 : 0);
const out = {};
for (const f of tree) {
  const m = f.path.match(/^samples\/([^/]+)\/([A-G]s?\d)\.mp3$/);
  if (m) (out[m[1]] ??= []).push(m[2]);
}
for (const k in out) out[k].sort((a, b) => midi(a) - midi(b));
writeFileSync('src/lib/data/manifest.json', JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}:${v.length}`).join(' '));
