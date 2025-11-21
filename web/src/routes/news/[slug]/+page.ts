import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getNewsPost } from '$lib/data/news';

export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const post = getNewsPost(params.slug);
	if (!post) {
		throw error(404, 'Not found');
	}

	return {
		post
	};
};
