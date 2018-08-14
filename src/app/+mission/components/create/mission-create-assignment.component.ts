import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import {DropdownOptionModel} from "../../../dropdown/dropdown-element";

@Component({
  selector: 'mission-create-assignment',
  templateUrl: '../../template/create/mission-create-assignment.component.html'
})

export class MissionCreateAssignmentComponent {

  public assignmentList: any = {};
  public createAssignmentData: any;
  public operatorPsid: any = {};
  public assignmentArr: Array<any> = [];
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  @Output() public doCalculationMember = new EventEmitter<any>();
  private inputDropdownOptions: Array<any> = [];

  constructor(public missionModelService: MissionModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any) {
  }

  //初始化页面后
  ngOnInit() {
    this.createAssignmentData = {
      missionDescription: '',
      operatorData: []
    };
    this.getmissionFetchSubordinate();
  }

  /**
   * 获取下拉框选项人员的Lsit
   */

  getmissionFetchSubordinate() {
    this.missionModelService.missionFetchSubordinate({}, (data: any) => {
      if (data.status === 1) {
        this.assignmentList = data.data;
        this.getAssignmentList()
      }
    })
  }

  modelChange(data: any) {
    this.assignmentArr = data[0];
    this.doCalculationMember.emit(this.assignmentArr);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_ASSIGNMENT_OPERATOR_CHANGE,
      data: this.assignmentArr
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
    this.dropdownOptions = [];
    let param = this.assignmentList;
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.psid,
            isCurrent: false,
            label: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            key: optionData.work_name === '' ? optionData.p_name : optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : 'NaN',
            group: key,
            desc: optionData.p_name
          });
          this.dropdownOptions.push(tmpModel);
        }
      }
    }
    this.inputDropdownOptions = this.typeService.clone(this.dropdownOptions);
  }


  /**
   *获取 assignment operator人员信息
   */
  getAssignnmentData() {
    this.createAssignmentData.operatorData = [];
    for (let i = 0; i < this.assignmentArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.operatorPsid);
      a.psid = this.assignmentArr[i].id;
      a.name = this.assignmentArr[i].label;
      a.user_profile_path = this.assignmentArr[i].imageLabel;
      this.createAssignmentData.operatorData.push(a);
    }
  }

}