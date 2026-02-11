export type Partner = {
	code: string;
	slug: string;
	name: string;
	logo?: string;
	homepageUrl?: string;
};

const partners: Partner[] = [
	{
		code: 'NONE',
		slug: 'none',
		name: 'No partner'
	},
	{
		code: 'CMB',
		slug: 'cambermast',
		name: 'Cambermast',
		logo: '/images/cambermast-logo-full.png',
		homepageUrl: 'https://cambermast.com'
	},
	{
		code: 'TLB',
		slug: 'techlab',
		name: 'TechLAB',
		logo: '/images/techlab-logo.png'
	},
	{
		code: 'HFC',
		slug: 'hufnagel-consulting',
		name: 'Hufnagel Consulting',
		logo: '/images/jennifer-hufnagel-headshot.jpg'
	},
	{
		code: 'TCW',
		slug: 'the-content-wrangler',
		name: 'The Content Wrangler',
		logo: '/images/trusted-by/the-content-wrangler.png'
	}
];

const partnersByCode = new Map(partners.map((partner) => [partner.code.toUpperCase(), partner]));

export const listPartners = (): Partner[] => [...partners];

export const getPartnerByCode = (code?: string): Partner | undefined => {
	if (!code) return undefined;
	return partnersByCode.get(code.toUpperCase());
};
