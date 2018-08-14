import { Component, HostListener, AfterViewInit, OnInit, Inject, ViewChild,
  ViewEncapsulation, EventEmitter, Output, OnDestroy} from '@angular/core';

import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'user-notification',
  templateUrl: '../template/user-notification.component.html',
  styleUrls: ['../../../assets/css/home/home-notification.css'],
  encapsulation: ViewEncapsulation.None
})
export class UserNotificationComponent implements OnInit, AfterViewInit, OnDestroy {

  public loadNotificationSetting: boolean = false;

  public showNotification: boolean = false;
  public loadNotification: boolean = true;

  public showMyNotification: boolean = false;
  public showMySendNotification: boolean = false;
  public noticeType: any;
  public notificationStatus: any = {};

  @Output() public userEvent = new EventEmitter();

  //currentContact
  @ViewChild('settingEl') public settingEl: any;
  @ViewChild('notificationMessage') public notificationMessage: any;
  @ViewChild('sendNotificationMessage') public sendNotificationMessage: any;

  public hNotificationArr: Array<boolean> = [false, false, false];
  private currentNotifiNum: number;
  public subscription: Subscription;

  @HostListener('document:mousedown', ['$event'])
  mousedown(event: any) {
    let className: string = event.target.className;
    if(/h-contact-box-an/.test(className)) {
      this.showNotification = false;
      this.notificationMessage.isNotificationMessage = false;
      this.loadNotificationSetting = false;
      if(this.noticeType) {
        this.hNotificationArr[this.noticeType - 1] = false;
      }
    }
  }

  constructor(
    @Inject('app.config') public config: any,
    @Inject('page.element') public element: any,
    @Inject('notification.service') public notificationService: any
  ) {}

  //启动
  ngOnInit() {
  }

  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any) {
    switch (parseInt(data.act)) {
      case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_PUSH_DATA:
        this.notificationMessage.addMyNotification(data.data);

        //缓存消息状态
        this.notificationStatus = this.notificationMessage.getNotificationMessageStatus(true, this.noticeType);
        break;
    }
  }

  ngAfterViewInit() {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //关闭notification
  closeNotification() {
    this.showNotification = false;
  }

  /**
   *加载通知
   */
  doLoadUserNotification(isShow: boolean) {
    this.loadNotification = isShow;
    if (isShow) {
      this.showNotification = isShow;
    }

    //缓存消息状态
    this.notificationStatus = this.notificationMessage.getNotificationMessageStatus();
  }

  /**
   *显示隐藏通知
   */
  doShowUserNotification(isShow: boolean) {
    this.showNotification = isShow;
    this.noticeType = 0;
    this.loadNotificationSetting = false;
    this.notificationMessage.hideNotificationMessage();
    if (typeof this.currentNotifiNum !== 'undefined') {
      this.hNotificationArr[this.currentNotifiNum] = false;
    }
    if (isShow) {
      this.showNotificationType(1);
    }
  }

  getCloseNotificationData() {
    this.loadNotificationSetting = false;
    this.noticeType = 0;
  }

  /**
   * 切换显示类型
   *
   * @param type
   */
  showNotificationType(type: number) {
    if (type === 1) {
      this.showMyNotification = true;
      this.showMySendNotification = false;
    } else if (type === 2) {
      this.showMyNotification = false;
      this.showMySendNotification = true;
    }
  }

  clearNotification() {
    this.notificationMessage.clearNotification();
  }

  /**
   * 切换notification message
   * @param num
   */
  doHNotificationTab(num: number) {
    this.noticeType = num;
    if (typeof this.currentNotifiNum !== 'undefined') {
      this.hNotificationArr[this.currentNotifiNum] = false;
    }

    if(this.noticeType === 2) {
      this.notificationMessage.initUserNotification();
    }
    this.hNotificationArr[num - 1] = true;
    this.currentNotifiNum = num - 1;
    this.showMyNotification = true;

    //隐藏setting
    this.loadNotificationSetting = false;

    //显示 notification message
    this.notificationMessage.showNotificationMessage();
    this.notificationMessage.isShowMailMessage = num === 4;

    //缓存消息状态
    this.notificationStatus = this.notificationMessage.getNotificationMessageStatus(true, num);
  }

  doSettingBoxShow() {
    this.loadNotificationSetting = true;
    this.notificationMessage.hideNotificationMessage();
    this.showMyNotification = false;
    if (typeof this.currentNotifiNum !== 'undefined') {
      this.hNotificationArr[this.currentNotifiNum] = false;
    }
  }

  /**
   * 阻止事件冒泡
   * @param event
   */
  preventBubbles(event: any) {
    event.stopPropagation();
  }
}
