/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren, HostListener
} from "@angular/core";
import { ChatModelService } from "../../shared/services/model/chat-model.service";
import {
  ChatMenuList,
  ChatMessage,
  ChatUserInfo
} from "../../shared/services/model/entity/chat-entity";
import { ContactModelService } from "../../shared/services/model/contact-model.service";
import { ChatConfig } from "../../shared/config/chat.config";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'chat-pin',
  templateUrl: '../template/chat-pin.component.html',
})
export class ChatPinComponent implements AfterViewInit, OnDestroy {
  public pageIndex: number = 1;
  public pageSize: number = 8;
  public pinList: Array<any> = [];
  public init: boolean = false;
  public chatConfig: ChatConfig = new ChatConfig();
  public isDefaultContent: boolean = false;
  public currentMenuItem: ChatMenuList;
  public currentUserInfo: Array<ChatUserInfo> = [];
  public menuStatus: boolean = false;

  public subscription: Subscription;
  public currentContactList: Array<any> = [];
  public currentGroupList: Array<any> = [];


  @Output('outClickMenu') outClickMenu = new EventEmitter<any>();
  @ViewChildren('showMenu') showMenuList: QueryList<ElementRef>;
  private isFriendRelation: boolean = true;

  constructor(public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('dialog.service') public dialogService: any) {

    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH) {
        if (message.data.hasOwnProperty('module') && (message.data.module === 'pin' || message.data.module === 'mini-dialog')) {
          this.refreshPinList(message.data);
        }
      }
      //撤回消息
      if (message.hasOwnProperty('status') && message.act == this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE) {
        this.checkRevokeMessage(message.data);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  stopPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * 删除pin
   * @param event
   * @param pinObj
   * @param index
   */
  removePin(event: any, pinObj: any, index: any) {
    event.stopPropagation();
    if (!this.currentMenuItem && !this.isDefaultContent) {
      return;
    }
    this.dialogService.openConfirm({simpleContent: 'Are you sure to remove this pin?'}, () => {
      let requestData;
      if (this.currentMenuItem) {
        requestData = {
          msg_id: pinObj.messageData.msg_id,
          form: this.currentMenuItem.form
        };
        if (this.currentMenuItem.isFriend) {
          requestData['friend'] = this.currentMenuItem.uid;
        } else {
          requestData['gid'] = this.currentMenuItem.gid;
        }
      } else {
        requestData = {
          pin_id: pinObj.pin_id,
        };
      }

      this.chatModelService.setDeleteMsgPin({data: requestData}, (response: any) => {
        if (response.status === 1) {
          this.pinList.splice(index, 1);
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH,
            data: {
              action: 'delete',
              module: 'message',
              messageData: pinObj.messageData,
              currentMenu: this.currentMenuItem
            }
          });
        }
      });
    });

  }

  /**
   * 刷新pin列表
   * @param info
   */
  refreshPinList(info: any) {
    if (info) {
      let action = info.hasOwnProperty('action') ? info.action : '';
      let messageData = info.hasOwnProperty('messageData') ? info.messageData : null;
      let chatMenuItem = info.hasOwnProperty('currentMenu') ? info.currentMenu : null;
      if (action && messageData && chatMenuItem) {
        if (action === 'delete') {
          for (let i in this.pinList) {
            if (this.pinList[i].messageData.msg_id === messageData.msg_id) {
              this.pinList.splice(parseInt(i), 1);
              break;
            }
          }
        } else if (action === 'insert') {
          let pinObj = this.buildPinObj(messageData);
          if (this.init) {
            this.pinList.unshift(pinObj);
          }
        }
      }
    }
  }

  initDefaultPinSetting() {
    this.isDefaultContent = true;
    this.pinList = [];
    this.menuStatus = false;
    this.init = false;
    this.outClickMenu.emit();
  }

  initMenuItemPinSetting(menuItem: ChatMenuList, userInfo?: Array<ChatUserInfo>) {
    this.isDefaultContent = false;

    let isLoading = true;
    if (this.currentMenuItem) {
      if (this.currentMenuItem.isFriend) {
        isLoading = this.currentMenuItem.uid !== menuItem.uid;
      } else {
        isLoading = this.currentMenuItem.gid !== menuItem.gid;
      }
    } else {
      isLoading = true;
    }
    this.currentMenuItem = menuItem;
    this.currentUserInfo = userInfo ? userInfo : [];

    this.outClickMenu.emit();
    if (this.menuStatus && isLoading) {
      this.init = false;
      this.pinList = [];
      if (this.isDefaultContent) {
        this.loadAllPinMsg();
      } else {
        this.loadPinMsgByMenuItem();
      }
    }
  }

  /**
   * 读取所有pin列表
   */
  loadAllPinMsg() {
    if (!this.init) {
      let requestData = {
        data: {
          index: this.pageIndex,
          page_size: this.pageSize
        }
      };
      this.chatModelService.getMsgPinList(requestData, (data: any) => {
        if (data.status === 1) {
          this.init = true;
          if (data.data.hasOwnProperty('users_info')) {
            this.currentUserInfo = [];
            for (let uid in data.data.users_info) {
              let userData = {
                uid: uid
              };
              Object.assign(userData, data.data.users_info[uid]);
              this.currentUserInfo.push(new ChatUserInfo(userData));
            }
          }
          this.buildPinArray(data.data.pin_list);
        }
      });
    }

  }

  /**
   * 收起展开
   * @param event
   */
  toggleMenuStatus(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.menuStatus = !this.menuStatus;
    if (this.menuStatus) {
      if (this.isDefaultContent) {
        this.loadAllPinMsg();
      } else {
        this.loadPinMsgByMenuItem();
      }
    }
    this.outClickMenu.emit();
  }

  /**
   * 读取某一个群组、私人聊天的pin
   */
  loadPinMsgByMenuItem() {
    if (this.currentMenuItem && !this.init) {
      let requestData = {
        form: this.currentMenuItem.form,
        index: this.pageIndex,
        page_size: this.pageSize
      };
      let couldRequest = false;
      // 好友聊天pin
      if (this.currentMenuItem.isFriend && this.currentMenuItem.uid) {
        requestData['friend'] = this.currentMenuItem.uid;
        couldRequest = true;
        // 群组聊天pin
      } else if (!this.currentMenuItem.isFriend && this.currentMenuItem.gid) {
        requestData['gid'] = this.currentMenuItem.gid;
        couldRequest = true;
      }
      if (couldRequest) {
        this.chatModelService.getMsgPinList({data: requestData}, (data: any) => {
          if (data.status === 1) {
            this.init = true;
            this.currentUserInfo = [];
            if (data.data.hasOwnProperty('users_info')) {
              for (let uid in data.data.users_info) {
                let userData = {
                  uid: uid
                };
                Object.assign(userData, data.data.users_info[uid]);
                this.currentUserInfo.push(new ChatUserInfo(userData));
              }
            }
            this.buildPinArray(data.data.pin_list);
          } else {
            this.dialogService.openWarning({
              simpleContent: 'Failed to load pin data!'
            });
          }
        });
      }
    }
  }


  /**
   * 初始化模板显示用数组
   * @param sourcePinArr
   */
  buildPinArray(sourcePinArr: any) {
    for (let i in sourcePinArr) {
      if (sourcePinArr.hasOwnProperty(i)) {
        let info = sourcePinArr[i];
        let pinObj = this.buildPinObj(info);
        this.pinList.push(pinObj);
      }
    }
  }

  /**
   * 初始化单个Pin对象
   * @param info
   * @returns {{pin_id: any, createDate: string, typeCls: string, messageData: any}}
   */
  buildPinObj(info: any) {
    let messageObj = new ChatMessage().getMessageObjByType(info.type, info);
    if (this.currentUserInfo) {
      this.currentUserInfo.forEach((user: ChatUserInfo) => {
        if (user.uid === info.owner) {
          let userInfo = new ChatUserInfo(user);
          messageObj = new ChatMessage().getMessageObjByType(info.type, info, userInfo);
        }
      })
    }
    messageObj.analyseMessageText(this.currentUserInfo);
    let tmp = {
      pin_id: info.pin_id,
      createDate: this.dateService.formatLocal(parseInt(info.time), 'HH:MMtt ddS mmm'),
      typeCls: '',
      messageData: messageObj,
      form: info.form,
    };
    if (info.gid) {
      tmp['gid'] = info.gid
    } else {
      tmp['uid'] = info.uid
    }
    switch (info.type) {
      case this.chatConfig.CHAT_MESSAGE_TYPE_POST:
        tmp.typeCls = 'ch-pins-list-item-post';
        break;
      case this.chatConfig.CHAT_MESSAGE_TYPE_IMG:
        tmp.typeCls = 'ch-pins-list-item-image';
        break;
      case this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD:
        if (messageObj.detail.original_msg.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
          tmp.typeCls = 'ch-pins-list-item-post';
        } else if (messageObj.detail.original_msg.type === this.chatConfig.CHAT_MESSAGE_TYPE_IMG) {
          tmp.typeCls = 'ch-pins-list-item-image';
        } else if (messageObj.detail.original_msg.type === this.chatConfig.CHAT_MESSAGE_TYPE_FILE) {
          tmp.typeCls = 'ch-pins-list-item-file';
        } else {
          tmp.typeCls = 'ch-pins-list-item-word';
        }


        break;
      case this.chatConfig.CHAT_MESSAGE_TYPE_FILE:

        tmp.typeCls = 'ch-pins-list-item-file';
        break;
      case this.chatConfig.CHAT_MESSAGE_TYPE_SHARE:  //share_file_type
        if (messageObj.detail.share_file_type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
          tmp.typeCls = 'ch-pins-list-item-post';
        } else if (messageObj.detail.share_file_type === this.chatConfig.CHAT_MESSAGE_TYPE_IMG) {
          tmp.typeCls = 'ch-pins-list-item-image';
        } else if (messageObj.detail.share_file_type === this.chatConfig.CHAT_MESSAGE_TYPE_FILE) {
          tmp.typeCls = 'ch-pins-list-item-file';
        } else {
          tmp.typeCls = 'ch-pins-list-item-word';
        }
        break;
      default:
        tmp.typeCls = 'ch-pins-list-item-word';
        break;
    }
    return tmp;
  }

  /**
   * 聊天消息转发
   * @param event
   * @param pinMessage
   */
  setPinMessageForward(event: MouseEvent, pinMessage: ChatMessage) {
    event.stopPropagation();
    if (!this.currentMenuItem) {
      return;
    }
    let isCommonMessage = (pinMessage.type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT);
    let channelFormChat = {
      form: this.currentMenuItem.form
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'FORWARD',
      isSimpleContent: false,
      componentSelector: 'chat-forward-dialog',
      componentData: this.typeService.clone({
        messageData: pinMessage,
        channelFormChat: channelFormChat,
        showForward: true,
        isCommonMessage: isCommonMessage
      }),
      buttons: [{
        type: 'cancel'
      },
        {
          type: 'send',
          btnEvent: 'sendForwardData',
        }
      ]
    })
  }


  setMessageAt(event: MouseEvent, pinMessage: ChatMessage) {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_AT_USER,
      data: {
        event: event,
        message: pinMessage
      }
    })
  }

  /**
   * 检查是否有被pin的消息撤回
   */
  checkRevokeMessage(revokeMessage: any) {
    if (this.pinList.length) {
      this.pinList.forEach((pinItem: any) => {
        if (pinItem.messageData.msg_id === revokeMessage.msg_id) {
          pinItem.messageData.status = 0;
        }
      })
    }
  }

  ngAfterViewInit(): void {

  }

  /**
   * 点击pin跳转到聊天组 并且跳转至那条消息
   */
  jumpToMessage(event: any, pinInfo: any) {
    this.isFriendRelation = true;
    event.stopPropagation();
    let chatMenuList = ChatMenuList.init();
    chatMenuList.isFriend = pinInfo.uid ? true : false
    chatMenuList.form = pinInfo.form;
    if (pinInfo.uid) {
      for (let i in pinInfo.uid) {
        if (pinInfo.uid[i] !== this.userDataService.getCurrentUUID() && pinInfo.uid[i] !== this.userDataService.getCurrentCompanyPSID()) {
          chatMenuList.uid = pinInfo.uid[i];
        }
      }
    } else if (pinInfo.gid) {
      chatMenuList.gid = pinInfo.gid;
    }
    if (this.isDefaultContent) {
      this.getPinChannelName(chatMenuList);
    }
    if (this.isFriendRelation) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE,
        data: {
          currentItem: this.isDefaultContent ? chatMenuList : this.currentMenuItem,
          isDefaultContent: this.isDefaultContent,
          pinInfo: pinInfo
        }
      })
    }
  }

  /**
   * 获取pin 的个人或者组的聊天信息
   */
  getPinChannelName(data: any) {
    let contactListCache = this.userDataService.getContactList();
    let chatListCache = this.messageDataService.getChatListCache();
    this.currentContactList =
      contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
    this.currentGroupList =
      chatListCache.MISSION.concat(chatListCache.WORK.concat(chatListCache.PRIVATE));
    if (data.isFriend) {
      let count: number = 0;
      for (let i in this.currentContactList) {
        if (data.uid == this.currentContactList[i].uid) {
          data.work_name = this.currentContactList[i].work_name;
          return;
        }
        count++;
      }
      if (count === this.currentContactList.length) {
        this.dialogService.openWarning({
          mode: '3',
          title: 'Notice!',
          simpleContent: '你们已经不是好友关系了'
        });
        this.isFriendRelation = false;
      }
    } else {
      let count: number = 0;
      for (let i in this.currentGroupList) {
        if (parseInt(data.gid) === parseInt(this.currentGroupList[i].gid)) {
          data.name = this.currentGroupList[i].name;
          return;
        }
        count++;
      }
      if (count === this.currentGroupList.length) {
        this.dialogService.openWarning({
          mode: '3',
          title: 'Notice!',
          simpleContent: '你已经不在这条pin消息的群里了'
        });
        this.isFriendRelation = false;
      }
    }
  }

  /**
   * removeTheMessage 撤回这条消息
   */
  removeTheMessage(event: any, messageData: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_REMOVE_MESSAGE_FROM_PIN_LIST,
      data: [event, messageData]
    });
  }


}