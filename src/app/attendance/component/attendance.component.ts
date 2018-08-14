import {Component, Inject, OnInit, ViewChild, Renderer, HostListener} from '@angular/core';
import {UserModelService} from "../../shared/services/model/user-model.service";

@Component({
  selector: 'attendance',
  templateUrl: '../template/attendance.component.html',
  styleUrls: ['../../../assets/css/attendance/attendance.css']
})

export class AttendanceComponent implements OnInit {

  private nationalHolidayList: Array<any> = [];
  private subscription: any;
  private showAttendanceDate: string = '';
  private currentAttendanceLists: Array<any> = [];
  private isShowCalendar: boolean = false;
  private multiCalendar: any = {};
  private attendanceFilterData: {start: string; end: string};
  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDateTime: true,
    }
  };
  private startDateTemplate: any = {};
  private endDateTemplate: any = {};
  private searchText: string = '';

  @ViewChild('calendarProfile') public calendarProfile: any;
  private isCalendar: string = '';

  constructor(@Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              public renderer: Renderer,
              @Inject('notification.service') public notificationService: any,
              public userModelService: UserModelService) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }


  dealMessage(message) {
    if (message.act === this.notificationService.config.ACT_COMPONENT_UPDATE_NATIONAL_HOLIDAY) {
      this.fetchNationalHolidayList();
    }
  }

  ngOnInit() {
    this.fetchNationalHolidayList();
    this.getDefaultFilterDate();
  }


  //组件销毁时
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  click(event: any) {
    this.isShowCalendar = false;
  }

  /**
   * 获取默认显示fiter时间段
   */
  getDefaultFilterDate() {
    let today: any = new Date();
    let endDate: string = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let startDate: string = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + '01';
    //设置默认显示filter 开始时间结束时间 月初 -> 今天
    this.attendanceFilterData = {
      start: startDate,
      end: endDate
    };
    this.fetchStaffAttendanceList(this.attendanceFilterData);
    this.startDateTemplate = this.formatDate(this.attendanceFilterData.start);
    this.endDateTemplate = this.formatDate(this.attendanceFilterData.end);
  }


  /**
   * 获取考勤列表
   */
  fetchStaffAttendanceList(date: any) {
    this.currentAttendanceLists = [];
    let data: any = {
      filter: {
        start: date.start,
        end: date.end
      }
    }
    this.userModelService.showAttendance({data}, (res: any) => {
      if (res.status == 1) {
        for (let i in res.data) {
          res.data[i].detail = [];
          this.currentAttendanceLists.push(res.data[i]);
        }
      }
    });
  }


  /**
   * 点击显示员工考勤详情
   */
  showStaffAttendanceDetail(event: any, attendance: any) {
    event.stopPropagation();
    attendance.isShowAttendanceDetail = !attendance.isShowAttendanceDetail;
    if (attendance.isShowAttendanceDetail) {
      let data: any = {
        uid: attendance.uid,
        filter: {
          start: this.attendanceFilterData.start,
          end: this.attendanceFilterData.end
        }
      };
      this.userModelService.showAttendanceDetail({data}, (res: any) => {
        if (res.status == 1) {
          if (res.data.length) {
            attendance.detail = res.data;
          }
        } else {
          this.dialogService.openWarning({simpleContent: 'show staff attendance detail failed!'})
        }
      })
    }
  }


  /**
   * 获取法定假日列表
   */
  fetchNationalHolidayList() {
    this.userModelService.showNationalHoliday({}, (res: any) => {
      if (res.status === 1) {
        this.nationalHolidayList = [];
        for (let i in res.data) {
          this.formatNationalHolidayDate(res.data[i]);
          this.nationalHolidayList.push(res.data[i]);
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'fetch national holiday failed!'});
      }
    })
  }


  /**
   * 格式化时间 20th July 2016
   */
  formatNationalHolidayDate(data: any) {
    data.startTemplate = this.dateService.formatLocal(data.start, 'ddS') + " " +
      this.dateService.formatLocal(data.start, 'mmm') + " " +
      this.dateService.formatLocal(data.start, 'yyyy');
    data.endTemplate = this.dateService.formatLocal(data.end, 'ddS') + " " +
      this.dateService.formatLocal(data.end, 'mmm') + " " +
      this.dateService.formatLocal(data.end, 'yyyy');
    data.insteadFormat = [];
    for (let i in data.instead) {
      data.insteadFormat.push(
        this.dateService.formatLocal(data.instead[i], 'ddS') + " " +
        this.dateService.formatLocal(data.instead[i], 'mmm') + " " +
        this.dateService.formatLocal(data.instead[i], 'yyyy'))
    }
  }


  /**
   * 添加 national holiday
   * @param event
   * @param data
   */
  openNationalHolidayDialog(event: any, data?: any) {
    event.stopPropagation();
    let param: any = {};
    let type: string = 'send';
    if (data) {
      param.data = data;
      param.type = 'update';
      type = 'update';
    } else {
      param.type = 'add';
    }
    let settings = {
      mode: '1',
      title: 'SET NATIONAL HOLIDAY',
      isSimpleContent: false,
      componentSelector: 'add-national-holiday',
      componentData: param,
      buttons: [
        {type: 'cancel'},
        {type: type, btnEvent: 'addOrUpdateNationalHoliday'}
      ]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 返回的时间
   */
  singleCalendar(date: any) {
    this.fetchStaffAttendanceList(date);
  }

  /**
   * 设置工作时间
   */
  setWorkTime(event: MouseEvent) {
    event.stopPropagation();
    let settings = {
      mode: '2',
      titleAction: 'Set',
      titleComponent: 'Work time',
      titleIcon: 'font-setting di-password-setting',
      isSimpleContent: false,
      componentSelector: 'set-work-time-dialog',
      componentData: {},
      titleDesc: [
        'Set',
        'company',
        'work period'
      ],
      buttons: [
        {type: 'cancel'},
        {
          btnEvent: 'submitWorkTime'
        }
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 删除国家法定假日
   */
  deleteTheNationalHoliday(event: any, holiday: any) {
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'DELETE NATIONAL HOLIDAY',
      isSimpleContent: true,
      simpleContent: 'Are you sure delete the national holiday?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'delete',
          btnEvent: () => {
            let data: any = {
              id: holiday.id
            };
            this.userModelService.deleteNationalHoliday({data}, (res: any) => {
              if (res.status === 1) {
                for (let i in this.nationalHolidayList) {
                  if (this.nationalHolidayList[i].id == holiday.id) {
                    this.nationalHolidayList.splice(parseInt(i), 1)
                  }
                }
              } else {
                this.dialogService.openWarning({simpleContent: 'delete national holiday failed!'})
              }
            })
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * 点击显示日历框
   * @param event
   * @param param
   * @param element
   */
  showMultiCalendar(event: any, param: string, element: any) {
    event.stopPropagation();
    /*this.isShowCalendar = true;*/
    this.isShowCalendar = !this.isShowCalendar;
    if (this.isCalendar !== param) {
      this.isShowCalendar = true;
    }

    this.isCalendar = this.isShowCalendar ? param : '';
    this.multiCalendar = {
      isClickStart: (param === 'start'),
      isClickEnd: (param === 'end'),
      isBidding: true,
      data: this.attendanceFilterData,
      dateTemplate: this.dateTemplate,
      parentElement: element,
      isParent: false,
      currentShowElement: this.calendarProfile.nativeElement
    };

    // if (this.isShowCalendar && this.multiCalendar.isClickStart) {
    //   this.renderer.setElementStyle(this.biMultiCalendar.nativeElement, 'top', '63px');
    // }
    // if (this.isShowCalendar && this.multiCalendar.isClickEnd) {
    //   this.renderer.setElementStyle(this.biMultiCalendar.nativeElement, 'top', '132px');
    // }
  }


  /**
   * 格式化时间
   */
  formatDate(data: any) {
    let day = this.dateService.formatWithTimezone(data, 'dd');
    let month = this.dateService.formatWithTimezone(data, 'mmm');
    let year = this.dateService.formatWithTimezone(data, 'yyyy');
    let week = this.dateService.formatWithTimezone(data, 'dddd');
    let formatData: any = {
      day: day,
      month: month,
      year: year,
      week: week
    }
    return formatData;
  }


  /**
   * getSelectData
   */
  getSelectData(data: any) {
    let start: string = data.startDate.year + '-' + (data.startDate.month + 1) + '-' + data.startDate.monthDay;
    let end: string = data.endDate.year + '-' + (data.endDate.month + 1) + '-' + data.endDate.monthDay;
    this.startDateTemplate = this.formatDate(start);
    this.endDateTemplate = this.formatDate(end);
    this.attendanceFilterData = {
      start: start,
      end: end
    };
    this.isShowCalendar = false;
    this.fetchStaffAttendanceList(this.attendanceFilterData);
  }

  /**
   * 取消search
   * @param event
   */
  onCloseSearch(event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.searchText = '';
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}