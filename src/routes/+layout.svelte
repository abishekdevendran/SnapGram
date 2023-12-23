<script lang="ts">
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
</script>

<Toaster />
<nav class="flex h-full w-16 items-center justify-center">
	<Lightswitch />
</nav>
<slot />
<ModeWatcher></ModeWatcher>
