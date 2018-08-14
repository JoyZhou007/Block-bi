import {Component,OnInit,Inject,Input} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';

@Component({
  selector: 'read-function',
  templateUrl: '../../../template/detail/function/mission-detail-function.component.html'
})

export class MissionDetailFunctionComponent {

  public missionObj:any;
  public isProject: boolean = false;
  public isApplication: boolean = false;
  public isTask: boolean = false;
  public isAssignment: boolean = false;
  public isMeeting: boolean = false;
  public missionConstant:any={};
  public currentType: string = '';

  //functions相关
  public isUnlockRecorder:boolean=false;
  public isUnlockImportance:boolean=false;
  public isUnlockTrack:boolean=false;
  public isUnlockTarget:boolean=false;
  public isUnlockBidding:boolean=false;
  public isUnlockExpense:boolean=false;
  public isUnlockParticipant:boolean=false;

  constructor(
    @Inject('notification.service') public notificationService: any
  ) {
    this.missionConstant = MissionConstant;
  }

  ngOnInit(): void {
    this.getFunction(this.missionObj);
  }

  /**
   * @param param
   */
  @Input() set setMissionDetail(param: any) {
    this.currentType=param.type;
    this.missionObj=param;
      this.detectType();
  }

  /**
   * 决定显示什么类型的内容
   */
  public detectType() {
    switch (this.currentType) {
      case MissionConstant.MISSION_TYPE_APPLICATION:
        this.isApplication = true;
        break;
      case MissionConstant.MISSION_TYPE_PROJECT:
        this.isProject = true;
        break;
      case MissionConstant.MISSION_TYPE_MEETING:
        this.isMeeting = true;
        break;
      case MissionConstant.MISSION_TYPE_ASSIGNMENT:
        this.isAssignment = true;
        break;
      case MissionConstant.MISSION_TYPE_TASK:
        this.isTask = true;
        break;
      default:
        break;
    }
  }

  /**
   * 操作funcTion
   */
  //点击开启相关的功能
  showFunction(param:any, event:any) {
    event.stopPropagation();
    switch (param) {
      case MissionConstant.MISSION_FUNCTION_OBSERVER:
        this.isUnlockParticipant = !this.isUnlockParticipant;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_MISSION_FUNCTION_PARTICIPANT,
          data: this.isUnlockParticipant
        });
        break;
      case MissionConstant.MISSION_FUNCTION_MEMO_RECORDER:
        this.isUnlockRecorder = !this.isUnlockRecorder;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_MISSION_FUNCTION_RECORDER,
          data: this.isUnlockRecorder
        });
        break;
      case MissionConstant.MISSION_FUNCTION_IMPORTANCE:
        this.isUnlockImportance=!this.isUnlockImportance;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_MISSION_FUNCTION_IMPORTANCE,
          data: this.isUnlockImportance
        });
        break;
      case MissionConstant.MISSION_FUNCTION_TRACKING:
        this.isUnlockTrack = !this.isUnlockTrack;
        this.isUnlockBidding=false;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_MISSION_FUNCTION_TRACK,
          data: this.isUnlockTrack
        });
        break;
      case MissionConstant.MISSION_FUNCTION_BIDDING:
        if(this.missionObj.mission_status===MissionConstant.MISSION_STATUS_TODO || this.missionObj.mission_status===MissionConstant.MISSION_STATUS_PENDING){
          this.isUnlockBidding = !this.isUnlockBidding;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_MISSION_FUNCTION_BIDDING,
            data: this.isUnlockBidding
          });
        }
        break;
      case MissionConstant.MISSION_FUNCTION_EXPENSE:
        this.isUnlockExpense = !this.isUnlockExpense;
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_MISSION_FUNCTION_EXPENSE,
          data: this.isUnlockExpense
        });
        break;
      case MissionConstant.MISSION_FUNCTION_TARGET:
        if(this.missionObj.mission_status===MissionConstant.MISSION_STATUS_TODO || this.missionObj.mission_status===MissionConstant.MISSION_STATUS_PENDING){
          this.isUnlockTarget = !this.isUnlockTarget;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_MISSION_FUNCTION_TARGET,
            data: this.isUnlockTarget
          });
        }
        break;
      default:
        break;
    }
  }



  /**
   * 获取开启的functions
   */
  getFunction(data:any){
    let fns =data.fns;
    for(let key in fns){
      if(key === MissionConstant.MISSION_FUNCTION_MEMO_RECORDER){
          this.isUnlockRecorder=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_IMPORTANCE){
          this.isUnlockImportance=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_TRACKING){
          this.isUnlockTrack=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_BIDDING){
        this.isUnlockBidding=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_OBSERVER){
        this.isUnlockParticipant=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_TARGET){
        this.isUnlockTarget=true;
      }
      if(key === MissionConstant.MISSION_FUNCTION_EXPENSE){
        this.isUnlockExpense=true;
      }
    }
  }
}
