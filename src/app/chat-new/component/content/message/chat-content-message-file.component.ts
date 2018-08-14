/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/5/15.
 */
import {AfterViewInit, Component, Inject, Input, Output, EventEmitter} from "@angular/core";
import {Router} from "@angular/router";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {ChatMessage, ChatUserInfo} from "../../../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {DownloadService} from "../../../../shared/services/common/file/download.service";
import * as userConstant from "../../../../shared/config/user.config"
import {ChatConfig} from "../../../../shared/config/chat.config";
@Component({
  selector: 'chat-content-message-file',
  templateUrl: '../../../template/content/message/chat-content-message-file.component.html'
})
export class ChatContentMessageFile implements AfterViewInit {

  public messageData: ChatMessage;
  public currentItem: any;
  public isShare: boolean = false;

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
  public userConstant = userConstant;
  public showStates: boolean;
  public state: number;
  public chatConfig: ChatConfig = new ChatConfig();

  //页面交互
  constructor(public contactModelService: ContactModelService,
              public downloadService: DownloadService,
              @Inject('app.config') public appConfig: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: any) {
  }

  ngAfterViewInit(): void {

  }

  @Input() set setIsShare(data: boolean) {
    this.isShare = data;
  }


  @Input()
  public  set setCurrentItem(data: any) {
    this.currentItem = data;
  }


  @Input()
  public set setMessage(data: {
    userInfoArr: Array<any>, message: ChatMessage
  }) {
    if (data.message) {
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
            this.state = message.userInfo.state;
            this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
          }
          message['isSelf'] =  (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
          || message.owner === this.userDataService.getCurrentUUID());
          this.messageData = message;
          this.getLastUpdateTime(this.messageData.detail);
        });
      } else {
        message['isSelf'] =  (parseInt(message.owner) === parseInt(this.userDataService.getCurrentCompanyPSID())
        || message.owner === this.userDataService.getCurrentUUID());
        this.messageData = message;
        this.getLastUpdateTime(this.messageData.detail);
        this.state = message.userInfo.state;
        this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
      }
    }
  }


  /**
   * 计算最后更新时间
   */
  getLastUpdateTime(data: any) {
    let timestamp = new Date(data.updated).getTime();
    let timeDifference: number = (new Date().getTime() - 28800000 - timestamp) / 1000;
    if (timeDifference >= 365 * 24 * 3600) {
      data.lastUpdateTemplate = this.translateService.manualTranslate('more than one year ago')
    } else if (timeDifference < 365 * 24 * 3600 && timeDifference >= 30 * 24 * 3600) {
      data.lastUpdateTemplate = Math.floor((timeDifference / (30 * 24 * 3600))).toString() + this.translateService.manualTranslate(' months ago')
    } else if (timeDifference < 30 * 24 * 3600 && timeDifference >= 24 * 3600) {
      data.lastUpdateTemplate = Math.floor((timeDifference / (24 * 3600))).toString() + this.translateService.manualTranslate(' days ago')
    } else if (timeDifference < 24 * 3600 && timeDifference >= 3600) {
      data.lastUpdateTemplate = Math.floor((timeDifference / (3600))).toString() + this.translateService.manualTranslate(' hours ago')
    } else if (timeDifference < 3600 && timeDifference >= 60) {
      data.lastUpdateTemplate = Math.floor((timeDifference / 60)).toString() + this.translateService.manualTranslate(' minutes ago')
    } else {
      data.lastUpdateTemplate = this.translateService.manualTranslate('less than one minute ago')
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
  downloadChatFile(event: any,) {
    event.stopPropagation();
    let formData = {
      form: this.currentItem.form,
      fid: this.messageData.detail.fid
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
   * 消息撤回
   * @param event
   * @param messageData
   */
  clickOnRevoke(event: MouseEvent, messageData: any) {
    event.stopPropagation();
    this.outMessageRevoke.emit([event, messageData]);
  }

  /**
   * 文件详情菜单
   */
  clickOnFileMenu(event: MouseEvent, menu: any, menuSelect: any) {
    this.outSetFileMenuDisplay.emit([event, menu, menuSelect]);
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