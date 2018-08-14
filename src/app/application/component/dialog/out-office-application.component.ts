import {Component, Inject, OnInit, ViewEncapsulation, Input, ViewChild, Renderer} from '@angular/core';
import {CompanyModelService} from '../../shared/services/index.service';
import {UserModelService} from "../../../shared/services/model/user-model.service";
@Component({
  selector: 'out-office-application',
  templateUrl: '../../template/dialog/out-office-application.component.html',
  encapsulation: ViewEncapsulation.None
})

export class OutOfficeApplicationComponent implements OnInit {

  public multiCalendar: any = {};
  private outOfficeData: any;
  public selectDate: any;
  public startTemplate: string = this.translate.manualTranslate('select start time');
  public endTemplate: string = this.translate.manualTranslate('select end time');
  private attendanceMsg: string = '';
  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDatePeriod: false,
    }
  };
  private isShowtimeError: boolean;
  public hasTime: boolean = false;
  private selectDateError: string;

  public isShowCalendar: boolean = false;
  private isCalendar: string = '';
  @ViewChild('calendarProfile') private calendarProfile: any;

  constructor(public userModelService: UserModelService,
              public renderer:Renderer,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,) {

  }

  ngOnInit() {
    this.outOfficeData = {
      start: '',
      end: '',
    };
  }

  @Input() setOption(data: any) {
    this.isShowtimeError = false;
  }

  /**
   * 点击显示日历
   */
  showCalendar(event: any, param: string) {
    event.stopPropagation();
    this.isShowCalendar = !this.isShowCalendar;
    if(this.isCalendar !== param) {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? param : '';
    this.multiCalendar = {
      isBidding: true,
      isClickStart: param === 'start',
      isClickEnd: param === 'end',
      data: this.outOfficeData,
      dateTemplate: this.dateTemplate,
      isShow: true,
      isFixed: true,
      parentElement: event,
      currentShowElement: this.calendarProfile.nativeElement
    }
  }

  /**
   * 日历回传时间
   * @param data
   */
  getSelectData(data: any) {
    this.selectDate = data;
    this.dateService.formatCalendarData(this.selectDate);
    this.dateTemplate.start.isShowDateTime = this.selectDate.startDate.year === '' ? false : true;
    this.dateTemplate.end.isShowDateTime = this.selectDate.endDate.year === '' ? false : true;
    this.selectDate.startDate.monthString = this.dateService.format(this.selectDate.startDate.formatDateString, 'mmmm');
    this.selectDate.startDate.dayString = this.dateService.formatWithTimezone(this.selectDate.startDate.formatDateString, 'ddS');
    this.selectDate.endDate.monthString = this.dateService.format(this.selectDate.endDate.formatDateString, 'mmmm');
    this.selectDate.endDate.dayString = this.dateService.formatWithTimezone(this.selectDate.endDate.formatDateString, 'ddS');
    this.outOfficeData.start = this.selectDate.startDate.formatUtcString;
    this.outOfficeData.end = this.selectDate.endDate.formatUtcString;
    let a: any = this.selectDate.startDate;
    let b: any = this.selectDate.endDate;
    this.startTemplate = this.dateTemplate.start.isShowDateTime ? a.hour + ':' + a.minute + ' ' + a.dayString + ' ' + a.monthString + ' ' + a.year : 'select start time';
    this.endTemplate = this.dateTemplate.end.isShowDateTime ? b.hour + ':' + b.minute + ' ' + b.dayString + ' ' + b.monthString + ' ' + b.year : 'select end time';
    this.hasTime = true;
  }


  /**
   *发送attendance申请
   */
  sendAttendanceApplication() {
    if (this.outOfficeData.start == '' || this.outOfficeData.end == '') {
      this.selectDateError='select time is error!';
      this.isShowtimeError = true;
      return false;
      // this.dialogService.openWarning({
      //   simpleContent: 'select time is error!',
      // })
    } else {
      let data: any = {
        start: this.outOfficeData.start,
        end: this.outOfficeData.end,
        message: this.attendanceMsg
      };
      this.userModelService.outOffice({data}, (res: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
      })
    }
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}