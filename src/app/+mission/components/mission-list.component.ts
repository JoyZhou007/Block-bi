/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */
import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, AfterViewInit,
  ViewEncapsulation, OnDestroy, ViewContainerRef, Renderer, AfterViewChecked, ElementRef, HostListener
} from "@angular/core";
import {Router} from "@angular/router";
import * as MissionConstant from '../../shared/config/mission.config';
import {MissionModelService, DateService, TypeService} from "../../shared/services/index.service";
import {
  MissionListFilter, MissionListAPIModel, MissionDetailAPIModel,
  MissionApplication, MissionAssignment, MissionMeeting, MissionProject, MissionTask, MissionFunctionObserver,
  MissionFunctionMemoRecorder, MissionFunctionImportance, MissionFunctionTarget, MissionFunctionExpense,
  MissionFunctionBidding, MissionFunctionTracking, MissionLinkModel, MissionDetailTplModel
} from "../../shared/services/model/entity/mission-entity";
import {MissionListCalendarComponent} from "./mission-list-calendar.component";
import {MissionListScheduleComponent} from "./mission-list-schedule.component";
import {Subscription} from "rxjs/Subscription";
import {MissionListTableComponent} from "./mission-list-table.component";
let introInit = require('intro.js');

@Component({
  selector: 'mission-list',
  templateUrl: '../template/mission-list.component.html',
  styleUrls: [
    '../../../assets/css/mission/mission.css',
    '../../../assets/css/mission/mission-calendar.css',
    '../../../assets/css/mission/mission-calendar-list.css',
    '../../../assets/css/date/date.css',
  ],
  encapsulation: ViewEncapsulation.None
})

export class MissionListComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {


  private formatString: string = 'yyyy-mm-dd HH:MM:ss';
  private missionListAPIData: MissionListAPIModel;// 用户和API接口交互

  // 显示相关
  public mode: string;
  public modePeriod: string = 'day';
  public lastUpdateTime: string = '';
  public tplTypeList: Array<{key: any, title: any}> = [];
  public tplFilterSelfList: Array<{key: any, title: any}> = [];
  // filter相关
  public tplFilterData: MissionListFilter;
  public filterMissionTypeDefault = MissionConstant.MISSION_TYPE_ALL;
  public filterIsSelfDefault = MissionConstant.MISSION_FILTER_ISSELF_DEFAULT;
  public filterIsSelfTitle = MissionConstant.MISSION_FILTER_ISSELF_DEFAULT_TEXT;
  public filterTypeTitle = MissionConstant.MISSION_TYPE_ALL_TEXT;
  public filterHasChanged: boolean = false; // filter是否有变动

  @ViewChild('missionListCalendar') public missionListCalendar: MissionListCalendarComponent;
  @ViewChild('missionListSchedule') public missionListSchedule: MissionListScheduleComponent;
  //mission-list-table
  @ViewChild('missionListTable') public missionListTable: MissionListTableComponent;
  @ViewChild('missionTypeList') public missionTypeList: ElementRef;

  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  //搜索mission
  public missionKeywords: string = '';
  public searchHasResult: boolean = false;
  public searchResultArr: Array<MissionDetailTplModel> = [];
  public subscription: Subscription;
  public isOpenProjectHeader: boolean = false;//是否显示project 头部 schedule模式
  public currentProjectMission: MissionDetailTplModel;
  public missionConstant: any;
  //点击显示mission-list-table
  public showMissionListTable: boolean = false;
  //记录点击table的次数
  private missionTableCounters: number = 1;
  //显示schedule的按钮
  public isShowScheduleBtn: boolean = false;
  //显示画图
  public isShowSchedule: boolean = false;
  public chooseList: Array<MissionDetailTplModel> = [];

  //画mission的容器
  @ViewChild('myTargetDiv', {read: ViewContainerRef}) viewBox;


  @ViewChild('scrollToBottom') scrollToBottom: ElementRef;
  public bindPageEvent: boolean = false;
  public isLoading: boolean = false;
  //mission 搜索的入参
  private searchPage: number = 1;
  public searchSort: number = 1; //0 or 1  1倒序


  constructor(@Inject('type.service') public typeService: TypeService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateFormatService: DateService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('app.config') public appConfig: any,
              public router: Router,
              public renderer: Renderer,
              public missionModelService: MissionModelService) {
    this.missionConstant = MissionConstant;
  }

  ngOnInit(): void {
    this.initDashboard();
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPageEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'search') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelEvent(targetElement);
            this.bindPageEvent = true;
          }
        }

      }
    }
  }


  /**
   * index 页面元素滚动触发分页数据事件 search
   * @param ele
   */
  mouseWheelEvent(ele: any): void {
    ele.addEventListener('mousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.searchPage !== -1) {
        this.isLoading = true;
        this.loadMoreSearch();
      }
    });
    //FF
    ele.addEventListener('DOMMouseScroll', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.searchPage !== -1) {
        this.isLoading = true;
        this.loadMoreSearch();
      }
    })
    //IE
    ele.addEventListener('onmousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.searchPage !== -1) {
        this.isLoading = true;
        this.loadMoreSearch();
      }
    })
  }


  ngAfterViewInit(): void {
    // 根据初始化参数初始数据

    this.subscription = this.notificationService.getNotification().subscribe(() => {

    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  closeMission() {
    this.router.navigateByUrl('user/index');
  }

  /**
   * 切换列表页显示模式
   */
  switchMode() {
    if (!this.showMissionListTable) {
      if (typeof this.mode !== 'undefined') {
        this.mode = (
          (parseInt(MissionConstant.MISSION_MODE_SCHEDULE) + parseInt(MissionConstant.MISSION_MODE_CALENDAR))
          - parseInt(this.mode)
        ).toString();
      } else {
        this.mode = MissionConstant.MISSION_MODE_CALENDAR;
      }
      // 切换模式后分页数据要重置
      this.filterHasChanged = true;
      this.resetFilter();
      if (this.mode !== MissionConstant.MISSION_MODE_SCHEDULE) {
        this.initMission();
      }
      //关闭mission-list-table

    } else {
      this.showMissionListTable = false;
    }
  }

  /**
   * 判断是否为图标模式
   * @returns {boolean}
   */
  isScheduleMode() {
    return this.mode === MissionConstant.MISSION_MODE_SCHEDULE;
  }

  setFilterIsSelfTitle() {
    this.filterIsSelfTitle = this.tplFilterData.getSelfTitle();
  }

  setFilterTypeTitle() {
    this.filterTypeTitle = this.tplFilterData.getTypeTitle();
  }

  /**
   * 设置filter is self
   * @param event
   * @param data
   */
  setFilterIsSelf(event: any, data: string) {
    event.stopPropagation();
    if (data != this.tplFilterData.is_self) {
      this.filterHasChanged = true;
      this.resetFilter();
    }
    this.tplFilterData.is_self = data;
    this.setFilterIsSelfTitle();

    if (this.showMissionListTable) {
      this.fetchMissionTableInterface();
    } else {
      this.initMission();
    }
  }

  /**
   * 设置filter mission type
   * @param event
   * @param data
   */
  setFilterMissionType(event: any, data: string) {
    event.stopPropagation();
    if (data != this.tplFilterData.type[0]) {
      this.filterHasChanged = true;
      this.resetFilter();
    }
    this.tplFilterData.type = [data];
    this.setFilterTypeTitle();
    if (this.showMissionListTable) {
      this.fetchMissionTableInterface();
    } else {
      this.initMission();
    }
  }

  /**
   * 获得mission类型数组
   */
  setMissionTypeList(): void {
    this.tplTypeList = MissionDetailAPIModel.getTypeList();
  }

  /**
   * 获得筛选选项数组
   */
  setMissionFilterList(): void {
    this.tplFilterSelfList = MissionDetailAPIModel.getFilterSelfList();
  }

  /**
   * 根据固定格式获得当前日期
   * @returns {string}
   */
  public nowDate() {
    return this.dateFormatService.nowDateFormat(this.formatString);
  }

  // 页面展示相关函数结束


  // 数据功能函数开始
  /**
   * 关于首页显示样式的初始化
   * 一些默认值的设置
   * TODO: 用户中心获得默认样式或者缓存获取数据
   */
  initDashboard() {
    this.setMissionTypeList();
    this.setMissionFilterList();
    this.mode = MissionConstant.MISSION_MODE_DEFAULT;
    // 默认时间为前一周到今天
    let now = this.nowDate();
    let nowDate = new Date();
    let nowAfterWeek = this.dateFormatService.datePeriod(nowDate.toUTCString(), this.modePeriod, 7, this.formatString);
    let nowBeforeWeek = this.dateFormatService.datePeriod(nowDate.toUTCString(), this.modePeriod, -7, this.formatString);
    this.tplFilterData = new MissionListFilter().init();
    this.typeService.bindData(this.tplFilterData, {
      type: [this.filterMissionTypeDefault],
      is_self: this.filterIsSelfDefault,
      date_start: nowBeforeWeek,
      date_end: nowAfterWeek
    });
    if (this.mode === MissionConstant.MISSION_MODE_CALENDAR) {
      this.initMission();
    }
  }

  /**
   *
   * @returns {{mode: string, filter: MissionListFilter, search_keyword: string}}
   */
  getSettings() {
    return {
      mode: this.mode,
      filter: this.tplFilterData,
      search_keyword: this.missionKeywords ? this.missionKeywords : ''
    }
  }

  /**
   * 重新根据filter获取数据
   */
  resetFilter() {
    if (this.filterHasChanged) {
      this.tplFilterData.page_no_doing = '1';
      this.tplFilterData.page_no_todo = '1';
      this.tplFilterData.page_no_done = '1';
      this.tplFilterData.page_no_storage = '1';
      this.tplFilterData.page_no_schedule = '1';
    }
  }


  reloadMission(data: MissionListFilter) {
    // this.tplFilterData.date_start = data.date_start;
    // this.tplFilterData.date_end = data.date_end;
    this.initMission(true);
  }

  /**
   * 数据初始化
   */
  initMission(forceLoad: boolean = false) {
    let settings = this.getSettings();
    //TODO: 多少时间内的切换不会重新请求ajax
    this.missionModelService.getMissionList({data: settings}, (response: any) => {
      if (response.status === 1) {
        let resData = response.data;
        let missionData = this.bindMissionListObjectData(resData);
        this.missionListAPIData = missionData;
        // 给子元件赋值
        // 日历模式
        this.setCalendarComponentData(missionData.missions);
      } else if (response.status === 400) {
        this.dialogService.openNoAccess();
      } else {
      }
    });
  }

  /**
   *
   */
  loadMoreMission(filterData: Array<any>) {

    let filterStatus = '';
    let filterType = filterData[0];
    let ele = filterData[1];
    //mission-list-table
    if (this.showMissionListTable) {
      this.tplFilterData[filterType] = (parseInt(this.tplFilterData[filterType]) + 1).toString();
      this.missionModelService.getMissionPagerList({
        data: {
          mode: MissionConstant.MISSION_MODE_SCHEDULE,
          filter: this.tplFilterData,
          search_keyword: this.missionKeywords ? this.missionKeywords : '',
          filter_status: filterStatus
        }
      }, (response: any) => {
        this.missionListTable.isLoading = false;
        if (response.status === 1) {
          let resData = response.data;
          let missionsArr = [];
          if (resData.length) {
            for (let j = 0; j < resData.length; j++) {
              // 绑定detail基础字段
              let missionDetailObj = this.bindMissionDetailObjectData(resData[j]);
              missionsArr.push(missionDetailObj);
            }
            // 给子元件赋值
            this.missionListTable.initPagerData(filterType, missionsArr);
          } else {
            this.tplFilterData[filterType] = MissionConstant.MISSION_PAGER_ENDING; // -1表示
          }
        } else {
          this.tplFilterData[filterType] = (parseInt(this.tplFilterData[filterType]) - 1).toString();
        }
      });

      return;
    }

    // 单独请求某种状态的分页
    if (this.mode === MissionConstant.MISSION_MODE_SCHEDULE) {
      // this.tplFilterData.date_start = this.missionListSchedule.calendarFilter.date_start;
      // this.tplFilterData.date_end = this.missionListSchedule.calendarFilter.date_end;
    } else {
      switch (filterType) {
        case 'page_no_todo':
          filterStatus = MissionConstant.MISSION_STATUS_TODO;
          break;
        case 'page_no_doing':
          filterStatus = MissionConstant.MISSION_STATUS_DOING;
          break;
        case 'page_no_done':
          filterStatus = MissionConstant.MISSION_STATUS_DONE;
          break;
        case 'page_no_storage':
          filterStatus = MissionConstant.MISSION_STATUS_STORAGE;
          break;
      }
    }
    this.tplFilterData[filterType] = (parseInt(this.tplFilterData[filterType]) + 1).toString();
    let settings = this.getSettings();
    settings['filter_status'] = filterStatus;
    this.missionModelService.getMissionPagerList({data: settings}, (response: any) => {
      if (this.mode === MissionConstant.MISSION_MODE_CALENDAR) {
        this.missionListCalendar.isLoading = false;
      } else {
      }
      if (response.status === 1) {
        let resData = response.data;
        let missionsArr = [];
        if (resData.length) {
          // TODO 假数据
          // 基础mission数据
          for (let j = 0; j < resData.length; j++) {
            // 绑定detail基础字段
            let missionDetailObj = this.bindMissionDetailObjectData(resData[j]);
            missionsArr.push(missionDetailObj);
          }
          // 给子元件赋值
          // 日历模式
          if (settings.mode === MissionConstant.MISSION_MODE_CALENDAR) {
            this.missionListCalendar.initPagerData(filterType, missionsArr, ele);
          } else {
            // this.missionListSchedule.initPagerData(filterType, missionsArr);
          }
        } else {
          this.tplFilterData[filterType] = MissionConstant.MISSION_PAGER_ENDING; // -1表示
        }
      } else {
        this.tplFilterData[filterType] = (parseInt(this.tplFilterData[filterType]) - 1).toString();
      }
    });
  }

  /**
   * 初始化绑定一个MissionListAPIModel数据
   * @param resData
   * @returns {MissionListAPIModel}
   */
  bindMissionListObjectData(resData: any): MissionListAPIModel {
    // 基础mission数据
    let missionData = new MissionListAPIModel().init();
    this.typeService.bindData(missionData, resData);
    // filter
    let filter = new MissionListFilter().init();
    this.typeService.bindData(filter, resData.filter);
    missionData.filter = filter;
    // mission detail
    let missionsArr: any = {
      'todo': [],
      'doing': [],
      'done': [],
      'storage': [],
      'pause': []
    };

    //TODO 假数据
    // resData=simpleMission;
    // resData=simpleMissionMonth;
    // resData=simpleMissionWeek;

    //假如存在keywords


    for (let k in resData.missions) {
      if (Array.isArray(resData.missions[k]) && missionsArr.hasOwnProperty(k)) {
        let missionGroupData: any = resData.missions[k];
        for (let j = 0; j < missionGroupData.length; j++) {
          // 绑定detail基础字段
          let missionDetailObj = this.bindMissionDetailObjectData(missionGroupData[j]);
          missionsArr[k].push(missionDetailObj);
        }
      } else {
        throw 'mission data of ' + k + ' is not a readable Array!';
      }
    }
    missionData.initMissions(missionsArr);
    let missionScheduleArr = [];
    for (let j in resData.missions_schedule) {
      if (resData.missions_schedule.hasOwnProperty(j)) {
        // 绑定detail基础字段
        let missionDetailObj = this.bindMissionDetailObjectData(resData.missions_schedule[j]);
        missionScheduleArr.push(missionDetailObj);
      }
    }
    missionData.initMissionSchedule(missionScheduleArr);
    return missionData;
  }

  /**
   * 初始化绑定一个MissionDetailAPIModel数据
   * @param resData
   * @returns {MissionDetailAPIModel}
   */
  bindMissionDetailObjectData(resData: any): MissionDetailAPIModel {
    let missionDetailObj = new MissionDetailAPIModel().init();
    this.typeService.bindData(missionDetailObj, resData);
    // 绑定detail对象
    let missionDetailDataObj = {};
    switch (missionDetailObj.type) {
      case MissionConstant.MISSION_TYPE_APPLICATION:
        missionDetailDataObj = new MissionApplication().init();
        break;
      case MissionConstant.MISSION_TYPE_ASSIGNMENT:
        missionDetailDataObj = new MissionAssignment().init();
        break;
      case MissionConstant.MISSION_TYPE_MEETING:
        missionDetailDataObj = new MissionMeeting().init();
        break;
      case MissionConstant.MISSION_TYPE_PROJECT:
        missionDetailDataObj = new MissionProject().init();
        break;
      case MissionConstant.MISSION_TYPE_TASK:
        missionDetailDataObj = new MissionTask().init();
        break;
      default:
        throw 'no mission type find (value : ' + missionDetailObj.type + ')';
    }
    this.typeService.bindData(missionDetailDataObj, resData.detail);
    missionDetailObj.initDetail(missionDetailDataObj);
    // bind link info
    let linkInfo = new MissionLinkModel().init();
    linkInfo.initBefore(resData.link_info.before);
    linkInfo.initAfter(resData.link_info.after);
    missionDetailObj.initLinkInfo(linkInfo);

    // bind function
    let missionFunctionData = {};
    for (let fnType in missionDetailObj.fns) {
      if (missionDetailObj.fns.hasOwnProperty(fnType)) {
        let fnObj = {};
        let fnData = missionDetailObj.fns[fnType];
        switch (fnType) {
          case MissionConstant.MISSION_FUNCTION_OBSERVER:
            fnObj = new MissionFunctionObserver().init();
            break;
          case MissionConstant.MISSION_FUNCTION_MEMO_RECORDER:
            fnObj = new MissionFunctionMemoRecorder().init();
            break;
          case MissionConstant.MISSION_FUNCTION_IMPORTANCE:
            fnObj = new MissionFunctionImportance().init();
            break;
          case MissionConstant.MISSION_FUNCTION_TRACKING:
            fnObj = new MissionFunctionTracking().init();
            break;
          case MissionConstant.MISSION_FUNCTION_BIDDING:
            fnObj = new MissionFunctionBidding().init();
            break;
          case MissionConstant.MISSION_FUNCTION_EXPENSE:
            fnObj = new MissionFunctionExpense().init();
            break;
          case MissionConstant.MISSION_FUNCTION_TARGET:
            fnObj = new MissionFunctionTarget().init();
            break;
          default:
            throw 'no function type find (value : ' + fnType + ')';
        }
        this.typeService.bindData(fnObj, fnData);
        missionFunctionData[fnType] = fnObj;
      }
    }
    missionDetailObj.initFunction(missionFunctionData);
    return missionDetailObj;
  }

  /**
   * 初始化日历模式下的数据
   * @param data
   */
  setCalendarComponentData(data: {
    todo: Array<MissionDetailAPIModel>,
    doing: Array<MissionDetailAPIModel>,
    done: Array<MissionDetailAPIModel>,
    storage: Array<MissionDetailAPIModel>,
    pause: Array<MissionDetailAPIModel>
  }): void {
    // 日历模式
    if (this.missionListCalendar) {
      this.missionListCalendar.initDataList(data);
    }
  }

  /**
   * 初始化schedule模式下的数据
   * @param data
   */
  setScheduleComponentData(data: Array<MissionDetailAPIModel>) {
    if (this.missionListSchedule) {
      this.missionListSchedule.initDateData(data);
    }
  }

  /**
   * 初始化table模式下的数据
   * @param data
   */
  setTableComponentData(data: Array<MissionDetailAPIModel>) {
    if (this.missionListTable) {
      this.missionListTable.initDataList(data);
    }
  }

  /**
   * 读取某一个状态分类下的下一页数据
   * @param data
   */
  loadingNextPageMission(data: any) {
    if (typeof data === 'undefined') {
      return;
    }
    this.loadMoreMission(data);
  }

  // 数据函数结束


  /**
   * 创建新的mission
   */
  createMission(param: string) {
    if (!this.userDataService.getCurrentCompanyPSID()) {
      this.dialogService.openNoAccess();
    } else {
      this.router.navigate(['mission/create', param.toLocaleLowerCase()]);
    }
  }

  /**
   * 搜索框搜索
   */
  searchMission(event: any): void {
    if (event instanceof MouseEvent) {
      this.searchMissionInterface();
    } else if (event instanceof KeyboardEvent) {
      if (event.keyCode === 13) {
        this.searchMissionInterface();
      }
    }
  }

  private searchMissionInterface() {
    if (this.missionKeywords) {
      let settings = this.getSettings();
      this.missionModelService.missionSearchKeywords({
        data: {
          mode: this.mode,
          filter: this.tplFilterData,
          search_keyword: this.missionKeywords ? this.missionKeywords : '',
          page: this.searchPage,
          sort: this.searchSort
        }
      }, (response: any) => {
        if (response.status === 1) {
          let resData = response.data;
          this.searchHasResult = true;
          this.searchResultArr = [];
          if (settings.mode === MissionConstant.MISSION_MODE_SCHEDULE) {
            for (let k in resData.missions_schedule) {
              let missionData = new MissionDetailAPIModel().init();
              this.typeService.bindData(missionData, resData.missions_schedule[k]);
              this.searchResultArr.push(this.missionListSchedule.initDetailForTemplate(missionData));
            }
          } else {
            for (let k in resData.missions) {
              if (resData.missions.hasOwnProperty(k)) {
                resData.missions[k].forEach((d: any) => {
                  let missionData = new MissionDetailAPIModel().init();
                  this.typeService.bindData(missionData, d);
                  this.searchResultArr.push(this.missionListCalendar.initDetailForTemplate(missionData));
                })
              }
            }
          }
        }
      })
    }
  }

  /**
   * 加载搜索的更多的mission
   */
  loadMoreSearch(): void {
    this.searchPage++;
    this.missionModelService.missionSearchKeywords({
      data: {
        mode: this.mode,
        filter: this.tplFilterData,
        search_keyword: this.missionKeywords ? this.missionKeywords : '',
        page: this.searchPage,
        sort: this.searchSort
      }
    }, (response: any) => {
      this.isLoading = false;
      if (response.status === 1) {
        this.bindPageEvent = false;
        let resData = response.data;
        this.searchHasResult = true;
        if (resData.missions.todo.length || resData.missions.doing.length || resData.missions.done.length) {
          for (let k in resData.missions) {
            if (resData.missions.hasOwnProperty(k)) {
              resData.missions[k].forEach((d: any) => {
                let missionData = new MissionDetailAPIModel().init();
                this.typeService.bindData(missionData, d);
                this.searchResultArr.push(this.missionListCalendar.initDetailForTemplate(missionData));
              })
            }
          }
        } else {
          this.searchPage = -1;
        }
      } else {
        this.searchPage--;
      }
    })
  }

  /**
   *
   * @param event
   */
  openChat(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG
    })
  }


  showProjectHeader(data: {
    mission: MissionDetailTplModel,
    isShow: boolean
  }): void {
    this.isOpenProjectHeader = data.isShow;
    this.currentProjectMission = data.mission;
  }


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
   * 点击展示mission-list-table
   * @param event
   */
  public clickShowMissionListTable(event: MouseEvent): void {
    event.stopPropagation();

    this.isShowSchedule = false;
    if (!this.showMissionListTable && this.missionTableCounters === 1) {
      this.fetchMissionTableInterface();
    }
    this.missionTableCounters++;
    this.showMissionListTable = !this.showMissionListTable;
    //每次进入不同模式 都要检查是否要显示画图按钮
    if (this.showMissionListTable) {
      this.isShowScheduleBtn = this.missionListTable.fetchChooseMission().length !== 0;
    } else {
      this.isShowScheduleBtn = this.missionListCalendar.fetchChooseMission().length !== 0;
    }
  }

  /**
   * mission list table请求接口
   */
  private fetchMissionTableInterface(): void {
    this.missionModelService.getMissionList({
      data: {
        mode: MissionConstant.MISSION_MODE_SCHEDULE,
        filter: this.tplFilterData,
        search_keyword: this.missionKeywords ? this.missionKeywords : ''
      }
    }, (response: any) => {
      if (response.status === 1) {
        let resData = response.data;
        // 基础mission数据
        let missionData = this.bindMissionListObjectData(resData);
        this.missionListAPIData = missionData;
        // 给子元件赋值
        // 日历模式
        this.setTableComponentData(missionData.missions_schedule);
      } else if (response.status === 400) {
        this.dialogService.openNoAccess();
      } else {
      }
    });
  }


  /**
   * 显示schedule的按钮
   * @param isShow
   */
  public showScheduleBtn(isShow: boolean): void {
    this.isShowScheduleBtn = isShow;

  }

  /**
   * 点击画出选中的mission
   * @param event
   */
  public clickShowChosenMission(event: MouseEvent): void {
    event.stopPropagation();
    //显示schedule
    this.isShowSchedule = true;
    // let chooseList=[];
    if (this.showMissionListTable) {
      this.chooseList = this.missionListTable.fetchChooseMission();
    } else {
      this.chooseList = this.missionListCalendar.fetchChooseMission();
    }
  }

  /**
   * 点击document
   */
  @HostListener('click', ['$event'])
  click(event: any) {
    this.resetSearch();
  }

  public resetSearch(): void {
    this.searchResultArr = [];
    this.searchPage = 1;
    this.searchSort = 1;
    this.searchHasResult = false;
  }

  /**
   *
   * @param event
   */
  public stopPro(event: any): void {
    event.stopPropagation();
  }

  /**
   * 点击倒序搜索
   * @param event
   */
  public sortSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchResultArr = [];
    this.searchSort = this.searchSort === 1 ? 0 : 1;
    this.searchPage = 1;
    this.searchMission(event)
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



  /**
   * 显示mission list 帮助
   */
  showMissionListHelp(event: any) {
    event.stopPropagation();
    this.showMissionListTable = false;
    let intro = introInit.introJs();
    if (this.translateService.lan == 'zh-cn') {
      intro.setOptions({
        prevLabel: '<em class="icon1-help-arrow"></em><i class="base">上一步</i>',
        nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">下一步</i>',
        exitOnEsc: true,
        hidePrev: false,
        hideNext: true,
        exitOnOverlayClick: false,
        showProgress: true,
        showBullets: true,
        showStepNumbers: false,
        disableInteraction: true,
        tooltipClass: 'help-wrap help-no-padding show-btn',
        steps: [
          {
            element: '#step_mission_list_1',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">任务标题栏，可以筛选任务的类型和来源</div>'
          },
          {
            element: '#step_mission_list_2',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">查阅暂停以及归档的任务</div>'
          },
          {
            element: '#step_mission_list_3',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">这里有列表和状态2种显示方式</div>'
          },
          {
            element: '#step_mission_list_4',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">这里有列表和状态2种显示方式</div>'
          },
          {
            element: '#step_mission_list_5',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">快捷的聊天通道</div>'
          },
          {
            element: '#step_mission_list_6',
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">新建任务，共有6种类型选择</div>'
          },
          {
            intro: '<h3 class="f53-f help-title help-title2">教程' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
            '<div class="help-click">仍然困惑？你可以回放这个教程或联系xxxxxxxxxxxxx更多的帮助！</div>'
          },
        ]
      });
    } else {
      intro.setOptions({
        prevLabel: '<em class="icon1-help-arrow"></em><i class="base">Previous</i>',
        nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">Next</i>',
        exitOnEsc: true,
        hidePrev: false,
        hideNext: true,
        exitOnOverlayClick: false,
        showProgress: true,
        showBullets: true,
        showStepNumbers: false,
        disableInteraction: true,
        tooltipClass: 'help-wrap help-no-padding show-btn',
        steps: [
          {
            element: '#step_mission_list_1',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Task, available to filter the types and sources of tasks</div>'
          },
          {
            element: '#step_mission_list_2',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Reiew those paused or achieved tasks</div>'
          },
          {
            element: '#step_mission_list_3',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Display as List or status</div>'
          },
          {
            element: '#step_mission_list_4',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Hand over your task(s) to someone</div>'
          },
          {
            element: '#step_mission_list_5',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Quick chat</div>'
          },
          {
            element: '#step_mission_list_6',
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">There are 6 types of new tasks when you creating one</div>'
          },
          {
            intro: '<h3 class="f53-f help-title help-title2">tutorial' +
            '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
            '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
            '<div class="help-click">Still confused? You can replay this tutorial or contact xxxxxxxxxxxxx for more help!</div>'
          },
        ]
      });
    }
    intro.start();
    intro.onchange((targetElement: any) => {
      let ele: any = targetElement.getAttribute('data-step');
      if (ele == 'step_mission_list_6') {
        this.renderer.setElementClass(this.missionTypeList.nativeElement, 'show', true);
      } else {
        this.renderer.setElementClass(this.missionTypeList.nativeElement, 'show', false);
      }
      if (!targetElement.getAttribute('data-step')) {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
      } else {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding')
      }
    });
    intro.onexit(()=>{
      this.renderer.setElementClass(this.missionTypeList.nativeElement, 'show', false);
    })
  }

  /**
   * 取消search
   */
  onCloseSearch(){
    this.missionKeywords = '';
  }




}