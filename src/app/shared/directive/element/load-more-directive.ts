import { Directive, OnInit, AfterViewInit, ContentChild, Input, Renderer, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({
  selector: '[loadMore]'
})

export class LoadMoreDirective implements OnInit, AfterViewInit {

  private loadMoreContentEl: any;
  private height: number;
  private className: string;
  private isBut: boolean = false;
  private getHtml: string;
  private splitHtml: string = '';
  private primaryHtml: string;
  private isShowInit: boolean;

  @ContentChild('loadMoreBut') private loadMoreBut: any;
  @ContentChild('loadMoreHtml') private loadMoreHtml: any;
  @Output() public isShowLoadMoreBut = new EventEmitter<any>();

  /**
   * 默认高度
   * @param height
   */
  @Input() set defaultHeight(height: number) {
    if(height) {
      this.height = height;
    }
  }

  /**
   * 设置的class name
   * @param className
   */
  @Input() set currentClass(className: string) {
    if(className) {
      this.className = className;
    }
  }

  /**
   * 是不是第一次初始化
   * @param isInit
   */
  @Input() set isInit(isInit: boolean) {
    this.isShowInit = isInit;
  }

  /**
   * 设置 content
   * @param html
   */
  @Input() set html(html: string) {
    if(html) {
      this.primaryHtml = this.getHtml = html;
      if(!this.isShowInit) {
        this.setHtml();
      }
    }
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer
  ) {}

  ngOnInit() {
    this.loadMoreContentEl = this.elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this.setHtml();
  }

  setHtml() {
    if(this.loadMoreContentEl) {
      this.renderer.setElementAttribute(this.loadMoreContentEl, 'data-height', this.loadMoreContentEl.offsetHeight);
      if(this.height === 60) {
        this.calcStringLength(this.getHtml);
      }else {
        this.loadMoreHtml.nativeElement.innerText = this.getHtml;
      }
    }
  }

  /**
   * 计算string 的 length
   * @param str
   */
  calcStringLength(str: string) {
    let len: number;
    if(str) {
      str = str.replace(/\r|\n/ig, ' ');
      len = str.length;
      for(let i = 1; i <= len; i++) {
        this.splitHtml = str.substring(0, i);
        this.loadMoreHtml.nativeElement.innerText = this.splitHtml;
        if(this.loadMoreContentEl.offsetHeight > this.height) {
          this.splitHtml = this.splitHtml.substring(0, i - 10);
          this.loadMoreHtml.nativeElement.innerText = this.splitHtml + '...';
          this.renderer.setElementClass(this.loadMoreBut.nativeElement, 'hide', false);
          this.showLoadMore();
          break;
        }
      }
    }
  }

  showLoadMore() {
    this.loadMoreBut.nativeElement.addEventListener('click', (event: any) => {
      event.stopPropagation();
      this.isBut = !this.isBut;
      let html: string = this.isBut ? this.getHtml : this.splitHtml + '...';
      this.renderer.setElementClass(this.loadMoreBut.nativeElement, this.className, this.isBut);
      this.renderer.setElementStyle(this.loadMoreContentEl, 'height', (this.isBut ? 'auto' : this.height + 'px'));
      this.loadMoreHtml.nativeElement.innerText = html;
    });
  }

}