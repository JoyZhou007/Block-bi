import {Component, HostListener, Inject, OnInit, Renderer, ViewChild, ViewEncapsulation} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserLoginData, UserModelService } from "../../shared/services/index.service";
import { UserContactComponent } from "./user-contact.component";
import { NgForm } from "@angular/forms";
import * as ThirdLoginConstant from "../../shared/config/third-login.config";

@Component({
  selector: 'user-login',
  templateUrl: '../template/user-login.component.html',
  styleUrls: ['../../../assets/css/user/new-login.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserLoginComponent implements OnInit {

  //页面交互
  public returnUrl: string = '';

  public showLogin: boolean = false;
  public showMask: boolean = false;
  public hideLogin: boolean = false;
  public showUserFixesColor: boolean = false;
  public showUserFixesHover: boolean = false;

  public showPassFixesColor: boolean = false;
  public showPassFixesHover: boolean = false;

  public showUserError: boolean = false;
  public showPassError: boolean = false;

  //登录数据
  public loginData: UserLoginData;

  //错误信息提示
  public promptMsg: string;
  public errorMsg: boolean = false;
  public keepMe: boolean = true;

  public userVisit: boolean = false;

  //class控制
  public scalep: boolean = false;
  public scalep2: boolean = false;


  //错误信息内容
  public emailE: string = '';
  public passE: string = '';
  public randomNumber: number = Math.floor(Math.random() * 4 + 1);

  //登录验证只触发一次
  public checkLogin: boolean = true;
  //显示contact-us
  public isShowContactUs: boolean = false;

  private isLogin: boolean;

  @ViewChild('contactUs') public contactUsComponent: UserContactComponent;
  public showLoginBtn: boolean = true;
  public isAnimated: boolean = false;
  @ViewChild('loginForm') loginForm: NgForm;
  @ViewChild('loginUser') loginUser: any;
  @ViewChild('loginBtn') loginBtn: any;
  @ViewChild('loginPsd') loginPsd: any;
  @ViewChild('loginButtonElement') loginButtonElement: any;
  //显示忘记密码
  public showRecoverPsd: boolean = false;
  //显示错误消息
  public name_error: any = {};
  public password_error: any = {};
  public btnZIndex: boolean = false;
  public butOpacity: boolean = false;
  private isEventBut: boolean = true;

  public ThirdLoginConstant = ThirdLoginConstant;
  public isShowSignIn: boolean = true;
  private loadingClass: string = 'but-loading';

  constructor(private router: Router,
              private renderer: Renderer,
              private activatedRoute: ActivatedRoute,
              public userModelService: UserModelService,
              @Inject('im.service') public IMService: any,
              @Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user.service') public userService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('page-animation.service') public animationService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('notification-data.service') public notificationDataService: any) {

  }

  switchLanguage(event: any, lan: string) {
    event.stopPropagation();
    this.translate.switchLan(lan);
  }

  //初始化页面后
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        //是否有重定向URL
        if (queryParam.hasOwnProperty('returnUrl')) {
          this.returnUrl = queryParam.returnUrl;

        }
      }
    );
    this.isLogin = this.userDataService.checkUserLoginStatus();
    if (this.isLogin) {
      this.router.navigate(['/user/index']);
    } else {
      this.loginData = new UserLoginData(1, '', '');
      this.setLoginIn();
      //判断是否有默认值
      if (this.loginData.username != '') {
        this.scalep = true;
      }
      if (this.loginData.password != '') {
        this.scalep2 = true;
      }
    }
  }

  /**
   * 点击document
   */
  @HostListener('body:click', ['$event'])
  onClick(event: any) {
    if (this.loginForm) {
      this.loginForm.resetForm();
      this.scalep = false;
      this.scalep2 = false;

    }
    this.resetError();
    // this.showLoginWrap = this.showLogin;
    this.hideLogin = true;
    this.showLogin = false;
    this.isAnimated = true;
    if (!this.isEventBut) {
      this.isEventBut = true;
      setTimeout(() => {
        this.showLoginBtn = true;
      }, 200);

      setTimeout(() => {
        this.hideLogin = false;
      }, 300);
      setTimeout(() => {
        this.btnZIndex = false;
        this.isShowSignIn = true;
      }, 700);

      setTimeout(() => {
        this.showMask = false;
      }, 800);
    }

    this.showRecoverPsd = false;
  }

  /**
   * keep me
   */
  showKeep() {
    this.keepMe = !this.keepMe;
  }

  /**
   * 弹出登录框
   */
  public showLoginForm(event: any) {
    event.stopPropagation();
    if (this.isEventBut) {
      this.isEventBut = false;
      this.hideLogin = false;
      this.showLogin = true;
      this.showLoginBtn = false;
      this.isShowSignIn =  false;
      setTimeout(() => {
        this.showMask = true;
      }, 500);
      setTimeout(() => {
        this.btnZIndex = true;
      }, 500);
      this.inputTextPosition(this.loginUser, 'u');
      this.inputTextPosition(this.loginPsd, 'p');
    }

  }

  /**
   *
   * @param element
   * @param type
   */
  inputTextPosition(element: any, type: string) {
    if (element.nativeElement.value !== '') {
      if (type === 'u') {
        this.scalep = true;
      } else if (type === 'p') {
        this.scalep2 = true;
      }
    }
  }

  /**
   * 文本框鼠标经过事件
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputMouseEnter(event: any, type: string) {
    event.target.focus();
    if (event.target.value !== '') {
      if (type === 'u') {
        this.errorMsg = false;
        this.showUserFixesColor = false;
      } else {
        this.errorMsg = false;
        this.showPassFixesColor = false;
      }
    } else {
      if (type === 'u') {
        this.showUserFixesHover = true;
      } else {
        this.showPassFixesHover = true;
      }
      event.target.focus();
    }
  }

  /**
   * 文本框输入选中事件
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputFocus(event: any, type: string) {
    event.stopPropagation();
    if (type === 'u') {
      this.errorMsg = false;
      this.showUserError = false;
      this.scalep = true;
    } else {
      this.errorMsg = false;
      this.showPassError = false;
      this.scalep2 = true;
    }
    this.passE = '';
  }

  /**
   * 按键按下事件
   */
  inputMouseDown(event: any, valid: boolean, type?: string) {
    if (event.keyCode === 13) {
        this.onSubmit();
    }
    if (type === 'psd') {
      this.stopTab(event);
    }
  }

  /**
   * 文本框失去焦点事件
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputBlur(event: any, type: string) {

    if (event.target.value === '') {
      if (type === 'u') {
        this.scalep = false;
        this.nameBlur();
      } else {
        this.scalep2 = false;
        this.passwordBlur();
      }
    } else {
      if (type === 'u') {
        this.scalep = true;
        this.nameBlur();
      } else {
        this.scalep2 = true;
        this.passwordBlur();
      }
    }
  }


  /**
   * 登录信息
   */
  public setLoginIn() {
    this.showUserFixesHover = true;
    this.showUserFixesColor = true;
    this.showPassFixesHover = true;
    this.showPassFixesColor = true;
  }

  /**
   * 执行登录
   */
  public onSubmit() {
    let element = this.loginBtn.nativeElement;
    if (!this.checkValid()) {
      return false;
    } else {
      //添加进度条
      this.renderer.setElementClass(element, this.loadingClass, true);
      //验证成功
      this.userService.initLogin(this.loginData, (res: any) => {
        if (res.status === 1) {  //登录成功
            //成功，按钮添加对号，1秒后消失
            this.renderer.setElementClass(element, 'but-success', true);
              if (this.returnUrl === '') {
                setTimeout(() => {
                  this.router.navigate(['/user/index']);
                },this.config.btnSuccessTime)
              } else {
                this.router.navigate([this.returnUrl]);
              }
        } else if (res.status === 0) {
          //失败，按钮添加叉号，错误提示，1秒后消失，
          this.renderer.setElementClass(element, 'but-fail2', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail2', false);
          },this.config.btnSuccessTime);
          this.passE = res.message;
          this.promptMsg = res.message;
          this.errorMsg = true;
        }
        this.renderer.setElementClass(element, this.loadingClass, false);
      });
    }


  }

  /**
   *
   * @param event
   * @param isClose
   */
  clickShowContactUs(event: MouseEvent, isClose?: boolean): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.loginForm) {
      this.loginForm.reset();
    }
    this.isShowContactUs = isClose ? !isClose : !this.isShowContactUs;
    this.showLogin = this.isShowContactUs;
    this.showMask = this.isShowContactUs;
    this.showLoginBtn = !this.isShowContactUs;
    this.showRecoverPsd = false;
    this.contactUsComponent.isShow = this.isShowContactUs;
    if (!this.contactUsComponent.isShow) {
      this.contactUsComponent.form.reset();
      this.contactUsComponent.resetError();
    }
    setTimeout(() => {
      this.btnZIndex = false;
      this.butOpacity = false;
    }, 700);

  }


  /**
   * show forget password
   * @param event
   */
  clickShowRecoverPsd(event: any): void {
    event.stopPropagation();
    this.showRecoverPsd = true;
  }


  /**
   * 阻止 tab 事件
   * @param event
   * @returns {boolean}
   */
  stopTab(event: any): any {
    if (event.keyCode === 9) {
      event.preventDefault();
      return false;
    }
  }

  /**
   * 验证名字
   * @returns {boolean}
   */
  nameBlur() {
    let regEmail = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
    let regPhone = /^1\d{10}$/;
    if (!this.loginData.username) {
      this.name_error.isShow = true;
      this.name_error.text = 'name is required';
      return false;
    } else if (!(regEmail.test(this.loginData.username) || regPhone.test(this.loginData.username))) {
      this.name_error.isShow = true;
      this.name_error.text = 'Login email or cell phone number incorrect';
      return false;
    } else {
      this.name_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证密码
   * @returns {boolean}
   */
  passwordBlur() {
    if (!this.loginData.password) {
      this.password_error.isShow = true;
      this.password_error.text = 'password is required';
      return false;
    } else if (this.loginData.password.length < 8) {
      this.password_error.isShow = true;
      this.password_error.text = 'password must be at least 8 characters long';
      return false;
    } else {
      this.password_error.isShow = false;
      this.password_error.text = '';
      this.passE = '';
      return true;
    }
  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;

    if (!this.nameBlur()) {
      result = false;
    }
    if (!this.passwordBlur()) {
      result = false;
    }
    return result;
  }

  /**
   * 重置 错误消息
   */
  public resetError() {
    this.name_error = {};
    this.password_error = {};
  }

  /**
   * contact us 点击空白处关闭
   */
  public closeContactUs(event: MouseEvent): void {
    event.stopPropagation();
    if (this.loginForm) {
      this.loginForm.reset();
    }
    this.isShowContactUs = false;
    this.showLogin = this.isShowContactUs;
    this.showMask = this.isShowContactUs;
    this.showLoginBtn = !this.isShowContactUs;
    this.showRecoverPsd = false;
    this.contactUsComponent.isShow = this.isShowContactUs;
    if (!this.contactUsComponent.isShow) {
      this.contactUsComponent.form.reset();
      this.contactUsComponent.resetError();
    }
    this.btnZIndex = false;
    this.butOpacity = false;
  }

  /**
   * 保存点击的第三方账户 到session storage
   * @param {MouseEvent} event
   * @param {number} type
   */
  public clickRecordThirdAccount(event: MouseEvent, type: number): void {
    event.stopPropagation();

    this.userDataService.sessionSetData('thirdAccount', {
      module: type
    });

    this.userModelService.fetchAuthorizedAddress({
      data: {
        module: type
      }
    }, (res: any) => {
      if (res.status === 1) {
        if(res.data.hasOwnProperty('url')){
          let url = res.data.url;
          location.href = url;
        }
      }
    })
  }
}
