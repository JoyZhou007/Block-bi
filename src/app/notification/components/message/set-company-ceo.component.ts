import {Component, Inject, Input, OnInit} from '@angular/core';

@Component({
  selector: 'set-company-ceo',
  templateUrl: '../../template/message/set-company-ceo.component.html',
})

export class SetCompanyCEOComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;
  public senderInfo: any;
  public notificationTime: string;
  public objInfo: any;
  private data: any;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('date.service') public dateService: any,
    @Inject('dialog.service') public dialogService: any,
  ) {}

  ngOnInit() {

  }

  //父级传入的提示消息
  @Input() set setNotification(notification: any) {
    if (notification) {
      this.data = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.objInfo = notification.obj;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }


  doCompanyCEO() {
    if(this.objInfo.msgType !== 'notice') {
      if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
        let settings = {
          mode: '1',
          title: this.data.obj.title,
          isSimpleContent: false,
          componentSelector: 'set-company-ceo-dialog',
          componentData: this.data,
          buttons: [
            {
              type: 'refuse',
              btnEvent: 'setCeoDialogRefuse',
              mouseEnterEvent: 'setCeoButDialog',
              mouseLeaveEvent: 'setCeoButDialog'
            },
            {
              type: 'accept',
              btnEvent: 'setCeoDialogAccept',
              mouseEnterEvent: 'setCeoButDialog',
              mouseLeaveEvent: 'setCeoButDialog'
            }
          ]
        };
        this.dialogService.openNew(settings);
      }
    }
  }

}