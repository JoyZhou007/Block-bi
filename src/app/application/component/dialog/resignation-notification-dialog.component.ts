import { Component, Inject, Input, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

@Component({
  selector: 'resignation-notification-dialog',
  templateUrl: '../../template/dialog/resignation-notification-dialog.component.html',
})

export class ResignationNotificationDialogComponent implements OnInit {
  public user_profile_path: string = '';
  public work_name: string = '';
  private msg: string = '';
  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  private notificationIn: any;
  public senderInfo: any;
  public date: string = '';
  public reasonMsg: string = '';
  public type: boolean = true;
  private subscription: Subscription;
  private isLineManager: boolean = true;

  // true: transfer 1 false: freeze 1

  constructor(@Inject('im.service') public imService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,) {
    // 接收到回馈信息之后
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT ||
        message.act === this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_REFUSE ||
        message.act === this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {
            status: message.status,
            message: message.status != 1 ? 'Accept failed!' : ''
          };
          if (message.act === this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_REFUSE) {
            result.message = message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: result
          });
        }
      }
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
  }

  @Input('setOption')
  public set setOption(data: any) {
    if (data) {
      if (data.hasOwnProperty('isLineManager')) {
        this.isLineManager = data.isLineManager;
      }
      this.initData(data);
      this.senderInfo = data.senderInfo;
    }
  }


  private initData(data: any) {
    this.user_profile_path = data.groupCreatorProfile;
    this.work_name = data.groupCreator;

    this.msg = data.notification.message;
    this.notificationIn = data.notification;
    this.date = data.date;
    this.reasonMsg = data.reasonMsg;
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


  /**
   * line manager 同意
   */
  public acceptResignationApplication(): void {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });

    let sendData = {};
    if (this.isLineManager) {
      sendData = {
        request_id: this.notificationIn.request_id,
        applicant: this.notificationIn.owner,
      }
    }
    this.imService.acceptResignationApply(sendData);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
      data: {
        data: {
          request_id: this.notificationIn.request_id
        }
      }
    });
  }

  /**
   * hr ceo mainAdmin 同意
   */
  public hrAcceptResignationApplication(): void {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });

    let sendData = {};
    sendData = {
      applicant: this.notificationIn.owner,
      line_manager: this.notificationIn.line_manager,
      transfer: this.type ? '1' : '0',
      freeze: this.type ? '0' : '1',
      request_id: this.notificationIn.request_id,
    };


    this.imService.hrAcceptResignationApply(sendData);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
      data: {
        data: {
          request_id: this.notificationIn.request_id
        }
      }
    });
  }

  public refuseResignationApplication(): void {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });
    this.imService.refuseResignationApply({
      request_id: this.notificationIn.request_id,
      applicant: this.notificationIn.owner,
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