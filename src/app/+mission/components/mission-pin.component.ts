/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/27.
 */
import { Component, Inject, Input } from "@angular/core";
import { MissionModelService } from "../../shared/services/index.service";
@Component({
  selector: 'mission-pin-dialog',
  templateUrl: '../template/mission-pin.component.html',
  providers: [MissionModelService]
})
export class MissionPinDialogComponent {
  public pinObj: any;
  public testMsg: string;
  public year: any;
  public month: any;
  public day: any;
  public week: any;
  public shareSelect: boolean = true; //分享是否选中
  public dateWord = {
    //月份
    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //周
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday']
  };
  public errorMsg: boolean = false;


  @Input() set setOption(data: any) {
    if (data) {
      this.pinObj = data;
      this.testMsg = data.description;
      this.errorMsg = false;
    }
  };

  ngOnInit(): void {
    let now = new Date();
    this.year = now.getFullYear();
    this.month = this.dateWord.monthSmall[now.getMonth()];
    this.day = this.formatDay(now.getDate());
    this.week = this.dateWord.week[now.getDay()];
  }

  constructor(@Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('date.service') public dateService: any,
              public missionModelService: MissionModelService,) {

  }

  /**
   * 阻止事件冒泡
   * @param event
   */
  stopPropagation(event: any) {
    event.stopPropagation();
  }

  selectShare(event: any) {
    this.shareSelect = !this.shareSelect;
  }

  pinHandle() {
    if (this.pinObj.type == 'add') {
      this.pinAdd();
    } else if (this.pinObj.type = 'update') {
      this.pinUpdate();
    }
  }

  pinAdd() {
    if (this.testMsg == '') {
      this.errorMsg = true;
      throw 'Empty value';
    } else {
      this.pinObj.description = this.testMsg;
      this.pinObj.shared = this.shareSelect ? 1 : 0;
      this.missionModelService.missionCalendarPinAdd({data: this.pinObj}, (response: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: response
        });
        if (response.status !== 1) {
          this.dialogService.openNew({
            mode: 1,
            simpleContent: 'add pin failed!',
          })
        } else {
          //添加成功，将新添加pin传出
          if (response.data.hasOwnProperty('0')) {
            this.pinObj.id = response.data[0].pin_id;
            this.pinObj.pin_time += ' ';
            this.pinObj.pin_time += response.data[0]['hour_minute'];
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_MISSION_CALENDAR_ADD_PIN,
              data: this.pinObj
            });
          }
        }
      });
    }

  }

  pinUpdate() {
    if (this.testMsg == '') {
      this.errorMsg = true;
      throw 'Empty value';
    } else {
      this.pinObj.description = this.testMsg;
      this.missionModelService.missionCalendarPinUpdate({data: this.pinObj}, (response: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: response
        });
        if (response.status !== 1) {
          this.dialogService.openNew({
            mode: 1,
            simpleContent: 'update pin failed!',
          })
        } else {
          //添加成功，将新添加pin传出
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_MISSION_CALENDAR_UPDATE_PIN,
            data: this.pinObj
          });
        }

      });
    }

  }

  formatDate(date) {
    if (date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + "-" + date.getSeconds();
    }
  }

  formatDay(day) {
    if (day < 10) {
      return '0' + day;
    } else {
      return day;
    }

  }

  /**
   * 失去焦点
   * @param event
   */
  onBlur(event: any) {
    if (event) {
      event.stopPropagation();
    }
    if (this.testMsg == '') {
      this.errorMsg = true;
    } else {
      this.errorMsg = false;
    }
  }
}
