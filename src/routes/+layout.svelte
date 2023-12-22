<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
</script>

<Toaster />
<slot />
<ModeWatcher></ModeWatcher>
