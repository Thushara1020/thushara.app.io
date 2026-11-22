import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeSiteUrl, prepareMetadata } from './prepare-seo.mjs';

const source = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');

test('supports local development without inventing a public URL', () => {
  const result = prepareMetadata(source, '');
  assert.equal(result.sitemap, null);
  assert.doesNotMatch(result.html, /rel="canonical"|property="og:url"/);
  assert.match(result.html, /content="share-preview.jpg"/);
  assert.doesNotMatch(result.robots, /Sitemap:/);
});

test('writes absolute share links and a single canonical page, including subdirectory hosting', () => {
  const result = prepareMetadata(source, 'https://portfolio.test/my-portfolio');
  assert.match(result.html, /rel="canonical" href="https:\/\/portfolio.test\/my-portfolio\/"/);
  assert.equal((result.html.match(/content="https:\/\/portfolio.test\/my-portfolio\/share-preview.jpg"/g) ?? []).length, 2);
  assert.match(result.robots, /Sitemap: https:\/\/portfolio.test\/my-portfolio\/sitemap.xml/);
  assert.match(result.sitemap, /<loc>https:\/\/portfolio.test\/my-portfolio\/<\/loc>/);
  const schema = JSON.parse(result.html.match(/id="portfolio-schema">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.mainEntity.image, 'https://portfolio.test/my-portfolio/my-photo.png');
  assert.equal(schema.url, 'https://portfolio.test/my-portfolio/');
});

test('can update a deployment URL without duplicate or stale metadata', () => {
  const first = prepareMetadata(source, 'https://old.test').html;
  const next = prepareMetadata(first, 'https://new.test').html;
  assert.doesNotMatch(next, /old.test/);
  assert.equal((next.match(/rel="canonical"/g) ?? []).length, 1);
  assert.equal((next.match(/property="og:url"/g) ?? []).length, 1);
});

test('rejects localhost and non-HTTPS deployment addresses', () => {
  assert.throws(() => normalizeSiteUrl('http://portfolio.test'));
  assert.throws(() => normalizeSiteUrl('https://localhost:4200'));
  assert.throws(() => normalizeSiteUrl('javascript:alert(1)'));
});
