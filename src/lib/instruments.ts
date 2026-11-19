import manifest from './data/manifest.json';
import { noteToMidi } from './music';

export type View = 'keys' | 'bars' | 'harp' | 'fretboard' | 'bowed';
export type Family = 'Keys' | 'Strings' | 'Guitars & Bass' | 'Woodwinds' | 'Brass' | 'Percussion';

export interface Instrument {
  id: string;
  label: string;
  family: Family;
  view: View;
  blurb: string;
  lo: number; // lowest playable MIDI note
  hi: number;
  octave: number; // default base octave for the computer keyboard
  release: number; // default release (s)
  tuning?: number[]; // open-string MIDI, low → high
  frets?: number;
  samples: string[]; // sample note names ("A#1")
}

export const ACCENT: Record<Family, string> = {
  Keys: 'oklch(0.78 0.13 250)',
  Strings: 'oklch(0.76 0.16 15)',
  'Guitars & Bass': 'oklch(0.78 0.16 55)',
  Woodwinds: 'oklch(0.8 0.14 165)',
  Brass: 'oklch(0.85 0.15 92)',
  Percussion: 'oklch(0.76 0.17 325)'
};

type Def = Omit<Instrument, 'samples' | 'id'>;
const defs: Record<string, Def> = {
  piano: { label: 'Piano', family: 'Keys', view: 'keys', blurb: 'Concert grand, 88 keys', lo: 21, hi: 108, octave: 3, release: 1 },
  organ: { label: 'Organ', family: 'Keys', view: 'keys', blurb: 'Pipe organ, sustained and full', lo: 24, hi: 96, octave: 3, release: 0.4 },
  harmonium: { label: 'Harmonium', family: 'Keys', view: 'keys', blurb: 'Reed organ with a warm drone', lo: 36, hi: 84, octave: 3, release: 0.5 },
  violin: { label: 'Violin', family: 'Strings', view: 'bowed', blurb: 'Bowed', lo: 55, hi: 100, octave: 4, release: 0.6, tuning: [55, 62, 69, 76], frets: 12 },
  cello: { label: 'Cello', family: 'Strings', view: 'bowed', blurb: 'Bowed', lo: 36, hi: 81, octave: 3, release: 0.8, tuning: [36, 43, 50, 57], frets: 12 },
  contrabass: { label: 'Contrabass', family: 'Strings', view: 'bowed', blurb: 'Bowed', lo: 28, hi: 67, octave: 2, release: 0.9, tuning: [28, 33, 38, 43], frets: 12 },
  harp: { label: 'Harp', family: 'Strings', view: 'harp', blurb: 'Concert harp — glide across the strings', lo: 24, hi: 103, octave: 3, release: 1.6 },
  'guitar-acoustic': { label: 'Acoustic Guitar', family: 'Guitars & Bass', view: 'fretboard', blurb: 'Steel string, standard tuning', lo: 40, hi: 88, octave: 3, release: 0.8, tuning: [40, 45, 50, 55, 59, 64], frets: 15 },
  'guitar-electric': { label: 'Electric Guitar', family: 'Guitars & Bass', view: 'fretboard', blurb: 'Clean tone, standard tuning', lo: 40, hi: 88, octave: 3, release: 0.7, tuning: [40, 45, 50, 55, 59, 64], frets: 15 },
  'guitar-nylon': { label: 'Nylon Guitar', family: 'Guitars & Bass', view: 'fretboard', blurb: 'Classical, soft and round', lo: 40, hi: 88, octave: 3, release: 0.8, tuning: [40, 45, 50, 55, 59, 64], frets: 15 },
  'bass-electric': { label: 'Electric Bass', family: 'Guitars & Bass', view: 'fretboard', blurb: '4-string', lo: 28, hi: 67, octave: 2, release: 0.5, tuning: [28, 33, 38, 43], frets: 15 },
  flute: { label: 'Flute', family: 'Woodwinds', view: 'keys', blurb: 'Airy and bright', lo: 60, hi: 96, octave: 4, release: 0.3 },
  clarinet: { label: 'Clarinet', family: 'Woodwinds', view: 'keys', blurb: 'Dark chalumeau to bright clarino', lo: 50, hi: 91, octave: 4, release: 0.3 },
  bassoon: { label: 'Bassoon', family: 'Woodwinds', view: 'keys', blurb: 'Low, reedy, a little comic', lo: 34, hi: 75, octave: 3, release: 0.3 },
  saxophone: { label: 'Saxophone', family: 'Woodwinds', view: 'keys', blurb: 'Warm, breathy, expressive', lo: 49, hi: 81, octave: 3, release: 0.35 },
  trumpet: { label: 'Trumpet', family: 'Brass', view: 'keys', blurb: 'Bright and brassy', lo: 54, hi: 84, octave: 4, release: 0.25 },
  trombone: { label: 'Trombone', family: 'Brass', view: 'keys', blurb: 'Slide brass, big and round', lo: 34, hi: 72, octave: 3, release: 0.3 },
  'french-horn': { label: 'French Horn', family: 'Brass', view: 'keys', blurb: 'Mellow, heroic', lo: 33, hi: 77, octave: 3, release: 0.4 },
  tuba: { label: 'Tuba', family: 'Brass', view: 'keys', blurb: 'The bottom of the orchestra', lo: 29, hi: 62, octave: 2, release: 0.4 },
  xylophone: { label: 'Xylophone', family: 'Percussion', view: 'bars', blurb: 'Wooden bars', lo: 67, hi: 108, octave: 5, release: 0.4 }
};

export const INSTRUMENTS: Instrument[] = Object.entries(defs).map(([id, d]) => ({
  id,
  ...d,
  samples: (manifest as Record<string, string[]>)[id]
}));

export const FAMILIES = [...new Set(INSTRUMENTS.map((i) => i.family))] as Family[];
export const byId = (id: string) => INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0];
export const sampleMidi = (i: Instrument) => i.samples.map(noteToMidi);
