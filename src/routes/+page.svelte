<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_CLOUDINARY_API_KEY } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	export let data;
	let isLoggingOut = false;
	let widget: any;

	// 	{
	//     "asset_id": "f87d4737f15ca3353ac1ff85671ea2a3",
	//     "public_id": "avatars/Screenshot_from_2023-12-19_20-53-47_ggdqxs",
	//     "version": 1703180103,
	//     "version_id": "a0846dc7ad0c59ba831539ca79a8f0b2",
	//     "signature": "82dc172625741e7494919655659cbe632b51705b",
	//     "width": 464,
	//     "height": 331,
	//     "format": "png",
	//     "resource_type": "image",
	//     "created_at": "2023-12-21T17:35:03Z",
	//     "tags": [],
	//     "bytes": 79991,
	//     "type": "upload",
	//     "etag": "507b9dab13bf0bf3b89c9c0c8d5854f3",
	//     "placeholder": false,
	//     "url": "http://res.cloudinary.com/snapgram/image/upload/v1703180103/avatars/Screenshot_from_2023-12-19_20-53-47_ggdqxs.png",
	//     "secure_url": "https://res.cloudinary.com/snapgram/image/upload/v1703180103/avatars/Screenshot_from_2023-12-19_20-53-47_ggdqxs.png",
	//     "folder": "avatars",
	//     "access_mode": "public",
	//     "coordinates": {
	//         "custom": [
	//             [
	//                 67.0,
	//                 0.0,
	//                 331.0,
	//                 331.0
	//             ]
	//         ]
	//     },
	//     "original_filename": "Screenshot from 2023-12-19 20-53-47",
	//     "api_key": "226711236489727"
	// }
	onMount(async () => {
		if (window.cloudinary) {
			let cloudinary = window.cloudinary;
			const timestamp = () => Math.round(new Date().getTime() / 1000);
			// pass both timestamp and folder to the server to sign the upload
			const signature = async (
				timestamp: number,
				folder: string,
				custom_coordinates: string,
				upload_preset = 'base'
			) =>
				await fetch(
					`/api/uploadImage?timestamp=${timestamp}&folder=${folder}&custom_coordinates=${custom_coordinates}&upload_preset=${upload_preset}`
				)
					.then((res) => res.json())
					.then((res) => res.signature);
			cloudinary.setCloudName('snapgram');
			widget = cloudinary.createUploadWidget(
				{
					cloudName: 'snapgram',
					cropping: true,
					sources: ['local', 'url', 'camera'],
					multiple: false,
					maxFiles: 1,
					showSkipCropButton: false,
					croppingAspectRatio: 1,
					clientAllowedFormats: ['image'],
					uploadSignatureTimestamp: timestamp,
					prepareUploadParams: async (cb: (arg0: any) => void, params: any) => {
						console.log(params);
						params.upload_preset = 'base';
						params.api_key = PUBLIC_CLOUDINARY_API_KEY;
						params.timestamp = timestamp();
						params.folder = 'avatars';
						// params.custom_coordinates
						params.signature = await signature(
							timestamp(),
							'avatars',
							params.custom_coordinates,
							'base'
						);
						cb(params);
					}
				},
				(error: null | string, result: any) => {
					if (error) {
						toast.error(error);
					}
					if (result.event === 'success') {
						toast.success('Avatr updated successfully');
						console.log(result);
					}
				}
			);
		}
	});
</script>

<main>
	{#if data.user}
		Welcome {data.user.username}!
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
				{#if isLoggingOut}
					<Loader2 class="animate-spin text-black" />
				{:else}
					Sign out
				{/if}
			</Button>
		</form>
		<form method="POST" action="?/updateAvatar">
			<Button onclick={() => widget?.open()}>Update Avatar</Button>
		</form>
	{:else}
		<h1>Sign in</h1>
		<a href="/api/login/github">Sign in with GitHub</a>
	{/if}
</main>
