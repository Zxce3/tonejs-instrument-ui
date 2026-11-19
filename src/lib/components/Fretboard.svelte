<script lang="ts">
  import { engine } from '$lib/engine.svelte';
  import { midiToName, OFFSET_LABEL } from '$lib/music';
  import { surface } from '$lib/surface';

  const inst = $derived(engine.inst);
  const bowed = $derived(inst.view === 'bowed');
  const tuning = $derived(inst.tuning ?? []);
  const frets = $derived(inst.frets ?? 12);
  const strings = $derived([...tuning].reverse()); // high string on top
  const inlays = [3, 5, 7, 9, 15];
  const doubles = [12];
  const cols = $derived(`3.25rem repeat(${frets}, minmax(3.6rem, 1fr))`);
</script>

<div class="scroll-thin overflow-x-auto rounded-2xl border border-line bg-panel p-3">
  <div class="surface min-w-[56rem]" use:surface={engine} role="group" aria-label={bowed ? 'Fingerboard' : 'Fretboard'}>
    <div
      class="relative grid rounded-xl border border-black/50 shadow-inner
        {bowed ? 'bg-linear-to-b from-zinc-950 to-neutral-900' : 'bg-linear-to-b from-amber-950 to-stone-900'}"
      style="grid-template-columns:{cols}"
    >
      {#each strings as open, si}
        {@const thick = (si + (tuning.length === 4 ? 2 : 0)) * 0.6 + 1.2}
        {#each Array(frets + 1) as _, f}
          {@const m = open + f}
          {@const on = engine.active.has(m)}
          <button
            tabindex="-1"
            data-midi={m}
            aria-label={midiToName(m)}
            class="group relative flex h-11 items-center justify-center
              {f === 0 ? 'rounded-l-xl border-r-[5px] border-zinc-300/80 bg-black/30' : !bowed ? 'border-r-2 border-zinc-500/50' : 'border-r border-white/5'}"
          >
            <span class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-linear-to-b from-zinc-200 to-zinc-500" style="height:{thick}px; opacity:{on ? 1 : 0.75}"></span>
            <span
              class="pointer-events-none relative z-10 grid h-7 min-w-7 place-items-center rounded-full px-1 text-[11px] font-semibold transition-all duration-75
                {on ? 'scale-110 text-black' : 'scale-75 bg-black/50 text-zinc-300 opacity-0 group-hover:scale-100 group-hover:opacity-100'}"
              style={on ? 'background:var(--accent); box-shadow:0 0 18px var(--accent)' : ''}
            >{midiToName(m).replace(/\d+/, '')}</span>
          </button>
        {/each}
      {/each}
      {#if !bowed}
        {#each inlays as n}
          <span class="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"
            style="left:calc(3.25rem + (100% - 3.25rem) * {n - 0.5} / {frets})"></span>
        {/each}
        {#each doubles as n}
          {#each [-1, 1] as s}
            <span class="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"
              style="left:calc(3.25rem + (100% - 3.25rem) * {n - 0.5} / {frets}); top:calc(50% + {s * 1.6}rem)"></span>
          {/each}
        {/each}
      {/if}
    </div>
    <div class="mt-2 grid text-center font-mono text-[10px] text-zinc-500" style="grid-template-columns:{cols}">
      <span>open</span>
      {#each Array(frets) as _, f}<span>{bowed ? `pos ${f + 1}` : f + 1}</span>{/each}
    </div>
  </div>
</div>
