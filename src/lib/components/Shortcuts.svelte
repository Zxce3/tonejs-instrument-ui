<script lang="ts">
  let { open = $bindable(false) }: { open: boolean } = $props();
  let dlg: HTMLDialogElement | undefined = $state();
  $effect(() => { if (!dlg) return; open && !dlg.open ? dlg.showModal() : !open && dlg.open && dlg.close(); });

  const upper = ['Q', '2', 'W', '3', 'E', 'R', '5', 'T', '6', 'Y', '7', 'U', 'I', '9', 'O', '0', 'P', '[', '=', ']'];
  const lower = ['Z', 'S', 'X', 'D', 'C', 'V', 'G', 'B', 'H', 'N', 'J', 'M', ',', 'L', '.', ';', '/'];
  const black = new Set(['S', 'D', 'G', 'H', 'J', 'L', '2', '3', '5', '6', '7', '9', '0', '=']);
  const rows: [string[], string][] = [
    [['←', '→'], 'Octave down / up'],
    [['Space'], 'Hold sustain pedal'],
    [['Esc'], 'Release all notes'],
    [['F1'], 'Toggle this help']
  ];
</script>

<dialog
  bind:this={dlg}
  onclose={() => (open = false)}
  onclick={(e) => e.target === dlg && (open = false)}
  class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-panel p-0 text-zinc-100 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
>
  <div class="p-5">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold">Keyboard shortcuts</h2>
      <button onclick={() => (open = false)} class="rounded-lg px-2 text-zinc-400 hover:text-white" aria-label="Close">✕</button>
    </div>
    <p class="mb-3 text-sm text-zinc-400">Every letter, number and punctuation key plays a note — two piano rows. The lower row starts at the highlighted C; the upper row is one octave higher.</p>
    <div class="mb-4 space-y-1.5 overflow-x-auto font-mono">
      {#each [['Upper row', upper], ['Lower row', lower]] as [name, keys]}
        <div class="flex items-center gap-1" aria-label={name as string}>
          {#each keys as k}<kbd class="min-w-6 text-center {black.has(k) ? '!bg-black !text-zinc-300' : '!bg-zinc-200 !text-zinc-800'}">{k}</kbd>{/each}
        </div>
      {/each}
    </div>
    <ul class="divide-y divide-line">
      {#each rows as [keys, desc]}
        <li class="flex items-center justify-between gap-4 py-2 text-sm">
          <span class="text-zinc-300">{desc}</span>
          <span class="flex shrink-0 gap-1">{#each keys as k}<kbd>{k}</kbd>{/each}</span>
        </li>
      {/each}
    </ul>
  </div>
</dialog>
