<script lang="ts">
	import Profile from './Profile.svelte';
	let { data } = $props();
</script>

<Profile bind:data />
