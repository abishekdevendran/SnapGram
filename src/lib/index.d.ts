export type feedPost = {
	id: string;
	image: string;
	likes: number | null;
	createdAt: Date | null;
	comment: {
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
