<script lang="ts">
	import PublicAvatar from '$lib/components/PublicAvatar.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { feedPost } from '$lib/index.d';

	let { data } = $props<{
		data: feedPost;
	}>();
</script>

<!-- {console.log(data)} -->
<div>
	<div class="flex flex-row items-center justify-between">
		<div class="flex flex-row items-center">
			{#if data.authors?.length >= 1}
				<PublicAvatar
					user={{
        avatar: data.authors[0].avatar!,
        username: data.authors[0].username!,
      }}
					className="h-8 w-8"
				/>
			{/if}
			<Button variant="link" href={`/${data.authors[0].username}`}
				>{data.authors[0].username}
			</Button>
			{#each data.authors.slice(1) as author}
				, <Button variant="link" href={`/${author.username}`}>{author.username}</Button>
			{/each}
		</div>
		<span class="text-xs text-gray-500">{data.createdAt?.toLocaleDateString('en-US')}</span>
	</div>
	<div class="mt-2">
		<img class="w-full" src={data.image} alt={data.createdAt?.toLocaleDateString('en-US')} />
	</div>
	<div class="mt-2 flex flex-row items-center justify-between">
		<div class="flex flex-row items-center">
			<span class="text-xs text-gray-500">{data.likes} likes</span>
		</div>
		<div class="flex flex-row items-center">
			<button class="text-xs text-gray-500">Like</button>
			<button class="ml-2 text-xs text-gray-500">Comment</button>
		</div>
	</div>
</div>
