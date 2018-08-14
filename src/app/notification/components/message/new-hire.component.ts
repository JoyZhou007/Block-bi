import {Component,OnInit,Inject,Input} from '@angular/core';
import {DialogButton} from "../../../common/components/dialog/dialog-settings";

@Component({
  selector: 'new-hire',
  templateUrl: '../../template/message/new-hire.component.html'
})
export class NewHireComponent implements OnInit {

  public notificationIn : any;
  public companyInfo: any;
  public senderInfo: any;
  private data: any;
  public objInfo: any = {};
  public notificationTime: string;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('date.service') public dateService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('company-data.service') public companyDataService : any
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
      this.objInfo = notification.obj;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 接收招聘弹窗
   */
  hireDialog() {
    if(!this.notificationIn.handled || this.notificationIn.handled === 0) {
      let settings = {
        mode: '1',
        title: 'HIRE',
        isSimpleContent: false,
        componentSelector: 'hire-dialog',
        componentData: this.data,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'hireDialogRefuse',
            mouseEnterEvent: 'hireButDialog',
            mouseLeaveEvent: 'hireButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'hireDialogAccept',
            mouseEnterEvent: 'hireButDialog',
            mouseLeaveEvent: 'hireButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }
  }
}
