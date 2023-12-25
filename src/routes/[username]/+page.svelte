<script lang="ts">
	import Profile from './Profile.svelte';
	let { data } = $props();
</script>

<main class="flex w-full flex-col items-center pt-6">
	<Profile {data} />
</main>
