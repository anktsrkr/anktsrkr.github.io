import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const sourceArgIndex = process.argv.findIndex((arg) => arg === '--source');
const sourceRoot = path.resolve(
  sourceArgIndex >= 0 ? process.argv[sourceArgIndex + 1] : path.join(root, '..', 'microsoft-agent-framework.github.io')
);
const sourceTutorialsDir = path.join(sourceRoot, 'src', 'content', 'tutorials');
const targetRoot = path.join(root, 'src', 'content', 'posts', 'agent-framework', 'academy');
const draft = args.has('--draft');

if (!fs.existsSync(sourceTutorialsDir)) {
  throw new Error(`Source tutorials directory not found: ${sourceTutorialsDir}`);
}

function walkMarkdown(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...walkMarkdown(fullPath));
    if (item.isFile() && /\.(md|mdx)$/i.test(item.name) && item.name.toLowerCase() !== 'readme.md') {
      files.push(fullPath);
    }
  }
  return files;
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[()[\]{}]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleize(value) {
  return String(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function tutorialSlug(file) {
  return slugify(path.basename(file).replace(/\.(md|mdx)$/i, '').replace(/^\d+-/, ''));
}

function categorySlug(file) {
  return path.basename(path.dirname(file));
}

function blogPostUrl(category, slug) {
  return `/post/agent-framework/academy/${category}/${slug}/`;
}

function sourceLearnUrl(category, slug) {
  return `https://microsoft-agent-framework.github.io/learn/${category}/${slug}/`;
}

function sourceCodeUrl(relativePath) {
  return `https://github.com/microsoft-agent-framework/microsoft-agent-framework.github.io/blob/main/${relativePath.replace(/\\/g, '/')}`;
}

function normalizeInlineMarkdownInHtml(content) {
  let inFence = false;
  let htmlDepth = 0;

  return content
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence) {
        return line;
      }

      const shouldNormalize = htmlDepth > 0 || line.includes('<');
      const normalizedLine = shouldNormalize
        ? line
            .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        : line;

      const openTags = line.match(/<(?!(?:\/|!))\s*(div|p|li|span|h[1-6]|ul|ol)\b/g)?.length ?? 0;
      const closeTags = line.match(/<\/\s*(div|p|li|span|h[1-6]|ul|ol)\s*>/g)?.length ?? 0;
      htmlDepth = Math.max(0, htmlDepth + openTags - closeTags);

      return normalizedLine;
    })
    .join('\n');
}

function normalizeHeadingBadges(content) {
  return content
    .split('\n')
    .map((line) => {
      if (!/^#{1,6}\s/.test(line) || !line.includes('inline-flex')) {
        return line;
      }

      return line.replace(
        /<div\s+class="[^"]*\binline-flex\b[^"]*"[^>]*>(.*?)<\/div>/g,
        '<span class="agent-heading-chip">$1</span>'
      );
    })
    .join('\n');
}

function dedentBlock(content) {
  const lines = content.replace(/^\r?\n|\r?\n$/g, '').split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
  const indent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines
    .map((line) => (line.trim().length === 0 ? '' : line.slice(indent)))
    .join('\n')
    .trim();
}

function flattenTabs(content) {
  return content
    .replace(/<Tabs\b[^>]*>/g, '')
    .replace(/<\/Tabs>/g, '')
    .replace(/<TabItem\b[^>]*label="([^"]+)"[^>]*>([\s\S]*?)<\/TabItem>/g, (_, label, tabContent) => {
      return `\n\n#### ${label}\n\n${dedentBlock(tabContent)}\n\n`;
    });
}

function normalizeMermaidCallouts(content) {
  return content
    .replace(
      /<div class="premium-gradient[^"]*"[^>]*>\s*(?:<div class="absolute[^"]*"[^>]*><\/div>\s*)?<div class="flex[^"]*"[^>]*>\s*<div class="flex-shrink-0[^"]*"[^>]*>\s*```mermaid\s*([\s\S]*?)\s*```\s*<\/div>\s*<div>\s*([\s\S]*?)\s*<\/div>\s*<\/div>\s*<\/div>/g,
      (_, diagram, note) => `\n\n\`\`\`mermaid\n${dedentBlock(diagram)}\n\`\`\`\n\n<div class="premium-gradient agent-mermaid-note">\n${note.trim()}\n</div>\n`
    )
    .replace(
      /<div class="[^"]*\bmermaid-wide\b[^"]*"[^>]*>\s*```mermaid\s*([\s\S]*?)\s*```\s*([\s\S]*?)<\/div>/g,
      (_, diagram, note) => {
        const cleanedNote = note.trim();
        return `\n\n\`\`\`mermaid\n${dedentBlock(diagram)}\n\`\`\`\n${cleanedNote ? `\n\n<div class="agent-diagram-caption">\n${cleanedNote}\n</div>\n` : ''}`;
      }
    );
}

function normalizeMdx(body) {
  const normalized = body
    .replace(/^import\s+.+?;[ \t]*\r?\n/gm, '')
    .replace(/\{\/\*([\s\S]*?)\*\/\}/g, '<!--$1-->')
    .replace(/\]\(\/learn\/([^/)]+)\/([^)#?]+)([^)]*)\)/g, (_, category, slug, suffix) => {
      const cleanSuffix = suffix.endsWith('/') || suffix.startsWith('#') || suffix.startsWith('?') ? suffix : `${suffix}/`;
      return `](${blogPostUrl(category, slug)}${cleanSuffix.replace(/^\//, '')})`;
    })
    .replace(/\n{4,}/g, '\n\n\n')
    .trimStart();

  return normalizeHeadingBadges(normalizeInlineMarkdownInHtml(normalizeMermaidCallouts(flattenTabs(normalized))));
}

function postFrontmatter(file, data) {
  const category = slugify(data.category || categorySlug(file));
  const slug = tutorialSlug(file);
  const relativePath = path.relative(sourceRoot, file).replace(/\\/g, '/');
  const stats = fs.statSync(file);
  const concepts = Array.isArray(data.concepts) ? data.concepts : [];
  const tags = [...new Set(['agent-framework', category, ...concepts.map(slugify)].filter(Boolean))];
  const keywords = [...new Set(['Microsoft Agent Framework', 'Agent Framework', ...concepts])];

  return {
    title: data.title,
    date: stats.mtime.toISOString(),
    description: data.description || '',
    featured:
      (category === 'agent-essentials' && slug === 'hello-agent') ||
      (category === 'advanced-orchestration' && slug === 'beyond-agents') ||
      (category === 'agent-capabilities' &&
        (slug === 'semantic-tool-search' || slug === 'scrapegraphai-research-agent')),
    draft,
    toc: true,
    series: data.series,
    seriesOrder: data.seriesOrder,
    thumbnailImage: '/images/agent-framework/aflogo.png',
    thumbnailImagePosition: 'left',
    shareImage: '/images/agent-framework/aflogo.png',
    canonicalUrl: sourceLearnUrl(category, slug),
    sourceUrl: sourceLearnUrl(category, slug),
    sourceCodeUrl: sourceCodeUrl(relativePath),
    sourceName: 'Microsoft Agent Framework Tutorial Blog',
    sourcePath: relativePath,
    crosspost: true,
    difficulty: data.difficulty,
    time: data.time,
    provider: data.provider,
    hosting: data.hosting,
    categories: ['Agent Framework', 'AI', titleize(category)],
    tags,
    keywords,
    comments: true,
    showSocial: true
  };
}

fs.mkdirSync(targetRoot, { recursive: true });

const files = walkMarkdown(sourceTutorialsDir).sort((a, b) => {
  const categoryCompare = categorySlug(a).localeCompare(categorySlug(b));
  if (categoryCompare !== 0) return categoryCompare;
  return path.basename(a).localeCompare(path.basename(b));
});

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const category = slugify(parsed.data.category || categorySlug(file));
  const slug = tutorialSlug(file);
  const targetDir = path.join(targetRoot, category);
  const targetFile = path.join(targetDir, `${slug}.md`);
  const content = normalizeMdx(parsed.content);
  const frontmatter = postFrontmatter(file, parsed.data);
  const output = matter.stringify(content, frontmatter, { lineWidth: -1 });

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, output, 'utf8');
}

console.log(`Imported ${files.length} Agent Framework tutorial cross-posts into ${path.relative(root, targetRoot)}`);
console.log(draft ? 'Imported posts are drafts.' : 'Imported posts are published.');
