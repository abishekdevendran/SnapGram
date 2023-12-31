<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Avatar from '$lib/components/Avatar.svelte';
	import PublicAvatar from '$lib/components/PublicAvatar.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { User } from 'lucia';
	import { Reload, Gear } from 'radix-icons-svelte';
	import toast from 'svelte-french-toast';

	let { data } = $props<{
		data: {
			user: any;
			self: User | null;
			isSelf: boolean | null;
			pendingFollowRequests: any[];
			following: any[];
		};
	}>();
	let pageFollowers = $state((data.user as { followers?: any[] }).followers ?? []);
	let pageFollowing = $state((data.user as { following?: any[] }).following ?? []);
	let pendingFollowRequests = $state(data.pendingFollowRequests);
	let followingList = $state(data.following);
	let followingDialogOpen = $state(false);
	let followersDialogOpen = $state(false);
	let editProfileDialogOpen = $state(false);
	let isProfileUpdating = $state(false);
	let hasFollowRequested = $derived(
		pendingFollowRequests.some((user) => user.followingId === data.user.id)
	);
	let amIFollowing = $derived(followingList.some((user) => user.id === data.user.id));
	let isFollowing = $state(false);
	let isPrivateAccount = $state(data.user.isPrivate);
	$effect(() => {
		if (data.user) {
			pageFollowers = (data.user as { followers?: any[] }).followers ?? [];
			pageFollowing = (data.user as { following?: any[] }).following ?? [];
			pendingFollowRequests = data.pendingFollowRequests;
			followingList = data.following;
		}
	});
</script>

{#if data.user}
	<div class="flex flex-row-reverse items-center gap-4">
		{#if data.isSelf}
			<Dialog.Root bind:open={editProfileDialogOpen}>
				<Dialog.Trigger>
					<Button variant="link" class="p-0"><Gear /></Button>
				</Dialog.Trigger>
				<Dialog.Content class="max-w-96 p-6">
					<Dialog.Header>
						<Dialog.Title>Update Profile Information</Dialog.Title>
						<Dialog.Description class="max-h-96 w-full overflow-auto">
							<!-- <code>{JSON.stringify(data.user.isPrivate, null, 2)}</code> -->
							<form
								action={`/${data.user.username}?/updateProfile`}
								method="post"
								class="flex flex-col gap-6"
								use:enhance={async () => {
										isProfileUpdating = true;
										return async ({ result, update }) => {
												if(result.type==='failure'){
													if(!!result.data?.message){
													toast.error(result.data?.message as string);
												} else{
													toast.error('Something went wrong');
												}
											}
											isProfileUpdating = false;
											await update();
											if(result.type==='success' || result.type==='redirect'){
												editProfileDialogOpen = false;
												toast.success('Profile updated successfully');
											}
										};
									}}
							>
								<div class="flex flex-col gap-2">
									<Label for="username">Username</Label>
									<Input
										type="text"
										name="username"
										placeholder="John Doe"
										value={data.user.username}
									/>
								</div>
								<div class="flex flex-col gap-2">
									<Label for="bio">Bio</Label>
									<Input type="text" name="bio" placeholder="Bio" value={data.user.bio} />
								</div>
								<div class="flex items-center gap-2">
									<Label for="isPrivate">Private Profile?</Label>
									<input
										type="checkbox"
										name="isPrivate"
										checked={isPrivateAccount}
										value={'true'}
									/>
								</div>
								<Button type="submit">Update</Button>
							</form>
						</Dialog.Description>
					</Dialog.Header>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
		<div>
			<h1 class="text-4xl font-bold">{data.user.username}</h1>
			<p class="text-gray-500">@{data.user.username}</p>
			<p class="text-gray-500">{data.user.bio}</p>
			{#if !data.isSelf}
				<form
					method="POST"
					action={`/${data.user.username}?/follow`}
					use:enhance={async () => {
							isFollowing = true;
							return async ({ result, update }) => {
								console.log(result);
								if (result.type === 'success') {
									// remove from pendingFollowRequests
									if(result.data?.message==='Follow request sent'){
										pendingFollowRequests = [...pendingFollowRequests, {
											followerId: data.self?.userId!,
											followingId: data.user.id,
										}];
										toast.success('Follow request sent');
									} else if (result.data?.message==='Follow request deleted'){
										pendingFollowRequests = pendingFollowRequests.filter(
											(user) => user.followingId !== data.user.id
										);
										toast.success('Follow request deleted');
									} else if(result.data?.message==='Followed' ){
										followingList = [...followingList, {
											avatar: data.user.avatar,
											id: data.user.id,
											username: data.user.username!,
											isPrivate: data.user.isPrivate,
										}];
										// add to pageFollowers
										pageFollowers.push({
											avatar: data.self?.avatar,
											id: data.self?.userId!,
											username: data.self?.username!,
											isPrivate: data.self?.isPrivate,
										});
										toast.success('Followed');
									} else if(result.data?.message==='Unfollowed'){
										data.following = followingList.filter(
											(user) => user.id !== data.user.id
										);
										// remove from pageFollowers
										pageFollowers = pageFollowers.filter(
											(user) => user.id !== data.self?.userId!
										);
										toast.success('Unfollowed');
									}
								} else {
									if(result.type==='failure' && !!result.data?.message){
										toast.error(result.data?.message as string);
									} else{
										toast.error('Something went wrong');
									}
								}
								isFollowing = false;
							};
						}}
				>
					<input type="hidden" name="userId" value={data.user.id} />
					<Button type="submit" disabled={isFollowing}>
						{#if isFollowing}
							<Reload class="animate-spin" size={20} />
						{:else if amIFollowing}
							Unfollow
						{:else if hasFollowRequested}
							Follow Requested
						{:else}
							Follow
						{/if}
					</Button>
				</form>
			{/if}
			<div class="flex w-full items-center gap-2">
				{#if 'following' in data.user}
					<Dialog.Root bind:open={followingDialogOpen}>
						<Dialog.Trigger>
							<Button variant="link" class="p-0">{pageFollowing?.length} Following</Button>
						</Dialog.Trigger>
						<Dialog.Content class="max-w-96 p-6">
							<Dialog.Header>
								<Dialog.Title>{data.user.username} follows</Dialog.Title>
								<Dialog.Description class="max-h-96 w-full overflow-auto">
									<div class="flex h-full w-full flex-col gap-2">
										{#each pageFollowing as user}
											<div class="flex items-center gap-6">
												<PublicAvatar
													className="w-8 h-8"
													user={{
                      avatar: user.avatar,
                      username: user.username!,
                    }}
												/>
												<h4 class="text-sm">
													<Button
														variant="link"
														on:click={() => {
															console.log(user.username);
															goto(`/${user.username}`);
															followingDialogOpen = false;
														}}>{user.username}</Button
													>
												</h4>
											</div>
										{/each}
										<div></div>
									</div></Dialog.Description
								>
							</Dialog.Header>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
				{#if 'followers' in data.user}
					<Dialog.Root bind:open={followersDialogOpen}>
						<Dialog.Trigger>
							<Button variant="link" class="p-0">{pageFollowers?.length} Followers</Button>
						</Dialog.Trigger>
						<Dialog.Content class="max-w-96 p-6">
							<Dialog.Header>
								<Dialog.Title>{data.user.username}'s' followers</Dialog.Title>
								<Dialog.Description class="max-h-96 w-full overflow-auto">
									<div class="flex h-full w-full flex-col gap-2">
										{#each pageFollowers as user}
											<div class="flex items-center gap-6">
												<PublicAvatar
													className="w-8 h-8"
													user={{
                      avatar: user.avatar,
                      username: user.username!,
                    }}
												/>
												<h4 class="text-sm">
													<Button
														variant="link"
														on:click={() => {
															goto(`/${user.username}`);
															followersDialogOpen = false;
														}}>{user.username}</Button
													>
												</h4>
											</div>
										{/each}
										<div></div>
									</div></Dialog.Description
								>
							</Dialog.Header>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
			</div>
		</div>
		{#if !data.isSelf}
			<PublicAvatar
				className="w-32 h-32"
				user={{
				avatar: data.user.avatar,
				username: data.user.username!,
			}}
			/>
		{:else}
			<Avatar
				className="w-32 h-32"
				user={{
				avatar: data.user.avatar,
				userId: data.user.id,
				username: data.user.username!,
				isPrivate: data.user.isPrivate!,
			}}
			/>
		{/if}
	</div>
{/if}
