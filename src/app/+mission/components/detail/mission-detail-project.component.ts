import {Component, OnInit, Input, Inject, Output, EventEmitter} from "@angular/core";
import {ContactModelService} from '../../../shared/services/index.service';
import * as MissionConstant from '../../../shared/config/mission.config.ts';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import {Router} from '@angular/router';
import {MissionStaticFunction} from "../../../shared/services/model/entity/mission-entity";

@Component({
  selector: 'mission-detail-project',
  templateUrl: '../../template/detail/mission-detail-project.component.html'
})
export class MissionDetailProjectComponent implements OnInit {

  public missionObj: any;
  public formatDate: any;
  public missionConstant: any;
  public isEditModel: boolean = false;

  @Output() outOpenMiniDialog = new EventEmitter<any>();

  ngOnInit(): void {
  }

  constructor(@Inject('app.config') public config: any,
              @Inject('date.service') public dateService: any,
              @Inject('type.service') public typeService: any,
              @Inject('file.service') public fileService: any,
              @Inject('notification.service') public notificationService: any,
              public router: Router,
              public missionModelService: MissionModelService,
              public contactModelService: ContactModelService) {
    this.missionConstant = MissionConstant;
  }


  @Input() set setMissionDetail(param: any) {
    this.missionObj = this.typeService.clone(param);
    this.doFormatDate(this.missionObj.creator_info.time, 1);
    this.doFormatDate(this.missionObj.detail.internal, 2);
    this.getChildMissionUserInfo(this.missionObj.detail);
  }


  @Input('setUserRoleIntro') public userRoleIntro: string;

  doFormatDate(data: any, type: number) {
    if (type === 1) {
      let startDayTime = this.dateService.formatWithTimezone(data, 'ddS');
      let startMonthTime = this.dateService.formatWithTimezone(data, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(data, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(data, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(data, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(data, 'MM');
      this.formatDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    } else {
      for (let i in data) {
        if (data[i].start == MissionConstant.MISSION_TIME_NULL) {
          data[i].showDateTemplate = 'PENDING';
        } else {
          let startDayTime = this.dateService.formatWithTimezone(data[i].start, 'ddS');
          let startMonthTime = this.dateService.formatWithTimezone(data[i].start, 'mmm');
          let startYearTime = this.dateService.formatWithTimezone(data[i].start, 'yyyy');
          let startWeekTime = this.dateService.formatWithTimezone(data[i].start, 'dddd');
          let startHourTime = this.dateService.formatWithTimezone(data[i].start, 'HH');
          let startMinuteTime = this.dateService.formatWithTimezone(data[i].start, 'MM');
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
    }
  }

  /**
   * 查询子mission的用户信息
   */

  getChildMissionUserInfo(data: any) {
    let userPsidArr: Array<any> = [];
    for (let key in data.users_info) {
      for (let k in data.internal) {
        if (data.internal[k].id === key) {
          data.internal[k].user_info = data.users_info[key]
        }
        data.internal[k].typeTitle = MissionStaticFunction.getTypeTitle(data.internal[k].type);
      }
      for (let i in data.users_info[key].data) {
        userPsidArr.push(data.users_info[key].data[i]);
      }
    }
    if (userPsidArr) {
      this.getFriendInfo(userPsidArr);
    }

  }

  /**
   * 批量获取用户信息
   */
  getFriendInfo(param: Array<any>) {
    this.contactModelService.getUserInfo({
        multi: param
      }, (res: any) => {
        if (res.status === 1) {
          for (let k in this.missionObj.detail.internal) {
            this.missionObj.detail.internal[k].user_info.arr = [];
            for (let j in this.missionObj.detail.internal[k].user_info.data) {
              for (let i in res.data) {
                res.data[i].user_profile_path = this.fileService.getImagePath(36, res.data[i].user_profile_path);  //将显示头像转化为36*36
                if (res.data[i].uid === this.missionObj.detail.internal[k].user_info.data[j]) {
                  this.missionObj.detail.internal[k].user_info.arr.push(res.data[i]);
                }
              }
            }
          }
        }
      }
    )
  }


  /**
   * 删除子mission
   */
  deleteTheChildMission(param: any) {
    let data: any = {
      mid: param.id,
      project_token: ''
    };
    this.missionModelService.removeProjectChild({
      data: data
    }, (data: any) => {
      if (data.status === 1) {
        for (let i = 0; i < this.missionObj.detail.internal.length; i++) {
          if (this.missionObj.detail.internal[i].id === param.id) {
            this.missionObj.detail.internal.splice(i, 1);
          }
        }
      }
    });
  }

  /**
   * 添加子mission
   */
  addChildMission() {
    this.router.navigate(['mission/create/Application', this.missionObj.mid]);
  }

  /**
   * 点击查看子mission的详情
   */
  showChildMissionDetail(data: any) {
    window.open('mission/detail/' + data.id);
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
   * 打开mission dialog
   */
  openMissionChatDialog(event: any, missionObj: any) {
    missionObj.mid = missionObj.id;
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'mission-chat-dialog',
        options: missionObj
      }
    });
  }


}