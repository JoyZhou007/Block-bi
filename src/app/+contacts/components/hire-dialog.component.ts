import {Component, OnInit, Input, Inject} from '@angular/core';
import {NotificationDataService} from '../../shared/services/index.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'hire-dialog',
  templateUrl: '../template/hire-dialog.component.html'
})

export class HireDialogComponent implements OnInit {

  public notificationIn: any = {};
  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public hireFeedback: string;
  private senderInfo: any;
  private subscription: Subscription;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('notification.service') public notificationService : any
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_HIRE_ACCEPT ||
        message.act === this.notificationService.config.ACT_NOTICE_HIRE_REFUSE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if (message.act === this.notificationService.config.ACT_NOTICE_HIRE_REFUSE) {
            result.message =  message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }

  ngOnInit() {}

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.notificationIn = data.data;
      this.senderInfo = data.obj.senderInfo;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  hireButDialog(param: any){
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 接受招聘
   */
  hireDialogAccept() {

  /*  this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    this.hireParam(this.notificationService.config.ACT_NOTICE_HIRE_ACCEPT);
  }

  /**
   * 拒绝招聘
   */
  hireDialogRefuse() {

   /* this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    this.hireParam(this.notificationService.config.ACT_NOTICE_HIRE_REFUSE);
  }

  /**
   * hire 参数
   * @param act
   */
  hireParam(act: number) {
    this.memberService.doHireMessage({
      act: act,
      receiver: {
        uuid: this.notificationIn.owner.uuid ? this.notificationIn.owner.uuid : '',
        psid: this.notificationIn.owner.psid ? this.notificationIn.owner.psid : '',
        cid : this.notificationIn.cid ? this.notificationIn.cid : ''
      },
      feedback: this.hireFeedback ? this.hireFeedback : '',
      company_name: this.notificationIn.company_name,
      request_id: this.notificationIn.request_id
    })
  }
}