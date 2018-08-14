import {Component, Inject, OnInit, Input, Renderer} from '@angular/core';
import {UserModelService} from "../../../shared/services/model/user-model.service";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
@Component({
  selector: 'set-work-time-dialog',
  templateUrl: '../../template/dialog/set-work-time-dialog.component.html',
})

export class SetWorkTimeDialogComponent implements OnInit {

  private arriveCalendarData: any = {};
  private leaveCalendarData: any = {};
  private isShowLeaveCalendar: boolean = false;
  // private isShowArriveCalendar: boolean = false;
  private absenteeismCount: number = 0;
  private weekArray: Array<any> = [];
  private weekDays: string;
  private showWeekTemp: string = '';
  private arriveTime: string;
  private leftTime: string;
  private defaultTemplate: string = 'Every work day  ';
  private arriveTimeNumber: number;
  private leftTimeNumber: number;
  private isFirstSet: boolean;
  private settingId: any;
  private defaultArriveData: any = {};
  private defaultLeftData: any = {};

  constructor(@Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              public userModelService: UserModelService,
              public renderer:Renderer) {
  }

  ngOnInit() {
    this.weekArray = [
      {weekTemp: 'Sunday', key: 0},
      {weekTemp: 'Monday', key: 1},
      {weekTemp: 'Tuesday', key: 2},
      {weekTemp: 'Wednesday', key: 3},
      {weekTemp: 'Thursday', key: 4},
      {weekTemp: 'Friday', key: 5},
      {weekTemp: 'Saturday', key: 6},
    ]
  }


  @Input('setOption')
  public set setOption(data: any) {
    this.userModelService.showWorKTime({}, (res: any) => {
      if (res.status === 1) {
        if (res.data.id == '') {
          this.isFirstSet = true;
          this.defaultArriveData = {
            hour: '',
            minute: ''
          };
          this.defaultLeftData = {
            hour: '',
            minute: ''
          };
        } else {
          this.isFirstSet = false;
          this.settingId = res.data.id;
        }
        this.showWorkData(res.data);
      }
    })
  }


  /**
   * 显示考勤相关数据
   */
  showWorkData(data: any) {
    //每周上班的天数
    if (data.day) {
      this.showWeekTemp = ''
      let eachDay: any = data.day.split(',');
      for (let i in eachDay) {
        switch (eachDay[i]) {
          case '0':
            this.showWeekTemp += 'Sunday/';
            break;
          case '1':
            this.showWeekTemp += 'Monday/';
            break;
          case '2':
            this.showWeekTemp += 'Tuesday/';
            break;
          case '3':
            this.showWeekTemp += 'Wednesday/';
            break;
          case '4':
            this.showWeekTemp += 'Thursday/';
            break;
          case '5':
            this.showWeekTemp += 'Friday/';
            break;
          case '6':
            this.showWeekTemp += 'Saturday/';
            break;
        }
        for (let k in this.weekArray) {
          if (this.weekArray[k].key == eachDay[i]) {
            this.weekArray[k].isSelected = true;
          }
        }
      }
      this.showWeekTemp = this.showWeekTemp.substring(0, this.showWeekTemp.length - 1);
      this.weekDays = data.day;
    }
    if (data.arrived) {  //每天最晚打卡时间
      let hour: string = (Math.floor(data.arrived / 3600)) < 10 ?
        '0' + (Math.floor(data.arrived / 3600)).toString() : (Math.floor(data.arrived / 3600)).toString();
      let minute: string = (Math.floor(data.arrived % 3600) / 60) < 10 ?
        '0' + (Math.floor(data.arrived % 3600) / 60).toString() : (Math.floor(data.arrived % 3600) / 60).toString();
      this.arriveTime = this.defaultTemplate + hour + ':' + minute;
      this.defaultArriveData.hour = hour;
      this.defaultArriveData.minute = minute;
      this.arriveTimeNumber = data.arrived;
    }
    if (data.left) {  //每天最早下班时间
      let endHour: string = (Math.floor(data.left / 3600)) < 10 ?
        '0' + (Math.floor(data.left / 3600)).toString() : (Math.floor(data.left / 3600)).toString();
      let endHourMinute: string = (Math.floor(data.left % 3600) / 60) < 10 ?
        '0' + (Math.floor(data.left % 3600) / 60).toString() : (Math.floor(data.left % 3600) / 60).toString();
      this.leftTime = this.defaultTemplate + endHour + ':' + endHourMinute;
      this.defaultLeftData.hour = endHour;
      this.defaultLeftData.minute = endHourMinute;
      this.leftTimeNumber = data.left;
    }
    //旷工天数
    this.absenteeismCount = data.absenteeism;
  }


  /**
   * 选择公司工作天数
   */
  selectTheWorkDay(event: any, data: any) {
    event.stopPropagation();
    data.isSelected = !data.isSelected
  }


  /**
   * 确认显示
   */
  confirmDaySelect(event: any) {
    event.stopPropagation();
    this.weekDays = '';
    this.showWeekTemp = '';
    for (let i  in  this.weekArray) {
      if (this.weekArray[i].isSelected) {
        this.weekDays += this.weekArray[i].key + ',';
        this.showWeekTemp += this.weekArray[i].weekTemp + '/'
      }
    }
    this.showWeekTemp = this.showWeekTemp.substring(0, this.showWeekTemp.length - 1);
    this.weekDays = this.weekDays.substring(0, this.weekDays.length - 1);
  }


  /**
   * 点击input显示日历
   * @param event
   * @param param
   */
  onClickSelectInput(event: any, param: string) {
    event.stopPropagation();
    if (param === 'arrive') {
      // this.isShowArriveCalendar = !this.isShowArriveCalendar;
      // this.isShowLeaveCalendar = false;
      this.arriveCalendarData = {
        isShow:true,
        titleTop: 'Hour',
        titleBottom: 'Minute',
        isHourMinute: true,
        topValue: this.defaultArriveData.hour,
        bottomValue: this.defaultArriveData.minute,
        topKeyName: 'hour',
        bottomKeyName: "minute"
      }
    } else if (param === 'leave') {
      // this.isShowLeaveCalendar = !this.isShowLeaveCalendar;
      // this.isShowArriveCalendar = false;
      this.leaveCalendarData = {
        isShow:true,
        titleTop: 'Hour',
        titleBottom: 'Minute',
        isHourMinute: true,
        topValue: this.defaultLeftData.hour,
        bottomValue: this.defaultLeftData.minute,
        topKeyName: 'hour',
        bottomKeyName: "minute"
      }
    }
  }


  /**
   * 日历回调数据
   */
  getSelectData(event: any, param: string) {
    let hour: string;
    if (event.hour < 10) {
      hour = '0' + event.hour;
    } else {
      hour = event.hour;
    }
    let minute: string;
    if (event.minute < 10) {
      minute = '0' + event.minute;
    } else {
      minute = event.minute;
    }
    if (param === 'arrive') {
      this.defaultArriveData.hour = hour;
      this.defaultArriveData.minute = minute;
      this.arriveTime = this.defaultTemplate + hour + ':' + minute;
      this.arriveTimeNumber = event.hour * 3600 + event.minute * 60;
      // this.isShowArriveCalendar = false;
    } else if (param === 'leave') {
      this.defaultLeftData.hour = hour;
      this.defaultLeftData.minute = minute;
      this.leftTime = this.defaultTemplate + hour + ':' + minute;
      this.leftTimeNumber = event.hour * 3600 + event.minute * 60;
      // this.isShowLeaveCalendar = false;
    }
  }


  /**
   * 提交公司工作时间
   */
  submitWorkTime() {
    if (this.isFirstSet) {  //第一次设置
      let data = {
        day: this.weekDays,
        arrived: this.arriveTimeNumber,
        left: this.leftTimeNumber,
        absenteeism: this.absenteeismCount
      };
      this.userModelService.createWorKTime({data}, (res: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
      })
    } else {  //修改
      let data = {
        day: this.weekDays,
        arrived: this.arriveTimeNumber,
        left: this.leftTimeNumber,
        absenteeism: this.absenteeismCount,
        id: this.settingId
      };
      this.userModelService.updateWorKTime({data}, (res: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
      })

    }


  }
}