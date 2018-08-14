import {Component, ViewChild, forwardRef, Output, EventEmitter, Input, ViewEncapsulation} from '@angular/core';
import { EMOJIS } from "../lib/emojis.data";
import { EmojiListComponent } from "./";

@Component({
  selector: 'emoji-content',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="emoji-header"><emoji-header
          [emojisCategories]="emojisCategories"
          (categorySelection)="categorySelectionHandler($event)"
          [inputAutofocus]="inputAutofocus"
          (search)="searchHandler($event)"></emoji-header></div>
  <div class="emoji-list-scroll"><emoji-list [emojis]="emojis" (emoji-selection)="emojiSelectionEmitter.emit($event)"></emoji-list></div>
  <emoji-footer></emoji-footer>
  `
})

export class EmojiContentComponent {
  @ViewChild(forwardRef(() => EmojiListComponent)) emojiListComponent: EmojiListComponent;
  @Output('emoji-selection') emojiSelectionEmitter = new EventEmitter<any>();
  @Input('inputAutofocus') inputAutofocus: boolean;

  private _emojis = EMOJIS;
  emojis = this._emojis.slice();
  emojisCategories = this._emojis.map(category => Object.assign({}, category, { emojis : [] }));

  constructor() {}

  searchHandler(value) {
    let filteredEmojis = this.emojisCategories.map(category => Object.assign({}, category, { emojis : [] }));
    
    value = value.replace(/-/g, '').toLowerCase();

    Object.keys(this._emojis).forEach(i => {
      const category = this._emojis[i];

      category.emojis.forEach(emoji => {
        if (emoji[1].indexOf(value) !== -1) {
          filteredEmojis[i].emojis.push(emoji);
        }
      });
    });

    this.emojis = filteredEmojis;
  }

  categorySelectionHandler(event) {
    this.emojiListComponent.selectCategory(event);
  }
}
