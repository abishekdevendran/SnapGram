<script lang="ts">
	import '../app.pcss';
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
</script>

<Toaster />
<nav class="flex w-full items-center">
	<Lightswitch/>
</nav>
<ModeWatcher></ModeWatcher>
<slot />
