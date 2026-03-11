export type TrustedByOrganization = {
	name: string;
	url: string;
	logoSrc?: string;
	logoAlt?: string;
};

export const trustedByOrganizations: TrustedByOrganization[] = [
	{
		name: 'Microsoft',
		url: 'https://www.microsoft.com/',
		logoSrc: '/images/trusted-by/microsoft.png'
	},
	{
		name: 'Digital.ai',
		url: 'https://digital.ai/',
		logoSrc: '/images/trusted-by/digital-ai.png'
	},
	{
		name: 'DocuSign',
		url: 'https://www.docusign.com/',
		logoSrc: '/images/trusted-by/docusign.png'
	},
	{
		name: 'Acuity Inc.',
		url: 'https://www.acuityinc.com/',
		logoSrc: '/images/trusted-by/acuityinc.png'
	},
	{ name: 'SLB', url: 'https://www.slb.com/', logoSrc: '/images/trusted-by/slb.png' },
	{ name: 'NASA', url: 'https://www.nasa.gov/', logoSrc: '/images/trusted-by/nasa.png' },
	{
		name: 'Duke Energy',
		url: 'https://www.duke-energy.com/',
		logoSrc: '/images/trusted-by/duke-energy.png'
	},
	{ name: 'Moen', url: 'https://www.moen.com/', logoSrc: '/images/trusted-by/moen.png' },
	{
		name: 'NYCHA',
		url: 'https://www.nyc.gov/site/nycha/index.page',
		logoSrc: '/images/trusted-by/nycha.png'
	},
	{
		name: 'AI Collective',
		url: 'https://theaicollective.ai/',
		logoSrc: '/images/trusted-by/ai-collective.png',
		logoAlt: 'The AI Collective logo'
	},
	{ name: 'Kaggle', url: 'https://www.kaggle.com/', logoSrc: '/images/trusted-by/kaggle.png' },
	{
		name: 'GoSkills',
		url: 'https://www.goskills.com/',
		logoSrc: '/images/trusted-by/goskills.png'
	},
	{
		name: 'Help Scout',
		url: 'https://www.helpscout.com/',
		logoSrc: '/images/trusted-by/help-scout.png'
	},
	{
		name: 'The Content Wrangler',
		url: 'https://thecontentwrangler.com/',
		logoSrc: '/images/trusted-by/the-content-wrangler.png'
	},
	{
		name: 'TechLAB Innovation Center LLC',
		url: 'https://techlabcenter.com/',
		logoSrc: '/images/TechLAB-Innovation-Center.png',
		logoAlt: 'TechLAB Innovation Center logo'
	},
	{ name: 'Red Hat', url: 'https://www.redhat.com/', logoSrc: '/images/trusted-by/red-hat.png' }
];
