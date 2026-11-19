<script lang="ts">
  import { engine } from '$lib/engine.svelte';

  const btn = 'rounded-lg border border-line bg-panel px-2.5 py-1 text-sm hover:border-zinc-500 disabled:opacity-40';
</script>

{#snippet field(label: string, value: string, hint?: string)}
  <div class="flex items-baseline justify-between text-xs text-zinc-400">
    <span>{label} {#if hint}<kbd class="ml-1">{hint}</kbd>{/if}</span><span class="font-mono text-zinc-200">{value}</span>
  </div>
{/snippet}

<div class="grid gap-x-8 gap-y-4 rounded-2xl border border-line bg-panel/60 p-4 sm:grid-cols-2 xl:grid-cols-4">
  <div class="space-y-1.5">
    {@render field('Volume', `${engine.muted ? 'muted' : engine.volume.toFixed(0) + ' dB'}`, '− / =')}
    <input type="range" min="-40" max="6" step="1" value={engine.volume} oninput={(e) => engine.setVolume(+e.currentTarget.value)} class="w-full" aria-label="Volume" />
    <div class="flex gap-2"><button class={btn} onclick={() => engine.toggleMute()}>{engine.muted ? 'Unmute' : 'Mute'} <kbd>M</kbd></button></div>
  </div>

  <div class="space-y-1.5">
    {@render field('Reverb', `${Math.round(engine.reverb * 100)}%`, ', / .')}
    <input type="range" min="0" max="1" step="0.01" value={engine.reverb} oninput={(e) => engine.setReverb(+e.currentTarget.value)} class="w-full" aria-label="Reverb" />
    {@render field('Release', `${engine.release.toFixed(2)} s`, 'B / N')}
    <input type="range" min="0.05" max="4" step="0.05" value={engine.release} oninput={(e) => engine.setRelease(+e.currentTarget.value)} class="w-full" aria-label="Release" />
  </div>

  <div class="space-y-1.5">
    {@render field('Octave', `C${engine.octave}`, 'Z / X')}
    <div class="flex gap-2">
      <button class={btn} onclick={() => engine.shiftOctave(-1)} aria-label="Octave down">−</button>
      <button class={btn} onclick={() => engine.shiftOctave(1)} aria-label="Octave up">+</button>
    </div>
    {@render field('Velocity', engine.velocity.toFixed(1), 'C / V')}
    <input type="range" min="0.1" max="1" step="0.1" value={engine.velocity} oninput={(e) => engine.setVelocity(+e.currentTarget.value)} class="w-full" aria-label="Velocity" />
  </div>

  <div class="space-y-2">
    {@render field('Sustain pedal', engine.sustain ? 'on' : 'off', 'Space')}
    <button
      class="{btn} w-full {engine.sustain ? '!border-transparent text-black' : ''}"
      style={engine.sustain ? 'background:var(--accent)' : ''}
      onpointerdown={() => engine.setSustain(true)}
      onpointerup={() => engine.setSustain(false)}
      onpointerleave={() => engine.sustain && engine.setSustain(false)}
    >Hold to sustain</button>
    <button class="{btn} w-full" onclick={() => engine.resetEffects()}>Reset effects <kbd>⌫</kbd></button>
    <label class="flex cursor-pointer items-center justify-between gap-3 text-xs text-zinc-400">
      <span>Lite samples <kbd>I</kbd> <span class="text-zinc-500">(half the download)</span></span>
      <input type="checkbox" checked={engine.lite} onchange={() => engine.toggleLite()} class="size-4" style="accent-color:var(--accent)" />
    </label>
  </div>
</div>
