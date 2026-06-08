import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/content';
import { getShareImage, postUrlFromId, site } from '../lib/site';

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: site.fullTitle,
    description: site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrlFromId(post.id),
      customData: `<enclosure url="${new URL(getShareImage(post.data.shareImage, post.data.thumbnailImage), site.url)}" />`
    }))
  });
}
