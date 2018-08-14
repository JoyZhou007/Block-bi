import {Component, OnInit, Inject, Input} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'new-recommendation',
  templateUrl: '../../template/message/new-recommendation.component.html'
})

export class NewRecommendation implements OnInit {

  public friendInfo: any = {};
  public message: string = '';
  public connectDropdownOptions: any[] = [];
  public connectSelectedOptions: any[] = [];
  public connectDropdownSettings: any;
  private selectData: Array<any> = [];
  private contactList: any = {};
  private userInfo: any = {};
  public remark: string;
  private subscription: Subscription;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('notification.service') public notificationService : any
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_USER) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          //返回给dialog-new的值
          let result = {status: message.status, message: message.status != 1 ? 'Recommend friend failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }

  //启动
  ngOnInit() {
    this.userInfo = this.userDataService.getUserIn();
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.contactList = this.userDataService.getContactList();
      this.connectDropdownOptions = [];
      this.connectSelectedOptions = [];
      this.connectDropdownSettings = {
        enableSearch: true,
        enableTab: false,
        isMultiple: true,
        group: []
      };
      this.friendInfo = data;

      //初始化联系人列表
      this.initContactList(this.contactList);
    }
  }

  /**
   * 初始化联系人列表
   * @param data
   */
  initContactList(data: any) {

    //重新组装联系人列表数据
    for (let list in data) {
      if(this.friendInfo.form === 2) {
        if(list === 'Friend') continue;
      }else if(this.friendInfo.form === 1) {
        if(list !== 'Friend') continue;
      }
      if (data.hasOwnProperty(list)) {
        this.connectDropdownSettings.group.push({key: list, title: list.toUpperCase()});
        for (let key in data[list]) {
          let dataObj: any = data[list][key];
          if(dataObj.uid === this.friendInfo.uid) continue;
          let dataList: any = {
            id: dataObj.uid,
            key: dataObj.uid,
            isCurrent: false,
            group: list,
            label: dataObj.work_name,
            des: dataObj.p_name,
            imageLabel: dataObj.user_profile_path ? this.appConfig.resourceDomain + dataObj.user_profile_path : ''
          };
          this.connectDropdownOptions.push(dataList);
        }
      }
    }
  }

  /**
   * 推荐好友
   */
  sendRecFriendRequest() {
    if(this.selectData[0].length === 0) {
      return false;
    }else {
      let receiverArr: Array<any> = [];
      let receiver: any = this.selectData[0];
      for(let uid in receiver) {
        receiverArr.push(receiver[uid].id);
      }
      this.memberService.recommendNewContacts({
        owner: this.friendInfo.form == 2 ?  this.userDataService.getCurrentCompanyPSID() :  this.userDataService.getCurrentUUID(),
        referral: this.friendInfo.uid,
        receiver: receiverArr,  //数组
        remark: this.remark ? this.remark : '',
        relation: this.friendInfo.form
      })
    }
  }

  /**
   * 返回联系人列表
   * @param data
   */
  setContactsList(data: any) {
    this.selectData = data;
  }

}
