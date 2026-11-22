import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollParticlesDirective } from './scroll-particles.directive';

describe('ScrollParticlesDirective', () => {
  let host: HTMLDivElement;
  let image: HTMLImageElement;
  let directive: ScrollParticlesDirective;
  let motion: MediaQueryList;
  let scrollPosition = 0;
  const originalScroll = Object.getOwnPropertyDescriptor(window, 'scrollY');
  const settle = async (): Promise<void> => {
    for (let frame = 0; frame < 35; frame++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  };

  beforeEach(async () => {
    scrollPosition = 0;
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollPosition });
    motion = Object.assign(new EventTarget(), { matches: false }) as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(motion);
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;width:200px;height:240px;';
    image = document.createElement('img');
    image.className = 'hero-portrait';
    image.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:center bottom;';
    const source = document.createElement('canvas');
    source.width = 200; source.height = 240;
    const context = source.getContext('2d')!;
    context.fillStyle = '#247ad5';
    context.fillRect(30, 20, 140, 220);
    image.src = source.toDataURL();
    host.append(image);
    document.body.append(host);
    await image.decode();
    TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: new ElementRef(host) }] });
    directive = TestBed.runInInjectionContext(() => new ScrollParticlesDirective());
  });

  afterEach(() => {
    directive.ngOnDestroy();
    host.remove();
    if (originalScroll) Object.defineProperty(window, 'scrollY', originalScroll);
    else Reflect.deleteProperty(window, 'scrollY');
    TestBed.resetTestingModule();
  });

  it('dissolves on scroll and restores the original photo when scrolling back', async () => {
    directive.ngAfterViewInit();
    expect(document.querySelector<HTMLCanvasElement>('.portrait-particles')?.hidden).toBeTrue();
    scrollPosition = 100;
    window.dispatchEvent(new Event('scroll'));
    await settle();
    const canvas = document.querySelector<HTMLCanvasElement>('.portrait-particles')!;
    expect(canvas.hidden).toBeFalse();
    expect(image.style.opacity).toBe('0');
    expect(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value > 0)).toBeTrue();
    scrollPosition = 0;
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(canvas.hidden).toBeTrue();
    expect(image.style.opacity).toBe('');
  });

  it('keeps the normal image when reduced motion is requested', () => {
    Object.defineProperty(motion, 'matches', { value: true });
    directive.ngAfterViewInit();
    expect(document.querySelector<HTMLCanvasElement>('.portrait-particles')).toBeNull();
    expect(image.style.opacity).toBe('');
  });

  it('lets particles fall below the original portrait boundary', async () => {
    directive.ngAfterViewInit();
    scrollPosition = 180;
    window.dispatchEvent(new Event('scroll'));
    await settle();
    const canvas = document.querySelector<HTMLCanvasElement>('.portrait-particles')!;
    const ratio = canvas.height / window.innerHeight;
    const bottom = Math.ceil(host.getBoundingClientRect().bottom * ratio);
    const pixels = canvas.getContext('2d')!.getImageData(0, bottom, canvas.width, canvas.height - bottom).data;
    expect(pixels.some((value, index) => index % 4 === 3 && value > 0)).toBeTrue();
  });

  it('removes the particle layer when the directive is destroyed', () => {
    directive.ngAfterViewInit();
    expect(document.querySelector<HTMLCanvasElement>('.portrait-particles')).not.toBeNull();
    directive.ngOnDestroy();
    expect(document.querySelector<HTMLCanvasElement>('.portrait-particles')).toBeNull();
    expect(image.style.opacity).toBe('');
  });
});
