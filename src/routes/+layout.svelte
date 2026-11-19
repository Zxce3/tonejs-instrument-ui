<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head><title>Tone Instruments</title></svelte:head>
{@render children()}
