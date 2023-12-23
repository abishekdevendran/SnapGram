<script lang="ts">
	import FeedPost from '$lib/components/FeedPost.svelte';
	import Profile from '$lib/components/Profile.svelte';
	let { data } = $props();
</script>

<main class="min-w-96 flex flex-col gap-4 pt-6">
	{#if !data.feed || !data.feed.length}
		<p class="text-center">No posts yet.</p>
	{:else}
		{#each data.feed as feedPost}
			<FeedPost bind:data={feedPost} />
		{/each}
	{/if}
</main>
<Profile bind:user={data.user} />
