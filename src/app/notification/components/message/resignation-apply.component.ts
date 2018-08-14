import {Component, Inject, Input, OnInit} from "@angular/core";
import * as ApplicationConst from "../../../shared/config/application.config";
import {NotificationDialog} from "../../../shared/services/model/entity/notification-entity";

@Component({
  selector: 'resignation-apply',
  templateUrl: '../../template/message/resignation-apply.component.html'
})
export class ResignationApplyComponent implements OnInit {

  public notificationObj: any;
  public notificationIn: any;
  private senderInfo: any;
  public groupCreator: string = '';
  public objInfo: NotificationDialog;
  public groupCreatorProfile: string = '';
  public reasonMsg: string = '';
  public date: string = '';
  public notificationTime: string = '';

  constructor(@Inject('app.config') public config: any,
              @Inject('date.service') public dateService: any,
              @Inject('file.service') public fileService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any) {
  }

  ngOnInit(): void {
  }

  //父级传入的提示消息
  @Input()
  set setNotification(notification: any) {
    if (notification) {
      this.objInfo = notification.obj;
      this.notificationObj = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.notificationTime = this.dateService.formatWithTimezone(this.objInfo.ts, 'HH:MM');
      this.initTplModel()
    }
  }

  private initTplModel(): void {
    if (this.objInfo.senderInfo.status == 1) {
      let groupCreatorProfile = this.fileService.getImagePath(20, this.objInfo.senderInfo.user_profile_path);
      this.groupCreatorProfile = groupCreatorProfile ? this.config.resourceDomain + groupCreatorProfile : '';
      this.groupCreator = this.objInfo.senderInfo.work_name;
    } else if (this.objInfo.senderInfo.status == 0) {
      let groupCreatorProfile = this.fileService.getImagePath(20, this.objInfo.senderInfo.user_profile_path);
      this.groupCreatorProfile = groupCreatorProfile ? this.config.resourceDomain + groupCreatorProfile : '';
      this.groupCreator = '空职位';
    } else if (this.objInfo.senderInfo.status == -1) {
      let groupCreatorProfile = this.fileService.getImagePath(20, this.objInfo.senderInfo.user_profile_path);
      this.groupCreatorProfile = groupCreatorProfile ? this.config.resourceDomain + groupCreatorProfile : '';
      this.groupCreator = '未知职位';
    }
    this.reasonMsg = this.notificationIn.reason;
    if (this.notificationObj.act == this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT) {
      this.date = this.dateService.formatLocal(this.notificationIn.date * 1000, 'ddS mmm yyyy');
    } else if(this.notificationObj.act == this.notificationService.config.ACT_APPLICATION_REQUEST_APPLY_DISMISSION) {
      this.date = this.dateService.formatLocal(this.notificationIn.expected_resignation_date * 1000, 'ddS mmm yyyy');
    }
  }

  public clickOpenDialog(event: MouseEvent): void {
    if (!this.notificationIn.handled || this.notificationIn.handled == 0) {
      let isLineManager;
      if (this.notificationObj.hasOwnProperty('act')) {
        isLineManager = this.notificationObj.act !== this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT;
      } else {
        isLineManager = true;
      }
      let optionData: any = {
        senderInfo: this.senderInfo,
        notification: this.notificationIn,
        notificationObj: this.notificationObj,
        groupCreatorProfile: this.groupCreatorProfile,
        groupCreator: this.groupCreator,
        date: this.date,
        reasonMsg: this.reasonMsg,
        isLineManager: isLineManager
      };

      let settings = {};
      if (isLineManager) {
        settings = {
          mode: '1',
          title: 'RESIGNATION APPLICATION',
          isSimpleContent: false,
          componentSelector: 'resignation-notification-dialog',
          componentData: optionData,
          buttons: [{
            type: 'accept',
            btnText: 'ACCEPT',
            btnEvent: 'acceptResignationApplication',
            mouseEnterEvent: 'outVacationButDialog',
            mouseLeaveEvent: 'outVacationButDialog'
          }, {
            type: 'refuse',
            btnText: 'REFUSE',
            btnEvent: 'refuseResignationApplication',
            mouseEnterEvent: 'outVacationButDialog',
            mouseLeaveEvent: 'outVacationButDialog'
          }]
        }
      } else {
        settings = {
          mode: '1',
          title: 'RESIGNATION APPLICATION',
          isSimpleContent: false,
          componentSelector: 'resignation-notification-dialog',
          componentData: optionData,
          buttons: [{
            type: 'accept',
            btnText: 'ACCEPT',
            btnEvent: 'hrAcceptResignationApplication',
            mouseEnterEvent: 'outVacationButDialog',
            mouseLeaveEvent: 'outVacationButDialog'
          }]
        }
      }

      this.dialogService.openNew(settings);
    }
  }
}
