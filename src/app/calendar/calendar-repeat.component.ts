/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/7.
 */

import {Inject, Component, ViewEncapsulation, OnInit, Output, EventEmitter, Input, HostListener} from "@angular/core";
import {MissionModelService} from "../shared/services/model/mission-model.service";
import {AlarmModelService} from '../shared/services/model/alarm-model.service'
import * as AlarmConfig from '../shared/config/alarm.config';
@Component({
  selector: 'bi-calendar-repeat',
  styleUrls: ['../../assets/css/date/date.css'],
  templateUrl: './calendar-repeat.component.html',
  providers: [MissionModelService, AlarmModelService],
  encapsulation: ViewEncapsulation.None
})

export class CalendarRepeatComponent implements OnInit {
  public isShowDay: boolean = true;  //显示day
  public isShowWeek: boolean = false;  //显示Week
  public isShowMonth: boolean = false;  //显示month
  public isShow: boolean = false;  //显示month
  public daysArr: Array<any> =
    [{
      text: 'A day',
      selected: false
    },
      {
        text: 'Two days',
        selected: false
      },
      {
        text: 'Three days',
        selected: false
      },
      {
        text: 'Four days',
        selected: false
      }];

  public weekArr: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  //保存星期对象数组  {text：星期, selected:是否选中}
  public weekObjArr: Array<any> = [];
  public monthSuffix: Array<any> = [
    'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
    'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd',
    'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'
  ];
  //小时对象
  public hourSettings: any = {
    hour: '',  //小时数
    selected: false,//是否选中
    current: false //是否是当前小时
  };
  //分钟对象
  public minuteSettings: any = {
    minute: '',  //分钟数
    selected: false//是否选中
  };
  //选择月对象
  public monthSettings: any = {
    month: '',  //每月的哪天
    selected: false,//是否被选中
    suffix: ''     //当天缩写后缀
  };
  public hourList: Array<any> = [];  //小时列表
  public minuteList: Array<any> = [];  //分钟列表
  public monthArr: Array<any> = []; //每月中天列表

  //保存选择的每一项结果
  public nowDay: string = '';
  public nowWeek: string = '';
  public nowMonth: string = '';
  public nowHour: string = '';
  public nowMinute: string = '';

  //默认输出对象
  public outPutDataSettings = {
    isRepeat: true,
    isDay: false,
    isWeek: false,
    isMonth: false,
    day: '',
    week: '',
    month: '',
    hour: '',
    minute: ''
  };
  public missionObj: any; //保存mission detail传入的mission对象
  @Output() public outRepeatInfo = new EventEmitter(); //传给父组件选择的开始，结束日期
  @Output() public outDeleteInfo = new EventEmitter();
  @Output() public outRepeatDeleteInfo = new EventEmitter();
  @Output() public outDefault = new EventEmitter();  //隐藏calendar
  private hasAlarm: boolean = false;
  constructor(
    public alarmModelService: AlarmModelService,
    @Inject('type.service') public typeService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('toggle-select.service') public toggleSelectService: any
  ) {}

  /**
   * 传入 dataOption 的对象
   * {
   *    data：mission对象,
   *    isShow:true
   * }
   * @param data
   */
  @Input() set dataOption(data: any) {
    if (data) {
      if (!data.data) {
      } else {
        this.missionObj = data.data;
        this.toggleSelectService.closeElement();
        this.toggleSelectService.setCalendarElement(() => {
          this.isShow = false;
          if(this.outDefault) {
            this.outDefault.emit();
          }
        });
        this.hasAlarm = this.missionObj.has_alarm;
        if(data.isShow){
          this.isShow = true;
        }
      }
    }
  }

  @HostListener('document:click')
  click() {
    this.isShow = false;
    if(this.outDefault) {
      this.outDefault.emit();
    }
  }
  /**
   * 初始化calendar repeat
   */
  ngOnInit() {
    this.initHour();
    this.initMinute();
    this.initWeek();
    this.initmonth();
  }

  /**
   * 清除上次选择的数据
   */
  clearCalendar() {
    //清除样式
    this.clearDay();
    this.clearWeek();
    this.clearMonth();
    this.clearHour_minute();
    //每次点开默认选中day
    this.isShowDay = true;
    this.isShowWeek = false;
    this.isShowMonth = false;
  }


  /**
   * 点击day选项
   */
  onClickDay(event: any) {
    event.stopPropagation();
    if (!this.isShowDay) {
      this.isShowDay = true;
      this.isShowWeek = false;
      this.isShowMonth = false;

      this.clearMonth();
      this.clearWeek();
      this.clearHour_minute();
    }

  }

  /**
   * 点击week选项
   */
  onClickWeek(event: any) {
    event.stopPropagation();
    if (!this.isShowWeek) {
      this.isShowDay = false;
      this.isShowWeek = true;
      this.isShowMonth = false;

      this.clearDay();
      this.clearMonth();
      this.clearHour_minute();
    }
  }

  /**
   * 点击month选项
   */
  onClickMonth(event: any) {
    event.stopPropagation();
    if (!this.isShowMonth) {
      this.isShowDay = false;
      this.isShowWeek = false;
      this.isShowMonth = true;

      this.clearDay();
      this.clearWeek();
      this.clearHour_minute();
    }

  }

  /**
   * 初始化月
   */
  initmonth() {
    for (let i = 1; i < 29; i++) {
      let month = this.typeService.clone(this.monthSettings);
      month.month = this.format(i);
      month.selected = false;
      month.suffix = this.monthSuffix[i - 1];
      this.monthArr.push(month);
    }
  }

  /**
   * 点击月份中一天
   */
  onClickMonths(event, index: number, monthText: string) {
    event.stopPropagation();
    for (let i = 0; i < this.monthArr.length; i++) {
      if (index == i) {
        this.monthArr[i].selected = !this.monthArr[i].selected;
        if (this.monthArr[i].selected) {
          this.nowMonth = index.toString();
        }
      } else {
        this.monthArr[i].selected = false;  //默认都不选中
      }
    }
  }

  /**
   * 初始化小时数
   */
  initHour() {
    this.hourList = [];
    for (let i = 0; i < 24; i++) {
      let hour = this.typeService.clone(this.hourSettings);
      hour.hour = this.format(i);
      hour.selected = false;
      this.hourList.push(hour);
    }
  }

  /**
   * 点击小时
   * @param event
   * @param index
   */
  onClickHour(event: any, index: number) {
    event.stopPropagation();
    for (let i = 0; i < this.hourList.length; i++) {
      this.hourList[i].current = false;
      if (index == i) {
        this.hourList[i].selected = !this.hourList[i].selected;
        if (this.hourList[i].selected) {
          this.nowHour = this.hourList[i].hour;
        }
      } else {
        this.hourList[i].selected = false;
      }
    }
  }

  /**
   * 初始化分钟数
   */
  initMinute() {
    this.minuteList = [];
    for (let i = 0; i < 60; i += 5) {
      let minute = this.typeService.clone(this.minuteSettings);
      minute.minute = this.format(i);
      minute.selected = false;
      this.minuteList.push(minute);
    }
  }

  /**
   * 点击分钟
   */
  onClickMinute(event: any, index) {
    event.stopPropagation();
    for (let i = 0; i < this.minuteList.length; i++) {
      this.minuteList[i].current = false;
      if (index == i) {
        this.minuteList[i].selected = !this.minuteList[i].selected;
        if (this.minuteList[i].selected) {
          this.nowMinute = this.minuteList[i].minute;
        }
      } else {
        this.minuteList[i].selected = false;
      }
    }
  }

  /**
   * 初始化week
   */
  initWeek() {
    for (let i = 0; i < this.weekArr.length; i++) {
      this.weekObjArr[i] = {};
      this.weekObjArr[i].text = this.weekArr[i];
      this.weekObjArr[i].selected = false;
    }
  }


  /**
   * 点击每隔几天
   */
  onClickDays(event: any, index: any, dayText: string) {
    event.stopPropagation();
    for (let i = 0; i < this.daysArr.length; i++) {
      if (index == i) {
        this.daysArr[index].selected = !this.daysArr[index].selected;
        if (this.daysArr[index].selected) {
          this.nowDay = index;
        }
      } else {
        this.daysArr[i].selected = false;
      }
    }
  }

  /**
   * 点击星期几
   */
  onClickWeeks(event: any, index: number, weekText: string) {
    event.stopPropagation();
    for (let i = 0; i < this.weekObjArr.length; i++) {
      if (index == i) {
        this.weekObjArr[i].selected = !this.weekObjArr[i].selected;
        if (this.weekObjArr[i].selected) {
          this.nowWeek = index.toString();
        }
      } else {
        this.weekObjArr[i].selected = false;
      }
    }
  }

  /**
   * 点击done
   */
  onClickDone(event: any) {
    event.stopPropagation();
    let outData = this.typeService.clone(this.outPutDataSettings);
    if (this.isShowDay) {
      outData.isDay = true;
      outData.day = this.nowDay;
    } else if (this.isShowWeek) {
      outData.isWeek = true;
      outData.week = this.nowWeek;
    } else if (this.isShowMonth) {
      outData.isMonth = true;
      outData.month = this.nowMonth;
    }

    outData.hour = this.nowHour;
    outData.minute = this.nowMinute;

    let type: string;
    let every: number;
    let time: any;
    if (outData.isDay) {
      type = '1';
      every = parseInt(outData.day) + 1;
    } else if (outData.isWeek) {
      type = '2';
      every = parseInt(outData.week) + 1;
    } else if (outData.isMonth) {
      type = '3';
      every = parseInt(outData.month) + 1;
    }
    if (outData.hour != '' && outData.minute != '') {
      let now = new Date();
      let newDate=new Date(now.setHours(parseInt(outData.hour),parseInt(outData.minute),0,0));
      time = parseInt(outData.hour) * 3600 + parseInt(outData.minute) * 60 + now.getTimezoneOffset() * 60;
      if(time < 0){
        time = time + 24* 3600;
      }
    } else {
      time = "";
    }

    let sendData:any = {
      "uid": "",
      "form": AlarmConfig.FORM_MISSION,
      "rid": this.missionObj.mid,
      "effective_time": time,
      "mode": AlarmConfig.MODE_REPEAT,
      "repeat": type,
      "every": every
    };
    if(!this.missionObj.has_alarm){
      this.alarmModelService.alarmAdd({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          outData.alarm_id = response.data.id;
          this.outRepeatInfo.emit(outData);
          this.isShow = false;
        } else {
          this.timeError();
        }
      });
    }else{
      sendData.alarm_id = this.missionObj.alarm_id;
      this.alarmModelService.alarmUpdate({data: sendData}, (response) => {
        if (response.status == 1) {
          this.alarmSuccess();
          outData.alarm_id = response.data.id;
          this.outRepeatInfo.emit(outData);
          this.isShow = false;
        } else {
          this.timeError();
        }
      });
    }

    this.clearCalendar();
  }
  /**
   * 取消闹钟
   * @param event
   */
  cancelAlarm(event: any){
    if(!this.hasAlarm){
      return false;
    }
    this.alarmModelService.alarmDelete({data:{alarm_id: this.missionObj.alarm_id,mode:'1'}},(response: any) => {
      if(response.status){
        this.outRepeatDeleteInfo.emit({id:this.missionObj.mid});
        this.isShow = false;
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
      title: 'Time error',
      isSimpleContent: true,
      simpleContent: 'Please choose the right time, Hours and minutes are required',
      buttons: [{
        type: 'ok'
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 清空小时，分钟选中值和样式
   */
  clearHour_minute() {
    for (let i = 0; i < this.hourList.length; i++) {
      this.hourList[i].selected = false;
    }
    for (let i = 0; i < this.minuteList.length; i++) {
      this.minuteList[i].selected = false;
    }

    this.nowHour = '';
    this.nowMinute = '';
  }

  /**
   * 清空day 每隔几天选中的样式,及保留的数值
   */
  clearDay() {
    for (let i = 0; i < this.daysArr.length; i++) {
      this.daysArr[i].selected = false;
    }
    this.nowDay = '';
  }

  /**
   * 清空week
   */
  clearWeek() {
    for (let i = 0; i < this.weekObjArr.length; i++) {
      this.weekObjArr[i].selected = false;
    }
    this.nowWeek = '';
  }

  /**
   * 清空month
   */
  clearMonth() {
    for (let i = 0; i < this.monthArr.length; i++) {
      this.monthArr[i].selected = false;
    }
    this.nowMonth = '';
  }

  /**
   * 点击calendar repeat的空白处
   */
  onClickRepeatEmpty(event: any) {
    event.stopPropagation();
  }

  /**
   *处理天
   */
  format(day: any) {
    if (day < 10) {
      day = '0' + day;
    }
    return day.toString();
  }
}