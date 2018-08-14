import {Component, Input, EventEmitter, Output, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'emoji-categories',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  template: `
      <div class="emoji-header-but">
        <ng-container *ngFor="let category of emojisCategories">
          <emoji-button 
            (selection)="handleCategorySelection($event)"
            [dataToEmit]="category"
            [emoji]="category.icon"></emoji-button>
        </ng-container>
      </div>
  `
})

export class EmojiCategoriesComponent {
  @Input('emojisCategories') emojisCategories;
  @Output('categorySelection') categorySelection = new EventEmitter<any>();
  
  constructor() {}

  handleCategorySelection(event) {
    this.categorySelection.emit(event);
  }
}
