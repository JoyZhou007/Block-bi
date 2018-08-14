import {Component, Inject, OnInit, HostListener, ViewChild, Input, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'new-contact',
  templateUrl: '../template/new-contact.component.html'
})
export class NewContactComponent implements OnInit, OnDestroy {

  public userData: any;
  public userInfo: any;
  public friendRemarks: string = '';
  public profilePath: string = '';
  public isToAddCompanyFriend: boolean = false;
  private friendRelation: Array<number> = [];
  public selectCurrent: Array<boolean> = [];
  public isSelect: boolean = true;
  public defaultVal: string = '';
  public subscription: Subscription;

  constructor(@Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('file.service') public fileService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public memberService: any,
              @Inject('type.service') public typeService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('user-data.service') public userDataService: any) {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act == this.notificationService.config.ACT_USER_REQUEST_ADD_FRIEND
        && message.hasOwnProperty('data') && message.data.hasOwnProperty('sent')) {
        let result = {status: message.status, message: message.status != 1 ? 'Fail to add friend' : ''};
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: result
        });
      }
    })
  }

  //启动
  ngOnInit() {
    this.getUserIn();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.friendRelation = [];
      this.friendRemarks = '';
      this.userInfo = data;
      if (data.hasOwnProperty('relationship')) {
        let relationship = data.relationship;
        this.defaultVal = relationship.company ? 'COOPERATOR' : 'FRIEND';
        this.friendRelation[0] = relationship.company ? 2 : 1;
        if (this.typeService.isNumber(this.userInfo.uid) && this.friendRelation[0] == 1) {
          this.userInfo.uid = relationship.personUuid;
        }
        this.profilePath = this.config.resourceDomain + this.fileService.getImagePath(36, data.user_profile_path);
        this.isToAddCompanyFriend = relationship.company;
      }
    }
  }

  /**
   * 发送好友请求
   */
  sendFriendRequest() {
    console.log('发送好友请求',this.userInfo, this.friendRelation);
    this.memberService.doApplyFriend({
      user_relation: this.friendRelation,
      remark: this.friendRemarks,
      friend: {
        uuid: this.isToAddCompanyFriend ? '' : this.userInfo.uid,
        psid: this.isToAddCompanyFriend ? this.userInfo.uid : ''
      },
      company_name: this.isToAddCompanyFriend ? this.companyDataService.getCurrentCompanyName() : ''
    });
  }

  //获取用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

}
