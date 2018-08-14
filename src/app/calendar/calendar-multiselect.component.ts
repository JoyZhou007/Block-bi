/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/7.
 */

import {
  Inject, Component, OnInit, EventEmitter, Renderer,
  ViewChild, AfterViewInit, Input, Output, ViewEncapsulation, HostListener
} from "@angular/core";
import * as MissionConstant from "../shared/config/mission.config";
import {MissionModelService} from "../shared/services/model/mission-model.service";
import {CalendarDate} from "../shared/services/model/entity/calendar-entity";
import * as CalendarConfig from '../shared/config/calendar.config';

@Component({
  selector: 'bi-calendar-multiselect',
  styleUrls: ['../../assets/css/date/date.css'],
  templateUrl: './calendar-multiselect.component.html',
  providers: [MissionModelService],
  encapsulation: ViewEncapsulation.None
})

export class CalendarMultiSelectComponent implements OnInit, AfterViewInit {
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
  public dateDefaultOptions: any = {
    defaultDate: null,
    dateFormat: 'yyyy-mm-dd',
  };
  public clickStart: boolean = false; //是否点击了开始
  public clickEnd: boolean = false;//是否点击了结束
  public missionObj: any = {};
  public newStart: any = {//新选择的开始时间
    year: '',
    month: '',
    monthDay: '',
    hour: '',
    minute: '',
    isNow: false,
    isLink: false,
    linkArr: [],
    isShowDateTime: false
  };
  public newEnd: any = {  //新选择的结束时间
    year: '',
    month: '',
    monthDay: '',
    hour: '',
    minute: '',
    isShowDateTime: false
  };
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
  public hasStart: boolean = true; //有开始时间
  public hasEnd: boolean = true; //有结束时间
  public startDate: any = { //显示开始时间对象
    year: '',  //年
    month: '',  //月
    day: '',   //日
    week: '',   //星期
    hms: ''    //时分秒
  };
  public endDate: any = { //显示开始时间对象
    year: '',  //年
    month: '',  //月
    day: '',   //日
    week: '',   //星期
    hms: ''    //时分秒
  };
  public formatString: string = 'yyyy-mm-dd HH:MM';//日期格式字符串
  public outputData = {   //传出对象
    startDate: null,
    endDate: null
  };
  public startDes: string; //没有具体开始时间时要显示的描述
  public endDes: string; //没有具体结束时间时要显示的描述
  public listTop: number = CalendarConfig.CALENDAR_MARGIN_TOP;//日历日期距离顶部长度
  public showHourTop: number;  //小时top值
  public isShowHour: boolean = false; //显示小时，分钟模块
  public dateTemplate: any = {};//传入图标信息
  public linkMissionList: Array<any>; //link列表
  public isStartLink: boolean = false; //是否显示link
  public isHasLink: boolean = false; //是否有link
  public linkInfoName: string = '';  //选择的link name
  public linkArr: Array<any> = [];   //所有的link列表
  public isPeriod: boolean = false;//是否显示Period输入框
  public isShowUnit: boolean = false;//显示period单位列表
  public periodList: Array<any> = ['Months', 'Weeks', 'Days', 'Hours'];  //perriod可选单位
  public periodUnit: string = 'Months';   //period默认单位
  public periodBinding: number; //period的值
  public isMeeting: boolean = false;//是meeting
  public isBidding: boolean = false;//是Bidding
  public lastIndex: number;//今天之前的最后一天
  public nowHour: string;//今天之前的最后一天
  public nowMinute: string;//今天之前的最后一天
  public defaultValue: any;//默认值
  public hideCalendar: boolean = true;
  public isClickEnd: string;
  public pending: string = 'PENDING';
  public noMinute: boolean = false;
  public noHour: boolean = false;
  public marginSpace = CalendarConfig.CALENDAR_MARGIN_SPACE;


  @ViewChild('dateForm') dateForm: any;
  @ViewChild('selectMonth') selectMonth: any;  //选择月
  @ViewChild('selectYear') selectYear: any;    //选择年
  @ViewChild('dataMonth') dataMonth: any;      //设置月位置
  @ViewChild('dataYear') dataYear: any;        //设置年位置
  @ViewChild('rollHour') rollHour: any;
  private leftTimer: any;
  private rightTimer: any;
  private hourStart: number;
  private hourEnd: number;
  private workTimePeriod: any [];

  //设置日历位置
  private elementInfo: any;
  private getOption: any;
  private event: any;
  private isSearch: boolean = false;
  private positionRight: boolean = false;

  constructor(private renderer: Renderer,
              public missionModelService: MissionModelService,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('page.element') public pageElement: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }

  @HostListener('document:mouseup', ['$event'])
  mouseup(event: any) {
    clearInterval(this.rightTimer);
    clearInterval(this.leftTimer);
  }


  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    this.hideCalendar = true;
    if (this.outDefault) {
      this.outDefault.emit();
    }
  }

  /**
   * calendar 传入属性
   * {
   * data:{
   *      start:,
   *      end:,
   * }
   *  dateTemplate：{   //传入是否有具体时间
   *      start：{
   *          isShowDateTime：boolean
   *      },
   *      end{
   *        isShowDateTime：boolean
   *      }
   *  }
   *  isClickStart：  //点击开始进入
   *  isClickEnd:    //点击结束进入
   *  defaultValue:{ //可选
   *    start:'2017-05-25 09:00',
   *    end:'2017-05-25 10:00'
   *  },
   *  noMinute:boolean,
   *  noHour:boolean,
   *  hourRange:{ //小时的可选范围
   *    start: 8,
   *    end: 18
   *  },
   *  workTimePeriod: number [] //工作时间，非工作时间不可选
   *  isShow:显示日历
   *  positionRight：true // 位置右移
   * }
   *
   */

  @Input()
  set multiselectOption(option: any) {
    this.selectedDateIn = this.getDateIn(new Date());
    if (option) {
      this.toggleSelectService.closeElement();
      this.toggleSelectService.setCalendarElement(() => {
        if (this.outDefault) {
          this.outDefault.emit();
        }
      });
      this.getOption = option;
      this.missionObj = this.typeService.clone(option.data);
      if (!this.missionObj) {
        this.missionObj = {
          start: '',
          end: ''
        };
      }
      //清空上次开始，结束
      this.clearStart();
      this.clearEnd();
      //将传入的日期赋值给当前开始，结束
      this.startEndInit();
      //是否是meeting
      if (option.isMeeting) {
        this.isMeeting = true;
      }
      if (option.isBidding) {
        this.isBidding = true;
      }
      if (option.isSearch) {
        this.isSearch = true;
      }
      if (option.defaultValue) {
        this.defaultValue = option.defaultValue;
      }
      //是否显示分钟
      if (option.noMinute) {
        this.noMinute = true;
      } else {
        this.noMinute = false;
      }
      //是否显示小时
      if (option.noHour) {
        this.noHour = true;
      } else {
        this.noHour = false;
      }
      if(option.positionRight){
        this.positionRight = true;
      }else{
        this.positionRight = false;
      }

      if (option.hasOwnProperty('hourRange')) {
        this.hourStart = option.hourRange.start;
        this.hourEnd = option.hourRange.end;
      }
      //设置工作时间不能选择
      if (option.hasOwnProperty('workTimePeriod')) {
        this.workTimePeriod = option.workTimePeriod;
      }

      this.dateTemplate = option.dateTemplate;
      if (option.isClickStart) {   //是否是点击start进入的
        this.clickStart = true;
        this.isClickEnd = 'start';
      } else {
        this.clickStart = false;
      }

      if (option.isClickEnd) {   //是否是点击end进入的
        this.clickEnd = true;
        this.isClickEnd = 'end';
      } else {
        this.clickEnd = false;
      }

      if (this.dateTemplate) {
        this.startEndType();
      }
    }
    this.curDate = this.getDateIn();
    this.dateOptions = this.typeService.clone(this.dateDefaultOptions);
    this.dateFormat = this.dateOptions.dateFormat;
    this.initSelect();
    this.initHour();
    this.initMinute();
    this.addMiddle();
    //判断是否该设置默认时间
    this.defaultDate();
    //选中年份，月份跳转
    if (this.clickStart) {
      this.selectStartMonthYear();
    }
    if (this.clickEnd) {
      this.selectEndMonthYear();
    }
    this.setShowElement();
  }

  @Output() public outSelectData = new EventEmitter(); //传给父组件选择的开始，结束日期
  @Output() public closeCalendar = new EventEmitter(); //关闭日历
  @Output() public outputError = new EventEmitter(); //日期选择不合法
  @Output() public outDefault = new EventEmitter(); //恢复默认值

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.dateOptions) {
      this.dateForm.nativeElement.onclick = (event: any) => {
        event.stopPropagation();
        this.selectMonth.nativeElement.className = 'hide';
        this.selectYear.nativeElement.className = 'hide';
      };
    }
    this.setShowElement();
  }

  /**
   * 设置标签
   */
  setShowElement(isEvent: any = true) {
    if (this.isSearch) {
      return false;
    }
    if (isEvent) {
      this.event = this.getOption.parentElement;
    }
    let isParent: boolean = !this.getOption.isParent;
    let leftSubtractValue: number = this.getOption.leftSubtractValue ? this.getOption.leftSubtractValue : 0;
    this.elementInfo = this.pageElement.getElementPosition(this.event, this.dateForm.nativeElement.offsetHeight, this.getOption.isFixed, isParent, leftSubtractValue);
    let getElementInfo:any;
    if(this.positionRight && this.clickEnd){
      getElementInfo= this.pageElement.calcElementPositionRight(this.elementInfo, this.getOption.subtractValue);
    }else{
      getElementInfo= this.pageElement.calcElementPosition(this.elementInfo, this.getOption.subtractValue);
    }
    getElementInfo.element = this.getOption.currentShowElement;
    this.pageElement.setElementPosition(getElementInfo, this.renderer);
  }

  /**
   * 其它地方调用  setShowElement 方法
   */
  getShowElement() {
    setTimeout(() => {
      this.setShowElement(false);
    }, 16.7)
  }

  /**
   * 判断开始，结束时哪种类型
   */
  startEndType() {
    //判断开始
    if (this.dateTemplate.start.isShowDateTime) { //是否有具体开始时间
      this.hasStart = true;
      this.getShowInfo(0);
      this.newStart.isShowDateTime = true;
      this.newStart.year = this.getLocalTime(this.missionObj.start, 'yyyy');
      this.newStart.month = parseInt(this.getLocalTime(this.missionObj.start, 'mm')) - 1;
      this.newStart.monthDay = this.getLocalTime(this.missionObj.start, 'dd');
      this.newStart.hour = this.getLocalTime(this.missionObj.start, 'HH');
      if (!this.noMinute) {
        this.newStart.minute = this.getLocalTime(this.missionObj.start, 'MM');
      } else {
        this.newStart.minute = '00';
      }
      if (!this.noHour) {
        this.newStart.hour = this.getLocalTime(this.missionObj.start, 'HH');
      } else {
        this.newStart.hour = '00';
      }

      this.linkInfoName = '';
      this.isPeriod = false;
    } else {
      this.clearStart();
      this.hasStart = false;
      this.newStart.isShowDateTime = false;
      if (this.dateTemplate.start.isHasLink) { //是否有link
        this.linkInfoName = this.dateTemplate.start.linkArr[0].name;
        if (this.dateTemplate.end.isShowDatePeriod) {
          this.newStart.isLink = true;
          this.isPeriod = true;  //初始化period
          this.periodBinding = this.dateTemplate.end.date_period.data;//period值
          this.periodUnit = this.dateTemplate.end.date_period.unit;    //period的单位
        } else {
          this.newStart.isLink = false;
          this.isPeriod = false;
          this.periodBinding = 0;//period值
          this.periodUnit = '';    //period的单位
        }
        this.newStart.linkArr = this.dateTemplate.start.linkArr;
        this.missionObj.start = '';
        this.missionObj.end = '';
      } else {  //是否是now
        this.isPeriod = false;
        this.linkInfoName = '';
        this.newStart.isLink = false;
        this.newStart.linkArr = [];
        this.startDes = this.dateTemplate.start.defaultContent;
        if (this.dateTemplate.start.isNow) {
          let now = new Date();
          let startMinute = now.getMinutes();
          if (startMinute % 5) {
            startMinute = startMinute + (5 - startMinute % 5);
          }
          let newDate = new Date(new Date().setMinutes(startMinute));
          this.missionObj.start = this.dateService.utcDateFormat(newDate.toUTCString(), this.formatString);
          this.newStart = this.getDateObj(this.missionObj.start);
          this.hasStart = false;
          this.newStart.isNow = true;
        }
        if (this.startDes == this.pending) {  //如果是pending
          this.newStart.isPending = true;
        }
      }
    }

    //判断结束
    if (this.dateTemplate.end.isShowDateTime && !this.isPeriod) {   //是否有具体结束时间
      this.hasEnd = true;
      this.getShowInfo(1);
      this.newEnd.year = this.getLocalTime(this.missionObj.end, 'yyyy');
      this.newEnd.month = parseInt(this.getLocalTime(this.missionObj.end, 'mm')) - 1;
      this.newEnd.monthDay = this.getLocalTime(this.missionObj.end, 'dd');
      this.newEnd.hour = this.getLocalTime(this.missionObj.end, 'HH');
      if (!this.noMinute) {
        this.newEnd.minute = this.getLocalTime(this.missionObj.end, 'MM');
      } else {
        this.newEnd.minute = '00';
      }
      if (!this.noHour) {
        this.newEnd.hour = this.getLocalTime(this.missionObj.end, 'HH');
      } else {
        this.newEnd.hour = '00';
      }

    } else {
      this.hasEnd = false;
      this.endDes = this.dateTemplate.end.defaultContent;
      if (this.dateTemplate.end.defaultContent == this.pending) {
        this.clearEnd();
      }
      if (this.endDes == this.pending) {
        this.newEnd.isPending = true;
      }
    }
  }


  /**
   * 开始时间选中年份，月份跳转
   */
  selectStartMonthYear() {
    if (this.newStart.year && this.newStart.month) {
      this.setShowMonth(this.newStart.month);
      this.setShowYear(this.newStart.year);
    }
  }

  /**
   * 结束时间选中年份，月份跳转
   */
  selectEndMonthYear() {
    if (this.newEnd.year && this.newEnd.month) {
      this.setShowMonth(this.newEnd.month);
      this.setShowYear(parseInt(this.newEnd.year));
    }
  }

  /**
   * 设置默认时间
   */
  defaultDate() {
    if (this.missionObj.start == '' && this.missionObj.end == '') {
      if (this.isBidding || this.isMeeting) {
        //允许显示具体时间
        this.hasStart = true;
        this.hasEnd = true;
        //开始设置为今天8:00
        let now = new Date();
        let year = now.getFullYear().toString();
        let month = now.getMonth();
        let day = now.getDate().toString();
        this.missionObj.start = this.dateService.format(now, this.formatString);
        this.missionObj.end = this.dateService.format(now, this.formatString);

        this.newStart.year = year;
        this.newStart.month = month;
        this.newStart.monthDay = day;
        this.newStart.hour = '08';
        this.newStart.minute = '00';

        let week = now.getDay();
        this.startDate.year = year;
        this.startDate.month = this.dateWord.monthSmall[month];
        this.startDate.day = this.formatDay(day);
        this.startDate.week = this.dateWord.week[week];
        this.startDate.hms = '08:00';

        //开始设置为今天9:00
        this.newEnd.year = year;
        this.newEnd.month = month;
        this.newEnd.monthDay = day;
        this.newEnd.hour = '09';
        this.newEnd.minute = '00';

        this.endDate.year = year;
        this.endDate.month = this.dateWord.monthSmall[month];
        this.endDate.day = this.formatDay(day);
        this.endDate.week = this.dateWord.week[week];
        this.endDate.hms = '09:00';
      }
      if (this.defaultValue) {
        //允许显示传入的默认时间  开始
        this.hasStart = true;
        this.hasEnd = true;
        this.setDefaultDate(this.defaultValue.start, 'start');
        this.setDefaultDate(this.defaultValue.end, 'end');
      }
    }
    if (this.noMinute) {
      this.newStart.minute = '00';
      this.newEnd.minute = '00';
    }
    if (this.noHour) {
      this.newStart.hour = '00';
      this.newEnd.hour = '00';
    }
    this.setSelectDate();
  }

  /**
   * 设置传入的默认时间
   */
  setDefaultDate(dateStr: string, type: string) {
    if (typeof dateStr == 'string') {
      dateStr = dateStr.replace(/-/g, '/');
    }
    if (type == 'start') {
      let date = new Date(dateStr);
      this.missionObj.start = this.dateService.format(date, this.formatString);
      this.newStart.year = this.dateService.formatWithTimezone(date.toUTCString(), 'yyyy');
      this.newStart.month = parseInt(this.dateService.formatWithTimezone(date.toUTCString(), 'mm')) - 1;
      this.newStart.monthDay = this.dateService.formatWithTimezone(date.toUTCString(), 'dd');
      this.newStart.hour = this.dateService.formatWithTimezone(date.toUTCString(), 'HH');
      this.newStart.minute = this.dateService.formatWithTimezone(date.toUTCString(), 'MM');
      let week = date.getDay();
      this.startDate.year = this.newStart.year;
      this.startDate.month = this.dateWord.monthSmall[parseInt(this.newStart.month)];
      this.startDate.day = this.newStart.monthDay;
      this.startDate.week = this.dateWord.week[week];
      this.startDate.hms = this.dateService.formatWithTimezone(date.toUTCString(), 'HH:MM');
    } else if (type == 'end') {
      let date = new Date(dateStr);
      this.missionObj.end = this.dateService.format(date, this.formatString);
      this.newEnd.year = this.dateService.formatWithTimezone(date.toUTCString(), 'yyyy');
      this.newEnd.month = parseInt(this.dateService.formatWithTimezone(date.toUTCString(), 'mm')) - 1;
      this.newEnd.monthDay = this.dateService.formatWithTimezone(date.toUTCString(), 'dd');
      this.newEnd.hour = this.dateService.formatWithTimezone(date.toUTCString(), 'HH');
      this.newEnd.minute = this.dateService.formatWithTimezone(date.toUTCString(), 'MM');
      let week = date.getDay();
      this.endDate.year = this.newEnd.year;
      this.endDate.month = this.dateWord.monthSmall[parseInt(this.newEnd.month)];
      this.endDate.day = this.newEnd.monthDay;
      this.endDate.week = this.dateWord.week[week];
      this.endDate.hms = this.dateService.formatWithTimezone(date.toUTCString(), 'HH:MM');
    }

  }

  /**
   *初始化新的开始，结束时间
   */
  startEndInit() {
    if (this.missionObj.start) {
      this.newStart.year = this.dateService.formatWithTimezone(this.missionObj.start, 'yyyy');
      this.newStart.month = parseInt(this.dateService.formatWithTimezone(this.missionObj.start, 'm')) - 1;
      this.newStart.monthDay = this.dateService.formatWithTimezone(this.missionObj.start, 'dd');
      this.newStart.hour = this.dateService.formatWithTimezone(this.missionObj.start, 'HH');
      if (!this.noMinute) {
        this.newStart.minute = this.dateService.formatWithTimezone(this.missionObj.start, 'MM');
      } else {
        this.newStart.minute = '00';
      }
      if (!this.noHour) {
        this.newStart.hour = this.dateService.formatWithTimezone(this.missionObj.start, 'HH');
      } else {
        this.newStart.hour = '00';
      }

    }
    if (this.missionObj.end) {
      this.newEnd.year = this.dateService.formatWithTimezone(this.missionObj.end, 'yyyy');
      this.newEnd.month = parseInt(this.dateService.formatWithTimezone(this.missionObj.end, 'm')) - 1;
      this.newEnd.monthDay = this.dateService.formatWithTimezone(this.missionObj.end, 'dd');
      this.newEnd.hour = this.dateService.formatWithTimezone(this.missionObj.end, 'HH');
      if (!this.noMinute) {
        this.newEnd.minute = this.dateService.formatWithTimezone(this.missionObj.end, 'MM');
      } else {
        this.newEnd.minute = '00';
      }
      if (!this.noHour) {
        this.newEnd.hour = this.dateService.formatWithTimezone(this.missionObj.end, 'HH');
      } else {
        this.newEnd.hour = '00';
      }
    }
  }

  /**
   * 初始化显示
   */
  initSelect() {
    this.isShowHour = false;
    if (this.dateOptions.defaultDate === null) {
      //默认日期
      this.curDate = this.getDateIn();
    } else {
      this.selectedDateIn = this.getDateIn(this.dateOptions.defaultDate);
    }
    let setDate = this.selectedDateIn ? this.selectedDateIn : this.curDate;
    this.showDateIn = {
      year: setDate.year,
      month: setDate.month
    };
    this.setShowSelectYear();
    this.setSelectDate();
    this.beforeToday();//设置meeting样式

  }

  /**
   * meeting 今天之前的样式
   */
  beforeToday() {
    //开始结束选择同一天是,左侧p不显示背景
    let startDay: any = {};
    let endDay: any = {};
    let selectSame: number;
    for (let i = 0; i < this.showDate.length; i++) {
      if (this.showDate[i].selectedStart) {
        startDay = this.showDate[i];
        selectSame = i;
      }
      if (this.showDate[i].selectedEnd) {
        endDay = this.showDate[i];
      }
    }
    if (startDay === endDay) {
      this.showDate[selectSame].leftDoneBg = false;
      this.showDate[selectSame].leftTodoBg = false;
    }

    if (this.isMeeting) {
      //meeting 下今天之前不可点击，背景颜色灰色
      for (let i = 0; i < this.showDate.length; i++) {
        if (this.compareDate(this.curDate, this.showDate[i]) == 1) {
          this.showDate[i].isBeforeToday = true;
          this.lastIndex = i;
        } else {
          this.showDate[i].isBeforeToday = false;
          //今天的前一天没有todo，done 设置右边为圆角
          if (this.showDate[this.lastIndex] && !this.showDate[this.lastIndex].todo && !this.showDate[this.lastIndex].done
            && !(this.showDate[this.lastIndex].before || this.showDate[this.lastIndex].after)) {
            this.showDate[this.lastIndex].lastBeforeToday = true;
          }
        }
      }
    }
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
   * 显示选择的年份
   */
  showSelectYear(event: any) {
    event.stopPropagation();
    this.selectYear.nativeElement.className = '';
    this.selectMonth.nativeElement.className = 'hide';
    this.clearCalendar();
    //从今年的70年前开始显示  当前选中的年显示状态
    let selectOffset = (this.showDateIn.year - (new Date().getFullYear() - CalendarConfig.CALENDAR_YEAR_START)) * CalendarConfig.CALENDAR_SELECT_HEIGHT;
    this.selectYear.nativeElement.scrollTop = selectOffset;
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
   * 显示选择的月份
   */
  showSelectMonth(event: any) {
    event.stopPropagation();
    this.selectMonth.nativeElement.className = '';
    this.selectYear.nativeElement.className = 'hide';
    this.clearCalendar();
  }

  /**
   * 设置当前显示的日期
   * @param  reset 当点击日期时传入，保存点击日期的值
   */
  setSelectDate(reset ?: string) {
    this.showDate = [];
    this.dateInstance.setDate(1);
    let firstWeekDay = this.dateInstance.getDay();
    let curMonthDay = this.getMonthDay(   //当月天数
      this.showDateIn.year, this.showDateIn.month
    );
    //如果月初第一天不为星期天,本月日期需要填充上月日期
    if (firstWeekDay !== 0) {
      if (reset) {
        this.setBeforeMonthDay(firstWeekDay, reset);
      } else {
        this.setBeforeMonthDay(firstWeekDay);
      }

    }
    if (reset) {
      this.setMonthDay(curMonthDay, reset);//填充当月日期
    } else {
      this.setMonthDay(curMonthDay);//填充当月日期
    }


    this.dateInstance.setDate(curMonthDay);
    let lastWeekDay = this.dateInstance.getDay();

    //如果最后不是星期六结尾,那么补充下月天数
    if (lastWeekDay !== 6) {
      if (reset) {
        this.setAfterMonthDay(lastWeekDay, reset);
      } else {
        this.setAfterMonthDay(lastWeekDay);
      }
    }
    this.sumDay = firstWeekDay + curMonthDay + 5 - lastWeekDay;//计算该页的总天数
    this.addMiddle();
  }

  /**
   * 获取月份的天数
   */
  getMonthDay(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 设置本月前需要填充的日期
   */
  setBeforeMonthDay(firstWeekDay: any, reset?: string) {
    let startDate = new Date(this.getLocalTime(this.missionObj.start).replace(/-/g, '/'));
    let endDate = new Date(this.getLocalTime(this.missionObj.end).replace(/-/g, '/'));
    let startObj = {
      year: startDate.getFullYear(),
      month: startDate.getMonth(),
      monthDay: startDate.getDate()
    };
    let endObj = {
      year: endDate.getFullYear(),
      month: endDate.getMonth(),
      monthDay: endDate.getDate()
    };

    let year = this.showDateIn.month > 0 ? this.showDateIn.year : this.showDateIn.year - 1;
    let beforeMonth = this.showDateIn.month > 0 ? this.showDateIn.month - 1 : 11;
    let monthDay = this.getMonthDay(this.showDateIn.year, beforeMonth);


    for (let day = monthDay - firstWeekDay + 1; day <= monthDay; day++) {
      let newDay: any = this.formatDay(day);
      //初始化对象
      let curDateIn = CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month = beforeMonth;
      curDateIn.monthDay = newDay;
      curDateIn.before = true;
      //最后一天有右圆角
      if (day == monthDay) {
        curDateIn.rightRadius = true;
      } else {
        curDateIn.rightRadius = false;
      }
      //设置开始，结束时间
      this.setStart_End(startObj, endObj, curDateIn);
      this.setSelectedDateClass(curDateIn);
      this.addStyle(curDateIn);
      //填充开始与灰色背景
      if ((curDateIn.done || curDateIn.todo) && curDateIn.selectedStart) {
        if (curDateIn.before) {
          curDateIn.leftGrayBg = true;
        }
      }
      this.showDate.push(curDateIn);
    }
    //点击时，将点击日期的值保存
    if (reset) {
      this.assignmentValue();
    }
    this.addMiddle();
    this.beforeToday();
    this.dealBackground();
  }

  /**
   * 设置本月后需要填充的日期
   */
  setAfterMonthDay(lastWeekDay: any, reset?: string) {
    let startDate = new Date(this.getLocalTime(this.missionObj.start).replace(/-/g, '/'));
    let endDate = new Date(this.getLocalTime(this.missionObj.end).replace(/-/g, '/'));
    let startObj = {
      year: startDate.getFullYear(),
      month: startDate.getMonth(),
      monthDay: startDate.getDate()
    };
    let endObj = {
      year: endDate.getFullYear(),
      month: endDate.getMonth(),
      monthDay: endDate.getDate()
    };

    let year = this.showDateIn.month < 11 ? this.showDateIn.year : this.showDateIn.year + 1;
    let afterMonth = this.showDateIn.month < 11 ? this.showDateIn.month + 1 : 1;

    for (let day = 1; day <= (6 - lastWeekDay); day++) {
      let newDay: any = this.formatDay(day);
      //初始化对象
      let curDateIn = CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month = afterMonth;
      curDateIn.monthDay = newDay;
      curDateIn.after = true;
      //第一天有左圆角
      if (day == 1) {
        curDateIn.leftRadius = true;
      } else {
        curDateIn.leftRadius = false;
      }
      this.setStart_End(startObj, endObj, curDateIn);//设置开始，结束时间
      this.setSelectedDateClass(curDateIn);
      this.addStyle(curDateIn);
      this.showDate.push(curDateIn);
    }
    //点击日期时，将点击日期的值保存
    if (reset) {
      this.assignmentValue();
    }
    this.addMiddle();
    this.beforeToday();
    this.dealBackground();
  }

  /**
   * 设置当月需要填充的日期
   */
  setMonthDay(monthDay: any, reset?: string) {

    let startDate = new Date(this.getLocalTime(this.missionObj.start).replace(/-/g, '/'));
    let endDate = new Date(this.getLocalTime(this.missionObj.end).replace(/-/g, '/'));
    let startObj = {
      year: startDate.getFullYear(),
      month: startDate.getMonth(),
      monthDay: startDate.getDate()
    };
    let endObj = {
      year: endDate.getFullYear(),
      month: endDate.getMonth(),
      monthDay: endDate.getDate()
    };


    for (let day = 1; day <= monthDay; day++) {
      let newDay: any = this.formatDay(day);
      //初始化对象
      let curDateIn = CalendarDate.init();
      curDateIn.year = this.showDateIn.year;
      curDateIn.month = this.showDateIn.month;
      curDateIn.monthDay = newDay;

      //设置开始，结束时间
      this.setStart_End(startObj, endObj, curDateIn);

      this.setSelectedDateClass(curDateIn);
      this.addStyle(curDateIn);
      this.showDate.push(curDateIn);

      //判断开始为now ，结束为pending ，今天的样式
      if (this.compareDate(curDateIn, this.curDate) == 0) {
        //如果点击了start 为 pending 或 今天之后的开始
        if (this.compareDate(this.newStart, this.curDate) == 1) {
          continue;
        }
        if (this.newEnd.year != '') {
          if (this.compareDate(this.newEnd, this.curDate) == 2) {
            continue;
          }
        }
        if (this.dateTemplate && this.dateTemplate.end.defaultContent == this.pending && this.newEnd.year == '') {
          curDateIn.rightTodoBg = true;
          curDateIn.rightDoneBg = false;
        }
        if (this.dateTemplate && this.dateTemplate.start.defaultContent == this.pending) {
          curDateIn.rightTodoBg = false;
          curDateIn.rightDoneBg = false;
        }
      }

    }
    this.addMiddle();
    this.beforeToday();
    this.dealBackground();
    //点击的日期时，赋点击日历的值
    if (reset) {
      this.assignmentValue();
    }
  }

  /**
   *检查是否赋新的值
   */
  assignmentValue() {
    if (this.clickStart) {
      this.assignmentSE('start');
    }
    if (this.clickEnd) {
      this.assignmentSE('end');
    }
  }

  /**
   * 返回日期包含年月日的对象
   */
  getDateObj(dateStr: any) {
    let year = this.getLocalTime(dateStr, 'yyyy');
    let month = this.getLocalTime(dateStr, 'm');
    let day = this.getLocalTime(dateStr, 'dd');
    let hour = this.getLocalTime(dateStr, 'HH');
    let minute = this.getLocalTime(dateStr, 'MM');
    let second = this.getLocalTime(dateStr, 'SS');
    let dateObj: any = {
      year: year,
      month: parseInt(month) - 1,
      monthDay: day,
      hour: hour,
      minute: minute,
    };
    if (dateStr === MissionConstant.MISSION_TIME_NULL) {
      dateObj = {}
    }
    return dateObj;

  }

  /**
   *添加日期每天左右样式
   */
  addStyle(curDateIn: any) {
    if (curDateIn.isToday && curDateIn.done && !curDateIn.selected) {
      curDateIn.spanDoneBg = true;
    } else {
      curDateIn.spanDoneBg = false;
    }
    if (curDateIn.isToday && curDateIn.todo && !curDateIn.selected) {
      curDateIn.spanTodoBg = true;
    } else {
      curDateIn.spanTodoBg = false;
    }

    if (curDateIn.selectedEnd && curDateIn.done && !(curDateIn.selectedStart && (curDateIn.isToday || curDateIn.selected)
      && curDateIn.done)) {
      curDateIn.leftDoneBg = true;
    } else {
      curDateIn.leftDoneBg = false;
    }
    if (curDateIn.selectedEnd && curDateIn.todo && !(curDateIn.selectedStart && (curDateIn.isToday || curDateIn.selected)
      && curDateIn.todo)) {
      curDateIn.leftTodoBg = true;
    } else {
      curDateIn.leftTodoBg = false;
    }
    if (curDateIn.selectedStart && (curDateIn.isToday || curDateIn.selected) && curDateIn.done && !(curDateIn.selectedEnd
      && curDateIn.done)) {
      curDateIn.rightDoneBg = true;
    } else {
      curDateIn.rightDoneBg = false;
    }
    if (curDateIn.selectedStart && (curDateIn.isToday || curDateIn.selected) && curDateIn.todo && !(curDateIn.selectedEnd
      && curDateIn.todo)) {
      curDateIn.rightTodoBg = true;
    } else {
      curDateIn.rightTodoBg = false;
    }
    if ((curDateIn.selectedStart) && (curDateIn.isToday || curDateIn.selected) &&
      (curDateIn.todo || curDateIn.done || curDateIn.before || curDateIn.after) || curDateIn.selectedEnd) {
      curDateIn.noBackground = true;
    } else {
      curDateIn.noBackground = false;
    }
  }

  /**
   * 开始，结束赋新的选中值
   */
  assignmentSE(type: string) {
    if (type == "start") {
      this.newStart.year = this.selectedDateIn.year;
      this.newStart.month = this.selectedDateIn.month;
      this.newStart.monthDay = this.selectedDateIn.monthDay;
      this.missionObj.start = this.newStart.year + '-' + this.formatMonth(this.newStart.month) + '-' +
        this.formatDay(this.newStart.monthDay);
      this.setSelectDate();
      this.newStart.isLink = false;
      this.newStart.isNow = false;
      this.newStart.linkArr = [];
    } else if (type == 'end') {
      this.newEnd.year = this.selectedDateIn.year;
      this.newEnd.month = this.selectedDateIn.month;
      this.newEnd.monthDay = this.selectedDateIn.monthDay;
      this.missionObj.end = this.newEnd.year + '-' + this.formatMonth(this.newEnd.month) + '-' +
        this.formatDay(this.newEnd.monthDay);
      this.setSelectDate();

    }

  }

  /**
   * 设置开始，结束时间，todo，doing，done属性
   */

  setStart_End(startObj: any, endObj: any, curDateIn: any) {
    //全部已完成
    if (this.compareDate(this.curDate, endObj) == 1) {
      curDateIn.done = this.compareDate(curDateIn, startObj) < 2 && this.compareDate(endObj, curDateIn) < 2;
    } else if (this.compareDate(this.curDate, startObj) == 2) {
      //全部未完成
      curDateIn.todo = this.compareDate(curDateIn, startObj) < 2 && this.compareDate(endObj, curDateIn) < 2;
    } else { //有已完成，有未完成
      //该日期大于等于开始日期 且小于当天日期   done 已做
      curDateIn.done = (this.compareDate(curDateIn, startObj) < 2) && this.compareDate(this.curDate, curDateIn) < 2;
      //该日期大于当天日期，且小于等于结束日期   todo 没做
      curDateIn.todo = (this.compareDate(endObj, curDateIn) < 2) && this.compareDate(curDateIn, this.curDate) == 1;
    }
    if (this.compareDate(curDateIn, startObj) == 0) {  //如果是开始
      curDateIn.selectedStart = true;
    }
    if (this.compareDate(endObj, curDateIn) == 0) {   //如果是结束
      curDateIn.selectedEnd = true;
    }

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
   * 是否是选中的时间
   */
  isSelectedDateIn(year: number, month: number, day: number): boolean {
    return year === this.selectedDateIn.year
      && month === this.selectedDateIn.month
      && this.selectedDateIn.monthDay == day;
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
   * 处理月
   */
  formatMonth(month: any) {
    month++;
    if (month < 10) {
      month = '0' + month;
    }
    return month;
  }

  /**
   *处理天
   */
  formatDay(day: any) {
    if (day < 10) {
      day = '0' + parseInt(day);
    }
    return day.toString();
  }


  /**
   * 得到浏览器时间字符串
   * @param timeStr

   */
  getLocalTime(timeStr: string, format?: string) {
    let formatStr = format ? format : this.formatString;
    return this.dateService.formatWithTimezone(timeStr, formatStr);
  }

  /**
   * 以上为公共部分,基础功能
   */

  /**
   * 点击设置开始时间按钮
   * @param event
   */
  onClickStart(event: any) {
    if (this.isClickEnd == 'start') {
      this.isClickEnd = 'end';
    }
    this.clickEnd = false;
    if (this.clickStart) {
      this.closeCalendar.emit(false);
      this.hideCalendar = true;
    }
    if (!this.clickStart) {
      this.clickStart = !this.clickStart;
      if (this.clickStart) {
        this.initHour();
        this.initMinute();
      }
      this.clearCalendar();
      //如果有已选择的开始时间， 跳转对应的年份，月份
      this.selectStartMonthYear();
    } else {
      return false;
    }
  }

  /**
   * 点击设置结束按钮
   * @param event
   */
  onClickEnd(event: any) {
    this.clickStart = false;
    this.positionRight = false;
    if (this.clickEnd) {
      this.closeCalendar.emit(false);
      this.hideCalendar = true;
    }
    if (!this.clickEnd) {
      this.clickEnd = !this.clickEnd;
      if (this.clickEnd) {
        this.initHour();
        this.initMinute();
        this.clearCalendar();
        //如果有已选择的结束时间， 跳转对应的年份，月份
        this.selectEndMonthYear();
      }
    } else {
      return false;
    }

  }

  /**
   * 点击日期
   */
  onClickEvent(dateIn: any, index: number, event: any) {
    if (event) {
      event.stopPropagation();
    }
    //筛选时间 非工作时间不能选择
    if (this.workTimePeriod) {
      let currentDate = new Date();
      currentDate.setFullYear(dateIn.year);
      currentDate.setMonth(dateIn.month);
      currentDate.setDate(dateIn.monthDay);
      let day = currentDate.getDay();
      if (this.workTimePeriod.length) {
        let dayArr = this.workTimePeriod.map((value) => {
          // return value === 0 ? 6 : value - 1;
          return parseInt(value);
        });
        if (dayArr.indexOf(day) === -1) {
          return false;
        }
      }
    }

    //如果是meeting，今天之前不能点击
    if (this.isMeeting) {
      if (this.compareDate(this.curDate, dateIn) == 1) {
        return false;
      }
    }
    //清空上次点击样式
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].selectedStart = false;
      this.showDate[i].selectedEnd = false;
      this.showDate[i].done = false;
      this.showDate[i].enddate = false;
      this.showDate[i].todo = false;
    }
    //开始时间大于结束时间
    this.dealSelectDate(dateIn);
    //小时，分钟框出现
    this.isShowHour = true;
    this.selectMonth.nativeElement.className = 'hide';
    this.selectYear.nativeElement.className = 'hide';
    this.deleteLink();
    let lineNumber: number = Math.ceil((index + 1) / CalendarConfig.CALENDAR_COLUMN_NUMBER);//点击的第几行
    if (!this.selectedDateIn) {
      this.selectedDateIn = {};
      this.selectedDateIn.minute = 0;
      this.selectedDateIn.hour = 0;
    }
    this.typeService.mergeObj(this.selectedDateIn, dateIn);
    //已点击过开始，或结束，可以开始设置新的时间，否则不设置
    if (this.clickEnd || this.clickStart) {
      this.setSelectDate('reset');
      //设置小时，分钟选中值
      this.selectHourMinute();
    }

    //添加空白，显示小时，分钟框
    let inx: number = index;
    this.addMargin(inx, lineNumber);

    //添加今天之前不可点样式，今天左边为done，右边为todo样式
    this.beforeToday();
    this.addMiddle();
    this.getShowElement();
  }

  /**
   * 处理开始时间晚于结束时间
   * @param dateIn
   */
  dealSelectDate(dateIn: any) {
    if (this.clickStart) {
      //结束日期跳转到开始后一天
      if (!(this.compareDate(this.newEnd, dateIn) < 2)) {
        let time = this.getTimeStamp(dateIn.year, dateIn.month,  //时间戳
          dateIn.monthDay, this.newEnd.hour, this.newEnd.minute);
        let lastDay = new Date(time + 24 * 60 * 60 * 1000);
        this.newEnd.year = lastDay.getFullYear().toString();
        this.newEnd.month = lastDay.getMonth();
        this.newEnd.monthDay = lastDay.getDate() < 10 ? `0${lastDay.getDate()}` : lastDay.getDate().toString();
        this.showDateInfo('end', this.newEnd);
        this.missionObj.end = this.newEnd.year + '-' + this.formatMonth(this.newEnd.month) + '-' +
          this.formatDay(this.newEnd.monthDay);
      }
    } else if (this.clickEnd) {
      //开始日期跳转到结束前一天
      if (!(this.compareDate(dateIn, this.newStart) < 2)) {
        let time = this.getTimeStamp(dateIn.year, dateIn.month,  //时间戳
          dateIn.monthDay, this.newStart.hour, this.newStart.minute);
        let lastDay = new Date(time - 24 * 60 * 60 * 1000);
        this.newStart.year = lastDay.getFullYear().toString();
        this.newStart.month = lastDay.getMonth();
        this.newStart.monthDay = lastDay.getDate() < 10 ? `0${lastDay.getDate()}` : lastDay.getDate().toString();
        this.showDateInfo('start', this.newStart);
        this.missionObj.start = this.newStart.year + '-' + this.formatMonth(this.newStart.month) + '-' +
          this.formatDay(this.newStart.monthDay);
      }
    }
  }

  /**
   * 删除开始中link ，结束period
   */
  deleteLink() {
    this.isStartLink = false;  //link 列表消失
    this.linkInfoName = '';
    this.isPeriod = false;
  }

  /**
   * 小时分钟选中
   */
  selectHourMinute() {
    if (this.clickStart) {
      this.hasStart = true;
      this.selectHourMinuteStyle(this.newStart, this.startDate);
      this.showDateInfo('start', this.newStart);
    }
    if (this.clickEnd) {
      this.hasEnd = true;
      this.selectHourMinuteStyle(this.newEnd, this.endDate);
      this.showDateInfo('end', this.newEnd);
    }
  }

  /**
   *
   * @param obj  newStart || newEnd
   */
  selectHourMinuteStyle(obj: any, dateObj: any) {
    //有值则选中当前值
    if (obj.hour != '' && obj.minute != '') {
      for (let i = 0; i < this.hourList.length; i++) {
        if (this.hourList[i].hour == obj.hour) {
          this.hourList[i].selected = true;
          if (i > 10) {
            this.rollHour.nativeElement.style.left = -32 * (i - 10) + 'px';
          }
        } else {
          this.hourList[i].selected = false;
        }
      }
      for (let i = 0; i < this.minuteList.length; i++) {
        if (this.minuteList[i].minute == obj.minute) {
          this.minuteList[i].selected = true;
        } else {
          this.minuteList[i].selected = false;
        }
      }
    } else {
      //没有值选中现在小时
      let nowHour = this.formatDay(new Date().getHours());
      for (let i = 0; i < this.hourList.length; i++) {
        if (this.hourList[i].hour == nowHour) {
          this.hourList[i].selected = true;
          obj.hour = this.hourList[i].hour;
          if (i > 10) {
            this.rollHour.nativeElement.style.left = -35 * (i - 10) + 'px';
          }
        } else {
          this.hourList[i].selected = false;
        }
      }
      for (let i = 0; i < this.minuteList.length; i++) {
        if (this.minuteList[i].minute == '00') {
          this.minuteList[i].selected = true;
          obj.minute = '00';
        } else {
          this.minuteList[i].selected = false;
        }
      }
    }
    dateObj.hms = obj.hour + ":" + obj.minute;

  }

  /**
   * 小时向左移动
   */
  onClickHourLeft(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    if (parseInt(this.rollHour.nativeElement.style.left) >= 0) {
      clearInterval(this.leftTimer);
      return false;
    }
    this.rollHour.nativeElement.style.left = parseInt(this.rollHour.nativeElement.style.left) + 32 + 'px';
  }

  /**
   * 小时向右移动
   */
  onClickHourRight(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    if (parseInt(this.rollHour.nativeElement.style.left) <= -13 * 32) {
      clearInterval(this.rightTimer);
      return false;
    }
    this.rollHour.nativeElement.style.left = parseInt(this.rollHour.nativeElement.style.left) - 32 + 'px';
  }

  /**
   * 长按按下
   * @param type
   * @param num   0 || 1
   * @param event  'left' || 'right'
   */
  onHourMouseDown(type: string, num: number, event?: any) {
    if (event) {
      event.stopPropagation();
    }
    let self = this;
    if (type == 'left') {
      this.leftTimer = setInterval(() => {
        if (num) {
          self.onClickHourLeft();
        } else {
          self.setShowDate(1);
        }
      }, 500);
    }
    if (type == 'right') {
      this.rightTimer = setInterval(() => {
        if (num) {
          self.onClickHourRight();
        } else {
          self.setShowDate(2);
        }
      }, 500);
    }
  }

  /**
   * 头部显示时间
   * @param type
   * @param obj
   */
  showDateInfo(type: string, obj: any) {
    let dateObj: any;
    if (type == 'start') {
      dateObj = this.startDate;
    } else if (type == 'end') {
      dateObj = this.endDate;
    }
    let date = new Date(obj.year, obj.month, obj.monthDay);
    let week = date.getDay();
    dateObj.year = obj.year;
    dateObj.month = this.dateWord.monthSmall[obj.month];
    dateObj.day = obj.monthDay;
    dateObj.week = this.dateWord.week[week];
  }

  /**
   * 添加空白
   */
  addMargin(inx: number, lineNumber: number) {
    for (let i = 0; i < this.showDate.length; i++) {
      if (inx <= i && i <= lineNumber * CalendarConfig.CALENDAR_COLUMN_NUMBER - 1) {
        this.showDate[i].hasMargin = true;
      } else {
        this.showDate[i].hasMargin = false;
      }
      this.showHourTop = this.listTop + this.marginSpace * lineNumber;
    }
  }

  /**
   * 清空小时，分钟选中值
   */
  clearHour_minute() {
    for (let i = 0; i < this.hourList.length; i++) {
      this.hourList[i].selected = false;
    }
    for (let i = 0; i < this.minuteList.length; i++) {
      this.minuteList[i].selected = false;
    }
  }

  /**
   * 隐藏时间消失，清除日历显示小时的空白间距
   */
  clearCalendar() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].hasMargin = false;
    }
    this.isShowHour = false;
    this.getShowElement();
  }

  /**
   * 清空日历样式
   */

  clearCalendarStyle() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].hasMargin = false;
      this.showDate[i].done = false;
      this.showDate[i].todo = false;
      this.showDate[i].enddate = false;
      this.showDate[i].selected = false;
      this.showDate[i].isStartSelected = false;
    }
  }

  /**
   * 清空newStart对象 （新选择的开始日期对象）
   */
  clearStart() {
    this.newStart.year = '';
    this.newStart.month = '';
    this.newStart.monthDay = '';
    this.newStart.hour = '';
    this.newStart.minute = '';
    this.newStart.week = '';
  }

  /**
   * 清空newEnd对象 （新选择的结束日期对象）
   */
  clearEnd() {
    this.newEnd.year = '';
    this.newEnd.month = '';
    this.newEnd.monthDay = '';
    this.newEnd.hour = '';
    this.newEnd.minute = '';
    this.newEnd.week = '';
  }

  /**
   * 点击done按钮
   */
  /**
   * calendar 输出对象
   * {
   *  endDate：{
   *    year:string,
   *    month:number,
   *    monthDay:string,
   *    hour:string,
   *    minute:string,
   *    week:string,
   *     isShowDatePeriod:boolean,  //是period
   *     date_period:object{      //period 数据
   *        data：number,        //时间长度
   *        unit：string       //单位
   *     }
   *  },
   *  startDate：{
   *    year:string,
   *    month:number,
   *    monthDay:string,
   *    hour:string,
   *    minute:string,
   *    week:string,    //星期
   *    isLink:boolean, //有link
   *    isNow:boolean,  //是now
   *    linArr:Array    //link 列表
   *  }
   * }
   *
   */
  selectDone(event: any) {
    this.isShowHour = false;
    this.clearCalendar();
    let start: any = new Date(this.newStart.year, this.newStart.month, this.newStart.monthDay, this.newStart.hour,
      this.newStart.minute).getTime();
    let end: any = new Date(this.newEnd.year, this.newEnd.month, this.newEnd.monthDay, this.newEnd.hour,
      this.newEnd.minute).getTime();
    //开始选择具体时间，结束选择具体时间，或者开始，结束是pending，开始是now
    if (this.newStart.year && this.newEnd.year || this.newStart.isPending || this.newEnd.isPending || this.newStart.isNow) {
      if (this.newStart.year && this.newEnd.year && start > end) {  //选择不合法
        /*this.errorDialog();*/
        this.outputError.emit(false);
      } else {  //选择合法
        this.linkInfoName = '';
        this.outputData = {  //输出对象格式
          startDate: {
            year: this.newStart.year.toString(),
            month: this.newStart.month,
            monthDay: this.newStart.monthDay,
            hour: this.newStart.hour == 0 ? '00' : this.newStart.hour,
            minute: this.newStart.minute == 0 ? '00' : this.newStart.minute,
            week: this.getWeek(this.newStart),
            isNow: this.newStart.isNow ? this.newStart.isNow : false,
            isLink: this.newStart.isLink ? this.newStart.isLink : false,
            linkArr: this.newStart.linkArr ? this.newStart.linkArr : [],
            startTimeStamp: this.getTimeStamp(this.newStart.year, this.newStart.month,  //时间戳
              this.newStart.monthDay, this.newStart.hour, this.newStart.minute)
          },
          endDate: {
            year: this.newEnd.year.toString(),
            month: this.newEnd.month,
            monthDay: this.newEnd.monthDay,
            hour: this.newEnd.hour == 0 ? '00' : this.newEnd.hour,
            minute: this.newEnd.minute == 0 ? '00' : this.newEnd.minute,
            week: this.getWeek(this.newEnd),
            endTimeStamp: this.getTimeStamp(this.newEnd.year, this.newEnd.month,
              this.newEnd.monthDay, this.newEnd.hour, this.newEnd.minute)
          }
        };
        this.outputLink();
        this.outSelectData.emit(this.outputData);
        this.hideCalendar = true;
      }
      if (this.outDefault) {
        this.outDefault.emit();
      }
    } else {
      this.errorDialog();
    }
  }

  /**
   * 判断传出link
   */
  outputLink() {
    if (this.newStart.isLink) {
      this.clearEnd();
      this.outputData.endDate.date_period = {
        data: this.periodBinding,
        unit: this.periodUnit
      };
      this.outputData.endDate.isShowDatePeriod = true;
    } else {
      this.outputData.endDate.date_period = {
        data: '',
        unit: ''
      };
      this.outputData.endDate.isShowDatePeriod = false;
    }
  }

  /**
   * 提示错误
   */
  errorDialog() {
    let settings = {
      mode: '3',
      title: 'Please select again',
      isSimpleContent: true,
      simpleContent: 'Start time must be earlier than the end time!',
      buttons: [{
        type: 'ok',
      }],
    };
    this.dialogService.openNew(settings);
    /* this.clearStart();
     this.clearEnd();*/
    return false;
  }

  /**
   * 得到时间戳
   */
  getTimeStamp(year, month, monthDay, hour, minute) {
    return new Date(year, month, monthDay, hour, minute).getTime();
  }

  /**
   * 点击小时
   */
  onHourClick(event: any, index: number) {
    if (this.hourStart && this.hourEnd) {
      if (index < this.hourStart || index > this.hourEnd) {
        return false;
      }
    }
    this.nowHour = this.hourList[index].hour;
    for (let i = 0; i < this.hourList.length; i++) {
      this.hourList[i].current = false;
      if (index == i) {
        this.hourList[i].selected = true;
        if (this.clickStart) {
          this.newStart.hour = this.hourList[i].hour;
          this.startDate.hms = this.newStart.hour + ':' + this.newStart.minute;
        } else if (this.clickEnd) {
          this.newEnd.hour = this.hourList[i].hour;
          this.endDate.hms = this.newEnd.hour + ':' + this.newEnd.minute;
        }
      } else {
        this.hourList[i].selected = false;
      }
    }

    /*    if (this.startComplete()) {
     //开始:小时，分钟都选择完成
     /!*   this.clearCalendar();//清空空白
     this.isShowHour = false;*!/
     if (this.isClickEnd != 'end') {
     this.clickStart = false;
     this.clickEnd = true;
     }
     } else if (this.endComplete()) {
     //结束:小时，分钟都选择完成
     /!* this.clearCalendar();//清空空白
     this.isShowHour = false;*!/
     }*/
  }

  /**
   * 点击分钟
   */
  onClickMinute(event: any, index) {
    this.nowMinute = this.minuteList[index].minute;
    for (let i = 0; i < this.minuteList.length; i++) {
      this.minuteList[i].current = false;
      if (index == i) {
        this.minuteList[i].selected = true;
        if (this.clickStart) {
          this.newStart.minute = this.minuteList[i].minute;
          this.startDate.hms = this.newStart.hour + ':' + this.newStart.minute;
        } else if (this.clickEnd) {
          this.newEnd.minute = this.minuteList[i].minute;
          this.endDate.hms = this.newEnd.hour + ':' + this.newEnd.minute;
        }
      } else {
        this.minuteList[i].selected = false;
      }
    }

    /*    //开始:小时，分钟都选择完成
     if (this.startComplete()) {
     // this.clearCalendar();//清空空白
     // this.isShowHour = false;
     if (this.isClickEnd != 'end') {
     this.clickStart = false;
     this.clickEnd = true;
     }
     } else if (this.endComplete()) {
     //结束:小时，分钟都选择完成
     /!*this.clearCalendar();//清空空白
     this.isShowHour = false;*!/
     }*/
  }

  /**
   * 判断是否完成了start选择
   */
  startComplete(): boolean {
    if (this.clickStart) {
      this.newStart.hour = this.nowHour;
      this.newStart.minute = this.nowMinute;
    }
    this.addMiddle();
    let result = this.clickStart && this.newStart.hour != '' && this.newStart.minute != '';
    //更新头部显示小时分钟
    if (result) {
      this.startDate.hms = this.newStart.hour + ':' + this.newStart.minute;
    }
    return result;
  }

  /**
   * 判断是否完成了end选择
   */
  endComplete(): boolean {
    if (this.clickEnd) {
      this.newEnd.hour = this.nowHour;
      this.newEnd.minute = this.nowMinute;
    }
    this.addMiddle();
    let result = this.clickEnd && this.newEnd.hour != '' && this.newEnd.minute != '';
    if (result) {
      this.endDate.hms = this.newEnd.hour + ':' + this.newEnd.minute;
    }
    return result;
  }

  /**
   * 初始化小时数
   */
  initHour() {
    this.hourList = [];
    for (let i = 0; i < 24; i++) {
      let hour = this.typeService.clone(this.hourSettings);
      hour.hour = this.formatDay(i);
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
      this.minuteList.push(minute);
    }
  }

  /**
   * 得到显示日期信息  0:start时间   1：end时间
   * @param type
   */
  getShowInfo(type: number) {
    if (type === 0) {
      let year = this.dateService.formatWithTimezone(this.missionObj.start, 'yyyy');
      let month = parseInt(this.dateService.formatWithTimezone(this.missionObj.start, 'm')) - 1;
      let day = this.dateService.formatWithTimezone(this.missionObj.start, 'dd');
      let date: Date = new Date(year, month, day);
      let week = date.getDay();
      this.startDate.year = year;
      this.startDate.month = this.dateWord.monthSmall[month];
      this.startDate.day = day;
      this.startDate.week = this.dateWord.week[week];
      this.startDate.hms = this.getLocalTime(this.missionObj.start, 'HH:MM');
    } else if (type === 1) {
      let year = this.getLocalTime(this.missionObj.end, 'yyyy');
      let month = parseInt(this.getLocalTime(this.missionObj.end, 'm')) - 1;
      let day = this.getLocalTime(this.missionObj.end, 'dd');
      let date: Date = new Date(year, (month), day);
      let week = date.getDay();
      this.endDate.year = year;
      this.endDate.month = this.dateWord.monthSmall[month];
      this.endDate.day = day;
      this.endDate.week = this.dateWord.week[week];
      this.endDate.hms = this.getLocalTime(this.missionObj.end, 'HH:MM');
    }
  }

  /**
   * 得到现在日期字符串
   */
  getNowStr(): string {
    let now = new Date();
    return now.getFullYear() + '-' + this.formatMonth(now.getMonth()) + '-'
      + this.formatDay(now.getDate());
  }

  /**
   * 得到星期
   */
  getWeek(dateObj: any) {
    let year = dateObj.year;
    let month = dateObj.month;
    let day = parseInt(dateObj.monthDay);
    let date: Date = new Date(year, month, day);
    let week = date.getDay();
    return this.dateWord.week[week];
  }

  /**
   * 获取link列表
   */
  linkTheMission(event: any) {
    this.clearCalendar();
    this.missionObj.start = '';
    event.stopPropagation();
    this.missionModelService.fetchLinkList({
      mid: ''
    }, (data: any) => {
      this.isStartLink = !this.isStartLink;
      if (data.data.length) {
        this.linkMissionList = data.data;
      } else {
        this.linkMissionList = [];
      }
      if (this.linkMissionList.length !== 0) {
        this.isHasLink = true;
      } else {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'NO MISSION TO LINK!'
        };
        this.dialogService.openNew(settings);
      }
      this.addTypeTxt();
      this.addLinkTime();
    })

  }

  /**
   * 添加link type类型名字
   */
  addTypeTxt() {
    for (let i in this.linkMissionList) {
      switch (this.linkMissionList[i].type) {
        case MissionConstant.MISSION_TYPE_APPLICATION:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_APPLICATION_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_ASSIGNMENT:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_MEETING:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_MEETING_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_TASK:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_TASK_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_PROJECT:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_PROJECT_TEXT;
          break;
      }
    }
  }

  /**
   * 添加link列表显示时间
   */
  addLinkTime() {
    for (let i in this.linkMissionList) {
      this.linkMissionList[i].month = this.dateWord.monthSmall[this.getLocalTime(this.linkMissionList[i].created, 'm') - 1];
      this.linkMissionList[i].day = this.dateService.formatWithTimezone(this.linkMissionList[i].created, 'ddS');
      this.linkMissionList[i].hm = this.getLocalTime(this.linkMissionList[i].created, 'HH:MM');
      this.linkMissionList[i].ap = this.getLocalTime(this.linkMissionList[i].created, 'tt');
    }
  }

  /**
   * 选择需要link 的mission
   */
  selectLinkMission(data: any, event: any) {
    this.clearLinkStyle();
    this.clearStart();
    /*this.clearEnd();*/
    this.hasStart = false;
    event.stopPropagation();
    this.linkInfoName = data.name;
    this.isStartLink = false;
    this.newStart.linkArr = [];
    this.newStart.linkArr.push(data);
    this.newStart.isLink = true;
    this.newStart.isNow = false;
    this.clearCalendarStyle();
    this.isPeriod = true;
  }

  /**
   * 点击link清空样式
   */
  clearLinkStyle() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].selectedEnd = false;
      this.showDate[i].spanDoneBg = false;
      this.showDate[i].spanTodoBg = false;
      this.showDate[i].leftDoneBg = false;
      this.showDate[i].leftTodoBg = false;
      this.showDate[i].rightDoneBg = false;
      this.showDate[i].rightTodoBg = false;
      this.showDate[i].isMiddle = false;
    }
  }

  /**
   * 设置时间为现在
   * @param event
   */
  resetTime(event: any) {
    this.isPeriod = false;
    this.clearStart();
    this.clearCalendar();
    this.missionObj.start = '';
    this.hasStart = false;
    this.isHasLink = false;
    event.stopPropagation();
    this.linkInfoName = '';
    this.linkArr = [];
    this.dateTemplate.start.defaultContent = 'NOW';
    this.startDes = this.dateTemplate.start.defaultContent;
    this.missionObj.start = this.getNowStr();
    this.initSelect();
    this.initHour();
    this.initMinute();
    this.newStart.isNow = true;
    this.newStart.isLink = false;
    this.newStart.linkArr = [];
    this.addMiddle();
  }

  /**
   * 添加middle样式，今天的样式，左边为done，右边为todo
   */
  addMiddle() {
    //有开始，有结束 ，结束大于今天，开始小于今天  设置今天的样式，左边为done，右边为todo
    if ((this.newStart.year || this.newStart.isNow ) && this.newEnd.year) {
      if (this.compareDate(this.curDate, this.newStart) < 2 && this.compareDate(this.newEnd, this.curDate) == 1) {
        for (let i = 0; i < this.showDate.length; i++) {
          if (this.showDate[i].year == this.curDate.year && this.showDate[i].month == this.curDate.month
            && this.showDate[i].monthDay == this.curDate.monthDay) {
            this.showDate[i].isMiddle = true;
          }
        }
      }
    }
  }

  /**
   * 取消addMiddle样式
   */
  clearMiddle() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].isMiddle = false;
      this.showDate[i].rightTodoBg = false;
      this.showDate[i].rightDoneBg = false;
    }
  }

  /**
   * 点击恢复到当前时间  0:点击开始时间中的恢复  1：点击结束时间中的恢复
   */
  recoveryPending(event: any, type: number) {
    this.isPeriod = false;
    this.clearCalendar();
    event.stopPropagation();
    if (!type) {
      this.hasStart = false;
      this.linkInfoName = '';
      this.linkArr = [];
      this.isHasLink = false;
      this.dateTemplate.start.defaultContent = this.pending;
      this.startDes = this.dateTemplate.start.defaultContent;
      this.newStart.isPending = true;
      this.missionObj.start = '';
      this.clearStart();
      this.newStart.isNow = false;
      this.newStart.isLink = false;
      this.newStart.linkArr = [];

    } else {
      this.newEnd.isPending = true;
      this.hasEnd = false;
      this.endDes = this.dateTemplate.end.defaultContent;
      this.missionObj.end = '';
      this.clearEnd();
      this.newEnd.isShowDatePeriod = false;
      this.newEnd.date_period = {
        data: '',
        unit: ''
      };
    }
    this.initSelect();
    this.initHour();
    this.initMinute();
    this.clearMiddle();
  }

  /**
   * 选择period单位
   */
  onChangePeriod(event: any) {
    event.stopPropagation();
    this.isShowUnit = true;
  }


  /**
   * 点击period输入框
   */
  onClickInput(event: any) {
    event.stopPropagation();
  }

  /**
   * 点击period 单位
   */
  onClickUnit(event: any, item) {
    event.stopPropagation();
    this.periodUnit = item;
    this.isShowUnit = false;
  }

  /**
   * 控制键盘只能输入数字
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }

  /**
   * 添加背景颜色
   */
  dealBackground() {
    for (let i = 0; i < this.showDate.length; i++) {
      //出现右圆角的情况，不在每行末尾
      if (this.showDate[i].selectedEnd || (this.showDate[i].rightRadius && !this.showDate[i].done && !this.showDate[i].todo && !this.showDate[i].isBeforeToday)
        || this.showDate[i].lastBeforeToday) {
        //是结束的右边，填充下一个颜色
        if (this.showDate[i].selectedEnd) {
          //判断下一个是否有背景颜色
          if (this.showDate[i + 1] && (this.showDate[i + 1].before || this.showDate[i + 1].after)) {
            //gray
            this.showDate[i].noBackground = true;
            this.showDate[i + 1].leftGrayBg = true;
            this.showDate[i + 1].leftTodoBg = false;
            this.showDate[i + 1].leftDoneBg = false;
            this.dealSpan(i);
            this.showDate[i].rightGrayBg = true;
            this.showDate[i].rightTodoBg = false;
            this.showDate[i].rightDoneBg = false;
          }
        } else {  // 不是结束的右边，填充自己的颜色
          //判断下一个是否有背景颜色
          if (this.showDate[i + 1] && this.showDate[i + 1].done) {
            //done
            this.showDate[i].noBackground = true;
            this.dealSpanEnd(i);
          } else if (this.showDate[i + 1] && this.showDate[i + 1].todo) {
            this.showDate[i].noBackground = true;
            this.dealSpanEnd(i);
          } else if (this.showDate[i + 1] && (this.showDate[i + 1].before || this.showDate[i + 1].after)) {
            this.showDate[i].noBackground = true;
            this.dealSpanEnd(i);
          }
        }
      }
      if(this.showDate[i].selectedStart && this.showDate[i].selectedEnd && this.showDate[i].before){
        this.showDate[i].leftDoneBg = false;
      }
    }
  }

  /**
   * 当天背景
   * @param i
   */
  dealSpan(i: number) {
    if (this.showDate[i].todo) {
      this.showDate[i].spanTodoBg = true;
      this.showDate[i].leftTodoBg = true;
      // this.showDate[i].rightTodoBg = true;
    }
    if (this.showDate[i].done) {
      this.showDate[i].spanDoneBg = true;
      this.showDate[i].leftDoneBg = true;
      // this.showDate[i].rightDoneBg = true;
    }
    if ((this.showDate[i].before || this.showDate[i].after)) {
      this.showDate[i].spanGrayBg = true;
      this.showDate[i].leftGrayBg = true;
      // this.showDate[i].rightGrayBg = true;
    }
    if (this.showDate[i].isBeforeToday) {
      this.showDate[i].spanGoneBg = true;
      this.showDate[i].leftGoneBg = true;
      // this.showDate[i].rightGoneBg = true;
    }
  }

  /**
   * 当天背景，不是结束
   * @param i
   */
  dealSpanEnd(i: number) {
    if (this.showDate[i].todo) {
      this.showDate[i].spanTodoBg = true;
      this.showDate[i].leftTodoBg = true;
      this.showDate[i].rightTodoBg = true;
      this.showDate[i + 1].leftTodoBg = true;
    }
    if (this.showDate[i].done) {
      this.showDate[i].spanDoneBg = true;
      this.showDate[i].leftDoneBg = true;
      this.showDate[i].rightDoneBg = true;
      this.showDate[i + 1].leftDoneBg = true;
    }
    if ((this.showDate[i].before || this.showDate[i].after)) {
      this.showDate[i].spanGrayBg = true;
      this.showDate[i].leftGrayBg = true;
      this.showDate[i].rightGrayBg = true;
      this.showDate[i + 1].leftGrayBg = true;
    }
    if (this.showDate[i].isBeforeToday) {
      this.showDate[i].spanGoneBg = true;
      this.showDate[i].leftGoneBg = true;
      this.showDate[i].rightGoneBg = true;
      this.showDate[i + 1].leftGoneBg = true;
    }
  }
}
