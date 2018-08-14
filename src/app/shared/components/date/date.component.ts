import { Inject, Component, OnInit,EventEmitter,
    ViewChild, AfterViewInit, HostListener, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'bi-date',
  styleUrls:['../../../../assets/css/date/date.css', '../../../../assets/css/date/date-old.css'],
  templateUrl: '../../../../app/shared/template/date/date.component.html',
  encapsulation: ViewEncapsulation.None
})
export class DateComponent implements OnInit,AfterViewInit {

  @ViewChild('dateForm') dateForm:any;
  @ViewChild('selectMonth') selectMonth:any;
  @ViewChild('selectYear') selectYear:any;

  public mouseUpEvent : any = new EventEmitter<any>();
  public mouseDownEvent : any = new EventEmitter<any>();

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

  public initDateForm:boolean = false;

  public showDateForm:boolean = false;
  public dateInstance:Date;
  public dateFormat:string;

  public dateOn:string = 'On';

  public DATEFORM_WIDTH:number = 330;
  public DATEFORM_HEIGHT:number = 550;

  public showSelectYearArr:Array<any>;

  public dateDefaultOptions:any = {
    inputElement: null,
    offsetLeft: 0,
    offsetTop: 0,
    distanceLeft: 0,     //偏离自动获取位置左边的距离,可为正负值
    distanceTop: 30,      //偏离自动获取位置上边的距离,可为正负值
    defaultDate: null,
    setEvent: null,    //设置时间后的回调事件
    clearEvent: null,  //清除时间后的回调事件
    dateFormat: 'yyyy-MM-dd',
    dateArea: false,
    theme: 'default',
    type: 0,             //标题类型 0:单选时间,1:多选,选定时间之前 2: 选取时间段 3:多选,选定时间之后
    isBut: true         //按钮选择
  };

  //当前文本框的属性
  public dateOptions:any;

  //当天的信息
  public curDate:any;

  //当前选中日期的信息
  public selectedDateIn:any;

  //日期时间段的结束时间
  public selectedEndDateIn:any;

  //当前显示的日期
  public showDate:Array<any> = [];

  //当前显示的年,月份信息
  public showDateIn:any;

  //是否激活鼠标拖动选择日期功能 true:激活 false:未激活
  public mouseSelectDateActive:boolean = false;

  //是否可以选择
  public isSelected : boolean;

  //鼠标移动方位
  public moveDirection : number;

  public isAfterViewInit:boolean = false;

  //是否拖动选择日期
  public isDoSelectDate : boolean;

  public showHour : Array<number> = [];
  public showMinute : Array<number> = [];

  public showHourPage : number = 1;
  public showMinutePage : number = 1;

  public SHOW_TIME_NUMBER = 7; //显示小时 分钟的数量

  public isSelectTime : boolean = false; //是否选择小时
  public isSelectMinute : boolean = false; //是否选择分钟

  public showSelectTime : boolean = false; //隐藏选择小时框

  public isSetAllMonthDay : boolean = false;
  public isSetAllDay : boolean = false;

  public isShowStartDate : boolean = false;
  public isShowEndDate : boolean = false;

  public isSelectStart : boolean = false;  //是否操作开始时间
  public isSelectEnd : boolean = false;    //是否操作结束时间
  public isSelectCenter : boolean = false; //是否选择选中的中间日期
  public isSelectRight : boolean = false; //是否选择选中的右边的日期
  public isSelectLeft : boolean = false;  //是否选择选中的左边的日期

  public isOnlyOneSelect : boolean = false; //是否操作开始时间与结束时间一起

  constructor(
      @Inject('type.service') public typeService:any,
      @Inject('string.service') public stringService:any,
      @Inject('page.element') public elementService:any) {
  }

  /**
   * 设置选择时间框属性
   * @param option 包含以下选项
   *
   * defaultDate: 默认选择的时间,如果不传入默认当前时间
   * dateFormat : 日期替换格式如下(如:'yy-MM-dd'):
   * yy    同上，如果小于两位数，前面补零。
   * yyy    将年份表示为三位数字。如果少于三位数，前面补零。
   * yyyy    将年份表示为四位数字。如果少于四位数，前面补零。
   * M    将月份表示为从 1 至 12 的数字
   * MM    同上，如果小于两位数，前面补零。
   * MMM    返回月份的缩写 一月 至 十二月 (英文状态下 Jan to Dec) 。
   * MMMM    返回月份的全称 一月 至 十二月 (英文状态下 January to December) 。
   * d    将月中日期表示为从 1 至 31 的数字。
   * dd    同上，如果小于两位数，前面补零。
   * H    将小时表示为从 0 至 23 的数字。
   * HH    同上，如果小于两位数，前面补零。
   * m    将分钟表示为从 0 至 59 的数字。
   * mm    同上，如果小于两位数，前面补零。
   * s    将秒表示为从 0 至 59 的数字。
   * ss    同上，如果小于两位数，前面补零。
   * w    返回星期对应的数字 0 (星期天) - 6 (星期六) 。
   * D    返回星期的缩写 一 至 六 (英文状态下 Sun to Sat) 。
   * DD    返回星期的全称 星期一 至 星期六 (英文状态下 Sunday to Saturday) 。
   * W    返回周对应的数字 (1 - 53) 。
   * WW    同上，如果小于两位数，前面补零 (01 - 53) 。
   *
   * 以上借鉴 MY97 选择框 ^_^
   *
   * dateArea: 是否选择时间段
   *
   * theme: 预留样式主题参数 现在默认default
   */
   setOption(option:any) {
    this.isSetAllDay = false;
    this.isSetAllMonthDay = false;
    this.isShowStartDate = false;
    this.isShowEndDate = false;

    this.curDate = this.getDateIn();

    this.dateOptions = this.typeService.clone(this.dateDefaultOptions);
    this.typeService.mergeObj(this.dateOptions, option);
    this.dateFormat = this.dateOptions.dateFormat;

    this.isDoSelectDate = false;
    if (this.isAfterViewInit) {
      this.openDateForm();
    }
    this.initSelect();
  }

  /**
   * 鼠标放开点击
   * @param event
   */
  @HostListener('mouseup', ['$event'])
  onMouseUp(event : any) { this.mouseUpEvent.emit(event); }

  /**
   * 鼠标按下
   * @param event
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event : any) { this.mouseDownEvent.emit(event); }

  /**
   * 关闭时间
   */
  @HostListener('document:click')
  click() {
    if(this.initDateForm) {
      this.selectMonth.nativeElement.className = 'hide';
      this.selectYear.nativeElement.className = 'hide';
      this.closeDateForm();
    }
  }


  ngOnInit() {
    this.isSelected = false;
    this.setEvent();
  }

  setEvent() {
    this.mouseDownEvent.subscribe((event : any) => {
      event.preventDefault();
      this.mouseSelectDateActive = true;
      this.elementService.setMousePosition(event.clientX, event.clientY);
      setTimeout(() => {
        if(this.mouseSelectDateActive) {
          this.showSelectTime = false;
        }
      }, 500);
    });

    this.mouseUpEvent.subscribe((event : any) => {
      this.isDoSelectDate = false;
      this.mouseSelectDateActive = false;
    });
  }

  ngAfterViewInit() {
    this.isAfterViewInit = true;

    if(this.dateOptions) {
      //阻止事件冒泡
      this.dateOptions.inputElement.onclick = (event:any) => {
        event.stopPropagation();
      };
      this.dateForm.nativeElement.onclick = (event:any) => {
        event.stopPropagation();
        this.selectMonth.nativeElement.className = 'hide';
        this.selectYear.nativeElement.className = 'hide';
      };

      this.openDateForm();
    }
  }


  showSelectDateType() {
    //时间标题
    switch (this.dateOptions.type) {
      case 0:
        this.dateOn = 'On';
        break;
      case 1:
        this.dateOn = 'Before';
        break;
      case 2:
        this.dateOn = 'Start';
        break;
      case 3:
        this.dateOn = 'After';
        break;
    }
  }

  showSelectMonth(event:any) {
    event.stopPropagation();
    this.selectMonth.nativeElement.className = '';
  }

  showSelectYear(event:any) {
    event.stopPropagation();
    this.selectYear.nativeElement.className = '';
  }

  /**
   * 设定选中类型
   */
  setSelectType(type:number, event:any) {
    event.stopPropagation();
    this.dateOptions.type = type;
    this.showSelectDateType();
    this.setSelectDate();
    this.showSelectTime = false;
  }

  /**
   * 自动获取选择框 position 的位置
   */
  getDateFormPosition():any {

    let positionIn:any = {
      top: 0,
      left: 0
    };
    if (this.dateOptions.offsetLeft === 0 && this.dateOptions.offsetTop === 0) {
      let position = this.elementService.getPosition(this.dateOptions.inputElement);

      //如果时间框显示位置超出文档可视区域,进行自动偏移
      let windowAttr:any = this.elementService.getWindowAttr();

      let dateInnerWidth:number = windowAttr.innerWidth - position.x;
      let dateInnerHeight:number = windowAttr.innerHeight - position.y;

      if (dateInnerWidth >= this.DATEFORM_WIDTH) {
        positionIn.left = position.x + this.dateOptions.distanceLeft;
      } else {
        let toLeft:number = this.DATEFORM_WIDTH - dateInnerWidth;
        positionIn.left = position.x - toLeft - this.dateOptions.distanceLeft - 20;
      }

      if (dateInnerHeight >= this.DATEFORM_HEIGHT) {
        positionIn.top = position.y + this.dateOptions.distanceTop;
      } else {
        if (position.y > this.DATEFORM_HEIGHT) {
          positionIn.top = position.y - this.DATEFORM_HEIGHT;
        } else {
          let toTop:number = this.DATEFORM_HEIGHT - dateInnerHeight;
          positionIn.top = position.y - toTop - this.dateOptions.distanceTop;
        }
      }
    } else {
      positionIn.top = this.dateOptions.offsetTop;
      positionIn.left = this.dateOptions.offsetLeft;
    }
    return positionIn;
  }

  setDateFormPosition() {
    let positionIn = this.getDateFormPosition();

    this.dateForm.nativeElement.style.top = positionIn.top + 'px';
    this.dateForm.nativeElement.style.left = positionIn.left + 'px';
  }

  getDateIn(date?:any):any {
    let dateIn:any = {};
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
    this.showSelectDateType();
    if (this.dateOptions.defaultDate === null) {
      //先判定是否已经有默认日期,有的话使用文本框默认日期
      let selectedDate = this.dateOptions.inputElement.value;
      if (!selectedDate || selectedDate === '') {
        if (typeof this.curDate === 'undefined') {
          this.curDate = this.getDateIn();
        }
        //this.selectedDateIn = this.typeService.clone(this.curDate);
      } else {
        this.selectedDateIn = this.getDateIn(selectedDate);
      }
    } else {
      if (this.dateOptions.type === 2) {
        if(this.dateOptions.defaultDate.end) {
          this.selectedEndDateIn = this.getDateIn(this.dateOptions.defaultDate.end);
        }

        //这里顺序不能改动,应为需要用到开始时间作为显示
        if(this.dateOptions.defaultDate.start) {
          this.selectedDateIn = this.getDateIn(this.dateOptions.defaultDate.start);
        }

      } else {
        this.selectedDateIn = this.getDateIn(this.dateOptions.defaultDate);
      }
    }
    if (this.dateOptions.type === 2) {
      if(this.selectedDateIn && !this.selectedEndDateIn) {
        //设置结束时间
        this.selectedEndDateIn = this.typeService.clone(this.selectedDateIn);
      }
    }

    let setDate = this.selectedDateIn ? this.selectedDateIn : this.curDate;

    this.showDateIn = {
      year: setDate.year,
      month: setDate.month
    };

    //是否需要选择小时
    if(this.dateOptions.dateFormat.indexOf('H') !== -1) {
      this.isSelectTime = true;
      this.showSelectTime = false;
      this.setShowHour();
      this.setHourPage(setDate.hour);
    } else {
      this.isSelectTime = false;
    }

    //是否需要选择分钟
    if(this.dateOptions.dateFormat.indexOf('m') !== -1) {
      this.isSelectMinute = true;
      this.setShowMinute();
      this.setMinutePage(setDate.minute);
    } else {
      this.isSelectTime = false;
    }
    this.setShowSelectYear();
    this.setSelectDate();
    this.initDateForm = true;
  }

  /**
   * 设置时间段样式class
   */
  setSelectedDateClass(curDateIn:any) {
    let setStatus:number;
    if(this.selectedDateIn) {
      if (this.dateOptions.type === 2) { //选择时间段
        curDateIn.day = new Date(curDateIn.year, curDateIn.month, curDateIn.monthDay).getDay();
        setStatus = this.compareDate(curDateIn, this.selectedEndDateIn);

        if(setStatus === 0 && curDateIn.day === 0) {
          curDateIn.selected = true;
          if(this.isSelectEnd) {
            curDateIn.selectedCurrent = true;
          }
        } else {
          setStatus = this.compareDate(curDateIn, this.selectedDateIn);

          if (setStatus === 0) {
            if (this.compareDate(this.selectedDateIn, this.selectedEndDateIn) === 0) {
              curDateIn.selected = true;
            } else {
              if(curDateIn.day === 6) {
                curDateIn.selected = true;
              } else {
                curDateIn.selectedStart = true;
              }
              if(this.isSelectStart) {
                curDateIn.selectedCurrent = true;
              }
            }

          } else if (setStatus === 1) {
            setStatus = this.compareDate(curDateIn, this.selectedEndDateIn);
            if (setStatus === 2) {
              if(curDateIn.day === 0) {
                curDateIn.selectedStart = true;
              } else if(curDateIn.day === 6) {
                curDateIn.selectedEnd = true;
              } else {
                curDateIn.selectedIn = true;
              }
            } else if (setStatus === 0) {
              curDateIn.selectedEnd = true;
              if(this.isSelectEnd) {
                curDateIn.selectedCurrent = true;
              }
            }
          }
        }

      } else {
        curDateIn.selected = this.isSelectedDateIn(curDateIn.year, curDateIn.month, curDateIn.monthDay);
      }
    }
    if(this.compareDate(curDateIn, this.curDate) === 0) {
      curDateIn.isToday = true;
    }
  }

  /**
   * 设置本月前需要填充的日期
   */
  setBeforeMonthDay(firstWeekDay:any) {
    let year = this.showDateIn.month > 0 ? this.showDateIn.year : this.showDateIn.year - 1;
    let beforeMonth = this.showDateIn.month > 0 ? this.showDateIn.month - 1 : 11;
    let monthDay = this.getMonthDay(this.showDateIn.year, beforeMonth);

    for (let day = monthDay - firstWeekDay + 1; day <= monthDay; day++) {
      let curDateIn = {
        year: year,
        month: beforeMonth,
        monthDay: day,
        before: true,
        selectedStart: false,  //选择时间段开始样式
        selectedIn: false,     //选择时间段当中样式
        selectedEnd: false,    //选择时间段结束样式
        selectedCurrent: false,//选择时间段当前样式
        selected: false,        //选择当前时间样式
        isToday : false     //当前日期
      };

      this.setSelectedDateClass(curDateIn);

      this.showDate.push(curDateIn);
    }
  }

  /**
   * 设置本月后需要填充的日期
   */
  setAfterMonthDay(lastWeekDay:any) {
    let year = this.showDateIn.month < 11 ? this.showDateIn.year : this.showDateIn.year + 1;
    let afterMonth = this.showDateIn.month < 11 ? this.showDateIn.month + 1 : 1;

    for (let day = 1; day <= (6 - lastWeekDay); day++) {

      let curDateIn = {
        year: year,
        month: afterMonth,
        monthDay: day,
        after: true,
        selectedStart: false,  //选择时间段开始样式
        selectedIn: false,     //选择时间段当中样式
        selectedEnd: false,    //选择时间段结束样式
        selectedCurrent: false,//选择时间段当前样式
        selected: false,        //选择当前时间样式
        isToday : false     //当前日期
      };
      this.setSelectedDateClass(curDateIn);

      this.showDate.push(curDateIn);
    }
  }

  /**
   * 设置当却需要填充的日期
   */
  setMonthDay(monthDay:any) {
    for (let day = 1; day <= monthDay; day++) {
      let curDateIn = {
        year: this.showDateIn.year,
        month: this.showDateIn.month,
        monthDay: day,
        selectedStart: false,  //选择时间段开始样式
        selectedIn: false,     //选择时间段当中样式
        selectedEnd: false,    //选择时间段结束样式
        selectedCurrent: false,//选择时间段当前样式
        selected: false,        //选择当前时间样式
        isToday : false     //当前日期
      };

      this.setSelectedDateClass(curDateIn);
      this.showDate.push(curDateIn);
    }
  }

  /**
   * 是否是选中的时间
   */
  isSelectedDateIn(year:number, month:number, day:number):boolean {
    return year === this.selectedDateIn.year
    && month === this.selectedDateIn.month
    && this.selectedDateIn.monthDay === day ? true : false;
  }

  /**
   * 设置当前展示的月份
   * @param type 切换类型 1: 向右切换 2:向左切换
   */
  setShowDate(type:number, event:any) {
    event.stopPropagation();
    if (type === 1) {
      this.showDateIn.year = this.showDateIn.month > 0
          ? this.showDateIn.year : this.showDateIn.year - 1;
      this.showDateIn.month = this.showDateIn.month > 0
          ? this.showDateIn.month - 1 : 11;
    } else if (type === 2) {
      this.showDateIn.year = this.showDateIn.month < 11
          ? this.showDateIn.year : this.showDateIn.year + 1;
      this.showDateIn.month = this.showDateIn.month < 11
          ? this.showDateIn.month + 1 : 1;
    }
    this.dateInstance.setFullYear(this.showDateIn.year);
    this.dateInstance.setMonth(this.showDateIn.month, 1);

    this.setShowSelectYear();
    this.setSelectDate();
  }

  /**
   * 设置年份
   */
  setShowYear(year:number) {
    this.selectYear.nativeElement.className = 'hide';
    this.showDateIn.year = year;
    this.dateInstance.setFullYear(year);
    this.setShowSelectYear();
    this.setSelectDate();
  }

  /**
   * 设置月份
   */
  setShowMonth(month:number) {
    this.selectMonth.nativeElement.className = 'hide';
    this.showDateIn.month = month;
    this.dateInstance.setMonth(month, 1);
    this.setSelectDate();
  }

  /**
   * 获取月份的天数
   */
  getMonthDay(year:number, month:number) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 设置当前显示的日期
   */
  setSelectDate() {
    this.showDate = [];
    this.dateInstance.setDate(1);
    let firstWeekDay = this.dateInstance.getDay();

    //如果月初第一天不为星期天,本月日期需要填充上月日期
    if (firstWeekDay !== 0) {
      this.setBeforeMonthDay(firstWeekDay);
    }

    let curMonthDay = this.getMonthDay(
        this.showDateIn.year, this.showDateIn.month
    );

    this.setMonthDay(curMonthDay);

    this.dateInstance.setDate(curMonthDay);
    let lastWeekDay = this.dateInstance.getDay();

    //如果最后不是星期六结尾,那么补充下月天数
    if (lastWeekDay !== 6) {
      this.setAfterMonthDay(lastWeekDay);
    }
  }

  /**
   * 处理年份
   */
  outputYear(year:any) {

    if (this.dateFormat.indexOf('yyyy') !== -1) {
      this.dateFormat = this.dateFormat.replace(/yyyy/, year);
    } else if (this.dateFormat.indexOf('yyy') !== -1) {
      let showYear = this.stringService.subString(year, 1, 3);
      this.dateFormat = this.dateFormat.replace(/yyy/, showYear);
    } else if (this.dateFormat.indexOf('yy') !== -1) {
      let showYear = this.stringService.subString(year, 2, 2);
      this.dateFormat = this.dateFormat.replace(/yy/, showYear);
    }
  }

  /**
   * 处理月份
   */
  outputMonth(month:any) {
    month += 1;
    if (this.dateFormat.indexOf('MMMM') !== -1) { //显示全月份
      this.dateFormat = this.dateFormat.replace(/MMMM/, this.dateWord['month'][month]);
    } else if (this.dateFormat.indexOf('MMM') !== -1) { //显示缩短月份
      this.dateFormat = this.dateFormat.replace(/MMM/, this.dateWord['monthSmall'][month]);
    } else if (this.dateFormat.indexOf('MM') !== -1) {
      if (this.typeService.getDataLength(month) === 1) {
        month = '0' + month;
      }
      this.dateFormat = this.dateFormat.replace(/MM/, month);
    } else if (this.dateFormat.indexOf('M') !== -1) {
      this.dateFormat = this.dateFormat.replace(/M/, month);
    }
  }

  /**
   * 处理天
   */
  outputMonthDay(monthDay:any) {
    if (this.dateFormat.indexOf('dd') !== -1) {
      if (this.typeService.getDataLength(monthDay) === 1) {
        monthDay = '0' + monthDay;
      }
      this.dateFormat = this.dateFormat.replace(/dd/, monthDay);
    } else if (this.dateFormat.indexOf('d') !== -1) {
      this.dateFormat = this.dateFormat.replace(/d/, monthDay);
    }
  }

  /**
   * 处理小时
   */
  outputHour(hour:any) {
    if (this.dateFormat.indexOf('HH') !== -1) {
      if (this.typeService.getDataLength(hour) === 1) {
        hour = '0' + hour;
      }
      this.dateFormat = this.dateFormat.replace(/HH/, hour);
    } else if (this.dateFormat.indexOf('H') !== -1) {
      this.dateFormat = this.dateFormat.replace(/H/, hour);
    }
  }

  /**
   * 处理分钟
   */
  outputMinute(minute:any) {
    if (this.dateFormat.indexOf('mm') !== -1) {
      if (this.typeService.getDataLength(minute) === 1) {
        minute = '0' + minute;
      }
      this.dateFormat = this.dateFormat.replace(/mm/, minute);
    } else if (this.dateFormat.indexOf('m') !== -1) {
      this.dateFormat = this.dateFormat.replace(/m/, minute);
    }
  }



  /**
   * 输出
   */
  completeDateTime() {
    this.showSelectTime = false;
  }

  /**
   * 输出时间
   */
  outputDate() {
    this.outputYear(this.selectedDateIn.year);
    this.outputMonth(this.selectedDateIn.month);
    this.outputMonthDay(this.selectedDateIn.monthDay);

    if(this.isSelectTime) {
      this.outputHour(this.selectedDateIn.hour);
    }

    if(this.isSelectMinute) {
      this.outputMinute(this.selectedDateIn.minute);
    }
    let setDate:any = this.dateFormat;
    let endDate:any = '';
    if (this.dateOptions.type === 2) {
      this.dateFormat = this.dateOptions.dateFormat;

      this.outputYear(this.selectedEndDateIn.year);
      this.outputMonth(this.selectedEndDateIn.month);
      this.outputMonthDay(this.selectedEndDateIn.monthDay);
      if(this.isSelectTime) {
        this.outputHour(this.selectedEndDateIn.hour);
        if(this.isSelectMinute) {
          this.outputMinute(this.selectedEndDateIn.minute);
        }
      }

      endDate = this.dateFormat;
    }
    //选择的回调事件
    if (typeof this.dateOptions.setEvent === 'function') {
      let setDateIn:any;
      if (this.dateOptions.type === 2) {
        setDateIn = {
          startDate : setDate,
          endDate : endDate
        };
      } else {
        setDateIn = {
          date : setDate
        };
      }
      this.setUTCDate(setDateIn);
      this.dateOptions.setEvent(setDateIn);
    }
    this.saveDate();

  }

  /**
   * 设置UTC时间
   */
  setUTCDate(setDateIn:any) {
    if (this.dateOptions.type === 2) {
      if(!this.isSelectTime) {
        this.selectedDateIn.hour = 0;
        this.selectedDateIn.minute = 0;
        this.selectedDateIn.second = 0;

        this.selectedEndDateIn.hour = 23;
        this.selectedEndDateIn.minute = 59;
        this.selectedEndDateIn.second = 59;
      }
      setDateIn.utcStartDate =  this.getUtcDateStr(this.selectedDateIn);
      setDateIn.utcEndDate = this.getUtcDateStr(this.selectedEndDateIn);
    } else {
      setDateIn.utcDate = this.getUtcDateStr(this.selectedDateIn, this.isSelectTime, false);
    }
  }

  /**
   * 获取UTC时间
   */
  getUtcDate(dateIn:any) {
    let dateInstance = new Date(dateIn.year, dateIn.month, dateIn.monthDay,
      (dateIn.hour ? dateIn.hour : 0),
      (dateIn.minute ? dateIn.minute : 0),
      (dateIn.second ? dateIn.second : 0)
    );

    return {
      year: dateInstance.getUTCFullYear(),
      monthDay: dateInstance.getUTCDate(),
      month: dateInstance.getUTCMonth(),
      hour: dateInstance.getUTCHours(),
      minute: dateInstance.getUTCMinutes(),
      second: dateInstance.getUTCSeconds()
    }
  }

  /**
   * 获取utc时间字符串
   * @param isGetUtcDate 是否获取UTC时间, 如选单个时间且不选择小时的情况则为false
   * @param isGetUtcTime 是否获取UTC 小时/分钟
   */
  getUtcDateStr(dateIn, isGetUtcDate:boolean=true, isGetUtcTime:boolean=true) :string {
    let utcDate = isGetUtcDate ? this.getUtcDate(dateIn) : dateIn;

    let utcDateStr:string = utcDate.year+'-'+(utcDate.month+1)+'-'+utcDate.monthDay;

    if(isGetUtcTime) {
      utcDateStr += ' '+utcDate.hour+':'+utcDate.minute+':'+utcDate.second;
    } else {
      if(this.isSelectTime) {
        utcDateStr += ' '+utcDate.hour;

        if(this.isSelectMinute) {
          utcDateStr +=':'+utcDate.minute;
        }
      }
    }
    return utcDateStr;
  }

  /**
   * 清除时间
   */
  clearDate() {
    this.closeDateForm();
    this.dateOptions.inputElement.value = '';
    if (typeof this.dateOptions.clearEvent === 'function') {
      this.dateOptions.clearEvent();
    }
  }

  /**
   * 保存时间
   */
  saveDate() {
    this.dateOptions.inputElement.value = this.dateFormat;
    this.closeDateForm();
  }

  /**
   * 打开时间框
   */
  openDateForm() {
    this.setDateFormPosition();
    this.showDateForm = true;
  }

  /**
   * 关闭时间框
   */
  closeDateForm() {
    this.showDateForm = false;
    //this.mouseSelectDateActive = false;
  }

  /**
   * 设置选择的年份
   */
  setShowSelectYear() {
    this.showSelectYearArr = [];
    for (let startYear = this.showDateIn.year - 3;
         startYear <= this.showDateIn.year + 10; startYear++) {

      this.showSelectYearArr.push(startYear);
    }
  }
  /**
   * 点击日期
   */
  onSelectDate(dateIn:any, event?:any) {
    if(event) {
      event.stopPropagation();
    }
    if (this.dateOptions.type === 2) {
      let isSelectEnd : boolean = false;
      let isSelectStart : boolean = false;
      if (event) {
        this.isSelectLeft = this.elementService.hasClass(event.target, 'active-left');
        this.isSelectRight = this.elementService.hasClass(event.target, 'active-right');

        if(this.isSelectLeft) {
          isSelectStart = this.elementService.hasClass(event.target, 'active-current');
        } else if(this.isSelectRight) {
          isSelectEnd = this.elementService.hasClass(event.target, 'active-current');
        }

        this.isSelectCenter = this.elementService.hasClass(event.target, 'active-center');
        //只选了一个日期
        this.isOnlyOneSelect = this.elementService.hasClass(event.target, 'active');

        dateIn.isSelectStart = isSelectStart;
        dateIn.isSelectEnd = isSelectEnd;
      }

      if (this.isSelectTime &&
          (isSelectStart || isSelectEnd || this.isOnlyOneSelect)
      ) {
        if (isSelectStart) {
          this.setHourPage(this.selectedDateIn.hour);
          this.setMinutePage(this.selectedDateIn.minute);
          this.isShowStartDate = true;
          this.isShowEndDate = false;
        } else if (isSelectEnd) {
          this.isShowStartDate = false;
          this.isShowEndDate = true;
          this.setHourPage(this.selectedEndDateIn.hour);
          this.setMinutePage(this.selectedEndDateIn.minute);
        }
        this.showSelectTime = true;
      } else {

        this.isSetAllDay = false;
        this.isSetAllMonthDay = false;
        this.isShowStartDate = false;
        this.isShowEndDate = false;

        this.showSelectTime = false;
      }
      //没有设置默认选择的日期
      if(!this.selectedDateIn || !this.selectedEndDateIn) {
        this.selectedDateIn = this.typeService.clone(dateIn);
        this.selectedDateIn.hour = 0;
        this.selectedDateIn.minute = 0;
        this.getShowDateIn(this.selectedDateIn);
        this.selectedEndDateIn = this.typeService.clone(dateIn);
        this.selectedEndDateIn.hour = 23;
        this.selectedEndDateIn.minute = 59;
        this.getShowDateIn(this.selectedEndDateIn);
      }
      this.doSelectArea(event, dateIn, true);
    } else {
      this.getShowDateIn(dateIn);
      if(!this.selectedDateIn) {
        this.selectedDateIn = {};
        this.selectedDateIn.minute = 0;
        this.selectedDateIn.hour = 0;
      }

      this.typeService.mergeObj(this.selectedDateIn, dateIn);
      this.setHourPage(this.selectedDateIn.hour);
      this.setMinutePage(this.selectedDateIn.minute);
      this.doSelectArea(event, dateIn, true);
      if (!this.isSelectTime) {
        this.outputDate();
      }
    }
    if (this.showSelectTime) {
      this.initDateTime();
    }
  }

  /**
   * 获取日期显示信息
   */
  getShowDateIn(dateIn : any) {
    dateIn.monthName = this.dateWord['month'][dateIn.month];
    dateIn.day = new Date(dateIn.year, dateIn.month, dateIn.monthDay).getDay();
    dateIn.weekDayName = this.dateWord['week'][dateIn.day];
  }
  /**
   * 选择时间段
   */
  doSelectArea(event:any, dateIn:any, isSelect?: boolean) : any {
    if(event) {
      event.stopPropagation();
    }
    if(this.dateOptions.type === 2) {

      setTimeout(() => {
        if (isSelect || this.mouseSelectDateActive) {
          if(event) {
            this.moveDirection = this.elementService.getMouseMoveDirection(event.clientX, event.clientY);
          }
          this.getShowDateIn(dateIn);
          let startStatus:number = this.compareDate(this.selectedDateIn, this.selectedEndDateIn);
          let status:number;
          if (this.selectedEndDateIn) {

            status = this.compareDate(this.selectedDateIn, dateIn);
            if (status === 1 || status === 0) { //小于开始时间 重新赋值开始时间
              if (startStatus === 0 && !this.isDoSelectDate) {
                this.isDoSelectDate = true;
                //this.selectedEndDateIn = this.typeService.clone(this.selectedDateIn);
              }
              if (status === 1) {
                this.typeService.mergeObj(this.selectedDateIn, dateIn);
              }
              this.isSelectStart = true;
              this.isSelectEnd = false;

              if (this.isSelectTime) {
                this.showStartTime(isSelect);
              }
            } else if (status === 2) {
              status = this.compareDate(this.selectedEndDateIn, dateIn);
              //如果选择时间大于结束时间重新赋值结束时间
              if (status === 2) {
                if (startStatus === 0 && !this.isDoSelectDate) {
                  this.isDoSelectDate = true;
                }
                this.typeService.mergeObj(this.selectedEndDateIn, dateIn);
                this.isSelectEnd = true;
                if (this.isSelectTime) {
                  this.showEndTime(isSelect);
                }

              } else if (status === 1) {
                //滑动取消选中的日期
                status = this.compareDate(this.selectedDateIn, dateIn);
                if (status === 2) {
                  if (this.mouseSelectDateActive &&
                      (this.moveDirection === 1 || this.moveDirection === 3
                      || this.moveDirection === 5 || this.moveDirection === 6)) { //鼠标移动方位
                    if (this.isSelectEnd) {
                      this.isSelectEnd = true;
                      this.isSelectStart = false;
                      this.typeService.mergeObj(this.selectedEndDateIn, dateIn);
                    }
                  } else if (this.mouseSelectDateActive &&
                      (this.moveDirection === 2 || this.moveDirection === 4
                      || this.moveDirection === 7 || this.moveDirection === 8)) { //鼠标移动方位
                    if (this.isSelectStart) {
                      this.isSelectStart = true;
                      this.isSelectEnd = false;
                      this.typeService.mergeObj(this.selectedDateIn, dateIn);
                    }
                  } else {
                    //选择时间当中的日期
                    if (this.isSelectEnd) {
                      this.isSelectStart = false;
                      this.typeService.mergeObj(this.selectedEndDateIn, dateIn);
                      if (this.isSelectTime) {
                        this.showEndTime(isSelect);
                      }
                    } else {
                      this.isSelectStart = true;
                      this.typeService.mergeObj(this.selectedDateIn, dateIn);
                      if (this.isSelectTime) {
                        this.showStartTime(isSelect);
                      }
                    }
                  }
                } else {
                  if (this.isSelectTime) {
                    if (this.isSelectStart) {
                      this.showStartTime(isSelect);
                    } else {
                      this.showEndTime(isSelect);
                    }
                  }
                }
              } else if (status === 0) {
                if (this.isSelectTime) {
                  this.showEndTime(isSelect);
                }
                this.isSelectStart = false;
                this.isSelectEnd = true;
              }
            }
          }
          //setTimeout(() => {
          this.setSelectDate();
          // }, 50);
        }
      }, 50);
    } else {
      if (this.isSelectTime) {
        this.showStartTime(isSelect);
      }
      this.setSelectDate();
    }
  }


  /**
   * 时间段选择一天
   * @param event
   * @param dateIn
   */
  doSelectOne(event:any, dateIn:any) {
    event.stopPropagation();
    this.getShowDateIn(dateIn);
    let startDateIn = this.typeService.clone(dateIn);
    let endDateIn = this.typeService.clone(dateIn);

    this.typeService.mergeObj(this.selectedDateIn, startDateIn);
    this.selectedDateIn.hour = 0;
    this.selectedDateIn.minute = 0;

    this.typeService.mergeObj(this.selectedEndDateIn, endDateIn);
    this.selectedEndDateIn.hour = 23;
    this.selectedEndDateIn.minute = 59;
    this.setSelectDate();
  }


  /**
   * 点击日期开始信息
   */
  setStartDateTime() : any {
    if(!this.selectedDateIn) return false;

    this.isSelectStart = true;
    this.isSelectEnd   = false;
    this.isOnlyOneSelect  = false;
    this.isSelectCenter = false;

    this.onSelectDate(this.selectedDateIn);
  }

  /**
   * 点击日期结束信息
   */
  setEndDateTime() : any {
    if(!this.selectedEndDateIn) return false;
    this.isSelectStart = false;
    this.isSelectEnd   = true;
    this.isOnlyOneSelect  = false;
    this.isSelectCenter = false;

    this.onSelectDate(this.selectedEndDateIn);
  }

  /**
   * 比较两个日期的大小
   * @param date
   * @param secondDate
   * @returns {number} 第一个日期大 就返回1, 第二个日期大就返回2 ,相等的就返回 0
   */
  compareDate(date:any, secondDate:any):number {

    let returnStatus:number = 2;

    if(date && !secondDate) {
      returnStatus = 1;
    } else {
      if(date && secondDate) {
        if (date.year > secondDate.year) {
          returnStatus = 1;
        } else if(date.year === secondDate.year) {
          if (date.month > secondDate.month) {
            returnStatus = 1;
          } else if (date.month === secondDate.month) {
            if ( date.monthDay > secondDate.monthDay) {
              returnStatus = 1;
            } else if ( date.monthDay === secondDate.monthDay) {
              returnStatus = 0;
            }
          }
        }
      }
    }
    return returnStatus;
  }

  /**
   * 设置小时分页
   * @param type 切换类型 1: 向右切换 2:向左切换
   */
  switchHourPage(type:number, event:any) {
    event.stopPropagation();
    if(type === 1) {
      if(this.showHourPage > 1) {
        this.showHourPage--;
      }
    } else if(type === 2) {
      if(this.showHourPage < 4) {
        this.showHourPage++;
      }
    }
    this.setShowHour();
  }

  /**
   * 设置分钟分页
   * @param type 切换类型 1: 向右切换 2:向左切换
   */
  switchMinutePage(type:number, event:any) {
    event.stopPropagation();
    if(type === 1) {
      if(this.showMinutePage > 1) {
        this.showMinutePage--;
      }
    } else if(type === 2) {
      if(this.showMinutePage < 9) {
        this.showMinutePage++;
      }
    }
    this.setShowMinute();
  }

  /**
   * 定位时间显示
   */
  initDateTime() {
    if(this.isShowStartDate) {
      this.showStartTime();
    } else if(this.isShowEndDate) {
      this.showEndTime();
    } else {
      this.showStartTime();
    }
  }

  /**
   * 定位小时分页
   */
  setHourPage(hour : number) {
    this.showHourPage = Math.ceil(hour / this.SHOW_TIME_NUMBER);
    if(hour % this.SHOW_TIME_NUMBER === 0) {
      this.showHourPage += 1;
    }
    this.setShowHour();
  }


  /**
   * 定位分钟分页
   */
  setMinutePage(minute : number) {
    this.showMinutePage = Math.ceil(minute / this.SHOW_TIME_NUMBER);
    if(minute % this.SHOW_TIME_NUMBER === 0) {
      this.showMinutePage += 1;
    }
    this.setShowMinute();
  }

  /**
   * 设置当前显示的小时
   */
  setShowHour() {
    this.showHour = [];
    this.showHourPage = this.showHourPage > 0 ? this.showHourPage : 1;
    let startHour = (this.showHourPage - 1) * this.SHOW_TIME_NUMBER;
    let endHour = this.showHourPage * this.SHOW_TIME_NUMBER;
    if(endHour > 23) endHour = 23;
    for(let h = startHour; h <= endHour; h++) {
      this.showHour.push(h);
    }
  }

  /**
   * 设置当前显示的分钟
   */
  setShowMinute() {
    this.showMinute = [];
    this.showMinutePage = this.showMinutePage > 0 ? this.showMinutePage : 1;
    let startMinute = (this.showMinutePage - 1) * this.SHOW_TIME_NUMBER;
    let endMinute = this.showMinutePage * this.SHOW_TIME_NUMBER;
    if(endMinute > 59) endMinute = 59;
    for(let m = startMinute; m <= endMinute; m++) {
      this.showMinute.push(m);
    }
  }

  /**
   * 选择分钟
   */
  selectHour(hour : number) {
    if(this.isSelectEnd || this.isShowEndDate) {
      this.selectedEndDateIn.hour = hour;
    } else {
      this.selectedDateIn.hour = hour;
    }

    this.setShowHour();
  }

  /**
   * 选择分钟
   */
  selectMinute(minute : number) {
    if(this.isSelectEnd || this.isShowEndDate) {
      this.selectedEndDateIn.minute = minute;
    } else {
      this.selectedDateIn.minute = minute;
    }
    this.setShowMinute();
  }

  /**
   * 选择全天
   */
  setAllDay() {
    this.isSetAllDay = true;
    this.isSetAllMonthDay = false;
    this.selectedDateIn.hour = 0;
    this.selectedDateIn.minute = 0;

    if(this.isSelectEnd || this.isShowEndDate) {
      this.selectedDateIn = this.typeService.clone(this.selectedEndDateIn);
    } else {
      this.selectedEndDateIn = this.typeService.clone(this.selectedDateIn);
    }

    this.selectedEndDateIn.hour = 23;
    this.selectedEndDateIn.minute = 59;

    this.setSelectDate();
  }

  /**
   * 选择全月
   */
  setAllMonth() {
    this.isSetAllDay = false;
    this.isSetAllMonthDay = true;
    this.selectedDateIn.monthDay = 1;
    this.selectedDateIn.hour = 0;
    this.selectedDateIn.minute = 0;

    this.selectedEndDateIn = this.typeService.clone(this.selectedDateIn);
    this.selectedEndDateIn.monthDay =
        this.getMonthDay(this.selectedEndDateIn.year, this.selectedEndDateIn.month);

    this.selectedEndDateIn.day = new Date(this.selectedEndDateIn.year,
        this.selectedEndDateIn.month, this.selectedEndDateIn.monthDay).getDay();

    this.selectedEndDateIn.hour = 23;
    this.selectedEndDateIn.minute = 59;
    this.setSelectDate();
  }

  /**
   * 显示开始时间
   */
  showStartTime(showSelectTime? : boolean) : any {
    if(!showSelectTime && this.mouseSelectDateActive) return false;
    this.showSelectTime = true;
    this.isSelectEnd = false;
    this.isSelectStart = true;
    this.isShowStartDate = true;
    this.isShowEndDate = false;
    this.isSelectCenter = false;
    this.setHourPage(this.selectedDateIn.hour);
    this.setMinutePage(this.selectedDateIn.minute);
    this.setShowYear(this.selectedDateIn.year);
    this.setShowMonth(this.selectedDateIn.month);
    this.setSelectDate();
  }

  /**
   * 显示结束时间
   */
  showEndTime(showSelectTime? : boolean) : any {
    if(!showSelectTime && this.mouseSelectDateActive) return false;
    this.showSelectTime = true;
    this.isSelectStart = false;
    this.isSelectEnd = true;
    this.isShowStartDate = false;
    this.isShowEndDate = true;
    this.isSelectCenter = false;
    this.setHourPage(this.selectedEndDateIn.hour);
    this.setMinutePage(this.selectedEndDateIn.minute);
    this.setShowYear(this.selectedEndDateIn.year);
    this.setShowMonth(this.selectedEndDateIn.month);
    this.setSelectDate();
  }

}
