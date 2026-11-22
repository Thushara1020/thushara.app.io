import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificatesComponent } from './certificates.component';

describe('CertificatesComponent', () => {
  let fixture: ComponentFixture<CertificatesComponent>;
  let component: CertificatesComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CertificatesComponent] });
    fixture = TestBed.createComponent(CertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows six initial cards and expands to include every supplied achievement', () => {
    expect(fixture.nativeElement.querySelectorAll('.cert-card').length).toBe(6);
    (fixture.nativeElement.querySelector('.cert-more button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.cert-card').length).toBe(13);
    expect(component.certificates.filter(item => item.kind === 'Certificate').length).toBe(10);
  });

  it('filters badges separately and resets expansion when the filter changes', () => {
    component.expanded.set(true);
    component.filter('Badges');
    fixture.detectChanges();
    expect(component.expanded()).toBeFalse();
    expect(component.visible.length).toBe(3);
    expect(component.visible.every(item => item.issuer === 'Kaggle')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.cert-more')).toBeNull();
    component.filter('Certificates');
    expect(component.filtered.length).toBe(10);
    expect(component.filtered.every(item => item.kind === 'Certificate')).toBeTrue();
  });

  it('opens a modal preview with the original diploma and its supporting transcript', async () => {
    (fixture.nativeElement.querySelector('.cert-preview') as HTMLButtonElement).click();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBeTrue();
    expect(dialog.querySelector('h3')?.textContent).toContain('Level 3 Diploma');
    expect(dialog.querySelector('.certificate-full')?.getAttribute('src')).toBe('certificates/level-3-it-diploma.webp');
    const hrefs = Array.from(dialog.querySelectorAll('a')).map(link => link.getAttribute('href'));
    expect(hrefs).toContain('certificates/level-3-it-diploma.pdf');
    expect(hrefs).toContain('certificates/level-3-it-transcript.pdf');
    const closed = new Promise<void>(resolve => dialog.addEventListener('close', () => resolve(), { once: true }));
    component.close();
    await closed;
    expect(dialog.open).toBeFalse();
    expect(component.selected()).toBeNull();
  });
});
