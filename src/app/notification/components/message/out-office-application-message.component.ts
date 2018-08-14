import {Component, Inject, Input} from '@angular/core';
@Component({
  selector: 'out-office-application-message',
  templateUrl: '../../template/message/out-office-application-message.component.html'
})
export class OutOfficeApplicationMessageComponent {

  public notificationObj: any;
  public notificationIn: any;
  private senderInfo: any;
  private formatStartDate: any = {};
  private formatEndDate: any = {};

  constructor(@Inject('app.config') public appConfig: any,
              @Inject('date.service') public dateService: any,
              @Inject('im.service') public imService: any,
              @Inject('notification.service') public notificationService : any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any) {
  }


  ngOnInit(): void {
  }


  //父级传入的提示消息
  @Input() set setNotification(notification: any) {
    if (notification) {
      this.notificationObj = notification;
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
      this.formatOutOfficeTime(notification.data);
    }
  }


  /**
   * 格式化离开公司/回到公司时间
   * @param data
   */
  formatOutOfficeTime(data: any) {
    let startUtcString: any = new Date(data.start * 1000).toUTCString();
    let startDayTime = this.dateService.formatWithTimezone(startUtcString, 'ddS');
    let startMonthTime = this.dateService.formatWithTimezone(startUtcString, 'mmmm');
    let startHourTime = this.dateService.formatWithTimezone(startUtcString, 'HH');
    let startMinuteTime = this.dateService.formatWithTimezone(startUtcString, 'MM');
    let startYearTime = this.dateService.formatWithTimezone(startUtcString, 'yyyy');
    let startShotMonth = this.dateService.formatWithTimezone(startUtcString, 'mmm');
    this.formatStartDate = {
      monthDay: startDayTime,
      stringMonth: startMonthTime,
      minute: startMinuteTime,
      hour: startHourTime,
      year: startYearTime,
      month:startShotMonth
    };
    let endUtcString: any = new Date(data.end * 1000).toUTCString();
    let endDayTime = this.dateService.formatWithTimezone(endUtcString, 'ddS');
    let endMonthTime = this.dateService.formatWithTimezone(endUtcString, 'mmmm');
    let endHourTime = this.dateService.formatWithTimezone(endUtcString, 'HH');
    let endMinuteTime = this.dateService.formatWithTimezone(endUtcString, 'MM');
    let endYearTime = this.dateService.formatWithTimezone(endUtcString, 'yyyy');
    let endShotMonth = this.dateService.formatWithTimezone(endUtcString, 'mmm');
    this.formatEndDate = {
      monthDay: endDayTime,
      stringMonth: endMonthTime,
      minute: endMinuteTime,
      hour: endHourTime,
      year:endYearTime,
      month:endShotMonth
    };
  }


  /**
   * 打开批复的弹框
   */
  openReplyDialog() {
    if (!this.notificationIn.handled || this.notificationIn.handled == 0) {
      let optionData: any = {
        senderInfo: this.senderInfo,
        formatEndDate: this.formatEndDate,
        formatStartDate: this.formatStartDate,
        notification: this.notificationIn
      };
      this.dialogService.openNew({
        mode: '1',
        title: 'OUT OFFICE APPLICATION',
        isSimpleContent: false,
        componentSelector: 'out-office-reply',
        componentData: optionData,
        buttons: [{
          type: 'accept',
          btnText:'ACCEPT',
          btnEvent: 'acceptOutOfficeApplication',
          mouseEnterEvent: 'outOfficeButDialog',
          mouseLeaveEvent: 'outOfficeButDialog'
        }, {
          type: 'refuse',
          btnText:'REFUSE',
          btnEvent: 'refuseOutOfficeApplication',
          mouseEnterEvent: 'outOfficeButDialog',
          mouseLeaveEvent: 'outOfficeButDialog'
        }]
      });
    }
  }




}