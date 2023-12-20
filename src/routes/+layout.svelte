<script lang="ts">
	import '../app.pcss';
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	import { ModeWatcher } from 'mode-watcher';
</script>

<nav class="flex w-full items-center">
	<Lightswitch></Lightswitch>
</nav>
<ModeWatcher></ModeWatcher>
<slot />
