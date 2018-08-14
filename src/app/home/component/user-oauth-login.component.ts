import { AfterViewInit, Component, Inject } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UserModelService } from '../../shared/services/model/user-model.service';

@Component({
  selector: 'user-oauth-login',
  template: `<h1>验证</h1>`,
})

export class UserOauthLoginComponent implements AfterViewInit {
  private thirdAccountInfo: any;
  //授权时按取消
  public returnToIndex: boolean = false;


  private subscription: Subscription;
  private param: {
    code: string,
    state: string,
    oauth_verifier: string,
    oauth_token: string
  } = {
    code: '',
    state: '',
    oauth_verifier: '',
    oauth_token: ''
  };

  constructor(public  activatedRoute: ActivatedRoute,
              public userService: UserModelService,
              public router: Router,
              @Inject('im.service') public IMService: any,
              @Inject('notification-data.service') private notificationDataService: any,
              @Inject('notification.service') private notificationService: any,
              @Inject('notification-offLine-message.service') private notificationOffLineMessageService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              public userModelService: UserModelService,) {
    this.subscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        if (queryParam.hasOwnProperty('code')) {
          this.param.code = queryParam['code']
        }
        if (queryParam.hasOwnProperty('state')) {
          this.param.state = queryParam['state']
        }
        if (queryParam.hasOwnProperty('oauth_token')) {
          this.param.oauth_token = queryParam['oauth_token']
        }
        if (queryParam.hasOwnProperty('oauth_verifier')) {
          this.param.oauth_verifier = queryParam['oauth_verifier']
        }
        if (queryParam.hasOwnProperty('error')) {
          this.returnToIndex = true;
          this.router.navigate(['user/index']);
        } else {
          this.returnToIndex = false;
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (!this.returnToIndex) {
      //判断是否是登录状态，如果登录状态是绑定第三方
      if (this.userDataService.sessionGetData('isLogin')) { //登录状态 绑定第三方
        this.userDataService.sessionRemoveData('isLogin')
        this.bindThirdLogin()

      } else {//未登录状态 第三方注册或登录

        this.userDataService.removeSessionId();
        //获取第三方信息 登录或注册
        this.getThirdAccountMsg();
      }

    }
  }

  /**
   * 未登录  获取第三方账户信息
   */
  private getThirdAccountMsg(): void {
    this.userService.fetchThirdAccountInfo({
      data: {
        code: this.param.code,
        oauth_token: this.param.oauth_token,
        oauth_verifier: this.param.oauth_verifier,
        state: this.param.state,
        module: this.userDataService.sessionGetData('thirdAccount').module
      },
    }, (res: any) => {
      if (res.status === 1) {
        if (res.data) {
          this.thirdAccountInfo = res.data;
          //
          if (res.data.hasOwnProperty('bind')) {
            if (res.data.bind) { //绑定过，直接登录
              if (res.data.hasOwnProperty('user')) {
                this.userDataService.setUserIn(res.data, true);
                this.setLoginServiceData();
              }
              this.router.navigate(['user/index']);
              //清除第三方登录信息
              this.userDataService.sessionRemoveData('thirdAccount')
            } else { //没绑定过，去注册
              this.userDataService.sessionSetData('thirdLoginInfo', res.data);
              this.router.navigate(['home/register']);
            }
          }
        }
      } else {
        this.dialogService.openError({
          simpleContent: res.message,
          beforeCloseEvent: () => {
            this.router.navigate(['home/login']);
          },
        })
      }
    })
  }

  /**
   * 用户登陆后相关需要初始化的数据
   */
  setLoginServiceData() {
    this.notificationService.initNotification();
    // 通过获取设置之后才可以对应弹出框，所以先请求用户notification设置
    let thenFunc = (data) => {
      this.notificationDataService.setNotificationSetting(data);
      this.notificationOffLineMessageService.getAllNotification();
    };
    let settings = this.notificationDataService.getNotificationSetting();
    if (typeof settings == 'undefined' || !settings) {
      this.userModelService.getSettingNote((data: any) => {
        thenFunc(data);
      });
    } else {
      thenFunc(settings);
    }

    //登陆后执行初始化聊天服务
    this.IMService.init();
  }

  /**
   * 登录状态 绑定第三方登录
   */
  private bindThirdLogin(): void {
    this.userModelService.bindAuthorizedPartner({
      data: {
        code: this.param.code,
        oauth_token: this.param.oauth_token,
        oauth_verifier: this.param.oauth_verifier,
        state: this.param.state,
        module: this.userDataService.sessionGetData('thirdAccount').module ?
          this.userDataService.sessionGetData('thirdAccount').module : ''
      }
    }, (res: any) => {
      if (res.status === 1) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            openAccount: 1
          }
        };
        this.router.navigate(['user/index'], navigationExtras);
      } else {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            openAccount: 0
          }
        };
        this.router.navigate(['user/index'], navigationExtras);
      }

    });
    this.userDataService.sessionRemoveData('thirdAccount')
  }
}