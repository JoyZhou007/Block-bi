import {
  Component, OnInit, AfterViewChecked,
  Inject
} from "@angular/core";
import {MissionDetailAPIModel, MissionUserInfo} from "../../../shared/services/model/entity/mission-entity";
import {Input} from "@angular/core/src/metadata/directives";
import * as MissionConstant from '../../../shared/config/mission.config';

@Component({
  selector: 'mission-detail-person',
  templateUrl: '../../template/detail/mission-detail-person.component.html'
})
export class MissionPersonTaskComponent implements OnInit, AfterViewChecked {

  public missionConstant: any;

  @Input('missionObj') public missionObj: MissionDetailAPIModel;
  public hasInit: boolean = false;
  public tplPersonList: Array<{
    type: string,
    title: string,
    data: Array<MissionUserInfo>
  }> = [];

  ngOnInit(): void {

  }

  ngAfterViewChecked(): void {
    if (typeof this.missionObj !== 'undefined' && !this.hasInit) {
      this.bindDataForTemplate();
      this.hasInit = true;
    }
  }

  constructor(@Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any) {
    this.missionConstant = MissionConstant;
  }

  bindDataForTemplate() {
    let fns = this.missionObj.fns;
    // approver
    // operator
    // recorder
    if (fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_MEMO_RECORDER)) {
      this.tplPersonList.push({
        type: '2',
        title: 'RECORDER',
        data: fns[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER]
      });
    }
    // attender
    if (this.missionObj.type === MissionConstant.MISSION_TYPE_MEETING) {
      this.tplPersonList.push({
        type: '1',
        title: 'ATTENDEE',
        data: this.missionObj.detail.conferee
      })
    }
    //operator
    if (this.missionObj.detail.hasOwnProperty('operator')) {
      if (this.missionObj.detail.operator.length > 0) {
        this.tplPersonList.push({
          type: '1',
          title: 'OPERATOR',
          data: this.missionObj.detail.operator
        })
      }
    }
    //approver
    if (this.missionObj.detail.hasOwnProperty('approver')) {
      if (this.missionObj.detail.approver.length > 0) {
        this.tplPersonList.push({
          type: '1',
          title: 'APPROVER',
          data: this.missionObj.detail.approver
        })
      }
    }


    // participant
    if (fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_OBSERVER)) {
      this.tplPersonList.push({
        type: '2',
        title: 'PARTICIPANT',
        data: fns[MissionConstant.MISSION_FUNCTION_OBSERVER]
      })
    }
    if (fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
      this.tplPersonList.push({
        type: '2',
        title: 'BIDDER',
        data: fns[MissionConstant.MISSION_FUNCTION_BIDDING].bidder
      })
    }
  }

  /**
   * 点击此人头像与他聊天
   */
  chatWithPerson(event: any, mInfo: any, type: string) {
    event.stopPropagation();
    let memberInfo = this.typeService.clone(mInfo);
    if (type === '1') {
      memberInfo.uid = memberInfo.psid;
      memberInfo.work_name = memberInfo.name;
    } else if (type === '2') {
      memberInfo.uid = memberInfo.user_info.psid;
      memberInfo.user_profile_path = memberInfo.user_info.user_profile_path;
      memberInfo.work_name = memberInfo.user_info.name;
    }
    if (memberInfo.uid == this.userDataService.getCurrentUUID()
      || memberInfo.uid == this.userDataService.getCurrentCompanyPSID()) {
    } else {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-mini-dialog',
          options: {
            left: event.clientX,
            top: event.clientY,
            member: memberInfo,
            form: 2
          }
        }
      });
    }
  }


}