import { getCollection, type CollectionEntry } from 'astro:content';
import { postSlugFromId, slugify } from './site';

export type Post = CollectionEntry<'posts'>;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function getFeaturedPosts(posts: Post[], count = 6): Post[] {
  const featured = posts.filter((post) => post.data.featured);
  return (featured.length ? featured : posts).slice(0, count);
}

export function getAllTerms(posts: Post[], field: 'categories' | 'tags') {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const post of posts) {
    for (const term of post.data[field] ?? []) {
      const slug = slugify(term);
      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(slug, { name: term, slug, count: 1 });
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function postsForTerm(posts: Post[], field: 'categories' | 'tags', slug: string): Post[] {
  return posts.filter((post) => (post.data[field] ?? []).some((term) => slugify(term) === slug));
}

export function getArchiveGroups(posts: Post[]) {
  const map = new Map<string, { label: string; posts: Post[] }>();
  for (const post of posts) {
    const year = String(post.data.date.getFullYear());
    if (!map.has(year)) {
      map.set(year, { label: year, posts: [] });
    }
    map.get(year)?.posts.push(post);
  }

  return [...map.values()].sort((a, b) => Number(b.label) - Number(a.label));
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    currentPage: safePage,
    items: items.slice(start, start + pageSize),
    pageSize,
    totalItems: items.length,
    totalPages
  };
}

export function findPostBySlug(posts: Post[], slug: string): Post | undefined {
  return posts.find((post) => postSlugFromId(post.id) === slug);
}
