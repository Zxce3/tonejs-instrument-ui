import { SvelteSet } from 'svelte/reactivity';
import { INSTRUMENTS, byId, type Instrument } from './instruments';
import { clamp, midiToName } from './music';

type ToneNS = typeof import('tone');
type Sampler = import('tone').Sampler;

/** GitHub as the CDN: jsDelivr serves the repo (fast, cached); raw.githubusercontent.com is the fallback. */
export const CDNS = [
  'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples',
  'https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples'
];

const KEY = 'tonejs-ui:v1';
const store = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
})();

async function fetchSample(id: string, note: string): Promise<ArrayBuffer> {
  let err: unknown;
  for (const base of CDNS) {
    try {
      const r = await fetch(`${base}/${id}/${note}.mp3`);
      if (r.ok) return await r.arrayBuffer();
      err = new Error(`${r.status} ${r.url}`);
    } catch (e) { err = e; }
  }
  throw err;
}

class Engine {
  // reactive state
  id = $state<string>(store.id ?? 'piano');
  status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
  progress = $state(0);
  error = $state('');
  octave = $state(3);
  velocity = $state(0.8);
  volume = $state<number>(store.volume ?? -6); // dB
  reverb = $state<number>(store.reverb ?? 0.2);
  release = $state(1);
  lite = $state<boolean>(store.lite ?? false);
  sustain = $state(false);
  muted = $state(false);
  unlocked = $state(false);
  last = $state<number | null>(null);
  active = new SvelteSet<number>();

  inst = $derived<Instrument>(byId(this.id));
  base = $derived((this.octave + 1) * 12);

  private tone?: ToneNS;
  private bus?: import('tone').Gain;
  private vol?: import('tone').Volume;
  private rev?: import('tone').Reverb;
  analyser?: import('tone').Analyser;
  private samplers = new Map<string, Sampler>();
  private holds = new Map<number, Set<string>>();
  private pending = new Set<number>(); // released while sustain pedal down
  private token = 0;

  constructor() {
    this.octave = this.inst.octave;
    this.release = this.inst.release;
  }

  persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ id: this.id, volume: this.volume, reverb: this.reverb, lite: this.lite }));
    } catch { /* storage unavailable */ }
  }

  private async init() {
    if (this.tone) return this.tone;
    const Tone = await import('tone');
    this.tone = Tone;
    this.bus = new Tone.Gain(1);
    this.rev = new Tone.Reverb({ decay: 3.2, preDelay: 0.01, wet: this.reverb });
    this.vol = new Tone.Volume(this.volume);
    this.analyser = new Tone.Analyser('waveform', 512);
    this.bus.connect(this.rev);
    this.rev.connect(this.vol);
    this.vol.connect(this.analyser);
    this.vol.toDestination();
    this.rev.generate();
    return Tone;
  }

  /** Must be called from a user gesture at least once. */
  async unlock() {
    if (this.unlocked) return;
    const Tone = await this.init();
    await Tone.start();
    this.unlocked = true;
  }

  async select(id: string) {
    const inst = byId(id);
    this.allOff();
    this.id = inst.id;
    this.octave = inst.octave;
    this.release = inst.release;
    this.persist();
    await this.load();
  }

  step(dir: 1 | -1) {
    const i = INSTRUMENTS.findIndex((x) => x.id === this.id);
    return this.select(INSTRUMENTS[(i + dir + INSTRUMENTS.length) % INSTRUMENTS.length].id);
  }

  async load() {
    const my = ++this.token;
    const inst = this.inst;
    const key = `${inst.id}:${this.lite}`;
    this.error = '';
    const cached = this.samplers.get(key);
    if (cached) { this.activate(cached); this.status = 'ready'; return; }
    this.status = 'loading';
    this.progress = 0;
    try {
      const Tone = await this.init();
      let notes = inst.samples;
      if (this.lite && notes.length > 8) notes = notes.filter((_, i) => i % 2 === 0 || i === notes.length - 1);
      let done = 0;
      const buffers: Record<string, import('tone').ToneAudioBuffer> = {};
      const queue = [...notes];
      const worker = async () => {
        for (let n = queue.shift(); n; n = queue.shift()) {
          const data = await fetchSample(inst.id, n);
          const audio = await Tone.getContext().rawContext.decodeAudioData(data);
          buffers[n.replace('s', '#')] = new Tone.ToneAudioBuffer(audio);
          if (my === this.token) this.progress = ++done / notes.length;
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      const sampler = new Tone.Sampler({ urls: buffers, release: inst.release });
      sampler.connect(this.bus!);
      this.samplers.set(key, sampler);
      if (my !== this.token) return;
      this.activate(sampler);
      this.status = 'ready';
    } catch (e) {
      if (my !== this.token) return;
      this.status = 'error';
      this.error = e instanceof Error ? e.message : String(e);
    }
  }

  private current?: Sampler;
  private activate(s: Sampler) {
    this.current = s;
    s.release = this.release;
  }

  setRelease(v: number) {
    this.release = v;
    if (this.current) this.current.release = v;
  }
  setVolume(db: number) {
    this.volume = db;
    if (this.vol) this.vol.volume.value = db;
    this.persist();
  }
  setReverb(w: number) {
    this.reverb = w;
    if (this.rev) this.rev.wet.value = w;
    this.persist();
  }
  resetEffects() {
    this.setVolume(-6);
    this.setReverb(0.2);
    this.setRelease(this.inst.release);
    this.setVelocity(0.8);
    if (this.muted) this.toggleMute();
  }
  toggleMute() {
    this.muted = !this.muted;
    if (this.vol) this.vol.mute = this.muted;
  }
  toggleLite() {
    this.lite = !this.lite;
    this.persist();
    return this.load();
  }
  shiftOctave(d: number) {
    this.octave = clamp(this.octave + d, Math.floor(this.inst.lo / 12) - 1, Math.floor(this.inst.hi / 12) - 1);
  }
  setVelocity(v: number) { this.velocity = clamp(Math.round(v * 10) / 10, 0.1, 1); }

  noteOn(midi: number, source = 'ui', vel = this.velocity) {
    if (midi < this.inst.lo || midi > this.inst.hi) return;
    const s = this.holds.get(midi) ?? new Set();
    this.holds.set(midi, s);
    if (s.has(source)) return;
    s.add(source);
    this.last = midi;
    this.active.add(midi);
    this.pending.delete(midi);
    if (this.status !== 'ready' || !this.current || !this.tone) return;
    if (s.size > 1) return;
    this.current.triggerRelease(midiToName(midi), this.tone.now());
    this.current.triggerAttack(midiToName(midi), this.tone.now() + 0.005, vel);
  }

  noteOff(midi: number, source = 'ui') {
    const s = this.holds.get(midi);
    if (!s || !s.delete(source) || s.size) return;
    this.holds.delete(midi);
    this.active.delete(midi);
    if (this.sustain) { this.pending.add(midi); this.active.add(midi); return; }
    this.current?.triggerRelease(midiToName(midi), this.tone?.now());
  }

  setSustain(on: boolean) {
    this.sustain = on;
    if (on) return;
    for (const m of this.pending) {
      this.active.delete(m);
      this.current?.triggerRelease(midiToName(m), this.tone?.now());
    }
    this.pending.clear();
  }

  allOff() {
    this.holds.clear();
    this.pending.clear();
    this.active.clear();
    this.current?.releaseAll();
  }
}

export const engine = new Engine();
