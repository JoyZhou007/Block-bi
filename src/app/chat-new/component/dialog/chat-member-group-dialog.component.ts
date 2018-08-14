import {Component, Inject, Input, OnInit} from '@angular/core';
import {NotificationDataService} from '../../../shared/services/index.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'chat-member-group-dialog',
  templateUrl: '../../template/dialog/chat-member-group-dialog.component.html'
})

export class ChatMemberGroupDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;
  public senderInfo: any = {};
  public objInfo: any = {};
  public members: any;

  private notificationKey: string;
  private notificationStatus: number;
  private subscription: Subscription;

  constructor(@Inject('app.config') public config: any,
              @Inject('im.service') public chatService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              public notificationDataService: NotificationDataService) {
    // 接收到回馈信息之后
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE ||
        message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_ACCEPT) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if (message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE) {
            result.message =  message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: result
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.notificationIn = data.data;
      this.objInfo = data.obj;
      this.senderInfo = data.obj.senderInfo;

      //邀请人列表
      //this.members = this.typeService.clone(data.obj.detail.user);
      //this.members.splice(0, 1);

      this.notificationKey = data.nKey;
      this.notificationStatus = data.resultStatus;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  chatInvitePeopleButDialog(param: any) {
    if (param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    } else if (param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 群主拒绝被邀请人
   */
  chatInvitePeopleDialogRefuse() {

    /* this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.chatService.memberGroupRefuse({
        friend: this.notificationIn.owner,
        gid: this.notificationIn.gid,
        name: this.notificationIn.name,
        form: this.notificationIn.form,
        introducer: this.notificationIn.owner,
        members: this.notificationIn.members,
        request_id: this.notificationIn.request_id
      });
    }
  }

  /**
   * 群主接受被邀请人
   *
   */
  chatInvitePeopleDialogAccept() {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.chatService.memberGroupAgree({
        gid: this.notificationIn.gid,
        name: this.notificationIn.name,
        form: this.notificationIn.form,
        introducer: this.notificationIn.owner,
        members: this.notificationIn.members,
        request_id: this.notificationIn.request_id
      });
    }
  }
}
