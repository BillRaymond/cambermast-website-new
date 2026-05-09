import nodeAdapter from '@sveltejs/adapter-node';
import staticAdapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const adapter =
	process.env.SVELTEKIT_ADAPTER === 'node'
		? nodeAdapter({ out: 'build', precompress: true })
		: staticAdapter({ strict: false });

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { adapter }
};

export default config;
