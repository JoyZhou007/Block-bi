import {
  Component, OnInit, Inject, Input, Output, EventEmitter, ViewChild, AfterViewChecked
} from '@angular/core';

import {ChatMenuList, ChatMessage, ChatUserInfo} from "../../../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {ChatConfig} from "../../../../shared/config/chat.config";
import * as userConstant from "../../../../shared/config/user.config"
@Component({
  selector: 'chat-content-message-text',
  templateUrl: '../../../template/content/message/chat-content-message-text.component.html'
})
export class ChatContentMessageTextComponent implements OnInit, AfterViewChecked {

  public uuid: string = '';
  public psid: string = '';
  public messageData: ChatMessage;
  public currentMenuItem: ChatMenuList;
  public isMiniDialog: boolean = false;
  public isMerge: boolean = false;
  public isSelf: boolean = false;
  public chatConfig: ChatConfig = new ChatConfig();
  public hasBinded: boolean = false;
  public d3: any;
  public userConstant = userConstant;
  //页面交互
  @ViewChild('scrollWrap') public scrollWrap: any;
  public showStates: boolean;
  public state: number;
  private showSelect: boolean = false;
  constructor(public contactModelService: ContactModelService,
              @Inject('notification.service') public notificationService: any,
              @Inject('d3.service') public d3Service: any,
              @Inject('app.config') public appConfig: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: any) {
    this.d3 = this.d3Service.getInstance();
  }


  @Input()
  public set setCurrentItem(data: ChatMenuList) {
    if (data && typeof this.currentMenuItem === 'undefined') {
      this.currentMenuItem = data;
    }
  }

  @Input()
  public set setIsMiniDialog(data: boolean) {
    this.isMiniDialog = data;
  }


  ngAfterViewChecked(): void {
    // 正则解析完成后对 @用户的点击html绑定事件
    if (!this.hasBinded && !this.isMiniDialog && this.messageData && this.currentMenuItem) {
      this.d3.selectAll('a.mention').on('click', (typenames: any, listener: any, capture: any) => {
        let targetUid = this.d3.select(capture[listener]).attr('data-user');
        let position = this.d3.mouse(capture[listener]);
        if (targetUid && (targetUid !== this.userDataService.getCurrentUUID() && targetUid != this.userDataService.getCurrentCompanyPSID())) {
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
                identity: this.currentMenuItem.identity,
                form: this.currentMenuItem.form
              }
            }
          });
        }

      });
      this.hasBinded = true;
    }
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
          this.state = message.userInfo.state;
          this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
        }
        message['isSelf'] = (parseInt(message.owner) == parseInt(this.userDataService.getCurrentCompanyPSID())
        || message.owner == this.userDataService.getCurrentUUID());
        this.messageData = message;
      });
    } else {
      message['isSelf'] = (parseInt(message.owner) == parseInt(this.userDataService.getCurrentCompanyPSID())
      || message.owner == this.userDataService.getCurrentUUID());
      this.messageData = message;
      this.state = message.userInfo.state;
      this.showStates = !!this.typeService.isNumber(message.userInfo.uid);
    }
    this.isMerge = message['isMerge'];
  }


  @Output() outSetAlarmDisplay = new EventEmitter<any>();
  @Output() outOpenMiniDialog = new EventEmitter<any>();
  @Output() outSetMessageAlarm = new EventEmitter<any>();
  @Output() outSetMessagePin = new EventEmitter<any>();
  @Output() outAtUser = new EventEmitter<any>();
  @Output() outForwardMsg = new EventEmitter<any>();
  @Output() outMessageRevoke = new EventEmitter<any>();
  @Output() outDeleteChatAlarm = new EventEmitter<any>();

  //启动
  ngOnInit() {

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
   * dialog点击PIN图标 调用 PIN接口
   */


  /**
   * 点击闹钟图标
   * @param event
   * @param alarm
   * @param alarmSelect
   * @param type
   */
  clickAlarm(event: any, alarm: any, alarmSelect: any, messageData: any) {
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
    let isCommonMessage: boolean = true;
    this.outForwardMsg.emit([event, messageData, isCommonMessage]);
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
