import { sitemapXml, xmlResponse } from '../lib/sitemap';

export async function GET() {
  return xmlResponse(await sitemapXml());
}
