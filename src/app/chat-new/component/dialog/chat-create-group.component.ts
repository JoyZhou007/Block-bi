/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/13.
 */
import {Component, Inject, Input, OnInit} from "@angular/core";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'chat-create-group',
  templateUrl: '../../template/dialog/chat-create-group.component.html'
})

export class ChatCreateGroupComponent implements OnInit {

  public chatTitle: string = '';
  public chatTopic: string = '';
  public inviteList: Array<DropdownOptionModel> = [];
  public chatType: string = '';
  public inviteSettings: DropdownSettings;
  public selectedMember: Array<any> = [];
  public selectedOptions: Array<any> = [];
  private titleError: any={isShow:false,text:''};
  private topicError: any={isShow:false,text:''};
  private userError: any={isShow:false,text:''};
  private subscription: Subscription;


  constructor(@Inject('im.service') public chatService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('verification.service') public verificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              public contactModelService: ContactModelService) {
    this.initSettings();
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_CHAT_NOTICE_GROUP_CREATE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Create group failed!' : ''};
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }

    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
  }


  @Input('setOption')
  public set setOption(data: any) {
    if (data) {
      if (this.chatType === ''
        || (this.chatType !== '' && this.chatType !== data.type)) {
        this.initSettings();
      }
      this.chatType = data.type;
      let contactListData = this.userDataService.getContactList();
      if (!contactListData) {
        this.getContactList(() => {this.setInvitePeopleList()});
      } else {
        this.setInvitePeopleList();
      }
      if(data.friendUid) {
        this.selectedMember.push({uid: data.friendUid});
      }
      this.checkUserValue();
    }
  }

  initSettings() {
    this.inviteList = [];
    this.selectedMember = [];
    this.chatTitle = '';
    this.chatTopic = '';
    this.selectedOptions = [];
    this.inviteSettings = new DropdownSettings({
      enableTab: true,
      isMultiple: true,
      group: []
    });
  }

  /**
   * 设置能够被邀请人的列表
   */
  setInvitePeopleList(){
    this.inviteList = [];
    let contactListData = this.userDataService.getContactList();
    if (this.chatType === 'work') {
      this.inviteSettings.group = [];
      this.inviteSettings.group.push({key: 'internal', 'title': 'Internal'});
      this.inviteSettings.group.push({key: 'cooperator', 'title': 'Cooperator'});
      contactListData['Internal'].forEach((item: any)  => {
        let tmp = new DropdownOptionModel().initData({
          id: item.uid,
          group: 'internal',
          key: item.work_name,
          label: item.work_name,
          imageLabel: item.user_profile_path? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
        });
        this.inviteList.push(tmp);
      });
      contactListData['Cooperator'].forEach((item: any)  => {
        let tmp = new DropdownOptionModel().initData({
          id: item.uid,
          group: 'cooperator',
          key: item.work_name,
          label: item.work_name,
          imageLabel: item.user_profile_path? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
        });
        this.inviteList.push(tmp);
      });
    } else {
      this.inviteSettings.group = [];
      this.inviteSettings.group.push({key: 'friend', 'title': 'Friend'});
      contactListData['Friend'].forEach((item: any) => {
        let tmp = new DropdownOptionModel().initData({
          id: item.uid,
          group: 'friend',
          key: item.work_name,
          label: item.work_name,
          imageLabel: item.user_profile_path? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
        });
        this.inviteList.push(tmp);
      });
    }
  }
  /**
   * 防止本地缓存失效
   */
  getContactList(callback?: Function) {
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
   * 下拉菜单联动选项
   * @param data
   */
  setSelectedOption(data: any){
    let options:Array<DropdownOptionModel> = data[0];
    this.selectedMember = [];
    for (let i in options) {
      if (options.hasOwnProperty(i)) {
        this.selectedMember.push({
          uid: options[i].id
        })
      }
    }
    this.checkUserValue();
  }

  /**
   * 创建群组
   */
  createNewGroup() {
   if(!this.checkTitleValue()){
     return;
   }
    if (this.selectedMember.length > 0) {
      this.userError.isShow = false;
      this.userError.text = '';
      if (this.chatType === 'work' || this.chatType === '2') {
        this.chatService.sendCreateWorkGroup({
          name: this.chatTitle,
          topic: this.chatTopic,
          members: this.selectedMember
        });
      } else {
        this.chatService.sendCreatePrivateGroup({
          name: this.chatTitle,
          topic: this.chatTopic,
          members: this.selectedMember
        });
      }
    }else{
      this.userError.isShow = true;
      this.userError.text = 'Can not be empty';
    }

  }

  /**
   * 验证
   */
  checkTitleValue(){
   if(this.chatTitle){
     this.titleError.isShow = false;
     this.titleError.text = '';
     return true;
   }else{
     this.titleError.isShow = true;
     this.titleError.text = 'Can not be empty';
     return false;
   }
  }

  checkTopicValue(){
    if(this.chatTopic){
      this.topicError.isShow = false;
      this.topicError.text = '';
      return true;
    }else{
      this.topicError.isShow = true;
      this.topicError.text = 'Can not be empty';
      return false;
    }
  }
  checkUserValue(){
    if(this.selectedMember.length){
      this.userError.isShow = false;
      this.userError.text = '';
    }else{
      this.userError.isShow = false;
      this.userError.text = 'Can not be empty';
    }
  }
}