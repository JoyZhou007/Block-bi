import {Component, Input, ElementRef, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'emoji-category',
  encapsulation: ViewEncapsulation.None,
  styles: [':host {display: flex;flex-wrap: wrap;justify-content: space-between;margin: 0 0 10px;}'],
  template: `
  <p class="emoji-category">{{category.name}}</p>
  `
})

export class EmojiCategoryComponent {
  @Input('category') category;

  constructor(private _element: ElementRef) { }

  public scrollIntoView() {
    this._element.nativeElement.scrollIntoView();
  }
}
