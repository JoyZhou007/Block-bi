import {
  AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer,
  ViewChild
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import * as ThirdLoginConstant from "../../../shared/config/third-login.config";
import { UserModelService } from '../../../shared/services/model/user-model.service';

/**
 * Created by joyz on 2017/7/20.
 */

@Component({
  selector: 'user-account-dialog',
  templateUrl: '../../template/dialog/user-account-dialog.html',
})

export class UserAccountDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  private visibleData: { type: string; perm: number; data: [string, string, string]; butType: string; start: boolean };
  public userObj: { email: string; phone: string }; //当前的用户信息
  private hasInit: boolean = false;
  public showBindBtn: boolean = false;
  //该账户绑定的第三方用户
  public thirdInfoList: Array<{
    module: number,
    pid: string
  }> = [];
  //第三方绑定信息的提示
  private thirdBind_alert: any = {};
  private userSettingError: any = {};

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }

  public subscription: Subscription;
  public ThirdLoginConstant = ThirdLoginConstant;

  //控制第三方的图标高亮
  public showThirdHighlight: {
    1: {
      isShow: boolean,
      pid: string
    },
    2: {
      isShow: boolean,
      pid: string
    },
    3: {
      isShow: boolean,
      pid: string
    },
    4: {
      isShow: boolean,
      pid: string
    },
    5: {
      isShow: boolean,
      pid: string
    },
    6: {
      isShow: boolean,
      pid: string
    },
    7: {
      isShow: boolean,
      pid: string
    },
    8: {
      isShow: boolean,
      pid: string
    },
  } = {
    1: {
      isShow: false,
      pid: ''
    },
    2: {
      isShow: false,
      pid: ''
    },
    3: {
      isShow: false,
      pid: ''
    },
    4: {
      isShow: false,
      pid: ''
    },
    5: {
      isShow: false,
      pid: ''
    },
    6: {
      isShow: false,
      pid: ''
    },
    7: {
      isShow: false,
      pid: ''
    },
    8: {
      isShow: false,
      pid: ''
    },
  };

  private userSettingObj: any = {}


  constructor(private renderer: Renderer,
              @Inject('notification.service') public notificationService: any,
              public userModelService: UserModelService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('page.element') public element: any,
              @Inject('user-data.service') public userDataService: any,) {

  }

  ngOnInit(): void {
  }


  /**
   * 获取当前自动过期
   * @param data
   */
  getVisibleData(data: any) {
    this.visibleData = {
      type: 'visible',   //暂时没用处
      perm: (parseInt(data) == 20 * 60) ? 1 : (parseInt(data) == 60 * 60) ? 2 : 3,
      data: ['In 20 mins', 'In 1 hour', 'Three days'],
      butType: 'g-drag-type',
      start: true
    };
  }


  @Input('setOption')
  public set setOption(data: any) {
    this.getCurrentUserInfo()
    //获取第三方信息
    this.resetData();
    this.fetchThirdInfoList();
    this.userModelService.userSetting({
      opt: 'get'
    }, (res: any) => {
      if (res.status == 1) {
        this.userSettingObj = res.data;
        this.getVisibleData(this.userSettingObj.logout_interval);
      }
    })
  }

  ngAfterViewInit(): void {
    //接收消息
    if (!this.subscription) {
      this.subscription = this.notificationService.getNotification().subscribe(
        (message: any) => {
          this.dealMessage(message);
        });
    }
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_COMPONENT_ACCOUNT_RESET_EMAIL:
        this.getCurrentUserInfo();
        break;

      default:
        break;
    }
  }

  /**
   * 点击显示reset pwd dialog
   * @param event
   */
  public clickShowResetPwd(event: any): void {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_USER_ACCOUNT_RESET_PWD
    });
  }

  /**
   * 获取当前用户的信息
   */
  private getCurrentUserInfo(): void {
    let userInfo = this.userDataService.getUserIn().user;
    this.userObj = {
      email: userInfo.email,
      phone: userInfo.phone
    };
    this.hasInit = true;
  }

  /**
   * 点击显示重置
   * @param {MouseEvent} event
   */
  public clickShowResetAccount(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_USER_ACCOUNT_RESET_ACCOUNT
    });
  }

  /**
   * 鼠标经过第三方图标
   * @param {MouseEvent} event
   * @param {number} type
   */
  public mouserEnterShowBtn(event: MouseEvent, type: number): void {
    //Todo 根据接口信息 是否已绑定显示对应按钮
    this.showBindBtn = true;

  }

  /**
   * 获取第三方绑定的账户
   */
  public fetchThirdInfoList(): void {
    this.userModelService.fetchAuthorizedPartner({}, (res: any) => {
      if (res.status === 1) {
        if (res.data) {
          if (res.data.length) {
            this.thirdInfoList = res.data;
            this.buildTplThirdInfo();
          } else {
            this.thirdInfoList = []
          }
        }
      }
    })
  }

  /**
   * 获取到的第三方信息转化成显示数据
   */
  private buildTplThirdInfo() {
    this.thirdInfoList.forEach((value, index, array) => {
      this.showThirdHighlight[value.module].isShow = true;
      this.showThirdHighlight[value.module].pid = value.pid;
      /*switch (value.module) {
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_LINKEDIN:
       this.showThirdHighlight[value.module] = true;
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_AMAZON:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_FACEBOOK:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_QQ:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_WECHAT:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_TWITTER:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_PINTEREST:
       break;
       case this.ThirdLoginConstant.THIRD_LOGIN_TYPE_GOOGLE:
       break;
       }*/
    })
  }

  /**
   *
   * @param {MouseEvent} event
   * @param {number} type
   */
  public clickUnbindThirdLogin(event: MouseEvent, type: number): void {
    event.stopPropagation();
    this.userModelService.unbindAuthorizedPartner({
      data: {
        module: type,
        pid: this.showThirdHighlight[type].pid
      }
    }, (res: any) => {
      if (res.status === 1) {
        this.showThirdHighlight[type].isShow = false;
        this.showThirdHighlight[type].pid = '';
        this.thirdBind_alert.show = true;
        this.thirdBind_alert.text = 'unbind success.';
        this.thirdBind_alert.success = true;
      } else {
        this.thirdBind_alert.show = true;
        this.thirdBind_alert.text = res.message;
        this.thirdBind_alert.success = false;
      }
    })
  }

  public clickBindThirdLogin(event: MouseEvent, type: number): void {
    event.stopPropagation();
    this.userDataService.sessionSetData('thirdAccount', {
      module: type
    });
    this.userDataService.sessionSetData('isLogin', true);
    this.userModelService.fetchAuthorizedAddress({
      data: {
        module: type
      }
    }, (res: any) => {
      if (res.status === 1) {
        if (res.data.hasOwnProperty('url')) {
          let url = res.data.url;
          location.href = url;
        }
      }
    })
  }

  public resetData(): void {
    this.thirdBind_alert.show = false;
  }

  outAutoLogout(data: any) {
    let logoutTime: number;
    switch (data.currPerm) {
      case 1:
        logoutTime = 20 * 60;
        break;
      case 2:
        logoutTime = 60 * 60;
        break;
      case 3:
        logoutTime = 3 * 24 * 60 * 60;
        break;
    }
    this.userModelService.userSetting({
      opt: 'set',
      logout_interval: logoutTime
    }, (res: any) => {
      if (res.status == 1) {
        this.userSettingError.show = true;
        this.userSettingError.text = 'Set up success.';
        this.userSettingError.success = true;
      } else {
        this.userSettingError.show = true;
        this.userSettingError.text = res.message;
        this.userSettingError.success = false;
      }
      let timer = setTimeout(() => {
        this.userSettingError.show = false;
        clearTimeout(timer);
        timer = null;
      }, 500)
    })
  }


  switchIsAutoLogout(data: any) {
    this.userModelService.userSetting({
      opt: 'set',
      auto_logout: data.perm
    }, (res: any) => {
      if (res.status == 1) {
        //切换session 存储的位置
        let sessionId = this.userDataService.getSessionId();
        this.userDataService.removeSessionId();
        if (parseInt(res.data.auto_logout)) {
          this.userDataService.setSessionId(sessionId, true);
        } else {
          this.userDataService.setSessionId(sessionId, false);
        }
      }
    })


  }


}