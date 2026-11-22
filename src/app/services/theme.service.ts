import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  readonly theme = signal<Theme>('dark');
  private explicit = false;

  constructor() {
    let saved: string | null = null;
    try { saved = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be unavailable. */ }
    this.explicit = saved === 'light' || saved === 'dark';
    this.apply(saved === 'light' || saved === 'dark' ? saved : this.systemTheme());

    const systemChanged = (): void => {
      if (!this.explicit) this.apply(this.systemTheme());
    };
    const storageChanged = (event: StorageEvent): void => {
      if (event.key !== 'portfolio-theme' && event.key !== null) return;
      const value = event.newValue;
      this.explicit = value === 'light' || value === 'dark';
      this.apply(this.explicit ? value as Theme : this.systemTheme());
    };
    this.media.addEventListener('change', systemChanged);
    window.addEventListener('storage', storageChanged);
    inject(DestroyRef).onDestroy(() => {
      this.media.removeEventListener('change', systemChanged);
      window.removeEventListener('storage', storageChanged);
    });
  }

  toggle(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.explicit = true;
    this.apply(next);
    try { localStorage.setItem('portfolio-theme', next); } catch { /* The current visit still uses the selected theme. */ }
  }

  private systemTheme(): Theme { return this.media.matches ? 'dark' : 'light'; }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f6f2' : '#0c0c12');
  }
}
