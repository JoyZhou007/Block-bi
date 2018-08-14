import {Component, OnInit, Input, Inject, OnDestroy, Output, EventEmitter} from "@angular/core";
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import * as MissionConstant from '../../../shared/config/mission.config';
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'mission-detail-task',
  templateUrl: '../../template/detail/mission-detail-task.component.html'
})
export class MissionDetailTaskComponent implements OnInit, OnDestroy {
  public missionObj: any;
  public formatDate: any;
  public isUnlockBidding: boolean = false;
  public isUnlockTarget: boolean = false;
  //operator下拉菜单选项
  public operatorList: any = {};
  public operatorDropdownSettings: any;
  public operatorDropdownOptions: Array<any>;
  public operatorArr: Array<any> = [];
  public operatorData: Array<any> = [];

  // approve下拉菜单选项
  public approveList: any = {};
  public approveDropdownSettings: any;
  public approveDropdownOptions: Array<any>;
  public approveArr: Array<any> = [];
  public approveData: Array<any> = [];

  //Bidder下拉菜单
  public bidderList: any = {};
  public bidderDropdownSettings: any;
  public bidderDropdownOptions: Array<any>;
  public bidderArr: Array<any> = [];
  public bidderData: Array<any> = [];
  public missionCommonList: any;
  public publisherId: string;
  public psidObj: any = {};
  public isApprover: boolean = true;
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
  private currentPublishRole: string = 'APPROVER';


  constructor(public missionModelService: MissionModelService,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any) {
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_MISSION_FUNCTION_BIDDING:
        this.isUnlockBidding = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_TARGET:
        this.isUnlockTarget = data.data;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_TASK_INIT_TARGET,
          data: this.operatorArr
        });
        break;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  @Input('setUserRoleIntro') public userRoleIntro: string;

  @Input() set setMissionDetail(param: any) {
    this.missionObj = this.typeService.clone(param);
    if (this.missionObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
      this.isUnlockBidding = true;
    }
    if (this.missionObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TARGET)) {
      this.isUnlockTarget = true;
    }
    this.publisherId = this.missionObj.detail.as_identity.toString();
    if (this.publisherId === MissionConstant.MISSION_USER_IDENTITY_APPROVER) {
      this.isApprover = true;
    } else if (this.publisherId === MissionConstant.MISSION_USER_IDENTITY_OPERATOR) {
      this.isApprover = false;
    }
    this.createFormatDate = this.doFormatDate(this.missionObj.creator_info.time);
    this.getDifferTime();
    this.getSelectApprover();
    this.getSelectOperator();
    if (this.missionObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
      this.getSelectBidder();
    }
  }

  ngOnInit(): void {
    this.getCommonList();
  }


  /**
   * 获取已经选中的approver
   */
  getSelectApprover() {
    this.approveArr = [];
    for (let i in this.missionObj.detail.approver) {
      let optionData = this.missionObj.detail.approver[i];
      if (optionData) {
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          id: optionData.psid,
        });
        this.approveArr.push(tmpModel);
      }
    }
    if(this.missionObj.detail.as_identity == 2) {
      let userInfo: any = this.userDataService.getUserIn();
      let tmpModel = new DropdownOptionModel();
      tmpModel.initData({
        id: this.userDataService.getCurrentCompanyPSID(),
        isCurrent: true,
        label: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
        key: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
        desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
        imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
        group: 'Internal',
      });
      this.approveArr.push(tmpModel);
    }
  }

  /**
   * 获取已经选中的operator
   */
  getSelectOperator() {
    this.operatorArr = [];
    for (let i in this.missionObj.detail.operator) {
      let optionData = this.missionObj.detail.operator[i];
      if (optionData) {
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          id: optionData.psid,
        });
        this.operatorArr.push(tmpModel);
      }
    }
    if(this.missionObj.detail.as_identity == 3) {
      let userInfo: any = this.userDataService.getUserIn();
      let tmpModel = new DropdownOptionModel();
      tmpModel.initData({
        id: this.userDataService.getCurrentCompanyPSID(),
        isCurrent: true,
        label: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
        key: userInfo.user.work_name?userInfo.user.work_name:userInfo.user.p_name,
        desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
        imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
        group: 'Internal',
      });
      this.operatorArr.push(tmpModel);
    }
  }


  /**
   * 获取已经选中的竞标者
   */
  getSelectBidder() {
    this.bidderArr = [];
    for (let i in this.missionObj.fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder) {
      let optionData = this.missionObj.fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder[i].user_info;
      if (optionData) {
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          id: optionData.psid,
        });
        this.bidderArr.push(tmpModel);
      }
    }
  }


  /**
   * 获取下拉框选项人员的Lsit
   */
  getCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.approveList = this.typeService.clone(data.data);
        this.operatorList = this.typeService.clone(data.data);
        this.bidderList = this.typeService.clone(data.data);
        this.calculationOtherGroup('approve');
        if (this.missionObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
          this.calculationOtherGroup('bidder');
        } else {
          this.calculationOtherGroup('operator');
        }
      }
    })
  }

  /**
   * approver下拉框设置
   */
  getApproveList() {
    let tmpArr: Array<any> = [];
    let param = this.approveList;
    this.initApproveSettings();
    this.approveDropdownOptions = [];
    this.approveDropdownSettings.group = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.approveDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.approveDropdownOptions = this.typeService.clone(tmpArr);
    for (let i in this.approveDropdownOptions) {
      let isUid = this.typeService.isArrayKey(this.approveDropdownOptions[i].id, this.approveArr, 'id');
      if (isUid) {
        this.approveDropdownOptions[i].isCurrent = true;
      }
    }
  }

  approveModelChange(data: any) {
    this.approveArr = data[0];
    this.calculationOtherGroup('approve');
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_TASK_APPROVER_CHANGE,
      data: data
    });
  }

  initApproveSettings() {
    if (typeof this.approveDropdownSettings === 'undefined') {
      this.approveDropdownSettings = new DropdownSettings({
        removeEvent: (param: any) => {
          if (param.id == this.userDataService.getCurrentCompanyPSID()) {
            let settings = {
              title: 'Notice!',
              isSimpleContent: true,
              simpleContent: 'As approver, you can not remove yourself!'
            };
            this.dialogService.openWarning(settings);
            return false;
          } else {
            return true;
          }
        }
      });
      this.approveDropdownSettings.isMultiple = true;
      if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO ||
        this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING
      ) {
        this.approveDropdownSettings.readonly = false;
      } else {
        this.approveDropdownSettings.readonly = true;
      }
    }
  }

  /**
   * operator下拉框设置
   */

  getOperatorList() {
    let param = this.operatorList;
    this.initOperatorSettings();
    let tmpArr: Array<any> = [];
    this.operatorDropdownOptions = [];
    this.operatorDropdownSettings.group = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.operatorDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.operatorDropdownOptions = this.typeService.clone(tmpArr);
    for (let i in this.operatorDropdownOptions) {
      let isUid = this.typeService.isArrayKey(this.operatorDropdownOptions[i].id, this.operatorArr, 'id');
      if (isUid) {
        this.operatorDropdownOptions[i].isCurrent = true;
      }
    }
  }

  operatorModelChange(data: any) {
    this.operatorArr = data[0];
    this.calculationOtherGroup('operator');
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_TASk_OPERATOR_CHANGE,
      data: data
    });
  }

  initOperatorSettings() {
    if (typeof this.operatorDropdownSettings === 'undefined') {
      this.operatorDropdownSettings = new DropdownSettings({
        removeEvent: (param: any) => {
          if (param.id == this.userDataService.getCurrentCompanyPSID()) {
            let settings = {
              title: 'Notice!',
              isSimpleContent: true,
              simpleContent: 'As operator, you can not remove yourself!'
            };
            this.dialogService.openWarning(settings);
            return false;
          } else {
            return true;
          }
        }
      });
      this.operatorDropdownSettings.isMultiple = true;
    }
  }

  /**
   * bidder相关的function
   */
  getBidderList() {
    let param = this.bidderList;
    let tmpArr: Array<any> = [];
    this.initBidderSettings();
    this.bidderDropdownOptions = [];
    this.bidderDropdownSettings.group = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.bidderDropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.bidderDropdownOptions = this.typeService.clone(tmpArr);
    for (let i in this.bidderDropdownOptions) {
      let isUid = this.typeService.isArrayKey(this.bidderDropdownOptions[i].id, this.bidderArr, 'id');
      if (isUid) {
        this.bidderDropdownOptions[i].isCurrent = true;
      }
    }
  }

  bidderModelChange(data: any) {
    this.bidderArr = data[0];
    this.calculationOtherGroup('bidder');
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_TASK_BIDDER_CHANGE,
      data: data
    });
  }

  initBidderSettings() {
    if (typeof this.bidderDropdownSettings === 'undefined') {
      if (this.missionObj.mission_status !== MissionConstant.MISSION_STATUS_TODO && this.missionObj.mission_status !== MissionConstant.MISSION_STATUS_PENDING) {
        this.bidderDropdownSettings = new DropdownSettings({
          removeEvent: (param: any) => {
            let settings = {
              title: 'Notice!',
              isSimpleContent: true,
              simpleContent: 'The Bidder Can Not Reduce In Current Status'
            };
            this.dialogService.openWarning(settings);
            return false;
          }
        });
        this.bidderDropdownSettings.isMultiple = true;
      } else {
        this.bidderDropdownSettings = new DropdownSettings();
        this.bidderDropdownSettings.isMultiple = true;
      }
    }
  }


  /**
   * 选择approve operator人员切换筛选
   */
  calculationOtherGroup(data: any) {
    if (data === 'approve') {
      //点击approve之后自动删掉operator下拉列表人员
      this.operatorList.Internal = [];
      this.operatorList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.operatorList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.operatorList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getOperatorList();
      //点击approve之后自动删掉bidder下拉人员
      this.bidderList.Internal = [];
      this.bidderList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.bidderList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.approveArr, 'id');
        if (!isUid) {
          this.bidderList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getBidderList();
    } else if (data === 'operator') {
      //点击approve之后自动删掉approve下拉人员
      this.approveList.Internal = [];
      this.approveList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.operatorArr, 'id');
        if (!isUid) {
          this.approveList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.operatorArr, 'id');
        if (!isUid) {
          this.approveList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getApproveList();
    } else if (data === 'bidder') {
      //点击bidder之后自动删掉approve下拉人员
      this.approveList.Internal = [];
      this.approveList.Cooperator = [];
      for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.bidderArr, 'id');
        if (!isUid) {
          this.approveList.Internal.push(this.missionCommonList.Internal[i]);
        }
      }
      for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
        let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.bidderArr, 'id');
        if (!isUid) {
          this.approveList.Cooperator.push(this.missionCommonList.Cooperator[i]);
        }
      }
      this.getApproveList();
    }
  }

  /**
   * @param
   * 切换发布者身份
   */
  switchPublisherId(param: string) {
    if (param == this.currentPublishRole) return;
    let userInfo: any = this.userDataService.getUserIn();
    this.currentPublishRole = param;
    if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING) {
      if (param === 'APPROVER') {
        this.isApprover = true;
        this.publisherId = MissionConstant.MISSION_USER_IDENTITY_APPROVER;
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          isCurrent: true,
          label: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
          key: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
          desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
          imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
          group: 'Internal',
          id: this.userDataService.getCurrentCompanyPSID()
        });
        let approveArr: any = this.typeService.clone(this.approveArr);
        approveArr.push(tmpModel);
        this.approveArr = this.typeService.clone(approveArr);
        for (let i in this.operatorArr) {
          if (this.operatorArr[i].id == this.userDataService.getCurrentCompanyPSID()) {
            this.operatorArr.splice(parseInt(i), 1)
          }
        }
      } else if (param === 'OPERATOR') {
        this.isApprover = false;
        this.publisherId = MissionConstant.MISSION_USER_IDENTITY_OPERATOR;
        //任务发布者 角色切换成 OPERATOR
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({
          isCurrent: true,
          label: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
          key: userInfo.user.work_name ? userInfo.user.work_name : userInfo.user.p_name,
          desc: userInfo.locationCompany.company_name + ' ' + userInfo.locationCompany.p_name,
          imageLabel: userInfo.user.user_profile_path ? this.config.resourceDomain + userInfo.user.user_profile_path : '',
          group: 'Internal',
          id: this.userDataService.getCurrentCompanyPSID()
        });
        let operatorArr: any = this.typeService.clone(this.operatorArr);
        operatorArr.push(tmpModel);
        this.operatorArr = this.typeService.clone(operatorArr);
        for (let i in this.approveArr) {
          if (this.approveArr[i].id == this.userDataService.getCurrentCompanyPSID()) {
            this.approveArr.splice(parseInt(i), 1)
          }
        }
      }
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_TASK_PUBLISHER_IDENTITY_CHANGE,
        data: this.isApprover
      });
    }
  }


  /**
   * 整理时间格式
   * @param data
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
   * 获取task的相关数据
   */
  getTaskData() {
    this.operatorData = [];
    this.approveData = [];
    this.bidderData = [];
    for (let i = 0; i < this.operatorArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.operatorArr[i].id;
      this.operatorData.push(a);
    }
    for (let i = 0; i < this.approveArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.approveArr[i].id;
      this.approveData.push(a);
    }
    for (let i = 0; i < this.bidderArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.psidObj);
      a.psid = this.bidderArr[i].id;
      this.bidderData.push(a);
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
      if (this.missionObj.link_info.before.length !== 0  || this.missionObj.end == MissionConstant.MISSION_TIME_NULL ) {
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