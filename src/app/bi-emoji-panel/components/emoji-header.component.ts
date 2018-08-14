import {Component, EventEmitter, Output, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'emoji-header',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  template: `
  <emoji-categories [emojisCategories]="emojisCategories" (categorySelection)="categorySelection.emit($event)"></emoji-categories>
  <emoji-search (search)="searchEmitter.emit($event)" [inputAutofocus]="inputAutofocus"></emoji-search>
  `
})

export class EmojiHeaderComponent {
  @Input('emojisCategories') emojisCategories;
  @Input('inputAutofocus') inputAutofocus;

  @Output('categorySelection') categorySelection = new EventEmitter<any>();
  @Output('search') searchEmitter = new EventEmitter<string>();
  
  constructor() { }
}
