import { getAllTerms, getPublishedPosts } from './content';
import { postSlugFromId, postUrlFromId, site } from './site';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString();
}

function legacyPostUrl(post: Awaited<ReturnType<typeof getPublishedPosts>>[number]): string {
  const year = String(post.data.date.getFullYear());
  const month = String(post.data.date.getMonth() + 1).padStart(2, '0');
  const slug = postSlugFromId(post.id).split('/').at(-1);

  return `/${year}/${month}/${slug}/`;
}

export function sitemapIndexXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeXml(absoluteUrl('/sitemap-0.xml'))}</loc>
  </sitemap>
</sitemapindex>`;
}

export async function sitemapXml(): Promise<string> {
  const posts = await getPublishedPosts();
  const urls = [
    '/',
    '/about/',
    '/archives/',
    '/categories/',
    '/tags/',
    ...posts.map((post) => postUrlFromId(post.id)),
    ...getAllTerms(posts, 'categories').map((category) => `/categories/${category.slug}/`),
    ...getAllTerms(posts, 'tags').map((tag) => `/tags/${tag.slug}/`)
  ];

  const uniqueUrls = [...new Set(urls)].sort();
  const entries = uniqueUrls.map((url) => `  <url><loc>${escapeXml(absoluteUrl(url))}</loc></url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
