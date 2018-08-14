import {Injectable, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {UserModelService} from "../../model/user-model.service";

@Injectable()
export class PageStatusService {
  private ERROR_CODE_NO_LOGIN: number = -10001;
  private ERROR_CODE_NO_ACCESS: number = 400;
  private ERROR_CODE_SESSION_EXPIRED: number = 501;
  constructor(private router: Router,
              @Inject('store.service') private store: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService : any,
              @Inject('im.service') public IMService: any,
              @Inject('notification-data.service') public notificationDataService: any,
              @Inject('company-data.service') public companyDataService : any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('notification.service') public notificationService: any,) {
  }


  get sessionExpiredCode(){
    return this.ERROR_CODE_SESSION_EXPIRED;
  }

  /**
   * 处理页面状态
   * @param response
   * @param requestUrl
   * @param callback
   */
  dealPageStatus(response: any, requestUrl:string, callback?: any) {
    if (!response.hasOwnProperty('status')) {
      return;
    }
    let code: number = response.status;

    //是否可以执行回调方法
    let isCanDoCallback: boolean = false;
    switch (code) {
      case this.ERROR_CODE_NO_LOGIN :
        this.toLogout();
        break;
      case this.ERROR_CODE_NO_ACCESS :
        this.toNoAccess();
        break;
      default :
        isCanDoCallback = true;	//不在公用错误的页面状态,可以执行回调操作
        break;
    }
    if (isCanDoCallback) {
      callback();
    }
  }

  /**
   * 跳转到都用户首页
   */
  toNoAccess(){
    this.dialogService.openNoAccess();
  }

  /**
   * 跳转登录页面
   */
  toLogout() {
    // 执行强制退出
    this.dialogService.openNotLoginWarning(
      () => {
        this.IMService.close();
        this.companyDataService.removeCompanyData();
        this.messageDataService.removeChatListCache();
        this.userDataService.removeUserLoginData();
        this.notificationDataService.removeNotificationNoticeData();
      }
    );
  }

  /**
   * 返回
   */
  toBack() {
    /*var accessPageIn = this.store.getAccessRouteIn();
     if(accessPageIn) {
     this.router.navigateByUrl(accessPageIn.beforeRoute);
     } else {
     //用浏览器直接跳转
     window.history.go(-1);
     }*/
  }
}
