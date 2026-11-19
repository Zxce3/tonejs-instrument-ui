<script lang="ts">
  let { open = $bindable(false) }: { open: boolean } = $props();
  let dlg: HTMLDialogElement | undefined = $state();
  $effect(() => { if (!dlg) return; open && !dlg.open ? dlg.showModal() : !open && dlg.open && dlg.close(); });

  const rows: [string[], string][] = [
    [['A', 'S', 'D', 'F', '…'], 'Play white keys (home row)'],
    [['W', 'E', 'T', 'Y', 'U', '…'], 'Play black keys (row above)'],
    [['Z', 'X'], 'Octave down / up'],
    [['C', 'V'], 'Velocity down / up'],
    [['Space'], 'Hold sustain pedal'],
    [['↑', '↓'], 'Previous / next instrument'],
    [['[', ']'], 'Previous / next instrument'],
    [['1', '…', '0'], 'Jump to instrument 1–10'],
    [['−', '='], 'Volume down / up'],
    [['R'], 'Cycle reverb'],
    [['M'], 'Mute'],
    [['/'], 'Search instruments'],
    [['Esc'], 'Release all notes'],
    [['?'], 'Toggle this help']
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
