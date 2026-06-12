export const site = {
  title: 'Ankit Sarkar',
  fullTitle: 'Ankit Sarkar | .NET Enthusiast | Azure Cloud Practitioner',
  description: 'Technical Architect, Microsoft Certified Azure Solutions Architect Expert',
  url: 'https://anktsrkr.github.io',
  author: 'Ankit Sarkar',
  email: 'ankt.srkr@gmail.com',
  location: 'Leeds',
  disqusShortname: 'anktsrkr-github-io',
  googleAnalyticsId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID || 'G-QWH7JJ1H6Q',
  adsenseClient: import.meta.env.PUBLIC_ADSENSE_CLIENT || 'ca-pub-2534759648571863',
  webpushrKey: 'BEW0OG9D298JEOxVSTObrPp5nebohoFilULY8fRTJ4T-B8KfYk3G9nUAjtbqrX73vsvtkjGXfZNfsLWFz0xNew0',
  clarityId: 'ro6zx9o7jl',
  kofiUser: 'ankitsarkar',
  setmoreUrl: 'https://booking.setmore.com/scheduleappointment/d3cbc8af-7bd5-44c1-874b-87c9d77d82be',
  socials: {
    github: 'https://github.com/anktsrkr',
    linkedin: 'https://www.linkedin.com/in/sarkaran/',
    twitter: 'https://twitter.com/ankt_srkr',
    rss: '/index.xml'
  }
};

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/categories/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'Archives', href: '/archives/' },
  { label: 'About', href: '/about/' }
];

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[()[\]{}]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function postSlugFromId(id: string): string {
  return id
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .map(slugify)
    .filter(Boolean)
    .join('/');
}

export function postUrlFromId(id: string): string {
  return `/post/${postSlugFromId(id)}/`;
}

export function termUrl(kind: 'categories' | 'tags', term: string): string {
  return `/${kind}/${slugify(term)}/`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function getShareImage(shareImage?: string, thumbnailImage?: string): string {
  if (!shareImage || shareImage === '/images/path/share.png') {
    return thumbnailImage || '/images/cover.jpg';
  }

  return shareImage;
}
