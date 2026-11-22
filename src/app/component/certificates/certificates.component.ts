import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CERTIFICATES, Certificate } from './certificates.data';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css',
})
export class CertificatesComponent {
  @ViewChild('preview', { static: true }) preview!: ElementRef<HTMLDialogElement>;
  readonly certificates = CERTIFICATES;
  readonly filters = ['All', 'Certificates', 'Badges'] as const;
  readonly activeFilter = signal<string>('All');
  readonly expanded = signal(false);
  readonly selected = signal<Certificate | null>(null);

  get filtered(): Certificate[] {
    return this.certificates.filter(item => this.activeFilter() === 'All' ||
      (this.activeFilter() === 'Badges' ? item.kind === 'Badge' : item.kind === 'Certificate'));
  }

  get visible(): Certificate[] {
    return this.expanded() ? this.filtered : this.filtered.slice(0, 6);
  }

  filter(value: string): void {
    this.activeFilter.set(value);
    this.expanded.set(false);
  }

  open(certificate: Certificate): void {
    this.selected.set(certificate);
    this.preview.nativeElement.showModal();
  }

  close(): void {
    this.preview.nativeElement.close();
  }

  dismissBackdrop(event: MouseEvent): void {
    const dialog = this.preview.nativeElement;
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) this.close();
  }
}
