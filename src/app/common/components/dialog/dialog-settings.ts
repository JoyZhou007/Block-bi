import {ComponentFactoryResolver, Injector} from "@angular/core";
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/14.
 *
 */
export class DialogButton {
  // send 绿色
  // cancel 灰色
  // delete 红色
  // ok 正方形绿色
  // custom
  public type: string = '';
  public disable: boolean = false;
  public btnText: string = '';
  public btnClass: string = '';
  public btnEvent: any;
  public btnEventParam: any;
  public mouseEnterEvent: any;
  public mouseEnterEventParam: any;
  public mouseLeaveEvent: any;
  public mouseLeaveEventParam: any;
  private sort: number = 0;
  public couldClose: boolean = true;
  public disabled: boolean = false;
  //public _eventName: any;
  //public _eventComponent: string;

  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) &&
          ((typeof this[key] !== 'undefined' || key === 'btnEventParam')) ||
          ((typeof this[key] !== 'undefined' || key === 'mouseEnterEventParam')) ||
          ((typeof this[key] !== 'undefined' || key === 'mouseLeaveEventParam'))
        ) {
          this[key] = data[key];
        }
        if (data.hasOwnProperty(key) &&
          ( key === 'btnEvent' || key === 'mouseEnterEvent' || key === 'mouseLeaveEvent')) {
          this.bindEvent(key, data[key]);
        }
      }
    }
    if (this.type === '') {
      this.type = 'send';
    }
    this.bindTextClass();
  }

  bindTextClass() {
    switch (this.type) {
      case 'ok':
        this.btnText = this.btnText === '' ? 'OK' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-ok' : this.btnClass;
        this.sort = 0;
        break;
      case 'next':
        this.btnText = this.btnText === '' ? 'NEXT' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-ok' : this.btnClass;
        this.sort = 0;
        break;
      case 'cancel':
        this.btnText = this.btnText === '' ? 'CANCEL' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-cancel' : this.btnClass;
        this.sort = 9;
        break;
      case 'delete':
        this.btnText = this.btnText === '' ? 'DELETE' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-delete' : this.btnClass;
        this.sort = 8;
        break;
      case 'refuse':
        this.btnText = this.btnText === '' ? 'REFUSE' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-refuse' : this.btnClass;
        this.sort = 8;
        break;
      case 'accept':
        this.btnText = this.btnText === '' ? 'ACCEPT' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-accept' : this.btnClass;
        this.sort = 1;
        break;
      case 'send':
      default:
        this.btnText = this.btnText === '' ? 'SEND' : this.btnText;
        this.btnClass = this.btnClass === '' ? 'but-done' : this.btnClass;
        this.sort = 1;
        break;
    }
  }

  bindEvent(key, settings: any) {
    this[key] = settings;
  }
}

export class DialogSettings {
  // 模式1 浅灰色背景弹窗
  // 模式1-1 浅灰色背景+黑色标题
  // 模式1-2 浅灰色背景+黑色标题+人物列表
  // 模式2 白色全屏背景带esc按钮弹窗
  // 模式3 深灰色背景弹窗
  // 模式4 @see ImportFileComponent, 正方形弹框
  // 模式5 @see OccupationComponent 带切换tab功能标题的弹窗
  public mode: string = '';

  // 弹出背景html class
  public bgClass: string = '';
  // 弹出框 html class
  public warpClass: string = '';

  // 弹框标题
  public title: string = '';
  // 如果是模式3，允许在标题处显示error notice success的提示图标
  // warning | error  | success
  public modeIcon: string = '';
  // 如果是模式2，需要初始化titleAction, titleComponent, titleDesc, titleIcon
  // 模式2标题区域
  public titleAction: string = 'Create';
  public titleComponent: string = 'New Folder';
  // 第二个为加粗文本
  public titleDesc: string[] = [];
  public titleIcon: string = 'icon-big-folder di-new-folder';

  // 是否为纯文本
  public isSimpleContent: boolean = true;
  // 如果为是, 设置simpleContent
  public simpleContent: any = '';

  // 如果为否
  // 设置 componentSelector 需要调用的模块名
  // 以及 componentData 调用所需要数据
  public componentSelector: string = '';
  public componentData: any = {};
  public injector: Injector;
  public componentFactoryResolver: ComponentFactoryResolver;

  public buttonList: Array<DialogButton> = [];
  public buttons: Array<any> = [];

  public couldClose: boolean = true;
  public reset: boolean = true;
  public beforeCloseEvent: Function;
  public isAddClass: string = '';
  //mode 5的可切换按钮
  public selectTitleBtnList: Array<{
    btnText: string,
    btnEvent?: any,
  }> = [];

  //import team error
  public showErrorInfo: any = {};

  constructor(data?: any) {
    if (data) {
      let checKJson = function (str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      };
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          if (key == 'simpleContent' && checKJson(data[key])) {
            this[key] = JSON.parse(data[key]);
          }
          this[key] = data[key];
        }
      }
      if (data.hasOwnProperty('beforeCloseEvent')) {
        this.beforeCloseEvent = data['beforeCloseEvent'];
      }
      if (data.hasOwnProperty('injector')) {
        this.injector = data['injector'];
      }
      if (data.hasOwnProperty('componentFactoryResolver')) {
        this.componentFactoryResolver = data['componentFactoryResolver'];
      }
    }

    if (this.mode === '') {
      this.mode = '1';
    }
    if (this.buttons) {
      this.initButtons(this.buttons);
    }
    this.initHtmlClass();
    if (this.mode === '5') {
      //初始化可以选的title btn
      this.initSelectBtnList(data);
    }
  }

  initHtmlClass() {
    switch (this.mode) {
      case '1':
      case '1-1':
      case '1-2':
        this.bgClass = 'di-bg';
        this.warpClass = 'di-warp';
        break;
      case '2':
        this.bgClass = 'di1-bg';
        this.warpClass = 'di1-warp';
        break;
      case '3':
      default:
        this.bgClass = 'di-bg di2-bg';
        this.warpClass = 'di2-warp';
        break;
      case '4':
        this.bgClass = 'di-bg di2-bg';
        this.warpClass = 'di2-warp chat-di2-wrap';
        break;
      case '5':
        this.bgClass = 'occupation-warp';
        this.warpClass = 'di-warp occupation-box';
        break;
      case '6':
        this.bgClass = 'di-bg di2-bg';
        this.warpClass = 'di2-warp help-wrap g-padding-bottom10';
        break;
    }
  }

  initButtons(data: Array<any>) {
    let btnArr = [];
    data.forEach((btnSettings: any) => {
      let btn = new DialogButton(btnSettings);
      btnArr.push(btn);
    });
    btnArr.sort((a: any, b: any) => {
      return b.sort - a.sort;
    });
    this.buttonList = btnArr;
  }

  private initSelectBtnList(data: any) {
    if (data.hasOwnProperty('titleBtnList')) {
      this.selectTitleBtnList = data.titleBtnList;
    }

  }
}