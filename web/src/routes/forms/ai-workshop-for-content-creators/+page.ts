import { redirect } from '@sveltejs/kit';

export const load = () => {
	throw redirect(302, '/forms/pre-training-survey?program=ai-workshop-for-content-creators');
};
