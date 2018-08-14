import {Component, ViewChild, OnInit, Inject, Output, EventEmitter, Renderer} from "@angular/core";
import {MissionDetailAPIModel} from "../../../shared/services/model/entity/mission-entity";
import {Input} from "@angular/core/src/metadata/directives";
import * as MissionConstant from "../../../shared/config/mission.config";
import {MissionModelService} from "../../../shared/services/model/mission-model.service";


@Component({
  selector: 'mission-detail-application',
  templateUrl: '../../template/detail/mission-detail-application.component.html'
})
export class MissionDetailApplicationComponent implements OnInit {

  public isEditModel: boolean = false;
  public missionObjDetail: any = {};
  public workflowList: any = {};
  public internalList: Array<any>;
  public cooperatorList: Array<any>;
  public isShowSelectList: boolean = false;
  public formatDate: any;
  public missionConstant: any;
  public applicationDetailData: any = {
    missionDescription: '',
    chosenWorkflow: {}
  };
  private createFormatDate: any={};
  private isHasRealStart: boolean;
  private isHasRealEnd: boolean;
  private selectObj: any;

  @Output() outOpenMiniDialog = new EventEmitter<any>();
  @Input('setMissionDetail') public missionObj: MissionDetailAPIModel;
  @Input('setUserRoleIntro') public userRoleIntro: string;
  private realStartFormatDate: any = {};
  private realEndFormatDate: any = {};




  constructor(
    private renderer: Renderer,
    public missionModelService: MissionModelService,
    @Inject('app.config') public config: any,
    @Inject('date.service') public dateService: any,
    @Inject('toggle-select.service') public toggleSelectService: any
  ) {
    this.missionConstant = MissionConstant;
  }

  ngOnInit(): void {
    this.missionObjDetail = this.missionObj.detail;
    this.getWorkFlowList();
    this.createFormatDate = this.doFormatDate(this.missionObj.creator_info.time);
    this.getRelStartAndEndTime();
  }

  doFormatDate(data: any) {
    let day = this.dateService.formatWithTimezone(data, 'dd');
    let days = this.dateService.formatWithTimezone(data, 'ddS');
    let month = this.dateService.formatWithTimezone(data, 'mmm');
    let year = this.dateService.formatWithTimezone(data, 'yyyy');
    let week = this.dateService.formatWithTimezone(data, 'dddd');
    let hour = this.dateService.formatWithTimezone(data, 'HH');
    let minute = this.dateService.formatWithTimezone(data, 'MM');
    let formatDate = {
      days: days,
      day: day,
      week: week,
      month: month,
      minute: minute,
      hour: hour,
      year: year
    };
    return formatDate;
  }

  /**
   * 获取workflow列表
   */
  getWorkFlowList() {
    this.missionModelService.applicationWorkflowList({}, (data: any) => {
      if (data.status === 1) {
        this.workflowList = data.data;
        this.internalList = this.workflowList.Internal;
        this.cooperatorList = this.workflowList.Cooperator;
        for (let i in this.internalList) {
          if (parseInt(this.missionObjDetail.app_type.wid) == this.internalList[i].id) {
            this.applicationDetailData.chosenWorkflow = this.internalList[i];
          }
        }
        for (let i in this.cooperatorList) {
          if (parseInt(this.missionObjDetail.app_type.wid) == this.cooperatorList[i].id) {
            this.applicationDetailData.chosenWorkflow = this.cooperatorList[i];
          }
        }
      }
    })
  }


  getStepTitle(step: number): String {
    if (step < 0) {
      return '';
    }
    if (step === 0) {
      return 'start';
    }
    if (step % 10 === 1) {
      return step + 'st';
    }
    if (step % 10 === 2) {
      return step + 'nd';
    }
    if (step % 10 === 3) {
      return step + 'rd';
    }
    return step + 'th';
  }

  /**
   * 选择需要添加的workflow
   */
  selectWorkflow(data: any, event: any) {
    event.stopPropagation();
    this.applicationDetailData.chosenWorkflow = data;
    this.isShowSelectList = false;
    this.renderer.setElementClass(this.selectObj.toggleSelectElement, 'hide', true);
    this.toggleSelectService.emptyElement();
  }

  /**
   * 删除这个选中的workflow
   */
  deleteTheWorkflow(event: any) {
    event.stopPropagation();
    if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING) {
      this.applicationDetailData.chosenWorkflow = {};
    }
  }


  /**
   * 阻止事件冒泡专用
   */
  doSelectBox(event: any) {
    event.stopPropagation();
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

  getRelStartAndEndTime() {
    if (parseInt(this.missionObj.real_start_timestamp) > 0) {
      this.isHasRealStart = true;
      this.realStartFormatDate = this.doFormatDate(this.missionObj.real_start);
    }
    if (parseInt(this.missionObj.real_end_timestamp) > 0) {
      this.isHasRealEnd = true;
      this.realEndFormatDate = this.doFormatDate(this.missionObj.real_end);
    }


  }

  /**
   * 接收select返回值
   * @param data
   */
  getCallBackData(data: any) {
    if(data) {
      this.selectObj = data;
    }
  }


}