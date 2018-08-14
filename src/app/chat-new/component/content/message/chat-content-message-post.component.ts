import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
import {
  ChatMenuList, ChatMessage, ChatPost, ChatUserInfo,
  PostSettings
} from "../../../../shared/services/model/entity/chat-entity";
import {MessagePostUserInfo} from "../../../../shared/services/model/entity/user-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../../../shared/services/model/chat-model.service";
import * as FolderConstant from '../../../../shared/config/folder.config';
import {DownloadService} from "../../../../shared/services/common/file/download.service";
import * as userConstant from "../../../../shared/config/user.config"
import {ChatConfig} from "../../../../shared/config/chat.config";
@Component({
  selector: 'chat-content-message-post',
  templateUrl: '../../../template/content/message/chat-content-message-post.component.html',
  providers: []
})

export class ChatContentMessagePostComponent implements OnInit {
  //存储所有的群组和个人信息
  // private currentContactList: Array<any> = [];
  // private currentGroupList: Array<any> = [];
  //owner 消息发送者
  public isShare: boolean = false;
  public showPostCont: boolean = false;

  public uuid: string = '';
  public psid: string = '';
  public messageData: ChatMessage;
  public isMerge: boolean = false;
  public isSelf: boolean = false;
  //时间格式
  public dateFormatStr: string = 'yyyy-mm-dd HH:MM:ss';
  private showMoreOperator: boolean = false;
  private postSettings: PostSettings;
  private showPostAttachment: boolean = false;
  private isExpendDetail: boolean = false;
  private showTooltip: boolean = false;
  private isShowAttachment: boolean = false;
  public showStates: boolean;
  public state: number;
  public chatConfig: ChatConfig = new ChatConfig();
  //显示提示

  @Input()
  public set setIsMerge(data: boolean) {
    this.isMerge = data;
  }

  @Output() outSetAlarmDisplay = new EventEmitter<any>();
  @Output() outSetFileMenuDisplay = new EventEmitter<any>();

  @Output() outOpenMiniDialog = new EventEmitter<any>();
  @Output() outSetMessageAlarm = new EventEmitter<any>();
  @Output() outSetMessagePin = new EventEmitter<any>();
  @Output() outAtUser = new EventEmitter<any>();
  @Output() outForwardMsg = new EventEmitter<any>();
  @Output() outShareFile = new EventEmitter<any>();
  @Output() outMessageRevoke = new EventEmitter<any>();
  @Output() outDeleteChatAlarm = new EventEmitter<any>();

  public fileUploadTime: string = '';

  public currentItem: ChatMenuList;
  public currentSummary: string = '';
  public userConstant = userConstant;

  constructor(@Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('date.service') public dateService: any,
              @Inject('app.config') public appConfig: any,
              public chatModelService: ChatModelService,
              public downloadService: DownloadService,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              public contactModelService: ContactModelService,) {
    this.postSettings = PostSettings.init();
  }

  @Input() set setCurrentItem(data: any) {
    this.currentItem = data;
  }

  @Input() set setIsShare(data: boolean) {
    this.isShare = data;
  }


  ngOnInit() {
    // let contactListCache = this.userDataService.getContactList();
    // let chatListCache = this.messageDataService.getChatListCache();
    // this.currentContactList =
    //   contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
    // this.currentGroupList =
    //   chatListCache.MISSION.concat(chatListCache.WORK.concat(chatListCache.PRIVATE));
  }

  @Input() set setMessage(data: {
    userInfoArr: Array<any>, message: ChatMessage
  }) {
    //转义符号 &
    let m = data.message;
    data.message.detail.summary=this.analyzeMessage(data.message.detail.summary);
    //处理summary
    this.currentSummary = data.message.detail.summary;



    let ellipsisStr = '...';
    if (this.currentSummary) {
      if (this.currentSummary.length > 60) {
        this.currentSummary = this.currentSummary.substring(0, 60) + ellipsisStr;
        this.showTooltip = true;
      } else {
        //不显示提示
        this.showTooltip = false;
      }
    }

    //处理附件

    //  判断当前文件的类型 是图片要显示
    if (data.message.detail) {
      if (data.message.detail.first_attachment) {
        if (data.message.detail.first_attachment.hasOwnProperty('ext_type')) {
          let fileType = data.message.detail.first_attachment.ext_type;
          this.isShowAttachment = fileType === FolderConstant.FILE_TYPE_IMAGE;
        } else {
          this.isShowAttachment = false;
        }
      }
    }


    // 处理显示用时间
    let message = data.message;
    let userInfoArr = data.userInfoArr;
    let utcTime = new Date(message.time).toUTCString();

    //根据时间算离最近一次修改相差的时间
    let currentDate = this.dateService.nowDateFormat(this.dateFormatStr);
    let updateTime = this.dateService.utcDateFormat(new Date(message.time).getTime(), this.dateFormatStr);
    let diffTime = this.dateDiff(currentDate, updateTime);
    //离最近一次修改的时间 前端显示用
    this.fileUploadTime =
      diffTime.diffUnit ===  'minutes' ? `${diffTime.gapTime}  ${this.translateService.manualTranslate(diffTime.diffUnit)}` : diffTime.gapTime;
    // message['fileUploadTime'] = this.fileUploadTime;
    message.showTime = this.dateService.formatWithTimezone(utcTime, 'HH:MMtt');
    // 消息预处理
    message.analyseMessageText(userInfoArr);
    // 防止用户数据不正确
    if (!message.hasOwnProperty('userInfo') || !message.userInfo) {
      if (typeof message.owner === 'boolean' || message.owner === 'false') {
        message.owner = this.userDataService.getCurrentUUID();
      }
      let userInfo = this.contactModelService.getUserInfo({
        uid: message.owner
      }, (response: any) => {
        if (response.status === 1) {
          let userInfo = new ChatUserInfo(response.data);
          message.initUserInfo(userInfo);
          this.state = m.userInfo.state;
          this.showStates = !!this.typeService.isNumber(m.userInfo.uid);
        }
        message['isSelf'] = (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
        || message.owner === this.userDataService.getCurrentUUID());
        this.messageData = message;
      });
    } else {
      message['isSelf'] =  (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
      || message.owner === this.userDataService.getCurrentUUID());
      this.messageData = message;
      this.state = m.userInfo.state;
      this.showStates = !!this.typeService.isNumber(m.userInfo.uid);
    }
  }

  /**
   * 点在用户头像
   * @param event
   * @param messageData
   */
  clickOnPerson(event: MouseEvent, messageData: ChatMessage) {
    event.stopPropagation();
    // 本人不用弹窗
    if (messageData.owner === this.userDataService.getCurrentUUID()
      || messageData.owner === this.userDataService.getCurrentCompanyPSID()) {
      return;
    }
    this.outOpenMiniDialog.emit([event, messageData.userInfo]);
  }

  /**
   * 设置消息闹钟
   * @param event
   * @param messageData
   * @param alarmEle
   * @param time
   */
  clickOnAlarm(event: MouseEvent, messageData: any, alarmEle: any, time: any) {
    event.stopPropagation();
    alarmEle['show'] = false;
    this.outSetMessageAlarm.emit([event, messageData, time]);
  }

  /**
   * 点在Pin图标上
   * @param event
   * @param messageData
   */
  clickOnPin(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outSetMessagePin.emit([event, messageData]);
  }

  /**
   * 点击闹钟图标
   * @param event
   * @param alarm
   * @param alarmSelect
   */
  clickAlarm(event: any, alarm: any, alarmSelect: any,messageData:any) {
    if(messageData.hasAlarm){
      //30分钟内不可点
      let now = new Date().getTime();
      let targetTime = messageData.effective_time * 1000;
      if(targetTime - now < 30*60*1000){
        return false;
      }
    }
    this.outSetAlarmDisplay.emit([event, alarm, alarmSelect]);
  }

  /**
   * 点在@上
   * @param event
   * @param messageData
   */
  clickOnAt(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outAtUser.emit([event, messageData]);
  }

  /**
   *
   * @param event
   * @param messageData
   */
  clickOnForward(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    let isCommonMessage: boolean = false;
    this.outForwardMsg.emit([event, messageData, isCommonMessage]);
  }

  /**
   *
   * @param event
   * @param messageData
   */
  clickOnShare(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outShareFile.emit([event, messageData]);
  }

  /**
   * 时间差, 允许显示单位为mo - 月, h - 小时, d - 天
   * @param d2 timestamp 结束时间
   * @param d1 timestamp 开始时间
   * @returns {{gapTime: number, diffUnit: string}}
   */
  public dateDiff(d2: any, d1: any) {
    if (typeof d1 === 'string') {
      d1 = d1.replace(/-/g, '/');
    }
    if (typeof d2 === 'string') {
      d2 = d2.replace(/-/g, '/');
    }
    let gapTime = (Date.parse(d2) - Date.parse(d1)) / 1000;
    gapTime = gapTime < 0 ? 0 : gapTime;
    let diffStatus =
      gapTime > 3600 ? 'detail' : 'min';
    let gapTimeStr: any;
    let diffUnit = '';
    switch (diffStatus) {
      case 'min':
        diffUnit = 'minutes';
        gapTimeStr = Math.floor(gapTime / (60));
        break;
      case 'detail':
      default:
        let D1 = new Date(d1);
        diffUnit = 'detail';
        gapTimeStr = this.dateService.formatWithTimezone(D1);
        break;
    }
    return {
      gapTime: gapTimeStr.toString() !== 'NaN' ? gapTimeStr : -1,
      diffUnit: diffUnit
    }
  };

  /**
   * do more operator
   */
  clickOnFileMenu(event: any, menu: any, menuSelect: any): void {
    event.stopPropagation();
    this.outSetFileMenuDisplay.emit([event, menu, menuSelect]);

  }

  /**
   * open post detail
   */
  openPostDetail(event: any, messageData: ChatMessage, showComments?: boolean): void {
    event.stopPropagation();
    let post_id = messageData.detail.post_id;
    let formData = {
      data: {
        post_id: post_id
      }
    };
    this.chatModelService.getDetailPost(formData, (response: any) => {
      if (response.status === 1) {
        this.postSettings = response.data;
        this.postSettings.mode = 'read';
        this.postSettings.post_id = post_id;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_POST_SEND_SETTINGS,
          data: {
            postSet: this.postSettings,
            showComments: showComments,
            currentItem: this.currentItem,
            messageData: messageData
          }
        });

        /*if (this.postHasInit) {
         this.chatPost.postSettings = this.postSettings;
         }*/

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
   * click show post message
   */

  clickShowPostCont(event: any): void {
    event.stopPropagation();
    this.showPostCont = !this.showPostCont;
  }

  /**
   * click show attachment
   */
  clickShowPostAttachment(event: any, message: ChatMessage): void {
    event.stopPropagation();
    this.showPostAttachment = !this.showPostAttachment;
  }

  /**
   * clickExpendDetail
   */
  clickExpendDetail(event: any, messageData: ChatMessage): void {
    event.stopPropagation();
    if (messageData.detail.summary) {
      this.isExpendDetail = !this.isExpendDetail;
      this.currentSummary = messageData.detail.summary;
      let ellipsisStr = '...';
      if (this.currentSummary.length > 60) {
        if (this.isExpendDetail) {
          this.currentSummary = this.currentSummary.substring(0, 300) + ellipsisStr;
        } else {
          this.currentSummary = this.currentSummary.substring(0, 60) + ellipsisStr;
        }
      }
    }
  }

  /**
   * 消息撤回
   * @param event
   * @param messageData
   */
  clickOnRevoke(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outMessageRevoke.emit([event, messageData]);
  }

  /**
   * 点击下载聊天文件
   */
  downloadChatPost(event: any, messageData: ChatMessage) {
    event.stopPropagation();
    let formData = {
      form: this.currentItem.form,
      fid: this.messageData.detail.fid
    };
    this.downloadService.downloadFolderFile(formData);
    // let settings = {
    //   mode: '1',
    //   title: 'DOWNLOAD THE POST',
    //   isSimpleContent: true,
    //   simpleContent: 'Are you sure download the post?',
    //   buttons: [
    //     {type: 'cancel'},
    //     {
    //       type: 'send',
    //       btnEvent: () => {
    //         let formData = {
    //           form: this.currentItem.form,
    //           fid: this.messageData.detail.fid
    //         };
    //         this.downloadService.downloadFolderFile(formData);
    //       }
    //     }
    //   ]
    // };
    // this.dialogService.openNew(settings);
  }

  /**
   * 点击归档到个人云盘
   */
  archiveToFolder(event: any, param: any) {
    event.stopPropagation();
    let data = {
      isChatFile: true,
      file: param.detail,
      form: this.currentItem.form
    };
    let setOptionData = this.typeService.clone(data);
    let settings = {
      mode: '3',
      title: 'ARCHIVE',
      isSimpleContent: false,
      componentSelector: 'folder-move',
      componentData: setOptionData,
      buttons: [{
        type: 'ok',
        btnEvent: 'confirmCopyTheFile',
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 将 %26 转化成&符号
   * @param str
   * @returns {string}
   */
  public analyzeMessage(str: string) {
    if (str) {
      if (str.indexOf('%26') !== -1) {
        str=str.replace(/%26/g,'&');
      }
    }
    return str;
  }

  /**
   * 删除消息闹钟
   * @param event
   * @param messageData
   * @param alarmEle
   */
  deleteChatAlarm(event: MouseEvent, messageData: any, alarmEle: any){
    event.stopPropagation();
    this.outDeleteChatAlarm.emit([event, messageData]);
  }
}