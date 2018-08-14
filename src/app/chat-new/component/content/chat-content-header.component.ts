/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/30.
 */

import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {ChatMenuList} from "../../../shared/services/model/entity/chat-entity";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {Subscription} from "rxjs/Subscription";
import {Router} from "@angular/router";

@Component({
  selector: 'chat-content-header',
  templateUrl: '../../template/content/chat-content-header.component.html'
})

export class ChatContentHeaderComponent implements OnInit, OnDestroy {

  public isDefaultContent: boolean = true;
  public currentGroup: any;
  public currentMenuItem: ChatMenuList;
  public chatCls: string = '';
  public chatTitle: string = '';
  public chatTopic: string = '';
  public oldTopicValue: string = '';
  //是否在收藏列表中
  public hasStared: boolean = false;
  public editMode: boolean = false;
  //是否允许非群主邀请
  public allowInvite: boolean = false;
  public isFriend: boolean = false;
  private chatUpdate: any;
  private chatGroupPerm: any;
  private isInvitedMember: boolean = false;
  public subscription: Subscription;

  @ViewChild('input') inputEl: ElementRef;
  @ViewChild('nameInput') nameInput: ElementRef;
  private isGroupHost: boolean;
  private currentSearchMessage: string = '';
  //用户是否输入中文
  private isInputChinese: boolean = false;

  @HostListener('click', ['$event.target']) onClick(header: any) {
    if (this.editMode && header.tagName !== 'INPUT') {
      this.editMode = false;
    }
  }

  @Output('OutputChatSearchMessage') public OutputChatSearchMessage = new EventEmitter<any>();

  constructor(public chatModelService: ChatModelService,
              public router: Router,
              @Inject('im.service') public chatService: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {
  }

  ngOnInit(): void {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        let message: any = data.data;
        let type: string = data.hasOwnProperty('type') ? data.type : '';
        if (data.hasOwnProperty('act')) {
          switch (data.act) {
            //修改群信息
            case this.notificationService.config.ACT_NOTIFICATION_GROUP_NAME_MODIFY:
              if (this.currentGroup && this.currentGroup.gid == data.data.gid) {
                this.chatTitle = message.is_modify_name ? message.name : this.chatTitle;
                this.chatTopic = message.is_modify_topic ? message.topic : this.chatTopic;
                this.chatUpdate = message;
                this.currentGroup.invited_member = message.invited_member;
              }
              break;
            case  this.notificationService.config.ACT_COMPONENT_CHAT_REFRESH_HEADER:
              if (data.data.gid == this.currentGroup.gid) {
                this.currentGroup = data.data;
              }
              break;
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  loadDefaultHeader() {
    this.isDefaultContent = true;
  }

  initHasStared(chatMenuItem: ChatMenuList) {
    this.hasStared = false;
    let starList: any = this.messageDataService.getChatListCache('STARRED');
    if (starList.length) {
      for (let i = 0, il = starList.length; i < il; i++) {
        if (starList.hasOwnProperty(i)) {
          let key = chatMenuItem.isFriend ? starList[i].uid : starList[i].gid;
          if ((this.currentMenuItem.gid && this.currentMenuItem.gid == key)
            || (this.currentMenuItem.uid && this.currentMenuItem.uid == key)) {
            this.hasStared = true;
            break;
          }
        }
      }
    }
  }

  loadFriendHeader(chatMenuItem: ChatMenuList) {
    this.isFriend = true;
    this.isDefaultContent = false;
    this.currentMenuItem = chatMenuItem;
    this.chatTitle = chatMenuItem.work_name;
    this.initHasStared(chatMenuItem);
  }

  loadGroupHeader(chatMenuItem: ChatMenuList, groupInfo?: any) {
    this.isFriend = false;
    this.isDefaultContent = false;
    this.editMode = false;
    this.currentGroup = groupInfo;
    this.currentMenuItem = chatMenuItem;
    this.chatCls = chatMenuItem ? chatMenuItem.clsName : '';
    this.chatTitle = (groupInfo && groupInfo.hasOwnProperty('name')) ? groupInfo.name : (chatMenuItem.name ? chatMenuItem.name : chatMenuItem.work_name);

    let translateData: string;
    translateData = this.translate.manualTranslate('Type the topic');
    this.chatTopic = (groupInfo && groupInfo.hasOwnProperty('topic')) && groupInfo.topic ? groupInfo.topic : translateData;
    this.hasStared = false;
    this.isFriend = false;
    this.allowInvite = (!(chatMenuItem.hasOwnProperty('is_mission') && chatMenuItem.is_mission === '1'));
    this.initHasStared(chatMenuItem);
    //  判断当前用户是否为群主
    for (let i in this.currentGroup.info) {
      if (this.currentGroup.info[i].uid === this.userDataService.getCurrentUUID()
        || this.currentGroup.info[i].uid === this.userDataService.getCurrentCompanyPSID()) {
        this.isGroupHost = (this.currentGroup.info[i].host === 1);
      }
    }
  }

  closeChat() {
    //显示聊天框
    // if (this.isDefaultContent) {
    //
    // } else {
    //   this.notificationService.postNotification({
    //     act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG,
    //     data: {
    //       isDefault: true
    //     }
    //   });
    // }
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG
    });
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_SEARCH_CLOSE
    })
  }

  /**
   * 邀请好友入群 || 新建群
   * @param event
   */
  addPersonal(event: any) {
    event.stopPropagation();
    if (this.currentMenuItem.isFriend) {
      this.addGroup();
    } else {
      this.invitePeopleToGroup();
    }
  }

  /**
   * 创建群
   */
  addGroup() {
    this.dialogService.openNew({
      mode: '2',
      titleAction: 'Create',
      titleComponent: 'New ' + (this.currentMenuItem.form === 2 ? 'Business' : 'Friend') + ' Channel',
      titleDesc: [
        'Select',
        ' friend or business (internal/cooperator) ',
        'to create a discuss group'
      ],
      titleIcon: 'icon1-new-channel di1-new-channel',
      isSimpleContent: false,
      componentSelector: 'chat-create-group',
      componentData: {type: this.currentMenuItem.form.toString(), friendUid: this.currentMenuItem.uid},
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'send',
          btnEvent: 'createNewGroup'
        },]
    });
  }

  /**
   * 邀请好友进群
   */
  invitePeopleToGroup() {
    this.getUserInfo();
    this.currentGroup.isHost = this.currentMenuItem.is_host;
    this.dialogService.openNew({
      mode: '1',
      title: 'INVITE PEOPLE TO JOIN IN',
      isSimpleContent: false,
      componentSelector: 'chat-invite-people',
      componentData: this.typeService.clone(this.currentGroup),
      buttons: [{
        type: 'cancel'
      },
        {
          type: 'send',
          btnEvent: 'sendInvite'
        }]
    });
  }

  /**
   * 收藏群
   */
  enshrineGroup() {
    let requestData = {
      form: this.currentMenuItem.form,
    };
    if (this.currentMenuItem.gid) {
      requestData['gid'] = typeof this.currentMenuItem.gid === 'number' ?
        this.currentMenuItem.gid : parseInt(this.currentMenuItem.gid);
    } else if (this.currentMenuItem.uid) {
      requestData['uid'] = this.currentMenuItem.uid;
    }
    this.chatModelService.getEnshrineInfo({data: requestData}, (data: any) => {
      if (data.status === 1) {
        this.hasStared = true;
        //更新star列表
        this.refreshStarAction();
      }
    });
  }

  /**
   * 取消收藏
   */
  cancelEnshrineGroup() {
    this.dialogService.openConfirm({simpleContent: 'Are you sure to remove this collection?'}, () => {
      let requestData = {
        form: (typeof this.currentMenuItem.form !== 'number') ? parseInt(this.currentMenuItem.form) : this.currentMenuItem.form,
      };
      if (this.currentMenuItem.gid) {
        requestData['gid'] = typeof this.currentMenuItem.gid === 'number' ?
          this.currentMenuItem.gid : parseInt(this.currentMenuItem.gid);
      } else if (this.currentMenuItem.uid) {
        requestData['uid'] = this.currentMenuItem.uid;
      }
      this.chatModelService.cancelTheEnshrine({remove: requestData}, (data: any) => {
        if (data.status === 1) {
          this.hasStared = false;
          //更新star列表
          this.refreshStarAction('remove');
        }
      })
    });

  }

  /**
   *
   * @param action 'add'|'remove'
   */
  refreshStarAction(action: string = 'add') {
    let starList: any = this.messageDataService.getChatListCache('STARRED');
    if (action === 'remove') {
      for (let i = 0, il = starList.length; i < il; i++) {
        if (starList.hasOwnProperty(i)) {
          let key = starList[i].gid ? parseInt(starList[i].gid) : starList[i].uid;
          if ((this.currentMenuItem.gid && this.currentMenuItem.gid == key)
            || (this.currentMenuItem.uid && this.currentMenuItem.uid == key)) {
            starList.splice(i, 1);
            break;
          }
        }
      }
    } else if (action === 'add') {
      starList.push(this.currentMenuItem);
    }
    this.messageDataService.updateChatListCache(starList, 'STARRED');
    //通知menu刷新
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_ENSHRINE_OR_NOT,
      data: {
        menuItem: this.currentMenuItem
      }
    });
  }

  /**
   * 切换修改topic
   * @param event
   */
  toggleEditTopic(event: any) {
    event.stopPropagation();
    this.editMode = !this.editMode;
    this.oldTopicValue = this.nameInput.nativeElement.value;
    this.nameInput.nativeElement.autofocus = this.editMode;
  }

  /**
   * 编辑topic
   * @param event
   */
  editTopic(event: any) {
    event.stopPropagation();
    // 回车确认
    if (event.keyCode === 13) {
      this.editMode = !this.editMode;
      //提交
      // 如果是群主  name可传值
      // 如果不是群主 name字段传空
      let data = {
        name: this.currentMenuItem.is_host ? this.chatTitle : '',
        topic: this.chatTopic,
        gid: this.currentGroup.gid ? this.currentGroup.gid : '',
        form: this.currentMenuItem.form
      };
      this.chatService.sendEditName(data);

      // esc取消编辑
    } else if (event.keyCode === 27) {
      this.editMode = !this.editMode;
      this.chatTopic = this.oldTopicValue;
    }
  }

  /**
   * 转让群主
   */
  transferGroup(event: any) {
    event.stopPropagation();
    let transferData = {
      currentItem: this.currentMenuItem,
      groupMember: this.currentGroup.info
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'TRANSFER CHANNEL',
      isSimpleContent: false,
      componentSelector: 'chat-group-transfer',
      componentData: this.typeService.clone(transferData),
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'TRANSFER',
          btnEvent: 'transferGroup'
        }
      ]
    });
  }


  /**
   * 群设置
   * @param event
   */
  groupSetting(event: any) {
    event.stopPropagation();
    this.getUserInfo();
    if (!this.isInvitedMember && (this.currentMenuItem.group !== 'mission')) {
      this.dialogService.openWarning({simpleContent: 'You are not the group of host cannot modify group content!'});
      return false;
    }
    if (this.chatUpdate) {
      this.currentGroup.name = this.chatUpdate.name;
      this.currentGroup.topic = this.chatUpdate.topic;
    }
    this.currentGroup.isMission = (this.currentMenuItem.is_mission !== '0');
    this.dialogService.openNew({
      mode: '2',
      title: 'GROUP SETTING',
      isSimpleContent: false,
      componentSelector: 'chat-group-setting',
      componentData: this.typeService.clone(this.currentGroup),
      titleAction: 'Set',
      titleComponent: 'Chat channel',
      titleIcon: 'font-setting di1-setting',
      titleDesc: [
        'Edit',
        'current/general',
        'chat setting'
      ],
      buttons: [{
        type: 'cancel'
      },
        {
          type: 'send',
          btnEvent: 'groupSettingBut'
        }]
    });
  }

  getUserInfo() {
    let userInfo: any = this.userDataService.getUserIn();
    let uuid: string = this.userDataService.getCurrentUUID();
    let psid: string = this.userDataService.getCurrentCompanyPSID();
    let currentGroupInfo: any[] = this.currentGroup.info;

    for (let uid in currentGroupInfo) {
      if ((currentGroupInfo[uid].uid === uuid && currentGroupInfo[uid].host === 1) ||
        (currentGroupInfo[uid].uid === psid && currentGroupInfo[uid].host === 1)) {
        this.isInvitedMember = true;
        break;
      }
    }
  }

  /**
   * chat message search
   */
  onKey(event: any, input: any): void {
    event.stopPropagation();
    if (!this.isInputChinese) {
      this.OutputChatSearchMessage.emit([event, input.value])
    }

  }

  /**
   * 点x清除值
   * @param event
   * @param ipt
   */
  clearInputValue(event: any, ipt: HTMLInputElement): void {
    event.stopPropagation();
    ipt.value = '';
    this.onKey(event, ipt)
  }

  inputChineseCodeStart(event: KeyboardEvent): void {
    this.isInputChinese = true;
  }

  inputChineseCodeEnd(event: KeyboardEvent): void {
    this.isInputChinese = false;
  }

  /**
   * 弹出mission 帮助
   */
  showChatHelp(event: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_HIDE_CHAT_COMPONENT,
      data: {}
    });
    let routerObj: any = {queryParams: {path: this.router.url}};
    setTimeout(() => {
      this.router.navigate(['help/help-chat'], routerObj);
    }, 100);
  }

  /**
   * 清除搜索框
   */
  clearSearch() {
    this.inputEl.nativeElement.value = '';
  }
}