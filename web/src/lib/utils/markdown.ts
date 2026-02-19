import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

export const renderMarkdownToSafeHtml = (markdown: string | undefined): string => {
	const source = markdown?.trim();
	if (!source) return '';

	const rendered = marked.parse(source, {
		async: false,
		breaks: true,
		gfm: true
	});
	const html = typeof rendered === 'string' ? rendered : '';

	return sanitizeHtml(html, {
		allowedTags: [
			'p',
			'br',
			'strong',
			'em',
			'blockquote',
			'code',
			'pre',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'hr',
			'a'
		],
		allowedAttributes: {
			a: ['href', 'title', 'target', 'rel']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		transformTags: {
			a: (tagName: string, attribs: Record<string, string>) => ({
				tagName,
				attribs: {
					...attribs,
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			})
		}
	});
};
