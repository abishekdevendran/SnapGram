<script lang="ts">
	import Profile from '$lib/components/Profile.svelte';
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	let { data } = $props();
</script>

<nav class="flex h-full w-1/3 items-center justify-center">
	<Lightswitch />
</nav>
<main class="min-w-96">
	
</main>
<Profile bind:user={data.user} />
