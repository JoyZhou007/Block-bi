import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { ContactModelService, ContactsList } from '../../../shared/services/index.service';
import { Router, ActivatedRoute } from "@angular/router";
import { TipsComponent } from "../../../tips/components/tips.component";
import { el } from '@angular/platform-browser/testing/browser_util';
import { UserModelService } from '../../../shared/services/model/user-model.service';

@Component({
  selector: 'new-notice',
  templateUrl: '../../template/message/new-notice.component.html'
})
export class NewNoticeComponent implements OnInit {

  public notificationObj: any;
  public notificationIn: any;
  public noticeText: string;
  public isNoticeTag: boolean;
  public hasInit: boolean = false;
  public notificationOwner: any;
  public notificationTime: any;
  public contactsList: ContactsList = ContactsList.init();
  public objInfo: any = {};

  //获取首页tip
  @ViewChild('TipsComponent') tipsComponent: TipsComponent;

  constructor(public router: Router,
              @Inject('app.config') public appConfig: any,
              @Inject('date.service') public dateService: any,
              public userModelService: UserModelService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any) {
  }

  //启动
  ngOnInit() {
  }

  //
  @Input()
  set setNotification(notification: any) {
    if (notification) {
      this.notificationObj = notification;
      this.hasInit = true;
      this.notificationIn = notification.data;
      if (notification.obj) {
        this.objInfo = notification.obj;
        this.notificationOwner = notification.obj.senderInfo;
        this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
      } else {

      }

    }
  }

  clickOnNotice(event: any) {
    event.stopPropagation();
    if (!this.notificationObj.hasOwnProperty('isInMail') && this.notificationService.hasOwnProperty('isAlarm')) {
      this.onClickAlarmNotification();
    } else if (this.notificationObj.hasOwnProperty('isInMail')) {
      let setOptionData = {
        left: event.clientX,
        top: event.clientY,
        member: this.notificationOwner,
        isInMail: true
      };
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-mini-dialog',
          options: setOptionData
        }
      });
    }

  }

  /**
   * 点击闹钟通知
   */
  onClickAlarmNotification() {
    if (this.notificationObj.act === 199020) {  //闹钟推送
      if (this.notificationObj.data.form == '1') { //点击mission闹钟，跳转到mission detail页面
        this.router.navigate(['mission/detail', this.notificationObj.data.rid]);
      } else if (this.notificationObj.data.form == '2') {  //点击chat闹钟，

      } else if (this.notificationObj.data.form == '3') {  //点击tips闹钟，打开tips内容弹框
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_ALARM_SEND_TIPS,
          data: {
            rid: this.notificationObj.data.rid
          }
        });
      }
    }
  }
}
