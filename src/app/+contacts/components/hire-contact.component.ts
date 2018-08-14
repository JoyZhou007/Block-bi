import {Component, Inject, OnInit, Input} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'hire-contact',
  templateUrl: '../template/hire-contact.component.html'
})
export class HireContactComponent implements OnInit {

  public userInfo: any;
  public hireRemarks: string;
  private companyData: any;
  private subscription: Subscription;

  constructor(
      @Inject('app.config') public config : any,
      @Inject('im.service') public memberService: any,
      @Inject('notification.service') public notificationService: any,
      @Inject('company-data.service') public companyDataService: any
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_REQUEST_HIRE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Hire people failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.hireRemarks = '';
      this.userInfo = data;
      this.userInfo.uuid = this.userInfo.uuid ? this.userInfo.uuid : this.userInfo.uid;
    }
  }

  /**
   * 发送招聘
   */
  sendHireRequest() {

   /* this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    this.memberService.sendHireMessage({
      receiver: {uuid: this.userInfo.uuid ? this.userInfo.uuid : ''},
      company_name: this.companyData.name,
      msg: this.hireRemarks ? this.hireRemarks : ' '
    })
  }

}
