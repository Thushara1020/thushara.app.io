import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';

interface Particle {
  x: number; y: number; dx: number; dy: number;
  size: number; delay: number; alpha: number; color: string;
}

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

@Directive({ selector: '[appScrollParticles]' })
export class ScrollParticlesDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private image?: HTMLImageElement;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private resizeObserver?: ResizeObserver;
  private particles: Particle[] = [];
  private frame = 0;
  private resizeFrame = 0;
  private progress = 0;
  private target = 0;
  private start = 0;
  private distance = 1;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private destroyed = false;
  private originalOpacity = '';
  private originalOpacityPriority = '';

  ngAfterViewInit(): void {
    this.image = this.host.querySelector<HTMLImageElement>('.hero-portrait') ?? undefined;
    if (!this.image) return;
    this.originalOpacity = this.image.style.getPropertyValue('opacity');
    this.originalOpacityPriority = this.image.style.getPropertyPriority('opacity');
    this.zone.runOutsideAngular(() => {
      this.image!.addEventListener('load', this.rebuild);
      window.addEventListener('scroll', this.scroll, { passive: true });
      window.addEventListener('resize', this.queueResize, { passive: true });
      this.motion.addEventListener('change', this.rebuild);
      this.resizeObserver = new ResizeObserver(this.queueResize);
      this.resizeObserver.observe(this.host);
      if (this.image!.complete && this.image!.naturalWidth) this.rebuild();
    });
  }

  private readonly queueResize = (): void => {
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0;
      this.rebuild();
    });
  };

  private readonly rebuild = (): void => {
    if (this.destroyed || !this.image?.naturalWidth) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.restorePhoto();
    this.particles = [];
    if (this.motion.matches) return;
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    const sample = document.createElement('canvas');
    sample.width = width;
    sample.height = height;
    const sampling = sample.getContext('2d', { willReadFrequently: true });
    if (!sampling) return;
    const style = getComputedStyle(this.image);
    const scale = style.objectFit === 'cover'
      ? Math.max(width / this.image.naturalWidth, height / this.image.naturalHeight)
      : Math.min(width / this.image.naturalWidth, height / this.image.naturalHeight);
    const drawWidth = this.image.naturalWidth * scale;
    const drawHeight = this.image.naturalHeight * scale;
    const horizontal = style.objectPosition.split(/\s+/)[0];
    const left = horizontal === '100%' || horizontal === 'right'
      ? width - drawWidth : horizontal === '0%' || horizontal === 'left' ? 0 : (width - drawWidth) / 2;
    const top = height - drawHeight;
    sampling.drawImage(this.image, left, top, drawWidth, drawHeight);
    let pixels: Uint8ClampedArray;
    try { pixels = sampling.getImageData(0, 0, width, height).data; }
    catch { return; } // Keep the normal image if a replacement source cannot be sampled.
    const step = Math.max(3, Math.sqrt(width * height / 16000));
    for (let y = step / 2; y < height; y += step) {
      for (let x = step / 2; x < width; x += step) {
        const offset = (Math.floor(y) * width + Math.floor(x)) * 4;
        const alpha = pixels[offset + 3] / 255 * clamp((height - y) / (height * .15));
        if (alpha < .12) continue;
        const random = (seed: number): number => {
          const value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
          return value - Math.floor(value);
        };
        this.particles.push({
          x, y, dx: (random(1) - .5) * width * 1.6,
          dy: (.3 + random(2) * .9) * Math.max(height, window.innerHeight) * 1.3,
          size: step * (.72 + random(3) * .22),
          delay: (1 - y / height) * .26 + random(4) * .08,
          alpha, color: `rgb(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]})`,
        });
      }
    }
    if (!this.particles.length) return;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'portrait-particles';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;';
      this.context = this.canvas.getContext('2d') ?? undefined;
      this.host.ownerDocument.body.append(this.canvas);
    }
    if (!this.context) return;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.viewportWidth * ratio);
    this.canvas.height = Math.round(this.viewportHeight * ratio);
    Object.assign(this.canvas.style, {
      width: `${this.viewportWidth}px`, height: `${this.viewportHeight}px`,
    });
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.start = Math.max(0, this.host.getBoundingClientRect().top + window.scrollY - window.innerHeight * .25);
    this.distance = Math.max(250, height * .75);
    this.progress = this.target = this.scrollProgress();
    this.draw();
  };

  private readonly scroll = (): void => {
    if (this.motion.matches || !this.particles.length || this.destroyed) return;
    this.target = this.scrollProgress();
    if (!this.frame) this.frame = requestAnimationFrame(this.animate);
  };

  private readonly animate = (): void => {
    this.frame = 0;
    if (this.destroyed || this.motion.matches) return;
    this.progress += (this.target - this.progress) * .2;
    if (Math.abs(this.target - this.progress) < .001) this.progress = this.target;
    this.draw();
    if (this.progress !== this.target) this.frame = requestAnimationFrame(this.animate);
  };

  private scrollProgress(): number {
    // The extra travel lets particles fall beyond the hero before fading away.
    return Math.max(0, Math.min(2.2, (window.scrollY - this.start) / this.distance));
  }

  private draw(): void {
    if (!this.context || !this.canvas || !this.image) return;
    const context = this.context;
    context.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    if (this.progress < .002) { this.restorePhoto(); return; }
    this.canvas.hidden = this.progress >= 2.2;
    const origin = this.host.getBoundingClientRect();
    const mix = clamp(this.progress / .09);
    this.image.style.setProperty('opacity', String(1 - clamp(this.progress / .32)), 'important');
    for (const particle of this.particles) {
      const local = clamp((this.progress - particle.delay) / (1 - particle.delay));
      const flight = Math.max(0, this.progress - particle.delay);
      const movement = flight * flight;
      const x = origin.left + particle.x + particle.dx * movement * .55;
      const y = origin.top + particle.y + particle.dy * movement;
      if (x < -10 || x > this.viewportWidth + 10 || y < -10 || y > this.viewportHeight + 10) continue;
      const size = particle.size * (1 + local * .8);
      context.globalAlpha = particle.alpha * mix * (1 - Math.pow(clamp((flight - .25) / 1.5), 1.4));
      context.fillStyle = particle.color;
      context.fillRect(
        x - size / 2, y - size / 2, size, size,
      );
    }
    context.globalAlpha = 1;
  }

  private restorePhoto(): void {
    this.image?.style.setProperty('opacity', this.originalOpacity, this.originalOpacityPriority);
    if (this.canvas) this.canvas.hidden = true;
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    cancelAnimationFrame(this.resizeFrame);
    window.removeEventListener('scroll', this.scroll);
    window.removeEventListener('resize', this.queueResize);
    this.motion.removeEventListener('change', this.rebuild);
    this.image?.removeEventListener('load', this.rebuild);
    this.resizeObserver?.disconnect();
    this.restorePhoto();
    this.canvas?.remove();
  }
}
