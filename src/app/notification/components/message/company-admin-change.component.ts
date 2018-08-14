import {Component, Input, Inject} from '@angular/core';

@Component({
  selector: 'company-admin-change',
  templateUrl: '../../template/message/company-admin-change.component.html'
})

export class CompanyAdminChangeComponent {

  public getNotification: any = {};
  public obj: any;
  public senderInfo: any = {};
  public notificationTime: string;

  constructor(
    @Inject('app.config') public appConfig: any,
    @Inject('date.service') public dateService: any,
    @Inject('type.service') public typeService: any,
    @Inject('dialog.service') public dialogService: any) {}

  @Input() set setNotification(data: any) {
    if(data) {
      this.getNotification = data;
      this.obj = this.getNotification.obj;
      this.senderInfo = this.obj.senderInfo;
      this.notificationTime = this.dateService.formatWithTimezone(this.obj.ts, 'HH:MM');
    }
  }

  /**
   * 执行接受拒绝操作
   */
  doCompanyAdmin() {
    if(this.getNotification.data.role !== 3) {
      if (!this.getNotification.data.handled || this.getNotification.data.handled === 0) {
        let settings = {
          mode: '1',
          title: this.getNotification.data.title,
          isSimpleContent: false,
          componentSelector: 'set-company-admin-dialog',
          componentData: this.getNotification,
          buttons: [
            {
              type: 'refuse',
              btnEvent: 'setOwnerDialogRefuse',
              mouseEnterEvent: 'setOwnerButDialog',
              mouseLeaveEvent: 'setOwnerButDialog'
            },
            {
              type: 'accept',
              btnEvent: 'setOwnerDialogAccept',
              mouseEnterEvent: 'setOwnerButDialog',
              mouseLeaveEvent: 'setOwnerButDialog'
            }
          ]
        };
        this.dialogService.openNew(settings);
      }
    }
  }
}