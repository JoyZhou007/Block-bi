/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/7.
 */

import {
  Inject, Component, OnInit, EventEmitter, Renderer,
  ViewChild, AfterViewInit, Input, Output, ViewEncapsulation, HostListener
} from "@angular/core";
import {AlarmModelService} from '../shared/services/model/alarm-model.service';
import {CalendarDate} from '../shared/services/model/entity/calendar-entity';
import * as CalendarConfig from '../shared/config/calendar.config';
import * as AlarmConfig from '../shared/config/alarm.config';
import { el } from '@angular/platform-browser/testing/browser_util';
@Component({
  selector: 'bi-calendar-fix',
  styleUrls: ['../../assets/css/date/date.css'],
  templateUrl: './calendar-fix.component.html',
  providers: [AlarmModelService],
  encapsulation: ViewEncapsulation.None
})

export class CalendarFixComponent implements OnInit {
  //当前显示的年,月份信息
  public showDateIn: any = {};
  public dateInstance: Date; //日期对象
  public showSelectYearArr: Array<any>;   // 保存年份数组
  //日历当前显示的日期，每天对应的对象
  public showDate: Array<any> = [];
  public sumDay: number;    //日历当前页的总天数
  //当前选中日期对象
  public selectedDateIn: any;
  //当天的日期对象
  public curDate: any;
  public dateOptions: any;
  public dateFormat: string;   //日期格式字符串
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
  public dragWarpOffset: any = { //select选择框 ，x, y位置
    x: 0,
    y: 0
  };
  public missionObj: any = {};
  public hourList: Array<any> = [];
  public hourSettings: any = { //小时对象
    hour: '',  //小时数
    selected: false,//是否选中
    current: false //是否是当前小时
  };
  public minuteList: Array<any> = [];
  public minuteSettings: any = { //小时对象
    minute: '',  //小时数
    selected: false,//是否选中
    current: false //是否是当前小时
  };
  public listTop: number = 64;//日历日期距离顶部长度
  public showHourTop: number;  //小时top值
  public showHourLeft: number;   //小时left值
  public isShowHour: boolean = false; //显示小时，分钟模块
  public lastIndex: number;//今天之前的最后一天
  public nowHour: string;
  public nowMinute: string;
  public init_hour: string = '09';
  public init_minute: string = '00';
  public outputData: any = {};
  public inputData: any = {};
  public resignation: boolean = false;
  public missionConstant: any = {};
  @Output() public outFixInfo = new EventEmitter(); //传给父组件选择的开始，结束日期
  @Output() public outDeleteInfo = new EventEmitter();
  @Output() public outDefault = new EventEmitter();

  @ViewChild('dateForm') dateForm: any;
  @ViewChild('selectMonth') selectMonth: any;  //选择月
  @ViewChild('selectYear') selectYear: any;    //选择年
  @ViewChild('dataMonth') dataMonth: any;      //设置月位置
  @ViewChild('dataYear') dataYear: any;
  @ViewChild('rollRightBut') rollRightBut: any;
  private leftTimer: any;
  private rightTimer: any;
  private hourOffset: number = 0;
  private todayBefore: boolean = false;
  private hasAlarm: boolean = false;
  //设置年位置
  constructor(@Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('dialog.service') public dialogService: any,
              public alarmModelService: AlarmModelService,
              @Inject('toggle-select.service') public toggleSelectService: any
  ) {}

  /**
   * 传入 dataOption 的对象
   * {
   *    data：mission对象,
   *    todayBefore:true  //今天之前可以点击
   *    resignation:true  //不设置闹钟
   *
   * }
   * @param data
   */
  @Input() set dataOption(data: any) {
    if (data) {
      this.inputData = data;
      this.toggleSelectService.closeElement();
      this.toggleSelectService.setCalendarElement(() => {
        if(this.outDefault) {
          this.outDefault.emit();
        }
      });
      if (data.data) {
        this.missionObj = data.data;
        this.hasAlarm = this.missionObj.has_alarm;
      }
      if(data.todayBefore){
        this.todayBefore = true;
      }
      if(data.resignation){
        this.resignation = true;
      }
    }
    //如果当前时间大于等于9点，则显示当前小时，当前分钟5分钟后
    let now = new Date();
    let nowHour = now.getHours();
    if(nowHour > 9){
      this.init_hour = nowHour.toString();
      if(nowHour > 10){
        //要显示小时父元素移动的距离
        let num = nowHour - 10;
        this.hourOffset = num * 32;
      }
    }
    if(nowHour >= 9){
      let initMinute:any;
      let nowMinute = now.getMinutes();
      if(nowMinute <= 50){
        //当前分钟小于50， 小时不变
        initMinute = nowMinute + 5;
        this.init_minute = `0${initMinute + (5 - initMinute % 5)}`;
      }else{
        //当前分钟大于50， 显示下一小时整点
        this.init_hour = (nowHour + 1).toString();
        this.hourOffset += 32;
      }

    }

    this.isShowHour = false;
    this.clearCalendarMargin();
    this.isShowHour = false;
    this.outputData.hour = this.init_hour;
    this.outputData.minute = this.init_minute;
  }

  ngOnInit() {
    this.initSelect();
    this.initHour();
    this.initMinute();
  }

  @HostListener('document:mouseup', ['$event'])
  mouseup(event: any) {
    clearInterval(this.rightTimer);
    clearInterval(this.leftTimer);
  }

  @HostListener('document:click')
  click() {
   if(this.outDefault) {
     this.outDefault.emit();
   }
  }

  /**
   * 初始化显示
   */
  initSelect() {
    this.isShowHour = false;
    //默认日期
    this.curDate = this.getDateIn();
    let setDate = this.selectedDateIn ? this.selectedDateIn : this.curDate;
    this.showDateIn = {
      year: setDate.year,
      month: setDate.month
    };
    this.setShowSelectYear();
    this.setSelectDate();
  }

  /**
   * 将日期转化为日历对象
   *
   */
  getDateIn(date?: any): any {
    let dateIn: any = {};
    if (!date) {
      this.dateInstance = new Date();
    } else {
      this.dateInstance = new Date(date);
    }

    dateIn.year = this.dateInstance.getFullYear();
    dateIn.monthDay = this.dateInstance.getDate(); //一个月的第几天
    dateIn.month = this.dateInstance.getMonth();
    dateIn.monthName = this.dateWord['month'][dateIn.month];
    dateIn.day = this.dateInstance.getDay();
    dateIn.weekDayName = this.dateWord['week'][dateIn.day];
    dateIn.hour = this.dateInstance.getHours();
    dateIn.minute = this.dateInstance.getMinutes();
    dateIn.second = this.dateInstance.getSeconds();

    return dateIn;
  };

  /**
   * 获取月份的天数
   */
  getMonthDay(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 设置当前显示的日期
   */
  setSelectDate() {
    this.showDate = [];
    this.dateInstance.setDate(1);
    let firstWeekDay = this.dateInstance.getDay();
    let curMonthDay = this.getMonthDay(   //当月天数
      this.showDateIn.year, this.showDateIn.month
    );
    //如果月初第一天不为星期天,本月日期需要填充上月日期
    if (firstWeekDay !== 0) {
      this.setBeforeMonthDay(firstWeekDay);
    }

    this.setMonthDay(curMonthDay);//填充当月日期

    this.dateInstance.setDate(curMonthDay);
    let lastWeekDay = this.dateInstance.getDay();
    //如果最后不是星期六结尾,那么补充下月天数
    if (lastWeekDay !== 6) {
      this.setAfterMonthDay(lastWeekDay);
    }
    this.sumDay = firstWeekDay + curMonthDay + 5 - lastWeekDay;//计算该页的总天数
  }

  /**
   * 设置时间段样式class
   */
  setSelectedDateClass(curDateIn: any) {
    if (this.selectedDateIn) {
      curDateIn.selected = this.isSelectedDateIn(curDateIn.year, curDateIn.month, curDateIn.monthDay);
    }
    if (this.compareDate(curDateIn, this.curDate) === 0) {
      curDateIn.isToday = true;
    }
  }

  /**
   * 设置当前展示的月份
   * @param type 切换类型 1: 向右切换 2:向左切换
   */
  setShowDate(type: number, event?: any) {
    this.isShowHour = false;
    if (event) {
      event.stopPropagation();
    }

    if (type === 1) {
      this.showDateIn.year = this.showDateIn.month > 0
        ? this.showDateIn.year : parseInt(this.showDateIn.year) - 1;
      this.showDateIn.month = this.showDateIn.month > 0
        ? parseInt(this.showDateIn.month) - 1 : 11;
    } else if (type === 2) {
      this.showDateIn.year = this.showDateIn.month < 11
        ? this.showDateIn.year : parseInt(this.showDateIn.year) + 1;
      this.showDateIn.month = this.showDateIn.month < 11
        ? parseInt(this.showDateIn.month) + 1 : 1;
    }
    this.dateInstance.setFullYear(this.showDateIn.year);

    this.dateInstance.setMonth(this.showDateIn.month, 1);

    this.setShowSelectYear();

    this.setSelectDate();
    return false;
  }

  /**
   * 显示选择的月份
   */
  showSelectMonth(event: any) {
    event.stopPropagation();
    this.selectMonth.nativeElement.className = '';
    this.selectYear.nativeElement.className = 'hide';
    this.clearCalendarMargin();
  }

  /**
   * 设置月份
   */
  setShowMonth(month: number) {
    this.isShowHour = false;
    this.selectMonth.nativeElement.className = 'hide';
    this.showDateIn.month = month;
    this.dateInstance.setMonth(month, 1);
    this.setSelectDate();
  }

  /**
   * 显示选择的年份
   */
  showSelectYear(event: any) {
    event.stopPropagation();
    this.selectYear.nativeElement.className = '';
    this.selectMonth.nativeElement.className = 'hide';
    this.clearCalendarMargin();
    //从今年的70年前开始显示  当前选中的年显示状态
    let selectOffset = (this.showDateIn.year - (new Date().getFullYear() - CalendarConfig.CALENDAR_YEAR_START)) * CalendarConfig.CALENDAR_SELECT_HEIGHT;
    this.selectYear.nativeElement.scrollTop = selectOffset;
  }

  /**
   * 设置年份
   */
  setShowYear(year: number) {
    this.isShowHour = false;
    this.selectYear.nativeElement.className = 'hide';
    this.showDateIn.year = year;
    this.dateInstance.setFullYear(year);
    this.setShowSelectYear();
    this.setSelectDate();
  }

  /**
   * 比较两个日期的大小
   * @param date
   * @param secondDate
   * @returns {number} 第一个日期大 就返回1, 第二个日期大就返回2 ,相等的就返回 0
   */
  compareDate(date: any, secondDate: any): number {
    let returnStatus: number = 2;

    if (date && !secondDate) {
      returnStatus = 1;
    } else {
      if (date && secondDate) {
        if (parseInt(date.year) > parseInt(secondDate.year)) {
          returnStatus = 1;
        } else if (parseInt(date.year) == parseInt(secondDate.year)) {
          if (parseInt(date.month) > parseInt(secondDate.month)) {
            returnStatus = 1;
          } else if (parseInt(date.month) == parseInt(secondDate.month)) {
            if (parseInt(date.monthDay) > parseInt(secondDate.monthDay)) {
              returnStatus = 1;
            } else if (parseInt(date.monthDay) == parseInt(secondDate.monthDay)) {
              returnStatus = 0;
            }
          }
        }
      }
    }
    return returnStatus;
  }

  /**
   * 是否是选中的时间
   */
  isSelectedDateIn(year: number, month: number, day: number): boolean {
    if(year == this.selectedDateIn.year
      && month == this.selectedDateIn.month
      && this.selectedDateIn.monthDay == day){
    }
    return year == this.selectedDateIn.year
      && month == this.selectedDateIn.month
      && this.selectedDateIn.monthDay == day;
  }

  /**
   * 设置本月前需要填充的日期
   */
  setBeforeMonthDay(firstWeekDay: any, reset?: string) {
    let year = this.showDateIn.month > 0 ? this.showDateIn.year : this.showDateIn.year - 1;
    let beforeMonth = this.showDateIn.month > 0 ? this.showDateIn.month - 1 : 11;
    let monthDay = this.getMonthDay(this.showDateIn.year, beforeMonth);


    for (let day = monthDay - firstWeekDay + 1; day <= monthDay; day++) {
      let newDay: any = this.formatDay(day);
      //初始化日期
      let curDateIn=CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month =beforeMonth;
      curDateIn.monthDay = newDay;
      curDateIn.before = true;
      this.setSelectedDateClass(curDateIn);
      //最后一天有右圆角
      if(day == monthDay){
        curDateIn.rightRadius = true;
      }else{
        curDateIn.rightRadius = false;
      }
      this.showDate.push(curDateIn);
    }
    this.beforeToday();
    this.dealBackground();
  }

  /**
   * 设置本月后需要填充的日期
   */
  setAfterMonthDay(lastWeekDay: any, reset?: string) {
    let year = this.showDateIn.month < 11 ? this.showDateIn.year : this.showDateIn.year + 1;
    let afterMonth = this.showDateIn.month < 11 ? this.showDateIn.month + 1 : 1;

    for (let day = 1; day <= (6 - lastWeekDay); day++) {
      let newDay: any = this.formatDay(day);
      //初始化日期
      let curDateIn=CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month =afterMonth;
      curDateIn.monthDay = newDay;
      curDateIn.after = true;

      this.setSelectedDateClass(curDateIn);
      //第一天有左圆角
      if(day == 1){
        curDateIn.leftRadius = true;
      }else{
        curDateIn.leftRadius = false;
      }
      this.showDate.push(curDateIn);
    }
    this.beforeToday();
    this.dealBackground();
  }

  /**
   * 设置当月需要填充的日期
   */
  setMonthDay(monthDay: any, reset?: string) {
    for (let day = 1; day <= monthDay; day++) {
      let newDay: any = this.formatDay(day);
      //初始化日期
      let curDateIn=CalendarDate.init();
      curDateIn.year = this.showDateIn.year;
      curDateIn.month =this.showDateIn.month;
      curDateIn.monthDay = newDay;
      this.setSelectedDateClass(curDateIn);
      this.showDate.push(curDateIn);
    }
    this.beforeToday();
    this.dealBackground();
  }

  /**
   * 设置选择的年份
   */
  setShowSelectYear() {
    this.showSelectYearArr = [];
    let nowYear = new Date().getFullYear();
    for (let startYear = nowYear - CalendarConfig.CALENDAR_YEAR_START;        //年份显示从70年前到10年后
         startYear <= nowYear + CalendarConfig.CALENDAR_YEAR_End; startYear++) {
      this.showSelectYearArr.push(startYear);
    }
  }

  /**
   * 初始化小时数
   */
  initHour() {
    this.hourList = [];
    for (let i = 0; i < 24; i++) {
      let hour = this.typeService.clone(this.hourSettings);
      hour.hour = this.formatDay(i);
      if (parseInt(this.init_hour) == i) {
        hour.selected = true;
      } else {
        hour.selected = false;
      }
      this.hourList.push(hour);
    }
  }

  /**
   * 初始化分钟数
   */
  initMinute() {
    this.minuteList = [];
    for (let i = 0; i < 60; i += 5) {
      let minute = this.typeService.clone(this.minuteSettings);
      minute.minute = this.formatDay(i);
      if (parseInt(this.init_minute) == i) {
        minute.selected = true;
      } else {
        minute.selected = false;
      }
      this.minuteList.push(minute);
    }
  }

  /**
   * 点击日期
   */
  onClickEvent(dateIn: any, index: number, event: any) {
    if(!this.todayBefore && this.compareDate(dateIn,this.curDate) == 2){
      return false;
    }
    event.stopPropagation();
    //赋值输出对象的年月日
    this.outputData.year = dateIn.year;
    this.outputData.month = dateIn.month;
    this.outputData.monthDay = dateIn.monthDay;
    //清空上次点击样式
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].selectedStart = false;
      this.showDate[i].selectedEnd = false;
      this.showDate[i].done = false;
      this.showDate[i].enddate = false;
      this.showDate[i].todo = false;
    }
    if (!this.selectedDateIn) {
      this.selectedDateIn = {};
      this.selectedDateIn.minute = 0;
      this.selectedDateIn.hour = 0;
    }
    //小时，分钟框出现 , 年月隐藏
      this.isShowHour = true;
      this.selectYear.nativeElement.className = 'hide';
      this.selectMonth.nativeElement.className = 'hide';

      let lineNumber: number = Math.ceil((index + 1) / CalendarConfig.CALENDAR_COLUMN_NUMBER);//点击的第几行
      this.typeService.mergeObj(this.selectedDateIn, dateIn);
      this.setSelectDate();
      //添加空白，显示小时，分钟框
      let inx: number = index;
      for (let i = 0; i < this.showDate.length; i++) {
        if (inx <= i && i <= lineNumber * CalendarConfig.CALENDAR_COLUMN_NUMBER - 1) {
          this.showDate[i].hasMargin = true;
        } else {
          this.showDate[i].hasMargin = false;
        }
        this.showHourTop = this.listTop + CalendarConfig.CALENDAR_MARGIN_SPACE * lineNumber;
      }
  }

  /**
   * 点击小时
   */
  onHourClick(event: any, index: number) {
    event.stopPropagation();
    this.nowHour = this.hourList[index].hour;
    for (let i = 0; i < this.hourList.length; i++) {
      this.hourList[i].current = false;
      if (index == i) {
        this.hourList[i].selected = true;
        this.outputData.hour = this.hourList[i].hour;
      } else {
        this.hourList[i].selected = false;
      }
    }
  }

  /**
   *今天之前的样式
   */
  beforeToday() {
    for (let i = 0; i < this.showDate.length; i++) {
      if (this.compareDate(this.curDate, this.showDate[i]) == 1) {
        this.showDate[i].isBeforeToday = true;
        this.lastIndex = i;
      } else {
        this.showDate[i].isBeforeToday = false;
      /*  if (this.showDate[this.lastIndex] && !this.showDate[this.lastIndex].todo && !this.showDate[this.lastIndex].done
          && !(this.showDate[this.lastIndex].before || this.showDate[this.lastIndex].after)) */
        if (this.showDate[this.lastIndex] && !this.showDate[this.lastIndex].todo && !this.showDate[this.lastIndex].done)
        {
          this.showDate[this.lastIndex].lastBeforeToday = true;
        }
      }
    }
  }

  /**
   * 添加背景颜色
   */
  dealBackground(){
    for (let i = 0; i < this.showDate.length; i++) {
      //出现右圆角的情况，不在每行末尾
      if(this.showDate[i].selectedEnd || (this.showDate[i].rightRadius  && !this.showDate[i].done && !this.showDate[i].todo && !this.showDate[i].isBeforeToday)
        || this.showDate[i].lastBeforeToday){
        //判断下一个是否有背景颜色
        if(this.showDate[i+1] && this.showDate[i+1].done){
          //done
          this.showDate[i+1].leftDoneBg = true;
          this.showDate[i].noBackground = true;
          this.dealSpan(i);
          this.showDate[i].rightDoneBg = true;
        }else if(this.showDate[i+1] && this.showDate[i+1].todo){
          //todo
          this.showDate[i].noBackground = true;
          this.showDate[i+1].leftTodoBg = true;
          this.dealSpan(i);
          this.showDate[i].rightTodoBg = true;
        }else if(this.showDate[i+1] && (this.showDate[i+1].before || this.showDate[i+1].after)){
          //gray
          this.showDate[i].noBackground = true;
          this.showDate[i+1].leftGrayBg = true;
          this.showDate[i+1].leftTodoBg = false;
          this.showDate[i+1].leftDoneBg = false;
          this.dealSpan(i);
          this.showDate[i].rightGrayBg = true;
          this.showDate[i].rightTodoBg = false;
          this.showDate[i].rightDoneBg = false;
        }
      }
      //出现左圆角的情况，不在每行开头
      if(this.showDate[i].selectedStart || (this.showDate[i].leftRadius && !this.showDate[i].done && !this.showDate[i].todo && !this.showDate[i].isBeforeToday)){
        //判断上一个是否有背景颜色
        if(this.showDate[i-1] && this.showDate[i-1].done){
          //done
          this.showDate[i-1].rightDoneBg = true;
          this.showDate[i].noBackground = true;
          this.dealSpan(i);
          this.showDate[i].leftDoneBg = true;
        }else if(this.showDate[i-1] && this.showDate[i-1].todo){
          if(this.showDate[i].after){
            //todo
            this.showDate[i].noBackground = true;
            this.showDate[i-1].rightGrayBg = true;
            this.showDate[i].leftGrayBg = true;
            this.showDate[i].rightGrayBg = true;
          }else {
            //todo
            this.showDate[i].noBackground = true;
            this.showDate[i-1].rightTodoBg = true;
            this.dealSpan(i);
            this.showDate[i].leftTodoBg = true;
          }
        }else if(this.showDate[i-1] && (this.showDate[i-1].before || this.showDate[i-1].after)){
          //gray
          this.showDate[i].noBackground = true;
          this.showDate[i-1].rightGrayBg = true;
          this.showDate[i-1].rightTodoBg = false;
          this.showDate[i-1].rightDoneBg = false;
          this.dealSpan(i);
          this.showDate[i].leftGrayBg = true;
          this.showDate[i].leftTodoBg = false;
          this.showDate[i].leftDoneBg = false;
        }
      }

    }
  }

  dealSpan(i: number){
    if(this.showDate[i].todo){
      this.showDate[i].spanTodoBg = true;
      this.showDate[i].leftTodoBg = true;
      this.showDate[i].rightTodoBg = true;
    }
    if(this.showDate[i].done){
      this.showDate[i].spanDoneBg = true;
      this.showDate[i].leftDoneBg = true;
      this.showDate[i].rightDoneBg = true;
    }
    if((this.showDate[i].before || this.showDate[i].after)){
      this.showDate[i].spanGrayBg = true;
      this.showDate[i].leftGrayBg = true;
      this.showDate[i].rightGrayBg = true;
    }
    if(this.showDate[i].isBeforeToday){
      this.showDate[i].spanGoneBg = true;
      this.showDate[i].leftGoneBg = true;
      this.showDate[i].rightGoneBg = true;
    }
  }
  /**
   * 点击分钟
   */
  onClickMinute(event: any, index) {
    event.stopPropagation();
    this.nowMinute = this.minuteList[index].minute;
    for (let i = 0; i < this.minuteList.length; i++) {
      this.minuteList[i].current = false;
      if (index == i) {
        this.minuteList[i].selected = true;
        this.outputData.minute = this.minuteList[i].minute;
        // this.init_minute = '';
      } else {
        this.minuteList[i].selected = false;
      }
    }

  }

  /**
   * 隐藏时间消失，清除日历显示小时的空白间距
   */
  clearCalendarMargin() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].hasMargin = false;
    }
    this.isShowHour = false;
  }

  /**
   * 判断小时分钟是否为空
   */
  isHourMinuteEmpty() {
    if (this.outputData.hour == '' || this.outputData.minute == '') {
      this.outputData.hour = this.init_hour;
      this.outputData.minute = this.init_minute;
    }
  }

  /**
   * 点击done
   * @param event
   * @returns {boolean}
   *  传出对象格式{
   *   year: number ,
   *   month: number ,
   *   monthDay: '' ,
   *   hour: '' ,
   *   minute: '',
   *   time:number   //时间戳
   * }
   */
  selectDone(event: any) {
    event.stopPropagation();
    this.isHourMinuteEmpty(); //小时分钟是否空，赋值默认值
    this.isShowHour = false;
    this.clearCalendarMargin();
    //得到utc时间
    let date: any = new Date(this.outputData.year, this.outputData.month, parseInt(this.outputData.monthDay),
      parseInt(this.outputData.hour), parseInt(this.outputData.minute));
    //只能选择4分钟之后的闹钟
    let now: any = new Date().getTime() + 4 * 60 * 1000;
    //选择晚于现在的时间
    if (parseInt(date.getTime()) > parseInt(now)) {
      this.outputData.time = Math.floor(date.getTime() / 1000);
      let data: any;
      if (this.inputData.isTip) {
        data = {
          "uid": '',
          "form": AlarmConfig.FORM_TIPS,
          "rid": this.missionObj.rid,
          "effective_time": this.outputData.time,
          "mode": AlarmConfig.MODE_FIX
        }
      } else {
        data = {
          "uid": "",
          "form": AlarmConfig.FORM_MISSION,
          "rid": this.missionObj.mid,
          "effective_time": this.outputData.time,
          "mode": AlarmConfig.MODE_FIX
        };
      }
      if(!this.inputData.hasOwnProperty('resignation')){
        //添加闹钟
        if(this.missionObj.has_alarm){
          data.alarm_id = this.missionObj.alarm_id;
          this.alarmModelService.alarmUpdate({data: data}, (response) => {
            if (response.status == 1) {
              //传出数据
              //提示设置成功
              this.alarmSuccess();
              let outData = this.typeService.clone(data);
              outData.has_alarm = 1;
              outData.alarm_id = response.data.id;
              outData.effective_time = data.effective_time;
              this.missionObj.alarm_id = response.data.id;
              this.outFixInfo.emit(outData);
              if(this.outDefault) {
                this.outDefault.emit();
              }
            }
          });
        }else{
          this.alarmModelService.alarmAdd({data: data}, (response) => {
            if (response.status == 1) {
              //传出数据
              //提示设置成功
              this.alarmSuccess();
              let outData = this.typeService.clone(data);
              outData.has_alarm = 1;
              outData.alarm_id = response.data.id;
              outData.effective_time = data.effective_time;
              this.missionObj.alarm_id = response.data.id;
              this.outFixInfo.emit(outData);
              if(this.outDefault) {
                this.outDefault.emit();
              }
            }
          });
        }
      } else{
        this.outFixInfo.emit(data);
        if(this.outDefault) {
          this.outDefault.emit();
        }
      }
    } else {
      this.clearCalendarMargin();
      //打开弹窗提示选择今天之前的日期
      this.timeError();
    }
  }
  /**
   * 取消闹钟
   * @param event
   */
  cancelAlarm(event: any){
    if(!this.hasAlarm){
      return false;
    }
    this.alarmModelService.alarmDelete({data:{alarm_id: this.missionObj.alarm_id,mode:'2'}},(response: any) => {
      if(response.status){
        if (this.inputData.isTip){
          this.outDeleteInfo.emit({id:this.missionObj.rid});
          if(this.outDefault) {
            this.outDefault.emit();
          }
        }else{
          this.outDeleteInfo.emit({id:this.missionObj.mid});
          if(this.outDefault) {
            this.outDefault.emit();
          }
        }
      }
    })
  }

  /**
   * dialog 提示设置闹钟成功
   */
  alarmSuccess() {
    let settings = {
      mode: '3',
      title: 'Set alarm',
      isSimpleContent: true,
      simpleContent: 'The alarm was set up successfully',
      buttons: [{
        type: 'ok'
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 打开弹窗提示错误
   */
  timeError() {
    let settings = {
      mode: '3',
      title: 'Error',
      isSimpleContent: true,
      simpleContent: 'At least 5 mins later. Hours and mins are required!',
      buttons: [{
        type: 'ok'
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 点击日历头部空白处
   */
  onClickDateTop(event: any) {
    event.stopPropagation();
    this.selectYear.nativeElement.className = 'hide';
    this.selectMonth.nativeElement.className = 'hide';
  }

  /**
   * 点击空白处
   */
  onClickEmpty(event: any) {
    event.stopPropagation();
  }

  /**
   *处理天
   */
  formatDay(day: any) {
    if (day < 10) {
      day = '0' + day;
    }
    return day.toString();
  }

  /**
   * 长按按下
   * @param event
   * @param type
   */
  onHourMouseDown(type: string, event?: any) {
    if (event) {
      event.stopPropagation();
    }
    let self = this;
    if (type == 'left') {
      this.leftTimer = setInterval(() => {
        self.setShowDate(1);
      }, 500);
    }
    if (type == 'right') {
      this.rightTimer = setInterval(() => {
        self.setShowDate(2);
      }, 500);
    }
  }


}