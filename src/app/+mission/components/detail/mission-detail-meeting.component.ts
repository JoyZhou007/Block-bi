import {Component, ViewChild, OnInit, Input, Inject, Output, EventEmitter} from "@angular/core";
import * as MissionConstant from '../../../shared/config/mission.config';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";

@Component({
  selector: 'mission-detail-meeting',
  templateUrl: '../../template/detail/mission-detail-meeting.component.html',
})

export class MissionDetailMeetingComponent implements OnInit {

  public meetingDetailInfo: any;
  public trackInfo: any;
  public importanceInfo: any;
  public recorderInfo: any;
  public isHasTrack: boolean = false;
  public isHasRecorder: boolean = false;
  public isHasImportance: boolean = false;
  public _isEditModel: boolean = false;
  public meetingList: any = {};
  public confereePsid: any = {};
  //编辑的数据
  public editMeetingData: any = {};
  public confereeArr: Array<any>;
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  public formatDate: any;
  public meetingContent: string;
  public memoContent: string;
  public isRecorder: boolean = false;

  public missionConstant: any;
  @Output() outOpenMiniDialog = new EventEmitter<any>();
  private createFormatDate: any;
  private isShowStartTime: boolean;
  private datePeriod: string;
  private showStartTime: any = {};
  private showEndTime: any = {};
  private isShowEndTime: boolean;
  private isShowStartEst: boolean;
  private isShowEndEst: boolean;
  private startDiffer: any;
  private endDiffer: any;

  get isEditModel() {
    return this._isEditModel;
  }

  set isEditModel(data: boolean) {
    if (this._isEditModel === false && data === true) {
      this.getMissionCommonList();
    }
    this._isEditModel = data;
  }

  ngOnInit(): void {
    this.editMeetingData = {
      confereeData: [],
      description: ''
    };
    this.createFormatDate = this.doFormatDate(this.meetingDetailInfo.creator_info.time);
    this.getDifferTime();
  }


  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              public missionModelService: MissionModelService) {
    this.missionConstant = MissionConstant;
  }


  @Input() set setMissionDetail(param: any) {
    this.meetingDetailInfo = param;
    this.getFunction(this.meetingDetailInfo.fns);
    this.getUserRoles(this.meetingDetailInfo.roles);
  }


  @Input('setUserRoleIntro') public userRoleIntro: string;


  /**
   * 获取开启的function
   */
  getFunction(data: any) {
    for (let key in data) {
      if (key === MissionConstant.MISSION_FUNCTION_TRACKING) {
        this.isHasTrack = true;
        this.trackInfo = data[key];
      } else if (key === MissionConstant.MISSION_FUNCTION_MEMO_RECORDER) {
        this.isHasRecorder = true;
        this.memoContent = data[key][0].meeting_content;
        this.meetingContent = this.memoContent;
        this.recorderInfo = data[key];
      } else if (key === MissionConstant.MISSION_FUNCTION_IMPORTANCE) {
        this.isHasImportance = true;
        this.importanceInfo = data[key];
      }
    }
  }

  /**
   * 获取当前用户角色
   */
  getUserRoles(data: any) {
    for (let i in data) {
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_MEMO)) {
        this.isRecorder = true;
      }
    }
  }


  /**
   * 获取下拉框选项人员的Lsit
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.meetingList = data.data;
        this.getMeetingList();
      }
    })
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
      this.dropdownSettings.isMultiple = true;
    }
  }


  getMeetingList() {
    this.initSettings();
    let param = this.meetingList;
    this.dropdownOptions = [];
    let tmpArr: Array<any> = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name,
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.dropdownOptions = this.typeService.clone(tmpArr);
    this.confereeArr = [];
    for (let i in this.meetingDetailInfo.detail.conferee) {
      let optionData = this.meetingDetailInfo.detail.conferee[i];
      let tmpModel = new DropdownOptionModel();
      tmpModel.initData({
        id: optionData.psid,
      });
      this.confereeArr.push(tmpModel);
    }
  }


  modelChange(data: any) {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_MEETING_ATTENDEE_CHANGE,
      data: data
    });
  }


  /**
   *获取 assignment operator人员信息
   */
  getMeetingData() {
    this.editMeetingData.confereeData = [];
    for (let i = 0; i < this.confereeArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.confereePsid);
      a.psid = this.confereeArr[i].id;
      this.editMeetingData.confereeData.push(a);
    }
    this.editMeetingData.description = this.meetingDetailInfo.description;
  }

  /**
   * 时间格式化
   * @param data
   * @returns {{days: string, day: string, week: string, month: string, minute: string, hour: string, year: string}}
   */
  doFormatDate(data: any) {
    let day = this.dateService.formatWithTimezone(data, 'dd');
    let days = this.dateService.formatWithTimezone(data, 'ddS');
    let month = this.dateService.formatWithTimezone(data, 'mmm');
    let year = this.dateService.formatWithTimezone(data, 'yyyy');
    let week = this.dateService.formatWithTimezone(data, 'dddd');
    let hour = this.dateService.formatWithTimezone(data, 'HH');
    let minute = this.dateService.formatWithTimezone(data, 'MM');
    let formatDate = {
      days: days,
      day: day,
      week: week,
      month: month,
      minute: minute,
      hour: hour,
      year: year
    };
    return formatDate;
  }

  /**
   * 会议记录着更新记录内容
   */
  uploadMeetingContent() {
    let data = {
      mid: this.meetingDetailInfo.mid,
      record: this.meetingContent
    };
    this.missionModelService.meetingRecord({
      data
    }, (response: any) => {
      if (response.status === 1) {
        this.memoContent = this.meetingContent;
      }
    })
  }

  /**
   * 取消会议的纪录更新
   */
  cancelMeetingContent() {
    this.meetingContent = this.memoContent;
  }

  /**
   * openMiniDialog
   */
  openMiniDialog(event: any, memberInfo: any) {
    event.stopPropagation();
    memberInfo.uid = memberInfo.psid;
    memberInfo.work_name = memberInfo.name;
    this.outOpenMiniDialog.emit([event, memberInfo])
  }


  /**
   * 处理预设开始/结束时间 与 真实开始/结束时间的差距
   */

  getDifferTime() {
    if (this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_PENDING
      || this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_TODO) {
      this.isShowStartEst = false;
      this.isShowEndEst = false;
      if (this.meetingDetailInfo.link_info.before.length !== 0) {
        this.isShowStartTime = false;
        this.isShowEndTime = false;
        this.caluationDatePeriod();
      } else {
        this.isShowStartTime = true;
        this.isShowEndTime = true;
        this.showStartTime = this.doFormatDate(this.meetingDetailInfo.start);
        this.showEndTime = this.doFormatDate(this.meetingDetailInfo.end);
      }
    } else if (this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_DOING
      || this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_PAUSE) {
      if (this.meetingDetailInfo.link_info.before.length !== 0) {
        this.isShowStartTime = true;
        this.isShowEndTime = false;
        this.isShowStartEst = false;
        this.isShowEndEst = false;
        this.showStartTime = this.doFormatDate(this.meetingDetailInfo.real_start);
        this.caluationDatePeriod();
      } else {
        this.isShowStartTime = true;
        this.isShowEndTime = true;
        this.isShowStartEst = true;
        this.isShowEndEst = false;
        this.showStartTime = this.doFormatDate(this.meetingDetailInfo.real_start);
        this.calculationTimeDiffer(this.meetingDetailInfo.real_end_timestamp, this.meetingDetailInfo.start_timestamp);
        this.showEndTime = this.doFormatDate(this.meetingDetailInfo.end);
      }
    } else if (this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_DONE
      || this.meetingDetailInfo.mission_status === MissionConstant.MISSION_STATUS_STORAGE) {
      if (this.meetingDetailInfo.link_info.before.length !== 0) {
        this.isShowStartTime = true;
        this.showStartTime = this.doFormatDate(this.meetingDetailInfo.real_start);
        this.isShowEndTime = true;
        this.showEndTime = this.doFormatDate(this.meetingDetailInfo.real_end);
        this.isShowStartEst = false;
        this.isShowEndEst = false;
      } else {
        this.isShowStartTime = true;
        this.isShowEndTime = true;
        this.isShowStartEst = true;
        this.isShowEndEst = true;
        this.showStartTime = this.doFormatDate(this.meetingDetailInfo.real_start);
        this.startDiffer = this.calculationTimeDiffer(this.meetingDetailInfo.real_end_timestamp, this.meetingDetailInfo.start_timestamp);
        this.showEndTime = this.doFormatDate(this.meetingDetailInfo.real_end);
        this.endDiffer = this.calculationTimeDiffer(this.meetingDetailInfo.real_end_timestamp, this.meetingDetailInfo.end_timestamp);
      }
    }
  }


  calculationTimeDiffer(realTime: any, settingTime: any) {
    let differObj: any = {};
    let timeDiffer = realTime - settingTime;
    differObj.isDelay = realTime - settingTime > 0 ? true : false
    if (Math.abs(timeDiffer) > MissionConstant.MISSION_DIFFER_TIME) {
      if (timeDiffer > 3600 * 30 * 24) {
        differObj.differTmplate = differObj.isDelay ? '-' + Math.ceil(timeDiffer / (3600 * 30 * 24)) + ' months' : '+' + Math.ceil(timeDiffer / (1000 * 3600 * 30 * 24)) + ' months';
      } else if (timeDiffer > 3600 * 24) {
        differObj.differTmplate = differObj.isDelay ? '-' + Math.ceil(timeDiffer / (3600 * 24)) + ' days' : '+' + Math.ceil(timeDiffer / (1000 * 3600 * 24)) + ' days';
      } else if (timeDiffer > 3600) {
        differObj.differTmplate = differObj.isDelay ? '-' + Math.ceil(timeDiffer / (3600)) + ' hours' : '+' + Math.ceil(timeDiffer / (1000 * 3600)) + ' hours';
      } else {
        differObj.differTmplate = differObj.isDelay ? '-' + Math.ceil(timeDiffer / (60)) + ' minutes' : '+' + Math.ceil(timeDiffer / (1000 * 60)) + ' minutes';
      }
      return differObj;
    } else {
      return false;
    }
  }

  caluationDatePeriod() {
    if (parseInt(this.meetingDetailInfo.date_period) / (3600 * 30 * 24) >= 1) {
      this.datePeriod = parseInt(this.meetingDetailInfo.date_period) / (3600 * 30 * 24) + ' Months';
    } else if (parseInt(this.meetingDetailInfo.date_period) / (3600 * 24 * 7) >= 1) {
      this.datePeriod = parseInt(this.meetingDetailInfo.date_period) / (3600 * 24 * 7) + ' Weeks';
    } else if (parseInt(this.meetingDetailInfo.date_period) / (3600 * 24) >= 1) {
      this.datePeriod = parseInt(this.meetingDetailInfo.date_period) / (3600 * 24) + ' Days';
    } else {
      this.datePeriod = parseInt(this.meetingDetailInfo.date_period) / 3600 + ' Hours';
    }
  }


}