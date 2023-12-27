<script lang="ts">
	import FeedPost from '$lib/components/FeedPost.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { feedPost } from '$lib/types.js';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	let { data } = $props();
	const feed = createInfiniteQuery({
		queryKey: ['feed', data?.user?.userId ?? ''],
		queryFn: async ({ pageParam }) => {
			const res = await fetch(pageParam);
			const json: {
				feed: feedPost[];
				page: number;
			} = await res.json();
			return json;
		},
		initialPageParam: '/api/feed',
		getNextPageParam: (lastPage) => {
			if (lastPage.feed.length > 0 && lastPage.feed.length === 10) {
				const nextUrl = '/api/feed?page=' + (lastPage.page + 1);
				return nextUrl;
			}
			return undefined;
		}
	});
</script>

<main class="flex min-w-96 flex-col gap-4 pt-6">
	{#if !$feed.data || !$feed.data.pages || $feed.data.pages.length === 0}
		<p class="text-center">No posts yet.</p>
	{:else}
		{#each $feed.data.pages as feedPostPage}
			{#each feedPostPage.feed as feedPost}
				<FeedPost bind:data={feedPost} />
			{/each}
		{/each}
		{#if !$feed.hasNextPage}
			<p class="text-center">No more posts.</p>
		{:else}
			<Button disabled={$feed.isPending || $feed.isFetchingNextPage} on:click={() => $feed.fetchNextPage()} class="w-full">
				{#if $feed.isFetchingNextPage}
					Loading...
				{:else if $feed.isError}
					Error: {$feed.error.message}
				{:else if $feed.hasNextPage}
					Load more
				{:else}
					No more posts
				{/if}
			</Button>
		{/if}
	{/if}
</main>
<Profile bind:user={data.user} />
