import {Component, Input, Inject, OnInit, HostListener} from "@angular/core";
import {MeetingModelService} from "../../shared/services/index.service";
import * as meetingConfig from '../../shared/config/meeting.config';
@Component({
  selector: 'meeting-reserve-dialog',
  templateUrl: '../template/meeting-reserve.component.html',
  providers: [MeetingModelService]
})
export class MeetingReserveDialog implements OnInit {
  public roomName: string;  //房间名
  public roomId: string;    //房间id
  public roomNumber: string;  //房间容纳人数
  public meetingRoomProject: any = {type: 'project', perm: 0, bgColorClass: 'g-d-bg1'}; //project开关
  public meetingRoomVideo: any = {type: 'video', perm: 0, bgColorClass: 'g-d-bg1'}; //video开关
  public startTime: string = meetingConfig.MEETING_SELECT_START;  //显示的开始时间
  public endTime: string = meetingConfig.MEETING_SELECT_END;     //显示的结束时间
  public roomList: Array<any> = [];               //所有房间列表
  public meetingList: Array<any> = [];            //所有会议安排列表
  public isSelectHide: boolean = true;            //选择房间列表是否显示
  // public isShowCalendar: boolean = false;         //日历显示
  public multiCalendar: any = {                   //传入日历数据
  };
  public formatString = 'yyyy-mm-dd HH:MM';
  public startDate: string;                   //会议对象的开始时间
  public endDate: string;                     //会议对象的结束时间
  public roomTitle: string;                    //会议对象会议名
  public meeting: any;                         //修改时传入的会议对象
  public meetingObj: any = {                     //传入接口的对象
    attendance: 0,
    crid: '',
    end: '',
    id: '',
    projector: 0,
    room_name: '',
    start: '',
    status: '',
    title: '',
    user_profile_path: '',
    video: 0,
    work_name: ''
  };
  public type: string = '';   //修改还是添加
  public dateWord = {
    //月份
    month: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],

    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //周
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday']
  };
  //错误信息显示
  public isShowTitleError:boolean = false;
  public isShowNumberError:boolean = false;
  public isShowNameError:boolean = false;
  public isShowStartError:boolean = false;
  public isShowEndError:boolean = false;
  public numberErrorText:string = meetingConfig.MEETING_QUANTITY_ERROR;
  public timeEmpty:string = meetingConfig.MEETING_TIME_ERROR;
  public titleEmpty:string = meetingConfig.MEETING_TITLE_ERROR;
  public roomEmpty:string = meetingConfig.MEETING_ROOM_ERROR;
  public hasTime:boolean = false;

  /**
   * 初始化meeting 出入的数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {

      this.roomList = data.data;

      this.clearDialog();
      this.meetingList = data.meetings;
      this.meeting = data.meeting;

      this.type = data.type;
      this.meetingRoomProject.perm = 0;
      this.meetingRoomVideo.perm = 0;
      if (this.type == 'update') {
        //输入框默认值
        this.updateDefaultValue();
      }
    }
  }

  constructor(public meetingModelService: MeetingModelService,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any) {
  }

  ngOnInit() {
  }

  /**
   * 修改时给输入框赋默认值
   */
  updateDefaultValue() {
    this.roomTitle = this.meeting.title;
    this.roomNumber = this.meeting.attendance;
    this.multiCalendar.data = {
      start: this.meeting.start,
      end: this.meeting.end
    };
    this.startTime = this.dateService.formatWithTimezone(this.meeting.start);
    this.endTime = this.dateService.formatWithTimezone(this.meeting.end);
    this.startDate = this.dateService.formatWithTimezone(this.meeting.start, this.formatString);
    this.endDate = this.dateService.formatWithTimezone(this.meeting.end, this.formatString);
    this.roomName = this.meeting.room_name;
    this.meetingRoomProject.perm = parseInt(this.meeting.projector);
    this.meetingRoomVideo.perm = parseInt(this.meeting.video);
    this.roomId = this.meeting.crid;
    this.hasTime = true;
  }

  /**
   * 清空dialog的值
   */
  clearDialog() {

    this.isShowStartError = false;
    this.isShowTitleError = false;
    this.isShowNameError = false;
    this.isShowEndError = false;
    this.isShowNumberError = false;

    this.roomTitle = '';
    this.roomNumber = '';
    if (this.multiCalendar.data) {
      this.multiCalendar.data.start = '';
      this.multiCalendar.data.end = '';
    }
    this.startDate = '';
    this.endDate = '';
    this.startTime = meetingConfig.MEETING_SELECT_START;
    this.endTime = meetingConfig.MEETING_SELECT_END;
    this.hasTime = false;
    this.roomName = '';
    this.roomId = '';
    this.isSelectHide = true;
    // this.isShowCalendar = false;
  }

  /**
   * project video 开关触发事件
   * @param data
   */
  getSwitchButEvent(data: any) {
    this.roomName = '';
    this.roomId = '';
    if (data.type === 'project') {
      this.judgeProject();
    } else if (data.type === 'video') {
      this.judgeVideo();
    }

  }

  /**
   * 开关判断条件
   */
  judgeProject() {
    if (this.meetingRoomProject.perm === 1) {
      for (let i = 0; i < this.roomList.length; i++) {
        if (this.roomList[i].projector === '1') {
          this.roomList[i].isProjectOk = true;
        } else {
          this.roomList[i].isProjectOk = false;
        }
      }
    } else {
      for (let i = 0; i < this.roomList.length; i++) {
        this.roomList[i].isProjectOk = true;
      }
    }
  }

  judgeVideo() {
    if (this.meetingRoomVideo.perm === 1) {
      for (let i = 0; i < this.roomList.length; i++) {
        if (this.roomList[i].video === '1') {
          this.roomList[i].isVideoOk = true;
        } else {
          this.roomList[i].isVideoOk = false;
        }
      }
    } else {
      for (let i = 0; i < this.roomList.length; i++) {
        this.roomList[i].isVideoOk = true;
      }
    }
  }

  /**
   * 判断数量
   */
  judgeNumber() {
    for (let i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].amount >= parseInt(this.roomNumber)) {
        this.roomList[i].isNumberOk = true;
      } else {
        this.roomList[i].isNumberOk = false;
      }
    }
  }

  /**
   * 验证弹框填写
   */
  validFormValue(): boolean {
    if (this.roomNumber && this.roomName && this.startDate && this.endDate && this.roomTitle) {
      return true;
    } else {
      if (this.roomTitle == '') {
        this.isShowTitleError = true;
      }
      if (this.roomNumber == '') {
        this.isShowNumberError = true;
        this.numberErrorText = meetingConfig.MEETING_QUANTITY_ERROR;
      }
      if (this.roomName == '') {
        this.isShowNameError = true;
      }
      if (this.startDate == '') {
        this.isShowStartError = true;
      }
      if (this.endDate == '') {
        this.isShowEndError = true;
      }
      return false;
    }

  }

  /**
   * title  number name 失去焦点
   */
  onRoomTitleBlur() {
    if (this.roomTitle == '') {
      this.isShowTitleError = true;
    } else {
      this.isShowTitleError = false;
    }
  }

  /**
   * 人数input失去焦点
   */
  onRoomNumberBlur() {
    if (this.roomNumber == '') {
      this.isShowNumberError = true;
      this.numberErrorText = meetingConfig.MEETING_QUANTITY_ERROR;
    } else {
      this.isShowNumberError = false;
    }
  }

  /**
   * 房间数量改变
   */
  onRoomChange() {
    this.roomName = '';
    this.roomId = '';
  }

  /**
   * 添加meeting preserve
   */

  addMeeting(event: any) {
    if (this.validFormValue()) {
      this.addMeetingCorrect();
    } else {
      throw 'has invalid form value';
    }
  }

  /**
   * 弹框填写正确
   */
  addMeetingCorrect() {
    let addObj: any = {
      id: this.type == 'add' ? "" : this.meeting.id,
      mode: this.type == 'add' ? "1" : "2",
      crid: this.roomId,
      title: this.roomTitle,
      attendance: this.roomNumber,
      projector: this.meetingRoomProject.perm,
      video: this.meetingRoomVideo.perm,
      start: this.dateService.utcDateFormat(this.startDate, this.formatString),
      end: this.dateService.utcDateFormat(this.endDate, this.formatString)
    };
    if (this.type == 'add') {
      this.meetingModelService.addMeetingPreserve({data: addObj}, (response) => {
        if (response.status === 1) {
          let user: any = JSON.parse(localStorage.getItem("user_data"));
          this.assignmentMeeting();
          this.meetingObj.id = response.data;
          this.meetingObj.crid = this.roomId;
          this.meetingObj.status = "1";
          this.meetingObj.user_profile_path = user.user.user_profile_path;
          this.meetingObj.work_name = user.user.work_name;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_MEETING_ADD_BOOKING_ROOM,
            data: this.typeService.clone(this.meetingObj)
          });
        }
      })
    } else if (this.type == 'update') {
      this.meetingModelService.updateMeetingPreserve({data: addObj}, (response) => {
        if (response.status === 1) {
          this.assignmentMeeting();
          this.meetingObj.id = this.meeting.id;
          this.meetingObj.crid = this.meeting.crid;
          this.meetingObj.status = "1";
          this.meetingObj.user_profile_path = this.meeting.user_profile_path;
          this.meetingObj.work_name = this.meeting.work_name;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_MEETING_UPDATE_BOOKING_ROOM,
            data: this.typeService.clone(this.meetingObj)
          });
        }
      });
    }
  }

  /**
   * 赋值meeting
   */
  assignmentMeeting() {
    this.meetingObj.attendance = this.roomNumber;
    this.meetingObj.end = this.dateService.utcDateFormat(this.endDate, this.formatString);
    this.meetingObj.projector = this.meetingRoomProject.perm;
    this.meetingObj.room_name = this.roomName;
    this.meetingObj.start = this.dateService.utcDateFormat(this.startDate, this.formatString);
    this.meetingObj.title = this.roomTitle;
    this.meetingObj.video = this.meetingRoomVideo.perm;
  }

  /**
   * 点击选中房间输入框
   */
  onClickRoomNumber() {
    for (let i = 0; i < this.roomList.length; i++) {
      this.roomList[i].isNumberOk = true;
      this.roomList[i].isProjectOk = true;
      this.roomList[i].isVideoOk = true;
      this.roomList[i].isTimeOk = true;
    }
    this.isSelectHide = !this.isSelectHide;
    this.judgeProject();
    this.judgeVideo();
    this.judgeNumber();
    if (this.startDate && this.endDate) {
      this.forEachTime();
    }


  }

  /**
   * 选择房间
   * @param room
   */
  onSelectRoom(room: any) {
    this.isSelectHide = true;
    this.roomName = room.name;
    this.roomId = room.id;
    this.isShowNameError = false;

  }



  /**
   * 点击开始时间
   */
  onClickStart(event: any) {
    event.stopPropagation();
    // this.isShowCalendar = true;
    this.multiCalendar = {
      data: {
        start: this.startDate ? this.dateService.utcDateFormat(this.startDate, this.formatString) : '',
        end: this.endDate ? this.dateService.utcDateFormat(this.endDate, this.formatString) : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: this.startDate ? true : false
        },
        end: {
          isShowDateTime: this.endDate ? true : false
        }
      },
      isClickStart: true,
      isClickEnd: false,
      isMeeting: true,
      isShow:true
    };
  }

  /**
   * 点击结束时间
   */
  onClickEnd(event: any) {
    event.stopPropagation();
    // this.isShowCalendar = true;

    this.multiCalendar = {
      data: {
        start: this.startDate ? this.dateService.utcDateFormat(this.startDate, this.formatString) : '',
        end: this.endDate ? this.dateService.utcDateFormat(this.endDate, this.formatString) : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: this.startDate ? true : false
        },
        end: {
          isShowDateTime: this.endDate ? true : false
        }
      },
      isClickStart: false,
      isClickEnd: true,
      isMeeting: true,
      isShow:true
    };

  }

  /**
   * 接收日历的传出对象
   * @param event
   */
  getSelectData(event: any) {

    // this.isShowCalendar = false;
    if (event.startDate.year) {
      let lastStartDate: any = this.startDate;
      let shour = event.startDate.hour;
      let sminute = event.startDate.minute;
      let sday = event.startDate.monthDay;
      let smonth = event.startDate.month;
      let syear = event.startDate.year;
      this.startDate = syear + '-' + (smonth + 1) + '-' + sday + ' ' + shour + ':' + sminute + ":00";

      // todo 在IE下不兼容
      this.startTime = shour + ":" + sminute + " " + this.dateService.formatLocal(this.startDate, "ddS") + ' ' +
        this.dateWord.month[smonth] + ' ' + syear;
         this.hasTime = true;
      if (lastStartDate != this.startDate) {
        this.roomName = '';
        this.roomId = '';
      }
    }


    if (event.endDate.year) {
      let lastEndtDate: any = this.endDate;
      let ehour = event.endDate.hour;
      let eminute = event.endDate.minute;
      let eday = event.endDate.monthDay;
      let emonth = event.endDate.month;
      let eyear = event.endDate.year;
      this.endDate = eyear + '-' + (emonth + 1) + '-' + eday + ' ' + ehour + ':' + eminute + ':00';
      this.hasTime = true;
      // todo 在IE下不兼容
      this.endTime = ehour + ":" + eminute + " " + this.dateService.formatLocal(this.endDate, "ddS") + ' ' +
        this.dateWord.month[emonth] + ' ' + eyear;

      if (lastEndtDate != this.endDate) {
        this.roomName = '';
        this.roomId = '';
      }
    }

    //判断开始结束时否全部选择
    // todo 在IE下不兼容
    this.startAndEnd();
    if (event.startDate.year && event.endDate.year) {
      // todo 在IE下不兼容
      this.forEachTime();
    }

  }

  /**
   *判断开始结束时否全部选择
   */
  startAndEnd() {
    if (this.startDate == '') {
      this.isShowStartError = true;
    }
    if (this.endDate == '') {
      this.isShowEndError = true;
    }
    if (this.startDate && this.endDate) {
      this.isShowStartError = false;
      this.isShowEndError = false;
    }
  }

  /**
   * 比较两个日期的大小
   * @param date
   * @param secondDate
   * @returns {number} 第一个日期大 就返回1, 第二个日期大就返回2 ,相等的就返回 0
   */
  compareDate(date: any, secondDate: any): number {
    let returnStatus: number = 2;
    /*    let newDate = new Date(date);
     let secondNewDate = new Date(secondDate);*/
    //noinspection TypeScriptValidateTypes
    let newDate:Date = new Date(this.dateService.formatLocal(date, 'yyyy'), this.dateService.formatLocal(date, 'm'),
      this.dateService.formatLocal(date, 'd'), this.dateService.formatLocal(date, 'HH'),
      this.dateService.formatLocal(date, 'MM'), this.dateService.formatLocal(date, 'SS'));
    //noinspection TypeScriptValidateTypes
    let secondNewDate:Date = new Date(this.dateService.formatLocal(secondDate, 'yyyy'),
      this.dateService.formatLocal(secondDate, 'm'), this.dateService.formatLocal(secondDate, 'd'),
      this.dateService.formatLocal(secondDate, 'HH'), this.dateService.formatLocal(secondDate, 'MM'),
      this.dateService.formatLocal(secondDate, 'SS'));

    if (newDate.getTime() > secondNewDate.getTime()) {
      returnStatus = 1;
    } else if (newDate.getTime() == secondNewDate.getTime()) {
      returnStatus = 0;
    }
    return returnStatus;
  }

  /**
   * 筛选时间段是否重叠
   */
  forEachTime() {
    for (let i = 0; i < this.roomList.length; i++) {
      this.roomList[i].isTimeOk = true;
      for (let j = 0; j < this.meetingList.length; j++) {
        if (this.meeting && this.meetingList[j].id == this.meeting.id && this.meetingList[j].room_name == this.roomList[i].name) {
          break;
        }
        if (this.roomList[i].name == this.meetingList[j].room_name) {  //该房间已经选过
          if (this.compareDate(this.meetingList[j].end, this.dateService.utcDateFormat(this.startDate, this.formatString)) == 2 ||
            this.compareDate(this.meetingList[j].start, this.dateService.utcDateFormat(this.endDate, this.formatString)) == 1) {
            this.roomList[i].isTimeOk = true;
          } else {
            this.roomList[i].isTimeOk = false;
            break;
          }
        }
      }
    }
  }

  /**
   * 控制键盘只能输入数字
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      this.numberErrorText = meetingConfig.MEETING_NUMBER_ERROR;
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }
}