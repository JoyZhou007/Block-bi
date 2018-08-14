import {Component, OnInit, Inject, Input} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {DropdownOptionModel} from "../../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../../dropdown/dropdown-setting";

@Component({
  selector: 'read-participant',
  templateUrl: '../../../template/detail/function/mission-detail-participant.component.html'
})


export class MissionDetailParticipantComponent {

  public missionDetailData: any;

  public missionCommonList: any;

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  public observerArr: Array<any> = [];
  public observerData: Array<any> = [];
  public participantList: Array<any>;
  private observerPsid: any = {};

  constructor(public missionModelService: MissionModelService,
              @Inject('type.service') public typeService: any,
              @Inject('app.config') public config: any) {
  }

  //初始化页面后
  ngOnInit() {
    this.getMissionCommonList();
  }

  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
  }

  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setParticipantList(this.missionCommonList);
      }
    })
  }


  modelChange(data: any) {
    this.observerArr = data[0];
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
      this.dropdownSettings.isMultiple = true;
    }
  }

  setParticipantList(param: any) {
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
    this.observerArr = [];
    if (!this.missionDetailData.isReset) {
      for (let i in this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_OBSERVER]) {
        let optionData = this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_OBSERVER][i].user_info;
        let tmpModel = new DropdownOptionModel();
        tmpModel.initData({id: optionData.psid});
        this.observerArr.push(tmpModel);
      }
    }
    this.participantList = this.missionDetailData.detail.conferee;
    for (let i in this.participantList) {
      this.participantList[i].id = this.participantList[i].psid;
    }
    this.dropdownOptions=this.typeService.clone(tmpArr);
  }


  /**
   * 获取participant 记录着数据
   */
  getParticipantData() {
    this.observerData = [];
    for (let i = 0; i < this.observerArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.observerPsid);
      a.psid = this.observerArr[i].id;
      this.observerData.push(a);
    }
  }


}