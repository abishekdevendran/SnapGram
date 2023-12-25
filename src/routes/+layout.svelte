<script lang="ts">
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
	import { ProgressBar } from "@prgm/sveltekit-progress-bar";
</script>

<Toaster />
<ProgressBar class="text-primary" />
<nav class="flex h-[100svh] w-16 items-center justify-center sticky top-0">
	<Lightswitch />
</nav>
<slot />
<ModeWatcher></ModeWatcher>
