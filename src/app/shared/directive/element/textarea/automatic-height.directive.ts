import {
  Directive, Inject, OnInit, Renderer, HostListener, AfterContentChecked, ElementRef
} from '@angular/core';

@Directive({
  selector: '[textareaHeight]'
})

export class AutomaticHeightDirective implements OnInit, AfterContentChecked {
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }
  @HostListener('input',['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjustHeight(this.element.nativeElement.scrollHeight);
  }
  constructor(public element: ElementRef, @Inject('type.service') public typeService: any){
    this.adjustHeight(this.element.nativeElement.scrollHeight);
  }

  ngAfterContentChecked(): void{
    if (this.element.nativeElement) {
      this.adjustHeight();
    }
  }

  adjustHeight(minHeight?: number) {
    if (!minHeight) {minHeight = 20;}
    let el = this.element.nativeElement;
    // 防止字数超出长度
    let maxLen = el.getAttribute('data-maxLength');
    if (maxLen) {
      let countLen = this.typeService.getStringLocaleLen(el.value);
      if (countLen > maxLen) {
        this.element.nativeElement.value = this.typeService.localeSubString(el.value, 0, maxLen);
      }
    }
    // compute the height difference which is caused by border and outline
    let outerHeight = parseInt(window.getComputedStyle(el).height, 10);
    let diff = outerHeight - el.clientHeight;
    // set the height to 0 in case of it has to be shrinked
    el.style.height = 0;
    // set the correct height
    // el.scrollHeight is the full height of the content, not just the visible part
    el.style.height = Math.max(minHeight, el.scrollHeight + diff) + 'px';
  }

}