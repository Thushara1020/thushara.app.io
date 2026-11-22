import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LiveBuildComponent } from '../../component/live-build/live-build.component';
import { GithubActivityComponent } from '../../component/github-activity/github-activity.component';
import { CertificatesComponent } from '../../component/certificates/certificates.component';
import { MediumArticlesComponent } from '../../component/medium-articles/medium-articles.component';
import { ThemeService } from '../../services/theme.service';
import { ScrollParticlesDirective } from '../../directives/scroll-particles.directive';
import { SkillsComponent } from '../../component/skills/skills.component';
import { FEATURED_TECHNOLOGIES } from '../../component/skills/skills.data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [LiveBuildComponent, GithubActivityComponent, CertificatesComponent, MediumArticlesComponent, SkillsComponent, ScrollParticlesDirective],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly featuredTechnologies = FEATURED_TECHNOLOGIES;
  private readonly zone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);
  private observer?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;
  menuOpen = false;
  activeSection = 'home';
  navigate(): void {
    this.menuOpen = false;
  }
  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('.reveal')
      .forEach((el) => this.observer?.observe(el));
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            this.zone.run(() => (this.activeSection = entry.target.id));
        }
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    );
    document
      .querySelectorAll('main > section[id]')
      .forEach((el) => this.sectionObserver?.observe(el));
    const section = this.route.snapshot.data['section'] as string | undefined;
    if (section)
      requestAnimationFrame(() =>
        document
          .getElementById(section)
          ?.scrollIntoView({ behavior: 'instant' }),
      );
    window.addEventListener('keydown', this.keydown);
  }

  private readonly keydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.menuOpen = false;
  };
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.sectionObserver?.disconnect();
    window.removeEventListener('keydown', this.keydown);
  }
}
