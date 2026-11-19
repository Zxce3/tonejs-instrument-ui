<script lang="ts">
  import { engine } from '$lib/engine.svelte';
  import { isBlack, midiToName, OFFSET_LABEL } from '$lib/music';
  import { surface } from '$lib/surface';

  let { variant = 'keys' }: { variant?: 'keys' | 'bars' } = $props();

  const W = 46; // white key width (px)
  const BW = 30;
  const bars = $derived(variant === 'bars');

  const layout = $derived.by(() => {
    const { lo, hi } = engine.inst;
    let wi = 0;
    const keys: { midi: number; black: boolean; left: number; f: number }[] = [];
    for (let m = lo; m <= hi; m++) {
      const black = isBlack(m);
      const f = 1 - 0.5 * ((m - lo) / (hi - lo)); // bar length factor
      keys.push({ midi: m, black, left: black ? wi * W - BW / 2 : wi * W, f });
      if (!black) wi++;
    }
    return { keys, width: wi * W };
  });

  let scroller: HTMLElement | undefined = $state();
  $effect(() => {
    // keep the computer-keyboard window in view
    const start = engine.base;
    const k = layout.keys.find((x) => x.midi >= start && !x.black);
    if (scroller && k) scroller.scrollTo({ left: Math.max(0, k.left - 24), behavior: 'smooth' });
  });

  const within = (m: number) => m >= engine.base && m < engine.base + OFFSET_LABEL.length;
</script>

<div bind:this={scroller} class="scroll-thin overflow-x-auto overflow-y-hidden rounded-2xl border border-line bg-panel p-3 pb-4">
  <div
    class="surface relative mx-auto {bars ? 'h-72' : 'h-56 sm:h-64'}"
    style="width:{layout.width}px"
    use:surface={engine}
    role="group"
    aria-label={bars ? 'Bars' : 'Piano keyboard'}
  >
    {#each layout.keys as k (k.midi)}
      {@const on = engine.active.has(k.midi)}
      {@const label = within(k.midi) ? OFFSET_LABEL[k.midi - engine.base] : ''}
      {#if bars}
        <button
          tabindex="-1"
          data-midi={k.midi}
          data-vel="y"
          aria-label={midiToName(k.midi)}
          class="absolute top-1/2 flex -translate-y-1/2 flex-col items-center justify-end rounded-lg pb-2 text-[10px] font-medium transition-[transform,filter,box-shadow] duration-75
            {k.black ? 'z-10 bg-amber-950 text-amber-200/70' : 'bg-amber-800 text-amber-100/80'}
            {on ? 'scale-95 brightness-150' : 'hover:brightness-110'}"
          style="left:{k.left}px; width:{k.black ? BW : W - 4}px; height:{(k.black ? 0.62 : 1) * k.f * 100}%;
            {on ? `box-shadow:0 0 28px var(--accent); background:var(--accent); color:#000` : ''}"
        >
          {#if label}<kbd class="mb-1">{label}</kbd>{/if}
          {#if !k.black}{midiToName(k.midi)}{/if}
        </button>
      {:else}
        <button
          tabindex="-1"
          data-midi={k.midi}
          data-vel="y"
          aria-label={midiToName(k.midi)}
          class="absolute top-0 flex flex-col items-center justify-end rounded-b-lg pb-2 text-[10px] font-medium transition-[filter,transform] duration-75
            {k.black
            ? 'z-10 h-[62%] border border-black bg-linear-to-b from-zinc-800 to-black text-zinc-400'
            : 'h-full border border-zinc-400/60 bg-linear-to-b from-zinc-100 to-zinc-300 text-zinc-500'}
            {on ? 'brightness-90' : ''}"
          style="left:{k.left}px; width:{k.black ? BW : W}px;
            {on ? `background:var(--accent); color:#000; transform:translateY(2px)` : ''}"
        >
          {#if label}<kbd class="mb-1 !border-zinc-500/40 !bg-black/20 {k.black ? '!text-zinc-200' : '!text-zinc-700'}">{label}</kbd>{/if}
          {#if !k.black && k.midi % 12 === 0}{midiToName(k.midi)}{/if}
        </button>
      {/if}
    {/each}
  </div>
</div>
