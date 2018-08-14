import {Component, Inject, Input, OnInit} from "@angular/core";
import * as ApplicationConst from "../../../shared/config/application.config";
import {NotificationDialog} from "../../../shared/services/model/entity/notification-entity";

@Component({
  selector: 'vacation-apply',
  templateUrl: '../../template/message/vacation-apply.component.html'
})
export class VacationApplyComponent implements OnInit {

  public notificationObj: any;
  public notificationIn: any;
  private senderInfo: any;
  public vacationType: string = '';
  public groupCreator: string = '';
  public objInfo: NotificationDialog;
  public groupCreatorProfile: string = '';
  public startTime: string = '';
  public endTime: string = '';

  constructor(@Inject('app.config') public config: any,
              @Inject('date.service') public dateService: any,
              @Inject('file.service') public fileService: any,
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
      this.initTplModel()
    }
  }


  private initTplModel(): void {
    if (this.notificationObj.data.hasOwnProperty('type')) {
      let type = this.notificationObj.data.type.toString();
      switch (type) {
        case ApplicationConst.CASUAL_LEAVE:
          this.vacationType = 'Casual leave';
          break;
        case ApplicationConst.SICK_LEAVE:
          this.vacationType = 'Sick leave';
          break;
        case ApplicationConst.MARITAL_LEAVE:
          this.vacationType = 'Marital leave';
          break;
        case ApplicationConst.MATERNITY_LEAVE:
          this.vacationType = 'Maternity leave';
          break;
        case ApplicationConst.ANNUAL_LEAVE:
          this.vacationType = 'Annual leave';
          break;
      }
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
      this.startTime = this.dateService.formatLocal(this.notificationIn.start * 1000);
      this.endTime = this.dateService.formatLocal(this.notificationIn.end * 1000);

    }

  }

  public clickOpenDialog(event: MouseEvent): void {
    // event.stopPropagation();
    if (!this.notificationIn.handled || this.notificationIn.handled == 0) {
      let optionData: any = {
        senderInfo: this.senderInfo,
        notification: this.notificationIn,
        notificationObj: this.notificationObj,
        startTime: this.startTime,
        endTime: this.endTime,
        groupCreatorProfile: this.groupCreatorProfile,
        groupCreator: this.groupCreator,
        vacationType: this.vacationType
      };
      this.dialogService.openNew({
        mode: '1',
        title: 'LEAVE APPLICATION',
        isSimpleContent: false,
        componentSelector: 'vacation-notification-dialog',
        componentData: optionData,
        buttons: [{
          type: 'accept',
          btnText: 'ACCEPT',
          btnEvent: 'acceptVacationApplication',
          mouseEnterEvent: 'outVacationButDialog',
          mouseLeaveEvent: 'outVacationButDialog'
        }, {
          type: 'refuse',
          btnText: 'REFUSE',
          btnEvent: 'refuseVacationApplication',
          mouseEnterEvent: 'outVacationButDialog',
          mouseLeaveEvent: 'outVacationButDialog'
        }]
      });
    }
  }
}