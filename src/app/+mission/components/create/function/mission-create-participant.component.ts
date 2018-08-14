import {Component, OnInit, Inject, Input} from '@angular/core';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
@Component({
  selector: 'create-observer',
  templateUrl: '../../../template/create/function/mission-create-participant.component.html'
})

export class MissionCreateParticipantComponent {
  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public inputDropdownOptions: Array<any> = [];
  public observerArr: Array<any> = [];
  public observerData: Array<any> = [];
  private observerPsid: any = {};

  public isRest: boolean = false;

  constructor(public missionModelService: MissionModelService,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any) {
  }

  //初始化页面后
  ngOnInit() {
    this.getMissionCommonList()
  }


  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.initSettings();
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        let param = data.data;
        for (let key in param) {
          if (param.hasOwnProperty(key)) {
            this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
            let optionDataArr = param[key];
            for (let i in optionDataArr) {
              let optionData = optionDataArr[i];
              let tmpModel = {
                id: optionData.uid,
                isCurrent: false,
                label: optionData.work_name,
                key: optionData.work_name,
                imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
                group: key,
                desc: optionData.company_name + ' ' + optionData.p_name
              };
              this.dropdownOptions.push(tmpModel);
            }
          }
        }
        this.inputDropdownOptions = this.typeService.clone(this.dropdownOptions);
      }
    })
  }


  modelChange(data: any) {
    this.observerArr = data[0];
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

  /**
   *获取 participant人员信息
   */
  getParticipantData() {
    this.observerData = [];
    for (let i = 0; i < this.observerArr.length; i++) {
      let a: any;
      a = this.typeService.clone(this.observerPsid);
      a.psid = this.observerArr[i].id;
      a.name = this.observerArr[i].label;
      a.user_profile_path = this.observerArr[i].imageLabel;
      this.observerData.push(a);
    }
  }


  /**
   *PROJECT 的 type 下 获取已经选中的人
   */
  getProjectParticipant(data: any) {
    this.observerArr = data;
    this.isRest = true;
  }
}