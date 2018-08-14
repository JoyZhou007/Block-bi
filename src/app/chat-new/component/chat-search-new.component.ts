import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  EventEmitter,
  Output
} from "@angular/core";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {Subscription} from "rxjs/Subscription";
import {
  ChatMenuList, ChatMessage,
  ChatMessageSearchInterface,
  ChatMessageSearchMode,
  ChatMessageSearchTplMode,
  ChatSearchGetFrontAndBackMessage,
  ChatSearchMessage, ChatUserInfo, Draft
} from "../../shared/services/model/entity/chat-entity";
import {DateService} from "../../shared/services/common/data/date.service";
import {ChatConfig} from "../../shared/config/chat.config";
import {ContactModelService} from "../../shared/services/model/contact-model.service";

@Component({
  selector: 'chat-search-new',
  templateUrl: '../template/chat-search-new.component.html',
})
export class ChatSearchNewComponent implements AfterViewInit, OnInit, OnDestroy {

  public chatConfig: ChatConfig = new ChatConfig();
  public selectRangeList: Array<any> = [];
  private currentRangeName: string = 'From all';
  private currentTypeName: string = 'All types';

  public showSearchComponent: boolean = false;
  private hasInited: boolean = false;

  public selectTypeNameList: Array<any> = [];
  private subscription: Subscription;
  private dateFormatStr: string = 'yyyy/mm/dd HH:MM';

  public multiCalendar: any = {};
  private showCalendar: boolean = false;
  private calendarStartObj: any = {}; //日历开始时间
  private calendarEndObj: any = {};//日历结束时间

  public dateWord = {
    //月份
    month: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],

    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //周
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday']
  };
  private showMoreMessage: boolean = false;//显示消息前后的消息
  private showMoreSelect: string = '';//显示消息里面的更多操作
  private showChannel: boolean = false;//显示群组
  public currentContactList: Array<any> = [];
  public currentGroupList: Array<any> = [];
  public privateGroupList: Array<ChatSearchMessage> = [];
  public privatePersonList: Array<ChatSearchMessage> = [];
  public businessGroupList: Array<ChatSearchMessage> = [];
  public businessPersonList: Array<ChatSearchMessage> = [];
  public missionGroupList: Array<ChatSearchMessage>;
  public calendarStartTimeStr: string = '';
  public calendarEndTimeStr: string = '';
  public selectTypeValue: number = 0;
  public currentSearchKeyWords: string = '';
  private currentMessageId: string = ''; //当前的msg id
  private currentStartDateStamp: string = ''; //日历开始时间
  private currentEndDateStamp: string = '';
  public currentQueryMessage: ChatMessageSearchTplMode;
  public defaultDateStart: string = '';
  private defaultDateEnd: string = '';
  public currentDetailSearchObj: ChatSearchMessage;
  public currentRangeValue: number = 0;
  public currentItem: ChatMenuList;
  public currentChannelList: Array<any> = []; //下拉框 默认所有
  private isSearchFriend: boolean = false;
  private currentSearchChannelName: string = '';
  public currentSearchFriendId: string = ''; //点击后的当前好友id
  private currentSearchGroupId: number = 0;
  public showChatGroup: boolean = false;
  public currentReturnToGroupId: string | number = '';  //点击跳转到当前聊天组
  public isShowDate: boolean = true;  //点击显示时间日历
  public currentFrontAndBackObj: ChatSearchMessage;
  //解析的消息
  public analyseMessageStr: string = '';
  //当前channel的class
  public currentChannelClsName: string = '';
  public isShowDataMonkey: boolean = true;
  public frontAndBackHasInit: boolean = false;
  //要查询前后消息的那条消息

  @ViewChild('calendarProfile') private calendarProfile: any;
  private isCalendar: string = '';

  //关闭搜索列表
  @Output() public outClearSearch = new EventEmitter<any>();

  //点击收放按钮 保存当前的搜索信息

//显示更多消息
  @Input()
  set searchInfo(inputData: any) {
    if (!inputData) {
      return;
    }
    let event: any = inputData[0];
    let data = inputData[1];

    if (data.length >= 3) {
      this.hasInited = true;
      this.showSearchComponent = true;
      let isChange = data.trim() !== this.currentSearchKeyWords;
      this.currentSearchKeyWords = data.trim();
      if (isChange) {
        this.getSearchInterface();
      } else { //值没变
        if (event instanceof KeyboardEvent) {
          if (event.keyCode === 13) { //enter
            if (data) {
              this.getSearchInterface();
            }
          }

        } else if (event instanceof MouseEvent) {
          if (data) {
            this.getSearchInterface();
          }

        }
      }

    } else {
      this.showSearchComponent = false;
    }
  }

  @Input()
  set specificData(data: any) {
    if (data && data.hasOwnProperty('uid')) {
      if (this.currentGroupList) {
        this.currentGroupList.forEach((value, index, array) => {
          if (value.hasOwnProperty('isFriend')) {
            if (value.isFriend) {
              array.splice(index, 1);
            }
          }
        });
      }
      //向channel列表加入当前聊天的好友
      this.currentChannelClsName = '';
      this.currentSearchFriendId = data.uid;
      this.currentSearchGroupId = 0;
      this.currentSearchChannelName = data.work_name;
      this.currentGroupList.unshift(data);
      this.isSearchFriend = true;
      this.currentReturnToGroupId = data.uid;
    }

  }

  ngOnInit(): void {
    this.currentItem = ChatMenuList.init();

    if (this.couldLoadDashBoard()) {
      this.loadInitData();
    } else {
      this.getChatList(true, () => {
        this.loadInitData();
      });
    }

  }

  /**
   *  初始化数据加载
   */
  private loadInitData() {
    this.initChatMenuList();
    this.initSelectType();
    this.initSelectRange();
    this.multiCalendar = {};

    this.currentQueryMessage = ChatMessageSearchTplMode.init();
    let now: any = new Date();
    let startDate: any = this.dateFormatService.calculatePeriod(new Date(), 'day', -7);
    let startMinute = startDate.getMinutes();
    let endMinute = now.getMinutes();
    //传入5的倍数 ， 上取5的倍数
    if (startMinute % 5) {
      startDate = new Date(startDate.getTime() + (5 - startMinute % 5) * 60 * 1000);
      startMinute = startDate.getMinutes();

    }
    if (endMinute % 5) {
      now = new Date(now.getTime() + (5 - endMinute % 5) * 60 * 1000);
      endMinute = now.getMinutes();
    }
    let newDate = new Date(new Date().setMinutes(startMinute));
    let newStartDate = new Date(startDate.setMinutes(endMinute));
    this.defaultDateEnd = this.dateFormatService.formatWithTimezone(newDate.toUTCString(), this.dateFormatStr);
    this.defaultDateStart = this.dateFormatService.formatWithTimezone(newStartDate.toUTCString(), this.dateFormatStr);
    this.calendarStartObj = {
      year: startDate.getFullYear(),
      month: startDate.getMonth(),
      monthDay: startDate.getDate() < 10 ? `0${startDate.getDate()}` : startDate.getDate(),
      hour: startDate.getHours() < 10 ? `0${startDate.getHours()}` : startDate.getHours(),
      minute: startDate.getMinutes() < 10 ? `0${startMinute}` : startMinute,
      week: this.dateWord.week[startDate.getDay()]
    };
    this.calendarEndObj = {
      year: now.getFullYear(),
      month: now.getMonth(),
      monthDay: now.getDate() < 10 ? `0${now.getDate()}` : now.getDate(),
      hour: now.getHours() < 10 ? `0${now.getHours()}` : now.getHours(),
      minute: now.getMinutes() < 10 ? `0${endMinute}` : endMinute,
      week: this.dateWord.week[now.getDay()]
    };

    this.currentDetailSearchObj = ChatSearchMessage.init();
    this.currentFrontAndBackObj = ChatSearchMessage.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  constructor(@Inject('notification.service') public notificationService: any,
              public chatModelService: ChatModelService,
              @Inject('type.service') public typeService: any,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              public contactModelService: ContactModelService,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('date.service') public dateFormatService: DateService,) {

  }

  ngAfterViewInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        case this.notificationService.config.ACT_COMPONENT_SEARCH_CLOSE: //点击chat的关闭按钮
          this.hasInited = false;
          this.showSearchComponent = false;

          this.currentSearchFriendId = '';
          this.currentSearchGroupId = 0;
          this.currentSearchChannelName = '';
          this.showChatGroup = false;
          // if (this.currentChannelList) {
          //   this.currentChannelList = Draft.deepClone(this.currentGroupList);
          // }
          if (this.currentGroupList) {
            this.currentGroupList.forEach((value, index, array) => {
              if (value.hasOwnProperty('isFriend')) {
                if (value.isFriend) {
                  array.splice(index, 1);
                }
              }
            });
          }
          this.currentReturnToGroupId = '';
          this.currentItem = ChatMenuList.init();
          break;
        case this.notificationService.config.ACT_COMPONENT_CHAT_MENU_CLICK:
          if (message.data) {
            this.showChatGroup = true;
            if (this.currentItem != message.data.menuItem) {
              this.currentItem = message.data.menuItem;
              // this.currentChannelList = Draft.deepClone(this.currentGroupList);
              if (this.currentGroupList) {
                this.currentGroupList.forEach((value, index, array) => {
                  if (value.hasOwnProperty('isFriend')) {
                    if (value.isFriend) {
                      array.splice(index, 1);
                    }
                  }
                });
              }
              if (this.currentItem.isFriend) {
                //向channel列表加入当前聊天的好友
                this.currentSearchFriendId = this.currentItem.uid;
                this.currentSearchGroupId = 0;
                this.currentSearchChannelName = this.currentItem.work_name;
                // this.currentChannelList.unshift(this.currentItem);
                this.currentGroupList.unshift(this.currentItem);

                this.isSearchFriend = true;
                this.currentReturnToGroupId = message.data.menuItem.uid;
              } else {
                this.currentSearchFriendId = '';
                this.currentSearchGroupId = this.currentItem.gid;
                this.currentSearchChannelName = this.currentItem.name;
                this.isSearchFriend = false;
                this.currentReturnToGroupId = this.currentItem.gid;
              }
              if (this.showSearchComponent) {
                this.getSearchInterface();
              }
            } else {
              if (this.currentItem.isFriend) {
                this.currentReturnToGroupId = this.currentItem.uid;
              } else {
                this.currentReturnToGroupId = this.currentItem.gid;
              }
            }

          }


          break;

        case this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE:
          // this.currentChannelList = Draft.deepClone(this.currentGroupList);
          if (this.currentGroupList) {
            this.currentGroupList.forEach((value, index, array) => {
              if (value.hasOwnProperty('isFriend')) {
                if (value.isFriend) {
                  array.splice(index, 1);
                }
              }
            });
          }
          //向channel列表加入当前聊天的好友
          this.currentChannelClsName = '';
          this.currentSearchFriendId = this.currentItem.uid;
          this.currentSearchGroupId = 0;
          this.currentSearchChannelName = this.currentItem.work_name;
          this.currentGroupList.unshift(this.currentItem);
          this.isSearchFriend = true;
          this.currentReturnToGroupId = message.data.uid;
          break;
        default:
          break;
      }
    })
  }

  resetSearchStatus(event: any) {
    if (this.showChannel) {
      this.clickShowChannel(event);
    }
  }

  /**
   * 当有菜单缓存时 不需要再次刷新菜单
   * @returns {boolean}
   */
  couldLoadDashBoard(): boolean {
    // local storage
    let contactListCache = this.userDataService.getContactList();
    // session storage
    let chatMenuCache = this.messageDataService.getChatListCache();
    // chat menu加载完毕
    let c1 = (this.messageDataService.getChatHasLoaded() && chatMenuCache && chatMenuCache !== null);
    // contact list加载完毕
    let c2 = (contactListCache !== null);
    /*    if (!c1) {
     this.getChatList(!this.hasInited && c2);
     }*/
    return c1 && c2;
  }

  /**
   * 获取聊天列表
   */
  getChatList(needLoad: boolean, callBack?: any) {
    if (!this.messageDataService.getChatListCache()) {
      this.chatModelService.getGroupList((data: any) => {
        //获取成功
        if (data.status === 1) {
          this.messageDataService.setChatHasLoaded(true);
          this.messageDataService.setChatListCache(data.data);
          if (typeof callBack === 'function') {
            callBack();
          }
        } else {
          this.messageDataService.setChatHasLoaded(false);
        }
      });
    } else if (this.messageDataService.getChatListCache()) {
      if (typeof callBack === 'function') {
        callBack();
      }
    }
  }


  initChatMenuList(): void {
    let contactListCache = this.userDataService.getContactList();
    let chatListCache = this.messageDataService.getChatListCache();
    if (contactListCache && contactListCache.hasOwnProperty('Cooperator')
      && contactListCache.hasOwnProperty('Friend')
      && contactListCache.hasOwnProperty('Internal')
    ) {
      this.currentContactList =
        contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
    }
    if (chatListCache &&
      chatListCache.hasOwnProperty('MISSION')
      && chatListCache.hasOwnProperty('WORK')
      && chatListCache.hasOwnProperty('PRIVATE')
    ) {
      this.currentGroupList = this.currentGroupList.concat(
        chatListCache.MISSION.concat(chatListCache.WORK.concat(chatListCache.PRIVATE))
      );
    }
    for (let k in this.currentGroupList) {
      let chatMenuList = ChatMenuList.init();
      if (this.currentGroupList.hasOwnProperty(k)) {
        this.typeService.bindData(chatMenuList, this.currentGroupList[k]);
        if (chatMenuList.form === 1) {
          chatMenuList.clsName = 'font-chat-private';
        } else if (chatMenuList.form === 2) {
          if (chatMenuList.is_mission === '1') {
            chatMenuList.clsName = 'font-chat-mission1';
          } else if (chatMenuList.is_mission === '0') {
            chatMenuList.clsName = 'font-chat-business';
          }
        }
        this.currentGroupList[k] = chatMenuList;
      }
    }

    // this.currentChannelList = Draft.deepClone(this.currentGroupList);
  }

  /**
   *click close search
   */
  clickCloseSearch(event?: any): void {
    if (event) {
      event.stopPropagation();
    }
    this.getOutDefault();
    this.showSearchComponent = false;
    this.outClearSearch.emit();
  }

  /**
   * init selectType
   */
  private initSelectType() {
    let value = [
      {
        name: 'All',
        value: 0
      },
      {
        name: 'Text',
        value: 1
      },
      {
        name: 'Post',
        value: 4
      },
      {
        name: 'Image',
        value: 2
      },
      {
        name: 'File',
        value: 3
      }
    ];
    value.forEach((value) => {
      this.selectTypeNameList.push(value);
    })

  }

  /**
   * click choose type
   * @param event
   * @param selectType
   */

  clickSelectType(event: any, selectType: {
    name: string,
    value: number
  }): void {
    event.stopPropagation();
    this.currentTypeName = selectType.name;
    if (this.selectTypeValue !== selectType.value) {
      this.selectTypeValue = selectType.value;
      this.getSearchInterface();
    }

  }


  /**
   * init select range
   */

  private initSelectRange() {
    let value = [
      {
        name: 'From all',
        value: 0
      },
      {
        name: 'Your',
        value: 1
      },
      {
        name: 'Members',
        value: 2
      },
    ];
    value.forEach((value, index, array) => {
      this.selectRangeList.push(value);
    })
  }

  /**
   * click select range
   * @param event
   * @param selectRange
   */

  clickSelectRange(event: any, selectRange: {
    name: string,
    value: number
  }): void {
    event.stopPropagation();
    this.currentRangeName = selectRange.name;
    if (this.currentRangeValue !== selectRange.value) {
      this.currentRangeValue = selectRange.value;

      this.getSearchInterface();
    }
  }

  /**
   * 初始化模板数据
   * @param msgList
   * @param isMission
   */
  private initTplMessage(msgList: Array<ChatMessageSearchMode | ChatMessageSearchTplMode>, isMission: boolean): Array<ChatMessageSearchTplMode> {
    let tplList: Array<ChatMessageSearchTplMode> = [];
    msgList.forEach((value, index, array) => {
      let obj = ChatMessageSearchTplMode.init();
      this.typeService.bindData(obj, value);
      obj.isMission = isMission;
      obj.messageDetailTime = this.initDetailTime(value.time);
      obj.msg = this.analyseMessageText(value.msg);
      if (value.msg_type == this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD) { //转发消息的转义
        obj.detail['original_msg'].msg = this.analyseMessageText(value.detail['original_msg'].msg);
      }
      ChatMessageSearchTplMode.initDetail(obj);
      tplList.push(obj);
    });
    return tplList;
  }


  private initDetailTime(timeStamp: string): any {
    /*let timeStr: any;
     //根据时间算离最近一次修改相差的时间
     let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);*/
    // let updateTime = this.dateFormatService.utcDateFormat(new Date(parseInt(timeStamp)).toUTCString(), this.dateFormatStr);
    let updateTime = this.dateFormatService.formatWithTimezone(new Date(parseInt(timeStamp)).toUTCString(), this.dateFormatStr);

    return updateTime;
  }

  /**
   * click choose time start
   * @param event
   * @param timeStart
   */

  clickChooseTimeStart(event: any, timeStart: any): void {

    this.showChannel = false;
    event.stopPropagation();
    this.showCalendar = !this.showCalendar;
    if (this.isCalendar === 'end') {
      this.showCalendar = true;
    }
    this.isCalendar = this.showCalendar ? 'start' : '';
    this.multiCalendar = {
      data: {
        start: this.calendarStartTimeStr ?
          this.dateFormatService.utcDateFormat(this.calendarStartTimeStr, this.dateFormatStr) : this.calendarStartTimeStr,
        end: this.calendarEndTimeStr ?
          this.dateFormatService.utcDateFormat(this.calendarEndTimeStr, this.dateFormatStr) : this.calendarEndTimeStr
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: this.calendarStartTimeStr != ''
        },
        end: {
          isShowDateTime: this.calendarEndTimeStr != ''
        }
      },
      isClickStart: true,
      isClickEnd: false,
      // isChatSearch: true,
      defaultValue: {
        start: this.defaultDateStart,
        end: this.defaultDateEnd,
      },
      isShow: true,
      isFixed: true,
      subtractValue: -60,
      leftSubtractValue: 42,
      isParent: true,
      parentElement: timeStart.parentElement,
      currentShowElement: this.calendarProfile.nativeElement,
      isSearch: true
    };
  }

  /**
   * click choose time end
   * @param event
   * @param timeEnd
   */

  clickChooseTimeEnd(event: any, timeEnd: any): void {
    event.stopPropagation();
    this.showChannel = false;
    this.showCalendar = !this.showCalendar;
    if (this.isCalendar === 'start') {
      this.showCalendar = true;
    }
    this.isCalendar = this.showCalendar ? 'end' : '';
    this.multiCalendar = {
      data: {
        start: this.calendarStartTimeStr ?
          this.dateFormatService.utcDateFormat(this.calendarStartTimeStr, this.dateFormatStr) : this.calendarStartTimeStr,
        end: this.calendarEndTimeStr ?
          this.dateFormatService.utcDateFormat(this.calendarEndTimeStr, this.dateFormatStr) : this.calendarEndTimeStr
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: this.calendarStartTimeStr != ''
        },
        end: {
          isShowDateTime: this.calendarEndTimeStr != ''
        }
      },
      isClickStart: false,
      isClickEnd: true,
      // isChatSearch: true
      defaultValue: {
        start: this.defaultDateStart,
        end: this.defaultDateEnd,
      },
      isShow: true,
      isFixed: true,
      subtractValue: -60,
      leftSubtractValue: 42,
      isParent: true,
      parentElement: timeEnd.parentElement,
      currentShowElement: this.calendarProfile.nativeElement,
      isSearch: true
    };
  }

  /**
   * 日历点击done
   * @param data
   */
  getSelectData(data: any) {

    if (data.startDate.year) {
      this.calendarStartObj = data.startDate;
    }
    if (data.endDate.year) {
      this.calendarEndObj = data.endDate;
    }
    if (this.calendarStartObj.year) {
      this.calendarStartTimeStr = this.formatCalendarData(this.calendarStartObj);
    }
    if (this.calendarEndObj.year) {
      this.calendarEndTimeStr = this.formatCalendarData(this.calendarEndObj);
    }

    if (data.startDate.startTimeStamp) {
      this.currentStartDateStamp = data.startDate.startTimeStamp.toString();
    }
    if (data.endDate.endTimeStamp) {
      this.currentEndDateStamp = data.endDate.endTimeStamp.toString();
    }

    this.getSearchInterface();
  }

  formatCalendarData(date: any): string {
    let formatDate: string = '';
    if (date.year !== '') {
      formatDate = date.year + '-' + this.formatMonth(date.month) + '-' + date.monthDay + ' ' + date.hour + ':' + date.minute + ':00';
    }
    return formatDate;
  }

  formatMonth(month) {
    if (parseInt(month) < 10) {
      return ('0' + (parseInt(month) + 1));
    }else{
      return month.toString();
    }
  }

  /**
   * click show more message
   * @param event
   * @param messageData
   * @param chatSearchMessage
   */
  clickReadMoreMessage(event: any, messageData: ChatMessageSearchTplMode, chatSearchMessage: ChatSearchMessage): void {
    event.stopPropagation();
    this.frontAndBackHasInit = false;
    this.currentFrontAndBackObj = ChatSearchMessage.init();
    this.showMoreMessage = !this.showMoreMessage;

    if (this.currentMessageId === messageData.msg_id) {
      this.currentMessageId = '';
    } else {
      this.currentMessageId = messageData.msg_id;
    }
    this.currentQueryMessage = messageData;
    let formData: ChatSearchGetFrontAndBackMessage = ChatSearchGetFrontAndBackMessage.init();
    formData.msg_id = messageData.msg_id;
    if (!chatSearchMessage.isFriend) {
      formData.gid = parseInt(chatSearchMessage.id);
      delete formData.friend;
    } else {
      formData.friend = chatSearchMessage.id;
      delete formData.gid;
    }
    this.chatModelService.getFrontAndBackMsg({
      data: formData
    }, (response: any) => {
      if (response.status === 1) {
        if (response.data) {
          if (response.data.msg) {
            if (response.data.msg.length) {
              this.currentFrontAndBackObj = this.initFrontAndBackData(response.data.msg, messageData, response.data.users_info, chatSearchMessage);
            }
          }
        }
      }
    })
  }

  /**
   * click close more message
   * @param event
   * @param messageData
   */
  clickCloseReadMoreMessage(event: any, messageData: ChatMessageSearchTplMode): void {
    event.stopPropagation();
    this.showMoreMessage = !this.showMoreMessage;
    this.currentMessageId = '';
  }

  /**
   * 点击显示消息的下拉框
   * @param event
   * @param messageData
   */
  clickShowMoreSelect(event: any, messageData: ChatMessageSearchTplMode): void {
    event.stopPropagation();
    if (this.showMoreSelect === messageData.msg_id) {
      this.showMoreSelect = '';
    } else {
      this.showMoreSelect = messageData.msg_id;
    }
  }

  /**
   *click show channel
   * @param event
   */
  clickShowChannel(event: any): void {
    this.showChannel = !this.showChannel;
    this.getOutDefault();
  }

  /**
   * click choose channel
   * @param event
   * @param channel
   */
  clickSelectChannel(event: any, channel: ChatMenuList): void {
    event.stopPropagation();
    //信息跳转后 再次切频道
    this.currentReturnToGroupId = '';
    this.showChannel = false;
    let isLoading: boolean = false;
    if (channel.isFriend) {
      this.isSearchFriend = true;
      isLoading = this.currentSearchFriendId !== channel.uid;
      this.currentSearchChannelName = channel.work_name;
      this.currentChannelClsName = '';

      this.currentSearchFriendId = channel.uid;
      this.currentSearchGroupId = 0;
    } else {
      this.currentSearchChannelName = channel.name;
      this.currentChannelClsName = channel.clsName;
      this.currentSearchFriendId = '';
      isLoading = this.currentSearchGroupId !== channel.gid;
      this.currentSearchGroupId = channel.gid;
      this.isSearchFriend = false;
    }

    if (isLoading) {
      this.getSearchInterface();
    }


  }

  /**
   * click choose all channel
   * @param event
   */
  clickSelectAllChannel(event: any): void {
    event.stopPropagation();
    this.currentSearchFriendId = '';
    this.currentSearchGroupId = 0;
    this.showChannel = false;
    this.currentChannelClsName = '';
    //信息跳转后 再次切频道
    this.currentReturnToGroupId = '';
    if (this.currentSearchChannelName !== '') {
      this.currentSearchChannelName = '';
      this.getSearchInterface();
    }


  }

  /**
   * 初始化私人的群组消息列表
   * @param groupObj
   * @param form
   * @param isMission
   * @returns {Array}
   */
  private initSearchMessageGroupList(groupObj: any, form: number, isMission: boolean): Array<ChatSearchMessage> {
    let groupList = [];
    for (let k in groupObj) {
      if (groupObj.hasOwnProperty(k)) {
        let searchObj = ChatSearchMessage.init();
        searchObj.id = k;
        searchObj.isFriend = false;
        searchObj.form = form;
        searchObj.isMission = isMission;
        this.currentGroupList.forEach((value, index, array) => {
          if (value.gid == k) {
            searchObj.name = value.name;
          }
        });
        searchObj.messageInfoList = this.initTplMessage(groupObj[k], isMission);
        groupList.push(searchObj);
      }
    }
    return groupList;
  }

  /**
   * 初始化个人消息列表
   * @param personObj
   * @param form
   * @param isMission
   * @param usersInfo
   * @returns {Array}
   */

  private initSearchMessagePersonList(personObj: any, form: number, isMission: boolean, usersInfo: any): Array<ChatSearchMessage> {
    let personalList = [];
    for (let k in personObj) {
      if (personObj.hasOwnProperty(k)) {
        let searchObj = ChatSearchMessage.init();
        searchObj.id = k;
        for (let key in usersInfo) {
          if (usersInfo.hasOwnProperty(key)) {
            if (key === k) {
              searchObj.name = usersInfo[key].work_name;
            }
          }
        }

        searchObj.isFriend = true;
        searchObj.form = form;
        searchObj.isMission = isMission;
        searchObj.messageInfoList = this.initTplMessage(personObj[k], isMission);
        personalList.push(searchObj);
      }
    }
    return personalList;
  }

  /**
   * 调用查询接口
   */
  private getSearchInterface() {
    let formData = ChatMessageSearchInterface.init();
    formData.keywords = this.currentSearchKeyWords;
    formData.fuid = this.isSearchFriend ? this.currentSearchFriendId : '';
    formData.gid = this.isSearchFriend ? 0 : this.currentSearchGroupId;
    formData.type = this.selectTypeValue;
    formData.start = this.currentStartDateStamp ? this.currentStartDateStamp : new Date(this.defaultDateStart).getTime().toString();
    formData.end = this.currentEndDateStamp ? this.currentEndDateStamp : new Date(this.defaultDateEnd).getTime().toString();
    formData.form = this.currentRangeValue;
    this.chatModelService.chatSearchMessage({
      data: formData
    }, (response: any) => {
      if (response.status === 1) {
        if (response.data) {
          if (response.data.msg) {
            if (response.data.msg.private && response.data.msg.private.group) {
              this.privateGroupList = this.initSearchMessageGroupList(response.data.msg.private.group, 1, false);
            }
            if (response.data.msg.private && response.data.msg.private.person) {
              this.privatePersonList = this.initSearchMessagePersonList(response.data.msg.private.person, 1, false, response.data.info);
            }
            if (response.data.msg.work && response.data.msg.work.group) {
              this.businessGroupList = this.initSearchMessageGroupList(response.data.msg.work.group, 2, false);
            }
            if (response.data.msg.work && response.data.msg.work.person) {
              this.businessPersonList = this.initSearchMessagePersonList(response.data.msg.work.person, 2, false, response.data.info);
            }
            if (response.data.msg.mission && response.data.msg.mission.group) {
              this.missionGroupList = this.initSearchMessageGroupList(response.data.msg.mission.group, 2, true);
            }

            if (this.privateGroupList.length > 0 || this.privatePersonList.length > 0 ||
              this.businessGroupList.length > 0 || this.businessPersonList.length > 0 ||
              this.missionGroupList.length > 0) {
              this.isShowDataMonkey = true;
            } else {
              this.isShowDataMonkey = false;
            }
          }
        }
      }
    })
  }

  /**
   * 点击展开消息组
   * @param event
   * @param chatSearchMessage
   */
  clickShowDetailMessage(event: any, chatSearchMessage: ChatSearchMessage): void {
    event.stopPropagation();
    chatSearchMessage.isClose = !chatSearchMessage.isClose;
  }

  /**
   * 点击跳转到当前聊天组
   * @param event
   * @param chatSearchMessage
   */
  clickReturnToChatGroup(event: any, chatSearchMessage: ChatSearchMessage): void {
    event.stopPropagation();
    if (this.currentReturnToGroupId != chatSearchMessage.id) {
      this.currentReturnToGroupId = chatSearchMessage.id;
      let currentItem = ChatMenuList.init();
      if (chatSearchMessage.isFriend) {
        currentItem.work_name = chatSearchMessage.name;
        currentItem.uid = chatSearchMessage.id;

      } else {
        currentItem.name = chatSearchMessage.name;
        currentItem.gid = parseInt(chatSearchMessage.id);
      }
      currentItem.form = chatSearchMessage.form;
      currentItem.isFriend = chatSearchMessage.isFriend;
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_SEARCH_OPEN_CHAT_GROUP,
        data: {
          currentItem: currentItem
        }
      })

    }

  }

  /**
   *
   * @param event
   */
  clickShowDateRange(event: any): void {
    event.stopPropagation();
    this.isShowDate = !this.isShowDate;
    this.showChannel = false;
    this.getOutDefault();
  }

  /**
   * 初始化消息的前后一条消息
   * @param dataArr
   * @param messageData
   * @param users_info
   * @param chatSearchMessage
   * @returns {ChatSearchMessage}
   */
  private initFrontAndBackData(dataArr: Array<ChatMessage>, messageData: ChatMessageSearchTplMode, users_info: any, chatSearchMessage: ChatSearchMessage): ChatSearchMessage {
    let messageObj = ChatSearchMessage.init();
    messageObj.isMission = chatSearchMessage.isMission;
    messageObj.form = chatSearchMessage.form;
    messageObj.id = chatSearchMessage.id;
    if (!chatSearchMessage.isFriend) {
      this.currentGroupList.forEach((v, index, array) => {
        if (v.gid == messageData.gid) {
          messageObj.name = v.name;
        }
      });
    } else {
      messageObj.name = chatSearchMessage.name;
    }

    dataArr.forEach((value, index, array) => {
      if (value) {
        let obj = ChatMessageSearchTplMode.init();
        let bindData = Object.assign(value, {msg_type: value.type});
        this.typeService.bindData(obj, bindData);
        obj.isMission = messageData.isMission;
        obj.form = messageData.form;
        obj.msg = this.analyseMessageText(value.msg);
        if (value.type === this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD) {
          obj.detail['original_msg'].msg = this.analyseMessageText(value.detail['original_msg'].msg);
          for (let k in users_info) {
            if (users_info.hasOwnProperty(k)) {
              if (k === value.detail.original_msg.owner) {
                obj.detail['original_msg']['owner_profile'] = users_info[k].user_profile_path;
                obj.detail['original_msg']['owner_name'] = users_info[k].work_name;
              }
            }
          }
        }
        for (let k in users_info) {
          if (users_info.hasOwnProperty(k)) {
            if (k === messageData.owner) {
              obj.owner_profile = users_info[k].user_profile_path;
              obj.owner_name = users_info[k].work_name;
            }
          }
        }
        if (messageData.gid) {
          obj.gid = messageData.gid;
        }
        obj.messageDetailTime = this.initDetailTime(value.time);
        messageObj.messageInfoList.push(obj);

      }
    });
    this.frontAndBackHasInit = true;
    return messageObj;
  }

  /**
   * 点击跳转到这条信息的原信息
   * @param event
   * @param messageData
   * @param chatSearchMessage
   */
  clickReturnToDetailMessage(event: any, messageData: ChatMessageSearchTplMode, chatSearchMessage: ChatSearchMessage): void {
    event.stopPropagation();
    let currentItem: ChatMenuList;
    let isDefaultContent: boolean;
    if (this.currentReturnToGroupId) {
      isDefaultContent = false;
      currentItem = this.currentItem;
    } else {
      isDefaultContent = true;
      currentItem = ChatMenuList.init();
      if (chatSearchMessage.isFriend) {
        currentItem.work_name = chatSearchMessage.name;
        currentItem.uid = chatSearchMessage.id;

      } else {
        currentItem.name = chatSearchMessage.name;
        currentItem.gid = parseInt(chatSearchMessage.id);
      }
      currentItem.form = chatSearchMessage.form;
      currentItem.isFriend = chatSearchMessage.isFriend;

    }

    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE,
      data: {
        pinInfo: {
          messageData: messageData
        },
        currentItem: currentItem,
        isDefaultContent: isDefaultContent,
      }
    })

  }

  /**
   * 显示前分析文本中是否有特殊标签和html冲突 <>
   * - 高亮聊天人@ <@USER|uid>
   * - 转发 <@FORWARD|msg_id>
   * - emoji表情 ::EMOJI|#1::
   * - 换行"\n"
   * TODO: 是否有预定义符号
   */
  analyseMessageText(msg: string): string {
    if (msg) {
      //处理换行
      let messageText = msg;
      //处理html
      //messageText = this.escapeHtml(messageText);
      while (messageText.indexOf("\n") !== -1) {
        messageText = messageText.replace("\n", "<br />");
      }
      //处理用户高亮
      if (this.currentContactList) {
        // 找到所有的<@USER|XXX>
        let findReg = new RegExp("(((&|&amp;)lt;)|<)@USER[|](\\S{0,})(((&amp;|&)gt;)|>)", "gm");

        let self = this;
        messageText = messageText.replace(findReg, function (rs, $1, $2, $3, $4): string {
          let str = rs;
          let userObj;
          let isSend = self.currentContactList.some((value, index, array) => {
            return value.uid == $4;
          });
          if (!isSend) {
            self.contactModelService.getUserInfo({
              multi: [$4]
            }, (response: any) => {
              if (response.status === 1) {
                if (response.data && response.data.length) {
                  userObj = response.data[0];

                  //添加到contact-list里面
                  self.currentContactList.push(userObj);
                  str = '<a class="mention"  data-user="' + userObj.uid + '">@' + userObj.work_name + '</a>';
                }
              }
            });
          } else {
            self.currentContactList.forEach((info: ChatUserInfo) => {
              if (info.uid == $4) {
                str = '<a class="mention"  data-user="' + info.uid + '">@' + info.work_name + '</a>';
              }
            });
            return str;
          }

        });
      }
      return messageText;

    }
  }

  /**
   * 日期选择不合法
   * @param event
   */
  dateError(event: any) {
  }

  getOutDefault() {
    this.showCalendar = false;
  }

  //关闭日历
  onCloseCalendar() {
    this.showCalendar = false;
  }
}