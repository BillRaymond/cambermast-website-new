export type RedirectStatusCode = 301 | 302 | 307 | 308;

export type RedirectCategory =
	| 'api'
	| 'catalog'
	| 'feed'
	| 'history'
	| 'machine-readable'
	| 'nav'
	| 'other';

export type RedirectEntry = {
	sourcePath: string;
	targetPath: string;
	statusCode: RedirectStatusCode;
	enabled: boolean;
	notes?: string;
	category?: RedirectCategory;
	allowRestrictedTarget?: boolean;
};

export type RedirectRegistry = {
	redirects: RedirectEntry[];
};

export type RedirectImpactTag =
	| 'api'
	| 'calendar'
	| 'feed'
	| 'nav'
	| 'public-route'
	| 'training';
