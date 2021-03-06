/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/5/8.
 */
import {AfterViewInit, Component, Inject, Input, Output, EventEmitter} from "@angular/core";
import {Router} from "@angular/router";
import {ChatMessage, ChatUserInfo} from "../../../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {DownloadService} from "../../../../shared/services/common/file/download.service";
import {ChatModelService} from "../../../../shared/services/model/chat-model.service";
import {Subscription} from "rxjs";
import * as userConstant from "../../../../shared/config/user.config"
import {ChatConfig} from "../../../../shared/config/chat.config";

@Component({
  selector: 'chat-content-message-img',
  templateUrl: '../../../template/content/message/chat-content-message-img.component.html'
})
export class ChatContentMessageImg implements AfterViewInit {

  public messageData: ChatMessage;
  public currentItem: any;
  public isShare: boolean = false;
  private hasFetchedImg: boolean = false;

  public subscription: Subscription;

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
  private likeCount: number;
  public isLiked: boolean = false;
  private isMiniDialog: boolean = false;
  public showStates: boolean = false;
  public state: number;
  public userConstant = userConstant;
  public chatConfig: ChatConfig = new ChatConfig();
  //页面交互
  constructor(public contactModelService: ContactModelService,
              public downloadService: DownloadService,
              @Inject('app.config') public appConfig: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              public chatModelService: ChatModelService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnInit() {
    // this.fetchImageLikes();


  }

  ngAfterViewInit(): void {

  }

  dealMessage(message: any) {
    switch (message.act) {
      case this.notificationService.config.ACT_COMPONENT_IMAGE_LIKE:
        if (message.data.fid === this.messageData.detail.fid) {
          this.likeTheImage(message.data.fid);
        }
        break;
      default:
        break;
    }
  }

  @Input()
  set setIsShare(data: boolean) {
    this.isShare = data;
  }

  @Input()
  public set setCurrentItem(data: any) {
    this.currentItem = data;
  }

  @Input()
  public set setIsMiniDialog(data: any) {
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
          this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
          this.state = message.userInfo.state;
        }
        message['isSelf'] = (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
          || message.owner === this.userDataService.getCurrentUUID());
        this.messageData = message;

      });
    } else {
      message['isSelf'] = (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
        || message.owner === this.userDataService.getCurrentUUID());
      this.messageData = message;
      this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
      this.state = message.userInfo.state;
    }
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
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG,
      data: {
        isShowComment: false,
        currentItem: this.currentItem,
        messageData: this.messageData
      }
    });
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
   * 删除消息闹钟
   * @param event
   * @param messageData
   * @param alarmEle
   */
  deleteChatAlarm(event: MouseEvent, messageData: any, alarmEle: any){
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
   * 点击下载聊天文件
   */
  downloadChatImage(event: any,) {
    event.stopPropagation();
    let formData = {
      form: this.currentItem.form,
      fid: this.messageData.detail.fid
    };
    this.downloadService.downloadFolderFile(formData);
    // let settings = {
    //   mode: '1',
    //   title: 'DOWNLOAD THE IMAGE',
    //   isSimpleContent: true,
    //   simpleContent: 'Are you sure download the image?',
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
      fid: this.messageData.detail.fid
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
   * 文件详情菜单
   */
  clickOnFileMenu(event: MouseEvent, menu: any, menuSelect: any) {
    this.outSetFileMenuDisplay.emit([event, menu, menuSelect]);
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
   * 点击聊天窗口里面的图片展开图片弹框 并且默认打开评论窗
   */
  showImageComments(event: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG,
      data: {
        isShowComment: true,
        currentItem: this.currentItem,
        messageData: this.messageData
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}