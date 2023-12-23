<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Loader2 } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	import type { User } from 'lucia';
	import { GithubLogo } from 'radix-icons-svelte';
	let { user } = $props<{ user: User | undefined }>();
	let isLoggingOut = $state(false);
</script>

<div class="sticky top-0 flex h-[100svh] w-1/3 items-center justify-center gap-2">
	{#if user}
		<Avatar bind:user className="h-20 w-20" />
		<Button href={`/${user.username}`}>
			{user.username}
		</Button>
		<form
			action="?/logout"
			method="POST"
			use:enhance={async () => {
				isLoggingOut = true;
				return async ({ result, update }) => {
					if (result.type === 'success' || result.type === 'redirect') {
						await update();
					} else {
						toast.error('Something went wrong');
					}
					isLoggingOut = false;
				};
			}}
		>
			<Button type="submit" disabled={isLoggingOut} class="flex gap-2 text-black">
				Sign out
				{#if isLoggingOut}
					<Loader2 class="animate-spin text-black" />
				{/if}
			</Button>
		</form>
	{:else}
		<Button href="/api/login/github" variant="outline" size="icon">
			<GithubLogo class="h-[1.2rem] w-[1.2rem] transition-all" />
		</Button>
	{/if}
</div>
