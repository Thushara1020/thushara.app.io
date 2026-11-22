import { Component, ChangeDetectionStrategy } from '@angular/core';

import { NavbarComponent } from '../../component/navbar/navbar.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { PortfoliocomponeComponent } from '../../component/portfoliocompone/portfoliocompone.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, PortfoliocomponeComponent],
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent {
}