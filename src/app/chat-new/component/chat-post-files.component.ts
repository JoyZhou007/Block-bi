/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */
import { AfterViewInit, Component, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { ChatModelService } from "../../shared/services/model/chat-model.service";
import {
  ChatMenuList, ChatMessage,
  ChatUserInfo
} from "../../shared/services/model/entity/chat-entity";
import { ChatConfig } from '../../shared/config/chat.config';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'chat-post-files',
  templateUrl: '../template/chat-post-files.component.html',
})
export class ChatPostFilesComponent implements AfterViewInit {

  private currentItem: ChatMenuList;
  public showPostFiles: boolean = false;
  private couldLoad: boolean = false;
  public postFilesList: Array<ChatMessage> = [];
  public chatConfig: ChatConfig = new ChatConfig();
  private subscription: Subscription;
  public hasInit: boolean = false;
  public currentUserInfoList: Array<any> = [];

  constructor(public chatModelService: ChatModelService,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any) {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {

      //撤回消息
      if (message.hasOwnProperty('status') && message.act == this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE) {
        this.checkRevokeMessage(message.data);
      }
      if (message.act == this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE) {
        if (message.data && message.data.hasOwnProperty('messageData')) {
          this.postFilesList.unshift(message.data.messageData);
        }
      }
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH) {
        if (message.data.hasOwnProperty('module') && (message.data.module === 'pin' || message.data.module === 'mini-dialog')) {
          this.refreshPinList(message.data);
        }
      }

    });

  }


  ngAfterViewInit(): void {

  }

  /**
   * 从父组件获取群组信息
   * @param {ChatMenuList} menuItem
   * @param {Array<ChatUserInfo>} userInfo
   */
  public getGroupInfo(menuItem: ChatMenuList, userInfo?: Array<ChatUserInfo>): void {
    let isLoading = true;
    if (this.currentItem) {
      if (this.currentItem.isFriend) {
        isLoading = this.currentItem.uid !== menuItem.uid;
      } else {
        isLoading = this.currentItem.gid !== menuItem.gid;
      }
    } else {
      isLoading = true;
    }
    this.currentItem = menuItem;
    this.couldLoad = true;
    if (isLoading && this.showPostFiles) {
      this.postFilesList = [];
      this.hasInit = false;
      this.requestPostFileInterface();
    }
  }

  /**
   * 点击显示post file下拉列表
   * @param {MouseEvent} event
   */
  public clickShowPostFiles(event: MouseEvent): void {
    event.stopPropagation();
    this.showPostFiles = !this.showPostFiles;
    if (this.showPostFiles && this.couldLoad) {
      this.postFilesList = [];
      this.requestPostFileInterface();
    }
  }

  /**
   * 获取post file list 接口
   */
  private requestPostFileInterface() {
    this.chatModelService.getPostByChatGroup({
      data: {
        channel: this.currentItem.isFriend ? this.currentItem.uid.toString() : this.currentItem.gid.toString(),
        page: 0 //Todo 暂时不分页
      }
    }, (res: any) => {
      if (res.status === 1) {
        this.couldLoad = false;
        if (res.data && res.data.hasOwnProperty('msg') && res.data.msg.length) {
          this.currentUserInfoList = res.data.users_info;
          this.buildPostListData(res.data.msg, res.data.users_info);
        }
        this.hasInit = true;
      }
    })
  }

  private buildPostListData(dataArr: Array<any>, users_info: Array<any>) {
    this.postFilesList = [];
    dataArr.forEach((value, index, array) => {
      let userInfo;
      if (users_info.hasOwnProperty(value.owner)) {
        userInfo = users_info[value.owner];
      }
      let messageObj = new ChatMessage().getMessageObjByType(value.type, value, userInfo);
      this.postFilesList.push(messageObj)
    })
  }


  /**
   * 聊天消息转发
   * @param event
   * @param postMessage
   */
  setPinMessageForward(event: MouseEvent, postMessage: ChatMessage) {
    event.stopPropagation();
    if (!this.currentItem) {
      return;
    }
    let isCommonMessage = (postMessage.type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT);
    let channelFormChat = {
      form: this.currentItem.form
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'FORWARD',
      isSimpleContent: false,
      componentSelector: 'chat-forward-dialog',
      componentData: this.typeService.clone({
        messageData: postMessage,
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

  setMessageAt(event: MouseEvent, postMessage: ChatMessage) {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_AT_USER,
      data: {
        event: event,
        message: postMessage
      }
    })
  }

  /**
   * removeTheMessage 撤回这条消息
   */
  removeTheMessage(event: MouseEvent, messageData: ChatMessage) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_REVOKE,
      data: {
        messageData: messageData
      }
    });
  }


  /**
   * 检查是否有被post file的消息撤回
   */
  checkRevokeMessage(revokeMessage: any) {
    if (this.postFilesList.length) {
      this.postFilesList.forEach((postItem: any) => {
        if (postItem.msg_id === revokeMessage.msg_id) {
          postItem.status = 0;
        }
      })
    }
  }


  /**
   * 点击post file跳转到聊天组 并且跳转至那条消息
   */
  jumpToMessage(event: any, postObj: any) {
    event.stopPropagation();
    let chatMenuList = ChatMenuList.init();
    chatMenuList.isFriend = postObj.uid ? true : false
    chatMenuList.form = postObj.form;
    if (postObj.uid) {
      for (let i in postObj.uid) {
        if (postObj.uid[i] !== this.userDataService.getCurrentUUID() && postObj.uid[i] !== this.userDataService.getCurrentCompanyPSID()) {
          chatMenuList.uid = postObj.uid[i];
        }
      }
    } else if (postObj.gid) {
      chatMenuList.gid = postObj.gid;
    }

    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE,
      data: {
        currentItem: this.currentItem,
        isDefaultContent: false,
        pinInfo: {
          messageData: postObj
        }
      }
    })
  }

  /**
   * 设置消息pin
   * @param event
   * @param data
   */
  setMessagePin(event: MouseEvent, data: ChatMessage) {
    if (!data) {
      return;
    }
    let messageData: ChatMessage = data;
    event.stopPropagation();
    let requestData = {
      msg_id: messageData.msg_id,
      form: this.currentItem.form
    };
    if (messageData.hasPin) {
      if (this.currentItem.isFriend) {
        requestData['friend'] = this.currentItem.uid;
      } else {
        requestData['gid'] = this.currentItem.gid;
      }
      this.chatModelService.setDeleteMsgPin({data: requestData}, (response: any) => {
        if (response.status === 1) {
          messageData.hasPin = false;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH,
            data: {
              action: 'delete',
              module: 'pin',
              messageData: messageData,
              currentMenu: this.currentItem,
              isMiniDialog: true
            },
          });
        }
      });
    } else {
      requestData['msg_time'] = messageData.time;
      if (this.currentItem.isFriend) {
        requestData['friend'] = this.currentItem.uid;
      } else {
        requestData['gid'] = this.currentItem.gid;
      }
      this.chatModelService.setInsertMsgPin({data: requestData}, (response: any) => {
        if (response.status === 1) {
          messageData.hasPin = true;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH,
            data: {
              action: 'insert',
              module: 'pin',
              messageData: messageData,
              currentMenu: this.currentItem,
              isMiniDialog: true
            }
          });
        }
      });
    }
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
        for (let i in this.postFilesList) {
          if (this.postFilesList[i].msg_id === messageData.msg_id) {
            this.postFilesList[i].hasPin = action==='insert';
            break;
          }
        }
      }
    }
  }

}