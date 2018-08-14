import {Component, OnInit, Inject, OnDestroy, AfterViewInit, ViewChild, Renderer} from '@angular/core';
import {User} from '../../shared/config/user.interface';
import {UserModelService} from "../../shared/services/model/user-model.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'user-reset-psd',
  templateUrl: '../template/user-reset-psd.html',
  styleUrls: [
    '../../../assets/css/user/new-login.css'
  ]
})

export class UserResetPsdComponent implements OnInit, OnDestroy, AfterViewInit {
  ngAfterViewInit(): void {
    this.userDataService.removeSessionId();
    this.validateToken();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private subscription: Subscription;
  private param: any;
  private errorText: string = '';
  @ViewChild('f') inputForm: NgForm;
  @ViewChild('resetBtn') resetBtn: any;

  constructor(public userService: UserModelService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              public router: Router,
              public renderer: Renderer,
              public  activatedRoute: ActivatedRoute,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,) {
    this.subscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => this.param = queryParam['token']
    );
  }

  //交互
  public showPsd: boolean = false;
  public showPsdConfirm: boolean = false;

  //重置数据
  public user: User;

  //显示错误消息
  public confirmPassword_error: any = {};
  public password_error: any = {};
  private loadingClass: string = 'but-loading';
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
   * 功能：input失去焦点事件
   */

  inputBlur(event, type): void {
    if (event.target.value !== "") {
      if (type === 'p') {
        this.showPsd = true;
        this.passwordBlur();
      } else if (type == 'pc') {
        this.showPsdConfirm = true;
        this.confirmPasswordBlur();
      }
    } else {
      if (type === 'p') {
        this.showPsd = false;
        this.passwordBlur();
      } else if (type == 'pc') {
        this.showPsdConfirm = false;
        this.confirmPasswordBlur();
      }
    }

  }

  /**
   * 鼠标移过事件
   * @param event
   * @param type 标识文本框数据类型
   */
  public inputMouseEnter(event): void {
    event.target.focus();
  }

  /**
   * 功能：提交表单
   */

  formSubmit(event: any): void {
    if (event instanceof MouseEvent) {
      event.stopPropagation();
      this.submitIpt();
    } else if (event instanceof KeyboardEvent) {
      if (event.keyCode === 13) {
        if (this.inputForm.valid) {
          this.submitIpt();
        }

      }
    }


  }

  /**
   * 验证token
   */
  private validateToken() {
    this.userService.validateToken({
      data: {
        token: this.param
      }
    }, (response: any) => {
      if (response.status === 1) {

      } else {
        this.dialogService.openError({
          simpleContent: response.message,
          title: 'Warning',
          beforeCloseEvent: () => {
            this.router.navigate(['home/login']);
          },
        })
      }
    })
  }

  private submitIpt() {
    if (!this.checkValid()) {
        return false;
    } else {
      let element = this.resetBtn.nativeElement;
      //添加进度条
      this.renderer.setElementClass(element, this.loadingClass, true);
      setTimeout(() => {
        this.renderer.setElementClass(element, this.loadingClass, false);
      },600);
      let dataInfo = {
        data: {
          password: this.user.password,
          confirm_password: this.user.confirmPassword,
          token: this.param
        }

      };
      this.userService.resetPassword(dataInfo, (response: any) => {
        if (response.status === 1) {
          //成功，按钮添加对号，1秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
            this.router.navigate(['home/login']);
          },this.config.btnSuccessTime);
        } else {
          //失败，按钮添加叉号，错误提示，1秒后消失，
          this.renderer.setElementClass(element, 'but-fail2', true);
          this.errorText = response.message;
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail2', false);
            this.errorText = ''
          },this.config.btnFailTime);
        }
      });
    }
  }

  /**
   * 验证密码
   * @returns {boolean}
   */
  passwordBlur() {
    if (!this.user.password) {
      this.password_error.isShow = true;
      this.password_error.text = 'password is required';
      return false;
    } else if (this.user.password.length < 8) {
      this.password_error.isShow = true;
      this.password_error.text = 'password must be at least 8 characters long';
      return false;
    } else {
      this.password_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证 确认的密码
   * @returns {boolean}
   */
  confirmPasswordBlur() {
    if (!this.user.confirmPassword) {
      this.confirmPassword_error.isShow = true;
      this.confirmPassword_error.text = 'password is required';
      return false;
    } else if (this.user.confirmPassword !== this.user.password) {
      this.confirmPassword_error.isShow = true;
      this.confirmPassword_error.text = 'The password you inputted twice are not identical';
      return false;
    } else {
      this.confirmPassword_error.isShow = false;
      return true;
    }
  }


  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;

    if (!this.confirmPasswordBlur()) {
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
    this.confirmPassword_error = {};
    this.password_error = {};
  }
}