import {
  Directive, ElementRef, Input, ContentChild,
  Inject, Renderer, AfterContentInit, EventEmitter, Output
} from '@angular/core';
import * as autoFadeConfig from '../../config/autoFade.config';
@Directive({
  selector: '[autoFade]'
})
export class AutoFadeDirective implements AfterContentInit {
  @ContentChild('closeBut') closeBut: any;
  @ContentChild('messageContent') messageContent: any;
  @ContentChild('autoFadeElement') autoFadeElement: any; //notification 弹框
  @ContentChild('progress') progress: any; //进度条

  public _hideClass: string; //隐藏class
  public _showClass: string;
  public notificationList: any; //要显示的notification列表
  public notificationIndex: number;//操作的notification索引
  private currentObj: any = {};  //当前notification
  private isHide: boolean = true; //是否执行消失


  @Output() public hideNotification = new EventEmitter<any>();
  @Output() public showNotification = new EventEmitter<any>();

  @Input() set setFadeIn(data: any) {
    this.setSettings(data);
  }

  setSettings(data: any) {
    if (data) {
      this._hideClass = data.data.hideClass ? data.data.hideClass : '';
      this._showClass = data.data.showClass ? data.data.showClass : '';
      this.notificationList = data.sendObj; //notification 列表
      this.notificationIndex = data.index; //当前notification 对象索引
      this.currentObj = data.currentObj;
      this.notificationList[this.notificationIndex].betweenTime = 0;
    }
  }

  constructor(@Inject('app.config') public appConfig: any,
              @Inject('page.element') public element: any,
              @Inject('page-animation.service') public animationService: any,
              public el: ElementRef,
              public renderer: Renderer) {
  }


  //初始化页面后
  ngAfterContentInit() {
    this.autoFadeOut(); //定时关闭notification
    this.openMessage(); //打开notification
    //进度条改变
    //  this.progressChange();
    //鼠标方法
    this.mouserEvent();
  }

  mouserEvent() {
    //鼠标移上
    this.autoFadeElement.nativeElement.onmouseenter = () => {
      if (this.notificationList[this.notificationIndex]) {
       /* clearInterval(this.notificationList[this.notificationIndex].progress);
        this.notificationList[this.notificationIndex].progress = null;*/
        this.isHide = false;
        this.notificationList[this.notificationIndex].hoverTime = new Date().getTime(); //鼠标移上时间
        clearTimeout(this.notificationList[this.notificationIndex].timer);
        this.notificationList[this.notificationIndex].timer = null;
      }
    };


    //鼠标移开
    this.autoFadeElement.nativeElement.onmouseleave = () => {
      if (this.notificationList[this.notificationIndex]) {
        // clearInterval(this.notificationList[this.notificationIndex].progress);
        this.isHide = true;
        this.notificationList[this.notificationIndex].outTime = new Date().getTime(); //鼠标移出时间
        this.notificationList[this.notificationIndex].betweenTime +=
          this.notificationList[this.notificationIndex].outTime - this.notificationList[this.notificationIndex].hoverTime; //移出与移入时间间隔
        this.notificationList[this.notificationIndex].remainTimeNumber =  //剩余执行时间
          autoFadeConfig.AUTOFADE_SUM_TIME - (this.notificationList[this.notificationIndex].outTime - this.notificationList[this.notificationIndex].startTime -
          this.notificationList[this.notificationIndex].betweenTime);
        //重新绑定要消失的时间
        this.notificationList[this.notificationIndex].timer = setTimeout(() => {
          // clearInterval(this.notificationList[this.notificationIndex].progress);
          this.hideNotification.emit({isHide: this.isHide, data: this.notificationIndex});
          this.closeMessage();
        }, this.notificationList[this.notificationIndex].remainTimeNumber);
        //重新绑定进度条进度
        //  this.progressChange(this.notificationList[this.notificationIndex].remainTimeNumber,'leave');
      }
    }
  }

  /**
   * 关闭 notification
   */
  autoFadeOut() {
    this.notificationList[this.notificationIndex].startTime = new Date().getTime();//开始执行的时间
    this.notificationList[this.notificationIndex].timer = setTimeout(() => {
      this.hideNotification.emit({isHide: this.isHide, data: this.notificationIndex});
    }, this.appConfig.notificationShowTime);
  }

  /**
   * 进度条长度改变
   */
  progressChange(time?: number,leave?:string) {
    let self = this;
    let now = new Date().getTime() - this.notificationList[this.notificationIndex].startTime;
    let t = time ? time : autoFadeConfig.AUTOFADE_SUM_TIME -now;
    let step = (Number(this.progress.nativeElement.style.width.split('%')[0]) / t) *  autoFadeConfig.AUTOFADE_PROGRESS_INTERVAL_TIME;
    if (this.notificationList[this.notificationIndex]) {
      clearInterval(this.notificationList[this.notificationIndex].progress);
      this.notificationList[this.notificationIndex].progress = setInterval(() => {
          if(!leave){
            clearInterval(this.notificationList[this.notificationIndex].progress);
            if(10000 - now > 0){
              self.progressChange(10000 - now);
            }
          }
        if (parseInt(this.progress.nativeElement.style.width.split('%')[0]) <= 0) {
          clearInterval(this.notificationList[this.notificationIndex].progress);
        }
        this.progress.nativeElement.style.width = (Number(this.progress.nativeElement.style.width.split('%')[0]) - step) + '%';
      }, autoFadeConfig.AUTOFADE_PROGRESS_INTERVAL_TIME);
    }
  }

  /**
   * 关闭 notification
   */
  closeMessage() {
    this.animationService.cssAnimate(
      this.el.nativeElement, this._hideClass, () => {
        this.hideNotification.emit();
      }, this._showClass);
  }

  /**
   * 显示 notification
   */
  openMessage() {
    setTimeout(() => {
      this.showNotification.emit();
      this.animationService.cssAnimate(
        this.el.nativeElement, this._showClass, () => {
          // this.autoFadeOut();
        }, this._hideClass);
    }, autoFadeConfig.AUTOFADE_SHOW_TRANSFORM_TIME);
  }

}
