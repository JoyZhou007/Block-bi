import {
  AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation,
  HostListener, Renderer
} from "@angular/core";
import "rxjs/add/operator/pairwise";
import {Subscription} from "rxjs/Subscription";
import {Ng2DeviceService} from "ng2-device-detector";

Object.assign = Object.assign || function (t) {
    for (let s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };

@Component({
  selector: 'blockbi-app',
  templateUrl: './common/template/app.component.html',
  styleUrls: ['../../node_modules/loaders.css/loaders.min.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    Ng2DeviceService
  ]
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public subscription: Subscription;
  public os: string = '';
  public browser: string = '';
  public zhBrowser: boolean = false;
  public lbBrowser: boolean = false;
  public QQBrowser: boolean = false;
  public ayBrowser: boolean = false;
  public chBrowser: boolean = false;
  public prepared: boolean = false;
  @ViewChild('routerOutlet') public routerOutlet: any;

  //public componentType : string = 'app';
  constructor(public detectService: Ng2DeviceService,
              public renderer: Renderer,
              @Inject('dialog.service') private dialogService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('user.service') public userService: any,
              @Inject('im.service') public IMService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }


  @HostListener('document:click', ['$event'])
  onclick(event: any) {
    event.stopPropagation();
    let getElement: any = this.toggleSelectService.backElement();
    if (getElement.selectElement) {
      this.renderer.setElementClass(getElement.selectElement, 'hide', true);
      if (getElement.currClass && getElement.clickElement && getElement.clickElement.parentElement) {
        this.renderer.setElementClass(getElement.clickElement.parentElement, getElement.currClass, false);
      }
      this.toggleSelectService.emptyElement();
    }
  }

  //初始化页面后
  ngOnInit() {
    //检测是否要删除本地存储数据
    let detectInfo = this.detectService.getDeviceInfo();
    this.os = detectInfo.hasOwnProperty('os') ? detectInfo.os : '';
    this.browser = detectInfo.hasOwnProperty('browser') ? detectInfo.browser : '';
    console.log(detectInfo);
    this.checkBrowser();
    /*if(this.browser && this.browser === 'chrome') {
      if(detectInfo.userAgent.indexOf('(Windows NT 6.1; Win64; x64)') < -1) {
        this.zhBrowser = true;
      }
    }
    if (this.browser && this.browser === 'chrome' && detectInfo.userAgent.indexOf('Windows NT 10.0')) {
      if (detectInfo.userAgent.indexOf('(Windows NT 10.0; Win64; x64)') <= -1) {
        this.zhBrowser = true;
      }
    }*/

    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
  }


  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_COMPONENT_USER_HAS_LOGIN:
        if (data.status == 1) {
          this.prepared = true;
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_USER_HAS_LOGOUT:
        if (data.status == 1) {
          this.prepared = false;
        }
        break;
      case this.notificationService.config.ACT_SYSTEM_IM_LOGIN:
        if (data.status == 1) {
          this.IMService.socketLoginStatus = true;
        }
        break;
      case this.notificationService.config.ACT_USER_SESSION_EXPIRED:
        this.userService.dealUserSessionExpired(data);
        break;
      case this.notificationService.config.ACT_USER_PERMISSION_CHANGED:
        this.userService.dealChangeUserPermission(false);
        break;
      case this.notificationService.config.ACT_USER_PERMISSION_FREEZE:
        if (data.data && data.data.hasOwnProperty('cid') && data.data.cid == this.companyDataService.getCurrentCompanyCID()) {
          this.userService.dealChangeUserPermission(false);
        }
        break;
      case this.notificationService.config.ACT_USER_PERMISSION_CHANGED_IN_SILENCE:
        this.userService.dealChangeUserPermission(true);
        break;
      // 组织架构添加成员，刷新contact list
      case this.notificationService.config.ACT_STRUCTURE_NOTICE_STRUCTURE_CHANGE:
        if (data.data && data.data.hasOwnProperty('cid') && data.data.cid == this.companyDataService.getCurrentCompanyCID()) {
          this.userService.refreshContactListData();
        }
        break;
      //如果接到的是离职申请同意 需要退出登录
      case this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED:
        if (data.data && data.data.hasOwnProperty('applicant')) {
          if (data.data.applicant == this.userDataService.getCurrentCompanyPSID()) {
            this.userService.dealChangeUserPermission(true, 'your application for resignation has been agreed, please re login.');
          }
        }
        break;
    }
  }


  checkBrowser() {
    let ua = navigator.userAgent.toLocaleLowerCase();
    if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
      if(ua.match(/lbbrowser/) != null) {
        console.log("猎豹");
        this.lbBrowser = true;
      }else {
        console.log("IE");
      }
    } else if (ua.match(/firefox/) != null) {
      console.log("火狐");
    } else if (ua.match(/ubrowser/) != null) {
      console.log("UC");
      this.zhBrowser = true;
    } else if (ua.match(/opera/) != null) {
      console.log("欧朋");
    } else if (ua.match(/bidubrowser/) != null) {
      console.log("百度");
      this.zhBrowser = true;
    } else if (ua.match(/metasr/) != null) {
      console.log("搜狗");
      this.zhBrowser = true;
    } else if (ua.match(/tencenttraveler/) != null || ua.match(/qqbrowse/) != null) {
      console.log("QQ");
      this.QQBrowser = true;
    } else if (ua.match(/maxthon/) != null) {
      console.log("遨游");
      this.ayBrowser= true;
    } else if (ua.match(/chrome/) != null) {
      let is360 = this.mime("type", "application/vnd.chromium.remoting-viewer");
      if (is360) {
        console.log('360');
        this.zhBrowser = true;
      } else {
        this.chBrowser = true;
        console.log("谷歌");
      }

    } else if (ua.match(/safari/) != null) {
      console.log("Safari");
    }
  }

  mime(option, value) {
    let mimeTypes = navigator.mimeTypes;
    for (let mt in mimeTypes) {
      if (mimeTypes[mt][option] == value) {
        return true;
      }
    }
    return false;
  }
}
