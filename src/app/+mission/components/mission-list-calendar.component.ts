///<reference path="../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */

import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ContentChild, Renderer,
  ViewChild, ElementRef, AfterViewChecked, ViewChildren, QueryList
} from "@angular/core";
import {Router} from "@angular/router";
import * as MissionConstant from '../../shared/config/mission.config';
import {
  MissionListAPIModel, MissionDetailAPIModel, MissionDetailTplModel,
  MissionListFilter
} from "../../shared/services/model/entity/mission-entity";
import {MissionModelService, DateService, TypeService} from "../../shared/services/index.service";
import {MissionProgressComponent} from "./mission-progress.component";
import {MissionLinkComponent} from "./mission-link.component";


@Component({
  selector: 'mission-list-calendar',
  templateUrl: '../template/mission-list-calendar.component.html',
  styleUrls: ['../../../assets/css/mission/mission-calendar.css']
})

export class MissionListCalendarComponent implements OnInit, AfterViewChecked {
  private formatString: string = 'yyyy-mm-dd';
  //绑定分页事件
  public mode: string = MissionConstant.MISSION_MODE_CALENDAR;
  public bindPagingEvent: boolean = false;
  public bindDetailEvent: boolean = false;
  public trackingFn: string = MissionConstant.MISSION_FUNCTION_TRACKING;
  public importanceFn: string = MissionConstant.MISSION_FUNCTION_IMPORTANCE;

  public isLoading: any = false;
  public isLoadingType: string = '';
  public missionConstant:any;

  public tplLoadingDetailClass: string = MissionConstant.MISSION_LOADING_CLASS;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public tplPageDataStorage: Array<any> = [];
  public tplPageDataPause: Array<any> = [];

  public tplShownDataList: Array<any> = [];
  public d3: any;

  public isShowMissionLink: boolean = false;
  public showLinkTitle: string = '';


  @ViewChild('missionLink') missionLink: MissionLinkComponent;

  @ViewChild('scrollToBottom') scrollToBottom: ElementRef;

  // @see MissionListComponent.tplFilterData
  @Input('calendarFilter') calendarFilter: MissionListFilter;
  @Output() outLoadingNextPage = new EventEmitter<any>();
  @Output() reloadMissionList = new EventEmitter<any>();
  @Output() OutputIsDraw = new EventEmitter<boolean>();
  private userCurrentPsid: any;

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: TypeService,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: DateService,
              public missionModelService: MissionModelService,
              public renderer: Renderer,
              public router: Router) {
    this.showLinkTitle = 'list';
    this.missionConstant = MissionConstant;
  }

  ngOnInit(): void {
    this.getUserIn();
  }


  ngAfterViewChecked(): void {
    //绑定滚动加载下一页事件
    //Ag2控制间隔
    //使用bindPagingEvent控制是否需要再次绑定
    //对于Ajax返回的新数据，需要重新设置事件，bindPagingEvent将重置为false, @see MissionListCalendarComponent.initPagerData
    let element = this.scrollToBottom.nativeElement;
    let count = 0;
    if (!this.bindPagingEvent && element && element.hasChildNodes()) {
      for (let i = 0, il = element.childNodes.length; i < il; i++) {
        if (element.childNodes[i].tagName === 'DIV') {
          let childElements = element.childNodes[i];
          if (childElements.hasChildNodes()) {
            for (let j = 0, jl = childElements.childNodes.length; j < jl; j++) {
              if (childElements.childNodes[j].tagName === 'UL') {
                let targetElement = childElements.childNodes[j];
                if (targetElement !== 'undefined') {
                  count++;
                  this.mouseWheelFunc(targetElement);
                }
                if (count === 3) {
                  this.bindPagingEvent = true;
                }
              }
            }
          }
        }
      }
    }

  }

  /**
   * 关闭missionLink
   */
  showMissionLink(data) {
    this.isShowMissionLink = !data;
  }

  /**
   * 页面元素滚动触发读取分页数据事件
   * @see MissionListComponent.loadingNextPageMission
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    // Chrome
    let pType = ele.getAttribute('p-type').toString();

    /*    if (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight) {
     ele.scrollTop =  ele.scrollTop+20;
     }*/

    ele.addEventListener('mousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      let currentP = this.calendarFilter[pType];
      if (isToBottom && !this.isLoading && currentP !== MissionConstant.MISSION_PAGER_ENDING) {
        this.isLoading = true;
        this.isLoadingType = pType;
        this.outLoadingNextPage.emit([pType, ele]);
      }
    });
    // FF
    ele.addEventListener('DOMMouseScroll', () => {
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 <= ele.clientHeight);
      let currentP = this.calendarFilter[pType];
      if (isToBottom && !this.isLoading && currentP !== MissionConstant.MISSION_PAGER_ENDING) {
        this.isLoading = true;
        this.isLoadingType = pType;
        this.outLoadingNextPage.emit([pType, ele]);
      }
    });
    // IE
    ele.addEventListener('onmousewheel', () => {
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 === ele.clientHeight);
      let currentP = this.calendarFilter[pType];
      if (isToBottom && !this.isLoading && currentP !== MissionConstant.MISSION_PAGER_ENDING) {
        this.isLoading = true;
        this.isLoadingType = pType;
        this.outLoadingNextPage.emit([pType, ele]);
      }
    });

  };

  /**
   * 4个状态的数据
   * @param data
   */
  initDataList(data: {
    todo: Array<MissionDetailAPIModel>,
    doing: Array<MissionDetailAPIModel>,
    done: Array<MissionDetailAPIModel>,
    storage: Array<MissionDetailAPIModel>,
    pause: Array<MissionDetailAPIModel>
  }) {
    this.bindPagingEvent = false; // 每次对列表数据更改后，需要重新绑定翻页事件
    let tplPageDataTodo = this.initListForTemplate(data.todo);
    let tplPageDataDoing = this.initListForTemplate(data.doing);
    let tplPageDataDone = this.initListForTemplate(data.done);
    this.tplPageDataStorage = this.initListForTemplate(data.storage);
    this.tplPageDataPause = this.initListForTemplate(data.pause);
    this.bindDataListData(tplPageDataTodo, tplPageDataDoing, tplPageDataDone);
  }


  /**
   *
   */
  bindDataListData(tplPageDataTodo: Array<MissionDetailTplModel>, tplPageDataDoing: Array<MissionDetailTplModel>, tplPageDataDone: Array<MissionDetailTplModel>) {
    this.tplShownDataList = [
      {
        key: 'to-do',
        title: 'TO DO',
        data: tplPageDataTodo,
        pageType: 'page_no_todo',
      },
      {
        key: 'doing',
        title: 'DOING',
        data: tplPageDataDoing,
        pageType: 'page_no_doing',

      },
      {
        key: 'done',
        title: 'DONE',
        data: tplPageDataDone,
        pageType: 'page_no_done',
      }
    ];
  }

  /**
   * 加载分页数据
   * @param pageType
   * @param data
   */
  initPagerData(pageType: string, data: Array<MissionDetailAPIModel>, ele: any) {
    switch (pageType) {
      case 'page_no_todo':
        this.tplShownDataList[0].data = this.tplShownDataList[0].data.concat(this.initListForTemplate(data));
        break;
      case 'page_no_doing':
        this.tplShownDataList[1].data = this.tplShownDataList[1].data.concat(this.initListForTemplate(data));
        break;
      case 'page_no_done':
        this.tplShownDataList[2].data = this.tplShownDataList[2].data.concat(this.initListForTemplate(data));
        break;
      case 'page_no_storage':
        this.tplPageDataStorage = this.tplPageDataStorage.concat(this.initListForTemplate(data));
        break;
    }
    // 允许加载其他分页数据
    this.isLoading = false;
    // 需要重新绑定事件
    this.bindPagingEvent = false;
    if (ele) {
      let scrollTop: number = ele.scrollTop;
      setTimeout(() => {
        ele.scrollTop = scrollTop + 500;
      }, 200);
    }
  }


  /**
   * 处理为适合模板显示的数据
   * @param data
   * @return Array<MissionDetailTplModel>
   */
  initListForTemplate(data: Array<MissionDetailAPIModel>): Array<MissionDetailTplModel> {
    if (typeof data === 'undefined') {
      return;
    }
    let cloneData = [];
    data.forEach((obj: MissionDetailAPIModel) => {
      let tplObj = this.initDetailForTemplate(obj);
      this.calculateProgress(tplObj);
      cloneData.push(tplObj);
    });
    return cloneData;
  }

  /**
   * 将API对象转为TPL对象, 并初始化一些显示参数
   * @param dataObj
   * @returns {MissionDetailTplModel}
   */
  initDetailForTemplate(dataObj: MissionDetailAPIModel) {
    let tplObj = new MissionDetailTplModel().init();
    let cloneObj = this.typeService.clone(dataObj);
    this.typeService.bindData(tplObj, cloneObj);
    tplObj.typeTitle = MissionDetailAPIModel.getTypeTitle(dataObj.type);
    tplObj.typeClass = MissionDetailAPIModel.getTypeTitle(dataObj.type, true);
    if (dataObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_IMPORTANCE)) {
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
   *  点击回形针事件
   */
  public sendLinkInfo(data: MissionDetailTplModel) {
    this.isShowMissionLink = true;
    this.missionLink.linkInfo = data.link_info;
    this.missionLink.CurrentMissionObj = data;
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
   *点击按钮选择mission去画
   */
  public clickChooseMission(event: MouseEvent, missionObj: MissionDetailTplModel): void {
    event.stopPropagation();
    missionObj.isChooseToDraw = !missionObj.isChooseToDraw;
    let todo = this.tplShownDataList[0].data.some((value, index, array) => {
      return value.isChooseToDraw;
    });
    let doing = this.tplShownDataList[1].data.some((value, index, array) => {
      return value.isChooseToDraw;
    });
    let done = this.tplShownDataList[2].data.some((value, index, array) => {
      return value.isChooseToDraw;
    });
    this.OutputIsDraw.emit(todo || doing || done);
  }

  /**
   * 得到所有选中的mission
   * @returns {Array}
   */
  public fetchChooseMission(): Array<MissionDetailTplModel> {
    let arr = [];
    for (let i = 0; i < 3; i++) {
      this.tplShownDataList[i].data.forEach((value, index, array) => {
        if (value.isChooseToDraw) {
          arr.push(value);
        }
      });

    }
    return arr;
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


  //获取用户信息
  getUserIn() {
    this.userCurrentPsid = this.userDataService.getCurrentCompanyPSID();
  }

}