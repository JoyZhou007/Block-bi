import {Component,OnInit,Inject,Input} from '@angular/core';

@Component({
  selector: 'update-company-ceo',
  templateUrl: '../../template/message/update-company-ceo.component.html'
})
export class UpdateCompanyCeoComponent implements OnInit {

  public notificationIn : any;
  public companyInfo: any;
  public senderInfo: any;
  public userInfo: any;
  public notificationTime: string;
  public objInfo: any = {};

  public notificationInfo:any;
  public notificationStatus:number;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('date.service') private dateService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('user-data.service') public userDataService : any,
    @Inject('company-data.service') public companyDataService : any
  ) {
  }
  //启动
  ngOnInit() {
    this.companyInfo = this.companyDataService.getLocationCompanyIn();
    this.userInfo = this.userDataService.getUserIn();
  }

  //父级传入的提示消息
  @Input() set setNotification(notification:any) {
    if(notification) {
      this.notificationInfo = notification;
      this.notificationIn = notification.data;
      this.objInfo = notification.obj;
      this.senderInfo = this.objInfo.senderInfo;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 接受/拒绝dialog
   */
  updateCompanyCeo() {
    if(!this.notificationIn.handled || this.notificationIn.handled === 0) {
      let settings = {
        mode: '1',
        title: 'STRUCTURE ADMIN',
        isSimpleContent: false,
        componentSelector: 'update-company-ceo-dialog',
        componentData: this.notificationInfo,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'updateCompanyCeoDialogRefuse',
            mouseEnterEvent: 'updateCompanyCeoButDialog',
            mouseLeaveEvent: 'updateCompanyCeoButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'updateCompanyCeoDialogAccept',
            mouseEnterEvent: 'updateCompanyCeoButDialog',
            mouseLeaveEvent: 'updateCompanyCeoButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }

  }

}
