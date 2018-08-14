import {Inject, Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[contentHeightDirective]'
})
export class ContentHeightDirective implements OnInit {
  //内容里浏览器底部的距离
  public _contentBottom : number;

  public CONTENT_RELATIVE : number = 160;

  public contentPosition : any;

  public windowAttr : any;


  @Input() set contentBottom(value : number) {
    this._contentBottom = value;
    this.setHeight();
  }
  constructor(
      public element:ElementRef,
      @Inject('page.element') public elementService:any
  ) {
  }

  ngOnInit() {
    this.setHeight();
  }


  getWindowAttr() {
    this.contentPosition = this.elementService
      .getPosition(this.element.nativeElement);
    this.windowAttr = this.elementService.getWindowAttr();
  }

  getHeight() : number {
    this._contentBottom = typeof this._contentBottom !== 'undefined' ?
        this._contentBottom: this.CONTENT_RELATIVE;

    return this.windowAttr.innerHeight
        - this.contentPosition.y - this._contentBottom;
  }


  setHeight() {
    this.getWindowAttr();
    this.element.nativeElement.style.height = this.getHeight()+'px';
  }



}
