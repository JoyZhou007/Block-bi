import {
  Component, OnInit, ViewChild, AfterViewInit,
  Inject, Renderer, EventEmitter, Output, OnDestroy, Input
} from '@angular/core';
import { Router } from '@angular/router';

import {
  ChatModelService,
  ChatMenuList,
  ContactModelService
} from '../../shared/services/index.service';
import { ChatConfig } from '../../shared/config/chat.config';
import { ChatPost } from "../../shared/services/model/entity/chat-entity";
import { UserModelService } from "../../shared/services/model/user-model.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'chat-menu-new',
  templateUrl: '../template/chat-menu-new.component.html',
  providers: [ChatModelService, ContactModelService]
})
export class ChatMenuNewComponent implements OnInit, AfterViewInit, OnDestroy {

  public config: ChatConfig = new ChatConfig();
  public JSON: JSON = JSON;
  private RECENT_LENGTH: number = 10;

  public chatList: any;
  public initView: boolean = false;

  public param: any = {};
  public currentGroup: ChatMenuList;

  public currentStarred: any = {type: 1};

  public switchFormType: number = 2; //点击切换窗口的区域1:star 2:group 3:recent
  public noReadCountInfo: {
    [id: string]: number
  } = {};
  public toggleIn: any = {
    removeToggleClass: 'close',
    event: 'click'
  };

  public starList: Array<any> = [];
  public missionList: Array<any> = [];
  public workList: Array<any> = [];
  public privateList: Array<any> = [];
  // 最近消息列表 不管是群还是个人聊天 显示最新的聊天内容
  public recentList: Array<any> = [];
  // Menu是否Ajax初始化过
  public isChatMenuInit: boolean = false;
  private searchParam: any;
  private chatIsOpen: boolean = false;

  @Input('setChatIsOpen')
  set setChatIsOpen(data: boolean) {
    // 由关到开
    this.chatIsOpen = data;
  };

  public chatMenuStatus = {
    'star': false,
    'work': false,
    'private': false,
    'recent': false,
    'mission': false,
  };

  @Output() public starredList = new EventEmitter<any>();
  @Output() public chatDefault = new EventEmitter<any>();

  @ViewChild('searchInputForm') public searchInputForm: any;
  @ViewChild('searchInput') public searchInput: any;
  @ViewChild('chatSetBackground') public chatSetBackground: any;

  //显示chat-post
  public showPostChat: boolean = false;
  public subscription: Subscription;
  @Output() public isShowChatPost = new EventEmitter<boolean>();

  //页面交互
  constructor(public renderer: Renderer,
              public router: Router,
              public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              @Inject('page.element') public element: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('im.service') public chatService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {
  }

  ngAfterViewInit() {
    this.initView = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 设置入口参数
   * @param param
   */
  setParams(param: any) {
    this.param = param;
    this.currentGroup = param;
    /*if(param.type === 'group') {
     this.switchFormType = this.switchFormType ? this.switchFormType : 2;
     }*/
  }

  //启动
  ngOnInit() {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        this.dealMessage(data);
      }
    );

  }

  /**
   * 接受Notification
   * @param message
   */
  dealMessage(message: any) {
    switch (message.act) {
      case this.notificationService.config.ACT_COMPONENT_CHAT_MENU_RELOAD:
        this.getChatList();
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_ENSHRINE_OR_NOT:
        //刷新收藏列表
        this.resetStarList();
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE:
        //手动设置联系人
        this.chatMenuStatus = {
          'star': true,
          'work': true,
          'private': true,
          'recent': false,
          'mission': true,
        };
        this.reloadChatList(() => {
          this.switchChat(message.data);
        });
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_CREATE_NEW_GROUP:
        this.createNewGroup(message.data.event, message.data.type);
        break;
      case this.notificationService.config.ACT_CHAT_NOTICE_GROUP_CREATE:
      case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT:
        // 有sent=1表示是建立者本人
        if (message.hasOwnProperty('status') && message.status === 1 &&
          (message.data.hasOwnProperty('sent') || message.data.hasOwnProperty('owner'))) {
          //建群成功，刷新左侧列表
          this.messageDataService.setChatHasLoaded(false);
          this.getChatList();
        }
        break;
      case this.notificationService.config.ACT_NOTICE_GROUP_DELETE:
        if (message.hasOwnProperty('status') && message.status === 1) {
          if (!this.chatList) {
            this.getChatList(() => {
              this.dealDeleteGroupResult(message);
            });
          } else {
            this.dealDeleteGroupResult(message);
          }
        }
        break;
      case this.notificationService.config.ACT_NOTICE_USER_EXIT_GROUP:
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
        if (isSelf) {
          if (!this.chatList) {
            this.getChatList(() => {
              this.dealQuitGroupResult(message);
            });
          } else {
            this.dealQuitGroupResult(message);
          }
        }
        break;
      case this.notificationService.config.ACT_NOTICE_MASTER_DELETE_GROUP_USER:
        if (message.hasOwnProperty('status') && message.status === 1) {
          if (!this.chatList) {
            this.getChatList(() => {
              this.dealRemoveMemberResult(message);
            });
          } else {
            this.dealRemoveMemberResult(message);
          }
        }
        break;
      //群信息修改
      case this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY:
        let group: any = message.data;
        if (!this.chatList) {
          this.getChatList();
        }
        if (group && group.hasOwnProperty('gid')
          && group.hasOwnProperty('is_modify_name') && group.is_modify_name == 1) {
          this.getChatList();
          for (let key in this.chatList) {
            for (let g in this.chatList[key]) {
              if (parseInt(this.chatList[key][g].gid) === parseInt(group.gid)) {
                this.chatList[key][g].name = group.name;
              }
            }
          }
          this.reloadShowChatMenu();
          if (group.gid === this.currentGroup.gid) {
            this.currentGroup.name = group.name;
          }
          this.messageDataService.setChatListCache(this.chatList);
        }
        break;
      case this.notificationService.config.ACT_NOTICE_MASTER_GROUP_INVITE:
        //建群成功，刷新左侧列表
        this.messageDataService.setChatHasLoaded(false);
        this.getChatList();
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_HAS_UNREAD_MESSAGE:
        let toRefreshMenuId = message.data.hasOwnProperty('menuId') ? message.data.menuId : '';
        if (toRefreshMenuId) {
          if (message.data.isFriend) {
            // 如果是个人聊天，添加到recent列表
            let detail = message.data.detail;
            let menuItem = this.buildMenuListObj({
              isFriend: true,
              form: detail.form,
              work_name: detail.work_name,
              friendType: detail.type,
              uid: detail.uid
            });
            this.setRecentContact(menuItem, false);
          }
          this.setUnReadMessageCount(toRefreshMenuId, 1);
        }
        break;
      // 群组转让
      case this.notificationService.config.ACT_NOTICE_GROUP_TRANSFER:
        if (message.hasOwnProperty('status') && message.status === 1) {
          this.messageDataService.setChatHasLoaded(false);
          this.getChatList();
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_SEARCH_OPEN_CHAT_GROUP:
        this.reloadChatList(() => {
          this.switchChat(message.data.currentItem);
        });
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE:
        if (message.data && message.data.hasOwnProperty('currentItem') && message.data.hasOwnProperty('pinInfo')) {
          if (message.data.isDefaultContent) {
            this.reloadChatList(() => {
              this.switchChat(message.data.currentItem, message.data);
            });
          } else {
          }
        }
        break;
    }
  }

  buildMenuListObj(data: any) {
    let initObj: any = {};
    if (data && !(data instanceof ChatMenuList)) {
      initObj = ChatMenuList.init({group: 'recent'});
      this.typeService.bindData(initObj, data, (obj: ChatMenuList) => {
        this.bindGroupIdentity(obj);
      });
    } else if (data && data instanceof ChatMenuList) {
      initObj = data;
      if (!data.hasOwnProperty('identity') || data.identity === '') {
        this.bindGroupIdentity(initObj);
      }
    }
    return initObj;
  }

  checkHasNoRead(identity: string) {
    if (this.noReadCountInfo.hasOwnProperty(identity)) {
      return true;
    }
  }

  /**
   * 未读消息数量
   * @param menuId
   * @param count
   */
  setUnReadMessageCount(menuId: string, count: number) {
    if (!this.noReadCountInfo.hasOwnProperty(menuId)) {
      if (count > 0) {
        this.noReadCountInfo[menuId] = count;
      }
    } else if (this.noReadCountInfo[menuId] < 9) {
      let existCount = this.noReadCountInfo[menuId];
      let newCount = existCount + count;
      this.noReadCountInfo[menuId] = newCount > 9 ? 9 : newCount;
    }
  }

  /**
   * 手动设置最近联系人
   * @param initObj
   * @param switchOrNot 是否切换到该聊天
   */
  setRecentContact(initObj: ChatMenuList, switchOrNot?: boolean) {
    if (switchOrNot) {
      this.currentGroup = initObj;
      this.currentGroup = this.buildClsName(this.currentGroup);
    }
    if (this.typeService.getDataLength(this.recentList) === 0) {
      //数组为空直接push
      this.recentList.push(initObj);
    } else {
      //开头追加
      let flag = false;
      for (let key in this.recentList) {
        //判断是否已经在群组中, 如果不在，不做任何操作
        if (this.recentList[key].identity === initObj.identity) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        this.recentList.unshift(initObj);
      }
      //大于等于10个删除最后一个
      if (this.typeService.getDataLength(this.recentList) > this.RECENT_LENGTH) {
        this.recentList.pop();
      }
    }
    this.messageDataService.updateChatListCache(this.recentList, 'RECENT');
  }


  /**
   * 重新加载聊天数据
   * reload chat list
   */
  reloadChatList(callBack?: any) {
    this.getChatList(callBack);
  }


  /**
   * 当有菜单缓存时 不需要再次刷新菜单
   * @returns {boolean}
   */
  couldLoadList(): boolean {
    let chatMenuCache = this.messageDataService.getChatListCache();
    return !(this.messageDataService.getChatHasLoaded() && chatMenuCache && chatMenuCache !== null);
  }

  initMenuList() {
    this.getChatList();
  }


  /**
   * 获取聊天列表
   */
  getChatList(callBack?: any) {
    if (this.couldLoadList()) {
      this.chatModelService.getGroupList((data: any) => {
        //获取成功
        if (data.status === 1) {
          this.chatList = data.data;
          this.isChatMenuInit = true;
          this.setChatList();
          this.messageDataService.setChatHasLoaded(true);
          this.messageDataService.setChatListCache(data.data);

          if (typeof callBack === 'function') {
            callBack();
          }
        } else {
          this.messageDataService.setChatHasLoaded(false);
        }
      });
    } else if (this.messageDataService.getChatListCache()) {
      this.chatList = this.messageDataService.getChatListCache();
      this.setChatList();
      if (typeof callBack === 'function') {
        callBack();
      }
    }
  }

  /**
   * 搜索
   * @param chatList
   */
  searchGroupList(chatList: any) {
    //搜索
    this.searchParam = {
      name: 'name',
      val: '',
      data: chatList,
      callBack: (data: any) => {
        this.starList = data.STARRED;
        this.missionList = data.MISSION;
        this.workList = data.WORK;
        this.privateList = data.PRIVATE;
        this.recentList = data.RECENT;
      }
    };
  }

  /**
   * 设置聊天数据
   */
  setChatList() {
    if (this.chatList) {
      for (let type in this.chatList) {
        if (this.chatList.hasOwnProperty(type)) {
          for (let key in this.chatList[type]) {
            if (this.chatList[type].hasOwnProperty(key)) {
              if (this.chatList[type][key].is_mission === '1') {
                this.chatList[type][key].clsName = 'font-chat-mission1';
              } else {
                switch (parseInt(this.chatList[type][key].form)) {
                  case this.config.MESSAGE_TYPE_PRIVATE:
                    this.chatList[type][key].clsName = 'font-chat-private';
                    break;
                  case this.config.MESSAGE_TYPE_WORK:
                    this.chatList[type][key].clsName = 'font-chat-business';
                    break;
                }
              }

            }
          }
        }
      }
      this.reloadShowChatMenu();
      this.searchGroupList(this.chatList);
    }
  }


  /**
   * 设置offline 离线消息数量
   */
  setGroupOfflineMessageCount(offlineGroupData: any) {
    if (offlineGroupData) {
      for (let obj in offlineGroupData) {
        if (offlineGroupData[obj].has_unread > 0) {
          this.messageDataService.setGroupMessageNoReadCount(obj, offlineGroupData[obj].has_unread);
          this.messageDataService.setLoadLeaveMessageKey(obj, 0);
        }
      }
    }
  }

  /**
   * 刷新列表
   * 重新绑定显示用数据
   */
  reloadShowChatMenu() {
    this.starList = this.typeService.bindDataList(ChatMenuList.init({group: 'star'}), this.chatList.STARRED, false, (obj: ChatMenuList) => {
      this.bindGroupIdentity(obj);
      if (obj.uid !== '') {
        obj.isFriend = true;
        obj.work_name = obj.work_name === '' ? obj.name : obj.work_name;
      }
      this.setUnReadMessageCount(obj.identity, obj.offline_message);
    });
    this.missionList = this.typeService.bindDataList(ChatMenuList.init({group: 'mission'}), this.chatList.MISSION, false, (obj: ChatMenuList) => {
      this.bindGroupIdentity(obj);
      this.setUnReadMessageCount(obj.identity, obj.offline_message);
    });
    this.workList = this.typeService.bindDataList(ChatMenuList.init({group: 'work'}), this.chatList.WORK, false, (obj: ChatMenuList) => {
      this.bindGroupIdentity(obj);
      this.setUnReadMessageCount(obj.identity, obj.offline_message);
    });
    this.privateList = this.typeService.bindDataList(ChatMenuList.init({group: 'private'}), this.chatList.PRIVATE, false, (obj: ChatMenuList) => {
      this.bindGroupIdentity(obj);
      this.setUnReadMessageCount(obj.identity, obj.offline_message);
    });

    // 防止接口数据格式不正确 预处理
    for (let k in this.chatList.RECENT) {
      if (!this.chatList.RECENT[k].hasOwnProperty('isFriend')) {
        this.chatList.RECENT[k].isFriend = this.chatList.RECENT[k].hasOwnProperty('uid');
        this.chatList.RECENT[k].work_name = this.chatList.RECENT[k].name;
      }
    }
    this.recentList = this.typeService.bindDataList(ChatMenuList.init({group: 'recent'}), this.chatList.RECENT, false, (obj: ChatMenuList) => {
      this.bindGroupIdentity(obj);
      if (obj.isFriend) {
        this.setUnReadMessageCount(obj.friendIdentity, obj.offline_message);
      } else {
        this.setUnReadMessageCount(obj.identity, obj.offline_message);
      }
    });

  }

  /**
   * 刷新收藏列表
   */
  resetStarList() {
    this.starList = this.typeService.bindDataList(ChatMenuList.init({group: 'star'}),
      this.messageDataService.getChatListCache('STARRED'), false, (obj: ChatMenuList) => {
        this.bindGroupIdentity(obj);
      });
  }

  /**
   * 绑定Chat菜单唯一标识
   * @param obj
   */
  bindGroupIdentity(obj: ChatMenuList) {
    obj = this.buildClsName(obj);
    if (obj.isFriend) {
      let id = '';
      if (obj.form == 1) {
        id = this.userDataService.getCurrentUUID();
      } else {
        id = this.userDataService.getCurrentCompanyPSID();
      }
      obj.initIdentity(id);
    } else {
      obj.initIdentity();
    }

  }

  /**
   * 切换聊天窗口
   */
  switchChat(data: any | ChatMenuList, pinMessageInfo?: any) {
    let menuItem = this.buildMenuListObj(data);
    // TODO: 如果点击的是同一个聊天,应该根据读取时间只读取聊天内容
    let readMessageOnly = false;
    if (this.currentGroup && menuItem && JSON.stringify(menuItem.identity) === (JSON.stringify(this.currentGroup.identity))) {
      //readMessageOnly = true;
    }
    this.currentGroup = menuItem;
    // 点击过后未读消息为0
    if (this.noReadCountInfo.hasOwnProperty(menuItem.identity)) {
      delete this.noReadCountInfo[menuItem.identity];
    }

    this.setRecentContact(menuItem, true);
    // 加载聊天框内容
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_MENU_CLICK,
      data: {
        menuItem: menuItem,
        readMessageOnly: readMessageOnly,
        pinMessageInfo: pinMessageInfo
      }
    });
  }

  toggleMenuStatus(group: string) {
    if (this.chatMenuStatus.hasOwnProperty(group)) {
      this.chatMenuStatus[group] = !this.chatMenuStatus[group];
    }
  }


  /**
   * 弹出新建工作群组
   */
  public createNewGroup(event: any, type: string) {
    event.stopPropagation();
    this.dialogService.openNew({
      mode: '2',
      titleAction: 'Create',
      titleComponent: 'New ' + (type === 'work' ? 'Business' : 'Individual') + ' Channel',
      titleDesc: [
        'Select',
        ' friend or business (internal/cooperator) ',
        'to create a discuss group'
      ],
      titleIcon: 'icon1-new-channel di1-new-channel',
      isSimpleContent: false,
      componentSelector: 'chat-create-group',
      componentData: {type: type},
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'send',
          btnEvent: 'createNewGroup'
        }]
    });
  }

  /**
   * 用户点击左侧X按钮时，根据是否群主看到不同的弹框
   * 群主能够删除，普通用户只有退出
   * @param event
   * @param group
   */
  dealDeleteOrQuitGroup(event: any, group: ChatMenuList) {
    event.stopPropagation();
    // 群主的话 删除
    if (group.is_host) {
      this.dialogService.openNew({
        mode: '1',
        title: 'DELETE CHANNEL',
        simpleContent: 'Do you confirm to delete this channel?  Meanwhile, you will lose all doc and information from this group, This action cannot be undone',
        buttons: [
          {
            type: 'cancel'
          },
          {
            type: 'delete',
            btnEvent: () => {
              this.chatService.sendRemoveTheGroup({
                form: group.form,
                gid: group.gid,
                name: group.name,
              });
            }
          }
        ]
      });
    } else {
      // 普通用户的话 退出群组
      this.dialogService.openNew({
        mode: '1',
        title: 'EXIT GROUP',
        simpleContent: 'Do you confirm to quit this group?',
        buttons: [
          {
            type: 'cancel'
          },
          {
            type: 'delete',
            btnEvent: () => {
              this.chatService.signOutGroup({
                form: group.form,
                gid: group.gid,
                //name: group.name,
              });
            }
          }
        ]
      });
    }
  }

  /***
   *
   * @param message
   */
  dealDeleteGroupResult(message: any) {
    // 群主本人删除，移除菜单
    // 群员也需要移除菜单
    if ((message.data.hasOwnProperty('sent') && message.data.sent === 1)
      || (message.data.hasOwnProperty('owner'))) {
      this.removeGroupItem(message.data.gid);
    }
  }

  dealQuitGroupResult(message: any) {
    // 成员退出群，本人刷新菜单, 其他人刷新成员列表
    if (message.data.hasOwnProperty('sent') && message.data.sent === 1) {
      this.removeGroupItem(message.data.gid);
    } else {
    }
  }

  //删除成员的后续处理
  dealRemoveMemberResult(message: any) {
    //被删除成员的人左侧列表移除这个群
    if ((message.data.hasOwnProperty('frd_type') && message.data.frd_type === 3)) {
      this.removeGroupItem(message.data.gid);
    }
  }

  /**
   *
   * @param gid
   */
  removeGroupItem(gid: any) {
    let removeGroup = [];
    for (let group in this.chatList) {
      if (this.chatList.hasOwnProperty(group)) {
        for (let i in this.chatList[group]) {
          if (this.chatList[group].hasOwnProperty(i)) {
            if (gid && this.chatList[group][i] && this.chatList[group][i].hasOwnProperty('gid') &&
              parseInt(gid) === parseInt(this.chatList[group][i].gid)
            ) {
              removeGroup.push({
                g: group,
                i: parseInt(i)
              });
            }
          }
        }
      }
    }

    if (removeGroup.length) {
      removeGroup.forEach((info: any) => {
        this.chatList[info.g].splice(info.i, 1);
      });
      this.messageDataService.updateChatListCache(this.chatList);
    }

    //删除的是当前阅读组, 跳回默认页
    if (typeof this.currentGroup !== 'undefined' && parseInt(gid) === this.currentGroup.gid) {
      delete this.currentGroup;
    }
    this.reloadShowChatMenu();
  }


  /**
   * 新建chat-post
   */
  createChatPost(event: any): void {
    event.stopPropagation();
    this.showPostChat = true;
    let data: any = {
      showPost: true
    };
    this.isShowChatPost.emit(data);
  }

  /**
   * 查看聊天历史记录
   * @param event
   */
  // viewChatHistory(event: any) {
  //   event.stopPropagation();
  //   this.dialogService.openNew({
  //     mode: '2',
  //     titleAction: '',
  //     titleComponent: 'History contact record',
  //     isAddClass: 'view-chat-history',
  //     titleDesc: [
  //       'View',
  //       ' Not a contact person or removed group ',
  //       'chat message'
  //     ],
  //     titleIcon: '',
  //     isSimpleContent: false,
  //     componentSelector: 'chat-history-dialog',
  //     componentData: null
  //   });
  // }

  /**
   *
   * @param {ChatMenuList} currentGroup
   */
  private buildClsName(currentGroup: ChatMenuList): ChatMenuList {
    if (currentGroup.is_mission === '1') {
      currentGroup.clsName = 'font-chat-mission1';
    } else {
      switch (parseInt(currentGroup.form)) {
        case this.config.MESSAGE_TYPE_PRIVATE:
          currentGroup.clsName = 'font-chat-private';
          break;
        case this.config.MESSAGE_TYPE_WORK:
          currentGroup.clsName = 'font-chat-business';
          break;
      }
    }

    return currentGroup;
  }
}


