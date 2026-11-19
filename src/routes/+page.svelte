<script lang="ts">
  import Controls from '$lib/components/Controls.svelte';
  import Fretboard from '$lib/components/Fretboard.svelte';
  import Harp from '$lib/components/Harp.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import Scope from '$lib/components/Scope.svelte';
  import Shortcuts from '$lib/components/Shortcuts.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { engine } from '$lib/engine.svelte';
  import { ACCENT, INSTRUMENTS } from '$lib/instruments';
  import { KEY_OFFSETS, midiToName } from '$lib/music';
  import { onMount } from 'svelte';

  let query = $state('');
  let help = $state(false);
  const inst = $derived(engine.inst);
  const playing = $derived([...engine.active].sort((a, b) => a - b).map(midiToName));
  const REVERBS = [0, 0.2, 0.45, 0.75];

  onMount(() => {
    const id = new URLSearchParams(location.search).get('i');
    if (id && INSTRUMENTS.some((i) => i.id === id)) engine.select(id);
    else engine.load();
  });

  const down = new Map<string, number>(); // key code → midi that it started

  function typing(t: EventTarget | null) {
    const el = t as HTMLElement | null;
    return !!el && (el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'range' && (el as HTMLInputElement).type !== 'checkbox' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  function onkeydown(e: KeyboardEvent) {
    if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const c = e.code;
    if (c in KEY_OFFSETS) {
      e.preventDefault();
      if (e.repeat || down.has(c)) return;
      engine.unlock();
      const m = engine.base + KEY_OFFSETS[c];
      down.set(c, m);
      engine.noteOn(m, `key:${c}`);
      return;
    }
    if (c === 'Space') { e.preventDefault(); engine.unlock(); engine.setSustain(true); return; }
    if (e.repeat && c !== 'Minus' && c !== 'Equal') return;
    const digit = c.match(/^Digit(\d)$/);
    if (digit) { const i = (+digit[1] + 9) % 10; if (INSTRUMENTS[i]) engine.select(INSTRUMENTS[i].id); return; }
    switch (c) {
      case 'KeyZ': engine.shiftOctave(-1); break;
      case 'KeyX': engine.shiftOctave(1); break;
      case 'KeyC': engine.setVelocity(engine.velocity - 0.1); break;
      case 'KeyV': engine.setVelocity(engine.velocity + 0.1); break;
      case 'ArrowUp': case 'BracketLeft': e.preventDefault(); engine.step(-1); break;
      case 'ArrowDown': case 'BracketRight': e.preventDefault(); engine.step(1); break;
      case 'Minus': engine.setVolume(Math.max(-40, engine.volume - 2)); break;
      case 'Equal': engine.setVolume(Math.min(6, engine.volume + 2)); break;
      case 'KeyM': engine.toggleMute(); break;
      case 'KeyR': engine.setReverb(REVERBS[(REVERBS.findIndex((r) => r >= engine.reverb - 0.01) + 1) % REVERBS.length]); break;
      case 'Slash':
        e.preventDefault();
        if (e.shiftKey) help = !help;
        else document.getElementById('search')?.focus();
        break;
      case 'Escape': engine.allOff(); down.clear(); help = false; break;
    }
  }
  function onkeyup(e: KeyboardEvent) {
    if (e.code === 'Space') { e.preventDefault(); engine.setSustain(false); return; }
    const m = down.get(e.code);
    if (m === undefined) return;
    down.delete(e.code);
    engine.noteOff(m, `key:${e.code}`);
  }
  function release() { engine.allOff(); engine.setSustain(false); down.clear(); }
</script>

<svelte:window {onkeydown} {onkeyup} onblur={release} />

<div class="mx-auto flex min-h-dvh max-w-[96rem] flex-col gap-4 p-4 lg:grid lg:h-dvh lg:grid-cols-[16rem_1fr] lg:gap-6 lg:p-6" style="--accent:{ACCENT[inst.family]}">
  <aside class="flex min-h-0 flex-col gap-4">
    <div class="flex items-center gap-2.5 px-1">
      <div class="grid size-8 place-items-center rounded-lg text-black" style="background:var(--accent)" aria-hidden="true">♪</div>
      <div class="leading-tight">
        <div class="text-sm font-semibold">Tone Instruments</div>
        <div class="text-[11px] text-zinc-500">{INSTRUMENTS.length} instruments · GitHub CDN</div>
      </div>
      <button onclick={() => (help = true)} class="ml-auto rounded-lg border border-line px-2 py-1 text-xs text-zinc-400 hover:text-white" aria-label="Keyboard shortcuts"><kbd>?</kbd></button>
    </div>
    <Sidebar bind:query />
  </aside>

  <main class="flex min-h-0 min-w-0 flex-col gap-4 lg:overflow-y-auto lg:pr-1">
    <header class="relative overflow-hidden rounded-2xl border border-line bg-panel/60 p-5">
      <div class="pointer-events-none absolute inset-0 opacity-20" style="background:radial-gradient(60% 120% at 0% 0%, var(--accent), transparent 70%)"></div>
      <div class="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider" style="color:var(--accent)">{inst.family}</p>
          <h1 class="text-3xl font-semibold tracking-tight">{inst.label}</h1>
          <p class="mt-1 text-sm text-zinc-400">{inst.blurb} · {midiToName(inst.lo)} – {midiToName(inst.hi)}</p>
        </div>
        <div class="text-right" aria-live="off">
          <div class="h-10 font-mono text-3xl font-semibold" style="color:var(--accent)">{playing.length ? playing.join(' ') : engine.last !== null ? midiToName(engine.last) : '—'}</div>
          <div class="text-xs text-zinc-500">
            {#if engine.status === 'loading'}Loading samples {Math.round(engine.progress * 100)}%
            {:else if engine.status === 'error'}<span class="text-red-400">Failed: {engine.error}</span>
            {:else if !engine.unlocked}Press any key or tap to enable audio
            {:else}{inst.samples.length} samples ready{/if}
          </div>
        </div>
      </div>
      <div class="relative mt-3"><Scope /></div>
      <div class="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
        <div class="h-full transition-[width] duration-150" style="width:{engine.status === 'ready' ? 0 : engine.progress * 100}%; background:var(--accent)"></div>
      </div>
    </header>

    <section class="relative" aria-busy={engine.status === 'loading'}>
      <div class={engine.status === 'loading' ? 'opacity-50 saturate-50 transition' : 'transition'}>
        {#if inst.view === 'keys'}<Keyboard />
        {:else if inst.view === 'bars'}<Keyboard variant="bars" />
        {:else if inst.view === 'harp'}<Harp />
        {:else}<Fretboard />{/if}
      </div>
      <p class="mt-2 text-xs text-zinc-500">
        {#if inst.view === 'fretboard' || inst.view === 'bowed'}Click or drag across the strings. The computer keyboard plays the same pitches from <b>C{engine.octave}</b>.
        {:else}Click, tap, or drag (glissando). Computer keys play from <b>C{engine.octave}</b> — shown on the {inst.view === 'harp' ? 'strings' : 'keys'}.{/if}
      </p>
    </section>

    <Controls />
  </main>
</div>

<Shortcuts bind:open={help} />
