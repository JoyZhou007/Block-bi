import {Component,OnInit,Inject,Input} from '@angular/core';
import {DialogButton} from "../../../common/components/dialog/dialog-settings";

@Component({
  selector: 'set-company-admin',
  templateUrl: '../../template/message/set-company-admin.component.html'
})
export class SetCompanyAdminComponent implements OnInit {

  public notificationIn : any;
  public companyInfo: any;
  public senderInfo: any;
  public notificationTime: string;
  private data: any;
  public objInfo: any = {};

  constructor(
    @Inject('date.service') public dateService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('company-data.service') public companyDataService : any,
    @Inject('app.config') public appConfig:any
  ) {
  }
  //启动
  ngOnInit() {
    this.companyInfo = this.companyDataService.getLocationCompanyIn();
  }

  //父级传入的提示消息
  @Input() set setNotification(notification:any) {
    if(notification) {
      this.data = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.objInfo = notification.obj;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 设置公司owner/builder/share holder/admin弹窗
   */
  setCompanyOwner() {
    if(this.data.data.role !== 3) {
      if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
        let settings = {
          mode: '1',
          title: this.data.data.title,
          isSimpleContent: false,
          componentSelector: 'set-company-admin-dialog',
          componentData: this.data,
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
