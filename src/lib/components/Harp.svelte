<script lang="ts">
  import { engine } from '$lib/engine.svelte';
  import { isBlack, midiToName } from '$lib/music';
  import { surface } from '$lib/surface';

  const strings = $derived.by(() => {
    const { lo, hi } = engine.inst;
    const out: number[] = [];
    for (let m = lo; m <= hi; m++) if (!isBlack(m)) out.push(m);
    return out;
  });
  const n = $derived(strings.length);
  const heightOf = (i: number) => 100 - (i / (n - 1)) * 62;
</script>

<div class="scroll-thin overflow-x-auto rounded-2xl border border-line bg-panel p-3">
  <div class="surface relative mx-auto h-72 min-w-[48rem]" use:surface={engine} role="group" aria-label="Harp strings">
    <div class="absolute inset-x-0 bottom-0 h-3 rounded-full bg-linear-to-b from-amber-800 to-amber-950"></div>
    <svg class="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <line x1="0" y1={100 - heightOf(0)} x2="100" y2={100 - heightOf(n - 1)} stroke="oklch(0.5 0.08 70)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
    </svg>
    <div class="absolute inset-x-2 bottom-3 top-0 flex items-end justify-between">
      {#each strings as m, i (m)}
        {@const on = engine.active.has(m) || engine.active.has(m + 1)}
        <button
          tabindex="-1"
          data-midi={m}
          aria-label={midiToName(m)}
          class="group relative flex h-full flex-1 items-end justify-center"
        >
          <span
            class="block w-px transition-all duration-75 {on ? 'w-[3px]' : 'group-hover:w-0.5'}"
            style="height:{heightOf(i)}%; background:{on
              ? 'var(--accent)'
              : m % 12 === 0
                ? 'oklch(0.65 0.2 25)'
                : m % 12 === 5
                  ? 'oklch(0.55 0.1 250)'
                  : 'oklch(0.9 0.01 90)'}; {on ? 'box-shadow:0 0 14px var(--accent)' : ''}"
          ></span>
          {#if m % 12 === 0}
            <span class="pointer-events-none absolute -bottom-0.5 font-mono text-[9px] text-zinc-500">{midiToName(m)}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>
