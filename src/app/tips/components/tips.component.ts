/**
 * Created by joyz on 2017/5/9.
 */

import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  Renderer,
  ViewChildren,
  ContentChild
} from "@angular/core";
import {UserModelService} from "../../shared/services/model/user-model.service";
import * as MissionConstant from '../../shared/config/mission.config';
import {DashboardFilter, Tips, UpdateTips} from "../../shared/services/model/entity/tips-entity";
import {TipsUserData} from "../../shared/services/model/entity/user-entity";
import {Router} from "@angular/router";
import {DateService} from "../../shared/services/common/data/date.service";
import {MissionModelService} from "../../shared/services/model/mission-model.service";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import * as TipConstant from '../../shared/config/tip.config';
import {
  MissionDetailAPIModel,
  MissionDetailTplModel
} from "../../shared/services/model/entity/mission-entity";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {Subscription} from "rxjs/Subscription";
import {Draft} from "../../shared/services/model/entity/chat-entity";

@Component({
  selector: 'tips',
  templateUrl: '../template/tips.component.html',
  styleUrls: ['../../../assets/css/home/home.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [UserModelService, MissionModelService, ContactModelService]
})

export class TipsComponent implements OnInit, AfterViewChecked, OnChanges, OnDestroy, AfterViewInit {
  //当前用户信息
  private currentUserInfo: any;
  public searchUidList: Array<string> = [];
  public isZhLan: boolean;

  ngOnChanges(changes: SimpleChanges): void {
  }

  public hasLoaded: boolean = false;

  //页面交互
  public showHeaderPeopleInfo: boolean = false;
  public userLoginData: any;

  public allCompanyList: any = [];
  public defaultCompany: any = {};
  public companyLength: number;
  public headerLanguageToggle: boolean = true;
  public missionConstant: any;

  //记录用户时候是否打开contact list

  //calendar repeat
  public isShowCalendarRepeat: boolean = false;

  public isShowRepeatSelect: boolean = false;
  public fixData: any = {};
  private alarmObj: any;

  //导航栏
  @ViewChild('userNav') public userNav: any;
  //currentContact
  @ViewChild('contactList') public contactList: any;

  //dashboard
  public dashboardLst: Array<any> = [];

  //date format
  private formatString: string = 'yyyy-mm-dd';

  public mode: string = MissionConstant.MISSION_MODE_CALENDAR;

  public tplLoadingDetailClass: string = MissionConstant.MISSION_LOADING_CLASS;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;

  public trackingFn: string = MissionConstant.MISSION_FUNCTION_TRACKING;

  @ViewChild('scrollToBottom') public scrollToBottom: ElementRef;
  @ViewChild('tipsContent') public tipsContent: ElementRef;
  @ViewChild('biCalendarFixElement') public biCalendarFixElement: ElementRef;

  //是否绑定滚轮事件
  public bindPageEvent: boolean = false;

  public isLoading: boolean = false;

  public tplFilterData: DashboardFilter;

  // 存储用户的头像
  public assetArr: Array<TipsUserData> = [];

  public loadingTimer: any; // 悬停计时器
  public hideTimer: any; // 悬停补足计时器
  public hasInited: boolean = false; //是否读取过详情
  public hasDrawed: boolean = false; // 是否绘制

  //当前的tipObj
  public currentTipObj: Tips;
  //是否为只读模式的tips
  private chatGroupList: any;
  // contact list
  public currentContactList: Array<any> = [];

  public subscription: Subscription;
  public isDashboardLst: boolean;
  public dashboardArr: Array<boolean> = [];

  public dashboardHasInited: boolean = false;
  public isInit: boolean = true;
  public isShowCalendar: boolean;
  private clickIndex: number;

  constructor(@Inject('app.config') public config: any,
              public router: Router,
              private renderer: Renderer,
              @Inject('date.service') public dateService: DateService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('file.service') public fileService: any,
              public userModelService: UserModelService,
              public missionModelService: MissionModelService,
              public chatModelService: ChatModelService,
              @Inject('chat-message-data.service') public messageDataService: any,
              public contactModelService: ContactModelService,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any) {
    this.missionConstant = MissionConstant;
  }

  //启动
  ngOnInit() {
    this.tplFilterData = DashboardFilter.init();
    if (this.couldLoadDashBoard()) {
      this.getContactUserList();
      this.getDashboard();
    } else {
      this.getContactList(() => {
        this.getContactUserList();
        this.getDashboard();
      });
    }
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
    this.currentUserInfo = this.userDataService.getUserIn().user;
    this.isZhLan = this.translateService.lan == 'zh-cn' ? true : false
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {

  }


  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPageEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'dashboard') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelEvent(targetElement);
            this.bindPageEvent = true;
          }
        }

      }
    }
  }

  /**
   * 加载更多tips
   * @param isBool
   * @param index
   */
  getLoadMoreCallBack(isBool: boolean, index: number) {
    //this.dashboardArr[index] = isBool;
  }

  /**
   * 防止本地缓存失效
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
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
    // let c1 = (this.messageDataService.getChatHasLoaded() && chatMenuCache && chatMenuCache !== null);
    // contact list加载完毕
    let c2 = (contactListCache && contactListCache !== null);
    /*    if (!c1) {
     this.getChatList(!this.hasLoaded && c2);
     }*/
    // return c1 && c2;
    return c2;
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


  /**
   * index 页面元素滚动触发分页数据事件
   * @param ele
   */
  mouseWheelEvent(ele: any): void {
    ele.addEventListener('mousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.page !== TipConstant.DashboardFilter_PAGER_ENDING) {
        this.isLoading = true;
        this.loadMoreDashboard();
      }
    });
    //FF
    ele.addEventListener('DOMMouseScroll', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.page !== TipConstant.DashboardFilter_PAGER_ENDING) {
        this.isLoading = true;
        this.loadMoreDashboard();
      }
    })
    //IE
    ele.addEventListener('onmousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.page !== TipConstant.DashboardFilter_PAGER_ENDING) {
        this.isLoading = true;
        this.loadMoreDashboard();
      }
    })
  }

  /**
   * loadMoreDashboard
   */
  loadMoreDashboard(): void {
    this.tplFilterData.page = (parseInt(this.tplFilterData.page) + 1).toString();
    if (this.couldLoadDashBoard()) {
      this.getDashboard();
    }

  }


  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_COMPONENT_OTHER_TIPS:
        this.newTipsInterface(data.data);
        break;
      case this.notificationService.config.ACT_COMPONENT_OTHER_UPDATE_TIPS:
        let updateData = data.data;
        let updateTips = UpdateTips.init();
        updateTips.content = updateData.value.tipsSpecificationValue;
        updateTips.title = updateData.value.tipsTitleValue;
        updateTips.tip_id = updateData.tip_id;
        this.currentTipObj.content = updateData.value.tipsSpecificationValue;
        this.currentTipObj.rid = updateData.tip_id;
        this.isInit = false;
        this.updateTipsInterface(updateTips);
        break;
      case this.notificationService.config.ACT_COMPONENT_ALARM_SEND_TIPS:
        this.judgeReadOrUpdateTips(data.data);
        break;
      case this.notificationService.config.ACT_COMPONENT_TIPS_RELOAD://切换公司
        this.dashboardLst = [];
        this.tplFilterData = DashboardFilter.init();
        let newContactList = data.data;
        this.contactList = newContactList;
        if (this.couldLoadDashBoard()) {
          this.getDashboard();
        }
        break;
      default:
        break;
    }
  }

  /**
   * 显示时间选择框
   * @param tipsAlarmElement
   * @param dashboardObj
   */
  showAlarm(tipsAlarmElement: any, dashboardObj: any, clickIndex: number) {
    let offsetTop: number = tipsAlarmElement.parentElement.parentElement.parentElement.parentElement.offsetTop;
    let objInfo: any = tipsAlarmElement.getBoundingClientRect();
    this.renderer.setElementStyle(this.biCalendarFixElement.nativeElement, 'top', (offsetTop + 40) + 'px');
    this.renderer.setElementStyle(this.biCalendarFixElement.nativeElement, 'left', (objInfo.left - 350) + 'px');
    this.isShowCalendar = !this.isShowCalendar;
    if(this.clickIndex !== clickIndex) {
      this.isShowCalendar = true;
    }
    this.clickIndex = clickIndex;
    if (dashboardObj.showAlarmIcon) {
      if (this.alarmObj) {
        this.alarmObj.showAlarmIcon = false;
      }
      this.alarmObj = dashboardObj;
    } else {
      this.alarmObj = '';
    }
    this.fixData = {
      data: dashboardObj,
      isTip: true,
      hideCalendar: this.isShowCalendar,
      element: this.alarmObj
    };
  }

  /**
   * 点击闹钟
   */
  onClickAlarm(event: any, dashboardObj: Tips, tipsAlarmElement: any, clickIndex: number) {
    event.stopPropagation();
    dashboardObj.showAlarmIcon = !dashboardObj.showAlarmIcon;
    this.showAlarm(tipsAlarmElement, dashboardObj, clickIndex);
  }

  /**
   * 点击设置过的闹钟
   */
  onClickedAlarm(event: any, index: number, dashboardObj: Tips, tipsAlarmElement: any) {
    event.stopPropagation();
    //30分钟内不可点
    let now = new Date().getTime();
    let targetTime = dashboardObj.effective_time * 1000;
    if (targetTime - now < 30 * 60 * 1000) return false;
    dashboardObj.showAlarmIcon = !dashboardObj.showAlarmIcon;
    this.showAlarm(tipsAlarmElement, dashboardObj, index);
  }

  /**
   * 清除记录的数据
   */
  intiDefault() {
    if (this.alarmObj) {
      this.alarmObj.showAlarmIcon = false;
      this.isShowCalendar = false;
      this.alarmObj = '';
      this.clickIndex = -1;
    }
  }

  /**
   * 得到calendar fix 传出的值
   */
  getFix(event: any) {
    this.isShowCalendarRepeat = false;
    this.clearAlarmIcon();
    //传出设过闹钟的tip  rid
    for (let i = 0; i < this.dashboardLst.length; i++) {
      if (this.dashboardLst[i].rid == event.rid) {
        this.dashboardLst[i].has_alarm = 1;
        this.dashboardLst[i].alarm_id = event.alarm_id;
        this.dashboardLst[i].effective_time_display = this.getDateStr(event.effective_time);
        this.dashboardLst[i].effective_time = event.effective_time;
        this.dashboardLst[i].isShowCalendarFix = false;
      }
    }
  }

  /**
   * 删除闹钟
   * @param event
   */
  deleteFix(event: any) {
    //传出设过闹钟的tip  rid
    for (let i = 0; i < this.dashboardLst.length; i++) {
      if (this.dashboardLst[i].rid == event.id) {
        this.dashboardLst[i].has_alarm = 0;
        this.dashboardLst[i].alarm_id = 0;
        this.dashboardLst[i].effective_time_display = '';
        this.dashboardLst[i].isShowCalendarFix = false;
      }
    }
  }

  /**
   * 时间戳转化为字符串
   */
  getDateStr(date: any): string {
    let dateFormat = 'yyyy-mm-dd HH:MMtt';
    let newDate = new Date(date * 1000);
    return this.dateService.formatWithTimezone(newDate.toUTCString(), dateFormat);
  }

  /**
   * 清除icon显示
   */
  clearAlarmIcon() {
    for (let i = 0; i < this.dashboardLst.length; i++) {
      if (this.dashboardLst[i].showAlarmIcon) {
        this.dashboardLst[i].showAlarmIcon = false;
        this.dashboardLst[i].isShowCalendarFix = false;
      }
    }
  }


  /**
   *  get dashboard detail info
   */
  getDashboard(): void {
    let tplFilterData = this.tplFilterData;
    let formData = {
      data: {
        page: tplFilterData.page,
        order:1
      }
    };
    this.hasLoaded = true;
    this.userModelService.getHomepageDashboard(formData, (response: any) => {
      this.isLoading = false;
      if (response.status === 1) {
        if (response.data.length) {
          this.bindPageEvent = false;
          for (let k in response.data) {
            if (response.data.hasOwnProperty(k)) {
              let dataValue = response.data[k];
              if (dataValue.hasOwnProperty('form') && dataValue.form === TipConstant.TIP_FORM) { //tips
                let tip = this.initTipsForTemplate(dataValue);
                this.dashboardLst.push(tip);
              } else if (!dataValue.hasOwnProperty('form')) { //mission
                let missionDetail = this.initMissionForTemplate(dataValue);
                this.calculateProgress(missionDetail);
                this.dashboardLst.push(missionDetail);
              }
            }
          }
          //去掉 重复
          this.searchUidList = this.searchUidList.filter((value, index, array) => {
            return array.indexOf(value) === index;
          });
          if (this.searchUidList.length) {
            this.contactModelService.getUserInfo({
              multi: this.searchUidList
            }, (response: any) => {
              if (response.status == 1) {
                this.currentContactList = this.currentContactList.concat(response.data);
                this.currentContactList = this.currentContactList.filter((value, index, array) => {
                  return array.indexOf(value) === index;
                });
                this.InitTipsUserInfo();
              }
            })
          } else {
            this.InitTipsUserInfo();
          }
          this.searchUidList = [];
        } else {
          this.tplFilterData.page = '-1';
        }
        this.dashboardHasInited = true;
      } else {
        this.tplFilterData.page = (parseInt(tplFilterData.page) - 1).toString();
      }
      this.dashboardLength();
    })
  }


  /**
   * init tips 模板数据
   * @param tipsObj
   * @param callback
   */

  initTipsForTemplate(tipsObj: any, callback?: any): Tips {
    let tplTips: Tips = Tips.init();
    let cloneObj = Draft.deepClone(tipsObj);
    this.typeService.bindData(tplTips, cloneObj);


    tplTips.createDetailTime = this.dateService.formatLocal(tplTips.created * 1000, 'HH:MMtt ddS mmm');
    //判断share to 的 id是不是在contact list 里面，没有就加到search list
    if (tplTips.shared_to.length) {
      for (let i = 0; i < tplTips.shared_to.length; i++) {
        let counter = 0;
        for (let j = 0; j < this.currentContactList.length; j++) {
          if (tplTips.shared_to[i] !== (this.currentContactList[j].uid || this.currentContactList[j].uuid)) {
            counter++;
          }
        }
        if (counter === this.currentContactList.length) {
          this.searchUidList.push(tplTips.shared_to[i]);
        }
      }
    }
    //判断owner 是否在contact list 里面
    let isSearch = this.currentContactList.some(value => (value.uid || value.uuid) === tplTips.owner);
    if (!isSearch) {
      this.searchUidList.push(tplTips.owner);
    }

    if (tplTips.effective_time) {
      tplTips.effective_time_display = this.getDateStr(tipsObj.effective_time);
    }
    let uid = (tplTips.type === '1') ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
    tplTips.ableEdit = uid === tplTips.owner;

    if (typeof callback === "function") {
      callback();
    }
    return tplTips;
  }


  /**
   * 处理为适合模板显示的数据  mission
   * @param data
   * @return Array<MissionDetailTplModel>
   */
  initMissionForTemplate(data: MissionDetailAPIModel): MissionDetailTplModel {
    if (typeof data === 'undefined') {
      return;
    }
    return this.initMissionDetailForTemplate(data);
  }


  /**
   * 将API对象转为TPL对象, 并初始化一些显示参数
   * @param dataObj
   * @returns {MissionDetailTplModel}
   */
  initMissionDetailForTemplate(dataObj: MissionDetailAPIModel) {
    let tplObj = new MissionDetailTplModel().init();
    // let cloneObj = this.typeService.clone(dataObj);
    this.typeService.bindData(tplObj, dataObj);
    tplObj.typeTitle = MissionDetailAPIModel.getTypeTitle(dataObj.type);
    tplObj.typeClass = MissionDetailAPIModel.getTypeTitle(dataObj.type, true);
    if (dataObj.fns.hasOwnProperty(parseInt(MissionConstant.MISSION_FUNCTION_IMPORTANCE))) {
      tplObj.importance = parseInt(dataObj.fns[parseInt(MissionConstant.MISSION_FUNCTION_IMPORTANCE)].value);
    }
    if (dataObj.last_update_info.hasOwnProperty('time')) {
      tplObj.last_update_locale_time = this.dateService.formatWithTimezone(dataObj.last_update_info.time);
    }
    return tplObj;
  }


  /**
   * 计算要绘制的进度条, 开始时间, 结束时间
   * todo状态
   * @param tplObj
   */
  calculateProgress(tplObj: MissionDetailTplModel) {
    // 对于开始时间，首先检查是否有连接其他mission
    let lInfo = tplObj.link_info;
    //如果有, 开始时间为连接到该mission的link
    if (Array.isArray(lInfo.before) && lInfo.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined')) {
      let beforeMission = lInfo.before[0];
      tplObj.startIsLink = true;
      tplObj.initStartLinkInfo(beforeMission);
    } else {
      let startDate = '';
      // 对于 doing和done的开始时间应该检查实际开始时间
      // todo无real_start时间
      switch (tplObj.mission_status) {
        case MissionConstant.MISSION_STATUS_DONE:
          startDate = tplObj.real_start;
          break;
        case MissionConstant.MISSION_STATUS_DOING:

        case MissionConstant.MISSION_STATUS_PAUSE:
          startDate = tplObj.real_start;
          break;
        case MissionConstant.MISSION_STATUS_RESET:
          tplObj.endIsPending = true;
          break;
        case MissionConstant.MISSION_STATUS_TODO:
        case MissionConstant.MISSION_STATUS_PENDING:
        default:
          startDate = tplObj.start;
          if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
            startDate = this.dateService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
          }
          break;
      }
      let startDayTime = this.dateService.formatWithTimezone(startDate, 'dd');
      let startMonthTime = this.dateService.formatWithTimezone(startDate, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(startDate, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(startDate, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(startDate, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(startDate, 'MM');
      tplObj.initStartTimeInfo({
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      });
    }

    // 对于结束时间，只看有没有设置时间
    // 如果有，显示具体数值
    // 如果没有，显示pending
    if ((tplObj.end === MissionConstant.MISSION_TIME_NULL || tplObj.end === '')
      && tplObj.mission_status !== MissionConstant.MISSION_STATUS_DONE
      && tplObj.mission_status !== MissionConstant.MISSION_STATUS_STORAGE
    ) {
      tplObj.endIsPending = true;
    } else {
      let endDate = tplObj.end;
      switch (tplObj.mission_status) {
        case MissionConstant.MISSION_STATUS_DONE:
          endDate = tplObj.real_end ? tplObj.real_end : tplObj.real_end_timestamp;
          break;
        case MissionConstant.MISSION_STATUS_TODO:
        case MissionConstant.MISSION_STATUS_PENDING:
        case MissionConstant.MISSION_STATUS_DOING:
        case MissionConstant.MISSION_STATUS_RESET:
        case MissionConstant.MISSION_STATUS_PAUSE:
        default:
          endDate = tplObj.end;
          if (tplObj.end === MissionConstant.MISSION_TIME_NULL) {
            endDate = this.dateService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
          }
          break;
      }
      let endDayTime = this.dateService.formatWithTimezone(endDate, 'dd');
      let endMonthTime = this.dateService.formatWithTimezone(endDate, 'mmm');
      let endYearTime = this.dateService.formatWithTimezone(endDate, 'yyyy');
      let endWeekTime = this.dateService.formatWithTimezone(endDate, 'dddd');
      let endHourTime = this.dateService.formatWithTimezone(endDate, 'HH');
      let endMinuteTime = this.dateService.formatWithTimezone(endDate, 'MM');
      tplObj.initEndTimeInfo({
        day: endDayTime,
        week: endWeekTime,
        month: endMonthTime,
        minute: endMinuteTime,
        hour: endHourTime,
        year: endYearTime,
      });
    }
    /**
     * 计算进度文字
     */
    switch (tplObj.mission_status) {
      // 对于todo状态只要有开始或者结束时间的任一为不确定，则进度时间为?
      case MissionConstant.MISSION_STATUS_TODO:
      case MissionConstant.MISSION_STATUS_RESET:
      case MissionConstant.MISSION_STATUS_PENDING:
        if (tplObj.endIsPending || tplObj.startIsLink) {
          tplObj.todoProgressTime = MissionConstant.MISSION_PROGRESS_TIME_DEFAULT;
        } else {
          let diffInfo = this.dateDiff(tplObj.end, tplObj.start);
          tplObj.todoProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        }
        break;
      // 对于done状态, 取的是实际开始与实际结束结束时间作为进度条
      case MissionConstant.MISSION_STATUS_DONE:
      case MissionConstant.MISSION_STATUS_STORAGE:
        let diffInfo = this.dateDiff(tplObj.real_end ? tplObj.real_end : tplObj.real_end_timestamp, tplObj.real_start);
        tplObj.doneProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        break;
      // 对于doing状态，取的是实际开始时间到当前时间为doing状态
      // 如果结束为pending 无透明部分
      case MissionConstant.MISSION_STATUS_DOING:
      case MissionConstant.MISSION_STATUS_PAUSE:

        let nowDate = this.dateService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
        let endDate = tplObj.end ? tplObj.end : nowDate;
        if (tplObj.endIsPending) {
          let diffInfo = this.dateDiff(nowDate, tplObj.real_start);
          tplObj.doingProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        } else {

          // 那么取
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          tplObj.doingProgressTime = diffInfoDoing.gapTime + diffInfoDoing.diffUnit;
          let diffInfoTodo = this.dateDiff(endDate, tplObj.real_start);
          tplObj.todoProgressTime = diffInfoTodo.gapTime + diffInfoTodo.diffUnit;
          let p = diffInfoDoing.gapTime / diffInfoTodo.gapTime * 100;
          if (p < 0) {
            p = 0;
          } else if (p > 100) {
            // 如果状态仍然是doing, 但是今天已经超过了设置的end时间, 只显示100%
            p = 100;
          }
          tplObj.fillLengthDoing = p.toString();
        }
    }
  }


  /**
   * 时间差, 允许显示单位为mo - 月, h - 小时, d - 天
   * @param d2 timestamp 结束时间
   * @param d1 timestamp 开始时间
   * @returns {{gapTime: number, diffUnit: string}}
   */
  public dateDiff(d2: string, d1: string) {
    if (typeof d1 === 'string') {
      d1 = d1.replace(/-/g, '/');
    }
    if (typeof d2 === 'string') {
      d2 = d2.replace(/-/g, '/');
    }
    let D1 = new Date(d1);
    let D2 = new Date(d2);
    let gapTime = (Date.parse(d2) - Date.parse(d1)) / 1000;
    let diffStatus = 'hour';
    let diffUnit = '';
    if (gapTime > (3600 * 24 * 30 * 12)) {
      diffStatus = 'year';
    } else if (gapTime > (3600 * 24 * 30)) {
      diffStatus = 'month';
    } else if (gapTime > (3600 * 24)) {
      diffStatus = 'day';
    } else if (gapTime < 3600) {
      diffStatus = 'minute';
    }
    switch (diffStatus) {
      case 'minute':
        diffUnit = 'm';
        gapTime = gapTime / 60;
        break;
      case 'hour':
        diffUnit = 'h';
        gapTime = gapTime / (24 * 3600 * 30);
        break;
      case 'month':
        let d1Y = D1.getFullYear();
        let d2Y = D2.getFullYear();
        let d1M = D1.getMonth();
        let d2M = D2.getMonth();
        diffUnit = 'mo';
        gapTime = (d2M + 12 * d2Y) - ( d1M + 12 * d1Y);
        break;
      case 'year':
        diffUnit = 'y';
        gapTime = D2.getFullYear() - D1.getFullYear();
        break;
      case 'day':
      default:
        diffUnit = 'd';
        gapTime = gapTime / (24 * 3600);
        break;
    }
    let gapTimeStr = Math.ceil(gapTime);
    return {
      gapTime: gapTimeStr.toString() !== 'NaN' ? gapTimeStr : -1,
      diffUnit: diffUnit
    }
  };


  /**
   *
   * @param event
   * @param missionObj
   */
  redirectToDetail(event: any, missionObj: MissionDetailTplModel) {
    event.stopPropagation();
    this.router.navigate(['mission/detail', missionObj.typeTitle.toLowerCase(), missionObj.mid]);
  }


  /**
   *  open  new tips dialog  新建
   */
  openTipsDialog(event: any): void {
    this.newTipsDialog();
  }

  /**
   * open new tips dialog
   */
  newTipsDialog(): void {
    this.dialogService.openNew({
      mode: '1',
      title: 'Note',
      isSimpleContent: false,
      componentSelector: 'user-tips-dialog',
      componentData: {},
      buttons: [{
        type: 'send',
        btnEvent: 'sendData'
      }, {
        type: 'cancel',
      }]
    });
  }


  /**
   * new tips 新建
   */
  newTipsInterface(data: any): void {
    let tipObj = Tips.init();
    tipObj.content = data.value.tipsSpecificationValue;
    tipObj.ownerInfo = this.currentUserInfo;
    tipObj.createDetailTime = this.dateService.formatLocal(new Date(), 'HH:MM ddS mmm');
    //默认没选share_to传个人
    tipObj.type = data.shareToArr.length === 0 ? '1' : data.shareToArr[0].form;
    let shareArr = [];
    data.shareToArr.forEach((value) => {
      shareArr.push(value.id)
    });
    tipObj.shared_to = shareArr;
    let formData = {
      data: tipObj
    };
    this.userModelService.newTips(formData, (response: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
      if (response.status === 1) {
        tipObj.rid = response.data;
        //可以修改的权限
        tipObj.ableEdit = true;
        tipObj.owner = (tipObj.type === '1') ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID();
        tipObj = this.initTipsForTemplate(tipObj);

        this.dashboardLst.unshift(tipObj);
        this.InitTipsUserInfo();
        // this.dashboardLength();
      } else {

      }
    });
  }


  /**
   * click open update dialog
   */
  clickOpenUpdateDialog(event: any, tipObj: Tips): void {
    event.stopPropagation();
    this.currentTipObj = tipObj;
    this.openUpdateOrDetailDialog(tipObj, false);
  }

  /**
   * judge read or update tips
   */
  judgeReadOrUpdateTips(readObj: {
    // owner: string,
    rid: string,
  }): void {
    if (readObj) {
      let rid = readObj.rid;
      // let owner = readObj.owner;
      let uid = this.userDataService.getCurrentUUID();
      let psid = this.userDataService.getCurrentCompanyPSID();

      this.userModelService.showTipsDetail({id: rid}, (response: any) => {
        if (response.status === 1) {
          //判断owner是否一致
          if (response.data[0]) {
            let tipOwner = response.data[0].owner;
            let isReadTips = !((tipOwner === uid) || (tipOwner === psid));
            let tipObj = Tips.init();
            this.typeService.bindData(tipObj, response.data[0]);
            tipObj = this.initTipsForTemplate(tipObj, () => {
              this.openUpdateOrDetailDialog(tipObj, isReadTips)
            });
          }
        }
      })
    }
  }

  /**
   * open update or readDetail dialog
   */
  openUpdateOrDetailDialog(tipObj: Tips, isReadTips: boolean): void {
    if (isReadTips) {
      this.dialogService.openNew({
        mode: '1',
        title: 'READ TIPS',
        isSimpleContent: false,
        componentSelector: 'update-or-read-detail-tips',
        componentData: this.typeService.clone({
          readTips: isReadTips,
          tipObj: tipObj
        }),
      });
    } else {
      this.dialogService.openNew({
        mode: '1',
        title: 'EDIT TIPS',
        isSimpleContent: false,
        componentSelector: 'update-or-read-detail-tips',
        componentData: this.typeService.clone({
          readTips: isReadTips,
          tipObj: tipObj
        }),
        buttons: [
          {
            type: 'send',
            btnEvent: 'sendData',
            btnEventParam: {},
          }, {
            type: 'cancel',
          }]
      });
    }

  }

  /**
   * update tips
   */
  updateTipsInterface(updateTips: UpdateTips): void {
    let formData = {
      data: updateTips
    };
    this.userModelService.updateTips(formData, (response: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
    })
  }


  /**
   *  click delete tips
   */
  clickDeleteTips(event: any, tipsObj: Tips): void {
    event.stopPropagation();
    this.dialogService.openNew({
      mode: '1',
      title: 'DELETE TIP',
      simpleContent: 'confirm delete tip',
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'delete',
          btnEvent: () => {
            this.deleteTips(tipsObj);
          },
        },

      ]
    })

  }

  /**
   * delete tips
   */
  deleteTips(tipsObj: Tips): void {
    let formData = {
      data: {
        'tip_id': tipsObj.rid
      }
    };
    this.userModelService.deleteTips(formData, (response: any) => {
      if (response.status === 1) {
        this.dashboardLst.forEach((value, index, array) => {
          if (value === tipsObj) {
            array.splice(index, 1);
          }
        })
      } else {
        this.dialogService.openWarning({simpleContent:'delete tips failed!'})
      }
    })
  }

  /**
   * 首页删除mission 显示
   */
  deletePromoteMission(event: any, mission: any) {
    event.stopPropagation();
    this.dialogService.openNew({
      title: 'CONFIRM PROMOTED',
      simpleContent: 'Confirm promoted mission',
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'delete',
          btnEvent: () => {
            let data: any = {
              mid: mission.mid,
              form: 1
            };
            this.userModelService.deletePromoted({data}, (res: any) => {
              if (res.status == 1) {
                this.dashboardLst.forEach((value, index, array) => {
                  if (value.mid === mission.mid) {
                    array.splice(index, 1);
                  }
                })
              } else {
                this.dialogService.openWarning({simpleContent:'delete mission failed!'})
              }
            })
          },
        },
      ]
    });
  }


  dashboardLength() {
    this.isDashboardLst = this.typeService.getDataLength(this.dashboardLst) > 0;
  }


  /**
   * 点击用户头像显示半屏聊天(迷你聊天窗)  tips
   */
  openMiniDialog(event: MouseEvent, tipObj: Tips, userObj?: TipsUserData) {
    let memberInfo = userObj ? userObj : tipObj.ownerInfo;
    if (memberInfo.uid === this.userDataService.getCurrentUUID()
      || memberInfo.uid === this.userDataService.getCurrentCompanyPSID()) {
    } else {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-mini-dialog',
          options: {
            member: memberInfo,
            form: parseInt(tipObj.type)
          }
        }
      });
    }
  }


  /**
   *  获取缓联系人列表 并保存
   */
  public getContactUserList(): void {
    let contactListCache = this.userDataService.getContactList();
    // let chatListCache = this.messageDataService.getChatListCache();
    this.currentContactList =
      contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));

    //将storage 里的userData 加到contact list里
    if(this.userDataService.getData('user_data')) {
      let userData = this.userDataService.getData('user_data').user;
      this.currentContactList.push(userData);
    }
  }

  /**
   * 給tips 的userInfo 赋值
   * @constructor
   */
  public InitTipsUserInfo(): void {
    this.dashboardLst.forEach((value, index, array) => {
      if (value.hasOwnProperty('form') && value.form === TipConstant.TIP_FORM) { //tips
        //owner 找头像
        for (let val of this.currentContactList) {
          if (val.uid === value.owner || val.uuid === value.owner) {
            value.ownerInfo = val;
            value.ownerInfo.user_profile_path = this.fileService.getImagePath(36, value.ownerInfo.user_profile_path);
            break;
          }
        }
        //share to 找头像
        value.sharedToInfoList = [];
        if (value.shared_to.length) {
          for (let i = 0; i < value.shared_to.length; i++) {
            for (let info of this.currentContactList) {
              if (info.uid === value.shared_to[i]) {
                value.sharedToInfoList.push(info);
                break;
              }
            }
          }


        }
      }

    });
  }

  /**
   * 打开mission dialog
   */
  openMissionChatDialog(event: any, missionObj: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'mission-chat-dialog',
        options: missionObj
      }
    });
  }

}