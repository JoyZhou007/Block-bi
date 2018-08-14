import {Component, EventEmitter, Inject, Input, Output} from "@angular/core";
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import * as MissionConstant from "../../../shared/config/mission.config.ts";
import {Router} from "@angular/router";

@Component({
  selector: 'mission-create-project',
  templateUrl: '../../template/create/mission-create-project.component.html'
})


export class MissionCreateProjectComponent {

  public missionToken: any;
  public missionProjectData: any;
  public isGetToken: boolean = true;
  public childMissionInfo: Array<any>;
  public missionConstant: any;
  private KEY_PROJECT_TOKEN: string = 'project_token';


  @Output() public doAddMission = new EventEmitter<any>();

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('mission-data.service') public missionDataService: any,
              public router: Router,
              public missionModelService: MissionModelService) {
    this.missionConstant = MissionConstant;
  }

  ngOnInit() {
    if (!this.isGetToken) {
      this.missionGetToken();
    }
  }


  @Input() set setParams(param: any) {
    this.missionProjectData = param;
    this.isGetToken = this.missionProjectData.isProjectPart;
    this.childMissionInfo = this.missionProjectData.childMissionInfo;
    this.getMemberInfo();
    this.formatDate(this.childMissionInfo);
  }

  /**
   * 获取token
   */
  missionGetToken() {
    let data = {
      type: MissionConstant.MISSION_CREATE_PROJECT_TOKEN
    };
    if (!this.missionDataService.requestToken(this.KEY_PROJECT_TOKEN)) {
      this.missionModelService.missionGetToken({
        data
      }, (res: any) => {
        if (res.status === 1) {
          this.missionProjectData.missionToken = res.data.token;
          this.isGetToken = true;
          this.missionDataService.cacheToken(this.KEY_PROJECT_TOKEN, res.data.token);
        }
      })
    } else {
      this.missionProjectData.missionToken = this.missionDataService.requestToken(this.KEY_PROJECT_TOKEN);
    }
  }


  getMemberInfo() {
    for (let i in this.childMissionInfo) {
      this.childMissionInfo[i].allMemberInfo = [];
      if (this.childMissionInfo[i].mission.detail.hasOwnProperty('approver')) {
        for (let k in this.childMissionInfo[i].mission.detail.approver) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.detail.approver[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.detail.approver[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.detail.hasOwnProperty('operator')) {
        for (let k in this.childMissionInfo[i].mission.detail.operator) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.detail.operator[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.detail.operator[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.detail.hasOwnProperty('operator')) {
        for (let k in this.childMissionInfo[i].mission.detail.operator) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.detail.operator[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.detail.operator[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.detail.hasOwnProperty('conferee')) {
        for (let k in this.childMissionInfo[i].mission.detail.conferee) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.detail.conferee[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.detail.conferee[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_OBSERVER)) {
        for (let k in this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_OBSERVER].user_info[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TRACKING)) {
        for (let k in this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_TRACKING].user_info[k]);
          }
        }
      }
      if (this.childMissionInfo[i].mission.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
        for (let k in this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder) {
          let isUid = this.typeService.isArrayKey(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder[k].psid, this.childMissionInfo[i].allMemberInfo, 'psid');
          if (!isUid) {
            this.childMissionInfo[i].allMemberInfo.push(this.childMissionInfo[i].mission.fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder[k]);
          }
        }
      }
    }
  }

  /**
   * 整理时间
   */
  formatDate(data: any) {
    for (let i in data) {
      let startDayTime = this.dateService.formatWithTimezone(data[i].mission.start, 'dd');
      let startMonthTime = this.dateService.formatWithTimezone(data[i].mission.start, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(data[i].mission.start, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(data[i].mission.start, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(data[i].mission.start, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(data[i].mission.start, 'MM');
      data[i].formatDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    }
  }


  /**
   * 添加一个mission到这个project
   */
  addAMission() {
    this.doAddMission.emit(this.missionProjectData);
  }


  /**
   *  存储PROJECT的name
   */
  storageProjectName(data: string) {
    this.missionProjectData.name = data;
  }


  /**
   * 删除子mission
   */
  deletTheChildMission(param: any) {
    let data: any = {
      id: param.mid.mid,
      project_token: param.mission.project_token
    };
    this.missionModelService.removeProjectChild({
      data: data
    }, (data: any) => {
      if (data.status === 1) {
        for (let i = 0; i < this.childMissionInfo.length; i++) {
          if (this.childMissionInfo[i].mid.mid == param.mid.mid) {
            this.childMissionInfo.splice(i, 1);
          }
        }
      }
    });
  }

  /**
   * 显示mission 详情
   */
  showChildMissionDetail(data: any) {
    window.open('mission/detail/' + data.mid.mid);
  }

}