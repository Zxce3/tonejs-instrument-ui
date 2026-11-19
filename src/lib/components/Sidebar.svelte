<script lang="ts">
  import { engine } from '$lib/engine.svelte';
  import { ACCENT, FAMILIES, INSTRUMENTS } from '$lib/instruments';

  let { query = $bindable('') }: { query: string } = $props();
  const q = $derived(query.trim().toLowerCase());
  const groups = $derived(
    FAMILIES.map((f) => ({
      family: f,
      items: INSTRUMENTS.filter((i) => i.family === f && (!q || i.label.toLowerCase().includes(q) || f.toLowerCase().includes(q)))
    })).filter((g) => g.items.length)
  );
</script>

<nav aria-label="Instruments" class="flex min-h-0 flex-col gap-3">
  <label class="relative block">
    <span class="sr-only">Search instruments</span>
    <input
      id="search"
      bind:value={query}
      placeholder="Search instruments"
      class="w-full rounded-xl border border-line bg-panel px-3 py-2 pr-3 text-sm placeholder:text-zinc-500"
      onkeydown={(e) => e.key === 'Escape' && ((e.currentTarget as HTMLInputElement).blur(), (query = ''))}
    />
  </label>

  <div class="scroll-thin flex min-h-0 gap-4 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
    {#each groups as g (g.family)}
      <section class="flex shrink-0 gap-1.5 lg:flex-col">
        <h2 class="hidden px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 lg:block">{g.family}</h2>
        {#each g.items as i (i.id)}
          {@const sel = engine.id === i.id}
          <button
            onclick={() => engine.select(i.id)}
            aria-current={sel}
            class="flex items-center gap-2.5 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-sm transition
              {sel ? 'border-transparent text-black' : 'border-line bg-panel/60 text-zinc-300 hover:border-zinc-600 hover:bg-panel'}"
            style={sel ? `background:${ACCENT[i.family]}` : ''}
          >
            <span class="size-2 shrink-0 rounded-full" style="background:{sel ? '#000' : ACCENT[i.family]}"></span>
            <span class="flex-1 font-medium">{i.label}</span>
          </button>
        {/each}
      </section>
    {:else}
      <p class="px-2 text-sm text-zinc-500">No match.</p>
    {/each}
  </div>
</nav>
