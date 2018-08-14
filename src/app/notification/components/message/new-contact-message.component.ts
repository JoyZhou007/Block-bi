import {Component, Inject, Input} from '@angular/core';

@Component({
  selector: 'new-contact-message',
  templateUrl: '../../template/message/new-contact-message.component.html'
})
export class NewContactMessageComponent {

  public notificationIn:any;
  public objInfo: any = {};
  public notificationTime: string;
  public senderInfo: any;

  constructor(
    @Inject('app.config') public appConfig : any,
    @Inject('date.service') public dateService: any,
    @Inject('dialog.service') public dialogService: any
  ) {}

  @Input() set setNotification(notification: any) {
    this.objInfo = notification.obj;
    this.senderInfo = notification.obj.senderInfo;
    this.notificationIn = notification;
    this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
  }

  /**
   * 接受好友弹框选项
   */
  addContactDialog() {
    if(!this.notificationIn.data.handled || this.notificationIn.data.handled === 0) {
      let settings = {
        mode: '1',
        title: 'NEW CONTACT',
        isSimpleContent: false,
        componentSelector: 'add-contact-dialog',
        componentData: this.notificationIn,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'contactDialogRefuse',
            mouseEnterEvent: 'contactButDialog',
            mouseLeaveEvent: 'contactButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'contactDialogAccept',
            mouseEnterEvent: 'contactButDialog',
            mouseLeaveEvent: 'contactButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }
  }
}
