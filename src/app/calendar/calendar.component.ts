import {
  Inject, Component, OnInit, EventEmitter, Renderer,
  ViewChild, AfterViewInit, HostListener, Input, Output, ViewEncapsulation, OnDestroy
} from '@angular/core';
import {DialogSettings} from "../../common/components/dialog/dialog-settings";
import {MissionModelService} from "../shared/services/index.service";
import * as MissionConstant from "../shared/config/mission.config";
import {MissionDetailAPIModel} from "../shared/services/model/entity/mission-entity";
import {Subscription} from "rxjs/Subscription";
import {CalendarDate} from '../shared/services/model/entity/calendar-entity';
import * as CaledarConfig from '../shared/config/calendar.config';

@Component({
  selector: 'bi-calendar',
  styleUrls: ['../../assets/css/date/date.css'],
  templateUrl: './calendar.component.html',
  providers: [MissionModelService],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  private formatString: string = 'yyyy-mm-dd HH:MM';

  @ViewChild('dateForm') dateForm: any;
  @ViewChild('selectMonth') selectMonth: any;     //选择月
  @ViewChild('selectYear') selectYear: any;       //选择年
  @ViewChild('dataMonth') dataMonth: any;        //设置月位置
  @ViewChild('dataYear') dataYear: any;         //设置年位置


  public pinList: Array<any> = [];
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

  public dateInstance: Date; //日期对象
  public dateFormat: string;   //日期格式字符串
  public showSelectYearArr: Array<any>;   // 保存年份数组

  public dateDefaultOptions: any = {
    defaultDate: null,
    dateFormat: 'yyyy-MM-dd',
  };

  public dateOptions: any;

  //当天的日期对象
  public curDate: any;

  //当前选中日期对象
  public selectedDateIn: any;

  //日历当前显示的日期，每天对应的对象
  public showDate: Array<any> = [];

  //当前显示的年,月份信息
  public showDateIn: any = {};

  public showSelectTime: boolean = false; //隐藏选择生日时日历

  public timer: any = null;   //双击取消单击定时器

  public sumDay: number;    //日历当前页的总天数
  //预设开始，结束，选中时间
  public dataSource: any = {
    start: "",
    end: "",
    selected: ""
  };
  public tasks: any = {            //所有pin列表
    dates: []
  };
  public isShowPin: boolean = false;//显示添加pin

  public missionObj: MissionDetailAPIModel;//mission对象

  public dbClickDate: any;//当前双击的日期

  public isMissionDetail: boolean = false;//是否是mission detail页面

  public outInfo: string;//点击日期传入父组件

  public missionList: any = [];//保存mission时间列表

  public showTimeEl: boolean = false;

  public setEventData: any; //传给选择input框的对象

  public lineNum: number;   //双击的第几行

  public dragWarpOffset: any = { //select选择框 ，x, y位置
    x: 0,
    y: 0
  };

  public calendarZIndex: number = 10; //动态控制日历的zindex值
  private elData: any;
  public toggleBoxShadow: boolean = true;

  @Output() public doSelectDate = new EventEmitter<any>();
  @Output() public info = new EventEmitter<any>();
  @Output() public outDefault = new EventEmitter(); //恢复默认值
  public subscription: Subscription;
  public isInputCalendar: boolean = true;
  private leftTimer: any;
  private rightTimer: any;
  private Zindex: boolean = false;
  private beforeToday: boolean = false;
  //当前文本框的属性

  /**
   * 设置选择时间框属性
   *
   * defaultDate: 默认选择的时间,如果不传入默认当前时间
   * dateFormat : 日期替换格式如下(如:'yy-MM-dd'):
   * 以上借鉴 MY97 选择框 ^_^
   *
   * dateArea: 是否选择时间段
   *
   * theme: 预留样式主题参数 现在默认default
   * @param renderer
   * @param typeService
   * @param dateService
   * @param stringService
   * @param dialogService
   * @param notificationService
   * @param config
   * @param element
   * @param missionModelService
   */
  constructor(private renderer: Renderer,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('string.service') public stringService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('toggle-select.service') public toggleSelectService: any,
              public missionModelService: MissionModelService) {
    //接收传出的pin
    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        this.dealMessage(data);

      });
  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    if (this.isInputCalendar) {
      this.showTimeEl = true;
    }
    this.isShowPin = false;
    for (let j = 0; j < this.showDate.length; j++) {   //隐藏其他行日期
      this.showDate[j].isHide = false;
    }
  }
  @HostListener('document:mouseup', ['$event'])
  mouseup(event: any) {
    clearInterval(this.rightTimer);
    clearInterval(this.leftTimer);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dealMessage(data: any) {
    //添加pin成功
    if ((data.act == this.notificationService.config.ACT_COMPONENT_MISSION_CALENDAR_ADD_PIN) && this.missionObj) {
      let user_data = JSON.parse(localStorage.getItem('user_data'));
      let userName = user_data.user.work_name;
      let userPath = user_data.user.user_profile_path;
      let localTime = this.getLocalTime(data.data.pin_time);
      if (this.dbClickDate) {
        let hour_minute = this.getLocalTime(data.data.pin_time, 'HH:MM');
        let pushObj: any = {
          description: data.data.description,
          pin_time: data.data.pin_time,
          showTime: hour_minute + this.getLocalTime(data.data.pin_time, "tt"),
          id: data.data.id,
          hide: false,
          user_info: {
            name: userName,
            user_profile_path: userPath
          }
        };
        //在页面中添加新加的pin

        this.pinList.push(pushObj);
        //添加有task原点
        for (let i = 0; i < this.showDate.length; i++) {
          if (this.showDate[i].year == this.dbClickDate.year && this.showDate[i].month == this.dbClickDate.month
            && this.showDate[i].monthDay == this.dbClickDate.monthDay) {
            this.showDate[i].task = true;
            this.tasks.dates.push(this.dbClickDate.year + '-' + this.formatMonth(this.dbClickDate.month) + '-' + this.dbClickDate.monthDay);
          }
        }
      }
    }

    //修改pin成功
    if (data.act == this.notificationService.config.ACT_COMPONENT_MISSION_CALENDAR_UPDATE_PIN) {
      for (let j = 0; j < this.pinList.length; j++) {
        if (this.pinList[j].id == data.data.identifier) {
          this.pinList[j].description = data.data.description;
        }
      }
    }
  }


  /**
   *  点击input出现的情况下  ： 不传入 setOption
     this.dateOption = {
  type: 1,
  setEvent: (date: any) => {
    obj = date;
  },
  date: {
    selected: '2017-05-09'
  }
  Zindex:true,//日历z-index 在弹框上面
};
   */


  /**
   *
   *  option
   * 日历可传入参数
   * {
   * data:{}                //mission detail 对象
   * start: "2017-09-10"   //默认开始
   * end:  "2017-09-10"    //默认结束
   * selected: "2017-09-10"  //默认选中
   * isMissionDetail: false   //是否是detail页
   * }
   */
  @Input() set setOption(option: any) {
    if (option) {
      this.isInputCalendar = false;
      this.curDate = this.getDateIn();
      this.dateOptions = this.typeService.clone(this.dateDefaultOptions);
      if (option.isMissionDetail) {
        this.missionObj = option.data;
        this.isMissionDetail = true;
        //保存task列表
        for (let i = 0; i < this.missionObj.pin_list.length; i++) {
          this.tasks.dates.push(this.getLocalTime(this.missionObj.pin_list[i].pin_time, 'yyyy-mm-dd'));
        }
        //有start
        if (this.missionObj.start != MissionConstant.MISSION_TIME_NULL && this.missionObj.start) {
          this.missionList.push(
            {
              type: 0,
              time: this.getLocalTime(this.missionObj.start),
              des: 'Start time',
              isHide: false,
              showTime: this.getLocalTime(this.missionObj.start, 'HH:MM')
            }
          );
        }


        //有end
        if (this.missionObj.end != MissionConstant.MISSION_TIME_NULL && this.missionObj.end) {
          this.missionList.push({
            type: 1,
            time: this.getLocalTime(this.missionObj.end),
            des: 'End time',
            isHide: false,
            showTime: this.getLocalTime(this.missionObj.end, 'HH:MM')
          })
        }


        //mission 为project
        if (this.missionObj.type === MissionConstant.MISSION_TYPE_PROJECT) {
          for (let i = 0; i < this.missionObj.detail.internal.length; i++) {
            //为project 有start
            if ((this.missionObj.detail.internal[i].start != MissionConstant.MISSION_TIME_NULL &&
              this.missionObj.detail.internal[i].start)
              && (this.missionObj.detail.internal[i].end == MissionConstant.MISSION_TIME_NULL || !this.missionObj.detail.internal[i].end)) {

              this.missionList.push({
                type: 0,
                time: this.getLocalTime(this.missionObj.detail.internal[i].start),
                showTime: this.getLocalTime(this.missionObj.detail.internal[i].start, 'HH:MM'),
                des: 'Start time',
                isHide: false,
                missionType: this.missionObj.detail.internal[i].type,
                name: this.missionObj.detail.internal[i].name,
                getMissionType: this.missionType(this.missionObj.detail.internal[i].type)
              });

            } else if ((this.missionObj.detail.internal[i].end != MissionConstant.MISSION_TIME_NULL &&
              this.missionObj.detail.internal[i].end)
              && (this.missionObj.detail.internal[i].start == MissionConstant.MISSION_TIME_NULL || !this.missionObj.detail.internal[i].start)) {

              //为project 有 end
              this.missionList.push({
                type: 1,
                time: this.getLocalTime(this.missionObj.detail.internal[i].end),
                showTime: this.getLocalTime(this.missionObj.detail.internal[i].end, 'HH:MM'),
                des: 'End time',
                isHide: false,
                missionType: this.missionObj.detail.internal[i].type,
                name: this.missionObj.detail.internal[i].name,
                getMissionType: this.missionType(this.missionObj.detail.internal[i].type)
              });

            } else if ((this.missionObj.detail.internal[i].end != MissionConstant.MISSION_TIME_NULL && this.missionObj.detail.internal[i].end)
              && (this.missionObj.detail.internal[i].start != MissionConstant.MISSION_TIME_NULL && this.missionObj.detail.internal[i].start)) {

              let start = this.getLocalTime(this.missionObj.detail.internal[i].start, 'yyyy-mm-dd');
              let end = this.getLocalTime(this.missionObj.detail.internal[i].end, 'yyyy-mm-dd');

              if (start == end) {  //开始，结束同一天
                this.missionList.push({
                  type: 2,
                  time: this.getLocalTime(this.missionObj.detail.internal[i].start),
                  showTime: this.getLocalTime(this.missionObj.detail.internal[i].start, 'HH:MM'),
                  des: 'Start time',
                  isHide: false,
                  missionType: this.missionObj.detail.internal[i].type,
                  getMissionType: this.missionType(this.missionObj.detail.internal[i].type),
                  name: this.missionObj.detail.internal[i].name,
                  mission_end: {
                    time: this.getLocalTime(this.missionObj.detail.internal[i].end),
                    des: 'End time',
                    showTime: this.getLocalTime(this.missionObj.detail.internal[i].end, 'HH:MM')
                  }
                });

              } else {//开始结束不在同一天

                this.missionList.push({
                  type: 0,
                  time: this.getLocalTime(this.missionObj.detail.internal[i].start),
                  showTime: this.getLocalTime(this.missionObj.detail.internal[i].start, 'HH:MM'),
                  des: 'Start time',
                  isHide: false,
                  missionType: this.missionObj.detail.internal[i].type,
                  name: this.missionObj.detail.internal[i].name,
                  getMissionType: this.missionType(this.missionObj.detail.internal[i].type)
                });

                this.missionList.push({
                  type: 1,
                  time: this.getLocalTime(this.missionObj.detail.internal[i].end),
                  showTime: this.getLocalTime(this.missionObj.detail.internal[i].end, 'HH:MM'),
                  des: 'End time',
                  isHide: false,
                  missionType: this.missionObj.detail.internal[i].type,
                  name: this.missionObj.detail.internal[i].name,
                  getMissionType: this.missionType(this.missionObj.detail.internal[i].type)
                });
              }
            }
          }
        }

      }

//  初始化开始，结束，选中时间
      if (option.hasOwnProperty('start')) {
        this.dataSource.start = option.start;
      }
      if (option.hasOwnProperty('end')) {
        this.dataSource.end = option.end;
      }
      if (option.hasOwnProperty('selected')) {
        this.dataSource.selected = option.selected;
      }

      this.dateFormat = this.dateOptions.dateFormat;
      this.initSelect();
    }
  }

//全局传入是否隐藏日历控件
  @Input() set showElement(element: string) {
    if (element === '1') {
      this.showTimeEl = true;
    }
  }

  @Input() set isBoxShadow(data: any) {
    if(!data) {
      this.toggleBoxShadow = false;
    }
  }

  //选择生日模式下，设置日历位置，选中
  setOptionData(data: any) {
    if (data) {
      if(data.Zindex){
        this.Zindex = true;
      }
      //今天之前不能点击
      if(data.beforeToday){
        this.beforeToday = true;
      }else{
        this.beforeToday = false;
      }
      //下拉菜单出现，日历隐藏
      this.toggleSelectService.closeElement();
      this.toggleSelectService.setCalendarElement(() => {
        this.showTimeEl = true;
      });


      this.elData = data.date;
      this.showTimeEl = false; //显示日历
      this.dragWarpOffset = {x: 0, y: 0};
      this.selectedDateIn = this.getDateIn(this.elData.selected);
      if (!this.isDate(this.elData.selected)) {
        let now = new Date();
        this.dataSource.selected = now.getFullYear() + '-' + this.formatMonth(now.getMonth()) + '-' +
          this.formatDay(now.getDate());
      } else {
        this.dataSource.selected = this.elData.selected;
      }

      this.setEventData = data;
      this.dateOptions = this.typeService.clone(this.dateDefaultOptions);
      this.initSelect();
      let self =this;
      this.dealResize(data);
      window.onresize = () => {
        self.dealResize(data);
      }
    }
  }

  /**
   * window resize 触发
   * @param data
   */
  dealResize(data: any){
  this.dragWarpOffset.x = 0;
  this.dragWarpOffset.y = 0;
  this.getOffsetVal(data.inputElement);
  let h: number = this.element.getElementVal(data.inputElement, 'height');
  this.setElementStyle('position', 'fixed');
  this.setElementStyle('left', this.dragWarpOffset.x + 'px');
  this.setElementStyle('top', (this.dragWarpOffset.y + h + 10) + 'px');
  //如果下面不够放
  if(document.documentElement.clientHeight - this.dragWarpOffset.y - 35 < 250){
    //放在上面
    this.setElementStyle('top', (this.dragWarpOffset.y - 250) + 'px');
    //上面也不够放，置于浏览器垂直居中
    if((this.dragWarpOffset.y - 250) < 0){
      this.setElementStyle('top',  (document.documentElement.clientHeight-250 )/2+ 'px');
    }
  }
}
  /**
   * 判断字符串是否是正确的时间
   */
  isDate(str): boolean {

    let reg = new RegExp("^[1-2]\\d{3}-(0?[1-9]||1[0-2])-(0?[1-9]||[1-2][1-9]||3[0-1])$");
    return reg.test(str);
  }

  setElementStyle(attr: string, val: string) {
    this.renderer.setElementStyle(this.dateForm.nativeElement, attr, val);
  }

  /**
   * 返回mission类型
   */
  missionType(type: string) {
    let mission: string = '';
    switch (type) {
      case MissionConstant.MISSION_TYPE_ALL:
        mission = MissionConstant.MISSION_TYPE_ALL_TEXT;
        break;
      case MissionConstant.MISSION_TYPE_APPLICATION:
        mission = MissionConstant.MISSION_TYPE_APPLICATION_TEXT;
        break;
      case MissionConstant.MISSION_TYPE_ASSIGNMENT:
        mission = MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT;
        break;
      case MissionConstant.MISSION_TYPE_MEETING:
        mission = MissionConstant.MISSION_TYPE_MEETING_TEXT;
        break;
      case MissionConstant.MISSION_TYPE_PROJECT:
        mission = MissionConstant.MISSION_TYPE_PROJECT_TEXT;
        break;
      case MissionConstant.MISSION_TYPE_TASK:
        mission = MissionConstant.MISSION_TYPE_TASK_TEXT;
        break;
    }
    return mission;
  }


  ngOnInit() {
  }

  /**
   * 获取offset真实距离
   * @param el
   */
  getOffsetVal(el: any) {
    if (el !== null) {
      this.dragWarpOffset = {
        x: el.offsetLeft + this.dragWarpOffset.x,
        y: el.offsetTop + this.dragWarpOffset.y
      };
      this.getOffsetVal(el.offsetParent);
    }
  }

  ngAfterViewInit() {
    if (this.dateOptions) {
      this.dateForm.nativeElement.onclick = (event: any) => {
        event.stopPropagation();
        this.selectMonth.nativeElement.className = 'hide';
        this.selectYear.nativeElement.className = 'hide';
        this.calendarZIndex = 10;
      };
    }
  }

  /**
   * 设置月份
   */
  setShowMonth(event: any, month: number) {
    event.stopPropagation();
    this.calendarZIndex = 10;
    this.selectMonth.nativeElement.className = 'hide';
    this.showDateIn.month = month;
    this.dateInstance.setMonth(month, 1);
    this.setSelectDate();
  }

  /**
   * 设置年份
   */
  setShowYear(event: any, year: number) {
    event.stopPropagation();
    this.calendarZIndex = 10;
    this.selectYear.nativeElement.className = 'hide';
    this.showDateIn.year = year;
    this.dateInstance.setFullYear(year);
    this.setShowSelectYear();
    this.setSelectDate();
  }

  /**
   * 设定选中类型
   */
  setSelectType(type: number, event: any) {
    event.stopPropagation();
    this.dateOptions.type = type;
    this.setSelectDate();
    this.showSelectTime = false;
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
   * 初始化显示
   */
  initSelect() {
    if (this.dateOptions.defaultDate === null) {
      //默认日期
      this.curDate = this.getDateIn();
      this.selectedDateIn = this.getDateIn(this.dataSource.selected);
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
    this.addMiddle();
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
   /* if(this.compareDate(curDateIn,this.curDate) == 2){
      curDateIn.beforeToday = true;
    }*/
  }

  /**
   * 设置本月前需要填充的日期
   */
  setBeforeMonthDay(firstWeekDay: any) {
    let year = this.showDateIn.month > 0 ? this.showDateIn.year : this.showDateIn.year - 1;
    let beforeMonth = this.showDateIn.month > 0 ? this.showDateIn.month - 1 : 11;
    let monthDay = this.getMonthDay(this.showDateIn.year, beforeMonth);

    let startObj = this.getDateObj(this.dataSource.start);
    let endObj = this.getDateObj(this.dataSource.end);

    for (let day = monthDay - firstWeekDay + 1; day <= monthDay; day++) {
      let newDay: any = this.formatDay(day);
      //初始化对象
      let curDateIn = CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month = beforeMonth;
      curDateIn.monthDay = newDay;
      curDateIn.before = true;

      let curDate = curDateIn.year + '-' + this.formatMonth(curDateIn.month) + '-' + this.formatDay(day);
      if (this.tasks.dates.indexOf(curDate) != -1) {     //查找是否有task
        curDateIn.task = true;
      } else {
        curDateIn.task = false;
      }
      //最后一天有右圆角
      if(day == monthDay){
        curDateIn.rightRadius = true;
      }else{
        curDateIn.rightRadius = false;
      }
      this.setStart_End(startObj, endObj, curDateIn);//设置开始，结束时间
      this.setSelectedDateClass(curDateIn);
      this.addMiddle();
      if(curDateIn.done && curDateIn.isToday){
        curDateIn.done = false;
        curDateIn.spanDoneBg = true;
        curDateIn.leftDoneBg = true;
      }
      this.showDate.push(curDateIn);
    }
  }

  /**
   * 设置本月后需要填充的日期
   */
  setAfterMonthDay(lastWeekDay: any) {
    let year = this.showDateIn.month < 11 ? this.showDateIn.year : this.showDateIn.year + 1;
    let afterMonth = this.showDateIn.month < 11 ? this.showDateIn.month + 1 : 1;

    let startObj = this.getDateObj(this.dataSource.start);
    let endObj = this.getDateObj(this.dataSource.end);
    for (let day = 1; day <= (6 - lastWeekDay); day++) {
      let newDay: any = this.formatDay(day);
      //初始化对象
      let curDateIn = CalendarDate.init();
      curDateIn.year = year;
      curDateIn.month = afterMonth;
      curDateIn.monthDay = newDay;
      curDateIn.after = true;
      let curDate = curDateIn.year + '-' + this.formatMonth(curDateIn.month) + '-' + this.formatDay(day);
      if (this.tasks.dates.indexOf(curDate) != -1) {     //查找是否有task
        curDateIn.task = true;
      } else {
        curDateIn.task = false;
      }
      //第一天有左圆角
      if(day == 1){
        curDateIn.leftRadius = true;
      }else{
        curDateIn.leftRadius = false;
      }
      this.setStart_End(startObj, endObj, curDateIn);//设置开始，结束时间
      this.setSelectedDateClass(curDateIn);
      this.addMiddle();
      if(curDateIn.done && curDateIn.isToday){
        curDateIn.done = false;
        curDateIn.spanDoneBg = true;
        curDateIn.leftDoneBg = true;
      }
      this.showDate.push(curDateIn);
    }
  }

  /**
   * 设置当月需要填充的日期
   */
  setMonthDay(monthDay: any, index?: number) {
    let startObj = this.getDateObj(this.dataSource.start);
    let endObj = this.getDateObj(this.dataSource.end);
    for (let day = 1; day <= monthDay; day++) {
      //初始化对象
      let newDay: any = this.formatDay(day);
      let curDateIn = CalendarDate.init();
      curDateIn.year = this.showDateIn.year;
      curDateIn.month = this.showDateIn.month;
      curDateIn.monthDay = newDay;

      let curDate = curDateIn.year + '-' + this.formatMonth(curDateIn.month) + '-' + this.formatDay(day);
      //查找是否有task
      if (this.tasks.dates.indexOf(curDate) != -1) {
        curDateIn.task = true;
      } else {
        curDateIn.task = false;
      }
      //设置开始，结束时间
      this.setStart_End(startObj, endObj, curDateIn);
      this.setSelectedDateClass(curDateIn);
      this.addMiddle();
       if(curDateIn.done && curDateIn.isToday){
         curDateIn.done = false;
         curDateIn.spanDoneBg = true;
         curDateIn.leftDoneBg = true;
       }
      this.showDate.push(curDateIn);
    }
  }

  /**
   * 返回日期包含年月日的对象
   */
  getDateObj(dateStr: string) {
    let year = this.getLocalTime(dateStr, 'yyyy');
    let month = this.getLocalTime(dateStr, 'm');
    let day = this.getLocalTime(dateStr, 'd');
    let hour = this.getLocalTime(dateStr, 'HH');
    let minute = this.getLocalTime(dateStr, 'MM');
    let second = this.getLocalTime(dateStr, 'SS');
    // let date = new Date(this.getLocalTime(dateStr));
    /* let dateObj = {
     year: date.getFullYear(),
     month: date.getMonth(),
     monthDay: date.getDate()
     };*/
    let dateObj: any = {
      year: year,
      month: parseInt(month) - 1,
      monthDay: day
    };
    if (dateStr === MissionConstant.MISSION_TIME_NULL) {
      dateObj = {}
    }
    return dateObj;

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
   * 是否是选中的时间
   */
  isSelectedDateIn(year: number, month: number, day: number): boolean {
    return year == this.selectedDateIn.year
      && month == this.selectedDateIn.month
      && this.selectedDateIn.monthDay == day;
  }

  /**
   * 设置当前展示的月份
   * @param type 切换类型 1: 向右切换 2:向左切换
   */
  setShowDate(type: number, event?: any) {
    this.isShowPin = false;
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
   * 获取月份的天数
   */
  getMonthDay(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 设置当前显示的日期
   */
  setSelectDate(index?: number) {
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
   * 输出时间
   */
  outputDate() {
    this.outInfo = this.selectedDateIn.year + '-' + this.formatMonth(this.selectedDateIn.month) + '-' + this.selectedDateIn.monthDay;

    this.info.emit(this.outInfo);
    //选择的回调事件
    this.doSelectDate.emit(this.selectedDateIn);

    //选择的回调事件
    if (this.setEventData && typeof this.setEventData.setEvent === 'function') {
      this.showTimeEl = true;
      this.setEventData.setEvent(this.outInfo);
    }
  }

  /**
   * 设置选择的年份
   */
  setShowSelectYear() {
    this.showSelectYearArr = [];
    let nowYear = new Date().getFullYear();
    for (let startYear = nowYear - CaledarConfig.CALENDAR_YEAR_START;   //年份显示从70年前到10年后
         startYear <= nowYear + CaledarConfig.CALENDAR_YEAR_End; startYear++) {
      this.showSelectYearArr.push(startYear);
    }
  }

  /**
   * 显示选择的月份
   */
  showSelectMonth(event: any) {
    event.stopPropagation();
    this.calendarZIndex = 18;
    //月份显示，pin ， 年隐藏，显示其一
    this.selectMonth.nativeElement.className = '';
    this.selectYear.nativeElement.className = 'hide';
    this.isShowPin = false;
    this.clearHide();
  }

  /**
   * 显示选择的年份
   */
  showSelectYear(event: any) {
    event.stopPropagation();
    this.calendarZIndex = 18;
    //年份显示，pin ， 月隐藏，显示其一
    this.selectYear.nativeElement.className = '';
    this.selectMonth.nativeElement.className = 'hide';
    this.isShowPin = false;
    this.clearHide();

    //从今年的70年前开始显示  当前选中的年显示状态
    let selectOffset = (this.showDateIn.year - (new Date().getFullYear() - CaledarConfig.CALENDAR_YEAR_START)) * CaledarConfig.CALENDAR_SELECT_HEIGHT;
    this.selectYear.nativeElement.scrollTop = selectOffset;
  }

  /**
   * 点击日期
   */
  onClickEvent(dateIn: any, index?: number, event?: any) {
    if(this.beforeToday && this.compareDate(dateIn,this.curDate) == 2){
      return false;
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (event) {
        event.stopPropagation();
      }
      if (!this.selectedDateIn) {
        this.selectedDateIn = {};
        this.selectedDateIn.minute = 0;
        this.selectedDateIn.hour = 0;
      }

      this.typeService.mergeObj(this.selectedDateIn, dateIn);
      this.setSelectDate(index);
      this.outputDate();
      if (this.isShowPin) {//展开pin情况下
        for (let j = 0; j < this.showDate.length; j++) {   //隐藏其他行日期
          this.showDate[j].isHide = true;
          if (CaledarConfig.CALENDAR_COLUMN_NUMBER * this.lineNum - CaledarConfig.CALENDAR_COLUMN_NUMBER <= j &&
            j <= CaledarConfig.CALENDAR_COLUMN_NUMBER * this.lineNum - 1) {
            this.showDate[j].isHide = false;
          }
        }
      }
      this.addMiddle();
    }, 200);
  }

  /**
   * 清除日历隐藏行
   */
  clearHide() {
    for (let i = 0; i < this.showDate.length; i++) {
      this.showDate[i].isHide = false;
    }
  }

  /**
   *  设置今天的样式，左边为done，右边为todo
   */
  addMiddle() {
    //有开始，有结束 ，结束大于今天，开始小于今天  设置今天的样式，左边为done，右边为todo
    if (this.dataSource.start && this.dataSource.end) {
      let startObj = this.getDateObj(this.missionObj.start);
      let endObj = this.getDateObj(this.missionObj.end);
      if (this.compareDate(this.curDate, startObj) < 2 && this.compareDate(endObj, this.curDate) == 1) {
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
   * 添加，修改pin
   */
  pinHandle(type: string, event?: any, pinObj ?: any,index?:number) {
    let time = this.dbClickDate;
    let pinTime = this.dbClickDate.year + '-' + this.formatMonth(this.dbClickDate.month) + '-' + this.dbClickDate.monthDay;
    let title = (type == 'add') ? "ADD PIN" : "UPDATE PIN";
    let id = typeof pinObj !== 'undefined' ? pinObj.id : '';
    let updateObj = {
      identifier: id,
      general_token: "",
      mid: this.missionObj.mid,
      description: pinObj ? pinObj.description : '',
      shared: 1,
      pin_time: pinTime,
      type: type,
    };
    let settings = {
      mode: '3',
      title: title,
      isSimpleContent: false,
      componentSelector: 'mission-pin-dialog',
      componentData: updateObj,
      buttons: [{
        type: 'ok',
        btnEvent: 'pinHandle',
      }],
    };
    this.dialogService.openNew(settings);

  }

  /**
   * 删除pin
   */
  removePin(event: any, pinObj: any) {
    if (event) {
      event.stopPropagation();
    }
    let deleteObj = {
      identifier: pinObj.id,
      general_token: "",
      mid: this.missionObj.mid,
      pin_time: pinObj.pin_time,
    };
    let settings = {
      mode: '3',
      title: 'DELETE PIN',
      simpleContent: 'Cannot be revoked after confirmation',
      buttons: [
        {type: 'cancel'},
        {
          type: 'delete',
          btnText: 'DELETE',
          btnEvent: () => {
            //调用删除pin接口
            this.missionModelService.missionCalendarPinDelete({data: deleteObj}, (response: any) => {
              if (response.status == 1) {
                //删除pin列表中的对应项
                for (let j = 0; j < this.pinList.length; j++) {
                  if (this.pinList[j].id == deleteObj.identifier) {
                    this.pinList.splice(j, 1);
                  }
                }
                //删除task圆点
                let showDateTask: any;
                for (let i = 0; i < this.tasks.dates.length; i++) {
                  if (this.tasks.dates[i] == this.getLocalTime(deleteObj.pin_time, 'yyyy-mm-dd')) {
                    this.tasks.dates.splice(i, 1);
                  }
                }
                for (let j = 0; j < this.showDate.length; j++) {
                  let dateStr = this.showDate[j].year + '-' + this.formatMonth(this.showDate[j].month) + '-' + this.showDate[j].monthDay;
                  if (dateStr == this.getLocalTime(deleteObj.pin_time, 'yyyy-mm-dd')) {
                    showDateTask = this.showDate[j];
                    //查找无当天日期，删除当天的task圆点
                    if (this.tasks.dates.indexOf(dateStr) == -1) {
                      showDateTask.task = false;
                    }
                  }
                }
              }
            });
          }
        }
      ]
    }
    this.dialogService.openNew(settings);
  }

  /**
   * 双击事件，index为当前点的第几个日期，从 0 开始
   * MissionDetail页触发双击，其他页面不触发
   */
  ondblClickEvent(dateIn: any, index?: any, event?: any) {
    if(this.missionObj && this.missionObj.mission_status == MissionConstant.MISSION_STATUS_STORAGE){
      return false;
    }
    //年月不能点击
    this.selectYear.nativeElement.className = 'hide';
    this.selectMonth.nativeElement.className = 'hide';
    if (!this.isMissionDetail) {
      return false;
    } else {  //可以触发双击
      if (this.dbClickDate && this.dbClickDate.year == dateIn.year && this.dbClickDate.month == dateIn.month
        && this.dbClickDate.monthDay == dateIn.monthDay && this.isShowPin == true) {
        this.isShowPin = false;
        return false;
      }
      this.dbClickDate = dateIn; //保存当前双击的日期
      this.selectedDateIn = this.dbClickDate;//双击日期也会选中
      clearTimeout(this.timer);
      this.setSelectDate(index); //设置日期的class状态
      this.lineNum = Math.ceil((index + 1) / CaledarConfig.CALENDAR_COLUMN_NUMBER); //计算要显示日历的第几行

      for (let j = 0; j < this.showDate.length; j++) {   //隐藏其他行日期
        this.showDate[j].isHide = true;
        if (CaledarConfig.CALENDAR_COLUMN_NUMBER * this.lineNum - CaledarConfig.CALENDAR_COLUMN_NUMBER <= j &&
          j <= CaledarConfig.CALENDAR_COLUMN_NUMBER * this.lineNum - 1) {
          this.showDate[j].isHide = false;
        }
      }

      this.pinList = this.missionObj.pin_list;
      let month = this.formatMonth(dateIn.month);
      let dateStr = dateIn.year + '-' + month + '-' + dateIn.monthDay;
      //显示当前天的pin
      for (let i = 0; i < this.pinList.length; i++) {
        if (this.getLocalTime(this.pinList[i].pin_time, 'yyyy-mm-dd') == dateStr) {
          this.pinList[i].hide = false;
          let hour_minute = this.getLocalTime(this.pinList[i].pin_time, 'HH:MM');
          let localTime = this.getLocalTime(this.pinList[i].pin_time);
          this.pinList[i].showTime = hour_minute + this.getLocalTime(this.pinList[i].pin_time, "tt");
        } else {
          this.pinList[i].hide = true;
        }
      }
      //显示当天的mission
      for (let i = 0; i < this.missionList.length; i++) {
        let dblDate = this.dbClickDate.year + '-' + this.formatMonth(this.dbClickDate.month) + '-' + this.dbClickDate.monthDay;
        if (this.missionList[i].time.indexOf(dblDate) != -1 || (this.missionList[i].mission_end && this.missionList[i].mission_end.time.indexOf(dblDate) != -1)) {
          this.missionList[i].isHide = false;
        } else {
          this.missionList[i].isHide = true;
        }
      }
      this.isShowPin = true;
    }

    this.addMiddle();

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
      day = '0' + day;
    }
    return day;
  }

  /**
   *将utc时间转换成浏览器时间
   */
  getLocalTime(timeStr: string, format?: string) {
    let formatStr = format ? format : this.formatString;
    return this.dateService.formatWithTimezone(timeStr, formatStr);
  }

  /**
   * 点击日历空白
   */
  onClickCalendar(event: any) {
    event.stopPropagation();
    this.selectMonth.nativeElement.className = 'hide';
    this.selectYear.nativeElement.className = 'hide';
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
