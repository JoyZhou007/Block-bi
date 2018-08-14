import {Component, Input, Inject, OnDestroy} from '@angular/core';
import {NotificationDataService, ContactModelService} from '../../shared/services/index.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'add-contact-dialog',
  templateUrl: '../template/new-contact-dialog.component.html',
  providers : [ContactModelService]
})

export class NewContactDialogComponent implements OnDestroy{

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public contactFeedback: string = '';
  public notificationIn: any;
  public relation: any[];
  public senderInfo: any;
  private getData: any;
  public objInfo: any = {};
  public subscription: Subscription;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('notification.service') public notificationService : any,
    public notificationDataService : NotificationDataService
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND ||
          message.act === this.notificationService.config.ACT_USER_NOTICE_REFUSE_ADD_FRIEND) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept friend failed!' : ''};
          if(message.act === this.notificationService.config.ACT_USER_NOTICE_REFUSE_ADD_FRIEND){
            result.message = message.status != 1 ? 'Refuse friend failed!' : ''
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });

  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.getData = data.data;
      this.objInfo = data.obj;
      this.senderInfo =  data.hasOwnProperty('obj') ? data.obj.senderInfo : {};
      this.notificationIn = data;
      this.relation = this.getData.relation;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  contactButDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝好友请求
   */
  contactDialogRefuse() {
    this.memberService.refuseApplyFriend({
      friend: {
        uuid: this.getData.owner.uuid,
        psid: this.getData.owner.psid
      },
      feedback: this.contactFeedback,
      request_id: this.getData.request_id
    });
  }

  /**
   * 接收好友请求
   */
  contactDialogAccept() {
    this.memberService.acceptApplyFriend({
      friend: {
        uuid: this.getData.owner.uuid,
        psid:this.getData.owner.psid
      },
      feedback: this.contactFeedback,
      friend_relation : this.relation,
      request_id : this.getData.request_id
    });
  }

}