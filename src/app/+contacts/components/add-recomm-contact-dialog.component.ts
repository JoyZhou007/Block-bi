import {Component, Input, Inject, OnInit} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'add-recomm-contact-dialog',
  templateUrl: '../template/add-recomm-contact-dialog.component.html'
})

export class AddRecommContactDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public contactFeedback: string = '';
  public notificationIn: any;
  public relation: any[];
  public senderInfo: any;
  private getData: any;
  public objInfo: any = {};
  public userInfo: any;
  private subscription: Subscription;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('notification.service') public notificationService : any,
    @Inject('user-data.service') public userDataService : any
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_REFUSE_ADD_FRIEND ||
        message.act === this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          //返回给dialog-new的值
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if(message.act === this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_REFUSE_ADD_FRIEND){
            result.message = message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.getData = data.data;
      this.objInfo = data.obj;
      this.senderInfo =  data.hasOwnProperty('obj') ? data.obj.senderInfo : {};
      this.notificationIn = data;
      this.relation = this.getData.relation;
    }
  }

  ngOnInit() {
    this.userInfo = this.userDataService.getUserIn();
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  recommContactButDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝好友请求
   */
  recommContactDialogRefuse() {
    this.memberService.refuseApplyRecommFriend({
      owner: this.getData.relation[0] == 1 ? this.userInfo.user.uuid : this.userInfo.user.psid,
      receiver: this.getData.acceptor,
      // referee: this.getData.referee,
      remark: this.contactFeedback,
      request_id: this.getData.request_id
    });
  }

  /**
   * 接收好友请求
   */
  recommContactDialogAccept() {
    this.memberService.acceptApplyRecommFriend({
      owner: this.getData.relation[0] == 1 ? this.userInfo.user.uuid : this.userInfo.user.psid,
      receiver: this.getData.acceptor,
      // referee: this.getData.referee,
      remark: this.contactFeedback,
      relation: this.getData.relation,
      request_id: this.getData.request_id
    });
  }

}