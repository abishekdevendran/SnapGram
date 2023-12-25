<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils/ui';
	import type { User } from 'lucia';
	let { user, className } = $props<{
		user: Omit<User, 'userId' | 'isPrivate' | 'bio'>;
		className: string | undefined;
	}>();
</script>

<Avatar.Root class={cn('h-16 w-16', className)}>
	<Avatar.Image src={user.avatar} alt={user.username} />
	<Avatar.Fallback>CN</Avatar.Fallback>
</Avatar.Root>
