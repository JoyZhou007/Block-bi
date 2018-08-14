/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */
import {AfterViewInit, Component, EventEmitter, Inject, OnDestroy, Output, ViewChild} from "@angular/core";
import {ChatPinComponent} from "../chat-pin.component";
import {ChatMenuList, ChatUserInfo} from "../../../shared/services/model/entity/chat-entity";
import {ChatContentMemberComponent} from "./chat-content-member.component";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {UserModelService} from "../../../shared/services/model/user-model.service";
import {FileService} from "../../../shared/services/common/file/file.service";
import {Subscription} from "rxjs/Subscription";
import * as userConstant from "../../../shared/config/user.config"
import { ChatPostFilesComponent } from '../chat-post-files.component';

@Component({
  selector: 'chat-content-sidebar',
  templateUrl: '../../template/content/chat-content-sidebar.component.html',
  providers:[FileService]
})
export class ChatContentSidebarComponent implements AfterViewInit,OnDestroy {
  public isDefaultContent: boolean = false;
  public isFriendContent: boolean = false;
  public currentGroupInfo: any;
  public currentGroupMenuItem: ChatMenuList;
  public creator: string = '';
  public createDate: Date;
  public groupType: string = '';
  public memberMenuStatus: boolean = false;
  public pinMenuStatus: boolean = false;
  public generalMenuStatus: boolean = false;


  @Output('outGroupMemberInfo') public outGroupMemberInfo = new EventEmitter<any>();

  @ViewChild('chatPin') chatPinComponent: ChatPinComponent;
  @ViewChild('chatContentMember') chatContentMemberComponent: ChatContentMemberComponent;
  @ViewChild('chatPostFiles') chatPostFilesComponent: ChatPostFilesComponent;

  public USER_STATE_ONLINE: number = 1;
  public USER_STATE_OFFLINE: number = 0;
  //显示friend 的个人信息
  public chatFriendUserInfo: { form: number; user_profile_path: string; work_name; state: any; uid; online: any; onlineStatusCls: string };
  private subscription: Subscription;

  public userConstant = userConstant;

  public showStates: boolean;
  public state: number;

  constructor(public contactModelService: ContactModelService,
              @Inject('date.service') public dateService: any,
              @Inject('user-data.service') public userDataService: any,
              public userModelService: UserModelService,
              @Inject('type.service') public typeService: any,
              public fileService:FileService,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('chat-message-data.service') public messageDataService: any) {

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadDefaultContent() {
    this.isDefaultContent = true;
    this.isFriendContent = false;
    //首页显示全部Pin, 默认收起
    this.chatPinComponent.initDefaultPinSetting();
    //this.chatPinComponent.loadAllPinMsg();
  }

  ngAfterViewInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      switch(data.act) {
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          if (this.chatFriendUserInfo
            && data.data.hasOwnProperty('friend')
            && ((data.data.friend.hasOwnProperty('uuid') && this.chatFriendUserInfo.uid === data.data.friend.uuid)
            || (data.data.friend.hasOwnProperty('psid') && this.chatFriendUserInfo.uid == data.data.friend.psid))
           ) {
            this.chatFriendUserInfo.state = data.data.friend.state;
            this.chatFriendUserInfo.onlineStatusCls = this.getOnlineStatusCls(parseInt(data.data.friend.online));
          }
          break;
      }
    })
  }

  /**
   * 点击右侧标题分组，切换展开收起状态
   * @param type
   */
  toggleMenuStatus(type: string) {
    switch (type) {
      case 'member':
        this.memberMenuStatus = this.chatContentMemberComponent.menuStatus;
        break;
      case 'pin':
        this.pinMenuStatus = this.chatPinComponent.menuStatus;
        break;
      case 'general':
        this.generalMenuStatus = !this.generalMenuStatus;
        break;
    }
  }

  /**
   *
   * @param loadGroupItem
   * @param userInfo
   */
  loadFriendSideContent(loadGroupItem: ChatMenuList, userInfo: Array<ChatUserInfo>) {
    this.isDefaultContent = false;
    this.currentGroupMenuItem = loadGroupItem;
    this.isFriendContent = true;
    this.chatPinComponent.initMenuItemPinSetting(loadGroupItem, userInfo);
    this.chatPostFilesComponent.getGroupInfo(loadGroupItem, userInfo);
    //this.chatPinComponent.isDefaultContent = false;
    // this.chatPinComponent.loadPinMsgByMenuItem(loadGroupItem, userInfo);
    // userInfo[0]为自身
    let friendUserInfo = userInfo[1];
    friendUserInfo.user_profile_path = friendUserInfo.user_profile_path ? this.fileService.getImagePath(230, friendUserInfo.user_profile_path) : '';
    this.showStates = !!this.typeService.isNumber(friendUserInfo.uid);
    this.state = friendUserInfo.state;
    if (friendUserInfo.online === 0) {
      friendUserInfo.onlineStatusCls = this.getOnlineStatusCls(friendUserInfo.online);
    } else {
      friendUserInfo.onlineStatusCls = this.getOnlineStatusCls(friendUserInfo.online);
    }
    this.chatFriendUserInfo = friendUserInfo;
  }


  getOnlineStatusCls(state: number) {
    let cls = '';
    switch (state) {
      case this.USER_STATE_ONLINE:
        cls = 'ch-member-list-circle-available';
        break;
      case this.USER_STATE_OFFLINE:
        cls = 'ch-member-list-circle-offline';
        break;
    }
    return cls;
  }

  /**
   *
   * @param loadGroupItem
   * @param groupInfo
   */
  loadGroupSideContent(loadGroupItem: ChatMenuList, groupInfo: any) {
    this.isDefaultContent = false;
    this.currentGroupMenuItem = loadGroupItem;
    this.isFriendContent = false;
    // delete this.chatFriendUserInfo;
    this.currentGroupInfo = groupInfo;
    let groupMemberInfo = this.chatContentMemberComponent.fetchGroupMemberInfo(groupInfo, loadGroupItem);
    this.chatPinComponent.initMenuItemPinSetting(loadGroupItem, groupMemberInfo);
    this.chatPostFilesComponent.getGroupInfo(loadGroupItem, groupMemberInfo);
    //this.chatPinComponent.loadPinMsgByMenuItem(loadGroupItem, groupMemberInfo);
    //如果是群主
    this.creator = this.currentGroupInfo.creator;
    this.createDate = this.dateService.formatWithTimezone(this.currentGroupInfo.created, 'mmm dd, yyyy');
    switch (this.currentGroupMenuItem.group) {
      case 'private':
        this.groupType = 'Private';
        break;
      case 'work':
        this.groupType = 'Business';
        break;
      case 'mission':
        this.groupType = 'Mission';
        break;
    }
    return groupMemberInfo;
    // 现在无法识别创建时候的群主
    // if (this.currentGroupMenuItem.is_host === 1) {
    //   this.creator = 'you';
    // } else {
    //   this.creator = this.currentGroupInfo.creator;
    // }
  }



}