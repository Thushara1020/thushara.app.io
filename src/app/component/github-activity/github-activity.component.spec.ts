import { TestBed } from '@angular/core/testing';
import { GithubActivityComponent } from './github-activity.component';

describe('GithubActivityComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GithubActivityComponent] });
  });

  it('aligns dates to Sunday-first weeks and shows real contribution counts', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({
      contributions: [
        { date: '2026-11-21', count: 5, level: 2 },
        { date: '2026-11-22', count: 1, level: 1 },
      ],
    })));
    const fixture = TestBed.createComponent(GithubActivityComponent);
    const component = fixture.componentInstance;
    await component.load();

    expect(component.total()).toBe(6);
    expect(component.weeks().length).toBe(2);
    expect(component.weeks()[0].slice(0, 6)).toEqual(Array(6).fill(null));
    expect(component.weeks()[0][6]?.date).toBe('2026-11-21');
    expect(component.weeks()[1][0]?.date).toBe('2026-11-22');
    expect(component.weeks()[1].slice(1)).toEqual(Array(6).fill(null));
    expect(component.weeks()[1][0]?.label).toContain('1 contribution on');
    fixture.destroy();
  });

  it('supports retrying after a failed request without showing a fabricated calendar', async () => {
    const fetch = spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 503 }));
    const fixture = TestBed.createComponent(GithubActivityComponent);
    const component = fixture.componentInstance;
    await component.load();
    expect(component.failed()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.weeks()).toEqual([]);

    fetch.and.resolveTo(new Response(JSON.stringify({
      contributions: [{ date: '2026-11-22', count: 0, level: 0 }],
    })));
    await component.load();
    expect(component.failed()).toBeFalse();
    expect(component.weeks()[0][0]?.count).toBe(0);
    fixture.destroy();
  });

  it('renders contribution links and the intensity legend', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({
      contributions: [{ date: '2026-11-22', count: 8, level: 4 }],
    })));
    const fixture = TestBed.createComponent(GithubActivityComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const day = fixture.nativeElement.querySelector('a.day') as HTMLAnchorElement;
    expect(day.href).toContain('github.com/Thushara1020?tab=overview&from=2026-11-22');
    expect(day.getAttribute('data-level')).toBe('4');
    expect(day.getAttribute('aria-label')).toContain('8 contributions on');
    expect(fixture.nativeElement.querySelectorAll('.legend .day').length).toBe(5);
    fixture.destroy();
  });
});
