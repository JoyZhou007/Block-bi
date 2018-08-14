import {Component, OnInit, Inject, Input, Output, EventEmitter} from '@angular/core';
import {ChatMessage, ChatUserInfo} from "../../../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../../../shared/services/model/contact-model.service";
import {ChatConfig} from "../../../../shared/config/chat.config";
@Component({
  selector: 'chat-content-mail-message',
  templateUrl: '../../../template/content/message/chat-content-mail-message.component.html'
})
export class ChatContentMailMessageComponent implements OnInit {
  public chatConfig: ChatConfig = new ChatConfig();
  public currentDisplayMessageList: any;
  public userData: any;
  public memberInfo: any;
  public isMerge: boolean = false;

  //页面交互
  constructor(public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: any) {
  }

  ngOnInit() {

  }


  @Input()
  public set setIsMerge(data: {group: Array<ChatMessage>, i: number}) {
    let startIdx = 0;
    if (data.group) {
      for (let index in data.group) {
        //找到第一条不是系统消息的文本消息
        if (data.group.hasOwnProperty(index) && data.group[index].type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT && data.group[index].status === 1) {
          startIdx = parseInt(index);
          break;
        }
      }
    }
    if (startIdx !== data.i) {
      this.isMerge = true;
    }
  }

  @Input()
  public set setInMailData(data: any) {
    this.getUserIn();
    this.currentDisplayMessageList = data;
    for (let i in this.currentDisplayMessageList) {
      this.currentDisplayMessageList[i]['date'] = this.dateService.formatLocal(this.currentDisplayMessageList[i]['time'], 'dS mmm');
      //判断是否是新的一天的数据
      if (parseInt(i) === 0) {
        this.currentDisplayMessageList[i]['isFirstMessageByDay'] = true;
      } else if (this.currentDisplayMessageList[i].dayInfo !== this.currentDisplayMessageList[parseInt(i) - 1].dayInfo) {
        this.currentDisplayMessageList[i]['isFirstMessageByDay'] = true;
      }
      //判断是否是merge的数据
      //  merge规则  只有纯文本消息合并 合并同一个人在一分钟之内发的消息
      if (parseInt(i) !== 0
        && this.currentDisplayMessageList[i].minuteInfo === this.currentDisplayMessageList[parseInt(i) - 1].minuteInfo
        && this.currentDisplayMessageList[i].owner === this.currentDisplayMessageList[parseInt(i) - 1].owner
        && this.currentDisplayMessageList[i].type === this.chatConfig.CHAT_MESSAGE_TYPE_TEXT) {
        this.currentDisplayMessageList[i]['isMerge'] = true;
      }
      let utcTime = new Date(this.currentDisplayMessageList[i].time).toUTCString();
      this.currentDisplayMessageList[i].showTime = this.dateService.formatWithTimezone(utcTime, 'HH:MMtt');
    }
  }


  @Input()
  public set setMemberInfo(data: any) {
    this.memberInfo = data;
  }

  /**
   * toggleMessageByDay 点击天收缩隐藏
   */

  toggleMessageByDay(event: any, data: any) {
    event.stopPropagation();
    for (let i in this.currentDisplayMessageList) {
      if (this.currentDisplayMessageList[i]['date'] === data) {
        this.currentDisplayMessageList[i]['isToggleShow'] = !this.currentDisplayMessageList[i]['isToggleShow'];
      }
    }
  }
  
  /**
   * 获取当前用户信息
   */
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

}