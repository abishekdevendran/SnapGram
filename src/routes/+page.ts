import type { feedPost } from '$lib/types.js';

export const load = async ({ parent, fetch, data }) => {
	const { queryClient } = await parent();
	await queryClient.prefetchInfiniteQuery({
		queryKey: ['feed', data?.user?.userId ?? ''],
		queryFn: async ({ pageParam }) => {
			const res = await fetch(pageParam);
			const json: {
				feed: feedPost[];
				page: number;
			} = await res.json();
			return json;
		},
		initialPageParam: '/api/feed'
	});
	return {
		user: data.user
	};
};
