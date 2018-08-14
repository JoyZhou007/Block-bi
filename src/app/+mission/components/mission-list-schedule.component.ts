/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/4.
 */
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */

import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, AfterViewChecked,
  ElementRef, Renderer, ViewEncapsulation,
} from "@angular/core";
import { Router } from "@angular/router";
import * as MissionConstant from '../../shared/config/mission.config';
import { MissionListAPIData } from '../data/mission-data';
import {
  MissionListAPIModel, MissionListFilter,
  MissionDetailAPIModel, MissionDetailTplModel
} from "../../shared/services/model/entity/mission-entity";
import { DateService } from "../../shared/services/common/data/date.service";
import { TypeService } from "../../shared/services/model/base/type.service";
import { D3Service } from "../../shared/services/common/draw/d3.service";
import { MissionModelService } from "../../shared/services/index.service";
import { now } from "d3-timer";
import { MissionLinkComponent } from "./mission-link.component";
import { values } from "d3-collection";
import { MissionProgressComponent } from "./mission-progress.component"
import { element } from "protractor";
import {
  MISSION_STATUS_DOING,
  MISSION_STATUS_DONE, MISSION_TYPE_APPLICATION, MISSION_TYPE_ASSIGNMENT,
  MISSION_TYPE_MEETING, MISSION_TYPE_PROJECT, MISSION_TYPE_TASK
} from "../../shared/config/mission.config";
import { ScheduleOptions } from "../schedule-options";

@Component({
  selector: 'mission-list-schedule',
  templateUrl: '../template/mission-list-schedule.component.html',
  styleUrls: ['../../../assets/css/mission/mission-calendar.css'],
  encapsulation: ViewEncapsulation.None
})

export class MissionListScheduleComponent implements OnInit, AfterViewChecked {
  public mode: string = MissionConstant.MISSION_MODE_SCHEDULE;
  public missionConstant = MissionConstant;
  private formatString: string = 'yyyy-mm-dd HH:MM:ss';
  public tplShownDataList: Array<any> = [];
  public tplShownChildDataList: Array<any> = [];
  //接受子mission
  @ViewChild('progress') progress: MissionProgressComponent;
  public showChildMission: boolean = false;

  //下滚加载
  @ViewChild('scrollToBottom') public scrollToBottom: ElementRef;

  @Output() OutputOpenProject = new EventEmitter<{
    mission: MissionDetailTplModel,
    isShow: boolean
  }>(); //显示 project 头部


  //mission-link
  @ViewChild('missionLink') missionLink: MissionLinkComponent;
  public isShowMissionLink: boolean = false;
  public showLinkTitle: string = '';

  // 时间筛选跨度
  public dateFilterPeriodArr: Array<any> = [
    {key: 'day', title: 'DAY'},
    {key: 'week', title: 'WEEK'},
    {key: 'month', title: 'MONTH'}
  ];
  // 生效模式
  public activePeriod: string = 'month'; // day | week | month

  //当前的时间
  public nowDate: Date = new Date();
  // 模板相关
  // 当前生效的模式
  public currentDate: Date;
  // 实际生效的筛选开始时间和结束时间
  public currentStartTime: any;
  public currentEndTime: any;
  public showDayHighLight: string = '';
  public showMonthHighLight: string = '';
  public showWeekHighLight: string = '';

  public weekNames: Array<string>;

  public displayDate: string = '';
  public dateFormatStr: string = 'ddS mmm';
  public dayArray: any = [];
  public dayStartDate: Date;
  public dayEndDate: Date;


  public displayWeek: string = '';
  public weekArray: any = [];
  public weekFormatStr = '';
  public weekStartDate: any;
  public weekEndDate: any;

  public displayMonth: string = '';

  public monthArray: any = [];
  public monthFormatStr = '';
  public monthStartIdx: number;
  public monthEndIdx: number;
  public monthStartDate: Date;
  public monthEndDate: Date;
  public monthStartNumber: number = 1;

  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;

  @Input() public scheduleOptions: ScheduleOptions;

  @ViewChild('svgWrapper') svgWrapper: ElementRef;

  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('d3.service') public D3: D3Service,
              @Inject('type.service') public typeService: TypeService,
              @Inject('date.service') public dateFormatService: DateService,
              public missionModelService: MissionModelService,) {
    //确定link是lst模式下
    this.showLinkTitle = 'list';
  }

  ngOnInit(): void {


  }

  ngOnChanges(): void {
  }

  public ngAfterViewInit() {
    if (this.scheduleOptions.content && this.scheduleOptions.content.length) {
      this.initDateData(this.scheduleOptions.content);
    }
  }

  /**
   * 关闭missionLink
   */
  showMissionLink(data) {
    this.isShowMissionLink = !data;
  }

  /**
   *
   */
  ngAfterViewChecked(): void {

  }


  /**
   *初始化时间跨度
   * @param data
   */
  initDateData(data: Array<any>) {
    // this.currentDate = new Date('2017-3-20');
    let timeArr = [];
    data.forEach((value, index, array) => {
      if (value.start_timestamp && value.start_timestamp > 0) {
        timeArr.push(parseInt(value.start_timestamp) * 1000);
      } else {
        timeArr.push(new Date().getTime());
      }
      if (value.real_start_timestamp && value.real_start_timestamp > 0) {
        timeArr.push(parseInt(value.real_start_timestamp) * 1000);
      } else {
        timeArr.push(new Date().getTime());
      }
      if (value.end_timestamp && value.end_timestamp > 0) {
        timeArr.push(parseInt(value.end_timestamp) * 1000);
      } else {
        timeArr.push(new Date().getTime());
      }
      if (value.real_end_timestamp && value.real_end_timestamp > 0) {
        timeArr.push(parseInt(value.real_end_timestamp) * 1000);
      } else {
        timeArr.push(new Date().getTime());
      }
      if (value.detail.hasOwnProperty('approve_time')) {
        value.detail.approve_time.forEach((value) => {
          if (value.hasOwnProperty('time_str') && value.time_str) {
            timeArr.push(parseInt(value.time_str) * 1000);
          }
        })
      }
    });
    let latest = Math.max.apply(null, timeArr);
    let earliest = Math.min.apply(null, timeArr);
    //假如没有最大最小时间 就定位今天
    if (latest && earliest) {
      let gapTime = (latest - earliest);
      let diffStatus = 'hour';
      if (gapTime > (1000 * 3600 * 24 * 6)) {
        diffStatus = 'month';
      } else if (gapTime > (1000 * 3600 * 24 )) {
        diffStatus = 'week';
      }
      //确定默认打开哪个 模式 week or day or  month
      switch (diffStatus) {
        case 'hour':
          this.activePeriod = 'day';
          break;
        case 'month':
          this.activePeriod = 'month';
          break;
        case 'week':
          this.activePeriod = 'week';
          break;
        default:
          break;
      }
    }


    // this.currentDate = new Date();
    this.currentDate = new Date(latest);
    // 设置月份的第一天和最后一天
    this.monthStartDate = this.dateFormatService.calculatePeriod(this.currentDate, 'day', -15);
    this.monthEndDate = this.dateFormatService.calculatePeriod(this.currentDate, 'day', 15);
    this.monthStartDate = new Date(this.monthStartDate.getFullYear(), this.monthStartDate.getMonth(), this.monthStartDate.getDate(), 0);
    this.monthEndDate = new Date(this.monthEndDate.getFullYear(), this.monthEndDate.getMonth(), this.monthEndDate.getDate(), 0);
    //day时间段
    this.dayStartDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate(), 8);
    this.dayEndDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate(), 23);
    //week时间段
    this.weekStartDate = this.dateFormatService.calculatePeriod(this.currentDate, 'day', -3);
    this.weekEndDate = this.dateFormatService.calculatePeriod(this.currentDate, 'day', 3);
    this.weekStartDate = new Date(this.weekStartDate.getFullYear(), this.weekStartDate.getMonth(), this.weekStartDate.getDate(), 0);
    this.weekEndDate = new Date(this.weekEndDate.getFullYear(), this.weekEndDate.getMonth(), this.weekEndDate.getDate(), 0);
    switch (this.activePeriod) {
      case 'week':
        this.currentStartTime = this.weekStartDate;
        this.currentEndTime = this.weekEndDate;
        break;
      case 'month':
        this.currentStartTime = this.monthStartDate;
        this.currentEndTime = this.monthEndDate;
        break;
      case 'day':
      default:
        this.currentStartTime = this.dayStartDate;
        this.currentEndTime = this.dayEndDate;
        break;
    }
    this.initDayDataArr();
    this.initWeekDataArr();
    this.initMonthDataArr();
    this.initDataList(data)
  }

  /**
   * 初始化day 数组
   */
  public initDayDataArr() {
    // 生成day数组
    this.displayDate = this.dateFormatService.format(this.dayStartDate, this.dateFormatStr);
    let startTime = this.dayStartDate.getHours();
    let endTime = this.dayEndDate.getHours();
    this.dayArray.length = 0;
    if (startTime <= 8) {
      for (let i = startTime; i <= endTime; i++) {
        let label = 'am';
        let number;
        if (i > 12) {
          label = 'pm';
          number = (i - 12).toString() + ':00';
        } else {
          number = i.toString() + ':00';
        }
        let obj = {
          i: i,
          detailTime: `${this.dayStartDate.getFullYear()}/${this.dayStartDate.getMonth() + 1}/${this.dayStartDate.getDate()}/${i}`,
          time: number,
          label: label,
        };
        this.dayArray.push(obj);
      }
    }
    else {//currentStart时间超过8点
      for (let i = startTime; i <= 23; i++) {
        let label = 'am';
        let number;
        if (i > 12) {
          label = 'pm';
          number = (i - 12).toString() + ':00';
        } else {
          number = i.toString() + ':00';
        }
        let obj = {
          i: i,
          detailTime: `${this.dayStartDate.getFullYear()}/${this.dayStartDate.getMonth() + 1}/${this.dayStartDate.getDate()}/${i}`,
          time: number,
          label: label,
        };
        this.dayArray.push(obj);
      }

      for (let i = 0; i <= endTime; i++) {
        let label = 'am';
        let number;
        if (i > 12) {
          label = 'pm';
          number = (i - 12).toString() + ':00';
        } else {
          number = i.toString() + ':00';
        }
        let obj = {
          i: i,
          detailTime: `${this.dayEndDate.getFullYear()}/${this.dayEndDate.getMonth() + 1}/${this.dayEndDate.getDate()}/${i}`,
          time: number,
          label: label,
        };
        this.dayArray.push(obj);
      }
    }
    //显示高亮
    this.showDayHighLight =
      `${this.nowDate.getFullYear()}/${this.nowDate.getMonth() + 1}/${this.nowDate.getDate()}/${this.nowDate.getHours()}`;

  }

  /**
   * 初始化week 数组
   */
  public initWeekDataArr() {
    // 生成week数组
    this.weekFormatStr = 'ddS mmm';
    this.displayWeek = this.dateFormatService.format(this.weekStartDate, this.weekFormatStr);
    this.weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.weekArray.length = 0;
    let k = 0;

    if (this.weekStartDate.getDay() === 0) {
      for (let i = 0; i <= 6; i++, k++) {
        let label = this.weekNames[i];
        let number = i + 1;
        let obj = {
          i: i,
          detailTime: `${this.weekEndDate.getFullYear()}/${this.weekStartDate.getMonth() + 1}/${this.weekStartDate.getDate() + k}`,
          number: number,
          label: label
        };
        this.weekArray.push(obj);
      }
    } else {
      for (let i = this.weekStartDate.getDay(); i <= 6; i++, k++) {
        let label = this.weekNames[i];
        let number = i + 1;
        let obj = {
          i: i,
          detailTime: `${this.weekStartDate.getFullYear()}/${this.weekStartDate.getMonth() + 1}/${this.weekStartDate.getDate() + k}`,
          number: number,
          label: label
        };
        this.weekArray.push(obj);
      }
      for (let i = 0; i <= this.weekEndDate.getDay(); i++, k++) {
        let label = this.weekNames[i];
        let number = i + 1;
        let obj = {
          i: i,
          detailTime: `${this.weekStartDate.getFullYear()}/${this.weekStartDate.getMonth() + 1}/${this.weekStartDate.getDate() + k}`,
          number: number,
          label: label
        };
        this.weekArray.push(obj);
      }
    }
    //显示高亮
    this.showWeekHighLight =
      `${this.nowDate.getFullYear()}/${this.nowDate.getMonth() + 1}/${this.nowDate.getDate()}`;
  }


  /**
   * 初始化月份 数组
   */
  public initMonthDataArr() {
    this.monthArray.length = 0;
    this.monthFormatStr = 'mmm';
    this.weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.displayMonth = this.dateFormatService.format(this.currentStartTime.getTime(), this.monthFormatStr);
    // 获取当前月份的天数
    let currentMonthDate = new Date(this.currentStartTime.getFullYear(), this.currentStartTime.getMonth() + 1, 0);
    let monthDay = currentMonthDate.getDate();
    //当前月份的第一天 和 最后一天
    this.monthStartIdx = this.monthStartDate.getDate();
    this.monthEndIdx = this.monthEndDate.getDate();
    //获取monthStartDate的当前月最后一天
    let currentStartDateLastDate = new Date(this.monthStartDate.getFullYear(), this.monthStartDate.getMonth() + 1, 0);
    let startDateLastDate = currentStartDateLastDate.getDate();
    //获取二月份的天数
    let FebDate = new Date(this.monthStartDate.getFullYear(), 2, 0);
    let FebDateLastDate = FebDate.getDate();
    if (this.monthStartDate.getMonth() === this.monthEndDate.getMonth()) {
      for (let i = 1; i <= monthDay; i++) {
        let dateForMonthWeek = new Date(this.currentStartTime.getFullYear(), this.currentStartTime.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentStartTime.getFullYear()}/${this.currentStartTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }
    }
    else if (this.monthStartDate.getMonth() === 0 &&
      (this.monthStartDate.getDate() === 31 ||
        this.monthStartDate.getDate() === 30)
    ) {
      for (let i = this.monthStartIdx; i <= startDateLastDate; i++) {
        let dateForMonthWeek = new Date(this.monthStartDate.getFullYear(), this.monthStartDate.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentStartTime.getFullYear()}/${this.currentStartTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }
      for (let i = 1; i <= FebDateLastDate; i++) {
        let dateForMonthWeek = new Date(this.monthEndDate.getFullYear(), this.monthEndDate.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentEndTime.getFullYear()}/${this.currentEndTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }
      for (let i = 1; i <= this.monthEndIdx; i++) {
        let dateForMonthWeek = new Date(this.monthEndDate.getFullYear(), this.monthEndDate.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentEndTime.getFullYear()}/${this.currentEndTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }

    }
    else {
      for (let i = this.monthStartIdx; i <= startDateLastDate; i++) {
        let dateForMonthWeek = new Date(this.monthStartDate.getFullYear(), this.monthStartDate.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentStartTime.getFullYear()}/${this.currentStartTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }
      for (let i = 1; i <= this.monthEndIdx; i++) {
        let dateForMonthWeek = new Date(this.monthEndDate.getFullYear(), this.monthEndDate.getMonth(), i);
        let label = this.weekNames[dateForMonthWeek.getDay()];
        let obj = {
          i: i,
          detailTime: `${this.currentEndTime.getFullYear()}/${this.currentEndTime.getMonth() + 1}/${i}`,
          number: i,
          label: label
        };
        this.monthArray.push(obj);
      }

    }

    //显示高亮
    this.showMonthHighLight =
      `${this.nowDate.getFullYear()}/${this.nowDate.getMonth() + 1}/${this.nowDate.getDate()}`;
  }

  /**
   * 更新日期数组
   *
   * @param event
   * @param status 0-向前 | 1-向后
   */
  public updateDataArr(event: any, status?: number) {
    event.stopPropagation();
    if (status === 0) {
      this.switchToBefore();
    } else if (status === 1) {
      this.switchToNext();
    }
  }


  /**
   *  切换到前一天
   */
  switchToBefore(diff: number = 1): void {
    switch (this.activePeriod) {
      case 'day':
        this.dayStartDate = this.dateFormatService.calculatePeriod(this.dayStartDate.getTime(), 'hour', -diff);
        this.dayEndDate = this.dateFormatService.calculatePeriod(this.dayEndDate.getTime(), 'hour', -diff);
        this.currentStartTime = this.dayStartDate;
        this.currentEndTime = this.dayEndDate;
        this.initDayDataArr();
        this.rePaint();
        break;
      case 'week':
        // this.weekStartDate.setDate(this.weekStartDate.getDate() - 1);
        this.weekStartDate = this.dateFormatService.calculatePeriod(this.weekStartDate.getTime(), 'day', -diff);
        this.weekEndDate = this.dateFormatService.calculatePeriod(this.weekEndDate.getTime(), 'day', -diff);
        this.currentStartTime = this.weekStartDate;
        this.currentEndTime = this.weekEndDate;
        this.initWeekDataArr();
        this.rePaint()
        break;
      case 'month':
        this.monthStartDate.setDate(this.monthStartDate.getDate() - diff);
        this.monthEndDate.setDate(this.monthEndDate.getDate() - diff);
        this.currentStartTime = this.monthStartDate;
        this.currentEndTime = this.monthEndDate;
        this.monthStartNumber--;
        this.initMonthDataArr();
        //控制SVG的位置
        this.rePaint()
        break;
    }
  }

  /**
   *  切换到后一天
   */
  switchToNext(diff: number = 1): void {
    switch (this.activePeriod) {
      case 'day':
        this.dayStartDate = this.dateFormatService.calculatePeriod(this.dayStartDate, 'hour', diff);
        this.dayEndDate = this.dateFormatService.calculatePeriod(this.dayEndDate, 'hour', diff);
        this.currentStartTime = this.dayStartDate;
        this.currentEndTime = this.dayEndDate;
        this.initDayDataArr();
        this.rePaint()
        break;
      case 'week':
        this.weekStartDate = this.dateFormatService.calculatePeriod(this.weekStartDate, 'day', diff);
        this.weekEndDate = this.dateFormatService.calculatePeriod(this.weekEndDate, 'day', diff);
        this.currentStartTime = this.weekStartDate;
        this.currentEndTime = this.weekEndDate;
        this.initWeekDataArr();
        this.rePaint()
        break;
      case 'month':
        this.monthStartDate.setDate(this.monthStartDate.getDate() + diff);
        this.monthEndDate.setDate(this.monthEndDate.getDate() + diff);
        this.currentStartTime = this.monthStartDate;
        this.currentEndTime = this.monthEndDate;
        this.initMonthDataArr();
        //发送变化后的day数据
        this.rePaint()
        //显示高亮
        //控制SVG的位置
        this.monthStartNumber++;
        break;
    }

  }

  /**
   * 切换 日/周/月
   * @param event
   * @param obj
   */
  switchFilterPeriod(event: any, obj: any) {
    event.stopPropagation();
    if (obj.key !== this.activePeriod) {
      this.activePeriod = obj.key;
      // 更改对应开始时间和结束时间， 并且调用上级component的初始化数据
      // @see
      switch (this.activePeriod) {
        case 'week':
          this.currentStartTime = this.weekStartDate;
          this.currentEndTime = this.weekEndDate;
          this.rePaint()
          break;
        case 'month':
          this.currentStartTime = this.monthStartDate;
          this.currentEndTime = this.monthEndDate;
          this.rePaint()
          break;
        case 'day':
        default:
          this.currentStartTime = this.dayStartDate;
          this.currentEndTime = this.dayEndDate;
          this.rePaint()
          break;
      }
      // this.calendarFilter.date_start = this.dateFormatService.utcDateFormat(this.currentStartTime, this.formatString);
      // this.calendarFilter.date_end = this.dateFormatService.utcDateFormat(this.currentEndTime, this.formatString);
      // this.calendarFilterChange.emit([this.calendarFilter]);
    }

  }


  /**
   * 接受project点击传送过来的子mission
   */
  receiveMissionChildData(data: MissionDetailTplModel) {
    //显示project的头像
    this.OutputOpenProject.emit({
      mission: data,
      isShow: true
    });
    //将status为7的子mission发送给后台
    let missionArr = [];
    data.detail.internal.forEach((value) => {
      if (value.status === MissionConstant.MISSION_STATUS_DONE) {
        missionArr.push(value.id)
      }
    })
    let formData = {
      data: missionArr
    };
    this.missionModelService.projectScheduleDetail(formData, (response: any) => {
      if (response.status === 1 && this.typeService.getObjLength(response.data) > 0) {
        this.tplShownChildDataList = this.initListForTemplate(response.data);
      }
    });
    this.showChildMission = true;
    this.initDataList(this.tplShownDataList, true)
  }

  /**
   * 点击箭头返回之前的Mission
   */
  returnToAgoMission() {
    this.OutputOpenProject.emit({
      mission: null,
      isShow: false
    });
    this.showChildMission = false;
    // 需要重新绑定事件
    this.initDataList(this.tplShownDataList);
  }

  /**
   * 重新绘制  并且不向后台发送数据
   */
  rePaint() {
    if (this.showChildMission) {
      this.tplShownChildDataList = this.initListForTemplate(this.tplShownChildDataList);
    } else {
      this.tplShownDataList = this.initListForTemplate(this.tplShownDataList);
    }
  }

  initDataList(data: Array<MissionDetailAPIModel>, showChildMission: boolean = false) {
    if (showChildMission) {
      this.tplShownChildDataList = this.initListForTemplate(this.tplShownChildDataList);
    } else {
      this.tplShownDataList = this.initListForTemplate(data);
      // this.saveOldMission = data;
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
      let tplObj = this.bindDetailForTemplate(obj);
      cloneData.push(tplObj);
    });
    return cloneData;
  }

  /**
   * 将API对象转为TPL对象, 并初始化一些显示参数
   * @param dataObj
   * @returns {MissionDetailTplModel}
   */
  initDetailForTemplate(dataObj: MissionDetailAPIModel): MissionDetailTplModel {
    let tplObj = new MissionDetailTplModel().init();
    let cloneObj = this.typeService.clone(dataObj);
    this.typeService.bindData(tplObj, cloneObj);
    tplObj.typeTitle = MissionDetailAPIModel.getTypeTitle(dataObj.type);
    tplObj.typeClass = MissionDetailAPIModel.getTypeTitle(dataObj.type, true);
    //开始点
    if (dataObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_IMPORTANCE)) {
      tplObj.importance = parseInt(dataObj.fns[parseInt(MissionConstant.MISSION_FUNCTION_IMPORTANCE)].value);
    }
    if (dataObj.last_update_info.hasOwnProperty('time')) {
      tplObj.last_update_locale_time = this.dateFormatService.formatWithTimezone(dataObj.last_update_info.time);
    }
    return tplObj;
  }

  /**
   * 对于完整详情的mission进行逻辑计算
   * 包括功能图标的显示，进度条，开始与结束时间
   * @param apiObj
   */
  bindDetailForTemplate(apiObj: MissionDetailAPIModel) {
    let tplObj = this.initDetailForTemplate(apiObj);
    this.calculateProgress(tplObj);
    return tplObj;
  }


  /**
   * 计算要绘制的进度条, 开始时间, 结束时间
   * todo状态
   * @param tplObj
   */
  calculateProgress(tplObj: MissionDetailTplModel) {


    /**
     * 绘制方法
     */
    this.calculateDetail(tplObj);

    /**
     * 计算进度文字
     */
    switch (tplObj.mission_status) {
      // 对于todo状态只要有开始或者结束时间的任一为不确定，则进度时间为?
      case MissionConstant.MISSION_STATUS_TODO:
      case MissionConstant.MISSION_STATUS_PENDING:
      case MissionConstant.MISSION_STATUS_RESET:
        if (tplObj.endIsPending || tplObj.startIsLink) {
          tplObj.todoProgressTime = MissionConstant.MISSION_PROGRESS_TIME_DEFAULT;
        } else {
          let diffInfo = this.dateDiff(tplObj.end, tplObj.start, true, true);
          tplObj.todoProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        }
        break;
      // 对于done状态, 取的是实际开始与实际结束结束时间作为进度条
      case MissionConstant.MISSION_STATUS_DONE:
      case MissionConstant.MISSION_STATUS_STORAGE:
        let diffInfo = this.dateDiff(tplObj.real_end, tplObj.real_start, true, true);
        tplObj.doneProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        tplObj.todoProgressTime = diffInfo.gapTime + diffInfo.diffUnit;
        break;
      // 对于doing状态，取的是实际开始时间到当前时间为doing状态
      // 如果结束为pending 无透明部分
      case MissionConstant.MISSION_STATUS_DOING:
      case MissionConstant.MISSION_STATUS_PAUSE:
        let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
        //doing的时间差
        let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start, true, true);
        tplObj.doingProgressTime = diffInfoDoing.gapTime + diffInfoDoing.diffUnit;
    }
  }


  /**
   * 绘制SVG的详情方法
   */
  calculateDetail(tplObj: MissionDetailTplModel) {
    switch (this.activePeriod) {
      case 'day':
        this.drawDay(tplObj);
        break;
      case 'week':
        this.drawWeek(tplObj);
        break;
      default:
      case 'month':
        this.drawMonth(tplObj);
        break;
    }
  }

  /**
   * 绘制day的svg
   */
  drawDay(tplObj: MissionDetailTplModel) {
    //TODO 将currentStartTime 和 currentEndTime传入  utc时间
    //TODO 假数据
    let startDate = '';
    let hours: any;
    let lInfo = tplObj.link_info;
    //
    // tplObj.showMonthMinWidth = false;
    // tplObj.showWeekMinWidth = false;
    tplObj.applicationPos = [];

    let currentStart = this.dateFormatService.utcDateFormat(this.currentStartTime, this.formatString);
    //currentEnd是指总长度
    let currentEnd = this.dateFormatService.utcDateFormat(this.currentEndTime, this.formatString);
    let timeLength = this.dateDiff(currentEnd, currentStart).gapTime + 1;
    let beginTime: any;
    let halfTimeLen = 1 / 32;
    // 对于 doing和done的开始时间应该检查实际开始时间
    // todo无real_start时间
    switch (tplObj.mission_status) {
      case MissionConstant.MISSION_STATUS_DONE:
      case MissionConstant.MISSION_STATUS_STORAGE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //计算长度
        hours = this.dateDiff(tplObj.real_end, tplObj.real_start).gapTime;
        tplObj.fillLengthDone = (hours / timeLength * 100).toString();
        tplObj.fillLengthTodo = (hours / timeLength * 100).toString();
        //时间的开始点
        beginTime = new Date(this.formatTimeForIE(tplObj.real_start));
        // 开始时间要加上1/32 为了对齐时间
        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        }
        else {
        }
        if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
          tplObj.typeIsApplication = true;
          if (tplObj.detail.approve_time.length != 0) {
            tplObj.detail.approve_time.forEach((value) => {
              //获取application的时间戳
              if (value.time != '') {
                value.time = this.formatTimeForIE(value.time);
                let appliDate = new Date(value.time);
                let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                //假如最后一个是结束时间使位置重合
                /*            if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                 appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + 2 * halfTimeLen / 3) * 100;
                 }*/
                tplObj.applicationPos.push(appliPos);
              }
            })
          }

        }

        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }

        //project绘制
        if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value) => {
            //计算位置
            if (value.status === MissionConstant.MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MissionConstant.MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proAppliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MissionConstant.MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proMeetDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MissionConstant.MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proAssignDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MissionConstant.MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proTaskDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }

        break;
      case MissionConstant.MISSION_STATUS_DOING:
      case MissionConstant.MISSION_STATUS_PAUSE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //计算长度
        //计算相差的小时数
        if (tplObj.end === MissionConstant.MISSION_TIME_NULL || tplObj.end == '') {
          //长度
          // tplObj.fillLengthTodo = '0';
          tplObj.todoProgressTime = '';
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          let p = (diffInfoDoing.gapTime / timeLength ) * 100;
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          //如果是application时 显示todo的文字
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / timeLength + halfTimeLen ) * 100;
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            //application 没有进度条
            tplObj.typeIsApplication = true;
            if (tplObj.detail.approve_time.length != 0) {
              tplObj.detail.approve_time.forEach((value) => {
                //获取application的时间戳
                if (value.time != '') {
                  value.time = this.formatTimeForIE(value.time);
                  let appliDate = new Date(value.time);
                  let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  //假如一个是结束时间使位置重合
                  /*                  if (this.dateDiff(appliDate, currentStart, true).gapTime === this.dateDiff(beginTime, currentStart, true).gapTime + diffInfoDoing.gapTime) {
                   appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength) * 100;
                   }*/
                  tplObj.applicationPos.push(appliPos);
                }
              })
            }

          }
        } else {
          hours = this.dateDiff(tplObj.end, tplObj.real_start).gapTime;
          //长度
          tplObj.fillLengthTodo = (hours / timeLength * 100).toString();
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          //todo的时间差
          let diffInfoTodo = this.dateDiff(tplObj.end, tplObj.real_start);
          tplObj.todoProgressTime = diffInfoTodo.gapTime + diffInfoTodo.diffUnit;
          //计算已经做完的 doing的长度 ps：由于doing的长度是相对时间条的，所以要乘以toDo对应的时间条长度
          // let p = (diffInfoTodo.gapTime - diffInfoDoing.gapTime) / diffInfoTodo.gapTime * Number(tplObj.fillLengthTodo);
          let p = diffInfoDoing.gapTime / diffInfoTodo.gapTime * Number(tplObj.fillLengthTodo);
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          //如果是application时 显示todo的文字
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;
          } else {
            tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / timeLength + halfTimeLen) * 100;
          }
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            if (tplObj.detail.approve_time.length != 0) {
              //application 没有进度条
              tplObj.typeIsApplication = true;
              tplObj.detail.approve_time.forEach((value) => {
                //获取application的时间戳
                if (value.time != '') {
                  value.time = this.formatTimeForIE(value.time);
                  let appliDate = new Date(value.time);
                  let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  //假如最后一个是结束时间使位置重合
                  /*                  if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                   appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength) * 100;
                   }*/
                  tplObj.applicationPos.push(appliPos);
                }
              })
            }

          }

        }

        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }


        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TRACKING) && (typeof tplObj.fns[MissionConstant.MISSION_FUNCTION_TRACKING] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }
        //project绘制
        if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value) => {
            //计算位置
            if (value.status === MissionConstant.MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MissionConstant.MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proAppliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MissionConstant.MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proMeetDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MissionConstant.MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proAssignDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MissionConstant.MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if ((this.dateDiff(proTaskDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours)) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }

        break;
      case MissionConstant.MISSION_STATUS_RESET:
        //即没开始也没结束
        tplObj.endIsPending = true;
        beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);

        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        // //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;

        break;
      case MissionConstant.MISSION_STATUS_TODO:
      case MissionConstant.MISSION_STATUS_PENDING:
      default:
        // if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
        //   startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        // }
        //长度
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL || tplObj.end === MissionConstant.MISSION_TIME_NULL) {
          tplObj.endIsPending = true;
          //TODO 开始时间点为默认当前时间
          beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);

          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;
        } else {
          //计算长度
          //计算相差的小时数
          hours = this.dateDiff(tplObj.end, tplObj.start, true).gapTime;
          tplObj.fillLengthTodo = (hours / timeLength * 100).toString();
          //时间的开始点 start
          if (tplObj.real_start !== '' && tplObj.real_start !== MissionConstant.MISSION_TIME_NULL) {
            tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
            beginTime = new Date(tplObj.real_start);
          } else {
            tplObj.start = this.formatTimeForIE(tplObj.start);
            beginTime = new Date(tplObj.start);
          }
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;
        }
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);

          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }

        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }
        break;
    }
  }

  /**
   * 绘制week的svg
   */
  drawWeek(tplObj: MissionDetailTplModel) {
    //TODO 将currentStartTime 和 currentEndTime传入  utc时间
    //TODO 假数据
    let startDate = '';
    let hours: any;
    let lInfo = tplObj.link_info;

    // tplObj.showMonthMinWidth = false;
    // tplObj.showWeekMinWidth = false;
    tplObj.applicationPos = [];
    // currentStart是weekArray的
    let currentStart = this.dateFormatService.utcDateFormat(this.weekStartDate, this.formatString);
    //weekTimeLength是指总长度
    let currentEnd = this.dateFormatService.utcDateFormat(this.weekEndDate, this.formatString);
    let weekTimeLength = this.dateDiff(currentEnd, currentStart).gapTime + 1;
    let beginTime: any;
    let halfTimeLen = 1 / weekTimeLength / 2;
    // 对于 doing和done的开始时间应该检查实际开始时间
    // todo无real_start时间
    switch (tplObj.mission_status) {
      case MissionConstant.MISSION_STATUS_DONE:
      case MissionConstant.MISSION_STATUS_STORAGE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }

        //计算长度
        hours = this.dateDiff(tplObj.real_end, tplObj.real_start).gapTime;
        tplObj.fillLengthDone = (hours / weekTimeLength * 100).toString();
        tplObj.fillLengthTodo = (hours / weekTimeLength * 100).toString();
        /* //少于1小时设置默认长度
         tplObj.showWeekMinWidth =
         parseFloat(tplObj.fillLengthDone) <= 1.5 ||
         parseFloat(tplObj.fillLengthTodo) <= 1.5;*/
        //时间的开始点
        tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
        beginTime = new Date(tplObj.real_start);
        // 开始时间要加上1/32 为了对齐时间
        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
        //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / weekTimeLength + halfTimeLen) * 100;
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
        }
        else {
        }
        if (tplObj.type === MISSION_TYPE_APPLICATION) {
          tplObj.typeIsApplication = true;
          tplObj.detail.approve_time.forEach((value) => {
            //获取application的时间戳
            value.time = this.formatTimeForIE(value.time);
            let appliDate = new Date(value.time);
            let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
            //假如最后一个是结束时间使位置重合
            /*            if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
             appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
             }*/
            tplObj.applicationPos.push(appliPos);
          })
        }

        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }

        //project绘制
        if (tplObj.type === MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value) => {
            if (value.status === MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAppliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proMeetDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAssignDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proTaskDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }
        break;
      case MissionConstant.MISSION_STATUS_RESET:
        tplObj.endIsPending = true;
        //TODO 开始时间点为默认当前时间
        //时间的开始点
        beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);
        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
        // //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / weekTimeLength + halfTimeLen) * 100;

        break;
      case MissionConstant.MISSION_STATUS_DOING:
      case MissionConstant.MISSION_STATUS_PAUSE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //计算长度
        //计算相差的天数
        //doing状态是看real_start和end时间
        //有end时间

        if (tplObj.end === MissionConstant.MISSION_TIME_NULL || tplObj.end == '') {
          //长度
          // tplObj.fillLengthTodo = '0';
          tplObj.todoProgressTime = '';
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          let p = (diffInfoDoing.gapTime / weekTimeLength) * 100;
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          /*//少于1小时设置默认长度
           tplObj.showWeekMinWidth =
           parseFloat(tplObj.fillLengthDoing) <= 1.5;*/
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
          //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / weekTimeLength + halfTimeLen) * 100;
          /*if (parseFloat(tplObj.fillLengthDoing) <= 1.5) {
           tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime) / weekTimeLength + halfTimeLen) * 100;
           }*/
          if (tplObj.type === MISSION_TYPE_APPLICATION) {
            //application 没有进度条
            tplObj.typeIsApplication = true;
            if (tplObj.detail.approve_time.length != 0) {
              tplObj.detail.approve_time.forEach((value) => {
                //获取application的时间戳
                if (value.time != '') {
                  value.time = this.formatTimeForIE(value.time);
                  let appliDate = new Date(value.time);
                  let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  //假如一个是结束时间使位置重合
                  /*                  if (this.dateDiff(appliDate, currentStart, true).gapTime === this.dateDiff(beginTime, currentStart, true).gapTime + diffInfoDoing.gapTime) {
                   appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength) * 100;
                   }*/
                  tplObj.applicationPos.push(appliPos);
                }
              })
            }

          }


        } else {
          hours = this.dateDiff(tplObj.end, tplObj.real_start).gapTime;
          //长度
          tplObj.fillLengthTodo = (hours / weekTimeLength * 100).toString();
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          //todo的时间差
          let diffInfoTodo = this.dateDiff(tplObj.end, tplObj.real_start);
          tplObj.todoProgressTime = this.dateDiff(nowDate, tplObj.real_start, true, true).gapTime + diffInfoTodo.diffUnit;
          //计算已经做完的 doing的长度 ps：由于doing的长度是相对时间条的，所以要乘以toDo对应的时间条长度
          // let p = (diffInfoTodo.gapTime - diffInfoDoing.gapTime) / diffInfoTodo.gapTime * Number(tplObj.fillLengthTodo);
          let p = (diffInfoDoing.gapTime / diffInfoTodo.gapTime) * Number(tplObj.fillLengthTodo);
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          //时间的开始点
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
          //计算文字所在位置
          //如果是application时 显示todo的文字
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / weekTimeLength + halfTimeLen) * 100;
          if (tplObj.type === MISSION_TYPE_APPLICATION) {
            //application 没有进度条
            tplObj.typeIsApplication = true;
            tplObj.detail.approve_time.forEach((value) => {
              //获取application的时间戳
              value.time = this.formatTimeForIE(value.time);
              let appliDate = new Date(value.time);
              let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
              //假如最后一个是结束时间使位置重合
              /*              if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
               appliPos = (this.dateDiff(appliDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
               }*/
              tplObj.applicationPos.push(appliPos);
            })
          }
        }


        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }


        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TRACKING) && (typeof tplObj.fns[MissionConstant.MISSION_FUNCTION_TRACKING] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }
        //project绘制
        if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value) => {
            if (value.status === MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAppliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proMeetDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAssignDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proTaskDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / weekTimeLength + 4 * halfTimeLen / 5) * 100;
                  }
                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }

        break;
      case MissionConstant.MISSION_STATUS_TODO:
      case MissionConstant.MISSION_STATUS_PENDING:
      default:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //长度
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL || tplObj.end === MissionConstant.MISSION_TIME_NULL) {
          tplObj.endIsPending = true;
          //TODO 开始时间点为默认当前时间
          //时间的开始点
          beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / weekTimeLength + halfTimeLen) * 100;
        } else {
          //计算长度
          //计算相差的小时数
          hours = this.dateDiff(tplObj.end, tplObj.start).gapTime;
          tplObj.fillLengthTodo = (hours / weekTimeLength * 100).toString();
          /*//少于1小时设置默认长度
           tplObj.showWeekMinWidth =
           parseFloat(tplObj.fillLengthTodo) <= 1.5;
           */
          //时间的开始点 start
          if (tplObj.real_start !== '' && tplObj.real_start !== MissionConstant.MISSION_TIME_NULL) {
            tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
            beginTime = new Date(tplObj.real_start);
          } else {
            tplObj.start = this.formatTimeForIE(tplObj.start);
            beginTime = new Date(tplObj.start);
          }
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
          //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / weekTimeLength + halfTimeLen) * 100;
        }
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          beginTime = this.dateFormatService.utcDateFormat(this.currentDate, this.formatString);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / weekTimeLength + halfTimeLen) * 100;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / weekTimeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }

        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }
        break;
    }
  }

  /**
   * 绘制month的svg
   */
  drawMonth(tplObj: MissionDetailTplModel) {
    //TODO 将currentStartTime 和 currentEndTime传入  utc时间
    //TODO 假数据
    let startDate = '';
    let hours: any;
    // tplObj.showMonthMinWidth = false;
    // tplObj.showWeekMinWidth = false;
    tplObj.applicationPos = [];

    let lInfo = tplObj.link_info;
    let currentStart = this.dateFormatService.utcDateFormat(this.monthStartDate, this.formatString);
    //timeLength是指总长度
    let currentEnd = this.dateFormatService.utcDateFormat(this.monthEndDate, this.formatString);
    let timeLength = this.dateDiff(currentEnd, currentStart).gapTime + 1;
    let beginTime: any;
    let halfTimeLen = 1 / timeLength / 2;
    // 对于 doing和done的开始时间应该检查实际开始时间
    // todo无real_start时间
    switch (tplObj.mission_status) {
      case MissionConstant.MISSION_STATUS_DONE:
      case MissionConstant.MISSION_STATUS_STORAGE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }

        //计算长度
        hours = this.dateDiff(tplObj.real_end, tplObj.real_start).gapTime;
        tplObj.fillLengthDone = (hours / timeLength * 100).toString();
        tplObj.fillLengthTodo = (hours / timeLength * 100).toString();
        /*//少于1小时设置默认长度
         tplObj.showMonthMinWidth =
         parseFloat(tplObj.fillLengthDone) <= 1.5 ||
         parseFloat(tplObj.fillLengthTodo) <= 1.5;*/
        tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
        beginTime = new Date(tplObj.real_start);
        // 开始时间要加上1/32 为了对齐时间
        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        }
        else {
        }
        if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
          //application 不需要进度条
          tplObj.typeIsApplication = true;
          tplObj.detail.approve_time.forEach((value) => {
            //获取application的时间戳
            value.time = this.formatTimeForIE(value.time);
            let appliDate = new Date(value.time);
            let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
            //假如最后一个是结束时间使位置重合
            /*            if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
             appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength) * 100;
             }*/
            tplObj.applicationPos.push(appliPos);
          })
        }

        // 绘制七种方法功能
        if (tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined')) {
          tplObj.showTracking = true;
        } else {
          tplObj.showTracking = false;
        }

        //project绘制
        if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value: any) => {
            //计算位置
            if (value.status === MissionConstant.MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MissionConstant.MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAppliDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MissionConstant.MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proMeetDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MissionConstant.MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAssignDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MissionConstant.MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proTaskDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen / 4) * 100;
                  }

                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }

        break;
      case MissionConstant.MISSION_STATUS_RESET:
        tplObj.endIsPending = true;
        //TODO 开始时间点为默认当前时间
        let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
        beginTime = nowDate;
        tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength) * 100;
        // //计算文字所在位置
        tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;
        break;
      case MissionConstant.MISSION_STATUS_DOING:
      case MissionConstant.MISSION_STATUS_PAUSE:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //计算长度
        //计算相差的天数
        if (tplObj.end === MissionConstant.MISSION_TIME_NULL || tplObj.end == '') {
          //长度
          // tplObj.fillLengthTodo = '0';
          tplObj.todoProgressTime = '';
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          let p = (diffInfoDoing.gapTime / timeLength) * 100;
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          /* //少于1小时设置默认长度
           tplObj.showMonthMinWidth =
           parseFloat(tplObj.fillLengthDoing) <= 1.5;*/
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          //如果是application时 显示todo的文字
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / timeLength + halfTimeLen ) * 100;
          /* if (parseFloat(tplObj.fillLengthDoing) <= 1.5) {
           tplObj.textPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
           }*/
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            //application 没有进度条
            tplObj.typeIsApplication = true;
            if (tplObj.detail.approve_time.length != 0) {
              tplObj.detail.approve_time.forEach((value) => {
                //获取application的时间戳
                if (value.time != '') {
                  value.time = this.formatTimeForIE(value.time);
                  let appliDate = new Date(value.time);
                  let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  //假如一个是结束时间使位置重合
                  /*                  if (this.dateDiff(appliDate, currentStart, true).gapTime === this.dateDiff(beginTime, currentStart, true).gapTime + diffInfoDoing.gapTime) {
                   appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength) * 100;
                   }*/
                  tplObj.applicationPos.push(appliPos);
                }
              })
            }

          }


        } else {
          hours = this.dateDiff(tplObj.end, tplObj.real_start).gapTime;
          //长度
          tplObj.fillLengthTodo = (hours / timeLength * 100).toString();
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          let diffInfoDoing = this.dateDiff(nowDate, tplObj.real_start);
          //todo的时间差
          let diffInfoTodo = this.dateDiff(tplObj.end, tplObj.real_start);
          tplObj.todoProgressTime = diffInfoTodo.gapTime + diffInfoTodo.diffUnit;
          //计算已经做完的 doing的长度 ps：由于doing的长度是相对时间条的，所以要乘以toDo对应的时间条长度
          // let p = (diffInfoTodo.gapTime - diffInfoDoing.gapTime) / diffInfoTodo.gapTime * Number(tplObj.fillLengthTodo);
          let p = diffInfoDoing.gapTime / diffInfoTodo.gapTime * Number(tplObj.fillLengthTodo);
          if (p < 0) {
            p = 0;
          }
          tplObj.fillLengthDoing = p.toString();
          //时间的开始点
          tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
          beginTime = new Date(tplObj.real_start);
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          //如果是application时 显示todo的文字
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;
          } else {
            tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + diffInfoDoing.gapTime / 2) / timeLength + halfTimeLen) * 100;
          }
          if (tplObj.type === MissionConstant.MISSION_TYPE_APPLICATION) {
            //application 没有进度条
            tplObj.typeIsApplication = true;

            tplObj.appliPosInPro = [];
            tplObj.meetPosInPro = [];
            tplObj.assignPosInPro = [];
            tplObj.taskPosInPro = [];
            tplObj.detail.approve_time.forEach((value) => {
              //获取application的时间戳
              value.time = this.formatTimeForIE(value.time);
              let appliDate = new Date(value.time);
              let appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
              /*              //假如最后一个是结束时间使位置重合
               if (this.dateDiff(appliDate, currentStart).gapTime === this.dateDiff(beginTime, currentStart).gapTime + hours) {
               appliPos = (this.dateDiff(appliDate, currentStart).gapTime / timeLength) * 100;
               }*/
              tplObj.applicationPos.push(appliPos);
            })
          }
        }
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0];
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }
        // 绘制七种方法功能
        tplObj.showTracking = tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined');
        //project绘制
        if (tplObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          tplObj.appliPosInPro = [];
          tplObj.meetPosInPro = [];
          tplObj.assignPosInPro = [];
          tplObj.taskPosInPro = [];
          tplObj.detail.internal.forEach((value) => {
            //计算位置
            if (value.status === MissionConstant.MISSION_STATUS_DONE) {
              value.real_end = this.formatTimeForIE(value.real_end);
              switch (value.type) {
                case MissionConstant.MISSION_TYPE_APPLICATION://application
                  let proAppliDate = new Date(value.real_end);
                  let positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAppliDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionAppli = (this.dateDiff(proAppliDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.appliPosInPro.push(positionAppli);
                  break;
                case MissionConstant.MISSION_TYPE_MEETING:
                  let proMeetDate = new Date(value.real_end);
                  let positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proMeetDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionM = (this.dateDiff(proMeetDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.meetPosInPro.push(positionM);
                  break;
                case MissionConstant.MISSION_TYPE_ASSIGNMENT:
                  let proAssignDate = new Date(value.real_end);
                  let positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proAssignDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionAssign = (this.dateDiff(proAssignDate, currentStart).gapTime / timeLength + halfTimeLen / 2) * 100;
                  }
                  tplObj.assignPosInPro.push(positionAssign);
                  break;
                case MissionConstant.MISSION_TYPE_TASK:
                default:
                  let proTaskDate = new Date(value.real_end);
                  let positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen) * 100;
                  if (this.dateDiff(proTaskDate, currentStart).gapTime.toFixed(5) === (this.dateDiff(beginTime, currentStart).gapTime + hours).toFixed(5)) {
                    positionTask = (this.dateDiff(proTaskDate, currentStart).gapTime / timeLength + halfTimeLen / 4) * 100;
                  }
                  tplObj.taskPosInPro.push(positionTask);
                  break;
              }
            }
          })
        }
        break;
      case MissionConstant.MISSION_STATUS_TODO:
      case MissionConstant.MISSION_STATUS_PENDING:
      default:
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL) {
          startDate = this.dateFormatService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
        }
        //长度
        if (tplObj.start === MissionConstant.MISSION_TIME_NULL || tplObj.end === MissionConstant.MISSION_TIME_NULL) {
          tplObj.endIsPending = true;
          //TODO 开始时间点为默认当前时间
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          beginTime = nowDate;
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;
        } else {
          //计算长度
          //计算相差的小时数
          hours = this.dateDiff(tplObj.end, tplObj.start).gapTime;
          tplObj.fillLengthTodo = (hours / timeLength * 100).toString();

          /* //少于1小时设置默认长度
           tplObj.showMonthMinWidth =
           parseFloat(tplObj.fillLengthTodo) <= 1.5;*/
          //时间的开始点 start
          if (tplObj.real_start !== '' && tplObj.real_start !== MissionConstant.MISSION_TIME_NULL) {
            tplObj.real_start = this.formatTimeForIE(tplObj.real_start);
            beginTime = new Date(tplObj.real_start);
          } else {
            tplObj.start = this.formatTimeForIE(tplObj.start);
            beginTime = new Date(tplObj.start);
          }
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
          //计算文字所在位置
          /*        if (tplObj.showMonthMinWidth) {
           tplObj.textPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength + halfTimeLen) * 100;
           } else {

           }*/
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + hours / 2) / timeLength + halfTimeLen) * 100;

        }
        // 对于开始时间，首先检查是否有连接其他mission
        // 不同于日历模式
        //如果有, 开始时间为连接到该mission的link
        if (Array.isArray(lInfo.before) && lInfo.before.hasOwnProperty('0') && (typeof lInfo.before[0] !== 'undefined') ||
          Array.isArray(lInfo.after) && lInfo.after.hasOwnProperty('0') && (typeof lInfo.after[0] !== 'undefined')
        ) {
          let linkMission = typeof lInfo.before[0] !== 'undefined' ? lInfo.before[0] : lInfo.after[0]
          // let beforeMission = lInfo.before[0];
          //显示为？
          tplObj.startIsLink = true;
          tplObj.initStartLinkInfo(linkMission);
          //显示link
          let nowDate = this.dateFormatService.nowDateFormat(MissionConstant.MISSION_DATABASE_DATE_FORMAT);
          beginTime = nowDate;
          tplObj.showLink_info = true;
          tplObj.linkPosition = (this.dateDiff(beginTime, currentStart).gapTime / timeLength ) * 100;
          tplObj.svgPostion = (this.dateDiff(beginTime, currentStart).gapTime / timeLength) * 100;
          // //计算文字所在位置
          tplObj.textPostion = ((this.dateDiff(beginTime, currentStart).gapTime + 1 / 2) / timeLength + halfTimeLen) * 100;
        }
        else {
          //隐藏link
          tplObj.showLink_info = false;
        }

        // 绘制七种方法功能
        tplObj.showTracking = tplObj.fns.hasOwnProperty('4') && (typeof tplObj.fns['4'] !== 'undefined');
        break;
    }
  }

  /**
   * 时间差, 允许显示单位为mo - 月, h - 小时, d - 天
   * @param d2 timestamp 结束时间
   * @param d1 timestamp 开始时间
   * @param round 是否取整
   * @param displayText
   * @returns {{gapTime: number, diffUnit: string}}
   */
  public dateDiff(d2: any, d1: any, round: boolean = false, displayText: boolean = false) {
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
    }
    //假如是week模式 进度条显示天数
    diffStatus =
      this.activePeriod === 'week' ? 'day' :
        this.activePeriod === 'month' ? 'day' :
          'hour';
    //假如day模式下超过24h后文字显示天数进度条显示小时的长度
    /* diffStatus =
     this.activePeriod === 'day' ?
     (displayText ? 'text' : diffStatus) : diffStatus;*/
    switch (diffStatus) {
      case 'hour':
        diffUnit = 'h';
        gapTime = gapTime / (3600);
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
    let gapTimeStr =
      round ? Math.round(gapTime) : gapTime;
    // let gapTimeStr = Math.ceil(gapTime);
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
    window.open('mission/detail/' + missionObj.mid);
  }

  /**
   *  点击回形针事件
   */
  public sendLinkInfo(data: MissionDetailTplModel) {
    this.isShowMissionLink = true;
    this.missionLink.linkInfo = data.link_info;
    this.missionLink.CurrentMissionObj = data;
  }

  /**
   * 兼容ie的时间
   * @param time
   * @returns {string}
   */
  public formatTimeForIE(time: string): string {
    if (typeof time == 'string') {
      time = time.replace(/-/g, '/');
    }
    return time;
  }

  /**
   * 点击拖拽移动
   * @param event
   * @param ele
   */
  public clickStartDragSvg(event: MouseEvent, ele: any): void {
    event.stopPropagation();
    let originX = event.clientX;
    let isStartMove: boolean = false;
    switch (event.which) {
      case 1:
        isStartMove = true;
        ele.onmousemove = (e: any) => {
          if (isStartMove) {
            let directionX = event.movementX;
          }
        };
        ele.onmouseup = (e: any) => {
          e.stopPropagation();
          isStartMove = false;
          ele.onmousemove = null;
          if (e.clientX - originX > 0) { //往右拽
            let diff = Math.floor((e.clientX - originX)) / 80;
            this.switchToBefore(diff)
          } else {
            let diff = Math.floor((originX - e.clientX) / 80);
            this.switchToNext(diff);
          }
        };
        break;
      case 2:
        break;
      case 3:
        break;
      default:
    }
  }


}