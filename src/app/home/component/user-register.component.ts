import {
  Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, AfterViewInit,
  ViewChildren, Renderer
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  UserModelService, UserRegisterData
}
  from '../../shared/services/index.service';
import {Subscription} from "rxjs";
import {PerfectScrollbarComponent, PerfectScrollbarDirective} from "ngx-perfect-scrollbar";

@Component({
  selector: 'user-register',
  templateUrl: '../template/user-register.component.html',
  styleUrls: ['../../../assets/css/user/register.css']
})
export class UserRegisterComponent implements OnInit {
  //注册信息
  public registerData: UserRegisterData;
  public errorMsg: string;
  public errorMsgIndex: number = 0;

  public avatarId: number;
  public avatarType: number;
  public avatarUrl: any;
  public cropStatus: number;
  public fileData: any;

  public work_name: any;
  public checkRegister: boolean = true;
  public upload: any;
  public subscription: Subscription;
  public name_error: any = {};
  public email_error: any = {};
  public phone_error: any = {};
  public pwd_error: any = {};
  public pwd_repeat_error: any = {};
  public auth_error: any = {};
  public haveCode: boolean = false;//已经发送过验证码，正在进行倒计时
  private registerSuccess: boolean = false;
  private successRegister: any;
  private authCodeLength: number = 0;
  public code_error: any = {};
  private thirdLoginCode: string;
  //第三方的信息
  private thirdAccountInfo: any;
  //显示第三方注册的头像
  public showThirdAccountImg: boolean = false;
  //是否是第三方注册
  private thirdBind: boolean;
  //第三方登陆的code
  @ViewChild('phoneCode') public phoneCode: any;
  @ViewChild('loginBtn') loginBtn: any;
  private loadingClass: string = 'but-loading';
  //是否上传图片成功
  get testStr() {
    let errorStr = '';
    if (this.email.errors) {
      for (let key in this.email.errors) {
        if (key === 'required') {
          errorStr += 'Email is required';
        } else if (key === 'validateEmail')
          errorStr += '<br>' + this.email.errors[key].text;
      }
    }


    return errorStr;
  }

  @ViewChild('email') email: any;
  @ViewChild('inputName') inputName: any;
  @ViewChild(PerfectScrollbarComponent) componentScroll;
  @ViewChild(PerfectScrollbarDirective) directiveScroll;
  private param: any;

  public tplAuthCodeList: Array<any> = ['', '', '', '', '', ''];
  public currentTab: number = -1;

  @ViewChildren('codeInput') codeInput: QueryList<ElementRef>;

  constructor(public userModelService: UserModelService,
              public router: Router,
              public renderer: Renderer,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user.service') public userService,
              @Inject('user-data.service') public userDataService: any,
              public  activatedRoute: ActivatedRoute,
              @Inject('page.element') public element: any) {
    this.subscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        this.param = queryParam['token'];
      }
    );

  }

  //初始化页面后
  ngOnInit() {
    if (this.userDataService.checkUserLoginStatus()) {
      this.router.navigate(['/user/index']);
    } else {
      this.avatarId = 0;
      this.avatarType = 1; //用户头像
      this.cropStatus = 0;
      this.avatarUrl = this.config.userDefaultAvatar;
      this.fileData = '';
      this.registerData = new UserRegisterData(0, '', '', '', '', '', '', '', '',this.userDataService.getLanguageNum());
      let thirdLoginData = this.userDataService.sessionGetData('thirdLoginInfo');
      if (thirdLoginData && Object.keys(thirdLoginData).length !== 0) {
        this.showThirdAccountInfo(thirdLoginData);
      }
    }
  }


  /**
   * 验证名字
   * @returns {boolean}
   */
  nameBlur() {
    if (this.registerData.work_name == '') {
      this.name_error.isShow = true;
      this.name_error.text = 'name is required';
    } else {
      if (this.checkStrLength(this.registerData.work_name) < 21 && this.checkStrLength(this.registerData.work_name) > 2) {
        this.name_error.isShow = false;
        return true;
      } else {
        this.name_error.isShow = true;
        this.name_error.text = 'The length of the work name must be between 3 and 20';
      }
    }
  }

  /**
   * 验证邮箱
   * @returns {boolean}
   */
  emailBlur() {
    if (this.registerData.email == '') {
      this.email_error.isShow = false;
      // this.email_error.text = 'email is required';
      return true;
    } else {
      let reg = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
      if (reg.test(this.registerData.email)) {
        this.email_error.isShow = false;
        return true;
      } else {
        this.email_error.isShow = true;
        this.email_error.text = 'email format is not correct';
      }
    }
  }

  /**
   * 验证手机号
   * @returns {boolean}
   */
  phoneBlur() {
    if (this.registerData.phone == '') {
      this.phone_error.isShow = true;
      this.phone_error.text = 'phone is required';
    } else {
      let reg = /^1\d{10}$/;
      if (reg.test(this.registerData.phone)) {
        this.phone_error.isShow = false;
        return true;
      } else {
        this.phone_error.isShow = true;
        this.phone_error.text = 'phone format is not correct';
      }
    }
  }

  /**
   * 验证密码长度
   * @returns {boolean}
   */
  passWordBlur() {
    if (this.registerData.password == '') {
      this.pwd_error.isShow = true;
      this.pwd_error.text = 'password is required';
    } else {
      if (this.registerData.password.length < 21 && this.registerData.password.length > 7) {
        this.pwd_error.isShow = false;
        return true;
      } else {
        this.pwd_error.isShow = true;
        this.pwd_error.text = 'The length of the password must be between 8 and 20';
      }
    }
  }

  /**
   * 验证密码是否一致
   * @returns {boolean}
   */
  passWordRepeatBlur() {
    if (this.registerData.confirm_password !== this.registerData.password) {
      this.pwd_repeat_error.isShow = true;
      this.pwd_repeat_error.text = 'The password you inputted twice are not identical';
    } else {
      this.pwd_repeat_error.isShow = false;
      return true;
    }
  }

  /**
   * 判断字符长度 中文算3个字符
   */
  checkStrLength(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加3
        strlen += 3;
      } else {
        strlen++;
      }
    }
    return strlen;
  }

  /**
   * 按键按下事件
   */
  inputMouseDown(event: any) {
    if (event.keyCode === 13) {
      this.onSubmit();
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
    if (!this.emailBlur()) {
      result = false;
    }
    if (!this.phoneBlur()) {
      result = false;
    }
    if (!this.passWordBlur()) {
      result = false;
    }
    if (!this.passWordRepeatBlur()) {
      result = false;
    }
    if (!this.authCodeBlur()) {
      result = false;
    }

    return result;
  }

  /**
   * 注册提交
   */
  public onSubmit() {
    if (!this.checkValid()) {
      return false;
    }
    this.registerData.profile = this.fileData;
    this.sendInfoToAPI();

  }

  /**
   * 后台发送注册信息
   */
  sendInfoToAPI() {
    let element = this.loginBtn.nativeElement;
    //添加进度条
    this.renderer.setElementClass(element, this.loadingClass, true);
    setTimeout(() => {
      this.renderer.setElementClass(element, this.loadingClass, false);
      if (this.param) {
        Object.assign(this.registerData, {
          token: this.param
        })
      }
      this.userService.register(this.registerData, (res: any) => {
        //注册成功
        if (res.status === 1) {
          //成功，按钮添加对号，1秒后消失
          this.userDataService.removeContactList()
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          }, this.config.btnSuccessTime);
          this.checkRegister = false;
          this.registerSuccess = true;
          this.successRegister = setTimeout(() => {
            this.registerSuccess = false;
            this.router.navigate(['home/index']);
          }, 3000);
          //清除第三方登录信息
          this.userDataService.sessionRemoveData('thirdAccount')
        } else if (res.status === 0) {
          switch (res.data) {
            case 0:
              this.code_error.isShow = true;
              this.code_error.text = 'code is incorrect.';
              break;
            case 1:
              this.name_error.isShow = true;
              this.name_error.text = res.message;
              break;
            case 2:
              this.email_error.isShow = true;
              this.email_error.text = res.message;
              break;
            case 3:
              this.phone_error.isShow = true;
              this.phone_error.text = res.message;
              break;
            case 5:
              this.pwd_error.isShow = true;
              this.pwd_error.text = res.message;
              break;
            case 6:
              this.pwd_repeat_error.isShow = true;
              this.pwd_repeat_error.text = res.message;
              break;
          }
          //失败，按钮添加叉号，错误提示，1秒后消失，
          this.renderer.setElementClass(element, 'but-fail2', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail2', false);
          }, this.config.btnSuccessTime);
        }
      });
    }, 600);
  }

  /**
   * 裁剪图片后
   */
  doCropEvent(img: any) {
    this.avatarUrl = img;
    this.fileData = img;
    this.avatarId = 0;
  }

  /**
   * 点击发送验证码，就开始倒计时
   */
  onClickAuthCode(event: any) {
    if (event) {
      event.stopPropagation();
    }
    if (!this.phoneBlur()) {
      return false;
    } else {
      if (!this.haveCode) {
        this.userModelService.fetchRegisterCode({
          data: {means: this.registerData.phone}
        }, (res: any) => {
          if (res.status === 1) {
            this.haveCode = true;
            let num = 60;
            let timer: any = setInterval(() => {
              num--;
              this.phoneCode.nativeElement.innerHTML = num + ' s';
              if (num == -1) {
                clearInterval(timer);
                this.phoneCode.nativeElement.innerHTML = 'SEND AUTH CODE';
                this.haveCode = false;
              }
            }, 1000);
          } else {
            this.phone_error.isShow = true;
            this.phone_error.text = 'send phone code failed! ';
          }
        });
      }
    }

  }

  /**
   * 点击成功注册提示页
   * @param event
   */
  onClickSuccess(event: any) {
    event.stopPropagation();
    clearTimeout(this.successRegister);
    this.router.navigate(['home/index']);
  }

  /**
   * 自动聚焦到下一个
   * @param event
   * @param i
   * @param input
   */
  public autoTab(event: KeyboardEvent, i: number, input: any): void {
    if (event.keyCode === 8 && input.value === '') {
      if (i >= 1) {
        this.codeInput.toArray()[i - 1].nativeElement.focus();
        this.codeInput.toArray()[i - 1].nativeElement.select();
        if (this.authCodeLength > 0) {
          this.authCodeLength--;
        }
      }
    } else if (input.value) {
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }
      let maxLength = this.codeInput.length;
      let totalLen = 0;
      if (maxLength) {
        let next;
        this.currentTab = i;

        this.codeInput.toArray().forEach((item: ElementRef, index: number) => {
          if (i === index && i < (maxLength - 1) && !next) {

            next = index + 1;
          }
          if (item.nativeElement.value != '') {
            totalLen++;
          }
          if (index === next) {
            item.nativeElement.focus();
          }
        })
      }
      this.authCodeLength = totalLen;
    }

  }

  /**
   * 获取auth code 输入框的值
   * @returns {string}
   */
  public fetchAuthCode(): string {
    let inputList = this.codeInput.toArray();
    let codeArr = [];
    for (let val of inputList) {
      codeArr.push(val.nativeElement.value);
    }
    this.registerData.code = codeArr.join('');
    return codeArr.join('');

  }


  private authCodeBlur() {
    let code = this.fetchAuthCode();
    if (!code) {
      this.code_error.isShow = true;
      this.code_error.text = 'code is required.';
    } else if (code.length !== 6) {
      this.code_error.isShow = true;
      this.code_error.text = 'code is incorrect.';
    } else {
      this.code_error.isShow = false;
      return true;
    }
  }


  /**
   * 把获取到的第三方信息展示到模板
   */
  private showThirdAccountInfo(thirdLoginInfo: any): void {
    if (thirdLoginInfo.hasOwnProperty('work_name')) {
      this.registerData.work_name = thirdLoginInfo['work_name'];
    }
    if (thirdLoginInfo.hasOwnProperty('email')) {
      this.registerData.email = thirdLoginInfo['email'];
    }
    if (thirdLoginInfo.hasOwnProperty('profile')) {
      this.registerData.profile = thirdLoginInfo['profile'];
    }
    if (thirdLoginInfo.hasOwnProperty('id')) {
      this.registerData.pid = thirdLoginInfo['id'];
    }
    if (thirdLoginInfo.hasOwnProperty('bind')) {
      this.thirdBind = !thirdLoginInfo['bind'];
    }

    // this.registerData.email = thirdLoginInfo['email'];
    // this.registerData.profile = thirdLoginInfo['profile'];
    // this.registerData.pid = thirdLoginInfo['id'];
    // this.thirdBind = !thirdLoginInfo['bind'];
    if (this.registerData.pid) {
      this.registerData.module = this.userDataService.sessionGetData('thirdAccount').module;
    }
    this.showThirdAccountImg = this.registerData.profile !== '';
    //删除session_storage
    this.userDataService.sessionRemoveData('thirdLoginInfo');
  }
}
