import { Inject, Injectable } from "@angular/core";
import { Subscription } from "rxjs/Subscription";

@Injectable()

export class ImService {
  static isSocketConnect: any = {};
  static newMessageEvent: { [key: string]: any } = {};
  static webSocket: { [key: string]: WebSocket } = {};
  static socketData: { [key: string]: any } = {};	//socket连接的数据
  static cacheSendData: Array<any> = [];				//登录后需要发送的数据
  static socketClose: { [key: string]: boolean } = {};		//标记模块socket是否关闭(不重新连接)
  static socketRepeatConnectNumber: { [key: string]: number } = {};	//记录模块socket重连的次数
  static socketInterval: { [key: string]: any } = {};	//定时器对象
  static keepOnlineInterval: { [key: string]: any } = {};	//循环保持上线的对象
  //用户与socket服务器通信的离开时间
  static messageLeaveTime: { [key: string]: number } = {};
  private sendData: string = '';
  private defaultModule: string = 'chat';
  private isClosing: boolean = false;


  public socketLoginStatus: boolean = false;

  private userIn: any;
  private subscription: Subscription;
  private isNormalLogOut: boolean;

  constructor(@Inject('app.config') public appConfig: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('dialog.service') public dialogService: any) {
    if (!this.userIn) {
      this.setUserIn();
    }
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        if (message.act === this.notificationService.config.ACT_SYSTEM_IM_LOGOUT
          || message.act === this.notificationService.config.ACT_USER_SESSION_EXPIRED) {
          this.isNormalLogOut = true;
        }
      });
  }

  /**
   * 获取WebSocket实例
   * @param option
   * {
	 * 	openEvent : (event) => { ... },
	 * 	messageEvent : (event) => { ... },
	 *  closeEvent : (event) => { ... },
	 *  errorEvent : (event) => { ... }
	 * }
   * @returns void
   */
  openSocket(option: any): void {
    option.module = option.module ? option.module : this.defaultModule;
    if (!ImService.isSocketConnect[option.module]) {
      // 新建socket
      console.log('socket service openSocket', this.isClosing);
      try {
        ImService.webSocket[option.module] = new WebSocket(this.getSocketUrl(option.module));
        // socket异常
        ImService.webSocket[option.module].onerror = (event: ErrorEvent) => {
          console.error('Socket error:', event);
          if (this.appConfig.debug) {

          }
          this.resetSocketStatus(option);
          this.removeKeepOnline(option.module);
          this.onError(event, option.errorEvent);
        };

        //socket开启
        ImService.webSocket[option.module].onopen = (event: MessageEvent) => {
          console.log('socket service onopen');
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_SYSTEM_IM_RE_LOGOUT
          });
          if (this.appConfig.debug) {
          }
          ImService.socketData[option.module] = option;
          ImService.isSocketConnect[option.module] = true;
          this.resetRepeatSocketConnect(option.module);
          //心跳保持
          ImService.keepOnlineInterval[option.module] = setInterval(() => {
            this.keepOnline(option.module, option.online);
          }, 1000);
          this.onOpen(event, option.openEvent);
          this.isNormalLogOut = false;
        };

        // socket接收消息
        ImService.webSocket[option.module].onmessage = (event: MessageEvent) => {
          if (this.appConfig.debug) {
            console.info('@Socket have new message!', event.data);
          }
          this.onMessage(event);
          //this.excNewMessageEvent(event);
        };

        ImService.webSocket[option.module].onclose = (event: CloseEvent) => {
          console.log('socket close', event);
          this.isClosing = true;
          if (!this.isNormalLogOut) {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_IM_CONNECT_ERROR
            });
            setTimeout(() => {
              this.repeatSocketConnect(option.module);
            }, 30000);
          } else {
          }
          if (this.appConfig.debug) {
          }
          // if (event.code == 1000) {
          this.removeKeepOnline(option.module);
          this.resetSocketStatus(option.module);
          // this.repeatSocketConnect(option.module);
          this.onClose(event, option.closeEvent);
          // } else {
          //   this.resetRepeatSocketConnect(option.module)
          // }
        };
      } catch (e) {
        return
      }
    }

  }

  /**
   * 重置断线重连
   */
  resetRepeatSocketConnect(module: string) {
    ImService.socketClose[module] = false;
    delete ImService.socketRepeatConnectNumber[module];
    //清除定时器
    clearInterval(ImService.socketInterval[module]);
  }

  /**
   * 断线重连
   */
  repeatSocketConnect(module: string) {
    if (!ImService.socketClose[module]
      && typeof ImService.socketRepeatConnectNumber[module] === 'undefined'
      && ImService.socketData[module]) {	//没有手动关闭socket
      console.log('Repeat connection..............')
      //第一次直接重连
      if (!ImService.socketRepeatConnectNumber[module]) {
        if (this.appConfig.debug) {
        }
        this.openSocket(ImService.socketData[module]);
        ImService.socketRepeatConnectNumber[module] = 1;
      }

      ImService.socketInterval[module] = setInterval(() => {
        ImService.socketRepeatConnectNumber[module]++;
        if (ImService.socketRepeatConnectNumber[module] <= this.appConfig.socket.MAX_REPEAT_NUMBER) {
          if (this.appConfig.debug) {
            //console.error(
            //  'Repeat connection ' + ImService.socketRepeatConnectNumber[module],
            //  ImService.socketData[module]
            //);
          }
          this.openSocket(ImService.socketData[module]);
        } else {
          //清除定时器
          clearInterval(ImService.socketInterval[module]);
          this.socketConnectError(module);
        }

      }, (this.appConfig.socket.REPEAT_CONNECT * 1000));

    }
  }

  /**
   * 重置连接信息
   */
  resetSocketStatus(module: string) {
    ImService.cacheSendData = [];
    ImService.isSocketConnect[module] = false;
  }

  /**
   * 连接失败
   */
  socketConnectError(module: string) {
    delete ImService.socketData[module];
    delete ImService.socketInterval[module];
    ImService.socketClose[module] = true;

    // this.notificationService.postNotification({
    //   act: this.notificationService.config.ACT_COMPONENT_IM_CONNECT_ERROR
    // });
  }

  /**
   * 请求模块名
   * @param module
   */
  getSocketUrl(module?: string) {
    module = module ? module : this.defaultModule;
    return this.appConfig.socketDomain + module;
  }

  /**
   * 拼接发送的数据
   */
  setSendData(data: any) {
    if (typeof data === 'object') {
      this.sendData = JSON.stringify(data);
    } else {
      this.sendData = data;
    }
  }

  checkSocketIsConnect(module?: string) {
    module = module ? module : this.defaultModule;
    return ImService.isSocketConnect[module];
  }

  /**
   * 发送message事件
   */
  send(message: any, module ?: string) {
    module = module ? module : this.defaultModule;

    if (ImService.isSocketConnect[module]) {
      if (this.appConfig.debug) {
        console.log('send message', message);
      }
      //设置发送的信息
      this.setSendData(message);
      ImService.webSocket[module].send(this.sendData);
      ImService.messageLeaveTime[module] = 0;
      return true;
    } else {
      //console.log('cache send message', message);
      ImService.cacheSendData.push(message);
    }
    return false;
  }

  /**
   * 处理错误事件
   *
   * event 事件信息(包含事件数据)
   * callback 事件回调方法
   */
  onError(event: any, callback: any) {
    if (typeof callback === 'function') {
      callback(event);
    } else {
      // todo: 默认提示失败信息
    }
  }

  /**
   * 打开事件
   *
   * event 事件信息(包含事件数据)
   * callback 事件回调方法
   */
  onOpen(event: any, callback: any) {
    if (typeof callback === 'function') {
      callback(event);
    }
    console.log('socket service onOpen callback');
    this.sendCacheMessage();
  }

  /**
   * 发送cache的消息
   */
  sendCacheMessage() {
    if (ImService.cacheSendData.length > 0) {
      for (let key in ImService.cacheSendData) {
        if (this.send(ImService.cacheSendData[key])) {
          ImService.cacheSendData.splice(parseInt(key), 1);
        }
      }
    }
  }

  /**
   * 接收事件方法
   *
   * event 事件信息(包含事件数据)
   * callback 事件回调方法
   */
  onMessage(event: MessageEvent) {
    let message: any = JSON.parse(event.data);
    if (message.hasOwnProperty('status')) {
      //(message.status == 1 || message.status == 501)
      console.log('on message post notification');
      this.notificationService.postNotification(message);
    } else {
      //console.error('message.status error', message);
    }
  }

  /**
   * 设置叠加消息事件
   *
   * name 事件相关名
   * callback 事件回调方法
   */
  setNewMessageEvent(eventName: string, callback: any) {
    if (typeof ImService.newMessageEvent[eventName] === 'undefined'
      && typeof callback === 'function') {
      ImService.newMessageEvent[eventName] = callback;
    }
  }

  // /**
  //  * 执行叠加消息事件
  //  *
  //  * name 事件相关名
  //  * callback 事件回调方法
  //  */
  // excNewMessageEvent(event: any) {
  //   for (let eventName in ImService.newMessageEvent) {
  //     if (typeof ImService.newMessageEvent[eventName] === 'function') {
  //       ImService.newMessageEvent[eventName](event);
  //     }
  //   }
  // }


  /**
   * 关闭事件方法
   *
   * event 事件信息(包含事件数据)
   * callback 事件回调方法
   */
  onClose(event: any, callback: any) {
    if (typeof callback === 'function') {
      callback(event);
    }

  }

  /**
   * 心跳保持
   */
  keepOnline(module: string, onlineCallBack: any) {
    if (ImService.messageLeaveTime[module] <= this.appConfig.socket.KEEP_ONLINE_TIME) {
      ImService.messageLeaveTime[module]++;
      //console.warn('check leave time', ImService.messageLeaveTime[module]);
    } else {
      if (typeof onlineCallBack === 'function') {
        //console.warn('keep online', ImService.messageLeaveTime[module]);
        onlineCallBack();
      }
      ImService.messageLeaveTime[module] = 0;
    }

  }

  /**
   * 移除循环心跳保持事件
   */
  removeKeepOnline(module: string) {
    if (ImService.keepOnlineInterval[module]) {
      clearInterval(ImService.keepOnlineInterval[module]);
    }
  }

  /**
   * 关掉socket
   */
  close(module ?: string) {
    module = module ? module : this.defaultModule;
    this.removeKeepOnline(module);
    if (ImService.webSocket[module]) {
      ImService.webSocket[module].close();
      delete ImService.webSocket[module];
    }
    this.socketLoginStatus = false;
    ImService.socketClose[module] = true;

  }

  init() {
    //获取Socket 实例
    console.log('init im service');
    this.openSocket({
      openEvent: () => {
        this.loginToWebSocket();
      },
      errorEvent: () => {
        console.log('error事件');
        this.socketLoginStatus = false;
      },
      closeEvent: () => {
        console.log('close事件');
        delete this.userIn;
        this.socketLoginStatus = false;
      },
      online: () => {
        this.keepWebSocketOnline();
      }
    });
  }

  /**
   * 执行登录
   */
  loginToWebSocket() {
    if (!this.userIn || (this.userIn && !this.userIn.user)) {
      this.setUserIn();
    }
    setTimeout(() => {
      if (!this.socketLoginStatus && this.userIn.user) {
        console.log('im system login success');
        this.send({
          act: this.notificationService.config.ACT_SYSTEM_IM_LOGIN,
          data: {
            uuid: this.userDataService.getCurrentUUID(),
            psid: this.userDataService.getCurrentCompanyPSID(),
            session_id: this.userDataService.getSessionId()
          }
        });
      }
    }, 500);
  }

  /**
   * 在线上,心跳连接
   */
  keepWebSocketOnline() {
    let module = this.defaultModule;
    console.log('keep online', ImService.isSocketConnect[module], ImService.socketClose[module]);
    if (ImService.isSocketConnect[module] || !ImService.socketClose[module]) {
      if (!this.userIn || (this.userIn && !this.userIn.user)) {
        this.setUserIn();
      }
      this.send({
        act: this.notificationService.config.ACT_SYSTEM_IM_KEEP_ONLINE,
        data: {
          uuid: this.userDataService.getCurrentUUID(),
          psid: this.userDataService.getCurrentCompanyPSID(),
          session_id: this.userDataService.getSessionId()
        }
      });
    } else {
      console.log('try re-login');
      this.loginToWebSocket();
    }
  }


  /**
   * IM切换公司
   */
  switchCompany(data: any) {
    this.sendMessage({
      //act: this.notificationService.config.ACTION_SWITCH_COMPANY,
      act: this.notificationService.config.ACT_NOTICE_SWITCH_COMPANY,
      data: {
        psid: data.psid,
        original_psid: data.original_psid
      }
    });
  }


  /**
   * 发送用户相关消息
   * @param message
   */
  sendMemberMessage(message: any) {
    this.setMemberPublicData(message);
    this.send(message);
  }

  /**
   * 发送聊天消息
   * @param message
   */
  sendCommonMessage(message: any) {
    this.setCommonPublicData(message);
    this.send(message);
  }

  /**
   * 发送公用消息
   */
  sendMessage(message: any) {
    this.setPublicData(message);
    this.send(message);
  }

  /**
   * 叠加用户模块公用数据
   *
   * 需要设置的数据源
   *
   * ownerIsObject owner是否为对象
   */
  setMemberPublicData(message: any) {
    if (message.data) {
      if (!this.userIn && (this.userIn && !this.userIn.user)) {
        this.setUserIn();
      }
      this.setPublicData(message);
      if (!message.data.owner) {
        message.data.owner = {
          psid: this.userDataService.getCurrentCompanyPSID(),
          uuid: this.userDataService.getCurrentUUID(),
          cid: this.companyDataService.getCurrentCompanyCID()
        };
      }
    }
  }

  /**
   * 叠加聊天模块公用数据
   */
  setCommonPublicData(message: any) {
    if (message.data) {
      this.setUserIn();
      this.setPublicData(message);
      // let form: number = typeof message.data.form !== 'undefined'
      //   ? message.data.form : this.chatDataService.getChatForm();
      //form 有身份时走这里
      // if (typeof form !== 'undefined') {
      //   if (form === 1) {
      //     message.data.owner = this.userIn.user.uuid;
      //   } else if (form === 2) {
      //     message.data.owner = this.userIn.locationCompany.psid
      //   }
      // } else {
      //   message.data.owner =
      //     this.userIn.locationCompany.psid ? this.userIn.locationCompany.psid : this.userIn.user.uuid;
      // }
    }
  }

  /**
   * set公用模块数据
   */
  setPublicData(message: any) {
    if (message.data) {
      message.data.session_id = this.userDataService.getSessionId();
    }
  }

  /**
   * 获取用户信息
   */
  setUserIn() {
    if (this.userDataService) {
      this.userIn = this.userDataService.getUserIn();
    }
  }


  /**
   * 发送个人消息
   */
  sendPersonalMessage(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_SEND_MESSAGE,
      data: {
        friend: data.friend,
        form: data.form,
        identity: data.identity,
        type: data.type,
        token: data.token,
        msg: data.msg,
        detail: data.detail ? data.detail : {},
      }
    });
  }


  /**
   * 发送群组消息
   * @param data
   */
  sendGroupMessage(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_SEND_MESSAGE,
      data: {
        gid: data.gid,
        form: data.form,
        identity: data.identity,
        type: data.type,
        token: data.token,
        msg: data.msg,
        detail: data.detail ? data.detail : {},
      }
    });
  }

  /**
   * 撤回群组消息
   * @param data
   */
  revokeGroupMessage(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE,
      data: {
        gid: data.gid,
        form: data.form,
        msg_id: data.msg_id,
        identity: data.identity,
      }
    });
  }

  /**
   * 撤回个人消息
   * @param data
   */
  revokePersonalMessage(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE,
      data: {
        friend: data.friend,
        form: data.form,
        msg_id: data.msg_id,
        identity: data.identity,
      }
    });
  }

  /**
   * 修改用户的状态
   */
  sendChangState(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS,
      data: {
        state: data.state
      }
    });
  }

  /**
   * 群主转让
   * @param data
   */
  sendTransferGroup(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_GROUP_TRANSFER,
      data: {
        gid: data.gid,
        receiver: data.receiver,
        form: data.form
      },
    })
  }

  /**
   * 建立私人群
   */
  sendCreatePrivateGroup(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_NOTICE_GROUP_CREATE,
      data: {
        name: data.name,
        topic: data.topic,
        members: data.members,
        form: 1
      }
    });
  }

  /**
   * 建立工作群
   */
  sendCreateWorkGroup(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_NOTICE_GROUP_CREATE,
      data: {
        name: data.name,
        topic: data.topic,
        members: data.members,
        form: 2
      }
    });
  }

  /**
   * 删除群组
   */
  sendRemoveTheGroup(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_GROUP_DELETE,
      data: {
        form: data.form,
        gid: data.gid,
        name: data.name,
      }
    });
  }


  /**
   * 退出当前群
   * @param data
   */
  signOutGroup(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_USER_EXIT_GROUP,
      data: {
        form: data.form,
        gid: data.gid,
        //name: data.name
      }
    })
  }


  /**
   * 修改群名称和修改群主题
   */
  sendEditName(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY,
      data: {
        gid: data.gid,
        name: data.name,
        topic: data.topic,
        form: data.form,
        invited_member: data.hasOwnProperty('invitedMember') ? data.invitedMember : 0
      }
    });
  }

  /**
   * 群内拉新成员
   */
  addNewMembers(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MASTER_GROUP_INVITE,
      data: {
        gid: data.gid,
        invited_member: data.invited_member,
        is_host: data.is_host,
        name: data.name,
        members: data.members,
        form: data.form
      }
    });
  }

  /**
   * 被邀请人接受进群
   */
  agreeGroupInvite(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT,
      data: {
        form: data.form,
        gid: data.gid,
        name: data.name,
        members: data.members,
        introducer: data.introducer,
        request_id: data.request_id
      }
    });
  }

  /**
   * 被邀请人拒绝入群
   */
  refuseGroupInvite(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE,
      data: {
        friend: data.friend,
        gid: data.gid,
        form: data.form,
        name: data.name,
        members: data.members,
        introducer: data.introducer,
        request_id: data.request_id
      }
    });
  }

  /**
   * 非群主邀請后群主操作邀請
   */
  newGroupInvite(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_REQUEST_MEMBER_GROUP_INVITE,
      data: {
        gid: data.gid,
        invited_member: data.invited_member,
        is_host: data.is_host,
        name: data.name,
        members: data.members,
        form: data.form
      }
    });
  }

  /**
   * 非群主邀請后群主拒绝
   */
  memberGroupRefuse(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE,
      data: {
        gid: data.gid,
        name: data.name,
        introducer: data.introducer,
        members: data.members,
        form: data.form,
        request_id: data.request_id
      }
    });
  }

  /**
   * 非群主邀請后群主同意
   */
  memberGroupAgree(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_ACCEPT,
      data: {
        gid: data.gid,
        name: data.name,
        introducer: data.introducer,
        members: data.members,
        form: data.form,
        request_id: data.request_id
      }
    });
  }

  /**
   * 删除群成员
   */
  sendDeleteGroupMember(sendData: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_NOTICE_MASTER_DELETE_GROUP_USER,
      data: {
        gid: sendData.gid,
        name: sendData.name,
        friend: sendData.friend,
        form: sendData.form
      }
    });
  }

  /**
   *chat-post forward
   */
  sendChatPostForward(data: any): void {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_CHAT_CONVERSATION,
      data: {
        post_id: data.introducer,
        public_or_private: data.gid,
        channel: data.form,
        //TODO comments
      }
    });
  }


  /**
   * 发送申请公司
   * @param data
   */
  applyCompany(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_COMPANY_RELATIONSHIP,
      data: {
        cid: data.cid,
        pcid: data.pcid,
        co_type: data.co_type,
        is_allow: data.is_allow,
        company_name: data.company_name,
        comment: data.comment
      }
    });
  }

  /**
   * 接受公司申请
   * @param data
   */
  acceptApplyCompany(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_NOTICE_COMPANY_RELATIONSHIP_ACCEPT,
      data: {
        cid: data.cid,
        pcid: data.pcid,
        co_type: data.co_type,
        is_allow: data.is_allow,
        company_name: data.company_name,
        comment: data.comment,
        request_id: data.request_id,
        receiver: data.receiver
      }
    });
  }

  /**
   * 拒绝公司申请
   * @param data
   */
  refuseApplyCompany(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_NOTICE_COMPANY_RELATIONSHIP_REFUSE,
      data: {
        cid: data.cid,
        pcid: data.pcid,
        co_type: data.co_type,
        is_allow: data.is_allow,
        company_name: data.company_name,
        comment: data.comment,
        request_id: data.request_id,
        receiver: data.receiver
      }
    });
  }


  /**
   * 好友申请
   */
  doApplyFriend(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_REQUEST_ADD_FRIEND,
      data: {
        friend: data.friend,
        remark: data.remark,  //请求留言信息
        relation: data.user_relation,  //好友关系
        company_name: data.company_name  //公司名称
      }
    });
  }

  /**
   * 拒绝好友申请
   * @param data
   */
  refuseApplyFriend(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_NOTICE_REFUSE_ADD_FRIEND,
      data: {
        friend: data.friend,
        request_id: data.request_id,
        feedback: data.feedback
      }
    });
  }

  /**
   * 接收好友申请
   * @param data
   */
  acceptApplyFriend(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND,
      data: {
        friend: data.friend,
        relation: data.friend_relation,
        request_id: data.request_id,
        feedback: data.feedback
      }
    });
  }

  /**
   * 推荐好友
   * @param data
   */
  recommendNewContacts(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_USER,
      data: {
        owner: data.owner,
        referral: data.referral,
        receiver: data.receiver,
        remark: data.remark,
        relation: data.relation
      }
    });
  };

  /**
   * 拒绝推荐好友
   * @param data
   */
  refuseFriendRecomm(data: any) {
    // this.sendCommonMessage({
    //   act: this.notificationService.config.ACT_USER_NOTICE_REFUSE_RECOMMEND_ADD_FRIEND,
    //   data: {
    //     owner: data.owner,
    //     referee: data.referee,
    //     remark: data.remark,
    //     request_id: data.request_id
    //   }
    // })
  }

  /**
   * 接受被推荐人为好友
   * @param data
   */
  AcceptRecommendationFriend(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_ADD_FRIEND,
      data: {
        referral: data.referral,
        owner: data.owner,
        // referee: data.referee,
        relation: data.relation,
        remark: data.remark,
        request_id: data.request_id
      }
    })
  }

  /**
   * 被推荐人拒绝
   * @param data
   */
  refuseApplyRecommFriend(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_REFUSE_ADD_FRIEND,
      data: {
        remark: data.remark,
        owner: data.owner,
        receiver: data.receiver,
        // referee: data.referee,
        request_id: data.request_id
      }
    })
  }

  /**
   * 被推荐人同意
   * @param data
   */
  acceptApplyRecommFriend(data: any) {
    this.sendCommonMessage({
      act: this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND,
      data: {
        remark: data.remark,
        owner: data.owner,
        receiver: data.receiver,
        // referee: data.referee,
        relation: data.relation,
        request_id: data.request_id
      }
    })
  }


  /**
   * 用户退出登录
   */
  sendLogoOutMessage() {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_SYSTEM_IM_LOGOUT,
      data: {}
    })
  }


  /**
   * 发送招聘消息
   * @param data
   */
  sendHireMessage(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_HIRE,
      data: {
        receiver: data.receiver,
        company_name: data.company_name,
        msg: data.msg
      }
    });
  }

  /**
   * 拒绝/接受招聘消息
   * @param data
   */
  doHireMessage(data: any) {
    this.sendMemberMessage({
      act: data.act,
      data: {
        receiver: data.receiver,
        request_id: data.request_id,
        company_name: data.company_name,
        feedback: data.feedback
      }
    });
  }

  /**
   * 删除好友
   * @param data
   */
  sendDeleteFriends(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_NOTICE_USER_DELETE_FRIEND,
      data: {friends: data.friends}
    });
  }

  /**
   * 设置公司 admin / structure admin
   * @param data
   */
  setCompanyAdmin(data: any) {
    let newData: any = {
      data: {
        comments: data.comment,
        role: data.role,
        candidates: data.candidates,
        cid: data.cid,
        company_name: data.company_name
      }
    };
    if (data.role === 4) {
      newData.act = this.notificationService.config.ACT_REQUEST_SET_COMPANY_STRUCTURE_ADMIN;
    } else {
      newData.act = this.notificationService.config.ACT_REQUEST_SET_COMPANY_ADMIN;
    }
    this.sendMemberMessage(newData);
  }

  /**
   * structure admin 拒绝
   * @param data
   */
  refuseBecomeCompanyCeo(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_REFUSE,
      data: {
        role: data.role,
        initiator: data.initiator,
        company_name: data.company_name,
        request_id: data.request_id
      }
    });
  }

  /**
   * share holder 拒绝 structure admin
   * @param data
   */
  shareHolderRefuseCompanyCeo(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN,
      data: {
        request_id: data.request_id,
        company_name: data.company_name,
        role: data.role,
        deleted: data.deleted,
        added: data.added,
        initiator: data.initiator,
        cid: data.cid
      }
    });
  }

  /**
   * share holder 接受 structure admin
   * @param data
   */
  shareHolderAcceptCompanyCeo(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE_STRUCTURE_ADMIN,
      data: {
        deleted: data.deleted,
        initiator: data.initiator,
        role: data.role,
        cid: data.cid,
        request_id: data.request_id,
        company_name: data.company_name,
        comments: data.comments,
        added: data.added
      }
    });
  }

  /**
   * structure admin接受
   * @param data
   */
  acceptBecomeCompanyCeo(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT,
      data: {
        cid: data.cid,
        role: data.role,
        initiator: data.initiator,
        request_id: data.request_id,
        company_name: data.company_name,
        deleted: data.deleted
      }
    });
  }

  /**
   * 拒绝加入公司
   * @param data
   */
  refuseJoinCompany(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_COMPANY_ADMIN_REFUSE,
      data: {
        initiator: data.initiator,
        role: data.role,
        company_name: data.company_name,
        request_id: data.request_id
      }
    })
  }

  /**
   * share holder 拒绝除structure admin之外的admin
   * @param data
   */
  shareHolderRefuseSetCompanyAdmin(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE,
      data: {
        initiator: data.initiator,
        role: data.role,
        deleted: data.deleted,
        added: data.added,
        company_name: data.company_name,
        request_id: data.request_id
      }
    })
  }

  /**
   * share holder 接受除 structure admin之外的admin
   * @param data
   */
  shareHolderAcceptSetCompanyAdmin(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE,
      data: {
        initiator: data.initiator,
        deleted: data.deleted,
        added: data.added,
        role: data.role,
        cid: data.cid,
        comments: data.comments,
        company_name: data.company_name,
        request_id: data.request_id
      }
    })
  }

  /**
   * 接受加入公司
   * @param data
   */
  acceptJoinCompany(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_REQUEST_COMPANY_ADMIN_ACCEPT,
      data: {
        initiator: data.initiator,
        deleted: data.deleted,
        added: data.added,
        role: data.role,
        cid: data.cid,
        comments: data.comments,
        company_name: data.company_name,
        request_id: data.request_id
      }
    })
  }

  /**
   * 同意离开公司申请
   */
  acceptOutOffice(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_NOTICE_OUT_OFFICE_ACCEPT,
      data: {
        receiver: data.receiver,
        id: data.id,
        owner: data.owner,
        request_id: data.request_id
      }
    })
  }

  /**
   * 拒绝离开公司申请
   */
  refuseOutOffice(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_NOTICE_OUT_OFFICE_REFUSE,
      data: {
        receiver: data.receiver,
        id: data.id,
        owner: data.owner,
        request_id: data.request_id
      }
    })
  }

  /**
   * 同意假期申请
   */
  acceptVacation(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_VACATION_APPLY_ACCEPT,
      data: {
        receiver: data.receiver,
        id: data.id,
        owner: data.owner,
        request_id: data.request_id
      }
    })
  }

  /**
   * 拒绝假期申请
   */
  refuseVacation(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_USER_VACATION_APPLY_REFUSE,
      data: {
        receiver: data.receiver,
        id: data.id,
        owner: data.owner,
        request_id: data.request_id
      }
    })
  }

  /**
   * 辞职申请
   */
  resignationApply(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_APPLICATION_REQUEST_APPLY_DISMISSION,
      data: {
        expected_resignation_date: data.expected_resignation_date,
        reason: data.reason
      }
    })
  }

  /**
   * line manager 接受辞职申请
   */
  acceptResignationApply(data: any) {
    let sendData = {};

    sendData = {
      applicant: data.applicant,
      request_id: data.request_id,
    }

    this.sendMemberMessage({
      act: this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT,
      data: sendData
    })
  }

  /**
   * line manager 拒绝辞职申请
   */
  refuseResignationApply(data: any) {
    this.sendMemberMessage({
      act: this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_REFUSE,
      data: {
        applicant: data.applicant,
        request_id: data.request_id,
      }
    })
  }

  /**
   * hr ceo mainAdmin 接受辞职申请
   */
  hrAcceptResignationApply(data: any) {
    let sendData = {};
    sendData = {
      applicant: data.applicant,
      request_id: data.request_id,
      freeze: data.freeze,
      transfer: data.transfer,
      line_manager: data.line_manager
    };

    this.sendMemberMessage({
      act: this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED,
      data: sendData
    })
  }


}

