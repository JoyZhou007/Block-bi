import { Component, Inject, Input, Renderer } from '@angular/core';
import { DateService } from '../../../shared/services/common/data/date.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'resignation-application-dialog',
  templateUrl: '../../template/dialog/resignation-application-dialog.component.html',
})

export class ResignationApplicationDialogComponent {
  public isChosen: boolean = false;
  public fixData: any = {
    resignation: true,
    todayBefore: true
  };
  public displayCalendar: boolean = false;
  public resignationDate: string = '';
  private resignationTimestamp: number;
  public message: string = '';
  public date_error: any = {};

  //下拉列表变量
  public dateOption: any;
  private subscription: Subscription;


  constructor(public renderer: Renderer,
              @Inject('date.service') public dateService: DateService,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public imService: any,) {
    // 接收到回馈信息之后
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_APPLICATION_REQUEST_APPLY_DISMISSION) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {
            status: message.status,
            message: message.status != 1 ? 'Application failed!' : ''
          };
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: result
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @Input('setOption')
  public set setOption(data: any) {
    this.resetData();
    /**
     * 设置日期
     * @param event 回调的时间
     */
    this.dateOption = {
      type: 1,
      setEvent: (date: any) => {
        this.resignationDate = date;

        if (typeof date === 'string') {
          date = date.replace(/-/g, '/');
        }
        this.resignationTimestamp = new Date(date).getTime() / 1000;
      },
      date: {
        selected: this.resignationDate
      },
      Zindex: true,
      beforeToday: true
    };

  }

  /**
   * 点击选择checkbox
   * @param {MouseEvent} event
   */
  public clickChooseCheckbox(event: MouseEvent): void {
    event.stopPropagation();
    this.isChosen = !this.isChosen;
  }

  /**
   * 点击显示日历
   * @param {MouseEvent} event
   */
  public clickShowCalendar(event: MouseEvent): void {
    event.stopPropagation();
    this.displayCalendar = !this.displayCalendar;
  }

  /**
   * 得到calendar fix 传出的值
   */
  getFix(event: any) {
    if (event && event.hasOwnProperty('effective_time')) {
      this.resignationTimestamp = event.effective_time;
      this.resignationDate = this.dateService.formatLocal(event.effective_time * 1000);
    }
    this.displayCalendar = false;
  }

  public checkValid(): boolean {
    let result = true;
    if (!this.resignationTimestamp) {
      this.date_error.show = true;
      this.date_error.text = 'date is required';
      result = false;
    }
    return result;
  }

  public sendData() {
    if (!this.checkValid()) {
      return false;
    } else {
      /*this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: false });*/
      this.imService.resignationApply({
        expected_resignation_date: this.resignationTimestamp,
        reason: this.message
      });
      this.resetData();
    }
  }

  private resetData() {
    this.date_error = {};
    this.fixData = {
      resignation: true,
      todayBefore: true
    };
    this.resignationDate = '';
    this.resignationTimestamp = 0;
    this.message = '';
    this.isChosen = false;
  }
}