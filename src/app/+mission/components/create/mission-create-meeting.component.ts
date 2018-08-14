import {Component, OnInit, Inject, EventEmitter, Input, Output} from '@angular/core';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";

@Component({
  selector: 'mission-create-meeting',
  templateUrl: '../../template/create/mission-create-meeting.component.html'
})

export class MissionCreateMeetingComponent {

  public meetingList: any = {};
  public createMeetingData: any;
  public confereeArr: Array<any>;
  public confereePsid: any;
  public attenderList: any;
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;


  @Output() public doCalculationMember = new EventEmitter<any>();

  constructor(public missionModelService: MissionModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any) {
  }


  //初始化页面后
  ngOnInit() {
    this.confereeArr = [];
    this.confereePsid = {};
    this.createMeetingData = {
      missionDescription: '',
      confereeData: []
    };
    this.attenderList = {
      internal: [],
      cooperator: []
    };
    this.getMissionCommonList();
  }

  /**
   * 获取下拉框选项人员的Lsit
   */

  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.meetingList = this.typeService.getObjLength(data.data) > 0 ? data.data : [];
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
    this.dropdownOptions = [];
    let tmpArr: Array<any> = [];
    let param = this.meetingList;
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            label: optionData.work_name?optionData.work_name:optionData.p_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key,
            desc: optionData.company_name + ' ' + optionData.p_name
          });
          tmpArr.push(tmpModel);
        }
      }
    }
    this.dropdownOptions = this.typeService.clone(tmpArr);
    this.meetingList = param;
  }


  modelChange(data: any) {
    this.confereeArr = data[0];
    this.doCalculationMember.emit(this.confereeArr);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_MEETING_ATTENDEE_CHANGE,
      data: this.confereeArr
    });
  }


  /**
   *获取 assignment operator人员信息
   */
  getMeetingData() {
    this.createMeetingData.confereeData = [];
    for (let i = 0; i < this.confereeArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.confereePsid);
      a.psid = this.confereeArr[i].id;
      a.name = this.confereeArr[i].label;
      a.user_profile_path = this.confereeArr[i].imageLabel;
      this.createMeetingData.confereeData.push(a);
    }
  }


}