import {Component, Inject, Input, OnInit} from "@angular/core";
import {Subscription} from "rxjs";

@Component({
  selector: 'vacation-notification-dialog',
  templateUrl: '../../template/dialog/vacation-notification-dialog.component.html',
})

export class VacationNotificationDialogComponent implements OnInit {
  public user_profile_path: string = '';
  public startTime: string = '';
  public endTime: string = '';
  public work_name: string = '';
  public vacationType: string = '';
  private msg: string = '';
  private rest: string | number = '';
  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  private notificationIn: any;
  public senderInfo: any;
  private subscription: Subscription;

  constructor(@Inject('im.service') public imService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_VACATION_APPLY_ACCEPT ||
        message.act === this.notificationService.config.ACT_USER_VACATION_APPLY_REFUSE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if(message.act === this.notificationService.config.ACT_USER_VACATION_APPLY_REFUSE){
            result.message = message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });

  }

  ngOnInit(): void {
  }

  @Input('setOption')
  public set setOption(data: any) {
    if(data) {
      this.initData(data);
      this.senderInfo = data.senderInfo;
    }
  }


  private initData(data: any) {
      this.user_profile_path = data.groupCreatorProfile;
      this.work_name = data.groupCreator;

      this.startTime = data.startTime;
      this.endTime = data.endTime;
      this.vacationType = data.vacationType;
      this.msg = data.notification.message;
      this.rest = data.notification.rest === -1 ? '∞' : data.notification.rest;
      this.notificationIn = data.notification;

  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  outVacationButDialog(param: any) {
    if (param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    } else if (param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  public acceptVacationApplication(): void {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });
    this.imService.acceptVacation({
      receiver: this.notificationIn.owner,
      id: this.notificationIn.id,
      request_id: this.notificationIn.request_id,
      owner: this.userDataService.getCurrentCompanyPSID()
    });
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
      data: {
        data: {
          request_id: this.notificationIn.request_id
        }
      }
    });
  }
  public refuseVacationApplication(): void {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });
    this.imService.refuseVacation({
      receiver: this.notificationIn.owner,
      id: this.notificationIn.id,
      request_id: this.notificationIn.request_id,
      owner: this.userDataService.getCurrentCompanyPSID()
    });
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
      data: {
        data: {
          request_id: this.notificationIn.request_id
        }
      }
    });
  }

}