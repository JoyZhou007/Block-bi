/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/30.
 */

import {
  AfterViewChecked, AfterViewInit, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, Renderer,
  ViewChild, ElementRef
} from "@angular/core";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {Router} from "@angular/router";
import {ChatMenuList, ChatUserInfo} from "../../shared/services/model/entity/chat-entity";
import {ChatContentSidebarComponent} from "./content/chat-content-sidebar.component";
import {ChatConfig} from "../../shared/config/chat.config";
import {ChatContentHeaderComponent} from "./content/chat-content-header.component";
import {ChatContentMessageComponent} from "./content/chat-content-message.component";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {UserModelService} from "../../shared/services/model/user-model.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'chat-content-new',
  templateUrl: '../template/chat-content-new.component.html'
})

export class ChatContentNewComponent implements OnInit, OnDestroy {


  public chatConfig: ChatConfig = new ChatConfig();
  // 默认选中的聊天组
  public isDefaultContent: boolean = true;
  public currentMenuItem: any;
  //public currentContentMsgArr: Array<any> = [];
  public currentGroupInfo: any;

  @ViewChild('chatContentSideBar') chatContentSideBar: ChatContentSidebarComponent;
  @ViewChild('chatContentHeader') chatContentHeader: ChatContentHeaderComponent;
  @ViewChild('chatContentMessage') chatContentMessage: ChatContentMessageComponent;
  @Output('OutputChatSearchMessage') public OutputChatSearchMessage = new EventEmitter<any>();
  public subscription: Subscription;

  constructor(public renderer: Renderer,
              public router: Router,
              public chatModelService: ChatModelService,
              public userModelService: UserModelService,
              public contactModelService: ContactModelService,
              private ele: ElementRef,
              @Inject('page.element') public element: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('im.service') public chatService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {
  }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.hasOwnProperty('act')) {
        switch (message.act) {
          case this.notificationService.config.ACT_COMPONENT_CHAT_MENU_CLICK:
            this.loadChatContent(message.data.menuItem, false, message.data.pinMessageInfo);
            break;
          case this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY:
            //检查status, 也有可能是发送给IM
            if (message.hasOwnProperty('status') && message.status === 1) {
              //修改群名
              //todo: 在本地聊天缓存中加入一条通知
            }
            break;
          case this.notificationService.config.ACT_NOTICE_GROUP_DELETE:
            if (message.hasOwnProperty('status') && message.status === 1) {
              if (this.currentMenuItem && this.currentMenuItem.hasOwnProperty('gid')
                && this.currentMenuItem.gid === message.data.gid) {
                this.loadDefaultContent();
              }
            }
            break;
          case this.notificationService.config.ACT_NOTICE_USER_EXIT_GROUP:
            if (message.hasOwnProperty('status') && message.status === 1) {
              let isSelf = false;
              if (
                (message.data.hasOwnProperty('sent') && message.data.sent == 1) // 本人本tab
                ||
                (message.data.hasOwnProperty('owner') && message.data.owner.hasOwnProperty('uid') &&
                  (message.data.owner.uid == this.userDataService.getCurrentUUID() ||
                  message.data.owner.uid == this.userDataService.getCurrentCompanyPSID())
                ) // 本人其他tab
              ) {
                isSelf = true;
              }
              //本人, 清空
              if (isSelf) {
                if (this.currentMenuItem && this.currentMenuItem.hasOwnProperty('gid') && this.currentMenuItem.gid === message.data.gid) {
                  this.loadDefaultContent();
                }
                // 群员, 刷新, 并显示退群消息
              } else if (this.currentMenuItem && message.data.hasOwnProperty('gid')
                && message.data.hasOwnProperty('owner')) {
                if (this.currentMenuItem.gid === message.data.gid) {
                  this.loadGroupBasicInfo(this.currentMenuItem, false);
                } else {
                  //todo: 群员退出是否要显示消息？
                }
              }
            }
            break;
          case this.notificationService.config.ACT_NOTICE_MASTER_DELETE_GROUP_USER:
            //如果被删除的人在当前群里 聊天页面跳转默认页
            if (message.hasOwnProperty('status') && message.status === 1) {
              if (message.data.hasOwnProperty('frd_type') && message.data.frd_type === 3 &&
                this.currentMenuItem && this.currentMenuItem.gid === message.data.gid) {
                this.loadDefaultContent();
              } else if (message.data.hasOwnProperty('frd_type') && message.data.frd_type === 4 &&
                this.currentMenuItem && this.currentMenuItem.gid === message.data.gid) {
                this.loadGroupBasicInfo(this.currentMenuItem, false);
              } else if (message.data.hasOwnProperty('sent') && message.data.sent === 1) {
                this.loadGroupBasicInfo(this.currentMenuItem, false);
              }
            }
            break;
          case this.notificationService.config.ACT_NOTICE_GROUP_TRANSFER:
            if (message.hasOwnProperty('status') && message.status === 1) {
              if (this.currentMenuItem && message.data.hasOwnProperty('gid')
                && this.currentMenuItem.gid === message.data.gid) {
                this.loadGroupBasicInfo(this.currentMenuItem, false);
              }
            }
            break;
        }
      }
    })

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 默认首页
   */
  loadDefaultContent() {
    //TODO: 机器人帮助界面，现在暂时为静态页面
    this.isDefaultContent = true;

    // 加载侧边栏
    this.chatContentSideBar.loadDefaultContent();
    this.chatContentHeader.loadDefaultHeader();

    delete this.currentMenuItem;
    delete this.currentGroupInfo;
    // 加载内容
  }

  /**
   *
   * @param menuItem
   * @param loadMessageOnly
   * @param pinMessageInfo
   */
  loadChatContent(menuItem?: ChatMenuList, loadMessageOnly?: boolean, pinMessageInfo?: any) {
    let loadMenuItem: ChatMenuList = menuItem ? menuItem : this.currentMenuItem;
    if (!loadMenuItem) {
      return this.loadDefaultContent();
    }

    this.isDefaultContent = false;
    this.currentMenuItem = loadMenuItem;

    // 查看该组在sessionStorage中是否有读取时间记录, 如果有，证明本地有相对应的请求数据
    if (loadMenuItem.isFriend) {
      this.loadFriendBasicInfo(loadMenuItem, loadMessageOnly, pinMessageInfo);
    } else {
      this.loadGroupBasicInfo(loadMenuItem, loadMessageOnly, pinMessageInfo);
    }

  }

  /**
   * 私人聊天用户信息组合
   * @param loadGroupItem
   * @param contactList
   */
  fetchUserInfoFromContactList(loadGroupItem: ChatMenuList, contactList: any) {
    let find = false;
    for (let group in contactList) {
      if (contactList.hasOwnProperty(group)) {
        for (let i in contactList[group]) {
          if (contactList[group].hasOwnProperty(i) && contactList[group][i].hasOwnProperty('uid')) {
            let uid = contactList[group][i].uid;
            if (!find && parseInt(loadGroupItem.uid) === parseInt(uid) || loadGroupItem.uid.toString() === uid.toString()) {
              find = true;
              return contactList[group][i];
            }
          }
        }
      }
    }
  }

  /**
   * 防止contact list本地缓存失效
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
            callback(response.data.staff);
          }
        }
      }
    );
  }

  /**
   * 读取人与人聊天信息
   * @param menuItem
   * @param loadMessageOnly
   * @param isClickOnPin
   */
  loadFriendBasicInfo(menuItem: ChatMenuList, loadMessageOnly?: boolean, isClickOnPin?: boolean) {
    // GroupInfo需要清空
    delete this.currentGroupInfo;
    // 检查两人依然是否是还有关系
    let contactList = this.userDataService.getContactList();
    let doneFunc = (contactList: any) => {
      let info = this.fetchUserInfoFromContactList(menuItem, contactList);
      if (info) {
        this.chatContentHeader.loadFriendHeader(this.currentMenuItem);
        //从contact list中获取头像
        this.chatContentMessage.selfUserInfo = new ChatUserInfo(this.userDataService.getUserIn('user'));
        if (this.currentMenuItem.form === 1) {
          this.chatContentMessage.selfUserInfo.uid = this.userDataService.getCurrentUUID();
        } else {
          this.chatContentMessage.selfUserInfo.uid = this.userDataService.getCurrentCompanyPSID();
        }
        this.loadContentMessageAfterInitOnline(info, menuItem, contactList, isClickOnPin);
      } else {
        this.dialogService.openWarning({simpleContent: 'You are not friend'});
      }
    };
    if (!contactList) {
      //本地缓存丢失，重新请求ajax并获取本地缓存
      this.getContactList(doneFunc);
    } else {
      doneFunc(contactList);
    }


  }


  /**
   *
   * @param info 从contact list中匹配的好友信息
   * @param menuItem
   * @param contactList
   * @param isClickOnPin
   */
  loadContentMessageAfterInitOnline(info: any, menuItem: ChatMenuList, contactList: any, isClickOnPin?: boolean) {
    this.userModelService.getOnlineStatus({
      uid: info.uid
    }, (response: any) => {
      let groupMemberInfo = new ChatUserInfo(info);
      groupMemberInfo.uid = info.uid;
      groupMemberInfo.form = menuItem.form;
      if (response.status === 1) {
        groupMemberInfo.online = response.data.online;
        groupMemberInfo.state = response.data.state;
      }
      //私人聊天， 用户信息只有自身和对方
      this.chatContentMessage.currentChatUserInfo =
        this.typeService.clone(
          [
            this.chatContentMessage.selfUserInfo,
            groupMemberInfo
          ]
        );
      this.chatContentMessage.loadMessageByMenuItem(this.currentMenuItem, false, isClickOnPin);
      this.chatContentSideBar.loadFriendSideContent(this.currentMenuItem, this.chatContentMessage.currentChatUserInfo);
    });
  }

  /**
   * 读取群组信息
   * @param menuItem
   * @param loadMessageOnly
   * @param pinMessageInfo
   */
  loadGroupBasicInfo(menuItem?: ChatMenuList, loadMessageOnly?: boolean, pinMessageInfo?: any) {
    if (loadMessageOnly) {
      this.chatContentMessage.loadMessageByMenuItem(this.currentMenuItem, this.currentGroupInfo, pinMessageInfo);
    } else {
      this.chatModelService.fetchGroupInfo({im_data: {gid: menuItem.gid}}, (data: any) => {
        if (data.status === 1) {
          this.currentGroupInfo = data.data;
          // 头部内容加载
          this.chatContentHeader.loadGroupHeader(this.currentMenuItem, this.currentGroupInfo);
          // 右侧内容加载
          this.chatContentMessage.currentGroupMember =
            this.typeService.clone(this.chatContentSideBar.loadGroupSideContent(this.currentMenuItem, this.currentGroupInfo));
          this.chatContentMessage.currentChatUserInfo = this.typeService.clone(this.chatContentMessage.currentGroupMember);
        }
        this.chatContentMessage.loadMessageByMenuItem(this.currentMenuItem, this.currentGroupInfo, pinMessageInfo);
      });
    }

  }

  /**
   * 发送聊天内容搜索信息
   */
  sendSearchChatMessage(data: string): void {
    this.OutputChatSearchMessage.emit(data);
  }

  /**
   * 清空搜索
   */
  clearSearch() {
    this.chatContentHeader.clearSearch();
  }

}