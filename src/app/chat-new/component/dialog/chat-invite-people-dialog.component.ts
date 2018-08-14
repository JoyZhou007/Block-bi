import {Component, Inject, Input, OnInit} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'chat-invite-people-dialog',
  templateUrl: '../../template/dialog/chat-invite-people-dialog.component.html'
})

export class ChatInvitePeopleDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;
  public senderInfo: any = {};
  private subscription: Subscription;

  constructor(@Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public chatService: any) {
    // 接收到回馈信息之后
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE ||
        message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if (message.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE) {
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
      if (this.notificationIn.hasOwnProperty('introducer')) {
        this.notificationIn.form = !isNaN(this.notificationIn.introducer) ? 2 : 1;
      }
      for (let i in data.obj.detail.user) {
        if (data.obj.detail.user[i].uid == data.data.owner) {
          this.senderInfo = data.obj.detail.user[i];
        }
      }
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
   * 被邀请人拒绝入群
   */
  chatInvitePeopleDialogRefuse() {

    /*this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.chatService.refuseGroupInvite({
        friend: this.notificationIn.owner,
        gid: this.notificationIn.gid,
        name: this.notificationIn.name,
        form: this.notificationIn.form,
        introducer: this.notificationIn.owner,
        members: this.notificationIn.member,
        request_id: this.notificationIn.request_id
      });
    }
  }

  /**
   * 被邀请人接受入群
   */
  chatInvitePeopleDialogAccept() {

    // this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.chatService.agreeGroupInvite({
        gid: this.notificationIn.gid,
        name: this.notificationIn.name,
        form: this.notificationIn.form,
        introducer: this.notificationIn.owner,
        members: this.notificationIn.member,
        request_id: this.notificationIn.request_id
      });
    }
  }
}
