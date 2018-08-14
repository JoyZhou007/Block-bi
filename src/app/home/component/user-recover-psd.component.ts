import {
  Component, OnInit, Inject, HostListener, EventEmitter, Input, Output, ViewChild,
  ViewChildren, QueryList, ElementRef, Renderer, ViewEncapsulation
} from '@angular/core';
import { User } from '../../shared/config/user.interface';
import { UserModelService } from "../../shared/services/model/user-model.service";
import { NgForm } from "@angular/forms";
import { Router } from '@angular/router';

@Component({
  selector: 'user-recover-psd',
  templateUrl: '../template/user-recover-psd.component.html',
  encapsulation: ViewEncapsulation.None
})


export class UserRecoverPsdComponent implements OnInit {
  //code计时器
  public codeSendTime: number = 0;
  public showTimer: boolean = false;
  public currentTab: number = 0;
  public authCodeError: any = {};
  public phone_error: any = {};

  //交互
  public showEmail: boolean = false;
  public showPhone: boolean = false;
  public showCode: boolean = false;
  public randomNumber: number = Math.floor(Math.random() * 4 + 1);
  public sendEmail: boolean = false;
  public sendPhone: boolean = false;
  public showCodeInfo: boolean = false;
  public addNumber: number = 0;
  public showCodeWrap: boolean = false;


  //表单数据
  public user: User;
  public authCode: any;
  public codeFit: boolean = false; //输入的验证码是否和验证码一致
  public codeFormBack: any; //接受来自后台的验证码

  //显示错误消息
  public email_error: any = {};


  @Input() public isFit: any; //验证码是否一致
  @Output() public fit: EventEmitter<any> = new EventEmitter();

  @ViewChild('recoverForm') recoverForm: NgForm;

  public tplAuthCodeList: Array<any> = ['', '', '', '', '', ''];
  @ViewChildren('codeInput') codeInput: QueryList<ElementRef>;
  @ViewChild('emailBtn') emailBtn: any;
  @ViewChild('resetBtn') resetBtn: any;
  public authCodeLength: number = 0;
  private loadingClass: string = 'but-loading';

  constructor(public userService: UserModelService,
              public router: Router,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              public renderer: Renderer,
              @Inject('dialog.service') public dialogService: any,) {
    console.log(this.userDataService.getLanguage());
  }


  /**
   * 语言选择
   */

  ngOnInit() {
    // initialize model here
    this.user = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  }

  /**
   * 阻止事件冒泡
   */
  stopPro(event: any) {
    event.stopPropagation();
  }


  /**
   * 功能：input失去焦点事件
   */

  inputBlur(event, type): void {
    event.stopPropagation();
    if (event.target.value !== "") {
      if (type === 'e') {
        this.showEmail = true;
        this.sendPhone = true;
        this.emailBlur();
      } else if (type === 'phone') {
        this.showPhone = true;
        this.sendEmail = true;
        this.phoneBlur();
      } else if (type === 'code') {
        this.showCode = true;
        this.codeFit = this.authCode == this.codeFormBack;
      }
    } else {
      if (type === 'e') {
        this.showEmail = false;
        this.emailBlur();
      } else if (type === 'phone') {
        this.showPhone = false;
        this.phoneBlur();
      } else if (type === 'code') {
        this.showCode = false;
      }
    }

    if (type === 'code') {
      this.addNumber++;
      if (this.addNumber == 1) {
        if (this.showCodeInfo == true) {
          this.showCodeWrap = true;
        }
      }
    }
  }

  /**
   * 鼠标移过事件
   * @param event
   */
  public inputMouseEnter(event): void {
    event.target.focus();
  }


  /**
   * 功能：提交表单
   */

  formSubmit(event: any, type) {
    event.stopPropagation();
    if (type === 'e') {
      let element = this.emailBtn.nativeElement;
      if (!this.checkValid()) {
        return false;
      } else {
        let data = {
          data: {
            means: this.user.email,
            lang: this.userDataService.getLanguageNum()
          }
        };
        //添加进度条
        this.renderer.setElementClass(element, this.loadingClass, true);
        setTimeout(() => {
          this.renderer.setElementClass(element, this.loadingClass, false);
        }, 600);
        this.userService.sendPhoneOrEmail(data, (response: any) => {
          if (response.status === 1) {
            //成功，按钮添加对号，1秒后消失
            this.renderer.setElementClass(element, 'but-success', true);
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-success', false);
            }, this.config.btnSuccessTime);
          } else {
            //失败，按钮添加叉号，错误提示，1秒后消失，
            this.email_error.isShow = true;
            this.email_error.text = 'email is not find';
            this.renderer.setElementClass(element, 'but-fail2', true);
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail2', false);
            }, this.config.btnSuccessTime);
          }
        });
      }
    } else if (type === 'phone') {
      if (!this.checkPhoneValid()) {
        return false;
      } else {
        let data = {
          data: {
            means: this.user.phone,
            lang: this.userDataService.getLanguageNum()
          }
        };
        if (this.codeSendTime === 0) {
          this.userService.sendPhoneOrEmail(data, (response: any) => {
            if (response.status === 1) {
              this.codeFormBack = response.data;
              this.showCodeInfo = true;
              this.codeSendTime = 60;
              this.showTimer = true;
              let timer = setInterval(() => {
                this.codeSendTime--;
                if (this.codeSendTime <= 0) {
                  clearInterval(timer);
                  this.showTimer = false;
                }
              }, 1000)
            } else {
              this.phone_error.isShow = true;
              this.phone_error.text = 'phone is not find';
            }
          });
        }
        // data=JSON.stringify(data);

      }

    } else if (type === 'code') {
      if (!this.authCodeBlur()) {
        return false;
      } else {
        this.validateToken()
      }

    }

  }


  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;

    if (!this.emailBlur()) {
      result = false;
    }
    return result;

  }

  /**
   * 验证名字
   * @returns {boolean}
   */
  emailBlur() {
    let regEmail = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
    if (!this.user.email) {
      this.email_error.isShow = true;
      this.email_error.text = 'email is required';
      return false;
    } else if (!regEmail.test(this.user.email)) {
      this.email_error.isShow = true;
      this.email_error.text = 'email is invalid';
      return false;
    } else {
      this.email_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证phone
   * @returns {boolean}
   */
  phoneBlur() {
    let regPhone = /^1\d{10}$/;
    if (!this.user.phone) {
      this.phone_error.isShow = true;
      this.phone_error.text = 'phone is required';
      return false;
    } else if (!regPhone.test(this.user.phone)) {
      this.phone_error.isShow = true;
      this.phone_error.text = 'phone is invalid';
      return false;
    } else {
      this.phone_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证phone auth code
   * @returns {boolean}
   */
  authCodeBlur(): boolean {
    let inputList = this.codeInput.toArray();
    let codeArr = [];
    for (let val of inputList) {
      codeArr.push(val.nativeElement.value);
    }
    let authCodeString = codeArr.join('');
    if (!authCodeString) {
      this.authCodeError.show = true;
      this.authCodeError.text = 'code is required.';
    } else if (authCodeString.length !== 6) {
      this.authCodeError.show = true;
      this.authCodeError.text = 'code is incorrect.';
    } else {
      this.authCodeError.show = false;
    }
    this.phoneBlur();
    return authCodeString.length === 6;
  }


  /**
   * 自动聚焦到下一个
   * @param event
   * @param i
   * @param input
   */
  public autoTab(event: KeyboardEvent, i: number, input: any): void {
    if (event.keyCode === 8 && input.value === '') {
      // previous.focus();
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
   * phone 发送验证码验证
   * @returns {boolean}
   */
  private checkPhoneValid() {
    let result = true;

    if (!this.phoneBlur()) {
      result = false;
    }

    return result;
  }

  /**
   * 验证 手机验证码, 发送
   */
  private validateToken() {
    let element = this.resetBtn.nativeElement;
    //添加进度条
    this.renderer.setElementClass(element, this.loadingClass, true);
    setTimeout(() => {
      this.renderer.setElementClass(element, this.loadingClass, false);
    }, 600);
    this.userService.validateToken({
      data: {
        token: this.fetchAuthCode()
      }
    }, (response: any) => {
      if (response.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
          this.router.navigate(['home/reset-psd'], {
            queryParams: {
              token: this.fetchAuthCode()
            }
          });
        }, this.config.btnSuccessTime);
      } else {
        this.authCodeError.show = true;
        this.authCodeError.text = response.message;
        //失败，按钮添加叉号，错误提示，1秒后消失，
        this.renderer.setElementClass(element, 'but-fail2', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail2', false);
        }, this.config.btnSuccessTime);
      }
    })
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
    return codeArr.join('');

  }


}