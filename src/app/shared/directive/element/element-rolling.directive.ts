import {
  Directive, Input, ContentChild, Inject, Renderer, AfterViewInit, ElementRef, HostListener,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[elementRolling]'
})

export class ElementRollingDirective implements AfterViewInit,OnInit {

  private rollWidth: number;
  private rollLeft: any = 0;
  private len: number;
  private type: string;
  private parentWidth: number;
  private rollingWidth: number;

  @ContentChild('rollLeftBut') private rollLeftBut: ElementRef;
  @ContentChild('rollRightBut') private rollRightBut: ElementRef;
  @ContentChild('rollContent') private rollContent: any;
  @Input('elementType') private elementType: string;
  private leftTimer: any;
  private rightTimer: any;
  private initOffset: number = 0;

  constructor(public renderer: Renderer,
              @Inject('page.element') public element: any) {
  }
  @Input() set offsetLength(dataOption){
    //默认移动值
    this.initOffset = -dataOption;
    this.rollLeft = -dataOption;
  }
  @HostListener('document:mouseup', ['$event'])
  mouseup(event: any) {
    clearInterval(this.rightTimer);
    clearInterval(this.leftTimer);
  }
  ngOnInit(){
    setTimeout(() => {
      this.rollContent.nativeElement.style.left = this.initOffset + 'px';
    } ,500);
  }
  ngAfterViewInit() {
    this.len = this.rollContent.nativeElement.children.length;

    //获取滚动宽度
    if (this.len > 0) {
      //不知道为什么拿到的宽度不准 所以延迟 500ms
      setTimeout(() => {
        this.getRollWidth(this.rollContent.nativeElement.children[0]);
      }, 500);
      this.parentWidth = this.element.getElementVal(this.rollContent.nativeElement.parentNode, 'width');
      this.type = (this.elementType === 'marginLeft') ? 'marginLeft' : 'left';
      this.renderer.setElementStyle(this.rollContent.nativeElement, this.type, '0');
      if ((this.len * this.rollWidth) >= this.parentWidth) {
        this.renderer.setElementStyle(this.rollContent.nativeElement, 'width', this.len * this.rollWidth + 'px');
      }
    }

    //滚动
    this.butRolling(this.rollContent.nativeElement);
  }

  /**
   * 滚动元素
   * @param el
   */
  butRolling(el: any) {

    if (this.len * this.rollWidth < this.parentWidth) return false;

    //左边按钮
    if (this.rollLeftBut) {
      this.rollLeftBut.nativeElement.onclick = (event: any) => {
        event.stopPropagation();
        this.rollingFn(el, 0);
      };
      this.rollLeftBut.nativeElement.onmousedown = (event: any) => {
        clearInterval(this.rightTimer);
        clearInterval(this.leftTimer);
        event.stopPropagation();
        this.leftTimer = setInterval((event: any) => {
          this.rollingFn(el, 0);
        }, 500);
      };
    }

    //右边按钮
    if (this.rollRightBut) {
      this.rollRightBut.nativeElement.onclick = (event: any) => {
        event.stopPropagation();
        this.rollingFn(el, 1);
      };
      this.rollRightBut.nativeElement.onmousedown = (event: any) => {
        event.stopPropagation();
        this.rightTimer = setInterval((event: any) => {
          clearInterval(this.leftTimer);
          this.rollingFn(el, 1);
        }, 500);
      };
    }
  }

  /**
   * 滚动
   * @param el
   * @param opr
   */
  rollingFn(el: any, opr: number) {
    let left: any = this.element.getElementVal(el, this.type);
    this.len = this.rollContent.nativeElement.children.length;
    this.renderer.setElementStyle(this.rollContent.nativeElement, 'width', this.len * this.rollWidth + 'px');

    if (opr === 0) {
      this.rollLeft += this.rollWidth;
      if (this.rollLeft >= 0) {
        this.rollLeft = 0;
        this.renderer.setElementStyle(el, this.type, '0');
        clearInterval(this.leftTimer);
        return false;
      }
    } else if (opr === 1) {
      this.rollLeft -= this.rollWidth;
      if (Math.abs(this.rollLeft) > (this.len * this.rollWidth - this.parentWidth)) {
        this.renderer.setElementStyle(el, this.type, left + 'px');
        this.rollLeft = left;
        clearInterval(this.rightTimer);
        return false;
      }
    }
    this.renderer.setElementStyle(el, this.type, this.rollLeft + 'px');
  }

  /**
   * 获取滚动宽度
   * @param el
   */
  getRollWidth(el: any) {
    //let widthArr: any[] = [];
    //let prevWidth: number;
    let borderLeft: number = this.element.getElementVal(el, 'borderLeftWidth');
    let borderRight: number = this.element.getElementVal(el, 'borderRightWidth');
    let marginRight: number = this.element.getElementVal(el, 'marginRight');
    let marginLeft: number = this.element.getElementVal(el, 'marginLeft');
    let paddingLeft: number = this.element.getElementVal(el, 'paddingLeft');
    let paddingRight: number = this.element.getElementVal(el, 'paddingRight');
    let width: number = this.element.getElementVal(el, 'width');
    this.rollWidth = width + paddingRight + paddingLeft + marginLeft + marginRight + borderRight + borderLeft;
  }

}