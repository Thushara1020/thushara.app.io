import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let media: MediaQueryList;
  let stored: string | null;
  let originalTheme: string | null;
  const setItem = Storage.prototype.setItem;

  beforeEach(() => {
    stored = localStorage.getItem('portfolio-theme');
    originalTheme = document.documentElement.getAttribute('data-theme');
    localStorage.removeItem('portfolio-theme');
    media = new EventTarget() as MediaQueryList;
    Object.defineProperty(media, 'matches', { value: true, writable: true });
    spyOn(window, 'matchMedia').and.returnValue(media);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    if (stored === null) localStorage.removeItem('portfolio-theme');
    else setItem.call(localStorage, 'portfolio-theme', stored);
    if (originalTheme === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', originalTheme);
    document.documentElement.style.colorScheme = originalTheme ?? '';
  });

  it('follows device changes until the visitor explicitly selects a theme', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
    Object.defineProperty(media, 'matches', { value: false });
    media.dispatchEvent(new Event('change'));
    expect(service.theme()).toBe('light');
    service.toggle();
    media.dispatchEvent(new Event('change'));
    expect(service.theme()).toBe('dark');
  });

  it('restores a saved theme and persists a new choice on the document', () => {
    localStorage.setItem('portfolio-theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
    service.toggle();
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('still switches themes when browser storage is blocked', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('Unavailable');
    spyOn(Storage.prototype, 'setItem').and.throwError('Unavailable');
    const service = TestBed.inject(ThemeService);
    expect(() => service.toggle()).not.toThrow();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('synchronizes choices from another tab and restores device preference when cleared', () => {
    const service = TestBed.inject(ThemeService);
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio-theme', newValue: 'light' }));
    expect(service.theme()).toBe('light');
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio-theme', newValue: null }));
    expect(service.theme()).toBe('dark');
  });
});
