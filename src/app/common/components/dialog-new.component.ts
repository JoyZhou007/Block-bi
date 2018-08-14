import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {DialogButton, DialogSettings} from "./dialog/dialog-settings";
import {DynamicComponent} from "./dynamic.component";
import {Subscription} from "rxjs/Subscription";
import {config} from "shelljs";

@Component({
  selector: 'bi-dialog-new',
  templateUrl: '../template/dialog-new.component.html',
  styleUrls: [
    '../../../assets/css/occupation/occupation.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class DialogNewComponent implements OnInit, AfterViewInit, OnDestroy {
  public _dialogSettings: DialogSettings;
  public openBgClass: string = 'di-open-bg';
  public verticalAlignClass: string = 'di-vertical-align';
  public isOpen: boolean = false;
  public hasInit = false;
  public needOpen: boolean = false;
  //当前选择的title
  public currentTitleBtnIdx: number = 1;
  private dynamicComponentHasInit: boolean = false;
  public clickedButton: any;
  public clickedBtn: any;
  public clickedCouldClose: any;
  public clickedEventType: any;
  public loadingClass: string = 'but-loading';

  set dialogSettings(data: DialogSettings) {
    this._dialogSettings = data;
    this._dialogSettings.title = this._dialogSettings.title ? this._dialogSettings.title : 'Dialog';
  }

  get dialogSettings(): DialogSettings {
    return this._dialogSettings;
  }

  private subscription: Subscription;
  public dialogEvent: any = {};
  public errorMsg: string = '';
  @ViewChild('alertWrap') public alertWrap: ElementRef;
  @ViewChild('wrapper') public wrapper: ElementRef;
  @ViewChild('dynamicComponent') dynamicComponent: DynamicComponent;

  @HostListener('document:click', ['$event'])
  click(event: any) {
    if (this.hasInit || this.dynamicComponentHasInit && this.dialogSettings) {
      let isAbleClose: boolean = true;
      //this.dialogSettings.mode === '1'
      //this.dialogSettings.mode === '2'
      //this.dialogSettings.mode === '4'
      if (this.dialogSettings.mode === '5' || this.dialogSettings.mode === '6') {
        isAbleClose = false;
      }
      if (this.isOpen && isAbleClose) {
        event.stopPropagation();
        if (event.target || event.srcElement) {
          let a = event.target ? event.target.classList : event.srcElement.classList;
          if (a && a.length) {
            for (let i = 0; i < a.length; i++) {
              // 点在背景上，关闭dialog
              if (a[i] === this.openBgClass || a[i] === this.verticalAlignClass) {
                this.close();
                this.hasInit = false;
                return;
              }
            }
          }
        }

      }
    }
  }

  constructor(private renderer: Renderer,
              public ele: ElementRef,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('page.element') public element: any,
              @Inject('page-animation.service') public animationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
    //监听ESC 事件
    (<any>document).addEventListener('keydown', (e: any) => {
      if (e.keyCode == 27 && this.dialogSettings && this.dialogSettings.mode === '6') {
        this.close();
      }
    });
    this.ele.nativeElement.addEventListener('dragover', (event: any) => {
      event.preventDefault();
    });
    this.ele.nativeElement.addEventListener('drop', (event: any) => {
      event.preventDefault();
    });

    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACTION_DIALOG_COMPONENT_SHOW) {
        this.setOption(message.data.options);
      }
      if (message.act === this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON &&
        message.hasOwnProperty('data')) {
        this.dealBtnClass(this.clickedBtn, this.clickedButton, this.clickedCouldClose, this.clickedEventType, message.data);
      }
      if (message.act === this.notificationService.config.ACT_COMPONENT_DIALOG_BTN_DISABLE) {
        if (message.hasOwnProperty('data') && message.data.hasOwnProperty('btnList')) {
          this.initBtnDisable(message.data.btnList)
        }
      }
    })
  }

  /**
   * 初始化动态内容
   * @param data
   */
  initDynamicComponent(data: any) {
    this.dynamicComponentHasInit = data;
    if (data && this.needOpen) {
      this.open();
    }
  }


  // notification模块初始化入口
  setOption(option: any) {
    this.setSettings(option);
  }

  /**
   * 详细设置 @see DialogSettings
   * 动态内容 @see FolderTransferComponent.transferTheFile
   * this.dialogService.openNew({
   * });
   * @param data
   */
  setSettings(data: any) {
    if (data) {
      // 组织动态component重复初始化
      if (!(this.dynamicComponent && !data.isSimpleContent && data.componentSelector === this.dynamicComponent.getComponentName())) {
        this.dialogSettings = new DialogSettings(data);
        this.dialogSettings.initHtmlClass();
        this.bindEvent();
        if (this.dialogSettings.mode === '5') {
          this.currentTitleBtnIdx = 1;
        }
        if (this.dialogSettings.isSimpleContent) {
          this.hasInit = true;
          this.open();
        } else {
          this.needOpen = true;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }


  open() {
    if (this.alertWrap && (this.hasInit || this.dynamicComponentHasInit)) {
      this.renderer.setElementStyle(this.alertWrap.nativeElement, 'display', '');
      this.renderer.setElementStyle(this.alertWrap.nativeElement, 'opacity', '0');
      this.isOpen = true;
      this.hasInit = true;
      let initFunc = () => {
        let position: any = this.element.getPosition(this.wrapper.nativeElement);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_DIALOG_SERVICE_POSITION,
          data: position
        })
      };
      setTimeout(() => {
        this.animationService.cssAnimate(this.alertWrap.nativeElement, 'fadeIn', initFunc, null, 'fadeOut');
      }, 16.7);

    }
  }

  close() {
    if (this.alertWrap && this.isOpen) {
      let resetFunc = () => {
        if (typeof this.dialogSettings.beforeCloseEvent === 'function') {
          this.dialogSettings.beforeCloseEvent();
        }
        delete this.clickedButton;
        delete this.clickedCouldClose;
        delete this.clickedEventType;
        this.isOpen = false;
        this.dynamicComponentHasInit = false;
        this.needOpen = false;
        this.hasInit = false;
        if (this.dialogSettings.reset) {
          this.reset();
        }
        if (this.dynamicComponent) {
          this.dynamicComponent.destroy();
        }
      };
      this.animationService.cssAnimate(
        this.alertWrap.nativeElement, 'fadeOut', null, resetFunc, 'fadeIn');
    }
  }


  // 是否需要重置数据?
  reset() {
    this.dialogEvent = {};
    delete this.dialogSettings;
  }

  /**
   * 按钮事件
   */
  bindEvent() {
    this.dialogSettings.buttonList.forEach((btn: DialogButton) => {
      let eventName = 'btnEvent_' + btn.type;
      if (!this.dialogEvent.hasOwnProperty(eventName) && typeof btn.btnEvent === 'string') {
        this.setEvent(eventName, btn.btnEvent);
      }
      let mouseEnterEventName = 'btnEvent_enter_' + btn.type;
      if (!this.dialogEvent.hasOwnProperty(mouseEnterEventName) && typeof btn.mouseEnterEvent === 'string') {
        this.setEvent(mouseEnterEventName, btn.mouseEnterEvent);
      }
      let mouseLeaveEventName = 'btnEvent_leave_' + btn.type;
      if (!this.dialogEvent.hasOwnProperty(mouseLeaveEventName) && typeof btn.mouseLeaveEvent === 'string') {
        this.setEvent(mouseLeaveEventName, btn.mouseLeaveEvent);
      }
    })
  }

  /**
   * 设置button事件
   */
  setEvent(eventName: string, event: any) {
    this.dialogEvent[eventName] = event;
  }

  /**
   * 按钮添加成功，失败class
   * @param ele  按钮
   * @param couldClose
   * @param eventType
   * @param ajaxResult
   */
  dealBtnClass(btn: DialogButton, ele: any, couldClose: any, eventType: any, ajaxResult?: any) {
    let res = (typeof couldClose === 'undefined' || couldClose === true);
    if (ajaxResult) {
      //返回的数据有的包了一层data
      res = res && (ajaxResult.status == 1 || (ajaxResult.data && ajaxResult.data.status));
    }
    let successFunc = (eventType: string) => {
      this.errorMsg = '';
      if (eventType !== 'ok' && eventType !== 'next') {
        //添加进度条
        if(ele) {
          this.renderer.setElementClass(ele, this.loadingClass, true);
          setTimeout(() => {
            this.renderer.setElementClass(ele, this.loadingClass, false);
            this.renderer.setElementClass(ele, 'but-success', true);
            //添加成功图标
            setTimeout(() => {
              this.renderer.setElementClass(ele, 'but-success', false);
              this.close();
              // if (btn) {
              //   btn.disabled = false;
              // }
            }, this.config.btnSuccessTime);
          }, this.config.btnShowTime);
        }
      } else {
        this.close();
      }
    };
    let failFunc = (eventType: string) => {
      if (eventType !== 'ok' && eventType !== 'next') {
        //添加进度条
        if(ele) {
          this.renderer.setElementClass(ele, this.loadingClass, true);
          setTimeout(() => {
            this.renderer.setElementClass(ele, this.loadingClass, false);
            // 显示错误文字
            if (ajaxResult && ajaxResult.status != 1) {
              switch (parseInt(ajaxResult.data)) {
                case 1062:
                  this.errorMsg = 'company name or email Duplicate';
                  break;

                default:
                  this.errorMsg = ajaxResult && ajaxResult.status != 1 ? ajaxResult.message : 'error';
                  break;
              }

            }


            //添加失败图标
            this.renderer.setElementClass(ele, 'but-fail', true);
            setTimeout(() => {
              // if (btn) {
              //   btn.disabled = false;
              // }
              this.renderer.setElementClass(ele, 'but-fail', false);
              //TODO： 错误文字的隐藏
              this.errorMsg = '';
            }, this.config.btnFailTime);
          }, this.config.btnShowTime);
        }
      }
    };
    if (res) {
      successFunc(eventType);
    } else {
      failFunc(eventType);
    }
  }

  /**
   * 执行button事件
   */
  excEvent(btn: DialogButton, event: any) {
    event.stopPropagation();
    // if (btn.disabled) return;
    // btn.disabled = true;
    let ele = event.target.tagName == 'DIV' ? event.target : event.target.parentNode;
    //将点击的按钮赋值到对应模块中
    //如果是send 添加进度条
    if (!btn.disable) {
      try {
        this.clickedButton = ele;
        this.clickedBtn = btn;
        let eventType = typeof btn.btnEvent;
        let couldClose = true;
        if (eventType === 'function') {
          //有自定义事件 并且可以关闭
          couldClose = btn.btnEvent(btn.btnEventParam, event);
          if (btn.couldClose) {
            this.dealBtnClass(btn, ele, couldClose, btn.type);
          } else {
            // btn.disabled = false;
          }
        } else if (eventType === 'string' && this.dynamicComponent) { //自定义component方法
          couldClose = this.dynamicComponent.excComponentEvent(this.dialogEvent['btnEvent_' + btn.type], btn.btnEventParam);
        } else {
          this.close();
        }
        this.clickedCouldClose = couldClose;
        this.clickedEventType = btn.type;
      } catch (e) {
        // btn.disabled = false;
        return;
      }
    }

  }


  /**
   * 按钮
   */
  butMouseEnter(btn: any) {
    let eventType = typeof btn.mouseEnterEvent;
    if (eventType === 'function') {   //有自定义事件
      btn.mouseEnterEvent(btn.mouseEnterEventParam);
    } else if (eventType === 'string' && this.dynamicComponent) { //自定义component方法
      this.dynamicComponent.excComponentEvent(this.dialogEvent['btnEvent_enter_' + btn.type], btn);
    }
  }

  /**
   * 按钮
   */
  butMouseLeave(btn: any) {
    let eventType = typeof btn.mouseLeaveEvent;
    if (eventType === 'function') {   //有自定义事件
      btn.mouseLeaveEvent(btn);
    } else if (eventType === 'string' && this.dynamicComponent) { //自定义component方法
      this.dynamicComponent.excComponentEvent(this.dialogEvent['btnEvent_leave_' + btn.type], btn);
    }
  }


  /**
   * 点击选择标题
   * @param {MouseEvent} event
   * @param btn
   */
  public clickChosenTitle(event: MouseEvent, btn: {
    btnText: string,
    btnEvent: any
  }): void {
    event.stopPropagation();
    this.currentTitleBtnIdx = this.currentTitleBtnIdx == 0 ? 1 : 0;
    try {
      let eventType = typeof btn.btnEvent;
      if (eventType === 'function') {   //有自定义事件
        // couldClose = btn.btnEvent(btn.btnEventParam, event);
      } else if (eventType === 'string' && this.dynamicComponent) { //自定义component方法
        this.dynamicComponent.excComponentEvent(btn.btnEvent, '');
        this.isOpen = true;
      }
    } catch (e) {
      return;
    }
  }

  /**
   * 按钮的disable
   * @param {Array<{type: string; disable: boolean}>} btnList
   */
  private initBtnDisable(btnList: Array<{
    type: string,
    disable: boolean
  }>): void {

    btnList.forEach((value) => {
      if (value.hasOwnProperty('disable')) {
        this.dialogSettings.buttonList.forEach((btnObj) => {
          if (btnObj.type === value.type) {
            btnObj.disable = value.disable;
          }
        })
      }
    })
  }
}
