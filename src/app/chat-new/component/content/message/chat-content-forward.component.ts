/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/5/19.
 */
import {AfterViewInit, Component, Inject, Input, Output, EventEmitter, AfterViewChecked} from "@angular/core";
import {Router} from "@angular/router";
import {ChatModelService} from "../../../../shared/services/model/chat-model.service";
import {ChatMessage, ChatUserInfo, PostSettings} from "../../../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {DownloadService} from "../../../../shared/services/common/file/download.service";
import {ChatConfig} from "../../../../shared/config/chat.config";
import * as FolderConstant from '../../../../shared/config/folder.config';
import * as userConstant from "../../../../shared/config/user.config"
@Component({
  selector: 'chat-content-forward',
  templateUrl: '../../../template/content/message/chat-content-forward.component.html'
})
export class ChatContentForward implements AfterViewInit,AfterViewChecked {

  public messageData: ChatMessage;
  public currentItem: any;
  public forwardMessage: any;
  public chatConfig: ChatConfig = new ChatConfig();

  public isExtend: boolean = false;

  //post部分
  //时间格式
  public dateFormatStr: string = 'yyyy-mm-dd HH:MM:ss';
  private showTooltip: boolean = false;
  private isShowAttachment: boolean = false;
  private postSettings: PostSettings;
  public currentSummary: string = '';
  public isExpendDetail: boolean = false;


  //img部分
  public isShare: boolean = false;
  private hasFetchedImg: boolean = false;
  private likeCount: number;
  public isLiked: boolean = false;

  @Output() outSetAlarmDisplay = new EventEmitter<any>();
  @Output() outSetFileMenuDisplay = new EventEmitter<any>();
  @Output() outShareFile = new EventEmitter<any>();
  @Output() outOpenMiniDialog = new EventEmitter<any>();
  @Output() outSetMessageAlarm = new EventEmitter<any>();
  @Output() outSetMessagePin = new EventEmitter<any>();
  @Output() outAtUser = new EventEmitter<any>();
  @Output() outForwardMsg = new EventEmitter<any>();
  @Output() outMessageRevoke = new EventEmitter<any>();
  @Output() outDeleteChatAlarm = new EventEmitter<any>();
  private hasBinded: boolean;
  public d3: any;
  private isMiniDialog: boolean = false;
  public showStates: boolean;
  public state: number;
  public userConstant = userConstant;

  //页面交互
  constructor(public contactModelService: ContactModelService,
              public downloadService: DownloadService,
              public chatModelService: ChatModelService,
              @Inject('app.config') public appConfig: any,
              @Inject('d3.service') public d3Service: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: any) {
    this.d3 = this.d3Service.getInstance();
  }


  ngAfterViewInit() {

  }

  ngAfterViewChecked() {
    // 正则解析完成后对 @用户的点击html绑定事件
    if (!this.hasBinded && !this.isMiniDialog && this.messageData && this.currentItem) {
      this.d3.selectAll('a.mention').on('click', (typenames: any, listener: any, capture: any) => {
        let targetUid = this.d3.select(capture[listener]).attr('data-user');
        let position = this.d3.mouse(capture[listener]);
        if (targetUid && (targetUid !== this.userDataService.getCurrentUUID() && targetUid !== this.userDataService.getCurrentCompanyPSID())) {
          let work_name = this.d3.select(capture[listener]).html().substr(1);
          let memberInfo = new ChatUserInfo({uid: targetUid, work_name: work_name});
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
            data: {
              selector: 'bi-mini-dialog',
              options: {
                left: position[0],
                top: position[1],
                member: memberInfo,
                identity: this.currentItem.identity,
                form: this.currentItem.form
              }
            }
          });
        }

      });
      this.hasBinded = true;
    }
  }


  @Input()
  public  set setCurrentItem(data: any) {
    this.currentItem = data;
  }

  @Input()
  public  set setIsMiniDialog(data: any) {
    this.isMiniDialog = data;
  }


  @Input()
  public set setMessage(data: {
    userInfoArr: Array<any>, message: ChatMessage
  }) {
    // 处理显示用时间
    let message = data.message;
    let userInfoArr = data.userInfoArr;
    let utcTime = new Date(message.time).toUTCString();
    this.forwardMessage = message.detail.original_msg;
    this.getOriginalUserInfo(this.forwardMessage, userInfoArr);
    message.showTime = this.dateService.formatWithTimezone(utcTime, 'HH:MMtt');
    // 消息预处理
    message.analyseMessageText(userInfoArr);
    // 防止用户数据不正确
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
          this.state = message.userInfo.state;
          this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
        }
        message['isSelf'] = (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
        || message.owner === this.userDataService.getCurrentUUID());
        this.messageData = message;
      });
    } else {
      message['isSelf'] = (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
      || message.owner === this.userDataService.getCurrentUUID());
      this.messageData = message;
      this.state = message.userInfo.state;
      this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
    }

    if (this.forwardMessage.type === this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
      this.dealForWardPostMessage(this.forwardMessage.detail);
    }
  }

  /**
   * 获取原来消息的owner信息
   */
  getOriginalUserInfo(originalMessage: any, userArr: any) {
    for (let i  in userArr) {
      if (userArr[i].uid == originalMessage.owner) {
        this.forwardMessage['userInfo'] = userArr[i];
      }
    }
  }


  /**
   * 点在用户头像
   * @param event
   * @param messageData
   */
  clickOnPerson(event: MouseEvent, messageData: ChatMessage, type: number) {
    event.stopPropagation();
    if (type === 1) {
      // 本人不用弹窗
      if (messageData.owner == this.userDataService.getCurrentUUID()
        || messageData.owner == this.userDataService.getCurrentCompanyPSID()) {
        return;
      }
      this.outOpenMiniDialog.emit([event, messageData.userInfo]);
    } else {
      // let originalMsgUser: any = messageData.detail.original_msg.userInfo;
      // 本人不用弹窗
      if (messageData.detail.original_msg.detail.owner === this.userDataService.getCurrentUUID()
        || messageData.detail.original_msg.detail.owner === this.userDataService.getCurrentCompanyPSID()) {
        return;
      }
      this.outOpenMiniDialog.emit([event, messageData.detail.original_msg.userInfo]);

    }
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
   * 删除消息闹钟
   * @param event
   * @param messageData
   * @param alarmEle
   */
  deleteChatAlarm(event: MouseEvent, messageData: any, alarmEle: any) {
    event.stopPropagation();
    this.outDeleteChatAlarm.emit([event, messageData]);
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
   * dialog点击PIN图标 调用 PIN接口
   */


  /**
   * 点击闹钟图标
   * @param event
   * @param alarm
   * @param alarmSelect
   */
  clickAlarm(event: any, alarm: any, alarmSelect: any, messageData: any) {
    if (messageData.hasAlarm) {
      //30分钟内不可点
      let now = new Date().getTime();
      let targetTime = messageData.effective_time * 1000;
      if (targetTime - now < 30 * 60 * 1000) {
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

  clickOnForward(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    let isCommonMessage: boolean = (messageData.detail.original_msg.type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT);
    if (messageData.detail.original_msg.type == this.chatConfig.CHAT_MESSAGE_TYPE_POST) {
      let first_attachment = this.typeService.clone(messageData.detail.original_msg.detail.first_attachment);
      if(first_attachment) {
        messageData.detail.original_msg.detail.first_attachment = {
          name: first_attachment.name,
          path:first_attachment.path,
          fid:first_attachment.fid,
          ext_type:first_attachment.ext_type,
        }
      }
    }
    this.outForwardMsg.emit([event, messageData.detail.original_msg, isCommonMessage]);
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
   *
   * @param event
   * @param messageData
   */
  clickOnShare(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outShareFile.emit([event, messageData]);
  }


  /**
   * 点击下载聊天文件
   */
  downloadChatFile(event: any,) {
    event.stopPropagation();
    let formData = {
      form: this.currentItem.form,
      fid: this.forwardMessage.detail.fid
    };
    this.downloadService.downloadFolderFile(formData);
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
   * do more operator
   */
  clickOnFileMenu(event: any, menu: any, menuSelect: any): void {
    event.stopPropagation();
    this.outSetFileMenuDisplay.emit([event, menu, menuSelect]);

  }


  /**
   *对转发的post消息做处理
   */
  dealForWardPostMessage(message: any) {
    //处理summary
    if (message && message.summary) {
      this.currentSummary = message.summary;
      let ellipsisStr = '...';
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
    if (message) {
      if (message.first_attachment) {
        if (message.first_attachment.hasOwnProperty('ext_type')) {
          let fileType = message.first_attachment.ext_type;
          this.isShowAttachment = fileType === FolderConstant.FILE_TYPE_IMAGE;
        } else {
          this.isShowAttachment = false;
        }
      }
    }

    //根据时间算离最近一次修改相差的时间
    let currentDate = this.dateService.nowDateFormat(this.dateFormatStr);
    if (typeof message.updated === 'number') {
      let updateTime = this.dateService.utcDateFormat(message.updated * 1000, this.dateFormatStr);
      let diffTime = this.dateDiff(currentDate, updateTime);
      message['updated'] =
        diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit}` : diffTime.gapTime;
    }
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
    let D1 = new Date(d1);
    let D2 = new Date(d2);
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
   * 打开post详细
   */
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
   * image部分
   */
  /**
   * 点赞当前图片
   */
  likeTheImage(fid: any, event?: any) {
    if (event) {
      event.stopPropagation();
    }
    let data = {fid: fid};
    this.chatModelService.imageLikeUpdate({
      data
    }, (res: any) => {
      //获取成功
      if (res.status === 1) {
        this.fetchImageLikes();
      }
    });
  }

  /**
   * 获取图片的like 数量
   */
  fetchImageLikes() {
    let data = {
      fid: this.forwardMessage.detail.fid
    };
    this.chatModelService.fetchImageLike({
      data
    }, (response: any) => {
      //获取成功
      if (response.status === 1) {
        this.likeCount = response.data.likes;
        this.isLiked = response.data.has_liked !== 0;
      }
    });
  }

  /**
   * 鼠标划上图片显示当前文件
   */
  fetchTheImageLikes(event: any) {
    event.stopPropagation();
    if (!this.hasFetchedImg) {
      this.fetchImageLikes();
      this.hasFetchedImg = true;
    }
  }


  /**
   * 点击图片弹出图片dialog
   */
  showBigImgDialog(event: any) {
    event.stopPropagation();
    this.forwardMessage['time'] = this.messageData.time;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG,
      data: {
        isShowComment: false,
        currentItem: this.currentItem,
        messageData: this.forwardMessage
      }
    });
  }

  /**
   * 点击聊天窗口里面的图片展开图片弹框 并且默认打开评论窗
   */
  showImageComments(event: any) {
    event.stopPropagation();
    this.forwardMessage['time'] = this.messageData.time;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG,
      data: {
        isShowComment: true,
        currentItem: this.currentItem,
        messageData: this.forwardMessage
      }
    });
  }


}