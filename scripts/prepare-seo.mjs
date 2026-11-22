import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export function normalizeSiteUrl(value) {
  if (!value?.trim()) return '';
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('SITE_URL must be the public HTTPS address of the portfolio.');
  }
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '') + '/';
  return url.href;
}

const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeXml = value => escapeAttribute(value).replaceAll("'", '&apos;');

export function prepareMetadata(html, value) {
  const siteUrl = normalizeSiteUrl(value);
  html = html.replace(/\s*<!-- deployment-seo:start -->[\s\S]*?<!-- deployment-seo:end -->/g, '');
  const image = siteUrl ? new URL('share-preview.jpg', siteUrl).href : 'share-preview.jpg';
  html = html.replace(/<meta\b[^>]*>/gi, tag => {
    const key = /\b(?:property|name)=["']([^"']+)["']/.exec(tag)?.[1];
    return ['og:image', 'twitter:image'].includes(key)
      ? tag.replace(/\bcontent=(["'])[^"']*\1/, `content="${escapeAttribute(image)}"`)
      : tag;
  });
  html = html.replace(/(<script\b[^>]*\bid=["']portfolio-schema["'][^>]*>)([\s\S]*?)(<\/script>)/i, (_, open, json, close) => {
    const schema = JSON.parse(json);
    delete schema.url;
    delete schema['@id'];
    delete schema.mainEntity.url;
    delete schema.mainEntity.image;
    delete schema.mainEntity['@id'];
    if (siteUrl) {
      schema.url = siteUrl;
      schema['@id'] = siteUrl + '#profile';
      Object.assign(schema.mainEntity, {
        '@id': siteUrl + '#person', url: siteUrl,
        image: new URL('my-photo.png', siteUrl).href,
      });
    }
    return open + JSON.stringify(schema).replaceAll('<', '\\u003c') + close;
  });
  let robots = 'User-agent: *\nAllow: /\n';
  let sitemap = null;
  if (siteUrl) {
    const canonical = escapeAttribute(siteUrl);
    const metadata = `\n<!-- deployment-seo:start -->\n<link rel="canonical" href="${canonical}" />\n<meta property="og:url" content="${canonical}" />\n<meta name="twitter:url" content="${canonical}" />\n<!-- deployment-seo:end -->\n`;
    html = html.replace(/<\/head>/i, metadata + '</head>');
    robots += `\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`;
    // Section routes show the same portfolio, so only its canonical page is listed.
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(siteUrl)}</loc></url></urlset>\n`;
  }
  return { html, robots, sitemap, siteUrl };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = JSON.parse(await readFile(path.join(root, 'seo.config.json'), 'utf8'));
  const publicUrl = process.env.SITE_URL || config.siteUrl ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production' ? process.env.URL : '');
  const output = path.join(root, 'dist/my-portfolio/browser');
  const result = prepareMetadata(await readFile(path.join(output, 'index.html'), 'utf8'), publicUrl);
  await writeFile(path.join(output, 'index.html'), result.html);
  await writeFile(path.join(output, 'robots.txt'), result.robots);
  if (result.sitemap) await writeFile(path.join(output, 'sitemap.xml'), result.sitemap);
  else await rm(path.join(output, 'sitemap.xml'), { force: true });
  console.log(result.siteUrl
    ? `SEO: configured share previews, canonical URL and sitemap for ${result.siteUrl}`
    : 'SEO: preview artwork and metadata ready. Set siteUrl in seo.config.json or SITE_URL when a public URL is available.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
