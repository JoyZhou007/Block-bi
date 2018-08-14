import {Component, Inject, Input} from '@angular/core';

@Component({
  selector: 'chat-member-group-invite',
  templateUrl: '../../template/message/chat-member-group-invite.component.html'
})

export class ChatMemberGroupviteComponent {

  private userInfo: any;
  public notificationInfo: any;
  public notificationIn: any;
  public objInfo: any;
  public senderInfo: any;
  public innerHtml: string;
  public notificationTime: string;

  constructor(
    @Inject('app.config') public config: any,
    @Inject('type.service') public typeService: any,
    @Inject('date.service') private dateService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('user-data.service') public userDataService : any
  ) {
    this.userInfo = this.userDataService.getUserIn();
  }

  //父级传入的提示消息
  @Input() set setNotification(notification:any) {
    if(notification) {
      this.notificationInfo = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.objInfo = notification.obj;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 弹框
   * @param data
   */
  doChatGroupMessage(data: any) {
    if(!this.notificationIn.handled || this.notificationIn.handled === 0) {
      let dataObj:any = this.typeService.clone(this.notificationInfo);
      let settings = {
        mode: '1',
        title: 'CHAT INVITE PEOPLE',
        isSimpleContent: false,
        componentSelector: 'chat-member-group-dialog',
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
