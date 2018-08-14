import {Component, Inject, Input, OnInit} from '@angular/core';
import {NotificationDataService, ContactModelService} from '../../shared/services/index.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'accept-recommendation',
  templateUrl: '../template/accept-recommendation.component.html',
  styleUrls: ['../../../assets/css/contacts/contacts-alert.css']
})

export class AcceptRecommendationComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public userData: any;
  public userInfo: any;
  public friendRemarks: string = '';
  private friendRelation: Array<number> = [];
  public isSelect: boolean = true;
  public defaultVal: string ='';
  private getData: any = {};
  public isToAddCompanyFriend:boolean = false;
  public profilePath: string = '';
  public subscription: Subscription;
  constructor(
    @Inject('app.config') public config : any,
    @Inject('page.element') public element: any,
    @Inject('notification.service') public notificationService: any,
    @Inject('im.service') public memberService: any,
    @Inject('file.service') public fileService: any,
    @Inject('user-data.service') public userDataService : any
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_NOTICE_REFUSE_RECOMMEND_ADD_FRIEND ||
        message.act === this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_ADD_FRIEND) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          //返回给dialog-new的值
          let result = {status: message.status, message: message.status != 1 ? 'Add friend failed!' : ''};
          if(message.act === this.notificationService.config.ACT_USER_NOTICE_REFUSE_RECOMMEND_ADD_FRIEND){
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

  //启动
  ngOnInit() {
    this.getUserIn();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.getData = data.data;
      this.friendRelation = [];
      this.friendRemarks = '';
      let userArr: Array<any> = data.obj.detail.user ?　data.obj.detail.user : [];
      for(let user in userArr) {
        if(userArr[user].uid == this.getData.referral) {
          this.userInfo = userArr[user] ? userArr[user] : {};
          this.profilePath = this.config.resourceDomain + this.fileService.getImagePath(36, this.userInfo.user_profile_path);
          break;
        }
      }
      this.isToAddCompanyFriend = this.getData.relation !== 1;
      this.defaultVal =  this.getData.relation === 1 ? 'Friend' : 'Cooperator';
      this.friendRelation[0] = this.getData.relation;
    }
  }

  /**
   * 发送好友请求
   */
  sendFriendRequest() {
    let companyName: string;
    if (this.friendRelation[0] == 2) {
      companyName = this.userInfo.company_name;
    }
    this.memberService.doApplyFriend({
      user_relation : this.friendRelation,
      remark : this.friendRemarks,
      friend : {
        uuid : this.userInfo.uuid ? this.userInfo.uuid : '',
        psid : this.userInfo.psid ? this.userInfo.psid : ''
      },
      company_name: companyName
    });
  }

  //获取用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  refuseRecommendationDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝推荐的好友
   * 11.30改成 不发消息
   */
  recommendationDialogRefuse() {
    // this.memberService.refuseFriendRecomm({
    //   owner: this.getData.relation == 1 ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID(),
    //   referee: this.getData.owner,
    //   remark: this.friendRemarks,
    //   request_id: this.getData.request_id
    // })
  }

  /**
   * 接受好友推荐
   */
  recommendationDialogAccept() {
    this.memberService.AcceptRecommendationFriend({
      referral: this.getData.referral,
      owner: this.getData.relation == 1 ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID(),
      referee: this.getData.owner,
      relation: this.friendRelation,
      remark: this.friendRemarks,
      request_id: this.getData.request_id
    })
  }

}
