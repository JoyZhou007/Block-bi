import {
  Component, Inject, Input, OnInit, ViewChild, ElementRef, Renderer, AfterViewChecked,
  AfterViewInit, OnDestroy
} from '@angular/core';
import {NotificationDataService} from '../../../shared/services/index.service';
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {UserModelService} from "../../../shared/services/model/user-model.service";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatConfig} from "../../../shared/config/chat.config";
import {ChatMessage, ChatMenuList, ChatUserInfo, ChatPost} from "../../../shared/services/model/entity/chat-entity";
import * as MissionConstant from '../../../shared/config/mission.config';
import {Router} from "@angular/router";
import {AlarmModelService} from "../../../shared/services/model/alarm-model.service";
import {Subscription} from "rxjs/Subscription";
import * as FolderConstant from '../../../shared/config/folder.config';
import {DownloadService} from "../../../shared/services/common/file/download.service";
import {FolderModelService} from "../../../shared/services/model/folder-model.service";
import * as userConstant from "../../../shared/config/user.config"

@Component({
  selector: 'chat-mini-dialog',
  templateUrl: '../../template/dialog/chat-mini-dialog.component.html',
  styleUrls: ['../../../../assets/css/chat/chat-new.css'],
  providers: [ContactModelService, AlarmModelService]
})

export class ChatMiniDialogComponent implements OnInit,AfterViewChecked, AfterViewInit, OnDestroy {

  public isShowConnectBtn: boolean = false;
  public optionData: any = {};
  public isStartMove: any;
  private _ox: number;
  private _oy: number;
  private userData: any;
  public memberInfo: any = {}; //聊天对方的信息
  public isFriendRelation: boolean; //判断是否是好友
  public hasInit: boolean; //是否初始化结束
  public isShowMiniDialog: boolean = false; //是否显示半屏聊天框
  public statusClass: string; //状态的class
  public chatConfig: ChatConfig = new ChatConfig();
  public messageArr: Array<any> = [];
  public currentMessageList: Array<ChatMessage> = [];
  private currentPage: number = 1;
  private isLoading: boolean = false;
  private bindPagingEvent: boolean = false;
  public currentDisplayMessageList: Array<{day: string, messageList: Array<ChatMessage>}> = [];
  public tplLoadingDetailClass: string = MissionConstant.MISSION_LOADING_CLASS;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public loadEnd: boolean = false;
  private currentMenuItem: ChatMenuList;
  private isFirstLoad: boolean;
  private isShowChatContent: boolean = false;

  @ViewChild('messageScroll') public messageScrollEl: any;
  @ViewChild('chatHeaderImage') public chatHeaderImage: any;

  @ViewChild('minDialog') public minDialog: ElementRef;
  private maxTime: number;
  private minTime: number;
  private sendingList: Array<any> = [];
  public subscription: Subscription;
  public currentChatUserInfo: Array<ChatUserInfo> = [];
  private fileList: Array<any> = [];
  public chatUserInfo: any = {};
  public memberInfoImage: string;
  public isChatMiniHeight: boolean = false;
  public trim: any;
  private isShowHireBtn: boolean;
  public userConstant = userConstant;
  public showStates: boolean = false;

  public USER_STATE_ONLINE: number = 1;
  public USER_STATE_OFFLINE: number = 0;

  constructor(@Inject('app.config') public config: any,
              @Inject('file.service') public fileService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('im.service') public chatService: any,
              @Inject('page.element') public elementService: any,
              public folderModelService: FolderModelService,
              public downloadService: DownloadService,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('page.element') public pageElement: any,
              public alarmModelService: AlarmModelService,
              public router: Router,
              public contactModelService: ContactModelService,
              public notificationDataService: NotificationDataService,
              public el: ElementRef,
              public userService: UserModelService,
              public chatModelService: ChatModelService,
              public renderer: Renderer) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.messageScrollEl) {
      let element = this.messageScrollEl.nativeElement;
      if (!this.bindPagingEvent && element) {
        this.mouseWheelFunc(element);
        this.bindPagingEvent = true;
      }
    }
  }

  ngAfterViewInit(): void {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        if (this.isShowMiniDialog) {
          this.dealMessage(message);
        }
      });
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_SYSTEM_IM_LOGOUT:
        this.isShowMiniDialog = false;
        this.isShowConnectBtn = false;
        break;
      case this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE:
        if (data.data.hasOwnProperty('friend') && data.data.friend === this.memberInfo.uid) {
          this.sendingList = this.typeService.clone(data.data.data);
        }
        break;
      case  this.notificationService.config.ACT_CHAT_SEND_MESSAGE:
        if (this.isShowMiniDialog && this.pageElement) {
          this.pendingNewMessage(data.data);
        }
        break;
      //撤回消息
      case this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE:
        if (data.hasOwnProperty('status')) {
          this.checkRevokeMessage(data.data);
        }
        break;
      //同步pin
      case this.notificationService.config.ACT_COMPONENT_CHAT_PIN_REFRESH:
        if (data.data.hasOwnProperty('module') && data.data.hasOwnProperty('currentMenu')
          && (data.data.module === 'pin' || data.data.module === 'message') && data.data.currentMenu
          && data.data.currentMenu.identity === this.currentMenuItem.identity) {
          this.synchronizationPin(data.data);
        }
        break;
      case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
        if (this.memberInfo
          && data.data.hasOwnProperty('friend')
          && ((data.data.friend.hasOwnProperty('uuid') && this.memberInfo.uid === data.data.friend.uuid)
          || (data.data.friend.hasOwnProperty('psid') && this.memberInfo.uid == data.data.friend.psid))
        ) {
          this.memberInfo.state = data.data.friend.state;
          this.memberInfo.online = data.data.friend.online;
          this.getStatusClass();
        }
        break;
    }
  }


  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //标准浏览器
    ele.addEventListener('mousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.messageScrollEl.nativeElement.scrollTop === 0 && !this.isLoading) {
        if (this.optionData.isInMail && this.currentPage !== -1) {
          this.currentPage++;
          this.fetchInMailList();
        } else if (!this.optionData.isInMail && !this.loadEnd) {
          this.loadPersonalMessage();
        }
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail < 0 && this.messageScrollEl.nativeElement.scrollTop === 0 && !this.isLoading) {
        if (this.optionData.isInMail && this.currentPage !== -1) {
          this.currentPage++;
          this.fetchInMailList();
        } else if (!this.optionData.isInMail && !this.loadEnd) {
          this.loadPersonalMessage();
        }
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.messageScrollEl.nativeElement.scrollTop === 0 && !this.isLoading) {
        if (this.optionData.isInMail && this.currentPage !== -1) {
          this.currentPage++;
          this.fetchInMailList();
        } else if (!this.optionData.isInMail && !this.loadEnd) {
          this.loadPersonalMessage();
        }
      }
    });
  }


  /**
   * 设置参数
   * @param optionData
   */
  setOptionData(optionData: any) {
    this.getUserIn();
    if (optionData && optionData.member) {
      this.optionData = optionData;
      this.optionData.member.form = this.optionData.form;
      this.memberInfo = this.typeService.clone(optionData.member);
      this.getMemberStatus();
      this.showStates = !!this.typeService.isNumber(this.memberInfo.uid);
      this.isLoading = false;
      this.isShowHireBtn = false;
      this.currentPage = 1;
      this.messageArr = [];
      this.currentMessageList = [];
      this.loadEnd = false;
      this.maxTime = 0;
      this.minTime = 0;
      this.isFirstLoad = true;
      this.bindPagingEvent = false;
      if (this.optionData.isInMail) {
        this.isFriendRelation = true;
        this.setDialogPosition();
        this.fetchInMailList();
        this.getChatUserInfo();
        this.isChatMiniHeight = true;
        this.isShowChatContent = true;
      } else {
        this.getChatUserInfo(true);
        this.checkIsHasHirePermission();
        this.isShowChatContent = false;
        this.currentMenuItem = new ChatMenuList();
        this.currentMenuItem.isFriend = true;
        this.currentMenuItem.uid = this.memberInfo.uid;
        this.currentMenuItem.form = this.optionData.form;
        let selfID = this.optionData.form === 1 ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
        this.currentMenuItem.initIdentity(selfID);
      }
    }
  }


  /**
   * 检测是否有hire权限
   */
  checkIsHasHirePermission() {
    //判断对方是uuid 还是 pisd;
    let isPsid = this.typeService.isNumber(this.memberInfo.uid);
    if (isPsid) {
      this.isShowHireBtn = false;
    } else {
      this.contactModelService.isHireUsers({
        uid: this.memberInfo.uid
      }, (res: any) => {
        if (res.status === 1) {
          this.isShowHireBtn = (res.data.hired == 1);
        } else {
          this.dialogService.openWarning({simpleContent: 'check user permission failed!'});
        }
      });
    }
  }


  /**
   * 检测对方在线
   */
  getMemberStatus() {
    if (!this.memberInfo.hasOwnProperty('online') || this.memberInfo.online === -1) {
      let uid = this.memberInfo.uid;
      this.userService.getOnlineStatus({
        uid
      }, (response: any) => {
        if (response.status === 1) {
          this.memberInfo.online = response.data.online;
          this.memberInfo.state = response.data.state;
          this.getStatusClass();
        }
      });
    } else {
      this.getStatusClass();
    }
  }

  //获取相应的类名
  getStatusClass() {
    switch (this.memberInfo.online) {
      case 0:
        this.statusClass = 'icon-circle-offline';
        break;
      case 1:
        this.statusClass = 'icon-circle-online';
        break;
    }
  }


  /**
   * 转化用户头像尺寸
   * @param profilePath
   */
  setUserPhoto(profilePath: string) {
    this.memberInfo.user_profile_path = this.fileService.getImagePath(380, profilePath);
    this.memberInfoImage = this.memberInfo && this.memberInfo.hasOwnProperty('user_profile_path') && this.memberInfo.user_profile_path !== '' ?
      this.config.resourceFolderDomain + this.memberInfo.user_profile_path : '';
    this.chatHeaderImage.nativeElement.setAttribute('style', 'background-image:url(' + (this.memberInfoImage) + ')');
  }

  /**
   * 获取用户信息
   */
  getChatUserInfo(bool?: boolean) {
    this.contactModelService.getUserInfo({
      uid: this.memberInfo.uid
    }, (response: any) => {
      if (response.status === 1) {
        if (!response.data.work_name) {
          this.dialogService.openWarning({simpleContent: 'fetch user info failed!'})
        } else {
          this.chatUserInfo = response.data;
          this.setUserPhoto(response.data.user_profile_path);
          if (bool) {
            this.checkIsFriend();
          }
        }
      }else {
        this.dialogService.openWarning({simpleContent: 'fetch user info failed!'})
      }
    });
  }


  /**
   * 检查是否是好友
   */
  checkIsFriend() {
    let data = {
      user: {
        uuid: this.optionData.member.form === 1 ? this.optionData.member.uid : '',
        psid: this.optionData.member.form === 2 ? this.optionData.member.uid : ''
      },
      friend: {
        uuid: this.userData.user.uuid,
        psid: this.userDataService.getCurrentCompanyPSID() ? this.userDataService.getCurrentCompanyPSID() : ''
      }
    };
    this.contactModelService.checkRelation({
      data
    }, (res: any) => {
      if (res.status === 1) {
        if ((res.data.IsCompanyColleague || res.data.IsCooperatorFriend) && this.optionData.member.form === 2) {
          this.isFriendRelation = true;
        } else if (res.data.IsPrivateFriend && this.optionData.member.form === 1) {
          this.isFriendRelation = true;
        } else {
          this.isFriendRelation = false;
        }
        this.setDialogPosition();
        if (this.isFriendRelation) {
          this.loadPersonalMessage();
        }
      }
    });
  }

  /**
   * 点击聊天框开始此人聊天
   */
  chatWithThePerson(event: any) {
    event.stopPropagation();
    if (!this.isShowChatContent) {
      this.isShowChatContent = true;
      clearTimeout(this.trim);
      this.isChatMiniHeight = true;
    }
  }

  /**
   *显示迷你聊天窗
   */
  setDialogPosition() {
    if (this.minDialog) {
      this.isShowMiniDialog = true;
    }
  }

  tabUserInfo(event: any) {
    event.stopPropagation();
    clearTimeout(this.trim);
    this.trim = setTimeout(() => {
      this.isChatMiniHeight = false;
      this.isShowChatContent = false;
    }, 500);
  }


  /**
   * 点击+号添加好友
   */
  connectGroupMember(event: any) {
    event.stopPropagation();
    this.isShowConnectBtn = true;
  }

//鼠标按下 图片
  mouseDownEvent(event: any) {
    let resX: number;
    let resY: number;
    document.ondragstart = function () {
      return false;
    };
    if (event.which === 1) {
      this._ox = event.clientX;
      this._oy = event.clientY;
      this.isStartMove = true;
      resX = this.pageElement.getElementVal(this.minDialog.nativeElement, 'left');
      resY = this.pageElement.getElementVal(this.minDialog.nativeElement, 'top');
      document.onmousemove = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.isStartMove) {
          let _cx = event.clientX;
          let _cy = event.clientY;
          this.renderer.setElementStyle(this.minDialog.nativeElement, 'left', (_cx - this._ox + resX) + 'px');
          this.renderer.setElementStyle(this.minDialog.nativeElement, 'top', (_cy - this._oy + resY) + 'px');
        }
      };
      document.onmouseup = (event: any) => {
        event.stopPropagation();
        this.isStartMove = false;
        document.onmousemove = null;
      };
    } else {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }


  /**
   * 关闭半屏聊天框
   */
  closeMiniDialog(event?: any) {
    if(event) {
      event.stopPropagation();
    }
    this.isShowMiniDialog = false;
    this.isShowConnectBtn = false;
    clearTimeout(this.trim);
    this.trim = {};
  }


  /**
   * 添加好友
   * @param member
   * @param event
   */
  addFriend(member: any, event: any) {
    if (member.form === 1) {
      member.uuid = member.uid;
      let relationship: any = {};
      relationship.company = false;
      member.relationship = relationship;
    } else if (member.form === 2) {
      member.psid = member.uid;
      member.company_name = this.chatUserInfo.company_name;
      member.p_name = this.chatUserInfo.position;
      let relationship: any = {};
      relationship.company = true;
      member.relationship = relationship;
    }
    let memberInfo = this.typeService.clone(member);
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'NEW CONTACT',
      isSimpleContent: false,
      componentSelector: 'new-contact',
      componentData: memberInfo,
      buttons: [{type: 'cancel'}, {btnEvent: 'sendFriendRequest'}]
    };
    this.dialogService.openNew(settings);
    this.isShowConnectBtn = false;
    this.closeMiniDialog();
  }


  /**
   * 发送 hire
   */
  hirePerson() {
    let memberInfo = this.typeService.clone(this.memberInfo);
    let settings = {
      mode: '1',
      title: 'HIRE',
      isSimpleContent: false,
      componentSelector: 'hire-contact',
      componentData: memberInfo,
      buttons: [{type: 'cancel'}, {btnEvent: 'sendHireRequest'}]
    };
    this.dialogService.openNew(settings);
    this.isShowConnectBtn = false;
  }


  /**
   * 获取当前用户信息
   */
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

  /**
   * 获取站内信
   */
  fetchInMailList() {
    this.isLoading = true;
    this.chatModelService.fetchInMailChannel({
      data: {
        uid: this.memberInfo.uid,
        time: '',
        page: this.currentPage
      }
    }, (response) => {
      this.isLoading = false;
      if (response.status === 1) {
        this.currentPage = response.data.length < 20 ? -1 : this.currentPage;
        let a: Array<any> = this.typeService.clone(this.messageArr);
        if (Array.isArray(response.data)) {
          response.data.reverse();
          let b: Array<any> = response.data.concat(a);
          this.messageArr = this.typeService.clone(b);
          this.dealMiniDialogMessage(this.messageArr);
        }
      } else {
        this.dialogService.openError({
          mode: '3',
          title: 'Error',
          simpleContent: response.message
        })
      }
    });
  }

  /**
   * 处理message
   */
  dealMiniDialogMessage(messageList: Array < any >) {
    this.currentMessageList = [];
    for (let i in messageList) {
      if (messageList[i] && messageList[i].hasOwnProperty('_id')) {
        messageList[i].msg_id = messageList[i]._id;
      }
      let userInfo = (messageList[i].owner == this.userDataService.getCurrentUUID() || messageList[i].owner == this.userDataService.getCurrentCompanyPSID()) ? this.userData.user : this.memberInfo;
      messageList[i]['time'] = messageList[i]['time'] ? messageList[i]['time'] : messageList[i]['inserted'];
      let msgObj = new ChatMessage().getMessageObjByType(messageList[i].type, messageList[i], userInfo);
      msgObj.analyseMessageText(this.currentChatUserInfo);
      this.currentMessageList.push(msgObj);
    }
    this.buildMessageArrForDisplay();
  }


  /**
   * 根据时间、类型、发送人合并消息分组
   */
  buildMessageArrForDisplay() {
    // 首先按照日期分组
    // 完全初始化
    for (let i in this.currentMessageList) {
      this.currentMessageList[i]['date'] = this.dateService.formatLocal(this.currentMessageList[i]['time'], 'dS mmm');
      //判断是否是新的一天的数据
      if (parseInt(i) === 0) {
        this.currentMessageList[i]['isFirstMessageByDay'] = true;
      } else if (this.currentMessageList[i].dayInfo !== this.currentMessageList[parseInt(i) - 1].dayInfo) {
        this.currentMessageList[i]['isFirstMessageByDay'] = true;
      }
      //判断是否是merge的数据
      //  merge规则  只有纯文本消息合并 合并同一个人在一分钟之内发的消息
      if (parseInt(i) !== 0
        && this.currentMessageList[i].minuteInfo === this.currentMessageList[parseInt(i) - 1].minuteInfo
        && this.currentMessageList[i].owner === this.currentMessageList[parseInt(i) - 1].owner
        && this.currentMessageList[i].type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT) {
        this.currentMessageList[i]['isMerge'] = true;
      }
      if (this.currentMessageList[i].owner == this.userDataService.getCurrentUUID()
        || this.currentMessageList[i].owner == this.userDataService.getCurrentCompanyPSID()
      ) {
        this.currentMessageList[i]['isAbleRevoke'] = true;
      } else {
        this.currentMessageList[i]['isAbleRevoke'] = false;
      }
    }
    //第一次加载消息滚动条在最底部
    if (this.isFirstLoad && this.messageScrollEl) {
      this.pageElement.scrollBottom(this.messageScrollEl.nativeElement);
      this.isFirstLoad = false;
    }
  }


  /**
   * 站内信发送纯文本信息
   * @param sendMsg
   */
  sendMessage(sendMsg: any, type?: number, detail?: any) {
    if (this.optionData.isInMail) {
      //发送站内信 调用API接口
      let data = {
        msg: sendMsg,
        type: this.chatConfig.CHAT_MESSAGE_TYPE_TEXT,  //1是纯文本
        to: this.memberInfo.uid
      };
      this.chatModelService.inMailSend({
        data
      }, (response) => {
        if (response.status === 1) {
          //将自己的消息拼接进去
          let inMailMsgObj: any = {
            owner: this.userDataService.getCurrentUUID(),
            inserted: new Date().getTime(),
            msg: sendMsg,
            type: this.chatConfig.CHAT_MESSAGE_TYPE_TEXT,
            flag: 0,
            to: this.memberInfo.uid,
            _id: new Date()
          };
          this.messageArr.push(inMailMsgObj);
          this.dealMiniDialogMessage(this.messageArr);
          this.pageElement.scrollBottom(this.messageScrollEl.nativeElement);
        } else {
          this.dialogService.openError({
            mode: '3',
            title: 'Error',
            simpleContent: 'send message failed!'
          })
        }
      });
    } else {
      //个人聊天向IM发送
      let msgType: number = typeof type !== 'undefined' ? type : this.chatConfig.CHAT_MESSAGE_TYPE_TEXT;
      let uid = (this.optionData.form === 1) ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
      let newMessageData = {msg: sendMsg, owner: uid, detail: detail, type: msgType};
      let userInfo = this.userData.user;
      let newMessageObj = new ChatMessage().getMessageObjByType(msgType, newMessageData, userInfo);
      newMessageObj.analyseMessageText(this.currentChatUserInfo);
      newMessageObj.safeMsg = newMessageObj.escapeHtml(newMessageObj.msg);
      this.sendingList.push(newMessageObj);
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_SYNCHRONIZATION_PERSONAL_MESSAGE_MINI,
        data: {
          data: this.typeService.clone(this.sendingList),
          friend: this.memberInfo.uid
        }
      });
      this.chatService.sendPersonalMessage({
        form: this.optionData.form,
        identity: this.currentMenuItem.identity,
        msg: newMessageObj.msg,
        friend: this.memberInfo.uid,
        type: newMessageObj.type,
        token: newMessageObj.token,
        detail: newMessageObj.detail
      })
    }
  }


  /**
   * 获取个人聊天记录
   */
  loadPersonalMessage() {
    // 获取消息列表
    this.isLoading = true;
    let sort: number = 1;
    this.chatModelService.getUserMessage({
      data: {
        friend: this.memberInfo.uid,
        form: this.optionData.form,
        sort: sort,
        min_time: "",
        max_time: this.minTime ? this.minTime : ''
      }
    }, (response: any) => {
      this.isLoading = false;
      if (response.data && response.data.msg && response.data.msg.length === 0) {
        this.loadEnd = true;
      }
      if (response.status === 1) {
        this.mergeChatUserInfo(response.data.users_info);
        this.maxTime = response.data.max_time;
        this.minTime = response.data.min_time;
        let a: Array<any> = this.typeService.clone(this.messageArr);
        let b: Array<any> = response.data.msg.concat(a);
        this.messageArr = this.typeService.clone(b);
        this.dealMiniDialogMessage(this.messageArr);
      } else {
        this.dialogService.openError({
          simpleContent: response.message
        })
      }
    });
  }


  /**
   * 处理个人聊天新消息
   */
  pendingNewMessage(message: any) {
    let utcTime = new Date(message.time).toUTCString();
    message.showTime = this.dateService.formatWithTimezone(utcTime, 'HH:MMtt');
    if (message.hasOwnProperty('sent') && message.sent === 1) {
      this.sendingList.forEach((item: ChatMessage, index: number) => {
        if (item.token === message.token && !message.hasOwnProperty('gid') && message.hasOwnProperty('friend') && message.friend === this.memberInfo.uid) {
          let messageData = {
            time: message.time,
            type: message.type,
            msg_id: message.msg_id,
            send_status: (message.status === 1),
            msg: item.msg,
            owner: item.owner,
            detail: item.detail
          };
          this.sendingList.splice(index, 1);
          let userInfo = this.userData.user;
          let messageObj = new ChatMessage().getMessageObjByType(messageData.type, messageData, userInfo);
          messageObj.analyseMessageText(this.currentChatUserInfo);
          this.messageArr.push(messageObj);
          this.currentMessageList.push(messageObj);
          this.buildMessageArrForDisplay();
        }
      });
    } else if (message.hasOwnProperty('owner') && message.hasOwnProperty('identity') && message.identity === this.currentMenuItem.friendIdentity) {
      let userInfo = this.memberInfo;
      let messageObj = new ChatMessage().getMessageObjByType(message.type, message, userInfo);
      messageObj.analyseMessageText(this.currentChatUserInfo);
      this.messageArr.push(messageObj);
      this.currentMessageList.push(messageObj);
      this.buildMessageArrForDisplay();
    }
    if (this.messageScrollEl) {
      this.pageElement.scrollBottom(this.messageScrollEl.nativeElement);
    }
  }

  /**
   *
   * @param event
   * @param memberInfo
   */
  redirectToProfile(event: any, memberInfo: any) {
    if (memberInfo && memberInfo.hasOwnProperty('uid')) {
      event.stopPropagation();
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG,
      });
      this.router.navigate(['contacts/info/general', memberInfo.uid]);

    }
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
              module: 'mini-dialog',
              messageData: messageData,
              currentMenu: this.currentMenuItem
            }
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
              module: 'mini-dialog',
              messageData: messageData,
              currentMenu: this.currentMenuItem
            }
          });
        }
      });
    }
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
    ) {
      this.dialogService.openConfirm({simpleContent: 'Are you sure to revoke this message?'}, () => {
        if (this.currentMenuItem.isFriend) {
          this.chatService.revokePersonalMessage({
            form: this.currentMenuItem.form,
            friend: this.currentMenuItem.uid,
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
    if (this.minTime !== 0 && parseInt(msgTime) < this.minTime
      && this.maxTime !== 0 && parseInt(msgTime) > this.minTime) {
      return;
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
            if (data.owner === this.userDataService.getCurrentCompanyPSID() || data.owner === this.userDataService.getCurrentUUID()) {
              msgObj.revoke_by = this.userDataService.getLoginUserIn().user.work_name;
            } else {
              msgObj.revoke_by = this.memberInfo.work_name;
            }
          }
        });
      }
    }
    this.buildMessageArrForDisplay();
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
   * 闹钟
   */
  setAlarmDisplay(data: any) {
    let event: MouseEvent = data[0];
    let alarm: ElementRef = data[1];
    let alarmSelect: ElementRef = data[2];
    let top;
    if (document.documentElement.clientHeight
      - (this.elementService.getPosition(event.target).y - this.messageScrollEl.nativeElement.scrollTop) < 381) {
      top = -157;
    } else {
      top = 16;
    }
    alarm['show'] = !alarm['show'];
    this.renderer.setElementAttribute(alarmSelect, 'style', 'top:' + top + 'px');
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
      "form": "2",
      "rid": messageData.msg_id,
      "effective_time": Math.floor(sendTime / 1000),
      "mode": '2'
    };
    if (messageData.hasAlarm) {
      sendData.alarm_id = messageData.alarm_id;
    }
    if (!messageData.hasAlarm) {
      //调用添加闹钟接口
      this.alarmModelService.alarmAdd({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          messageData.hasAlarm = true;
          messageData.effective_time = sendData.effective_time;
          messageData.effective_time_display = messageData.formatAlarmDate(sendData.effective_time);
        }
      });
    } else {
      //调用添加闹钟接口
      this.alarmModelService.alarmUpdate({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          messageData.hasAlarm = true;
          messageData.effective_time = sendData.effective_time;
          messageData.effective_time_display = messageData.formatAlarmDate(sendData.effective_time);
        }
      });
    }

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
   * 文件展开菜单选项
   * @param data
   */
  setFileMenuDisplay(data: any) {
    let event: MouseEvent = data[0];
    let menu: ElementRef = data[1];
    let menuSelect: ElementRef = data[2];
    let top;
    if (document.documentElement.clientHeight
      - (this.elementService.getPosition(event.target).y - this.messageScrollEl.nativeElement.scrollTop) < 200) {
      top = '-150px';
    } else {
      top = '100%';
    }
    menuSelect['show'] = !menuSelect['show'];
    this.renderer.setElementAttribute(menuSelect, 'style', 'top:' + top);
  }

  /**
   *从主聊天窗同步pin
   */
  synchronizationPin(data: any) {
    let changeMessage = data.messageData;
    if (changeMessage.time > this.currentMessageList[this.currentMessageList.length - 1].time ||
      changeMessage.time < this.currentMessageList[0].time) {
      return;
    } else {
      this.currentMessageList.forEach((message: any) => {
        if (message.msg_id === changeMessage.msg_id) {
          message.hasPin = !message.hasPin;
        }
      })
    }
  }


  /**
   * 聊天文件或者图片上传
   * @param fileInput
   */
  setChatFileUpload(fileInput: any) {
    this.fileList = [];
    for (let value of fileInput.files) {
      this.fileList.push(value);
    }
    this.fileList.forEach((value) => {
      let self = this;
      let reader: FileReader = new FileReader();
      reader.onload = function (oFREvent: any) {
        value.fileSrc = oFREvent.target.result;
        if (value.size === 0) {
          let settings = {
            mode: '3',
            title: 'Notice',
            isSimpleContent: true,
            simpleContent: value.fileName + ' 的文件大小为OKB,不能上传！',
          };
          self.dialogService.openNew(settings);
        } else {
          self.doUploadChatFile(value);
        }
      };
      //截取文件名 (去掉后缀名)
      let index1 = value.name.lastIndexOf(".");
      value.fileName = value.name.substring(0, index1);//截取完后缀的文件名字
      value.fileSuffix = value.name.substring(index1 + 1, value.name.length);//后缀名
      //获取文件的大小
      value.fileSize = value.size;
      reader.readAsDataURL(value)
    });
  }


  /**
   * 调用聊天上传文件/图片的接口
   */
  doUploadChatFile(file: any) {
    //做成与后端交互的数据对象
    let data: any = {};
    if (this.currentMenuItem.isFriend) {
      data.module = FolderConstant.MODULE_CHAT_FRIEND_TYPE,
        data.id = this.currentMenuItem.uid,
        data.file = file,
        data.form = this.currentMenuItem.form
    } else {
      data.module = FolderConstant.MODULE_CHAT_GROUP_TYPE,
        data.id = this.currentMenuItem.gid,
        data.file = file,
        data.form = this.currentMenuItem.form
    }
    this.folderModelService.fileUpload({
      module: data.module,
      id: data.id,
      file: data.file,
      form: data.form,
    }, (response: any) => {
      if (response.status === 1) {
        let msgData = response.data.name;
        response.data.file_name = response.data.name;
        response.data.file_type = response.data.ext_type;
        response.data.file_path = response.data.path;
        let msgType: number =
          response.data.ext_type === FolderConstant.FOLDER_TYPE_IMAGE.toLowerCase() ? this.chatConfig.CHAT_MESSAGE_TYPE_IMG : this.chatConfig.CHAT_MESSAGE_TYPE_FILE;
        this.sendMessage(msgData, msgType, response.data);
      } else {
       this.dialogService.openWarning({simpleContent:'upload file failed!'})
      }
    })
  }


  /**
   * 删除闹钟
   * @param event
   */
  deleteAlarm(event: any) {
    this.alarmModelService.alarmDelete({data: {mode: '2', alarm_id: event[1].alarm_id}}, (response: any) => {
      if (response.status) {
        event[1].hasAlarm = false;
      }
    })
  }

}