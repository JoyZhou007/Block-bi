import {Component,OnInit,Inject,Input} from '@angular/core';

@Component({
  selector: 'join-company',
  templateUrl: '../../template/message/join-company.component.html'
})
export class JoinCompanyComponent implements OnInit {

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
      this.senderInfo = notification.obj.senderInfo;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }

  /**
   * 接受/拒绝dialog
   */
  applyCompanyDialog() {
    if(!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.notificationIn.user_profile_path = this.senderInfo.user_profile_path;
      this.notificationIn.work_name = this.senderInfo.work_name;
      this.notificationIn.p_name = this.senderInfo.p_name;
      let settings = {
        mode: '1',
        title: 'LINK TO PARENT',
        isSimpleContent: false,
        componentSelector: 'link-to-parent-dialog',
        componentData: this.notificationIn,
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'linkToParentDialogRefuse',
            mouseEnterEvent: 'linkToParentButDialog',
            mouseLeaveEvent: 'linkToParentButDialog'
          },
          {
            type: 'accept',
            btnEvent: 'linkToParentDialogAccept',
            mouseEnterEvent: 'linkToParentButDialog',
            mouseLeaveEvent: 'linkToParentButDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }

  }

}
