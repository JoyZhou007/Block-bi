import {
  Component, ViewChild, OnInit, ViewEncapsulation, Inject, Input, EventEmitter, Output,
  OnDestroy
} from "@angular/core";
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import * as MissionConstant from '../../../shared/config/mission.config.ts';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'mission-detail-assignment',
  templateUrl: '../../template/detail/mission-detail-assignment.component.html'
})
export class MissionDetailAssignmentComponent implements OnInit, OnDestroy {

  public missionObj: any;
  public formatDate: any;
  public missionConstant: any;
  public isEditModel: boolean = false;
  public assignmentList: any = {};
  public editAssignmentData: any = {};
  public operatorPsid: any = {};
  public assignmentArr: Array<any> = [];
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public subscription: Subscription;
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
  private isEndPending: boolean;

  constructor(@Inject('app.config') public config: any,
              @Inject('date.service') public dateService: any,
              @Inject('type.service') public typeService: any,
              public missionModelService: MissionModelService,
              @Inject('notification.service') public notificationService: any) {
    this.missionConstant = MissionConstant;
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }


  @Input() set setMissionDetail(param: any) {
    this.missionObj = this.typeService.clone(param);
    this.createFormatDate = this.doFormatDate(this.missionObj.creator_info.time);
    //获取已经选中的operator
    this.getMissionFetchSubordinate();
  }


  @Input('setUserRoleIntro') public userRoleIntro: string;

  ngOnInit(): void {
    this.editAssignmentData = {
      operatorData: []
    };
    this.getDifferTime();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


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
   * 获取下拉框选项人员的Lsit
   */
  getMissionFetchSubordinate() {
    this.missionModelService.missionFetchSubordinate({}, (data: any) => {
      if (data.status === 1) {
        this.assignmentList = data.data;
        this.getAssignmentList()
      }
    })
  }

  //选中人员变化
  modelChange(data: any) {
    this.assignmentArr = data[0];
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_ASSIGNMENT_OPERATOR_CHANGE,
      data: data
    });
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = {
        enableSearch: true,
        enableTab: false,
        isMultiple: true,
        group: [],
        delBtnClass: 'font-remove'
      };
    }
  }


  getAssignmentList() {
    this.initSettings();
    this.assignmentArr = [];
    let param = this.assignmentList;
    let tmpArr: Array<any> = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = {
            id: optionData.psid,
            isCurrent: false,
            label: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            key: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : 'NaN',
            group: key,
            desc: optionData.p_name,
          };
          tmpArr.push(tmpModel);
        }
      }
    }
    this.dropdownOptions = this.typeService.clone(tmpArr);
    //显示已经选中的人员名单
    for (let i in this.missionObj.detail.operator) {
      let optionData = this.missionObj.detail.operator[i];
      let tmpModel = {
        id: optionData.psid,
        isCurrent: false,
        label: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
        key: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
        imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : 'NaN',
        group: ''
      };
      this.assignmentArr.push(tmpModel);
    }
  }


  /**
   *获取 assignment operator人员信息
   */
  getAssignnmentData() {
    this.editAssignmentData.operatorData = [];
    for (let i = 0; i < this.assignmentArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.operatorPsid);
      a.psid = this.assignmentArr[i].id;
      this.editAssignmentData.operatorData.push(a);
    }
  }


  /**
   * 处理消息
   */

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_MISSION_FUNCTION_TARGET:
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_ASSIGNMENT_INIT_TARGET,
          data: this.assignmentArr
        });
        break;
    }
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
    if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO) {
      this.isShowStartEst = false;
      this.isShowEndEst = false;
      if (this.missionObj.link_info.before.length !== 0) {
        this.isShowStartTime = false;
        this.isShowEndTime = false;
        this.calculationDatePeriod();
      } else {
        this.isShowStartTime = true;
        this.isShowEndTime = true;
        if (this.missionObj.start !== MissionConstant.MISSION_TIME_NULL) {
          this.isShowStartTime = true;
          this.showStartTime = this.doFormatDate(this.missionObj.start);
        } else {
          this.isShowStartTime = false;
        }
        if (this.missionObj.end !== MissionConstant.MISSION_TIME_NULL) {
          this.isShowEndTime = true;
          this.showEndTime = this.doFormatDate(this.missionObj.end);
        } else {
          this.isShowEndTime = false;
          this.isEndPending = true;
        }
        this.calculationTimeDiffer(this.missionObj.real_end_timestamp, this.missionObj.start_timestamp);
      }
    } else if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_DOING
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PAUSE) {
      if (this.missionObj.link_info.before.length !== 0) {
        this.isShowStartTime = true;
        this.isShowEndTime = false;
        this.isShowStartEst = false;
        this.isShowEndEst = false;
        this.showStartTime = this.doFormatDate(this.missionObj.real_start);
        this.calculationDatePeriod();
      } else {
        this.isShowEndTime = true;
        this.isShowStartEst = true;
        this.isShowEndEst = false;
        if (this.missionObj.real_start !== MissionConstant.MISSION_TIME_NULL) {
          this.isShowStartTime = true;
          this.showStartTime = this.doFormatDate(this.missionObj.real_start);
        } else {
          this.isShowStartTime = false;
        }
        if (this.missionObj.end !== MissionConstant.MISSION_TIME_NULL) {
          this.isShowEndTime = true;
          this.showEndTime = this.doFormatDate(this.missionObj.end);
        } else {
          this.isShowEndTime = false;
          this.isEndPending = true;
        }
        this.calculationTimeDiffer(this.missionObj.real_end_timestamp, this.missionObj.start_timestamp);
      }
    } else if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_DONE
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_STORAGE) {
      if (this.missionObj.link_info.before.length !== 0 || this.missionObj.end == MissionConstant.MISSION_TIME_NULL) {
        this.isShowStartTime = true;
        this.showStartTime = this.doFormatDate(this.missionObj.real_start);
        this.isShowEndTime = true;
        this.showEndTime = this.doFormatDate(this.missionObj.real_end);
        this.isShowStartEst = false;
        this.isShowEndEst = false;
      } else {
        this.isShowStartTime = true;
        this.isShowEndTime = true;
        this.isShowStartEst = true;
        this.isShowEndEst = true;
        this.showStartTime = this.doFormatDate(this.missionObj.real_start);
        this.startDiffer = this.calculationTimeDiffer(this.missionObj.real_end_timestamp, this.missionObj.start_timestamp);
        this.showEndTime = this.doFormatDate(this.missionObj.real_end);
        this.endDiffer = this.calculationTimeDiffer(this.missionObj.real_end_timestamp, this.missionObj.end_timestamp);
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

  calculationDatePeriod() {
    if (parseInt(this.missionObj.date_period) / (3600 * 30 * 24) >= 1) {
      this.datePeriod = parseInt(this.missionObj.date_period) / (3600 * 30 * 24) + ' Months';
    } else if (parseInt(this.missionObj.date_period) / (3600 * 24 * 7) >= 1) {
      this.datePeriod = parseInt(this.missionObj.date_period) / (3600 * 24 * 7) + ' Weeks';
    } else if (parseInt(this.missionObj.date_period) / (3600 * 24) >= 1) {
      this.datePeriod = parseInt(this.missionObj.date_period) / (3600 * 24) + ' Days';
    } else {
      this.datePeriod = parseInt(this.missionObj.date_period) / 3600 + ' Hours';
    }
  }


}