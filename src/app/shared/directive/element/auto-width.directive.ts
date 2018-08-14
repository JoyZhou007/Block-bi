import {
  Directive, ElementRef,
  Inject, OnInit, Input, AfterViewInit, HostListener, OnDestroy
} from '@angular/core';

import {ImgService} from '../../services/index.service';
import {Subscription} from "rxjs/Subscription";


@Directive({
  selector: '[autoWidth]',
  providers: [ImgService]
})
export class AutoWidthDirective implements OnInit,AfterViewInit, OnDestroy {

  public option : any = {
    type: 0,    //元素类型, 0:图片 1:其他
    margin: 50,  //离浏览器边距
    src : '',
    fixedWidth : 0 //需要手动添加/减少的宽度
  }; //auto 选项

  public isViewInit : boolean = false;
  public windowAttr : any;

  public elementAttr : any;
  public subscription: Subscription;
  constructor(
      @Inject('app.config') public appConfig:any,
      @Inject('type.service') public typeService : any,
      @Inject('page.element') public elementService:any,
      @Inject('notification.service') public notificationService:any,
      public imgService:ImgService,
      public element:ElementRef
  ) {
  }

  @Input() set setOption(option: any) {
    if(option) {
      this.typeService.mergeObj(this.option, option);
      if(this.elementAttr) {
        this.resetShow();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  //初始化页面后
  ngOnInit() {
    this.windowAttr = this.elementService.getWindowAttr();

    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (data:any) => {
        if(data.act && data.act === this.notificationService.config.ACTION_WINDOW_RESIZE) {
          this.windowAttr = data.eventTarget;
        }
        this.dealShowElement();
      });

  }

  ngAfterViewInit() {
    this.isViewInit = true;
    this.dealShowElement();
  }


  dealShowElement() {
    if(this.isViewInit) {
      if(this.option.type === 1) {
        this.initImg(this.element.nativeElement.src, (img : any) => {
          this.elementAttr = img;
          this.resetShow();
        });
      } else if(this.option.type === 0) {
        if(this.option.src) {
          this.initImg(this.option.src, (img : any) => {
            this.elementAttr = img;
            this.resetShow();
          });
        } else {
          let clientRect = this.element.nativeElement.getBoundingClientRect();
          this.elementAttr = {
            width : clientRect.width.replace('px', ''),
            height : clientRect.height.replace('px', '')
          };
          this.resetShow();
        }
      }
    }
  }

  /**
   * 重新设置元素显示宽度
   *
   * @param attr width 元素宽度
   * @param attr height 元素高度
   */
  resetShow() {
    let width = parseFloat(this.elementAttr.width);
    let height = parseFloat(this.elementAttr.height);

    let showAreaWidth :number = parseFloat(this.windowAttr.innerWidth)
      - this.option.margin * 2 + this.option.fixedWidth;

    if(width > showAreaWidth) {
      this.element.nativeElement.style.maxWidth = showAreaWidth+'px';
    }
  }

  /**
   * 初始化图片
   */
  initImg(src:string, callBack:any) {
    this.imgService.readyImg(src, callBack);
  }



}
