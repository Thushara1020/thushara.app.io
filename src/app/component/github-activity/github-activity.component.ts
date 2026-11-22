import { Component, OnDestroy, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';

interface Contribution {
  date: string;
  count: number;
  level: number;
}

interface CalendarDay extends Contribution {
  label: string;
}

@Component({
  selector: 'app-github-activity',
  templateUrl: './github-activity.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './github-activity.component.css',
})
export class GithubActivityComponent implements OnInit, OnDestroy {
  readonly profileUrl = 'https://github.com/Thushara1020';
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly weeks = signal<(CalendarDay | null)[][]>([]);
  readonly months = signal<{ label: string; column: number }[]>([]);
  readonly total = signal(0);
  readonly levels = [0, 1, 2, 3, 4];
  private controller?: AbortController;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.loading.set(true);
    this.failed.set(false);
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      // Public profile data; no GitHub token is exposed in the browser.
      const response = await fetch(
        'https://github-contributions-api.jogruber.de/v4/Thushara1020?y=last',
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error('Contribution request failed');
      const data = (await response.json()) as { contributions: Contribution[] };
      if (!Array.isArray(data.contributions) || !data.contributions.length) {
        throw new Error('Contribution data is unavailable');
      }
      const days = [...data.contributions].sort((a, b) => a.date.localeCompare(b.date));
      const weeks: (CalendarDay | null)[][] = [];
      const months: { label: string; column: number }[] = [];
      const formatter = new Intl.DateTimeFormat('en', {
        month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      });
      let previousMonth = '';
      let week: (CalendarDay | null)[] = Array(
        new Date(days[0].date + 'T00:00:00Z').getUTCDay(),
      ).fill(null);

      for (const day of days) {
        const date = new Date(day.date + 'T00:00:00Z');
        const month = day.date.slice(0, 7);
        if (month !== previousMonth) {
          // Reserve enough space so adjacent month labels never overlap.
          const column = weeks.length + 1;
          if (!months.length || column - months[months.length - 1].column >= 2) {
            months.push({
              label: date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }),
              column,
            });
          }
          previousMonth = month;
        }
        week.push({
          ...day,
          label: `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatter.format(date)}`,
        });
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);
      this.weeks.set(weeks);
      this.months.set(months);
      this.total.set(days.reduce((sum, day) => sum + day.count, 0));
    } catch {
      if (this.controller === controller) this.failed.set(true);
    } finally {
      clearTimeout(timeout);
      if (this.controller === controller) this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.controller?.abort();
    this.controller = undefined;
  }
}
