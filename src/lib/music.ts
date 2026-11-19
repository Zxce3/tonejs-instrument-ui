const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const IDX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const midiToName = (m: number) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
export const noteToMidi = (n: string) => {
  const m = n.match(/^([A-G])(#|s)?(-?\d+)$/)!;
  return (+m[3] + 1) * 12 + IDX[m[1]] + (m[2] ? 1 : 0);
};
export const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12);
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Computer-keyboard → semitone offset from the current base C. Uses KeyboardEvent.code so it works on any layout. */
export const KEY_OFFSETS: Record<string, number> = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7,
  KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14,
  KeyP: 15, Semicolon: 16, Quote: 17
};
export const KEY_LABELS: Record<string, string> = {
  KeyA: 'A', KeyW: 'W', KeyS: 'S', KeyE: 'E', KeyD: 'D', KeyF: 'F', KeyT: 'T', KeyG: 'G',
  KeyY: 'Y', KeyH: 'H', KeyU: 'U', KeyJ: 'J', KeyK: 'K', KeyO: 'O', KeyL: 'L',
  KeyP: 'P', Semicolon: ';', Quote: "'"
};
export const OFFSET_LABEL: string[] = [];
for (const [code, off] of Object.entries(KEY_OFFSETS)) OFFSET_LABEL[off] = KEY_LABELS[code];
