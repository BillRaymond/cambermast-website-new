import { buildEnumsApiPayload } from '$lib/data/api/enums';

export const prerender = true;

export const GET = () => {
	const payload = buildEnumsApiPayload();

	return new Response(JSON.stringify(payload, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	});
};
