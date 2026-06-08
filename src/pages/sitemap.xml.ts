import { sitemapIndexXml, xmlResponse } from '../lib/sitemap';

export function GET() {
  return xmlResponse(sitemapIndexXml());
}
