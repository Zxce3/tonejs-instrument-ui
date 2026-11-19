import type { engine as Engine } from './engine.svelte';

/**
 * Pointer "playing surface": press / drag (glissando) across any child carrying `data-midi`.
 * `data-vel="y"` derives velocity from where on the element you hit (low = louder).
 */
export function surface(node: HTMLElement, engine: typeof Engine) {
  const down = new Map<number, number>(); // pointerId → midi (-1 when off any key)
  const pick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-midi]');
    return el && node.contains(el) ? el : null;
  };
  const velOf = (el: HTMLElement, e: PointerEvent) => {
    if (el.dataset.vel !== 'y') return engine.velocity;
    const r = el.getBoundingClientRect();
    return 0.35 + 0.65 * Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  };
  const src = (id: number) => `ptr${id}`;

  function start(e: PointerEvent) {
    engine.unlock();
    const el = pick(e.clientX, e.clientY);
    if (!el) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    const m = +el.dataset.midi!;
    down.set(e.pointerId, m);
    engine.noteOn(m, src(e.pointerId), velOf(el, e));
  }
  function move(e: PointerEvent) {
    const prev = down.get(e.pointerId);
    if (prev === undefined) return;
    const el = pick(e.clientX, e.clientY);
    const m = el ? +el.dataset.midi! : -1;
    if (m === prev) return;
    if (prev >= 0) engine.noteOff(prev, src(e.pointerId));
    down.set(e.pointerId, m);
    if (el) engine.noteOn(m, src(e.pointerId), velOf(el, e));
  }
  function end(e: PointerEvent) {
    const prev = down.get(e.pointerId);
    if (prev === undefined) return;
    if (prev >= 0) engine.noteOff(prev, src(e.pointerId));
    down.delete(e.pointerId);
  }
  node.addEventListener('pointerdown', start);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  return {
    destroy() {
      node.removeEventListener('pointerdown', start);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    }
  };
}
