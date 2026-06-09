import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const postsDir = path.join(root, 'src', 'content', 'posts');
const aboutFile = path.join(root, 'src', 'content', 'about.md');
const publicDir = path.join(root, 'public');
const required = ['title', 'date', 'draft', 'thumbnailImage', 'shareImage', 'categories', 'tags'];
const allowedMissingImages = new Set(['/images/path/share.png']);
const errors = [];

function walkMarkdown(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...walkMarkdown(fullPath));
    if (item.isFile() && item.name.endsWith('.md')) files.push(fullPath);
  }
  return files;
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[()[\]{}]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function postUrlForFile(file) {
  const id = path.relative(postsDir, file).replace(/\\/g, '/').replace(/\.md$/, '');
  return `/post/${id.split('/').map(slugify).join('/')}/`;
}

function localPublicPath(url) {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith('//')) return null;
  const clean = decodeURI(url.split('#')[0].split('?')[0]);
  return path.join(publicDir, clean.replace(/^\/+/, ''));
}

const files = walkMarkdown(postsDir);
if (files.length !== 39) {
  errors.push(`Expected 39 posts, found ${files.length}`);
}

const contentFiles = fs.existsSync(aboutFile) ? [...files, aboutFile] : files;
const postUrls = new Set(files.map(postUrlForFile));
const categoryUrls = new Set(['/categories/']);
const tagUrls = new Set(['/tags/']);

for (const file of files) {
  const parsed = matter(fs.readFileSync(file, 'utf8'));

  for (const key of required) {
    if (!(key in parsed.data)) {
      errors.push(`${path.relative(root, file)}: missing frontmatter "${key}"`);
    }
  }

  for (const category of parsed.data.categories ?? []) {
    categoryUrls.add(`/categories/${slugify(category)}/`);
  }

  for (const tag of parsed.data.tags ?? []) {
    tagUrls.add(`/tags/${slugify(tag)}/`);
  }
}

for (const file of contentFiles) {
  const relative = path.relative(root, file);
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);

  if (/\{\{<[\s\S]*?>\}\}/.test(raw)) {
    errors.push(`${relative}: legacy shortcode remains`);
  }

  for (const image of [parsed.data.thumbnailImage, parsed.data.shareImage]) {
    if (!image || allowedMissingImages.has(image)) continue;
    const imagePath = localPublicPath(image);
    if (imagePath && !fs.existsSync(imagePath)) {
      errors.push(`${relative}: missing image ${image}`);
    }
  }

  for (const match of raw.matchAll(/<img\s+[^>]*src="([^"]+)"/g)) {
    const src = match[1];
    const imagePath = localPublicPath(src);
    if (imagePath && !fs.existsSync(imagePath)) {
      errors.push(`${relative}: missing inline image ${src}`);
    }
  }

  for (const match of raw.matchAll(/\]\((\/[^)#?]+)\/?\)/g)) {
    const href = `${match[1].replace(/\/?$/, '/')}`;
    if (href.startsWith('/post/') && !postUrls.has(href)) {
      errors.push(`${relative}: unresolved post link ${href}`);
    } else if (href.startsWith('/categories/') && !categoryUrls.has(href)) {
      errors.push(`${relative}: unresolved category link ${href}`);
    } else if (href.startsWith('/tags/') && !tagUrls.has(href)) {
      errors.push(`${relative}: unresolved tag link ${href}`);
    } else if (href === '/index.xml/' || href === '/index.xml') {
      continue;
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Content validation passed for ${files.length} posts`);
