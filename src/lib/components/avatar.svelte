<script lang="ts">
	import { PUBLIC_CLOUDINARY_API_KEY } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Pencil2 } from 'radix-icons-svelte';
	import type { User } from 'lucia';
	let { user } = $props<{
		user: User;
	}>();
	let widget = $state<any>(null);
	interface Coordinates {
		custom: number[][];
	}
	interface SuccessResponse {
		asset_id: string;
		public_id: string;
		version: number;
		version_id: string;
		signature: string;
		width: number;
		height: number;
		format: string;
		resource_type: string;
		created_at: string;
		tags: any[];
		bytes: number;
		type: string;
		etag: string;
		placeholder: boolean;
		url: string;
		secure_url: string;
		folder: string;
		access_mode: string;
		coordinates: Coordinates;
		original_filename: string;
		api_key: string;
	}
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
				async (
					error: null | string,
					result: {
						event: string;
						info: SuccessResponse;
					}
				) => {
					if (error) {
						toast.error(error);
					}
					if (result.event === 'success') {
						// construct formData
						const formData = new FormData();
						formData.append('avatar', result.info.secure_url);
						// send formData to server
						try {
							const res = await fetch('?/updateAvatar', {
								method: 'POST',
								body: formData
							});
							if (!res.ok) {
								throw new Error('Something went wrong');
							}
							// replace current avatar with new one
							user && (user.avatar = result.info.secure_url);
							toast.success('Avatar updated successfully');
						} catch (e) {
							toast.error('Something went wrong');
						}
					}
				}
			);
		}
	});
</script>

<Avatar.Root class="group/avatar relative h-16 w-16 cursor-pointer" onclick={() => widget?.open()}>
	<Avatar.Image src={user.avatar} alt="@shadcn" />
	<Avatar.Fallback>CN</Avatar.Fallback>
	<div
		class="absolute bottom-0 flex h-6 w-full items-center justify-center bg-slate-600 opacity-0 group-hover/avatar:opacity-75"
	>
		<Pencil2 />
	</div>
</Avatar.Root>
