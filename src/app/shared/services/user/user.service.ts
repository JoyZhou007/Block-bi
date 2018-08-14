/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/8/7.
 *
 * 用户相关数据总处理入口
 * 包括缓存，接口
 */
import {Inject, Injectable} from "@angular/core";
import {UserModelService} from "../model/user-model.service";
import {ContactModelService} from "../model/contact-model.service";
import {Router, RoutesRecognized} from "@angular/router";
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';

@Injectable()
export class UserService {
  public idleState = 'Not started.';
  public timedOut = false;
  public lastPing: number;
  private sessionExpressTime: number;
  private hasInit: boolean = false;
  private hidden: string;
  private visibilityChange: string;
  private isLogin: boolean;
  private currentUuid: string;


  constructor(private userModelService: UserModelService,
              private contactModelService: ContactModelService,
              private router: Router,
              private idle: Idle,
              private keepAlive: Keepalive,
              @Inject('store.service') public storeService: any,
              @Inject('im.service') public imService: any,
              @Inject('page-status.service') private pageStatusService: any,
              @Inject('dialog.service') private dialogService: any,
              @Inject('im.service') private IMService: any,
              @Inject('user-data.service') private userDataService: any,
              @Inject('company-data.service') private companyDataService: any,
              @Inject('chat-message-data.service') private messageDataService: any,
              @Inject('notification-data.service') private notificationDataService: any,
              @Inject('structure-data.service') private structureDataService: any,
              @Inject('notification.service') private notificationService: any,
              @Inject('type.service') private typeService: any) {
    this.userDataService.clearStoreData();
    this.initIdle();
    this.router.events.filter((event) => event instanceof RoutesRecognized).subscribe((event: RoutesRecognized) => {
      if ((event.url.indexOf('/home/reset-psd') === -1 || event.url.indexOf('/home/oauth/login') === -1 ) && event.url.indexOf('/user/logout') === -1) {
        if (this.userDataService.checkUserLoginStatus() && !this.hasInit) {
          // 初始化所有数据, 对于在reset-psd重置密码的特殊页不需要执行数据
          this.isLogin = true;
          this.setLoginServiceData();
          this.currentUuid = this.userDataService.getCurrentUUID();
          if(event.url.indexOf('/home/login') === -1) {
            this.checkUserUuid();
          }
        }
      }
    });
  }

  /**
   * 检查用户当前登录的uuid是否与缓存uuid一致
   */
  checkUserUuid() {
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document['msHidden'] !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document['webkitHidden'] !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }

    if (typeof document.addEventListener === "undefined" || typeof document[this.hidden] === "undefined") {
    } else {
      document.addEventListener(this.visibilityChange, () => {
        if (document[this.hidden]) {
        } else {
          if (this.isLogin) {
            let storageUserUuid: any = this.userDataService.getCurrentUUID();
            if (!storageUserUuid && this.currentUuid) {  //如果缓存里面没有uuid
              this.dialogService.openNotLoginWarning(() => {
                this.cleanServiceData();
                this.currentUuid = '';
              });
            } else {
              if (this.currentUuid != storageUserUuid) {

                this.dialogService.openOtherUserLoginWarning();
              }
            }
          }
        }
      });
    }
  }


  initIdle() {
    let startCheckTime: number = 300;
    this.idle.setIdle(startCheckTime); //设置开始检查的间隔时间
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
    });
    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.initLogout();
    });
    this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';
    });
    this.idle.onTimeoutWarning.subscribe((countdown: any) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!';
    });
    // sets the ping interval to 15 seconds
    this.keepAlive.interval(60);
    this.keepAlive.onPing.subscribe(() => {
      this.lastPing = new Date().getTime();
      let lastRefreshTime: number = this.userDataService.getUserLastRefreshTime();
      let minTimeInterval = 5 * 60 * 1000;
      if (this.lastPing - lastRefreshTime > minTimeInterval) {
        this.userModelService.flushSession({}, () => {
        });   //请求api接口，更新session活动时间
      }
    });
  }


  /**
   * 用户登录
   * @param data
   * @param callback
   */
  initLogin(data: any, callback: Function) {
    this.userModelService.doLogin(data, (res: { status: number, data: any }) => {
        if (res.status == 1) {
          this.cleanServiceData();
          this.userModelService.userSetting({
            opt: 'get',
            session_id: res.data.session_id
          }, (response: any) => {
            if (response.status == 1) {
              this.sessionExpressTime = this.typeService.isNumber(parseInt(response.data.logout_interval)) ? parseInt(response.data.logout_interval) : 0;
              this.userDataService.setSessionExpiresTime(this.sessionExpressTime);
              this.startTheIdle(this.sessionExpressTime);
              if (parseInt(response.data.auto_logout)) {  //为1 用户设置了自动退出
                this.userDataService.setUserIn(res.data, true, true);
              } else { //为0 用户设置不自动退出
                this.userDataService.removeSessionId();
                this.userDataService.setUserIn(res.data, true, false);
              }
              this.setLoginServiceData();
              this.currentUuid = res.data.user ? res.data.user.uuid : '';
              this.isLogin = true;
              this.checkUserUuid();
              if (callback) {
                callback(res);
              }
            }
          });
        } else {
          if (callback) {
            callback(res);
          }
        }
      }
    );
  }


  /**
   * 用户注册
   * @param data
   * @param callback
   */
  register(data: any, callback: Function) {
    this.userModelService.register(data, (res: any) => {
      if (res.status === 1) {  //注册成功
        this.userDataService.setUserIn(res.data, true);
        this.setLoginServiceData();
      }
      if (callback) {
        callback(res);
      }
    });
  }

  /**
   * 用户登出
   * @param callback
   */
  initLogout(callback?: Function) {
    this.idle.stop();
    this.userModelService.logout((result: any) => {
      if (result && (result.status === 1 || result.status === -10001)) {
        this.router.navigate(['home/login']);
        if (callback && typeof callback === 'function') {
          callback();
        }
        this.isLogin = false;
      }
    });
    this.imService.sendLogoOutMessage();
    this.setLogoutServiceData();

  }

  /**
   * 用户Session过期处理
   * @param data
   */
  dealUserSessionExpired(data: any) {
    if (data.status === this.pageStatusService.sessionExpiredCode
      && data.hasOwnProperty('data') && data.data.hasOwnProperty('session_id')
      && data.data['session_id'] === this.userDataService.getSessionId()) {
      this.dialogService.openNotLoginWarning(() => {
        this.cleanServiceData();
      });
    }
  }

  /**
   * 清除用户相关登录信息
   */
  cleanServiceData() {
    this.IMService.close();
    this.companyDataService.removeCompanyData();
    this.messageDataService.removeChatListCache();
    this.userDataService.removeUserLoginData();
    this.notificationDataService.clearStoreNotification();
    this.structureDataService.removeUploadStructureFlag();
    this.userDataService.removeUserLastRefreshTime();
    this.userDataService.removeSessionExpiresTime();
  }

  /**
   * 用户登陆后相关需要初始化的数据
   */
  setLoginServiceData() {
    this.hasInit = true;
    this.notificationService.initNotification();
    // IDLE相关
    if (!this.sessionExpressTime) {
      if (this.userDataService.getSessionExpiresTime()) {
        this.sessionExpressTime = this.userDataService.getSessionExpiresTime();
        this.startTheIdle(this.sessionExpressTime);
      } else {     //如果缓存里面也没有过期时间 重新从API获取
        let session_id = this.userDataService.getSessionId();
        if (session_id) {
          this.userModelService.userSetting({opt: 'get'}, (response: any) => {
            if (response.status == 1) {
              this.sessionExpressTime = this.typeService.isNumber(parseInt(response.data.logout_interval)) ? parseInt(response.data.logout_interval) : 0;
              this.userDataService.setSessionExpiresTime(this.sessionExpressTime);
              this.startTheIdle(this.sessionExpressTime);
            }
          });
        } else {
          this.router.navigate(['home/login']);
        }
      }
    }
    // 通过获取设置之后才可以对应弹出框，所以先请求用户notification设置
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_USER_HAS_LOGIN,
      status: 1
    });

    //登陆后执行初始化聊天服务
    this.IMService.init();
  }

  /**
   * 用户登录后开始计算最后操作时间
   * @param sessionExpressTime
   */
  startTheIdle(sessionExpressTime: number) {
    if (!this.typeService.isNumber(sessionExpressTime) || sessionExpressTime - 300 < 0) return;
    this.idle.setTimeout(sessionExpressTime - 300); //设置过期时间
    this.userDataService.setUserLastRefreshTime(new Date().getTime());
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }


  /**
   * 获取联系人列表
   */
  getContactList(deal?: Function) {
    let cl = this.userDataService.getContactList();
    if (!cl) {
      this.contactModelService.getContactList(
        {form: 0, group: 0},
        (data: any) => {
          if (data.status === 1) {
            // 通知其他模块contact list缓存设置完毕
            let contactsList = {
              Internal: data.data.staff.internalList,
              Cooperator: data.data.staff.cooperatorList,
              Friend: data.data.staff.friendList
            };
            //设置本地缓存联系人列表缓存数据
            this.userDataService.setContactList(contactsList);
            if (deal) {
              deal(contactsList);
            }
          } else {
            this.dialogService.openError({simpleContent: 'Failed to get friend list!'});
          }
        }
      );
    } else {
      if (deal) {
        deal(cl);
      }
      return cl;
    }
  }

  /**
   * 用户退出后相关需要清除的数据
   */
  setLogoutServiceData() {
    // 通知一些其他模块清空内容
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_SYSTEM_IM_LOGOUT
    });
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_USER_HAS_LOGOUT,
      status: 1
    });
    this.cleanServiceData();
  }

  /**
   * 刷新联系人列表
   */
  refreshContactListData(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: { status: number, data: { staff: any } }) => {
        if (response.status === 1) {
          this.userDataService.reloadContactList(response.data.staff);
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 用户收到权限变更通知
   * @param quiet 是否静默刷新
   * @param content dialog的内容文本
   */
  dealChangeUserPermission(quiet: boolean = false, content?: string) {
    // 重新获取所有公司信息
    // TODO: 通知后端已收到此通知
    if (!content) {
      content = 'Your permission has changed, please re login.'
    }
    this.userModelService.resetPermission((data: {status: number, data: {companies_information: any}}) => {
      if (data.status === 1) {
        this.userDataService.refreshCompanyInfo(data.data.companies_information);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_REFRESH_COMPANY,
          data: {}
        });
        if (!quiet) {
          // 执行强制退出
          this.dialogService.openNotLoginWarning(
            () => {
              this.cleanServiceData();
            },
            {simpleContent: content}
          );
        } else {
          this.userModelService.getGrantList((res: any) => {
            if (res.status == 1 && res.data) {
              let newPermArr: Array<any> = [];
              for (let k in res.data) {
                if (res.data.hasOwnProperty(k)) {
                  newPermArr.push(res.data[k]);
                }
              }
              this.companyDataService.setCurrentPermission(newPermArr);
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_REFRESH_POSITION_NAME,
                data: {}
              })
            }
          })
        }
      }
    });
  }

  /**
   * 根据psid或者uuid在contact list中找寻相同值
   * @param uid
   * @param {Function} deal
   */
  searchUserInfoInContactList(uid: any, deal?: Function) {
    let selfPSID = this.userDataService.getCurrentCompanyPSID();
    let selfUUID = this.userDataService.getCurrentUUID();
    let isSelf = uid == selfUUID || uid == selfPSID;
    this.getContactList((contactList: any) => {
      let find:any = false;
      for (let key in contactList) {
        for (let i = 0; i < contactList[key].length; i++) {
          if (contactList[key][i].psid == uid || contactList[key][i].uuid == uid ||  contactList[key][i].uid == uid) {
            find = contactList[key][i];
            break;
          }
        }
      }
      if (deal) {
        deal({find: find, isSelf: isSelf});
      }
    });
  }
}

