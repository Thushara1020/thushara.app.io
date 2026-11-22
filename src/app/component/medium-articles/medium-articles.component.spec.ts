import { TestBed } from '@angular/core/testing';
import { MediumArticlesComponent, parseMediumArticle } from './medium-articles.component';

describe('MediumArticlesComponent', () => {
  const item = {
    title: 'A new article', link: 'https://medium.com/@thusharabawantha2001/article-123?source=rss',
    pubDate: '2026-11-20 10:00:00',
    content: '<img src="https://cdn-images-1.medium.com/cover.png"><p>A clear explanation of software architecture.</p><script>alert(1)</script>',
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [MediumArticlesComponent] }));

  it('extracts plain-text summaries and safe article links from the RSS content', () => {
    const article = parseMediumArticle(item);
    expect(article?.url).toBe('https://medium.com/@thusharabawantha2001/article-123');
    expect(article?.image).toBe('https://cdn-images-1.medium.com/cover.png');
    expect(article?.excerpt).toBe('A clear explanation of software architecture.');
    expect(article?.date).toBe('2026-11-20');
    expect(parseMediumArticle({ ...item, link: 'javascript:alert(1)' })).toBeNull();
    expect(parseMediumArticle({ ...item, link: 'https://medium.com.example.com/article' })).toBeNull();
    expect(parseMediumArticle({ ...item, pubDate: 'invalid' })).toBeNull();
  });

  it('shows the three newest articles with links to Medium', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ status: 'ok', items: [
      { ...item, title: 'Older', pubDate: '2026-10-01 10:00:00', link: 'https://medium.com/older' },
      item,
      { ...item, title: 'Newest', pubDate: '2026-11-22 10:00:00', link: 'https://medium.com/newest' },
      { ...item, title: 'Oldest', pubDate: '2026-01-01 10:00:00', link: 'https://medium.com/oldest' },
    ] })));
    const fixture = TestBed.createComponent(MediumArticlesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.articles().map(article => article.title)).toEqual(['Newest', 'A new article', 'Older']);
    expect(fixture.nativeElement.querySelectorAll('.article-card').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.article-copy h3 a').getAttribute('href')).toBe('https://medium.com/newest');
    fixture.destroy();
  });

  it('keeps saved stories visible when the feed is unavailable and supports retry', async () => {
    const fetch = spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 503 }));
    const fixture = TestBed.createComponent(MediumArticlesComponent);
    const component = fixture.componentInstance;
    const saved = component.articles();
    await component.load();
    expect(component.failed()).toBeTrue();
    expect(component.articles()).toEqual(saved);
    fetch.and.resolveTo(new Response(JSON.stringify({ status: 'ok', items: [item] })));
    await component.load();
    expect(component.failed()).toBeFalse();
    expect(component.loading()).toBeFalse();
    expect(component.articles()[0].title).toBe('A new article');
    fixture.destroy();
  });
});
