import { buildTrainingProgramsFeedResponse } from '$lib/server/feeds/training-programs';

export const prerender = true;

export const GET = () => buildTrainingProgramsFeedResponse('/feed/training-programs.xml');
