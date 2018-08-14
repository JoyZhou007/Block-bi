
import {Component, Inject, Input, OnInit, ViewChild} from "@angular/core";
import {Subscription} from "rxjs";

@Component({
  selector: 'chat-group-setting',
  templateUrl: '../../template/dialog/chat-group-setting.component.html'
})

export class ChatGroupSettingComponent implements OnInit {

  public comment: string;
  public getData: any;
  public invitePeoplePerm: any;
  private isInvitePeople: number = 1;
  public isMission: boolean;
  private subscription: Subscription;

  constructor(
    @Inject('im.service') private chatService: any,
    @Inject('notification.service') public notificationService: any,
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY ) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Update group info failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }

  @Input() set setOption(data: any) {
    if(data) {
      this.getData = data;
      this.isMission = this.getData.isMission;
      this.isInvitePeople = data.invited_member;
      this.invitePeoplePerm = {perm: this.isInvitePeople, bgColorClass: 'g-d-bg1'};
    }
  }

  /**
   * 保存修改内容
   */
  groupSettingBut() {
   /* this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: {status:1}});*/
    let data: any = {
      gid: this.getData.gid,
      form: this.getData.form,
      name: this.getData.name,
      topic: this.getData.topic,
      comment: this.comment,
      invitedMember: this.isInvitePeople
    };
    this.chatService.sendEditName(data);
  }

  /**
   * 非群主是否可以邀请好友入群
   * @param data
   */
  setInvitePeoplePerm(data: any) {
    this.isInvitePeople = data.perm;
  }

}
