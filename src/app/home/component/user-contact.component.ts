import {
  Component, EventEmitter, HostListener, Inject, OnInit, Output, ViewChild, Input, Renderer,
  ViewEncapsulation
} from "@angular/core";
import { isUndefined } from "util";
import { User } from "../../shared/config/user.interface";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'user-contact',
  templateUrl: '../template/user-contact.component.html',
  encapsulation: ViewEncapsulation.None
})

export class UserContactComponent implements OnInit {
  public errorMessageText: string = '';
  public errorNameText: string = '';
  //关闭contact
  @Output() OutCloseContact = new EventEmitter<any>();

  //form 表单
  public user: User;
  public username: string;
  public email: string;
  public msg: string;
  public showUserError: boolean;
  public userIsScale: boolean = false;
  public emailIsScale: boolean = false;
  public msgIsScale: boolean = false;
  public headerLanguageToggle: boolean = false;

  //显示组件
  public isShow: boolean = false;

  public name_error: any = {};
  public email_error: any = {};
  public msg_error: any = {};
  @ViewChild('f') public form: NgForm;
  @ViewChild('sendBtn') public sendBtn: any;
  private product: boolean = false;
  private loadingClass: string = 'but-loading';

  constructor(@Inject('app.config') public config: any,
              public renderer:Renderer,
              @Inject('dialog.service') public dialogService: any) {

  }

  @Input() set isProduct(data){
    this.product = data;
  }
  ngOnInit(): void {
    // initialize model here
    this.user = {
      username: '',
      email: '',
      msg: ''
    }
  }

  /**
   * 点击document
   */
  @HostListener('click', ['$event'])
  click(event: any) {
    this.OutCloseContact.emit(event);
  }


  /**
   * 文本框输入选中事件
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputFocus(event: any, type: string) {
    if (type === 'u') {
      this.userIsScale = true;
      if (isUndefined(this.username) || this.username == "") {
        this.showUserError = true;
      }
    } else if (type === 'e') {
      this.emailIsScale = true;
    } else if (type === 'm') {
      this.msgIsScale = true;
    }
  }


  /**
   *
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputMouseEnter(event: any, type: string): void {
    event.target.focus();
    if (type === 'u') {
      this.errorNameText = '';
    } else if (type === 'm') {
      this.errorMessageText = '';
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
        this.userIsScale = false;
        this.nameBlur();
      } else if (type === 'e') {
        this.emailIsScale = false;
        this.emailBlur();
      } else if (type === 'm') {
        this.msgIsScale = false;
        this.messageBlur();
      }
    } else {
      if (type === 'u') {
        this.userIsScale = true;
        this.nameBlur();
      } else if (type === 'e') {
        this.emailIsScale = true;
        this.emailBlur();
      } else if (type === 'm') {
        this.msgIsScale = true;
        this.messageBlur();
      }
    }
  }


  save(model: User, isValid: boolean) {
    // 调用API保存customer
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
    if (!this.messageBlur()) {
      result = false;
    }

    return result;
  }

  /**
   * 表单提交
   *
   */
  formSubmit(event: any, form: NgForm) {
    let element = this.sendBtn.nativeElement;
    event.stopPropagation();
    if (!this.checkValid()) {
      return false;
    } else {
      //添加进度条
      this.renderer.setElementClass(element, this.loadingClass, true);
      setTimeout(() => {
        this.renderer.setElementClass(element, this.loadingClass, false);
      }, 400);
      let dataStr = `name=${this.user.username}&message=${this.user.msg}&email=${this.user.email}`;
      // Object.assign(formData,dataInfo);
      let Ajax = {
        get: function (url, fn) {
          let obj = new XMLHttpRequest();  // XMLHttpRequest对象用于在后台与服务器交换数据
          obj.open('GET', url, true);
          obj.onreadystatechange = function () {
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState==4说明请求已完成
              fn.call(this, obj.responseText);  //从服务器获得数据
            }
          };
          obj.send(null);
        },
        post: function (url, data, fn) {
          let obj = new XMLHttpRequest();
          obj.open("POST", url, true);
          obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 发送信息至服务器时内容编码类型
          obj.onreadystatechange = function () {
            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
              fn.call(this, obj.responseText);
            }
          };
          obj.send(data);
        }
      };
      Ajax.post(this.config.resourceContactUsDomain + 'api/contact-us', dataStr, (response: any) => {
        response = JSON.parse(response);
        if (response.status === 1) {
          //成功，按钮添加对号，1秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          },this.config.btnSuccessTime);
        /*  this.dialogService.openSuccess({
            simpleContent: 'Send success !'
          });*/
          form.reset();
          this.userIsScale = false;
          this.msgIsScale = false;
          this.emailIsScale = false;
          this.resetError();

        } else {
          //失败，按钮添加叉号，错误提示，3秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
          },this.config.btnFailTime);
   /*       this.dialogService.openError({
            simpleContent: response.message
          })*/
        }
      })

    }


  }

  /**
   * 验证名字
   * @returns {boolean}
   */
  nameBlur() {
    let reg = new RegExp(/[=&]/, 'gm');
    if (!this.user.username) {
      this.name_error.isShow = true;
      this.name_error.text = 'name is required';
    } else if (this.user.username.search(reg) !== -1) {
      this.name_error.isShow = true;
      this.name_error.text = 'Your username contains illegal characters';
    } else {
      this.name_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证邮箱
   * @returns {boolean}
   */
  emailBlur() {
    let reg = new RegExp(/^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/, 'gm')
    if (!this.user.email) {
      this.email_error.isShow = true;
      this.email_error.text = 'email is required';
    } else if (!reg.test(this.user.email)) {
      this.email_error.isShow = true;
      this.email_error.text = 'email is invalid';
    } else {
      this.email_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证message
   * @returns {boolean}
   */
  messageBlur() {
    let reg = new RegExp(/[=&]/, 'gm');
    if (!this.user.msg) {
      this.msg_error.isShow = true;
      this.msg_error.text = 'message is required';
    } else if (this.user.msg.search(reg) !== -1) {
      this.msg_error.isShow = true;
      this.msg_error.text = `Your message contains illegal characters`;
    } else if (this.user.msg.length < 4) {
      this.msg_error.isShow = true;
      this.msg_error.text = 'message must be at least 4 characters long';
    } else if (this.user.msg.length > 100) {
      this.msg_error.isShow = true;
      this.msg_error.text = 'message cannot be more than 100 characters long';
    } else {
      this.msg_error.isShow = false;
      return true;
    }
  }

  /**
   * 重置 错误消息
   */
  public resetError() {
    this.name_error = {};
    this.email_error = {};
    this.msg_error = {};
    this.userIsScale = false;
    this.msgIsScale = false;
    this.emailIsScale = false;
    this.errorMessageText = '';
    this.errorNameText = '';
  }

  /**
   *
   * @param event
   */
  public stopPro(event: any): void {
    event.stopPropagation();
  }

}