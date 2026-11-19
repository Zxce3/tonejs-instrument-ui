<script lang="ts">
  import { engine } from '$lib/engine.svelte';

  let canvas: HTMLCanvasElement | undefined = $state();

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const dpr = devicePixelRatio || 1;
      const w = (canvas!.width = canvas!.clientWidth * dpr);
      const h = (canvas!.height = canvas!.clientHeight * dpr);
      ctx.clearRect(0, 0, w, h);
      const data = engine.analyser?.getValue() as Float32Array | undefined;
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeStyle = getComputedStyle(canvas!).getPropertyValue('--accent') || '#fff';
      ctx.beginPath();
      if (!data) { ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); }
      else data.forEach((v, i) => { const x = (i / (data.length - 1)) * w, y = h / 2 - v * h * 0.9; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  });
</script>

<canvas bind:this={canvas} class="h-14 w-full" aria-hidden="true"></canvas>
