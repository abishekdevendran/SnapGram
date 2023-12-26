export type feedPost = {
	id: string;
	image: string;
	likes: number | null;
	createdAt: Date | null;
	comments: {
		id: string;
		userId: string;
		postId: string;
		text: string;
	}[];
	authors: {
		username: string | null;
		avatar: string | null;
	}[];
};
