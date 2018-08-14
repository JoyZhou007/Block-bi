import {Component, OnInit, Inject, Input, ViewChild} from '@angular/core';
import {NotificationDataService} from '../../../shared/services/index.service';
import {NotificationDialog} from "../../../shared/services/model/entity/notification-entity";

@Component({
  selector: 'chat-create-group-message',
  templateUrl: '../../template/message/chat-create-group-message.component.html'
})
export class ChatCreateGroupMessageComponent implements OnInit {
  public notificationIn: any;
  public locationCompanyIn: any;
  public userData: any;
  private notificationKey: string;
  private notificationStatus: number;

  public objInfo: NotificationDialog;
  public hasInit: boolean = false;
  public groupName: string  = '';
  public groupCreator: string = '';
  public groupCreatorProfile: string = '';
  public groupMemberCount: string = '';
  public groupCreateTime: string = '';


  constructor(@Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('im.service') public chatService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('page.element') public element: any,
              @Inject('date.service') public dateService: any,
              public notificationDataService: NotificationDataService) {
  }

  //启动
  ngOnInit() {
    this.getUserIn();
  }

  @Input() set setNotification(notification: any) {
    this.objInfo = notification.obj;
    if (this.objInfo) {
      this.hasInit = true;
      this.groupCreator = this.objInfo.senderInfo.work_name;
      this.groupCreatorProfile = this.objInfo.senderInfo.user_profile_path ? this.config.resourceDomain +  this.objInfo.senderInfo.user_profile_path : '';
      this.groupCreateTime = this.dateService.formatWithTimezone(this.objInfo.ts, 'HH:MM');
      this.groupName = this.objInfo.detail.hasOwnProperty('group') &&
      (this.objInfo.detail.group.hasOwnProperty('name')) ? this.objInfo.detail.group[0].name : '';
      this.groupMemberCount = (this.objInfo.detail.hasOwnProperty('group') &&
      this.objInfo.detail.group.hasOwnProperty('count_members')) ?
        this.objInfo.detail.group[0].count_members : '';
    }
  }

  /**
   * 同意被邀请入群
   */
  acceptInvite() {
    this.chatService.agreeGroupInvite({
      form: this.notificationIn.form,
      gid: this.notificationIn.gid,
      name: this.notificationIn.name,
    });
  }

  /**
   * 拒绝入群邀请
   */
  refuseInvite() {
    this.chatService.refuseGroupInvite({
      gid: this.notificationIn.gid,
      name: this.notificationIn.name,
      friend: this.notificationIn.owner ? this.notificationIn.owner : ''
    });
  }


  //获取当前登录用户信息
  getUserIn() {
    if (!this.userData) {
      this.userData = this.userDataService.getUserIn();
    }
    if (!this.locationCompanyIn) {
      this.locationCompanyIn = this.companyDataService.getLocationCompanyIn();
    }
  }

}
