import {Component, Inject, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {CompanyModelService} from '../../shared/services/index.service';
import {UserModelService} from "../../../shared/services/model/user-model.service";
import {Subscription} from "rxjs";
@Component({
  selector: 'out-office-reply',
  templateUrl: '../../template/dialog/out-office-reply.component.html',
  encapsulation: ViewEncapsulation.None
})

export class OutOfficeReplyComponent implements OnInit {

  private outOfficeApplicationObj: any;
  private senderInfo: any;
  private formatEndDate: any;
  private formatStartDate: any;
  private sendMessage: string;
  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  private subscription: Subscription;


  constructor(public userModelService: UserModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('date.service') public dateService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('im.service') public imService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_OUT_OFFICE_ACCEPT ||
        message.act === this.notificationService.config.ACT_NOTICE_OUT_OFFICE_REFUSE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept out office failed!' : ''};
          if(message.act === this.notificationService.config.ACT_NOTICE_OUT_OFFICE_REFUSE){
            result.message =  message.status != 1 ? 'Refuse out office failed!' : '';
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });

  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
  ngOnInit() {
  }


  @Input() set setOption(data: any) {
    this.outOfficeApplicationObj = data.notification;
    this.senderInfo = data.senderInfo;
    this.formatEndDate = data.formatEndDate;
    this.formatStartDate = data.formatStartDate;
    this.sendMessage = data.notification.message
  }


  /**
   * 鼠标经过/离开
   * @param param
   */
  outOfficeButDialog(param: any){
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }



  /**
   * 同意外出申请
   */
  acceptOutOfficeApplication() {
    if (!this.outOfficeApplicationObj.handled || this.outOfficeApplicationObj.handled == 0) {
      this.imService.acceptOutOffice({
        receiver: this.outOfficeApplicationObj.owner,
        id: this.outOfficeApplicationObj.id,
        request_id: this.outOfficeApplicationObj.request_id,
        owner: this.userDataService.getCurrentCompanyPSID()
      })
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
        data: {
          data: {
            request_id: this.outOfficeApplicationObj.request_id
          }
        }
      });
    }
  }

  /**
   * 驳回外出申请
   */
  refuseOutOfficeApplication() {
    if (!this.outOfficeApplicationObj.handled || this.outOfficeApplicationObj.handled == 0) {

      this.imService.refuseOutOffice({
        receiver: this.outOfficeApplicationObj.owner,
        id: this.outOfficeApplicationObj.id,
        request_id: this.outOfficeApplicationObj.request_id,
        owner: this.userDataService.getCurrentCompanyPSID()
      })
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
        data: {
          data: {
            request_id: this.outOfficeApplicationObj.request_id
          }
        }
      });
    }
  }


}