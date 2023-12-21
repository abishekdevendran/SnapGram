<script lang="ts">
	import { Dashboard } from '@uppy/svelte';
	import Uppy from '@uppy/core';
	import ImageEditor from '@uppy/image-editor';
	import Transloadit from '@uppy/transloadit';
	// Don't forget the CSS: core and UI components + plugins you are using
	import '@uppy/core/dist/style.css';
	import '@uppy/dashboard/dist/style.css';
	import '@uppy/image-editor/dist/style.min.css';
	import { PUBLIC_TRANSLOADIT_KEY } from '$env/static/public';

	const uppy = new Uppy({
		debug: true,
		autoProceed: true,
		restrictions: {
			maxNumberOfFiles: 1,
			minNumberOfFiles: 1,
			allowedFileTypes: ['image/*']
		}
	})
		.use(ImageEditor)
		.use(Transloadit, {
			waitForEncoding: true,
			alwaysRunAssembly: true,
			assemblyOptions: {
				params: {
					auth: { key: PUBLIC_TRANSLOADIT_KEY },
					template_id: 'a7c0d6905a13497382bc29be38464ff0'
				}
			}
		});
</script>

<Dashboard {uppy} plugins={['ImageEditor']} />
