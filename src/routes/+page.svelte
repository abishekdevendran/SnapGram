<script lang="ts">
	import FeedPost from '$lib/components/FeedPost.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	let { data } = $props();
	const feed = createQuery({
		queryKey: ['feed', data?.user?.userId ?? ''],
		queryFn: async () => (await fetch('/api/posts')).json()
	});
</script>

<main class="flex min-w-96 flex-col gap-4 pt-6">
	{#if !$feed.data || !$feed.data.length}
		<p class="text-center">No posts yet.</p>
	{:else}
		{#each $feed.data as feedPost}
			<FeedPost bind:data={feedPost} />
		{/each}
	{/if}
</main>
<Profile bind:user={data.user} />
