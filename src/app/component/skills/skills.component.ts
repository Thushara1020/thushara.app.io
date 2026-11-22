import { Component } from '@angular/core';
import { CORE_STACK, SKILL_CATEGORIES } from './skills.data';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
})
export class SkillsComponent {
  readonly coreStack = CORE_STACK;
  readonly categories = SKILL_CATEGORIES;
}
