import {Component, Input, OnInit, Inject, ViewChild, Renderer} from '@angular/core';
import {UserModelService} from "../../shared/services/model/user-model.service";

@Component({
  selector: 'add-national-holiday',
  templateUrl: '../template/add-national-holiday.component.html'
})

export class AddNationalHolidayComponent implements OnInit {

  private holidayName: string = '';
  private isShowCalendar: boolean = false;
  public dateFormat: string = 'yyyy-mm-dd';
  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDateTime: true,
    }
  };
  private multiCalendar: any = {};
  private addNationalHolidayData: {start: string; end: string};
  private selectDate: any = {};
  public startTemplate: string = this.translate.manualTranslate('select start time');
  public endTemplate: string = this.translate.manualTranslate('select end time');
  private startDate: string;
  private endDate: string;
  private insteadArr: Array<any> = [];
  private isEditModel: boolean;
  private eidtId: any;
  public hasTime: boolean = false;

  @ViewChild('calendarProfile') private calendarProfile: any;
  private isCalendar: string = '';


  constructor(public userModelService: UserModelService,
              public renderer: Renderer,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('date.service') public dateService: any) {
  }

  ngOnInit() {
    this.multiCalendar = {
      isBidding: true,
      data: this.addNationalHolidayData,
      dateTemplate: this.dateTemplate,
    }
  }

  @Input() set setOption(data: any) {
    if (data) {
      if (data.type == 'update') {
        this.isEditModel = true;
        this.eidtId = data.data.id;
        this.showEditNationalHolidayData(data)
      } else {
        this.isEditModel = false;
        this.clearDialogInfo();
      }
    }
  }


  /**
   * 编辑时候显示数据
   */
  showEditNationalHolidayData(data: any) {
    this.holidayName = data.data.name;
    this.startTemplate = data.data.startTemplate;
    this.endTemplate = data.data.endTemplate;
    this.hasTime = true;
    this.selectDate.start = data.data.start;
    this.selectDate.end = data.data.end;
    this.insteadArr = [];
    for (let i in data.data.instead) {
      let replaceDay: any = {
        calendarOption: {
          selected: data.data.instead[i]
        },
        selectedDateIn: data.data.instead[i],
        found_date: ''
      };
      this.insteadArr.push(replaceDay)
    }
    for (let i in data.data.insteadFormat) {
      this.insteadArr[i].found_date = data.data.insteadFormat[i];
    }
    this.addNationalHolidayData = {
      start: data.data.start,
      end: data.data.end,
    };
    this.multiCalendar = {
      isBidding: true,
      data: this.addNationalHolidayData,
      dateTemplate: this.dateTemplate,
    };
  }


  /**
   * 清除彈框內容
   */
  clearDialogInfo() {
    this.addNationalHolidayData = {
      start: '',
      end: '',
    };
    this.multiCalendar = {
      isBidding: true,
      data: this.addNationalHolidayData,
      dateTemplate: this.dateTemplate,
    };
    this.insteadArr = [];
    this.startTemplate = this.translate.manualTranslate('select start time');
    this.endTemplate = this.translate.manualTranslate('select end time');
    this.hasTime = false;
    this.holidayName = '';
  }


  /**
   * 点击显示日历
   */
  showCalendar(event: any, param: string) {
    event.stopPropagation();
    this.isShowCalendar = !this.isShowCalendar;
    if (this.isCalendar !== param) {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? param : '';
    this.multiCalendar = {
      isBidding: true,
      data: this.addNationalHolidayData,
      dateTemplate: this.dateTemplate,
      isClickStart: (param === 'start'),
      isClickEnd: (param === 'end'),
      parentElement: event,
      isFixed: true,
      currentShowElement: this.calendarProfile.nativeElement
    };
  }

  /**
   * 日历回调时间
   * @param event
   */
  getSelectData(event: any) {
    if (event && event.startDate && event.startDate.startTimeStamp) {
      let start = new Date(event.startDate.startTimeStamp);
      this.startDate = this.dateService.formatWithTimezone(start.toUTCString(), this.dateFormat);
      this.startTemplate = this.dateService.formatLocal(this.startDate, 'ddS') + " " +
        this.dateService.formatLocal(this.startDate, 'mmm') + " " +
        this.dateService.formatLocal(this.startDate, 'yyyy');
      this.hasTime = true;
      let month: any;
      if (event.startDate.month < 9) {
        month = '0' + (event.startDate.month + 1);
      } else {
        month = event.startDate.month + 1;
      }
      this.selectDate.start = event.startDate.year + '-' + month + '-' + event.startDate.monthDay;
    }
    if (event && event.endDate && event.endDate.endTimeStamp) {
      let end = new Date(event.endDate.endTimeStamp);
      this.endDate = this.dateService.formatWithTimezone(end.toUTCString(), this.dateFormat);
      this.endTemplate = this.dateService.formatLocal(this.endDate, 'ddS') + " " +
        this.dateService.formatLocal(this.endDate, 'mmm') + " " +
        this.dateService.formatLocal(this.endDate, 'yyyy');
      this.hasTime = true;
      let month: any;
      if (event.endDate.month < 9) {
        month = '0' + (event.endDate.month + 1);
      } else {
        month = event.endDate.month + 1;
      }
      this.selectDate.end = event.endDate.year + '-' + month + '-' + event.endDate.monthDay;
      this.isShowCalendar = false;
    }
  }

  /**
   * 添加补班的天数
   */
  addReplaceDay(event: any) {
    event.stopPropagation();
    let replaceDay: any = {
      calendarOption: {},
      found_date: ''
    };
    this.insteadArr.push(replaceDay);
  }


  /**
   * 显示替换天的日历
   */
  showReplaceCalendar(data: any, event: any) {
    event.stopPropagation();
    data.isShowCalendar = !data.isShowCalendar;
  }


  /**
   * 选择补班的日期
   */
  selectReplaceDate(dateObj: any, data: any) {
    data.isShowCalendar = false;
    let formatDateForm: string = 'yyyy-mm-dd HH:MM:ss';
    data.calendarOption = dateObj;
    data.calendarOption.selected = data.calendarOption.year + '-' + (data.calendarOption.month + 1) + '-' + data.calendarOption.monthDay;
    data.calendarOption.formatDateString = data.calendarOption.year + '-' + (data.calendarOption.month + 1) + '-' + data.calendarOption.monthDay + ' '
      + data.calendarOption.hour + ':' + data.calendarOption.minute + ':' + data.calendarOption.minute;
    data.calendarOption.formatUtcString = this.dateService.utcDateFormat(data.calendarOption.formatDateString, formatDateForm);
    data.calendarOption.dayString = this.dateService.format(data.calendarOption.formatDateString, 'ddS');
    data.found_date = this.dateService.formatLocal(data.calendarOption.formatUtcString, 'ddS') + " " +
      this.dateService.formatLocal(data.calendarOption.formatUtcString, 'mmm') + " " +
      this.dateService.formatLocal(data.calendarOption.formatUtcString, 'yyyy');
    data.selectedDateIn = dateObj.selected;
  }

  /**
   * 删除替换的天数
   */
  deleteReplaceDate(index: any) {
    this.insteadArr.splice(index, 1);
  }


  //添加国家法定假日

  addOrUpdateNationalHoliday() {
    if (this.isEditModel) {
      // updateNationalHoliday
      let instead: Array<any> = [];
      for (let i in this.insteadArr) {
        instead.push(this.insteadArr[i].selectedDateIn)
      }
      let data: any = {
        id: this.eidtId,
        name: this.holidayName,
        start: this.selectDate.start,
        end: this.selectDate.end,
        instead: instead
      };
      this.userModelService.updateNationalHoliday({data}, (res: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: res
        });
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_UPDATE_NATIONAL_HOLIDAY,
          });
        } else {
          this.dialogService.openWarning({simpleContent: 'update national holiday failed!'})
        }
      })
    } else {
      let instead: Array<any> = [];
      for (let i in this.insteadArr) {
        instead.push(this.insteadArr[i].selectedDateIn)
      }
      let data: any = {
        name: this.holidayName,
        start: this.selectDate.start,
        end: this.selectDate.end,
        instead: instead
      };
      this.userModelService.createNationalHoliday({data}, (res: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: res
        });
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_UPDATE_NATIONAL_HOLIDAY,
          });
        } else {
          this.dialogService.openWarning({simpleContent: 'add national holiday failed!'})
        }
      })
    }

  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}