import {Component, OnInit, Inject, Input, OnDestroy} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {DropdownSettings} from "../../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../../dropdown/dropdown-element";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'read-track',
  templateUrl: '../../../template/detail/function/mission-detail-track.component.html'
})

export class MissionDetailTrackComponent implements OnDestroy {
  public trackList: any = {};
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  // 选中值数组
  public trackArr: Array<any> = [];

  public trackData: Array<any> = [];
  public trackPsid: any = {};
  public missionCommonList: any = {};
  public selectList: Array<any> = [];
  public missionDetailData: any;
  public isAssignment: boolean;
  public subscription: Subscription;

  constructor(public missionModelService: MissionModelService,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
    if (!this.missionDetailData.isReset) {
      for (let i in this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_TRACKING]) {
        let optionData = this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_TRACKING][i].user_info;
        if (optionData) {
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.psid,
          });
          this.trackArr.push(tmpModel);
        }
      }
    }
  }

  @Input() set setCurrentType(param: any) {
    if (param === MissionConstant.MISSION_TYPE_ASSIGNMENT) {
      this.isAssignment = true;
    } else {
      this.isAssignment = false;
    }
    //  设置已经有的track人员数据
  }


  //初始化页面后
  ngOnInit() {
    this.trackList = {
      internal: [],
      cooperator: []
    };
    if (this.missionDetailData.type === MissionConstant.MISSION_TYPE_MEETING) {
      this.selectList = this.missionDetailData.detail.conferee;
    } else if (this.missionDetailData.type === MissionConstant.MISSION_TYPE_ASSIGNMENT) {
      this.selectList = this.missionDetailData.detail.operator;
    } else if (this.missionDetailData.type === MissionConstant.MISSION_TYPE_TASK) {
      this.selectList = this.missionDetailData.detail.operator;
    }
    for (let i in this.selectList) {
      this.selectList[i].id = this.selectList[i].psid;
    }
    if (this.isAssignment) {
      this.getMissionFetchSubordinate();
    } else {
      this.getMissionCommonList();
    }
  }


  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_MEETING_ATTENDEE_CHANGE:
        this.dropdownSettings.group = [];
        this.selectList = data.data[0];
        this.setTrackList();
        break;
      case this.notificationService.config.ACTION_ASSIGNMENT_OPERATOR_CHANGE:
        this.dropdownSettings.group = [];
        this.selectList = data.data[0];
        this.setTrackList();
        break;
      case this.notificationService.config.ACTION_TASk_OPERATOR_CHANGE:
        this.dropdownSettings.group = [];
        this.selectList = data.data[0];
        this.setTrackList();
        break;
    }
  }


  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setTrackList();
      }
    })
  }

  /**
   * 获取下拉框选项人员的Lsit
   */
  getMissionFetchSubordinate() {
    this.missionModelService.missionFetchSubordinate({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setTrackList()
      }
    })
  }


  //设置下拉框人员数据
  setTrackList() {
    this.trackList.cooperator = [];
    this.trackList.internal = [];
    for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
      this.missionCommonList.Internal[i].id = this.missionCommonList.Internal[i].uid ? this.missionCommonList.Internal[i].uid : this.missionCommonList.Internal[i].psid;
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].id, this.selectList, 'id');
      if (isUid) {
        this.trackList.internal.push(this.missionCommonList.Internal[i]);
      }
    }
    for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
      this.missionCommonList.Cooperator[i].id = this.missionCommonList.Cooperator[i].uid ? this.missionCommonList.Cooperator[i].uid : this.missionCommonList.Cooperator[i].psid;
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].id, this.selectList, 'id');
      if (isUid) {
        this.trackList.cooperator.push(this.missionCommonList.Cooperator[i]);
      }
    }
    this.getTrackList(this.trackList);
  }


  modelChange(data: any) {
    this.trackArr = data[0];
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
      this.dropdownSettings.isMultiple = true;
    }
  }

  /**
   * 整理trackList
   */
  getTrackList(param: any) {
    this.initSettings();
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
            id: optionData.id,
            isCurrent: false,
            label: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            key: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : 'NaN',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name,
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.dropdownOptions = this.typeService.clone(tmpArr);
    for (let i in this.trackArr) {
      for (let k  in  this.dropdownOptions) {
        if (this.dropdownOptions[k].id === this.trackArr[i].id) {
          this.dropdownOptions[k].isCurrent = true;
        }
      }
      let isUid = this.typeService.isArrayKey(this.trackArr[i].id, this.dropdownOptions, 'id');
      if (!isUid) {
        this.trackArr.splice(parseInt(i), 1);
      }
    }
  }


  /**
   *获取 track人员信息
   */
  getTrackData() {
    this.trackData = [];
    for (let i = 0; i < this.trackArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.trackPsid);
      a.psid = this.trackArr[i].id;
      this.trackData.push(a);
    }
  }


}