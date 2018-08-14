import {Component, OnInit, Inject, Input, OnDestroy} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {DropdownOptionModel} from "../../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../../dropdown/dropdown-setting";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'read-recorder',
  templateUrl: '../../../template/detail/function/mission-detail-recorder.component.html'
})

export class MissionDetailRecorderComponent implements OnDestroy {

  public recorderList: any = {};
  public recorderData: Array<any>;
  public recorderPsid: any = {};
  public missionCommonList: any = {};
  public confereeList: Array<any> = [];
  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  // 选中值
  public recorderArr: Array<any>;
  public missionDetailData: any;
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

  //初始化页面后
  ngOnInit() {
    this.recorderData = [];
    this.recorderList = {
      internal: [],
      cooperator: []
    };

    this.getMissionCommonList();
    this.confereeList = this.missionDetailData.detail.conferee;
    for (let i in this.confereeList) {
      this.confereeList[i].id = this.confereeList[i].psid;
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
        this.confereeList = data.data[0];
        this.setRecorderList();
        break;
    }
  }


  modelChange(data: any) {
    this.recorderArr = data[0];
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
    }
  }


  //设置mission  detail数据
  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
    this.recorderArr = [];
    if (!this.missionDetailData.isReset) {
      for (let i in this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER]) {
        let optionData = this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER][i].user_info;
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({id: optionData.psid});
        this.recorderArr.push(tmpModel);
      }
    }
  }


  //设置下拉框数据
  setRecorderList() {
    this.recorderList.cooperator = [];
    this.recorderList.internal = [];
    for (let i = 0; i < this.missionCommonList.Internal.length; i++) {
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Internal[i].uid, this.confereeList, 'id');
      if (isUid) {
        this.recorderList.internal.push(this.missionCommonList.Internal[i]);
      }
    }
    for (let i = 0; i < this.missionCommonList.Cooperator.length; i++) {
      let isUid = this.typeService.isArrayKey(this.missionCommonList.Cooperator[i].uid, this.confereeList, 'id');
      if (isUid) {
        this.recorderList.cooperator.push(this.missionCommonList.Cooperator[i]);
      }
    }
    this.getRecorderList(this.recorderList);
  }

  getRecorderList(param: any) {
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
            id: optionData.uid,
            isCurrent: false,
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
    for (let i in this.recorderArr) {
      for (let k  in  this.dropdownOptions) {
        if (this.dropdownOptions[k].id === this.recorderArr[i].id) {
          this.dropdownOptions[k].isCurrent = true;
        }
      }
      let isUid = this.typeService.isArrayKey(this.recorderArr[i].id, this.dropdownOptions, 'id');
      let k = parseInt(i);
      if (!isUid) {
        this.recorderArr.splice(k, 1);
      }
    }
    this.dropdownOptions = this.typeService.clone(tmpArr);
  }


  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setRecorderList();
      }
    })
  }

  /**
   * 获取memo 记录着数据
   */
  getRecorderData() {
    this.recorderData = [];
    for (let i = 0; i < this.recorderArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.recorderPsid);
      a.psid = this.recorderArr[i].id;
      this.recorderData.push(a);
    }
  }

}