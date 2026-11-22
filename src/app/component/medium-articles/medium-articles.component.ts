import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { SAVED_ARTICLES } from './medium-articles.data';

export interface MediumArticle {
  title: string;
  url: string;
  image: string;
  excerpt: string;
  date: string;
  dateLabel: string;
}

export function parseMediumArticle(value: unknown): MediumArticle | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item['title'] !== 'string' || typeof item['link'] !== 'string' ||
      typeof item['pubDate'] !== 'string') return null;
  let url: URL;
  try { url = new URL(item['link']); } catch { return null; }
  if (url.protocol !== 'https:' || !(url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com'))) return null;
  const date = new Date(item['pubDate'].replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return null;
  url.search = '';
  const html = typeof item['content'] === 'string' ? item['content'] :
    typeof item['description'] === 'string' ? item['description'] : '';
  // Parse the feed as an inert document; only plain text and image URLs reach the template.
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script, style, iframe').forEach(node => node.remove());
  const excerpt = Array.from(document.querySelectorAll('p'))
    .map(paragraph => paragraph.textContent?.trim() ?? '').filter(Boolean).join(' ')
    .replace(/\s+/g, ' ').trim();
  const candidate = (typeof item['thumbnail'] === 'string' && item['thumbnail']) ||
    document.querySelector('img')?.getAttribute('src') || '';
  let image = '';
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:' && (parsed.hostname.endsWith('.medium.com') || parsed.hostname === 'miro.medium.com')) image = parsed.href;
  } catch { /* A text-only article uses the built-in cover. */ }
  return {
    title: item['title'].trim(), url: url.href, image,
    excerpt: excerpt.length > 165 ? excerpt.slice(0, 165).replace(/\s+\S*$/, '') + '…' : excerpt,
    date: date.toISOString().slice(0, 10),
    dateLabel: date.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
  };
}

@Component({
  selector: 'app-medium-articles',
  templateUrl: './medium-articles.component.html',
  styleUrl: './medium-articles.component.css',
})
export class MediumArticlesComponent implements OnInit, OnDestroy {
  readonly profileUrl = 'https://medium.com/@thusharabawantha2001';
  readonly articles = signal<MediumArticle[]>(SAVED_ARTICLES);
  readonly loading = signal(true);
  readonly failed = signal(false);
  private controller?: AbortController;

  ngOnInit(): void { void this.load(); }

  async load(): Promise<void> {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.loading.set(true);
    this.failed.set(false);
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const feed = 'https://medium.com/feed/@thusharabawantha2001';
      const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed), { signal: controller.signal });
      if (!response.ok) throw new Error('Feed request failed');
      const data = await response.json() as { status?: string; items?: unknown[] };
      if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('Feed is unavailable');
      const articles = data.items.map(parseMediumArticle).filter((item): item is MediumArticle => item !== null)
        .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      if (!articles.length) throw new Error('No articles returned');
      if (this.controller === controller) this.articles.set(articles);
    } catch {
      if (this.controller === controller) this.failed.set(true);
    } finally {
      clearTimeout(timeout);
      if (this.controller === controller) this.loading.set(false);
    }
  }

  imageFailed(event: Event): void {
    (event.target as HTMLImageElement).hidden = true;
  }

  ngOnDestroy(): void {
    this.controller?.abort();
    this.controller = undefined;
  }
}
