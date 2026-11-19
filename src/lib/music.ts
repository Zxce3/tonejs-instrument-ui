const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const IDX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const midiToName = (m: number) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
export const noteToMidi = (n: string) => {
  const m = n.match(/^([A-G])(#|s)?(-?\d+)$/)!;
  return (+m[3] + 1) * 12 + IDX[m[1]] + (m[2] ? 1 : 0);
};
export const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12);
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Tracker-style layout on KeyboardEvent.code (works on any layout), two piano rows:
 *   lower: Z S X D C V G B H N J M , L . ; /   → base + 0 …
 *   upper: Q 2 W 3 E R 5 T 6 Y 7 U I 9 O 0 P [ = ] → base + 12 …
 */
const LOWER = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'Comma', 'KeyL', 'Period', 'Semicolon', 'Slash'];
const UPPER = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
const LABEL: Record<string, string> = { Comma: ',', Period: '.', Semicolon: ';', Slash: '/', BracketLeft: '[', BracketRight: ']', Equal: '=' };
const label = (c: string) => LABEL[c] ?? c.replace(/^(Key|Digit)/, '');

export const KEY_OFFSETS: Record<string, number> = {};
LOWER.forEach((c, i) => (KEY_OFFSETS[c] = i));
UPPER.forEach((c, i) => (KEY_OFFSETS[c] = 12 + i));

/** What to print on a piano key for each offset (upper row wins where the rows overlap). */
export const OFFSET_LABEL: string[] = [];
LOWER.forEach((c, i) => (OFFSET_LABEL[i] = label(c)));
UPPER.forEach((c, i) => (OFFSET_LABEL[12 + i] = label(c)));
