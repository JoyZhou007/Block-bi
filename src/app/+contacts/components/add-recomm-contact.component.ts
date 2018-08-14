import {Component, Inject, Input} from '@angular/core';

@Component({
  selector: 'add-recomm-contact',
  templateUrl: '../template/add-recomm-contact.component.html'
})
export class AddRecommContactComponent {

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
    if(notification) {
      this.objInfo = notification.obj;
      this.senderInfo = notification.obj.senderInfo;
      this.notificationIn = notification;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 接受好友弹框选项
   */
  addRecommContactDialog() {
    if(!this.notificationIn.data.handled || this.notificationIn.data.handled === 0) {
      let settings = {
        mode: '1',
        title: 'NEW CONTACT',
        isSimpleContent: false,
        componentSelector: 'add-recomm-contact-dialog',
        componentData: this.notificationIn,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'recommContactDialogRefuse',
            mouseEnterEvent: 'recommContactButDialog',
            mouseLeaveEvent: 'recommContactButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'recommContactDialogAccept',
            mouseEnterEvent: 'recommContactButDialog',
            mouseLeaveEvent: 'recommContactButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }
  }
}
