# Cambermast Website

Marketing site for Cambermast LLC, highlighting AI training, advisory services, and resources created by Bill Raymond and partners. The site showcases upcoming workshops, service offerings, trusted partners, and ways for organizations to engage Cambermast for AI leadership support.

## Highlights
- Dynamic service catalog and training schedule sourced from JSON data in `src/lib/data`.
- Dedicated pages for About, Strategy, Agents, Training, and Contact information.
- Built-in CTAs for booking training, scheduling calls, and exploring external resources such as the Bill Talks AI newsletter.
- Responsive design with Tailwind CSS and reusable Svelte components.

## Tech Stack
- [SvelteKit](https://kit.svelte.dev) with Vite for the application framework and build tooling.
- [TypeScript](https://www.typescriptlang.org/) for typed components and utilities.
- [Tailwind CSS](https://tailwindcss.com/) for styling.

## Getting Started
```sh
cd web
npm install
npm run dev
# or automatically open the dev server in your browser
npm run dev -- --open
```

## Available Scripts
- `npm run dev` – start the development server.
- `npm run build` – create an optimized production build.
- `npm run preview` – serve the production build locally for validation.
- `npm run check` – typecheck and lint the project.

## Content Management
- Service and training content lives in `src/lib/data/`.
- Route-specific page content is under `src/routes/`.
- Static assets (logos, photography, icons) reside in `static/images/`.

Update the relevant data files or Svelte pages to refresh copy, sessions, or CTAs as Cambermast offerings evolve.
