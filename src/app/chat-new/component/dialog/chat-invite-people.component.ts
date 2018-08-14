/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/13.
 */
import {Component, Inject, Input, OnInit, ViewChild} from "@angular/core";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'chat-invite-people',
  templateUrl: '../../template/dialog/chat-invite-people.component.html'
})

export class ChatInvitePeopleComponent implements OnInit {

  private contactList: any;
  private currentGroupObj: any;
  private userInfo: any;
  public connectDropdownOptions: any[] = [];
  public connectSelectedOptions: any[] = [];
  public connectDropdownSettings: any;
  private selectData: any[] = [];
  private isHost: any;
  private showError: any = {isShow:false,text:''};
  private subscription: Subscription;

  constructor(
    @Inject('app.config') public config: any,
    @Inject('type.service') public typeService: any,
    @Inject('im.service') private chatService: any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('notification.service') public notificationService: any,
    public contactModelService: ContactModelService
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_NOTICE_MASTER_GROUP_INVITE ||
        message.act === this.notificationService.config.ACT_REQUEST_MEMBER_GROUP_INVITE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Invite people failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  @Input() set setOption(data: any) {
    if (data) {
      this.contactList = this.userDataService.getContactList();
      //本地缓存丢失，重新请求ajax并获取本地缓存
      if (!this.contactList) {
        this.getContactList(() => {
          this.contactList = this.userDataService.getContactList();
        });
      }
      this.connectDropdownOptions = [];
      this.connectSelectedOptions = [];
      this.connectDropdownSettings = {
        enableSearch: true,
        enableTab: false,
        isMultiple: true,
        group: []
      };
      this.currentGroupObj = data;

      //初始化联系人列表
      this.initContactList(this.contactList);
    }
  }

  ngOnInit() {
    this.userInfo = this.userDataService.getUserIn();
  }

  getContactList(callback?: any) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 初始化联系人列表
   * @param data
   */
  initContactList(data: any) {

    //重新组装联系人列表数据
    for (let list in data) {
      if(this.currentGroupObj.form === 2) {
        if(list === 'Friend') {
          continue;
        }
      }else if(this.currentGroupObj.form === 1) {
        if(list !== 'Friend') {
          continue;
        }
      }
      if (data.hasOwnProperty(list)) {
        this.connectDropdownSettings.group.push({key: list, title: list.toUpperCase()});
        for (let key in data[list]) {
          let dataObj: any = data[list][key];
          if (this.typeService.isArrayVal(this.currentGroupObj.info, 'uid', data[list][key].uid)) continue;
          let dataList: any = {
            id: dataObj.uid,
            key: dataObj.work_name,
            isCurrent: false,
            group: list,
            label: dataObj.work_name,
            des: dataObj.p_name,
            imageLabel: dataObj.user_profile_path ? this.config.resourceDomain + dataObj.user_profile_path : ''
          };
          this.connectDropdownOptions.push(dataList);
        }
      }
    }
  }

  /**
   * 返回联系人列表
   * @param data
   */
  setContactsList(data: any) {
    this.selectData = data;
  }

  /**
   * 发送数据
   */
  sendInvite() {
    let members: string[] = [];
    for (let key in this.selectData[0]) {
      let keyUid: string = this.selectData[0][key].id;
      let uid: any = {uid: keyUid};
      members.push(uid);
    }
    for (let key in this.currentGroupObj.info) {
      let uid: any = this.currentGroupObj.info[key].uid;
      if (uid === this.userDataService.getCurrentUUID() || uid === this.userDataService.getCurrentCompanyPSID()) {
        this.isHost = this.currentGroupObj.info[key].host;
        break;
      }
    }
    let sendData: any = {
      form: this.currentGroupObj.form,
      invited_member: this.currentGroupObj.invited_member,
      is_host: this.isHost,
      gid: this.currentGroupObj.gid,
      name: this.currentGroupObj.name,
      members: members
    };
    if(members.length == 0){
      this.showError.isShow = true;
      this.showError.text = 'Can not be empty';
      return false;
    }else{
      this.showError.isShow = false;
      this.showError.text = '';
    }

  /*  this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
    if(this.currentGroupObj.isHost === 1) {
      //群主邀请
      this.chatService.addNewMembers(sendData);
    }else {
      //非群主邀请
      this.chatService.newGroupInvite(sendData);
    }

  }

}