import {Component, OnInit, Inject, Input} from '@angular/core';
import {ContactModelService} from '../../../shared/services/index.service';
import {NotificationDataService} from '../../../shared/services/index.service';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";
import * as MissionConstant from '../../../shared/config/mission.config';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {NotificationModelService} from "../../../shared/services/model/notification-model.service";

@Component({
  selector: 'mission-request-message',
  templateUrl: '../../template/message/mission-request-message.component.html',
  providers: [ContactModelService, MissionModelService]
})
export class MissionRequestMessageComponent implements OnInit {

  public notificationIn: any;
  public missionConstant: any;
  public notificationOwner: any;
  public missionInfo: any;
  public userRoles: Array<any>;
  public userData: any;
  public isRequest: boolean = false;

  //用户角色相关
  public isPublisher: boolean;
  public isApprover: boolean;
  public isOperator: boolean;
  public isBidder: boolean;
  public isVoter: boolean;
  public isConferee: boolean;
  public isObserver: boolean;
  public isMemo: boolean;
  public isWorkflowApprover: boolean;

  public isProject: boolean;
  public isApplication: boolean;
  public isTask: boolean;
  public isAssignment: boolean;
  public isMeeting: boolean;


  public isRefuseBtn: boolean;
  public isAcceptBtn: boolean;
  public isCheckBtn: boolean;
  public isApproveBtn: boolean;
  public obj: any;
  private notificationTime: string;

  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              private notificationModelService: NotificationModelService,
              @Inject('notification.service') public notificationService: any,
              public missionModelService: MissionModelService) {
    this.missionConstant = MissionConstant;
  }


  @Input() set setNotification(notification: any) {
    if (notification && notification.obj) {
      this.obj = notification.obj;
      this.notificationOwner = notification.obj.senderInfo;
      this.missionInfo = notification.obj.detail.mission[0];
      this.notificationIn = notification.data;
      this.notificationTime = this.dateService.formatWithTimezone(notification.obj.ts, 'HH:MM');
    }
  }


  ngOnInit() {

  }


  /**
   * 点击跳转到对应的mission
   */
  linkToTheMission(event: any) {
    event.stopPropagation();
    window.open('mission/detail/' + this.notificationIn.mid);
  }


  /**
   * 操作这条mission
   * @param event
   * @param param
   */
  operateTheMission(event: any, param: string) {
    event.stopPropagation();
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      let data: any = {
        mid: this.notificationIn.mid,
        operation_type: param
      };
      this.missionModelService.missionCommonOperation({data}, (res: any) => {
        if (res.status === 1) {
          let settings = {
            title: 'Success',
            isSimpleContent: true,
            simpleContent: 'Operator mission success!'
          };
          this.dialogService.openSuccess(settings);
        } else {
          let settings = {
            title: 'Notice!',
            isSimpleContent: true,
            simpleContent: res.message
          };
          this.dialogService.openWarning(settings);
        }
      });
      this.notificationModelService.notificationUpdatedRequest({data: {request_id: this.notificationIn.request_id}}, (res: any) => {});
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
        data: {
          data: {
            request_id: this.notificationIn.request_id
          }
        }
      });
    }
  }

  /**
   * check这个任务
   */
  checkTheMission(event: any) {
    event.stopPropagation();
    if (!this.notificationIn.handled || this.notificationIn.handled === 0) {
      this.missionModelService.missionCheck({
        mid: this.notificationIn.mid,
      }, (response: any) => {
        if (response.status === 1) {
          let settings = {
            title: 'Success',
            isSimpleContent: true,
            simpleContent: 'Check Mission Success!'
          };
          this.dialogService.openSuccess(settings);
        }
        this.dialogService.openWarning({ simpleContent: 'Check Mission Failed!'});
      })
      this.notificationModelService.notificationUpdatedRequest({
        data: {
          request_id: this.notificationIn.request_id
        }
      }, (res: any) => {
      })
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
        data: {
          data: {
            request_id: this.notificationIn.request_id
          }
        }
      });
    }
  }


}
