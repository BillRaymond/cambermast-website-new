import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{svelte,ts,js,html}'],
	theme: {
		extend: {
			colors: {
				// Cambermast Brand Colors (from Brand Board)
				// Replace hex values with your actual brand colors if needed
				primary: {
					DEFAULT: '#1A2A3A', // Navy
					light: '#3B4A5A',
					dark: '#101A24'
				},
				secondary: {
					DEFAULT: '#F9B233', // Gold
					light: '#FFD77A',
					dark: '#C98C00'
				},
				accent: {
					DEFAULT: '#E94F1D', // Orange
					light: '#FF7A47',
					dark: '#B32B00'
				},
				neutral: {
					DEFAULT: '#F4F4F4', // Light Gray
					dark: '#222222'
				}
			},
			fontFamily: {
				// Cambermast Brand Fonts
				sans: ['Montserrat', 'Proxima Nova', 'Arial', 'sans-serif'],
				heading: ['Montserrat', 'sans-serif'],
				body: ['Proxima Nova', 'sans-serif']
			}
		}
	},
	plugins: [typography]
};
