/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/30.
 * 消息显示的模块
 */
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  Renderer,
  ElementRef,
  AfterViewChecked,
  ViewChildren,
  QueryList,
  OnDestroy,
  Input
} from "@angular/core";
import {
  ChatMenuList,
  ChatMessage,
  ChatMessagePost,
  ChatMessagePostInterface,
  ChatPost,
  ChatUserInfo,
  PostSettings
} from "../../../shared/services/model/entity/chat-entity";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatContentMessageInputComponent} from "./chat-content-message-input.component";
import {ChatConfig} from "../../../shared/config/chat.config";
import * as FolderConstant from "../../../shared/config/folder.config";
import {AlarmModelService} from "../../../shared/services/model/alarm-model.service";
import {FolderModelService} from "../../../shared/services/model/folder-model.service";
import * as MissionConstant from "../../../shared/config/mission.config";
import * as AlarmConfig from "../../../shared/config/alarm.config";
import {ChatContentMessageTextComponent} from "./message/chat-content-message-text.component";
import {DownloadService} from "../../../shared/services/common/file/download.service";
import {Subscription} from "rxjs/Subscription";
import * as userConstant from "../../../shared/config/user.config"

@Component({
  selector: 'chat-content-message',
  templateUrl: '../../template/content/chat-content-message.component.html',
  providers: [AlarmModelService],
})

export class ChatContentMessageComponent implements OnInit, AfterViewChecked, OnDestroy {

  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public chatConfig: ChatConfig = new ChatConfig();
  public loadCorrect: boolean = true;
  public currentMenuItem: ChatMenuList;
  public currentGroupInfo: any;
  // 显示用数组
  public currentMessageList: Array<ChatMessage> = [];
  public currentDisplayMessageList: Array<{
    day: string,
    dayInfo: string,
    messageList: Array<any>
  }> = [];

  public showDate: {
    date: string;
  };
  //当前组 当前用户自己发出的消息
  public sendingList: Array<ChatMessage> = [];
  // 是否加载了全部历史数据
  public hasMoreHistoryMessage: boolean = true;
  // 是否在文本区提示有新消息
  public hasNewMessage: boolean = false;
  public messageList: {
    [data: string]: {
      final: number,
      min_time: string,
      max_time: string,
      data: Array<ChatMessage>,
      displayDataObj: any,
    }
  } = {};
  public currentGroupMember: Array<ChatUserInfo> = [];
  public currentChatUserInfo: Array<ChatUserInfo> = [];
  public selfUserInfo: ChatUserInfo;
  public isToBottom: boolean = false;
  public isToTop: boolean = false;
  public isLoadingHistory: boolean = false;
  public isLoadingNew: boolean = false;
  public bindScrollEvent: boolean = false;
  public chatScroll: number;
  public checkScrollTop: boolean = false;
  private fileList: any = [];
  private outputData: any;
  @ViewChild('messageInputComponent') messageInputComponent: ChatContentMessageInputComponent;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChildren('messageText') private messageText: QueryList<ChatContentMessageTextComponent>;
  @ViewChildren('msgObj') private msgObj: QueryList<any>;
  //传送的post的form
  private chatPostForm: string = '';
  private chatPostShareIdentity: Array<any>;
  private chatPostDetail: ChatMessagePostInterface; //后端交互
  private postDetail: ChatMessagePost; //前端显示
  private currentPostIsFriend: boolean;
  private CurrentPostChannel: string = '';
  private currentPostIdentity: any;

  private scrollUpTimer: any;
  private scrollBottomTimer: any;
  public hasMoreNewMessage: boolean = true;
  public isFirstLoading: boolean;
  public subscription: Subscription;

  private maxDisplayMessageLength: number = 100;
  private hiddenMsgList: Array<ChatMessage> = [];
  public isShowNewMsgNotice: boolean = false;   //是否显示新消息的notice
  private newMsgShowTime: number = 10000;
  private showNoticeTimer: any;
  private isLoadingByPIN: boolean = false;
  private isShowAtMsg: boolean = false;
  private atMsgData: any = {};
  private isMiniDialog: boolean = false;
  private isNetWorkConnectError: boolean = false;
  private isZhLan: boolean = this.translateService.lan == 'zh-cn';
  private checkHeight: number = 44;

  public userConstant = userConstant;

  constructor(public chatModelService: ChatModelService,
              public alarmModelService: AlarmModelService,
              public folderModelService: FolderModelService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('im.service') public chatService: any,
              @Inject('page.element') public elementService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              public renderer: Renderer,
              @Inject('date.service') public dateService: any,
              @Inject('type.service') public typeService: any,
              public downloadService: DownloadService,
              @Inject('notification.service') public notificationService: any) {

  }

  public detectInputHeight(data: any) {
    if (this.messageInputComponent && data) {
      this.checkHeight = data;
    }

  }

  @Input()
  public set setIsMiniDialog(data: boolean) {
    this.isMiniDialog = data;
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      //IM 连接中断
      if (message.act == this.notificationService.config.ACT_COMPONENT_IM_CONNECT_ERROR) {
        this.isNetWorkConnectError = true;
      }
      if (message.act == this.notificationService.config.ACT_SYSTEM_IM_LOGIN || message.act == this.notificationService.config.ACT_SYSTEM_IM_RE_LOGOUT) {
        this.isNetWorkConnectError = false;
      }
      //退出登录清空一切初始化
      if (message.act === this.notificationService.config.ACT_SYSTEM_IM_LOGOUT ||
        message.act === this.notificationService.config.ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG) {
        this.initData();
      }
      //发送消息
      if (message.hasOwnProperty('status') && message.act == this.notificationService.config.ACT_CHAT_SEND_MESSAGE) {
        if (message.status === 1) {
          this.pendingNewMessage(message.data);
        } else {
          if (message.status === 2) {
            this.messageInputComponent.messageData = message.data.msg;
            this.dialogService.openError({simpleContent: 'Message is too long'});
          }

        }
      }
      //撤回消息
      if (message.hasOwnProperty('status') && message.act == this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE) {
        this.checkRevokeMessage(message.data);
      }
      //迷你窗数据同步
      if (message.act === this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE_MINI) {
        this.sendingList = message.data.data;
      }
      //pin刷新
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH) {
        if (message.data.hasOwnProperty('module') && message.data.hasOwnProperty('currentMenu')
          && message.data.module === 'message' && message.data.currentMenu && this.currentMenuItem
          && message.data.currentMenu.identity === this.currentMenuItem.identity) {

          this.removePinFromSideBar(message.data);
        }
        if (message.data.hasOwnProperty('module') && message.data.hasOwnProperty('currentMenu')
          && message.data.module === 'mini-dialog' && message.data.currentMenu && this.currentMenuItem
          && message.data.currentMenu.identity === this.currentMenuItem.identity) {
          this.refreshMessagePinList(message.data);
        }
        if (message.data.hasOwnProperty('module') && message.data.hasOwnProperty('currentMenu')
          && message.data.module === 'pin' && message.data.currentMenu && this.currentMenuItem
          && message.data.currentMenu.identity === this.currentMenuItem.identity
          && message.data.isMiniDialog != this.isMiniDialog) {
          this.refreshMessagePinList(message.data);
        }
      }

      //从PIN LIST 撤回消息
      if (message.act === this.notificationService.config.ACT_COMPONENT_REMOVE_MESSAGE_FROM_PIN_LIST) {
        this.setMessageRevoke(message.data);
      }

      //在图片dialog里面pin图片
      if (message.act === this.notificationService.config.ACT_COMPONENT_IMAGE_PIN) {
        this.setMessagePin(message.data);
      }
      //在图片的dialog里面删除消息
      if (message.act === this.notificationService.config.ACT_COMPONENT_IMAGE_DIALOG_REMOVE_MESSAGE) {
        this.setMessageRevoke(message.data);
      }

      //图片评论
      if (message.act === this.notificationService.config.ACT_COMPONENT_IMAGE_COMMENT) {
        let msgType: number = this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM;
        let detail: any = {
          sub_type: 7,
          file_info: message.data.img,
          commentTxt: message.data.commentTxt
        };
        this.sendMessage(message.data.commentTxt, msgType, detail);
      }

      //Post评论
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_POST_COMMENT) {
        let msgType: number = this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM;
        let detail: any = {
          sub_type: 7,
          file_info: message.data.post,
          commentTxt: message.data.commentTxt,
        };
        this.sendMessage(message.data.commentTxt, msgType, detail);
      }

      // ACT_COMPONENT_CHAT_PIN_REFRESH
      // 需要生成系统消息的行为
      //修改群信息
      if (message.act === this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY && message.status === 1) {
        if (typeof this.currentMenuItem !== 'undefined'
          && !this.currentMenuItem.isFriend && message.data.hasOwnProperty('gid')
          && this.currentMenuItem.hasOwnProperty('gid')
          && parseInt(message.data['gid']) === this.currentMenuItem.gid) {
          if (message.data.is_modify_topic === 1) {
            let owner;
            if (message.data.hasOwnProperty('owner')) {
              owner = message.data.owner;
            } else {
              owner = this.currentMenuItem.form === 1 ?
                this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
            }
            let userInfo = this.findUserInfo(owner);
            let newMessageObj = new ChatMessage().getMessageObjByType(
              this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM,
              {
                time: message.data.time,
                msg: 'New Topic',
                type: this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM,
                detail: {
                  act_type: 2,
                  topic: message.data.topic
                },
                owner: owner
              },
              userInfo
            );
            if (!this.isLoadingByPIN) {
              if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
                this.pendingMessageForDisplay(newMessageObj, true);
                this.currentMessageList.push(newMessageObj);
                this.buildMessageArrForDisplay(this.currentMenuItem.identity);
                this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
              } else {
                this.pendingMessageForDisplay(newMessageObj, true);
                this.hiddenMsgList.push(newMessageObj);
              }
            }
          }
        }
      }

      //post信息
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_POST_SEND_POST) {
        let postData: ChatPost = message.data.draftTplObj;
        this.chatPostForm = postData.form;
        this.chatPostShareIdentity = postData.shareIdentity;
        this.chatPostDetail = {
          post_name: postData.title,
          post_id: postData.post_id,
        };
        this.postDetail = postData.detail;
        this.currentPostIsFriend = postData.isFriend;
        this.CurrentPostChannel = postData.channel;
        this.currentPostIdentity = postData.currentPostIdentity;
        this.sendToGroupOrPersonal(this.chatConfig.CHAT_MESSAGE_TYPE_POST, postData.channel, message.data.msg);
        if (postData.shared_to.length) {
          this.sendToMultipleGroupOrPersonal(this.chatConfig.CHAT_MESSAGE_TYPE_POST, postData.shared_to, message.data.msg);
        }
      }
      // 消息转发
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_FORWARD) {
        this.dealForwardMessage(message.data);
      }

      // share file
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_SHARE_FILE) {
        let originMsgObj = message.data.originMsgObj;
        let shareId = message.data.shareId;
        let detail = Object.assign({
          share_id: shareId,
          share_file_type: originMsgObj.type
        }, originMsgObj.detail);
        let msg = originMsgObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST ? `${originMsgObj.detail.post_name}.post` : `${originMsgObj.detail.file_name}`;
        let newMessageObj = this.buildMessageObj(msg, this.chatConfig.CHAT_MESSAGE_TYPE_SHARE, detail);
        if (newMessageObj) {
          this.sendShareMessage(newMessageObj, message.data.targetGroup, message.data.targetName);
        }
      }

      // @用户
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_AT_USER) {
        if (message.hasOwnProperty('data') && message.data.hasOwnProperty('event') && message.data.hasOwnProperty('message')) {
          let data = [message.data.event, message.data.message];
          this.setAtUser(data);
        }
      }
      //PIN 消息的跳转
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE) {
        if (message.data && message.data.hasOwnProperty('currentItem') && message.data.hasOwnProperty('pinInfo')) {
          if (!message.data.isDefaultContent) {
            let pinMsgTimestamp: number = message.data.pinInfo.messageData.time;
            let currentIdentity: string = message.data.currentItem.identity;
            if (pinMsgTimestamp <= parseInt(this.messageList[currentIdentity].max_time) && pinMsgTimestamp >= parseInt(this.messageList[currentIdentity].min_time)) {
              this.jumpToTheMessageByPin(message.data);  //pin在当前已经显示的消息里面
            } else {
              this.loadPinMessagePackage(message.data);  //pin不在当前已经显示的Pin消息里面
            }
          }
        }
      }

      //chat-post revoke
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_POST_REVOKE) {
        if (message.data) {
          this.setMessageRevoke(['', message.data.messageData]);
        }
      }
      if (message.act === this.notificationService.config.ACT_COMPONENT_IMAGE_DIALOG_FORWARD_MESSAGE) {
        this.setMessageForward(message.data);
      }
      //  import form bi ACT_COMPONENT_IMPORT_BI_FILE
      if (message.act === this.notificationService.config.ACT_COMPONENT_IMPORT_BI_FILE) {
        if (message.isMiniDialog == this.isMiniDialog) {
          this.setImportFile(message.data)
        }
      }
      // ACT_COMPONENT_CHAT_FILE_UPLOAD
      if (message.act === this.notificationService.config.ACT_COMPONENT_CHAT_FILE_UPLOAD) {
        if (message.isMiniDialog == this.isMiniDialog) {
          this.sendMessage(message.data.msgData, message.data.msgType, message.data.resData);
        }
      }
      //mission 群消息同步
      if (message.act === this.notificationService.config.ACT_COMPONENT_SYNCHRONIZATION_GROUP_MESSAGE) {
        if (message.data && message.data.isMiniDialog != this.isMiniDialog && this.currentMenuItem
          && this.currentMenuItem.gid == message.data.gid) {
          this.sendingList = message.data.data
        }
      }
    });
  }

  initData() {
    this.currentMessageList = [];
    this.currentDisplayMessageList = [];
    this.messageList = {};
  }

  /**
   * @see ChatPinComponent.removePin
   * @param data
   */
  removePinFromSideBar(data: any) {
    let changeMenuItem = data.currentMenu;
    let changeMessage = data.messageData;
    if (this.messageList.hasOwnProperty(changeMenuItem.identity)) {
      // 不在显示处理范围内，不做任何处理，接口二次请求时候可以获得正确的数据

      if (changeMessage.time > this.messageList[changeMenuItem.identity].max_time ||
        changeMessage.time < this.messageList[changeMenuItem.identity].min_time) {
        return;
      }
      try {
        this.currentMessageList.forEach((message: any) => {
          if (message.msg_id === changeMessage.msg_id) {
            message.hasPin = false;
            throw 'finish';
          }
        })
      } catch (e) {
        return
      }

    }
  }

  refreshMessagePinList(data: any) {
    let changeMenuItem = data.currentMenu;
    let changeMessage = data.messageData;
    if (this.messageList.hasOwnProperty(changeMenuItem.identity)) {
      // 不在显示处理范围内，不做任何处理，接口二次请求时候可以获得正确的数据
      if (changeMessage.time > this.messageList[changeMenuItem.identity].max_time ||
        changeMessage.time < this.messageList[changeMenuItem.identity].min_time) {
        return;
      }
      try {
        this.currentMessageList.forEach((message: any) => {
          if (message.msg_id === changeMessage.msg_id) {
            message.hasPin = !message.hasPin;
            throw 'finish';
          }
        })
      } catch (e) {
        return
      }

    }
  }


  ngAfterViewChecked() {
    if (!this.checkScrollTop && this.myScrollContainer) {
      this.chatScroll = this.myScrollContainer.nativeElement.scrollTop;
      this.checkScrollTop = true;
    }
    this.scrollToBottom();
    this.scrollToTop();
  }

  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    ele.addEventListener('mousewheel', (event: any) => {
      //向上滚动
      if (event.wheelDelta > 0 && this.myScrollContainer.nativeElement.scrollTop === 0 && !this.isLoadingHistory && this.hasMoreHistoryMessage) {
        this.loadMoreHistoryMessage(event, 1);
      }
      //向下滚动
      if (event.wheelDelta < 0 &&
        this.myScrollContainer.nativeElement.scrollTop === this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight
        && !this.isLoadingNew && this.hasMoreNewMessage
      ) {
        this.loadMoreHistoryMessage(event, -1);
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail < 0 && this.myScrollContainer.nativeElement.scrollTop === 0 && !this.isLoadingHistory && this.hasMoreHistoryMessage) {
        this.loadMoreHistoryMessage(event, 1);
      }
      if (event.detail > 0 &&
        this.myScrollContainer.nativeElement.scrollTop === this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight
        && !this.isLoadingNew && this.hasMoreNewMessage
      ) {
        this.loadMoreHistoryMessage(event, -1);
      }

    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.myScrollContainer.nativeElement.scrollTop === 0 && !this.isLoadingHistory && this.hasMoreHistoryMessage) {
        this.loadMoreHistoryMessage(event, 1);
      }
      if (event.wheelDelta < 0 &&
        this.myScrollContainer.nativeElement.scrollTop === this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight
        && !this.isLoadingNew && this.hasMoreNewMessage
      ) {
        this.loadMoreHistoryMessage(event, -1);
      }
    });
  }

  scrollToBottom(): void {
    try {
      if (!this.isToBottom && this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        this.isToBottom = true;
      }
    } catch (err) {
    }
  }

  scrollToTop(): void {
    try {
      if (!this.isToTop && !this.bindScrollEvent && this.myScrollContainer) {
        let element = this.myScrollContainer.nativeElement;
        if (element) {
          this.mouseWheelFunc(element);
          this.bindScrollEvent = true;
        }
      }
    } catch (err) {
    }
  }


  /**
   * 处理未打开的消息菜单未读数量
   * @param data
   * {
   * "owner":"310",
   * "gid":495,
   * "msg":"6",
   * "time":1494468159727,
   * "type":1,
   * "identity":"group_form:2name:testid:495",
   * "detail":[],
   * "msg_id":"5913c63fcea099202f7b71fc"
   * }
   */
  dealUnreadMessageNumber(data: any) {
    let id = data.identity;
    let isFriend = id.substring(0, id.search('_form')) === 'friend';

    let addData;
    if (isFriend) {
      // friend代表自己发的消息，左侧菜单identity应该与IM推送的保持一致
      if (!data.hasOwnProperty('friend')) {
        addData = 'friend_form:' + data.form.toString() + 'id:' + data.owner.toString();
        // 查找发送人姓名
        let user = this.userDataService.getContactsObjViaUid(data.owner);
        if (user) {
          data['work_name'] = user.work_name;
          data['uid'] = data.owner;
        } else {
          return;
        }
      } else {
        addData = data.identity;
        let friendId = id.substring(id.search('id:') + 3);
        let user = this.userDataService.getContactsObjViaUid(friendId);
        if (user) {
          data['work_name'] = user.work_name;
          data['uid'] = friendId;
        } else {
          return;
        }
      }
    } else {
      addData = data.identity;
    }
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_HAS_UNREAD_MESSAGE,
      data: {
        menuId: addData,
        isFriend: isFriend,
        detail: data
      },
    });
  }

  /**
   * 加载新消息
   * @param data
   */
  pendingNewMessage(data: any) {
    if (!this.currentMenuItem
      || (this.currentMenuItem && !this.currentMenuItem.isFriend && data.identity !== this.currentMenuItem.identity)
    ) {
      this.dealUnreadMessageNumber(data);
      return;
    }
    // 判断是否是自己的消息发送成功
    // 并且是当前组的情况下，显示消息
    // this.isToBottom = false;
    // 私人聊天，自己身份用identity字段识别
    // 对方身份用friendIdentity字段识别
    // this.messageList[data.identity].min_time = data.time;
    if (this.currentMenuItem.isFriend) {
      //发送者本人
      if (data.hasOwnProperty('sent') && data.identity === this.currentMenuItem.identity) {
        // 本浏览器
        if (data.hasOwnProperty('token') && this.sendingList.length) {
          this.sendingList.forEach((item: ChatMessage, index: number) => {
            if (item.token === data.token) {
              let messageData = {
                time: data.time,
                type: data.type,
                msg_id: data.msg_id,
                send_status: (data.status === 1),
                msg: item.msg,
                owner: item.owner,
                detail: item.detail
              };
              this.sendingList.splice(index, 1);
              let userInfo = this.findUserInfo(item.owner);
              let messageObj = new ChatMessage().getMessageObjByType(messageData.type, messageData, userInfo);
              //假如是post,需要post file刷新列表
              if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
                this.notificationService.postNotification({
                  act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
                  data: {
                    messageData: messageObj
                  }
                });
              }

              //自己在本浏览器发送消息 直接获取最新消息 并且滚回底部
              if (this.isLoadingByPIN) {
                this.loadMessageByMenuItem(this.currentMenuItem);
                this.hiddenMsgList = [];
              } else {
                if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
                  this.currentMessageList.push(messageObj);
                  this.buildMessageArrForDisplay(data.identity);
                } else {
                  this.hiddenMsgList.push(messageObj);
                }
                this.jumpToNewMessage();
              }
            }
          })
        }
        // 接收人
      } else if (data.hasOwnProperty('owner')) {
        let tmpId = 'friend_form:' + data.form + 'id:' + data.owner;
        if (tmpId === this.currentMenuItem.identity) {
          this.isShowNewMsgNotice = true;
          let userInfo = this.findUserInfo(data.owner);
          let messageObj = new ChatMessage().getMessageObjByType(data.type, data, userInfo);
          //假如是post,需要post file刷新列表
          if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
              data: {
                messageData: messageObj
              }
            });
          }
          if (!this.isLoadingByPIN) {
            if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
              this.pendingMessageForDisplay(messageObj);
              this.currentMessageList.push(messageObj);
              this.buildMessageArrForDisplay(data.identity);
              this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
            } else {
              this.pendingMessageForDisplay(messageObj);
              this.hiddenMsgList.push(messageObj);
            }
          }
        } else if (data.identity === this.currentMenuItem.identity && data.hasOwnProperty('friend')) {
          this.isShowNewMsgNotice = true;
          let userInfo = this.findUserInfo(data.owner);
          let messageObj = new ChatMessage().getMessageObjByType(data.type, data, userInfo);
          //假如是post,需要post file刷新列表
          if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
              data: {
                messageData: messageObj
              }
            });
          }
          if (!this.isLoadingByPIN) {
            if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
              this.pendingMessageForDisplay(messageObj);
              this.currentMessageList.push(messageObj);
              this.buildMessageArrForDisplay(data.identity);
              this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
            } else {
              this.pendingMessageForDisplay(messageObj);
              this.hiddenMsgList.push(messageObj);
            }
          }
        } else {
          this.dealUnreadMessageNumber(data);
          return;
        }
      }
    } else {
      if (data.identity === this.currentMenuItem.identity) {    //群组聊天
        //显示新消息提示
        // 自己在本浏览器
        if (data.hasOwnProperty('sent') && data.hasOwnProperty('token') && this.sendingList.length) {
          this.sendingList.forEach((item: ChatMessage) => {
            if (item.token === data.token) {
              let messageData = {
                time: data.time,
                type: data.type,
                msg_id: data.msg_id,
                send_status: (data.status === 1),
                msg: item.msg,
                owner: item.owner,
                detail: item.detail
              };
              let userInfo = this.findUserInfo(item.owner);
              let messageObj = new ChatMessage().getMessageObjByType(data.type, messageData, userInfo);
              //假如是post,需要post file刷新列表
              if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
                this.notificationService.postNotification({
                  act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
                  data: {
                    messageData: messageObj
                  }
                });
              }

              //自己在本浏览器发送消息 直接获取最新消息 并且滚回底部
              if (this.isLoadingByPIN) {
                this.loadMessageByMenuItem(this.currentMenuItem, this.currentGroupInfo);
                this.hiddenMsgList = [];
              } else {
                if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
                  this.currentMessageList.push(messageObj);
                  this.buildMessageArrForDisplay(data.identity);
                } else {
                  this.hiddenMsgList.push(messageObj);
                }
                this.jumpToNewMessage();
              }
            }
          })
          // 非当前tab
        } else if (data.hasOwnProperty('owner')) {
          this.isShowNewMsgNotice = true;
          if ((this.currentMenuItem.form === 1 && data.owner === this.userDataService.getCurrentUUID())
            || (this.currentMenuItem.form === 2 && data.owner === this.userDataService.getCurrentCompanyPSID())
          ) {
            let userInfo = this.findUserInfo(data.owner);
            let messageObj = new ChatMessage().getMessageObjByType(data.type, data, userInfo);
            //假如是post,需要post file刷新列表
            if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
                data: {
                  messageData: messageObj
                }
              });
            }
            if (!this.isLoadingByPIN) {
              if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
                this.pendingMessageForDisplay(messageObj);
                this.currentMessageList.push(messageObj);
                this.buildMessageArrForDisplay(data.identity);
                this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
              } else {
                this.pendingMessageForDisplay(messageObj);
                this.hiddenMsgList.push(messageObj);
              }
            }
          } else {
            let userInfo = this.findUserInfo(data.owner);
            let messageObj = new ChatMessage().getMessageObjByType(data.type, data, userInfo);
            //假如是post,需要post file刷新列表
            if (messageObj.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FILE,
                data: {
                  messageData: messageObj
                }
              });
            }
            let findReg = new RegExp("(((&|&amp;)lt;)|<)@USER[|](\\S{0,})(((&amp;|&)gt;)|>)", "gm");
            let self = this;
            messageObj.msg.replace(findReg, function (rs, $1, $2, $3, $4): string {
              if ($4 == self.userDataService.getCurrentUUID() || $4 == self.userDataService.getCurrentCompanyPSID()) {
                self.isShowAtMsg = true;
                self.atMsgData.userInfo = userInfo;
                self.atMsgData.messageObj = messageObj;
              }
              return $4;
            });
            if (!this.isLoadingByPIN) {
              if (this.hiddenMsgList.length === 0) {  //没有隐藏的消息的时候直接拼接消息
                this.pendingMessageForDisplay(messageObj);
                this.currentMessageList.push(messageObj);
                this.buildMessageArrForDisplay(data.identity);
                this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
              } else {
                this.pendingMessageForDisplay(messageObj);
                this.hiddenMsgList.push(messageObj);
              }
            }
          }
        }
      }
    }
    clearTimeout(this.showNoticeTimer);
    this.showNoticeTimer = setTimeout(() => {
      this.isShowNewMsgNotice = false;
    }, this.newMsgShowTime)

  }


  /**
   * 读取消息
   * @param loadMenuItem
   * sort 1 历史方向数据， -1 最新方向数据
   * @param groupInfo
   */
  loadMessageByMenuItem(loadMenuItem: ChatMenuList, groupInfo?: any, pinMessageInfo?: any) {
    this.isShowNewMsgNotice = false; //切换聊天频道的时候不显示新消息提示
    // 切换菜单
    this.isFirstLoading = true;
    if (typeof this.currentMenuItem !== 'undefined' && this.currentMenuItem.identity !== loadMenuItem.identity) {
      this.sendingList = [];
      this.currentMessageList = [];
      this.currentDisplayMessageList = [];
      this.hasNewMessage = false;
      if (this.messageInputComponent) {
        this.messageInputComponent.messageData = '';
      }
      this.currentGroupInfo = {};
      if (!this.messageList.hasOwnProperty(loadMenuItem.identity)) {
        this.isToBottom = false;
      }
    }
    // 群聊天
    this.currentMenuItem = loadMenuItem;
    if (!loadMenuItem.isFriend) {
      this.currentGroupInfo = groupInfo;
    } else {
      this.currentGroupInfo = {};
    }

    if (pinMessageInfo) {  //点pin进来获取pin所在的消息包
      this.loadPinMessagePackage(pinMessageInfo);
    } else {
      //检查当前组是否有读取时间记录
      let exist: any;
      if (this.isLoadingByPIN) {
        exist = false;
      } else {
        exist = this.getMessageArray(loadMenuItem.identity)
      }
      let sort: number = 1;
      if (!loadMenuItem.isFriend) {
        // 获取消息列表
        // 检查读取最后一条消息的时间
        let startTime = Date.now();
        this.chatModelService.getUserGroupMessage({
          data: {
            is_mission: loadMenuItem.is_mission,
            gid: loadMenuItem.gid,
            form: loadMenuItem.form,
            sort: sort,
            min_time: exist ? exist.max_time : "",
            max_time: ""
          }
        }, (data: any) => {
          // this.checkScrollTop = false;
          let endTime = Date.now();
          if (data.status === 1) {
            // 加载聊天内容
            this.hasMoreHistoryMessage = true;
            if (!this.messageList.hasOwnProperty(this.currentMenuItem.identity)) {
              this.hasMoreNewMessage = true;
            }
            if (endTime - startTime < 800) {
              setTimeout(() => {
                this.isFirstLoading = false;
                this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
              }, 800 - (endTime - startTime));
            } else {
              this.isFirstLoading = false;
              this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
            }
            this.loadCorrect = true;
            this.mergeChatUserInfo(data.data.users_info);
            this.showMessage(data.data, sort, 'byMenuItem');
          } else {
            this.loadCorrect = false;
          }
        });
        // 个人聊天
      } else if (loadMenuItem.isFriend && loadMenuItem.uid) {
        // 获取消息列表
        let startTime = Date.now();
        this.chatModelService.getUserMessage({
          data: {
            friend: loadMenuItem.uid,
            form: loadMenuItem.form,
            sort: sort,
            min_time: exist ? exist.max_time : "",
            max_time: ""
          }
        }, (data: any) => {
          // this.checkScrollTop = false;
          let endTime = Date.now();
          if (data.status === 1) {
            this.hasMoreHistoryMessage = true;
            if (!this.messageList.hasOwnProperty(this.currentMenuItem.identity)) {
              this.hasMoreNewMessage = true;
            }
            if (endTime - startTime < 800) {
              setTimeout(() => {
                this.isFirstLoading = false;
                this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
              }, 800 - (endTime - startTime));
            } else {
              this.isFirstLoading = false;
              this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
            }
            this.loadCorrect = true;
            // 加载聊天内容
            this.mergeChatUserInfo(data.data.users_info);          // 右侧内容加载
            this.showMessage(data.data, sort, 'byMenuItem');
          } else {
            this.loadCorrect = false;
          }
        });
      }
    }
  }

  /**
   * 查询历史数据 1 => 向上 -1 => 向下
   * @param event
   */
  loadMoreHistoryMessage(event: any, sort: number) {
    if (!this.currentMenuItem) {
      return;
    }
    if (!this.messageList.hasOwnProperty(this.currentMenuItem.identity)) {
      return;
    }
    event.stopPropagation();
    if (sort == -1 && this.hiddenMsgList.length !== 0) {  //向下拉取消息的时候 判断有没有隐藏的消息 如果有直接拼接隐藏消息
      this.isLoadingNew = true;
      this.hasMoreHistoryMessage = true;
      setTimeout(() => {
        if (this.hiddenMsgList.length <= this.maxDisplayMessageLength) {
          this.currentMessageList = this.typeService.clone(this.hiddenMsgList);
          this.messageList[this.currentMenuItem.identity].data = this.currentMessageList;
          this.hiddenMsgList = [];
        } else {
          this.currentMessageList = this.typeService.clone(this.hiddenMsgList.slice(0, this.maxDisplayMessageLength));
          this.messageList[this.currentMenuItem.identity].data = this.currentMessageList;
          this.hiddenMsgList.splice(0, this.maxDisplayMessageLength);
        }
        this.buildMessageArrForDisplay(this.currentMenuItem.identity, sort);
        this.isLoadingNew = false;
        this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
      }, 500)
    } else {
      sort === 1 ? this.isLoadingHistory = true : this.isLoadingNew = true;
      if (!this.currentMenuItem.isFriend) {
        this.chatModelService.getUserGroupMessage({  //拉取群组聊天数据
          data: {
            is_mission: this.currentMenuItem.is_mission,
            gid: this.currentMenuItem.gid,
            form: this.currentMenuItem.form,
            sort: sort,
            min_time: sort === 1 ? "" : this.messageList[this.currentMenuItem.identity].max_time,
            max_time: sort === 1 ? this.messageList[this.currentMenuItem.identity].min_time : "",
          }
        }, (data: any) => {
          // this.checkScrollTop = false;
          if (data.status === 1) {
            this.judgeCanLoadMore(sort, data);
            this.loadCorrect = true;
            // 加载聊天内容
            this.mergeChatUserInfo(data.data.users_info);
            this.showMessage(data.data, sort);
            // 右侧内容加载
          } else {
            this.loadCorrect = false;
          }
        });
      } else {   //拉取个人历史聊天数据
        this.chatModelService.getUserMessage({
          data: {
            friend: this.currentMenuItem.uid,
            form: this.currentMenuItem.form,
            sort: sort,
            min_time: sort === 1 ? "" : this.messageList[this.currentMenuItem.identity].max_time,
            max_time: sort === 1 ? this.messageList[this.currentMenuItem.identity].min_time : "",
          }
        }, (data: any) => {
          // this.checkScrollTop = false;
          if (data.status === 1) {
            this.judgeCanLoadMore(sort, data);
            this.loadCorrect = true;
            // 加载聊天内容
            this.mergeChatUserInfo(data.data.users_info);
            this.showMessage(data.data, sort);
            // 右侧内容加载
          } else {
            this.loadCorrect = false;
          }
        });
      }
    }
  }

  /**
   * 判断是否还有消息可以拉取
   */
  judgeCanLoadMore(sort: number, data: any) {
    sort === 1 ? this.isLoadingHistory = false : this.isLoadingNew = false;
    if (data.data.msg.length === 0) {
      if (sort === 1) {
        this.hasMoreHistoryMessage = false;
      } else if (sort === -1) {
        this.hasMoreNewMessage = false;
      }
    }
  }


  /**
   * 拉取最新消息
   */
  loadNewestMessage() {
    if (!this.currentMenuItem) {
      return;
    }
    if (!this.messageList.hasOwnProperty(this.currentMenuItem.identity)) {
      return;
    }
    let sort = -1;
  }

  /**
   *
   * @param identity
   * @returns {any}
   */
  getMessageArray(identity: any) {
    if (this.messageList && identity && this.messageList.hasOwnProperty(identity)
      && this.messageList[identity].hasOwnProperty('data')) {
      return this.messageList[identity];
    }
    return false;
  }

  /**
   *
   * @param identity
   * @param min_time
   * @param max_time
   * @param cleared
   */
  initMessageListItem(identity: string, min_time?: any, max_time?: any, cleared?: number) {
    this.messageList[identity] = {
      final: cleared ? cleared : 0,
      data: [],
      displayDataObj: [],
      min_time: min_time ? min_time : '',
      max_time: max_time ? max_time : '',
    }
  }

  /**
   * 按照时间、日期、用户、发言间隔小于1分钟合并消息
   * @param messageSource 接口返回的消息数
   * @param sort
   */
  showMessage(messageSource: any, sort: number, param?: any) {
    let messageArr = messageSource.msg;
    let min_time = messageSource.min_time;
    let max_time = messageSource.max_time;
    let cleared = sort === 1 ? messageSource.final : 0;
    if (!this.currentMenuItem) {
      return;
    }
    let loadId = this.currentMenuItem.identity;
    let tmpArr = [];
    let exist = this.getMessageArray(loadId);
    if (!exist || (param && param == 'byPIN')) {
      this.isToBottom = false;
      // 初始化
      this.initMessageListItem(loadId, min_time, max_time, cleared);
    } else {
      tmpArr = this.messageList[loadId].data;
    }
    if (sort === 1) {
      this.messageList[loadId].min_time = min_time !== 0 ? min_time : this.messageList[loadId].min_time;
    } else if (sort === -1) {
      this.messageList[loadId].max_time = max_time !== 0 ? max_time : this.messageList[loadId].max_time;
    }

    // ajax返回有新数据
    if (messageArr && messageArr.length) {
      if (sort > 0) {
        let end = 0;
        let start = messageArr.length - 1;
        if (this.isLoadingByPIN && param === 'byMenuItem') {
          tmpArr = [];
          this.isLoadingByPIN = false;
        }
        // 向上拉取数据 sort = 1  截取数组后面的消息
        let currentMessageCount: number = tmpArr.length + messageArr.length;
        for (let i = start; i >= end; i--) {
          if (messageArr.hasOwnProperty(i)) {
            let userInfo = this.findUserInfo(messageArr[i].owner);
            let msgObj = new ChatMessage().getMessageObjByType(messageArr[i].type, messageArr[i], userInfo);
            //TODO: 现在两个sort返回的顺序一样
            tmpArr.unshift(msgObj);
          }
        }
        let hiddenArr = this.typeService.clone(this.hiddenMsgList);
        this.hiddenMsgList = tmpArr.slice(this.maxDisplayMessageLength, currentMessageCount).concat(hiddenArr);
        let spliceMessageCount: number = currentMessageCount - this.maxDisplayMessageLength;
        if (spliceMessageCount > 0) {
          this.hasMoreNewMessage = true;
          tmpArr.splice(this.maxDisplayMessageLength, spliceMessageCount);
        }
      } else {
        // 向下拉取数据 sort === -1  截取数组前面多余的消息
        let currentMessageCount: number = tmpArr.length + messageArr.length;
        messageArr.reverse();
        messageArr.forEach((info: any) => {
          let userInfo = this.findUserInfo(info.owner);
          let msgObj = new ChatMessage().getMessageObjByType(info.type, info, userInfo);
          tmpArr.push(msgObj);
        })

        let spliceMessageCount: number = currentMessageCount - this.maxDisplayMessageLength;
        if (spliceMessageCount > 0) {
          tmpArr.splice(0, spliceMessageCount);
        }

      }
      this.currentMessageList = tmpArr;
      this.messageList[loadId].data = tmpArr;
      this.buildMessageArrForDisplay(loadId, sort);
    } else if (tmpArr.length > 0) {
      // 有旧数据
      this.currentMessageList = tmpArr;
      this.messageList[loadId].data = tmpArr;
      this.buildMessageArrForDisplay(loadId, sort);
    }
  }

  /**
   * 添加一条新消息 new message系统文本样式
   * @param pendingMsgObj 接收到的新消息，用于判定间隔时间是否大于一分钟
   * @param isSelf 是否为自己发送的消息
   */
  pendingMessageForDisplay(pendingMsgObj: ChatMessage, isSelf?: boolean) {
    let identity = this.currentMenuItem.identity;
    if (!this.messageList[identity]) {
      this.initMessageListItem(identity);
    }
    // 如果上次最后一条消息的时间大于一分钟，并且发送人不同
    // 显示一条系统new message的提示
    let newSystemMessageObj;
    if (!this.hasNewMessage) {
      if ((parseInt(pendingMsgObj.time) - parseInt(this.messageList[identity].max_time) > 60 * 1000)) {
        newSystemMessageObj = new ChatMessage().getMessageObjByType(
          this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM,
          {
            time: parseInt(pendingMsgObj.time) - 1,
            type: this.chatConfig.CHAT_MESSAGE_TYPE_SYSTEM, msg: 'new message',
            detail: {act_type: 5},
            isSelf: isSelf ? isSelf : false
          }
        );
        this.hasNewMessage = true;
        this.currentMessageList.push(newSystemMessageObj);
      }
    }
  }

  /**
   * 根据时间、类型、发送人合并消息分组
   */
  buildMessageArrForDisplay(identity: string, sort?: number, forceInit?: boolean) {
    // 首先按照日期分组
    if (!this.messageList.hasOwnProperty(identity)) {
      this.initMessageListItem(identity);
    }
    // 完全初始化
    for (let i in this.currentMessageList) {
      this.currentMessageList[i]['date'] = this.dateService.formatLocal(this.currentMessageList[i]['time'], 'dS mmm');
      //判断是否是新的一天的数据
      if (parseInt(i) === 0) {
        this.currentMessageList[i]['isFirstMessageByDay'] = true;
      } else if (this.currentMessageList[i].dayInfo !== this.currentMessageList[parseInt(i) - 1].dayInfo) {
        this.currentMessageList[i]['isFirstMessageByDay'] = true;
      } else {
        this.currentMessageList[i]['isFirstMessageByDay'] = false;
      }
      //判断是否是merge的数据
      //  merge规则  只有纯文本消息合并 合并同一个人在一分钟之内发的消息
      if (parseInt(i) !== 0
        && this.currentMessageList[i].minuteInfo === this.currentMessageList[parseInt(i) - 1].minuteInfo
        && this.currentMessageList[i].owner === this.currentMessageList[parseInt(i) - 1].owner
        && this.currentMessageList[i].type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT
        && this.currentMessageList[parseInt(i) - 1].type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT
      ) {
        this.currentMessageList[i]['isMerge'] = true;
      }
      this.currentMessageList[i]['isToggleShow'] = false;
      //判断是否有撤回权限
      if (this.currentMessageList[i].owner == this.userDataService.getCurrentCompanyPSID()
        || this.currentMessageList[i].owner == this.userDataService.getCurrentUUID()
        || this.currentGroupInfo.creator_uid == this.userDataService.getCurrentCompanyPSID()
        || this.currentGroupInfo.creator_uid == this.userDataService.getCurrentUUID()
      ) {
        this.currentMessageList[i]['isAbleRevoke'] = true;
      } else {
        this.currentMessageList[i]['isAbleRevoke'] = false;
      }
    }
    this.refreshCurrentItemTime();
  }


  /**
   * 用户头像等信息初始化
   * @param uid
   * @returns {any}
   */
  findUserInfo(uid: any) {
    if (this.currentChatUserInfo && uid) {
      let count = 0;
      for (let i in this.currentChatUserInfo) {
        count++;
        if (parseInt(this.currentChatUserInfo[i].uid) === parseInt(uid)
          || this.currentChatUserInfo[i].uid.toString() === uid.toString()) {
          return this.currentChatUserInfo[i];
        }
      }
    } else {
    }
    return false;
  }

  /**
   * 单个发送 post消息
   * @param type
   * @param id
   * @param messageData
   */
  sendToGroupOrPersonal(type: number, sendId: string, messageData: any) {
    if (messageData) {
      let msgType = typeof type !== 'undefined' ? type : this.chatConfig.CHAT_MESSAGE_TYPE_TEXT;
      let uid = (this.chatPostForm === '1') ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
      let newMessageData = {msg: messageData, owner: uid, detail: this.postDetail, type: msgType};
      let userInfo = this.findUserInfo(uid);
      let newMessageObj = new ChatMessage().getMessageObjByType(msgType, newMessageData, userInfo);
      newMessageObj.safeMsg = newMessageObj.escapeHtml(newMessageObj.msg);
      if (this.currentPostIsFriend) {
        this.sendingList.push(newMessageObj);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE,
          data: {
            data: this.sendingList,
            friend: sendId,//todo
          }
        });
        this.chatService.sendPersonalMessage({
          form: this.chatPostForm,
          identity: this.currentPostIdentity,
          friend: sendId,//todo
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: this.chatPostDetail,
        })
      } else {
        this.sendingList.push(newMessageObj);
        this.chatService.sendGroupMessage({
          form: this.chatPostForm,
          identity: this.currentPostIdentity,
          gid: sendId,//todo,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: this.chatPostDetail,
        });
      }
    }
  }


  /**
   * 批量发送share to post消息
   * @param type
   * @param sendList
   * @param messageData
   */
  sendToMultipleGroupOrPersonal(type: number, sendList: Array<any>, messageData: any) {
    if (sendList && messageData) {

      let msgType = typeof type !== 'undefined' ? type : this.chatConfig.CHAT_MESSAGE_TYPE_TEXT;
      let uid = (this.chatPostForm === '1') ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
      let newMessageData = {msg: messageData, owner: uid, detail: this.postDetail, type: msgType};
      let userInfo = this.findUserInfo(uid);
      let newMessageObj = new ChatMessage().getMessageObjByType(msgType, newMessageData, userInfo);
      newMessageObj.safeMsg = newMessageObj.escapeHtml(newMessageObj.msg);
      sendList.forEach((sendTo: any, index) => {
        //只有gid
        this.sendingList.push(newMessageObj);
        this.chatService.sendGroupMessage({
          form: this.chatPostForm,
          identity: this.chatPostShareIdentity[index],
          gid: sendTo,//todo,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: this.chatPostDetail,
        });
      });
    }
  }

  /**
   * 单个消息对象
   * @param data
   * @param type
   * @param detail
   * @returns {ChatMessage}
   */
  public buildMessageObj(data: string, type?: number, detail?: any) {
    if (this.currentMenuItem) {
      let msgType = typeof type !== 'undefined' ? type : this.chatConfig.CHAT_MESSAGE_TYPE_TEXT;
      let uid = (this.currentMenuItem.form === 1) ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
      let newMessageData = {msg: data, owner: uid, detail: detail, type: msgType};
      let userInfo = this.findUserInfo(uid);
      let newMessageObj = new ChatMessage().getMessageObjByType(msgType, newMessageData, userInfo);
      newMessageObj.safeMsg = newMessageObj.escapeHtml(newMessageObj.msg);
      return newMessageObj;
    }
  }

  /**
   *
   * @param newMessageObj
   * @param targetGroup
   * @param targetName
   */
  sendShareMessage(newMessageObj: ChatMessage, targetGroup: any, targetName: any) {
    let data: any = newMessageObj.detail;
    let detailToSend = newMessageObj.buildDetailSendTOAPI(this.typeService.clone(data));
    if (parseInt(targetGroup) === this.currentMenuItem.gid) {
      this.sendingList.push(newMessageObj);
    }
    let identity = ChatPost.initIdentity(this.currentMenuItem.form, targetGroup, targetName);
    this.chatService.sendGroupMessage({
      form: this.currentMenuItem.form,
      identity: identity,
      gid: targetGroup,
      type: newMessageObj.type,
      token: newMessageObj.token,
      msg: newMessageObj.msg,
      detail: detailToSend,
    });
  }

  /**
   * 调用IM服务发送消息
   * @param data
   * @param type 消息类型
   * @param detail
   */
  sendMessage(data: string, type?: number, detail?: any) {
    if (this.currentMenuItem) {
      let newMessageObj = this.buildMessageObj(data, type, detail);
      let detailToSend = newMessageObj.buildDetailSendTOAPI(this.typeService.clone(newMessageObj.detail));
      if (this.currentMenuItem.isFriend) {
        this.sendingList.push(newMessageObj);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE,
          data: {
            data: this.sendingList,
            friend: this.currentMenuItem.uid
          }
        });
        this.chatService.sendPersonalMessage({
          form: this.currentMenuItem.form,
          identity: this.currentMenuItem.identity,
          friend: this.currentMenuItem.uid,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: detailToSend,
        })
      } else {
        this.sendingList.push(newMessageObj);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_SYNCHRONIZATION_GROUP_MESSAGE,
          data: {
            data: this.sendingList,
            gid: this.currentMenuItem.gid,
            isMiniDialog: this.isMiniDialog
          }
        });
        this.chatService.sendGroupMessage({
          form: this.currentMenuItem.form,
          identity: this.currentMenuItem.identity,
          gid: this.currentMenuItem.gid,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: detailToSend,
        });
      }
      this.messageInputComponent.messageData = '';
    }
  }

  /**
   * 点击用户头像显示半屏聊天(迷你聊天窗)
   */
  openMiniDialog(data: any) {
    if (!this.currentMenuItem.isFriend) {
      let event: MouseEvent = data[0];
      let memberInfo: any = data[1] ? data[1] : null;
      if (memberInfo.uid === this.userDataService.getCurrentUUID()
        || memberInfo.uid === this.userDataService.getCurrentCompanyPSID()) {
      } else {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
          data: {
            selector: 'bi-mini-dialog',
            options: {
              left: event.clientX,
              top: event.clientY,
              member: memberInfo,
              form: this.currentMenuItem.form
            }
          }
        });
      }
    } else {

    }
  }


  /**
   * 设置消息闹钟
   * @param data
   */
  setMessageAlarm(data: any) {
    if (!data) {
      return;
    }
    let event: MouseEvent = data[0];
    let messageData: ChatMessage = data[1];
    let time: any = data[2];

    let now = new Date();
    now.setSeconds(0);
    let sendTime: any;
    switch (time) {
      // 5 Minutes
      case 1:
        sendTime = now.getTime() + 5 * 60 * 1000;
        break;
      // 10 Minutes
      case 2:
        sendTime = now.getTime() + 10 * 60 * 1000;
        break;
      // 30 Minutes
      case 3:
        sendTime = now.getTime() + 30 * 60 * 1000;
        break;
      // 1 Hour
      case 4:
        sendTime = now.getTime() + 60 * 60 * 1000;
        break;
      // 6 Hours
      case 5:
        sendTime = now.getTime() + 6 * 60 * 60 * 1000;
        break;
      // 1 Day
      case 6:
        sendTime = new Date(now.setDate(now.getDate() + 1)).setHours(9, 0, 0, 0);
        break;
      // 3 Days
      case 7:
        sendTime = new Date(now.setDate(now.getDate() + 3)).setHours(9, 0, 0, 0);
        break;
      // 1 Week
      case 8:
        let day = now.getDay();
        sendTime = new Date(now.getTime() + (8 - day) * 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0);
        break;
    }
    let sendData: any = {
      "uid": messageData.owner,
      "form": AlarmConfig.FORM_CHAT,
      "rid": messageData.msg_id,
      "effective_time": Math.floor(sendTime / 1000),
      "mode": AlarmConfig.MODE_FIX
    };
    if (messageData.hasAlarm) {
      sendData.alarm_id = messageData.alarm_id
    }
    if (!messageData.hasAlarm) {
      //调用添加闹钟接口
      this.alarmModelService.alarmAdd({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          messageData.hasAlarm = true;
          messageData.alarm_id = response.data.alarm_id;
          messageData.alarm_id = response.data.id;
          messageData.effective_time = sendData.effective_time;
          messageData.effective_time_display = messageData.formatAlarmDate(sendData.effective_time);
        }
      });
    } else {
      //调用修改闹钟接口
      this.alarmModelService.alarmUpdate({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          messageData.hasAlarm = true;
          messageData.alarm_id = response.data.id;
          messageData.effective_time = sendData.effective_time;
          messageData.effective_time_display = messageData.formatAlarmDate(sendData.effective_time);
        }
      });
    }

  }

  /**
   * 时间戳转化为字符串
   */
  getDateStr(date: number): string {
    let newDate = new Date(date);
    return this.dateService.formatLocal(newDate, 'yyyy-mm-dd HH:MMtt');
  }

  /**
   * 设置消息pin
   * @param data
   */
  setMessagePin(data: any) {
    if (!data) {
      return;
    }
    let event: MouseEvent = data[0];
    let messageData: ChatMessage = data[1];
    event.stopPropagation();
    let requestData = {
      msg_id: messageData.msg_id,
      form: this.currentMenuItem.form
    };
    if (messageData.hasPin) {
      if (this.currentMenuItem.isFriend) {
        requestData['friend'] = this.currentMenuItem.uid;
      } else {
        requestData['gid'] = this.currentMenuItem.gid;
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
              currentMenu: this.currentMenuItem,
              isMiniDialog: this.isMiniDialog
            },
          });
        }
      });
    } else {
      requestData['msg_time'] = messageData.time;
      if (this.currentMenuItem.isFriend) {
        requestData['friend'] = this.currentMenuItem.uid;
      } else {
        requestData['gid'] = this.currentMenuItem.gid;
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
              currentMenu: this.currentMenuItem,
              isMiniDialog: this.isMiniDialog
            }
          });
        }
      });
    }
  }


  /**
   * 聊天文件或者图片上传
   * @param ele
   */
  setChatFileUpload(ele: any) {
    if (ele.value === '') return;
    for (let i in ele.files) {
      if (ele.files[i].size === 0) {
        let settings = {
          title: 'Notice!',
          simpleContent: ele.files[i].name + this.translateService.manualTranslate(' file size is 0, can not be uploaded.'),
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (ele.files[i].size > this.appConfig.uploadImgSize * 1024 * 1024) {
        this.dialogService.openWarning({
          simpleContent: ele.files[i].name + this.translateService.manualTranslate(' file size too large, limit is ') + this.appConfig.uploadImgSize + 'MB',
        });
        return false;
      }
    }
    let optionData: any = {
      data: ele.files,
      form: this.currentMenuItem.form,
      pdid: this.currentMenuItem.isFriend ? this.currentMenuItem.uid : this.currentMenuItem.gid,
      module: this.currentMenuItem.isFriend ? FolderConstant.MODULE_CHAT_FRIEND_TYPE : FolderConstant.MODULE_CHAT_GROUP_TYPE,
      isChat: true,
      isMiniDialog: this.isMiniDialog,
      currentMenuItem: this.currentMenuItem
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'UPLOAD FILE',
      isSimpleContent: false,
      componentSelector: 'folder-upload',
      componentData: optionData,
      beforeCloseEvent: () => {
        ele.value = ''
      },
      buttons: [
        {
          type: 'cancel',
          btnEvent: () => {
            ele.value = ''
          }
        },
        {
          type: 'send',
          btnText: 'UPLOAD',
          btnEventParam: ele,
          btnEvent: 'uploadMissionOrChatFile'
        }
      ]
    });
  }

  /**
   * 圈人
   * @param data
   */
  setAtUser(data: any) {
    if (!data) {
      return;
    }
    let event = data[0];
    let atMessage: ChatMessage = data[1];
    this.messageInputComponent.manuallyInputAtUser(atMessage.userInfo.work_name);
  }

  /**
   * 弹出文件共享弹窗
   */
  setShareFile(data: any): void {
    let event = data[0];
    let messageData = data[1];
    event.stopPropagation();
    this.dialogService.openNew({
      mode: '1',
      title: 'SHARE FILE',
      isSimpleContent: false,
      componentSelector: 'chat-share-dialog',
      componentData: {
        chatMenuItem: this.currentMenuItem,
        messageData: messageData
      },
      buttons: [{
        type: 'cancel'
      }, {
        type: 'send',
        btnEvent: 'sendData',
      }]
    })
  }


  /**
   * 弹出消息转发弹窗
   * @param data
   */
  setMessageForward(data: any) {
    let event = data[0];
    let forwardMessage: ChatMessage = data[1];
    let isCommonMessage = data[2];
    let channelFormChat = {
      form: this.currentMenuItem.form
    };
    let componentData: any = {
      messageData: forwardMessage,
      channelFormChat: channelFormChat,
      showForward: true,
      isCommonMessage: isCommonMessage
    };

    this.dialogService.openNew({
      mode: '1',
      title: 'FORWARD',
      isSimpleContent: false,
      componentSelector: 'chat-forward-dialog',
      componentData: this.typeService.clone(componentData),
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

  /**
   * 接收到消息转发的内部通知之后向Im发送消息
   * @param data
   */
  dealForwardMessage(message: any) {
    let type = this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD;
    let data = message.messageData.msg;
    if (message.isFile && message.file_info) {
      message.messageData.detail.fid = message.file_info.fid;
      message.messageData.detail.file_name = message.file_info.name;
      message.messageData.detail.ext = message.file_info.ext;
      delete   message.messageData.detail.lastUpdateTemplate;
      if (message.messageData.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
        message.messageData.detail.updated = new Date().getTime() / 1000;
        message.messageData.detail.post_id = message.file_info.post_id;
      }
    }
    //删除多余字段
    delete message.messageData.userInfo.filtered;
    delete message.messageData.userInfo.isHost;
    delete message.messageData.userInfo.isMyself;
    delete message.messageData.userInfo.online;
    delete message.messageData.userInfo.onlineStatusCls;
    delete message.messageData.userInfo.state;
    delete message.messageData.userInfo.user_profile_path;
    let detail = {
      original_msg: {
        msg: message.messageData.msg,
        type: message.messageData.type,
        owner: message.messageData.owner,
        detail: message.messageData.detail,
        msg_id: message.messageData.msg_id,
        user_info: message.messageData.userInfo
      }
    };
    let newMessageObj = this.buildMessageObj(data, type, detail);
    if (newMessageObj) {
      let detailToSend = newMessageObj.buildDetailSendTOAPI(this.typeService.clone(newMessageObj.detail));
      let form = message.forwardMember.form;
      if (message.isForwardFriend) {
        let identity = ChatPost.initFriendId(form, message.forwardMember.id, (form === '1') ?
          this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID()).identity;
        this.sendingList.push(newMessageObj);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE,
          data: {
            data: this.sendingList,
            friend: message.forwardMember.id
          }
        });
        this.chatService.sendPersonalMessage({
          form: form,
          identity: identity,
          friend: message.forwardMember.id,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: newMessageObj.detail,
        })
      } else {
        let identity: string = ChatPost.initIdentity(form, message.forwardMember.id, message.forwardMember.label);
        this.sendingList.push(newMessageObj);
        this.chatService.sendGroupMessage({
          form: form,
          identity: identity,
          gid: message.forwardMember.id,
          type: newMessageObj.type,
          token: newMessageObj.token,
          msg: newMessageObj.msg,
          detail: newMessageObj.detail,
        });
      }
    }
  }


  setAlarmDisplay(data: any) {
    let event: MouseEvent = data[0];
    let alarm: ElementRef = data[1];
    let alarmSelect: ElementRef = data[2];
    let top;
    if (document.documentElement.clientHeight
      - (this.elementService.getPosition(event.target).y - this.myScrollContainer.nativeElement.scrollTop) < 230) {
      top = -157;
    } else {
      top = 16;
    }
    alarm['show'] = !alarm['show'];
    this.renderer.setElementAttribute(alarmSelect, 'style', 'top:' + top + 'px');
  }


  /**
   * 删除闹钟
   * @param event
   */
  deleteAlarm(event: any) {
    this.alarmModelService.alarmDelete({
      data: {
        mode: '2',
        alarm_id: event[1].alarm_id
      }
    }, (response: any) => {
      if (response.status) {
        event[1].hasAlarm = false;
      }
    })
  }

  /**
   * 文件展开菜单选项
   * @param data
   */
  setFileMenuDisplay(data: any) {
    let event: MouseEvent = data[0];
    let menu: ElementRef = data[1];
    let menuSelect: ElementRef = data[2];
    let top;
    if (document.documentElement.clientHeight
      - (this.elementService.getPosition(event.target).y - this.myScrollContainer.nativeElement.scrollTop) < 200) {
      top = '-150px';
    } else {
      top = '100%';
    }
    menuSelect['show'] = !menuSelect['show'];
    this.renderer.setElementAttribute(menuSelect, 'style', 'top:' + top);
  }

  /**
   * dialog 提示设置闹钟成功
   */
  alarmSuccess() {
    let settings = {
      mode: '3',
      title: 'Set alarm',
      isSimpleContent: true,
      simpleContent: 'The alarm was set up successfully',
      buttons: [{
        type: 'ok'
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 用户删除消息
   */
  setMessageRevoke(data: any) {
    let event = data[0];
    let removeMessage: ChatMessage = data[1];
    //检查是否本人和是否群主才可以删除消息
    let uuid = this.userDataService.getCurrentUUID();
    let psid = this.userDataService.getCurrentCompanyPSID();
    if ((parseInt(removeMessage.owner) === parseInt(psid) || removeMessage.owner.toString() === uuid.toString())
      || (!this.currentMenuItem.isFriend
        && (uuid.toString() === this.currentGroupInfo.creator_uid.toString() || parseInt(psid) === parseInt(this.currentGroupInfo.creator_uid))
      )
    ) {
      this.dialogService.openConfirm({simpleContent: 'Are you sure to revoke this message?'}, () => {
        if (this.currentMenuItem.isFriend) {
          this.chatService.revokePersonalMessage({
            form: this.currentMenuItem.form,
            friend: this.currentMenuItem.uid,
            msg_id: removeMessage.msg_id,
            identity: this.currentMenuItem.identity,
          });
        } else {
          this.chatService.revokeGroupMessage({
            form: this.currentMenuItem.form,
            gid: this.currentMenuItem.gid,
            msg_id: removeMessage.msg_id,
            identity: this.currentMenuItem.identity,
          });
        }
      });

    } else {
      this.dialogService.openWarning({simpleContent: 'You could not revoke this message'});
    }
  }

  /**
   * 处理消息
   * @param data
   */
  checkRevokeMessage(data: any) {
    // 不是当前聊天消息的撤回 不用处理
    if (!this.currentMenuItem
      || (this.currentMenuItem && !this.currentMenuItem.isFriend && data.identity !== this.currentMenuItem.identity)
      || (this.currentMenuItem && this.currentMenuItem.isFriend && !data.hasOwnProperty('sent') && this.currentMenuItem.friendIdentity !== data.identity)
    ) {
      return;
    }
    let msgTime = data.time;
    // 超过处理范围
    if (data.hasOwnProperty('friend') && !data.hasOwnProperty('sent')) {
      let identityArr: Array<string> = data.identity.split(':');
      identityArr[this.typeService.getDataLength(identityArr) - 1] = data.owner;
      data.identity = identityArr.join(':');
      // let tmpId = 'friend_form:' + data.form + 'id:' + data.owner;
      if (this.messageList[data.identity].min_time !== '0' && parseInt(msgTime) < parseInt(this.messageList[data.identity].min_time)
        && this.messageList[data.identity].max_time !== '0' && parseInt(msgTime) > parseInt(this.messageList[data.identity].min_time)) {
        return;
      }
    }
    // 私人聊天，自己身份用identity字段识别
    // 对方身份用friendIdentity字段识别
    if (this.currentMenuItem.isFriend) {
      //发送者本人
      if (data.identity === this.currentMenuItem.identity) {
        // 本浏览器
        if (data.hasOwnProperty('sent')) {
          this.currentMessageList.forEach((msgObj: ChatMessage) => {
            if (msgObj.msg_id === data.msg_id) {
              msgObj.status = 0;
              msgObj.revoke_by = this.userDataService.getLoginUserIn().user.work_name;
            }
          });
        } else if (data.hasOwnProperty('owner')) {
          // 非当前tab
          this.currentMessageList.forEach((msgObj: ChatMessage) => {
            if (msgObj.msg_id === data.msg_id) {
              msgObj.status = 0;
              msgObj.revoke_by = this.userDataService.getLoginUserIn().user.work_name;
            }
          });
        }
        // 接收人
      } else if (data.identity === this.currentMenuItem.friendIdentity && data.hasOwnProperty('owner')) {
        this.currentMessageList.forEach((msgObj: ChatMessage) => {
          if (msgObj.msg_id === data.msg_id) {
            msgObj.status = 0;
            let revoke_by = this.findUserInfo(data.owner);
            msgObj.revoke_by = revoke_by ? revoke_by.work_name : '';
          }
        });
      }
    } else {
      if (data.identity === this.currentMenuItem.identity) {
        // 自己在本浏览器
        if (data.hasOwnProperty('sent')) {
          // 非当前tab
          this.currentMessageList.forEach((msgObj: ChatMessage) => {
            if (msgObj.msg_id === data.msg_id) {
              msgObj.status = 0;
              msgObj.revoke_by = this.userDataService.getLoginUserIn().user.work_name;
            }
          });
        } else if (data.hasOwnProperty('owner')) {
          if ((this.currentMenuItem.form === 1 && data.owner === this.userDataService.getCurrentUUID())
            || (this.currentMenuItem.form === 2 && data.owner === this.userDataService.getCurrentCompanyPSID())
          ) {
            this.currentMessageList.forEach((msgObj: ChatMessage) => {
              if (msgObj.msg_id === data.msg_id) {
                msgObj.status = 0;
                msgObj.revoke_by = msgObj.userInfo.work_name;
              }
            });
          } else {
            this.currentMessageList.forEach((msgObj: ChatMessage) => {
              if (msgObj.msg_id === data.msg_id) {
                msgObj.status = 0;
                let revoke_by = this.findUserInfo(data.owner);
                msgObj.revoke_by = revoke_by ? revoke_by.work_name : '';
              }
            });
          }
        }
      }
    }
    this.buildMessageArrForDisplay(data.identity);
  }

  /**
   * 点击评论的文件下载
   */
  downLoadTheFile(event: any, file: any) {
    event.stopPropagation();
    let formData = {
      form: this.currentMenuItem.form,
      fid: file.fid
    };
    this.downloadService.downloadFolderFile(formData);
  }

  /**
   * 系统消息点击查看详情
   */
  clickOpenDetailSystemMessage(event: any, message: ChatMessage): void {
    event.stopPropagation();
    if (message.detail.file_info.isPost) {
      this.openPostDetail(event, message, true);
    } else {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG,
        data: {
          isShowComment: true,
          currentItem: this.currentMenuItem,
          messageData: message,
        }
      });
    }

  }

  /**
   * open post detail
   */
  openPostDetail(event: any, messageData: ChatMessage, showComments?: boolean): void {
    event.stopPropagation();
    let post_id = messageData.detail.file_info.post_id;
    let formData = {
      data: {
        post_id: post_id
      }
    };
    this.chatModelService.getDetailPost(formData, (response: any) => {
      if (response.status === 1) {
        let postSettings = PostSettings.init();
        postSettings = response.data;
        postSettings.mode = 'read';
        postSettings.post_id = post_id;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_POST_SEND_SETTINGS,
          data: {
            postSet: postSettings,
            showComments: showComments,
            currentItem: this.currentMenuItem,
            messageData: messageData
          }
        });

        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_INPUT_NEW_POST,
          data: {
            showPost: true,
            isReadMode: true
          }
        });
      }
    })

  }

  /**
   * 合并聊天人员信息
   */
  mergeChatUserInfo(userInfo: any) {
    for (let i  in userInfo) {
      let count: number = 0;
      for (let k in this.currentChatUserInfo) {
        if (this.currentChatUserInfo[k].uid != userInfo[i].uid) {
          count++;
        }
      }
      if (count === this.currentChatUserInfo.length) {
        this.currentChatUserInfo.push(userInfo[i])
      }
    }
  }

  /**
   * jump pin message
   */
  jumpToTheMessageByPin(message: any) {
    for (let i in this.currentMessageList) {
      if (this.currentMessageList[i].dayInfo === message.pinInfo.messageData.dayInfo) {
        this.currentMessageList[i]['isToggleShow'] = false;
      }
    }
    setTimeout(() => {
      for (let i  in this.msgObj['_results']) {
        if (message.pinInfo.messageData.msg_id === this.msgObj['_results'][i].nativeElement.attributes.msg_id.value) {
          let msgScrollTop = this.myScrollContainer.nativeElement.scrollTop;
          let scrollEnd = this.msgObj['_results'][i].nativeElement.offsetTop - this.myScrollContainer.nativeElement.clientHeight / 2 +
            this.msgObj['_results'][i].nativeElement.offsetHeight / 2;
          if (Math.abs(msgScrollTop - scrollEnd) > 80) {
            if (msgScrollTop > scrollEnd) {
              clearInterval(this.scrollBottomTimer);
              clearInterval(this.scrollUpTimer);
              this.scrollUpTimer = setInterval(() => {
                this.myScrollContainer.nativeElement.scrollTop -= 80;
                if (this.myScrollContainer.nativeElement.scrollTop <= scrollEnd || this.myScrollContainer.nativeElement.scrollTop === 0 ||
                  this.myScrollContainer.nativeElement.scrollTop ===
                  this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight) {
                  clearInterval(this.scrollUpTimer);
                }
              }, 20)
            } else {
              clearInterval(this.scrollUpTimer);
              clearInterval(this.scrollBottomTimer);
              this.scrollBottomTimer = setInterval(() => {
                this.myScrollContainer.nativeElement.scrollTop += 80;
                if (this.myScrollContainer.nativeElement.scrollTop > scrollEnd || this.myScrollContainer.nativeElement.scrollTop === 0 ||
                  this.myScrollContainer.nativeElement.scrollTop
                  === this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.clientHeight) {
                  clearInterval(this.scrollBottomTimer);
                }
              }, 20)
            }
          }
        }
      }
    }, 100);
    this.isLoadingByPIN = true;  //标识是通过 pin load 的消息
    this.isShowNewMsgNotice = true;  //通过pin进来的 顶部显示提示信息 可以跳转至最新消息
    this.isShowAtMsg = false;
  }


  /**
   * pin消息的跳转
   */
  loadPinMessagePackage(message: any) {
    if (message) {
      // 获取消息列表
      this.isFirstLoading = true;
      let startTime = Date.now();
      let sort = 1;
      if (message.currentItem.isFriend) {
        this.chatModelService.getPackageMsg({
          data: {
            friend: message.currentItem.uid,
            sort: sort,
            msg_id: message.pinInfo.messageData.msg_id
          }
        }, (data: any) => {
          let endTime = Date.now();
          if (data.status === 1) {
            this.loadCorrect = true;
            this.hasMoreHistoryMessage = true;
            this.hasMoreNewMessage = true;
            // 加载聊天内容
            this.mergeChatUserInfo(data.data.users_info);          // 右侧内容加载
            this.showMessage(data.data, sort, 'byPIN');
            if (endTime - startTime < 800) {
              setTimeout(() => {
                this.isFirstLoading = false;
              }, 800 - (endTime - startTime));
              setTimeout(() => {
                this.jumpToTheMessageByPin(message);
              }, 1500 - (endTime - startTime))
            } else {
              this.isFirstLoading = false;
              this.jumpToTheMessageByPin(message);
            }
          } else {
            this.loadCorrect = false;
          }
        });
      } else {
        this.chatModelService.getPackageMsg({
          data: {
            gid: message.currentItem.gid,
            sort: sort,
            msg_id: message.pinInfo.messageData.msg_id,
            form: message.currentItem.form
          }
        }, (data: any) => {
          let endTime = Date.now();
          if (data.status === 1) {
            this.loadCorrect = true;
            this.hasMoreHistoryMessage = true;
            this.hasMoreNewMessage = true;
            // 加载聊天内容
            this.mergeChatUserInfo(data.data.users_info);
            this.showMessage(data.data, sort, 'byPIN');
            if (endTime - startTime < 800) {
              setTimeout(() => {
                this.isFirstLoading = false;
              }, 800 - (endTime - startTime));
              setTimeout(() => {
                this.jumpToTheMessageByPin(message);
              }, 1500 - (endTime - startTime))
            } else {
              this.isFirstLoading = false;
              this.jumpToTheMessageByPin(message);
            }
            // 右侧内容加载
          } else {
            this.loadCorrect = false;
          }
        });
      }
    }
  }


  /**
   * importFileFromBI
   */
  setImportFile(response: any) {
    let msgData = response.data.name;
    response.data.file_name = response.data.name;
    response.data.file_type = response.data.ext_type;
    response.data.file_path = response.data.path;
    let msgType: number =
      response.data.ext_type === FolderConstant.FOLDER_TYPE_IMAGE.toLowerCase() ? this.chatConfig.CHAT_MESSAGE_TYPE_IMG : this.chatConfig.CHAT_MESSAGE_TYPE_FILE;
    this.sendMessage(msgData, msgType, response.data);
  }


  /**
   * 关闭新消息提示
   */
  closeNewMsgNotice(event: any, param: string) {
    event.stopPropagation();
    if (param === 'new') {
      this.isShowNewMsgNotice = false;
    } else if (param === 'at') {
      this.isShowAtMsg = false;
    }
  }

  /**
   * 跳转到新消息
   */
  jumpToNewMessage(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.isShowNewMsgNotice = false;
    if (!this.isLoadingByPIN) {
      let hiddenMsgLength = this.hiddenMsgList.length;
      if (hiddenMsgLength === 0) {
        this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
      } else if (hiddenMsgLength < this.maxDisplayMessageLength) {
        this.currentMessageList = this.typeService.clone(this.hiddenMsgList);
        this.messageList[this.currentMenuItem.identity].data = this.currentMessageList;
        this.buildMessageArrForDisplay(this.currentMenuItem.identity);
        this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
        this.refreshCurrentItemTime();  //拉取后重新复制min_time max_time
      } else {
        this.currentMessageList = this.typeService.clone(this.hiddenMsgList.slice(hiddenMsgLength - this.maxDisplayMessageLength, hiddenMsgLength));
        this.messageList[this.currentMenuItem.identity].data = this.currentMessageList;
        this.buildMessageArrForDisplay(this.currentMenuItem.identity);
        this.elementService.scrollBottom(this.myScrollContainer.nativeElement);
        this.refreshCurrentItemTime();  //拉取后重新复制min_time max_time
      }
    } else {
      if (this.currentMenuItem.isFriend) {
        this.loadMessageByMenuItem(this.currentMenuItem)
      } else {
        this.loadMessageByMenuItem(this.currentMenuItem, this.currentGroupInfo);
      }
    }
    this.hiddenMsgList = [];
    this.hasMoreHistoryMessage = true;
  }


  /**
   * 重新赋值当前聊天channel的 min 和 max 时间
   */
  refreshCurrentItemTime() {
    this.messageList[this.currentMenuItem.identity].max_time = this.currentMessageList[this.currentMessageList.length - 1].time;
    this.messageList[this.currentMenuItem.identity].min_time = this.currentMessageList[0].time;
  }


  /**
   * toggleMessageByDay 点击天收缩隐藏
   */

  toggleMessageByDay(event: any, data: any) {
    event.stopPropagation();
    for (let i in this.currentMessageList) {
      if (this.currentMessageList[i]['date'] === data) {
        this.currentMessageList[i]['isToggleShow'] = !this.currentMessageList[i]['isToggleShow'];
      }
    }
  }

  /**
   * 点击 @ 消息提示  跳转至@消息
   */
  jumpToAtMessage(event: any, messageData: any) {
    event.stopPropagation();
    let pinMsgTimestamp: number = messageData.messageObj.time;
    let message: any = {
      pinInfo: {
        messageData: messageData.messageObj
      },
      currentItem: this.currentMenuItem
    };
    if (pinMsgTimestamp <= parseInt(this.messageList[this.currentMenuItem.identity].max_time)
      && pinMsgTimestamp >= parseInt(this.messageList[this.currentMenuItem.identity].min_time)) {
      this.jumpToTheMessageByPin(message);  //pin在当前已经显示的消息里面
    } else {
      this.loadPinMessagePackage(message);  //pin不在当前已经显示的Pin消息里面
    }
  }


}