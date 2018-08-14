/**
 * Created by joyz on 2017/8/7.
 */
import { Component, Inject, Input, OnInit, Renderer, ViewChild } from "@angular/core";
import { DropdownSettings } from "../../../dropdown/dropdown-setting";
import { DropdownOptionModel } from "../../../dropdown/dropdown-element";
import { UserModelService } from "../../../shared/services/model/user-model.service";

@Component({
  selector: 'vacation-usage-dialog',
  templateUrl: '../../template/dialog/vacation-usage-dialog.html',
})

export class VacationUsageDialogComponent implements OnInit {
  public typeList: Array<{
    id: number,
    label: string,
    rest: number
  }> = [];

  public multiCalendar: any = {};
  // private isShowCalendar: boolean = false;
  private outCalendarData: any = {};
  public selectDate: any;
  public startTemplate: string = this.translate.manualTranslate('select start time');
  public endTemplate: string = this.translate.manualTranslate('select end time');
  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDatePeriod: false,
    }
  };
  public currentType: { id: number; label: string, rest: number } = {
    id: 1,
    label: 'Casual leave',
    rest: 0
  };
  public showTypeSelect: boolean = false;
  public hasInit: boolean = false;
  public date_error: any = {};
  private workTimePeriod: any [] = [];
  private workStartHour: number = 0;
  private workEndHour: number = 0;
  private holidayHour: number;
  private realHoliday: number = 0;
  public message: string = '';
  public dataError: any = {};
  public hasTime: boolean = false;

  public isShowCalendar: boolean = false;
  private isCalendar: string = '';
  @ViewChild('calendarProfile') private calendarProfile: any;



  constructor(private renderer: Renderer,
              public userModelService: UserModelService,
              @Inject('bi-translate.service') public translate: any,
              @Inject('notification.service') public notificationService:any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              @Inject('page.element') public element: any,) {
  }

  @Input('setOption')
  public set setOption(data: any) {
    this.resetData();
    if (data.attendanceData.hasOwnProperty('work_time')) {
      let workTime = data.attendanceData.work_time;
      if (workTime.hasOwnProperty('day')) {
        this.workTimePeriod = workTime.day.split(',');
        this.workTimePeriod.forEach((value, index, array) => {
          value = parseInt(value);
        });
        this.workStartHour = Math.floor(workTime.arrived_offset / 3600);
        this.workEndHour = Math.floor(workTime.left_offset / 3600);
        this.remainingVacationDays();
      } else {
        this.dataError.show = true;
        this.dataError.text = 'server has error.';
      }
    } else {
      this.dataError.show = true;
      this.dataError.text = 'server has error.';

    }


  }

  ngOnInit(): void {
    this.outCalendarData = {
      start: '',
      end: '',
    };

    this.typeList = [{
      id: 1,
      label: 'Casual leave',
      rest: 0
    }, {
      id: 2,
      label: 'Sick leave',
      rest: 0
    }, {
      id: 3,
      label: 'Marital leave',
      rest: 0
    }, {
      id: 4,
      label: 'Maternity leave',
      rest: 0
    }, {
      id: 5,
      label: 'Annual leave',
      rest: 0
    },];

  }


  /**
   * 点击显示日历
   */
  showCalendar(event: any, param: string) {
    event.stopPropagation();
    if(/g-readonly-input/.test(event.target.className)) {
      return false;
    }

    let now = new Date().setHours(this.workStartHour);
    this.dateService.format(now);
    this.isShowCalendar = !this.isShowCalendar;
    if(this.isCalendar !== param) {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? param : '';
    if (this.checkRestDay()) {
      this.multiCalendar = {
        isBidding: true,
        isClickStart: param === 'start',
        isClickEnd: param === 'end',
        data: this.outCalendarData,
        dateTemplate: this.dateTemplate,
        noMinute: true,
        hourRange: {
          start: this.workStartHour,
          end: this.workEndHour
        },
        workTimePeriod: this.workTimePeriod,
        isShow: true,
        isFixed: true,
        parentElement: event,
        currentShowElement: this.calendarProfile.nativeElement
      }
    }
  }




  getSelectData(data: any) {
    this.selectDate = data;
    this.dateService.formatCalendarData(this.selectDate);
    this.dateTemplate.start.isShowDateTime = this.selectDate.startDate.year !== '';
    this.dateTemplate.end.isShowDateTime = this.selectDate.endDate.year !== '';
    this.selectDate.startDate.monthString = this.dateService.format(this.selectDate.startDate.formatDateString, 'mmmm');
    this.selectDate.startDate.dayString = this.dateService.formatWithTimezone(this.selectDate.startDate.formatUtcString, 'ddS');
    this.selectDate.endDate.monthString = this.dateService.format(this.selectDate.endDate.formatDateString, 'mmmm');
    this.selectDate.endDate.dayString = this.dateService.formatWithTimezone(this.selectDate.endDate.formatUtcString, 'ddS');
    this.outCalendarData.start = this.selectDate.startDate.formatUtcString;
    this.outCalendarData.end = this.selectDate.endDate.formatUtcString;
    let a: any = this.selectDate.startDate;
    let b: any = this.selectDate.endDate;
    this.startTemplate = this.dateTemplate.start.isShowDateTime ? a.hour + ':' + a.minute + ' ' + a.dayString + ' ' + a.monthString + ' ' + a.year : 'select start time';
    this.endTemplate = this.dateTemplate.end.isShowDateTime ? b.hour + ':' + b.minute + ' ' + b.dayString + ' ' + b.monthString + ' ' + b.year : 'select end time';
    this.hasTime = true;
    if (this.checkDateValid()) {
      this.userModelService.checkContainNationalHoliday({
        data: {
          start: this.dateService.getTimeStamp(this.outCalendarData.start),
          end: this.dateService.getTimeStamp(this.outCalendarData.end),
        }
      }, (res: any) => {
        if (res.status === 1) {
          if (res.data.hasOwnProperty('has_holiday')) {
            let hasHoliday = res.data.has_holiday === 1;
            if (hasHoliday) {
              let days = res.data.day;
              this.realHoliday = this.holidayHour / 8 - days;
            } else {
              this.realHoliday = this.holidayHour / 8;
            }
          }
        } else {
          this.date_error.isShow = true;
          this.date_error.text = 'check nation holiday failed!';
        }
      })
    } else {

    }


  }

  /**
   * 点击选择type
   * @param {MouseEvent} event
   * @param item
   */
  public clickChooseType(event: MouseEvent, item: {
    id: number,
    label: string,
    rest: number
  }): void {
    event.stopPropagation();
    this.currentType = item;
    this.showTypeSelect = false;

    // this.resetCalendar();
    this.checkDateValid();
  }

  /**
   * 点击展开下拉菜单
   * @param {MouseEvent} event
   */
  public clickShowTypeList(event: MouseEvent): void {
    event.stopPropagation();
    this.showTypeSelect = !this.showTypeSelect;
    // this.isShowCalendar = false;
  }

  /**
   * 请求api 返回剩余的假期
   */
  private remainingVacationDays(): void {
    this.userModelService.vacationDays({}, (res: any) => {
      if (res.status === 1) {
        let obj = res.data;
        this.typeList.forEach((value, index, array) => {
          if (obj.hasOwnProperty(value.id)) {
            value.rest = obj[value.id];
          }
        });
        this.currentType = this.typeList[0];
        this.hasInit = true;
      }
    })
  }

  /**
   * 点击send
   * @returns {boolean}
   */
  sendData() {
    if (!(this.checkValid() && this.checkDateValid())) {
      return false;
    } else {
      let formData = {
        data: {
          type: this.currentType.id,
          hour: this.realHoliday * 8,
          start: this.outCalendarData.start,
          end: this.outCalendarData.end,
          message: this.message,
          rest: this.currentType.rest
        }
      };
      let result = false;
      this.userModelService.vacationUsage(formData, (res: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
        if (res.status === 1) {
          result = true;
        } else {
          this.date_error.isShow = true;
          this.date_error.text = res.message;
          result = false;
        }
      })
    }

  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;

    if (!this.dateBlur()) {
      result = false;
    }

    return result;
  }

  public dateBlur(): boolean {
    if (this.outCalendarData.start && this.outCalendarData.end) {
      this.date_error.isShow = false;
      return true;
    } else {
      this.date_error.isShow = true;
      this.date_error.text = 'date is required';
      return false;
    }
  }


  /**
   * 计算时间 查看时间是否爱合理时间段
   * @returns {boolean}
   */
  private checkDateValid(): boolean {
    let startTimestamp = this.dateService.getTimeStamp(this.outCalendarData.start);
    let endTimestamp = this.dateService.getTimeStamp(this.outCalendarData.end);
    let restTimeHours = (this.currentType.id === 1 || this.currentType.id === 2) ? -1 : this.currentType.rest * 8;
    let days = (endTimestamp - startTimestamp) / 1000 / 3600 / 24;

    if (this.isInt(days)) {

    } else {
      let fraction = (days - Math.floor(days));
      if (fraction < 0.5) {
        days = Math.floor(days) + 0.5;
      } else {
        days = Math.floor(days) + 1;
      }
    }
    this.holidayHour = days * 8;
    //没选日期
    if (this.outCalendarData.start === '' || this.outCalendarData.end === '') {
      this.date_error.isShow = false;
      return true;
    }
    if (restTimeHours === -1) {
      this.date_error.isShow = false;
      return true;
    } else if (restTimeHours >= this.holidayHour) {
      this.date_error.isShow = false;
      return true;
    } else {
      this.date_error.isShow = true;
      this.date_error.text = 'date is beyond your rest.';
      return false;
    }
  }

  /**
   * 判断是不是 int
   * @param x
   * @returns {boolean}
   */
  public isInt(x: any): boolean {
    return !isNaN(x) && eval(x).toString().length == parseInt(eval(x)).toString().length;
  }

  /**
   * 检查剩余的天数 小于4小时不可以点
   * @returns {boolean}
   */
  private checkRestDay(): boolean {
    if (this.currentType.id === 1 || this.currentType.id === 2) {
      return true;
    } else {
      return this.currentType.rest * 8 >= 4;
    }
  }

  /**
   * 重置calendar 数据
   */
  private resetCalendar() {
    this.startTemplate = this.translate.manualTranslate('select start time');
    this.endTemplate = this.translate.manualTranslate('select end time');
    this.hasTime = false;
    this.dateTemplate = {
      start: {
        isShowDateTime: true, //是否选择了时间
      },
      end: {
        isShowDatePeriod: false,
      }
    };

    this.outCalendarData = {
      start: '',
      end: '',
    };
    this.multiCalendar = {
      isShow: false
    }
  }


  /**
   * 重置数据
   */
  private resetData(): void {
    this.currentType = {
      id: 1,
      label: 'Casual leave',
      rest: 0
    };
    this.showTypeSelect = false;
    this.hasInit = false;
    this.date_error = {};
    this.message = '';
    this.dataError = {};
    this.realHoliday = 0;
    this.resetCalendar();
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}