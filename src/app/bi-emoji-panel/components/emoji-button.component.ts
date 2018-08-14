import {Component, Input, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import { EmojiPickerOptions } from "../services";

@Component({
  selector: 'emoji-button',
  styles: [':host { display: inline-block; }'],
  encapsulation: ViewEncapsulation.None,
  template: `
<button
  *ngIf="!emojiPickerOptions.options.sheet;"
  class="emoji-button"
  (click)="selectionEmitter.emit(dataToEmit || emoji)">
  {{emoji[0]}}
</button>
<div #sheetButton *ngIf="emojiPickerOptions.options.sheet">
  <span class="emoji-button-from-sheet-enclosure" 
      (click)="selectionEmitter.emit(dataToEmit || emoji)">
    <span
      class="emoji-button-from-sheet"
      [style.backgroundImage]="'url(' + emojiPickerOptions.options.sheet.url + ')'"
      [style.backgroundPositionX]="-emojiPickerOptions.options.sheet.locator(emoji[1]).x * 25 + 'px'"
      [style.backgroundPositionY]="-emojiPickerOptions.options.sheet.locator(emoji[1]).y * 25 + 'px'">
    </span>
  </span>
</div>`
})

export class EmojiButtonComponent {
  @Input('emoji') emoji;
  @Input('dataToEmit') dataToEmit;
  @Input('options') options;
  @Input('fitzpatrick') fitzpatrick;

  @Output('selection') selectionEmitter : EventEmitter<any> = new EventEmitter();

  constructor(private emojiPickerOptions: EmojiPickerOptions) {}
}
