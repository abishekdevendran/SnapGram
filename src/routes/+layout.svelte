<script lang="ts">
	import Lightswitch from '$lib/components/nav/lightswitch.svelte';
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	let { data } = $props();
	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r: any) {
					// uncomment following code if you want check for updates
					// r && setInterval(() => {
					//    console.log('Checking for sw update')
					//    r.update()
					// }, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error: any) {
					console.log('SW registration error', error);
				}
			});
		}
	});
	let webManifestLink = $state('');
	$effect(() => {
		if (pwaInfo) {
			webManifestLink = pwaInfo.webManifest.linkTag;
		}
	});
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>
<QueryClientProvider client={data.queryClient}>
	<Toaster />
	<ProgressBar class="text-primary" />
	<nav class="sticky top-0 flex h-[100svh] w-16 items-center justify-center">
		<Lightswitch />
	</nav>
	<slot />
	<ModeWatcher />
</QueryClientProvider>
