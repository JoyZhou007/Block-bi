import {Component, Inject, Input} from '@angular/core';

@Component({
  selector: 'chat-invite-group-message',
  templateUrl: '../../template/message/chat-invite-group-message.component.html'
})

export class ChatInviteGroupMessageComponent {

  private userInfo: any;
  public notificationInfo: any;
  public notificationIn: any;
  public notificationTime: string;
  public senderInfo: any;
  public objInfo: any = {};

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') private dateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any) {
    this.userInfo = this.userDataService.getUserIn();
  }

  //父级传入的提示消息
  @Input() set setNotification(notification: any) {
    if (notification) {
      this.notificationInfo = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.hasOwnProperty('senderInfo') ? notification.obj.senderInfo : notification.obj.detail.user[0];
      this.objInfo = this.notificationInfo.obj;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 弹框
   * @param data
   */
  doChatGroupMessage(data: any) {
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      let dataObj: any = this.typeService.clone(this.notificationInfo);
      let settings = {
        mode: '1',
        title: 'CHAT INVITE PEOPLE',
        isSimpleContent: false,
        componentSelector: 'chat-invite-people-dialog',
        componentData: dataObj,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'chatInvitePeopleDialogRefuse',
            mouseEnterEvent: 'chatInvitePeopleButDialog',
            mouseLeaveEvent: 'chatInvitePeopleButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'chatInvitePeopleDialogAccept',
            mouseEnterEvent: 'chatInvitePeopleButDialog',
            mouseLeaveEvent: 'chatInvitePeopleButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }
  }

}
