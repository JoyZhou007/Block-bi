import {Component, OnInit, Inject, HostListener, EventEmitter, Output, Renderer} from '@angular/core';
import {MissionModelService} from "../../../shared/services/model/mission-model.service";

@Component({
  selector: 'mission-create-application',
  templateUrl: '../../template/create/mission-create-application.component.html'
})

export class MissionCreateApplicationComponent {

  public workflowList: any = {};
  public internalList: Array<any> = [];
  public cooperatorList: Array<any> = [];
  public createApplicationData: any = {};
  private selectObj: any;

  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
  }

  constructor(
    private renderer: Renderer,
    public missionModelService: MissionModelService,
    @Inject('dialog.service') public dialogService: any,
    @Inject('toggle-select.service') public toggleSelectService: any
  ) {}

  //初始化页面后
  ngOnInit() {
    this.createApplicationData = {
      missionDescription: '',
      chosenWorkflow: {}
    };
    this.getWorkFlowList();
  }


  /**
   * 获取workflow列表
   */
  getWorkFlowList() {
    this.missionModelService.applicationWorkflowList({}, (data: any) => {
      if (data.status === 1) {
        this.workflowList = data.data;
        this.internalList = this.workflowList.Internal ? this.workflowList.Internal : [];
        this.cooperatorList = this.workflowList.Cooperator ? this.workflowList.Cooperator : [];
      }
    })
  }


  /**
   * 选择需要添加的workflow
   */
  selectWorkflow(data: any, event: any) {
    event.stopPropagation();
    this.createApplicationData.chosenWorkflow = data;
    this.renderer.setElementClass(this.selectObj.toggleSelectElement, 'hide', true);
    this.toggleSelectService.emptyElement();
  }

  /**
   * 删除这个选中的workflow
   */
  deleteTheWorkflow(event: any) {
    event.stopPropagation();
    this.createApplicationData.chosenWorkflow = {};
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

