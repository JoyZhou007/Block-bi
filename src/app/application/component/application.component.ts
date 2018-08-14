import {Component, Inject, OnInit, ViewEncapsulation, Input} from '@angular/core';
import {CompanyModelService} from '../../shared/services/index.service';
import {Subscription} from "rxjs";
import {UserModelService} from "../../shared/services/model/user-model.service";
import * as ApplicationConst from "../../shared/config/application.config";

@Component({
  selector: 'application',
  templateUrl: '../template/application.component.html',
  styleUrls: ['../../../assets/css/application/application.css'],
  encapsulation: ViewEncapsulation.None
})

export class ApplicationComponent implements OnInit {

  // private applicationData: any = {};
  private attendanceData: any = {};
  // private vacationData: any = {};
  private workHourData: any = {};
  private isHasLastLeaveData: boolean = false;
  private workDayString: string;
  private everyDayStart: string;
  private everyDayEnd: string;
  public attendanceList: Array<any> = [];
  private hasFetchList: boolean = false;
  public vacationData: {
    type: string,
    dateDiff: string;
    startTime: string,
    endTime: string,
    status: number
  } = {
    type: '',
    dateDiff: '',
    startTime: '',
    endTime: '',
    status: 0
  };
  private vacationCounters: number = 1;
  //剩余的年假
  private restVacation: number = 0;
  //显示天数
  private vacationObj: any = {};
  private hasInit: boolean = false;
  public showVacationDetail: boolean = false;
  //显示vacation table具体时间
  public tplVacationTimeList: Array<any> = [];
  private workDayHourLength: number = 0;
  public replaceDate: string = '';
  private hasCid: boolean = false;
  private showVacationError: any = {};
  //下个假期
  public nextHoliday: {
    start: string,
    end: string,
    name: string
  } = {
    start: '',
    end: '',
    name: ''
  };

  @Input() public isCeo;

  public isShowAttendance: boolean = true;
  public isShowVacation: boolean = false;
  public isShowResignation: boolean = false;


  constructor(public userModelService: UserModelService,
              @Inject('app.config') public config: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,) {

  }

  ngOnInit() {
    this.getApplicationData();
    if (this.companyDataService.getCurrentCompanyCID() != '') {
      this.hasCid = true;
    } else {
      this.hasCid = false;
    }
  }

  /**
   * 从api获取application数据
   */
  getApplicationData() {
    this.userModelService.companyAttention({}, (res: any) => {
      if (res.status === 1) {
        this.attendanceData = res.data.attendance;
        // let vacationData = res.data.vacation;
        this.workHourData = res.data.work_hours;
        this.isHasLastLeaveData = this.attendanceData.last_out_office.length !== 0;
        this.formatDate(this.attendanceData.last_out_office, 2);
        this.getWorkTime(this.attendanceData.work_time);
        if (res.data && res.data.hasOwnProperty('vacation')) {
          this.buildVacationData(res.data.vacation);
        }
      }
    })
  }

  /**
   * 格式化时间
   */
  formatDate(data: any, type: number) {
    if (type == 1) {
      let startDate = data.arrived;
      let startDayTime = this.dateService.formatLocal(startDate, 'ddS');
      let startMonthTime = this.dateService.formatLocal(startDate, 'mmm');
      let startHourTime = this.dateService.formatLocal(startDate, 'HH');
      let startMinuteTime = this.dateService.formatLocal(startDate, 'MM');
      data.formatArrivedTime = {
        monthDay: startDayTime,
        stringMonth: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
      };
      let leaveDate = data.left;
      let leaveDayTime = this.dateService.formatLocal(leaveDate, 'ddS');
      let leaveMonthTime = this.dateService.formatLocal(leaveDate, 'mmm');
      let leaveHourTime = this.dateService.formatLocal(leaveDate, 'HH');
      let leaveMinuteTime = this.dateService.formatLocal(leaveDate, 'MM');
      data.formatLeaveTime = {
        monthDay: leaveDayTime,
        stringMonth: leaveMonthTime,
        minute: leaveMinuteTime,
        hour: leaveHourTime,
      };
    } else {
      let startDate = data.start;
      let startDayTime = this.dateService.formatWithTimezone(startDate, 'ddS');
      let startMonthTime = this.dateService.formatWithTimezone(startDate, 'mmm');
      let startHourTime = this.dateService.format(startDate, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(startDate, 'MM');
      data.formatStartDate = {
        monthDay: startDayTime,
        stringMonth: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
      };
    }
  }

  /**
   * 获取每天工作时间
   */
  getWorkTime(data: any) {
    //计算每周上班天数
    if (data.hasOwnProperty('day') && data.day) {
      let workStartHour = Math.floor(data.arrived_offset / 3600);
      let workEndHour = Math.floor(data.left_offset / 3600);
      this.workDayHourLength = workEndHour - workStartHour;

      let eachDay: any = data.day.split(',');
      let workDayString: string = '';
      for (let i in eachDay) {
        switch (eachDay[i]) {
          case '0':
            workDayString += 'Sun/';
            break;
          case '1':
            workDayString += 'Mon/';
            break;
          case '2':
            workDayString += 'Tue/';
            break;
          case '3':
            workDayString += 'Wen/';
            break;
          case '4':
            workDayString += 'Thu/';
            break;
          case '5':
            workDayString += 'Fri/';
            break;
          case '6':
            workDayString += 'Sat/';
            break;
        }
      }
      this.workDayString = workDayString.substring(0, workDayString.length - 1);
      //计算每天上班时间和下班时间
      // arrived_offset
      let hour: string = Math.floor(data.arrived_offset / 3600) < 10 ?
        '0' + (Math.floor(data.arrived_offset / 3600)).toString() : (Math.floor(data.arrived_offset / 3600)).toString();
      let minute: string = (Math.floor(data.arrived_offset % 3600) / 60) < 10 ?
        '0' + (Math.floor(data.arrived_offset % 3600) / 60).toString() : (Math.floor(data.arrived_offset % 3600) / 60).toString();
      this.everyDayStart = hour + ':' + minute;
      //  left_offset
      let endHour: string = Math.floor(data.left_offset / 3600) < 10 ?
        '0' + (Math.floor(data.left_offset / 3600)).toString() : (Math.floor(data.left_offset / 3600)).toString();
      let endHourMinute: string = (Math.floor(data.left_offset % 3600) / 60) < 10 ?
        '0' + (Math.floor(data.left_offset % 3600) / 60).toString() : (Math.floor(data.left_offset % 3600) / 60).toString();
      this.everyDayEnd = endHour + ':' + endHourMinute;
    }
  }


  /**
   * 鼠标enter请假历史列表
   */
  getAttendanceList() {
    if (!this.hasFetchList) {
      this.userModelService.attentionList({}, (res: any) => {
        if (res.status === 1) {
          for (let i in res.data) {
            this.attendanceList = res.data;
            this.formatDate(res.data[i], 1);
          }
        }
        this.hasFetchList = true;
      })
    }
  }


  /**
   * 点击加号 vacation
   * @param event
   */
  onAddVacationApplication(event: MouseEvent) {
    if (!this.hasCid) {
      return false;
    }
    if (event) {
      event.stopPropagation();
    }
    this.dialogService.openNew({
      mode: '1',
      title: 'LEAVE APPLICATION',
      isSimpleContent: false,
      componentSelector: 'vacation-usage-dialog',
      componentData: {attendanceData: this.attendanceData},
      buttons: [{
        type: 'send',
        btnEvent: 'sendData',
      }, {
        type: 'cancel',
      }]
    });
  }


  /**
   * 点击attendance加号
   * @param event
   */
  addAttendance(event: any) {
    if (!this.hasCid) {
      return false;
    }
    event.stopPropagation();
    this.dialogService.openNew({
      mode: '1',
      title: 'OUT OFFICE APPLICATION',
      isSimpleContent: false,
      componentSelector: 'out-office-application',
      componentData: {},
      buttons: [{
        type: 'send',
        btnEvent: 'sendAttendanceApplication',
      }, {
        type: 'cancel'
      }]
    });
  }

  private buildVacationData(vacation: any) {
    if (vacation.hasOwnProperty('last_leave')) {
      let lastLeave = vacation.last_leave;
      let startTime = lastLeave.start;
      let endTime = lastLeave.end;
      let type = lastLeave.type;
      this.vacationData.status = lastLeave.status;
      this.vacationData.startTime = this.dateService.formatWithTimezone(startTime, 'HH ddS mmm yyyy');
      this.vacationData.endTime = this.dateService.formatWithTimezone(endTime, 'HH ddS mmm yyyy');
      this.vacationData.dateDiff = `${this.dateDiff(endTime, startTime).gapTime} ${this.dateDiff(endTime, startTime).diffUnit}`;
      switch (type) {
        case ApplicationConst.CASUAL_LEAVE:
          this.vacationData.type = 'casual';
          break;
        case ApplicationConst.SICK_LEAVE:
          this.vacationData.type = 'sick';
          break;
        case ApplicationConst.MARITAL_LEAVE:
          this.vacationData.type = 'marital';
          break;
        case ApplicationConst.MATERNITY_LEAVE:
          this.vacationData.type = 'maternity';
          break;
        case ApplicationConst.ANNUAL_LEAVE:
          this.vacationData.type = 'annual';
          break;
      }
      this.showVacationError.show = false;
    }
    if (vacation.hasOwnProperty('replace')) {
      let arr = [];
      vacation.replace.forEach((value) => {
        arr.push(this.dateService.formatLocal(value, 'ddS mmm yyyy'))
      });
      this.replaceDate = arr.join('/');
    }

    if (vacation.hasOwnProperty('holiday')) {
      this.nextHoliday.start = this.dateService.format(vacation.holiday.start, 'ddS mmm yyyy');
      this.nextHoliday.end = this.dateService.format(vacation.holiday.end, 'ddS mmm yyyy');
      this.nextHoliday.name = vacation.holiday.name;
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
        diffUnit = 'minute';
        gapTime = gapTime / 60;
        break;
      case 'hour':
        diffUnit = 'hour';
        gapTime = gapTime / (24 * 3600 * 30);
        break;
      case 'month':
        let d1Y = D1.getFullYear();
        let d2Y = D2.getFullYear();
        let d1M = D1.getMonth();
        let d2M = D2.getMonth();
        diffUnit = 'month';
        gapTime = (d2M + 12 * d2Y) - ( d1M + 12 * d1Y);
        break;
      case 'year':
        diffUnit = 'year';
        gapTime = D2.getFullYear() - D1.getFullYear();
        break;
      case 'day':
      default:
        diffUnit = 'day';
        gapTime = gapTime / (24 * 3600);
        break;
    }
    let gapTimeStr = Math.ceil(gapTime);
    return {
      gapTime: gapTimeStr.toString() !== 'NaN' ? gapTimeStr : -1,
      diffUnit: diffUnit
    }
  };


  public getVacationList(){
    event.stopPropagation();
    if (this.vacationCounters <= 1) {
      this.userModelService.vacationList({}, (response: any) => {
        if (response.status === 1) {
          this.vacationCounters++;
          let obj = response.data;
          if (obj.hasOwnProperty('rest_vacation')) {
            this.restVacation = obj.rest_vacation;
          }
          if (obj.hasOwnProperty('vacation')) {
            this.vacationObj = obj.vacation;
          }
          if (obj.hasOwnProperty('vacation_usage')) {
            this.buildVacationTimeList(obj.vacation_usage);
          }

          this.hasInit = true;
        }
      });
    }

  }

  /**
   * 点击展开详情
   * @param {MouseEvent} event
   */
  public clickShowVacationDetail(event: MouseEvent): void {
    event.stopPropagation();
    this.showVacationDetail = !this.showVacationDetail;
  }


  private buildVacationTimeList(vacation_usage: any) {
    let maxLength = 0;
    //获取最长的数组长度
    for (let k in vacation_usage) {
      if (vacation_usage[k].length) {
      }
      maxLength = maxLength >= vacation_usage[k].length ? maxLength : vacation_usage[k].length;
    }
    this.tplVacationTimeList = [];
    for (let i = 0; i < maxLength; i++) {
      let obj = {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {}
      };
      if (vacation_usage.hasOwnProperty(1)) {
        if (vacation_usage[1].hasOwnProperty(i)) {
          obj[1] = {
            isExist: true,
            start: this.dateService.formatWithTimezone(vacation_usage[1][i].start, 'HH:MM ddS mmm yyyy'),
            end: this.dateService.formatWithTimezone(vacation_usage[1][i].end, 'HH:MM ddS mmm yyyy'),
          }
        } else {
          obj[1] = {
            isExist: false,
            start: '',
            end: '',
          }
        }
      }

      if (vacation_usage.hasOwnProperty(2)) {
        if (vacation_usage[2].hasOwnProperty(i)) {
          obj[2] = {
            isExist: true,
            start: this.dateService.formatWithTimezone(vacation_usage[2][i].start, 'HH:MM ddS mmm yyyy'),
            end: this.dateService.formatWithTimezone(vacation_usage[2][i].end, 'HH:MM ddS mmm yyyy'),
          }
        } else {
          obj[2] = {
            isExist: false,
            start: '',
            end: '',
          }
        }
      }

      if (vacation_usage.hasOwnProperty(3)) {
        if (vacation_usage[3].hasOwnProperty(i)) {
          obj[3] = {
            isExist: true,
            start: this.dateService.formatWithTimezone(vacation_usage[3][i].start, 'HH:MM ddS mmm yyyy'),
            end: this.dateService.formatWithTimezone(vacation_usage[3][i].end, 'HH:MM ddS mmm yyyy'),
          }
        } else {
          obj[3] = {
            isExist: false,
            start: '',
            end: '',
          }
        }
      }

      if (vacation_usage.hasOwnProperty(4)) {
        if (vacation_usage[4].hasOwnProperty(i)) {
          obj[4] = {
            isExist: true,
            start: this.dateService.formatWithTimezone(vacation_usage[4][i].start, 'HH:MM ddS mmm yyyy'),
            end: this.dateService.formatWithTimezone(vacation_usage[4][i].end, 'HH:MM ddS mmm yyyy'),
          }
        } else {
          obj[4] = {
            isExist: false,
            start: '',
            end: '',
          }
        }
      }

      if (vacation_usage.hasOwnProperty(5)) {
        if (vacation_usage[5].hasOwnProperty(i)) {
          obj[5] = {
            isExist: true,
            start: this.dateService.formatWithTimezone(vacation_usage[5][i].start, 'HH:MM ddS mmm yyyy'),
            end: this.dateService.formatWithTimezone(vacation_usage[5][i].end, 'HH:MM ddS mmm yyyy'),
          }
        } else {
          obj[5] = {
            isExist: false,
            start: '',
            end: '',
          }
        }
      }
      this.tplVacationTimeList.push(obj);
    }
  }

  /**
   * 点击申请辞职
   * @param {MouseEvent} event
   */
  public clickApplyResignation(event: MouseEvent) {
    if (!this.isCeo) {
      if (!this.hasCid) {
        return false;
      }
      event.stopPropagation();
      this.dialogService.openNew({
        mode: '1',
        title: 'RESIGNATION APPLICATION',
        isSimpleContent: false,
        componentSelector: 'resignation-application-dialog',
        componentData: {},
        buttons: [{
          type: 'send',
          btnEvent: 'sendData',
        }, {
          type: 'cancel',
        }]
      });
    }

  }

  onClickTab(type: string, event: any){
    if(event){
      event.stopPropagation();
    }
    if(type == 'attendance'){
      this.isShowAttendance = true;
      this.isShowVacation = false;
      this.isShowResignation = false;
    }else if(type == 'vacation'){
      this.isShowAttendance = false;
      this.isShowVacation = true;
      this.isShowResignation = false;
      this.getVacationList()
    }else if(type == 'resignation'){
      this.isShowAttendance = false;
      this.isShowVacation = false;
      this.isShowResignation = true;
    }
  }
}