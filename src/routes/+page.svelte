<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/avatar.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Loader2 } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	let { data } = $props();
	let isLoggingOut = $state(false);
</script>

<main>
	{#if data.user}
		Welcome {data.user.username}!
		<Avatar user={data.user} />
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
		<h1>Sign in</h1>
		<a href="/api/login/github">Sign in with GitHub</a>
	{/if}
</main>
