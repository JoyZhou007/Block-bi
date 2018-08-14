import {
  Component,
  OnInit,
  ViewEncapsulation,
  Renderer,
  Inject, Output, EventEmitter, AfterViewInit, OnDestroy, ViewChild, Input
} from '@angular/core';

import {
  TypeService,
  WorkflowSVGEle,
  WorkflowModelService,
  WorkflowStepData,
  WorkflowSVGConfig
} from '../../shared/services/index.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
import * as WorkflowConstant from '../../shared/config/workflow.config';
import { Subscription } from "rxjs/Subscription";
@Component({
  selector: 'workflow-entirety',
  templateUrl: '../template/workflow-entirety.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: []
})


export class WorkflowEntiretyComponent implements OnInit, AfterViewInit {

  @ViewChild('morePeopleDialog') morePeopleDialog: any;
  //public elements : Array<WorkflowSVGEle> = [];
  public userData: any;
  public companyData: any;
  public d3: any;
  public topCanvas: any;
  public d3Painter: any;
  public svgCanvas: any;
  public userContactDialog: any;
  public lines: any;
  public approveLines: any;
  public refuseLines: any;
  public _currentId: string;
  public _currentIds: string;
  public _workflowListData: any;
  public _workflowData: {
    status: number,
    data: any,
    message: string
  };
  public _workflowTitles: Array<any>;
  public _stepData: any;
  public _stepDataDetail: any;
  private allUser: Array<any> = [];
  private isShowMoreDialog: boolean;

  get workflowListData() {
    return this._workflowListData;
  }

  get workflowData() {
    return this._workflowData;
  }

  get stepData() {
    return this._stepData;
  }

  get stepDataDetail() {
    return this._stepDataDetail;
  }

  set workflowData(data: any) {
    this._workflowData = data;
  }

  set stepData(data: any) {
    this._stepData = data;
  }

  set stepDataDetail(data: any) {
    this._stepDataDetail = data;
  }

  set workflowListData(data: any) {
    this._workflowListData = data;
  }

  @Input() set currentId(data: any) {
    // console.log('currentId', this._currentId);
    // console.log('new id', data);

    this._currentId = data;
    if (data) {
      this.draw();
    }
  }

  get currentId() {
    return this._currentId;
  }

  @Input() set currentIds(data: any) {
    this._currentIds = data;
  }

  get currentIds() {
    return this._currentIds;
  }

  set workflowTitles(data: any) {
    this._workflowTitles = data;
  }

  get workflowTitles() {
    return this._workflowTitles;
  }

  // 用户在线同步相关变量
  public IMHasInit: any;
  public subscription: Subscription;
  public interval;

  public concurrencyUserArr: Array<any> = [];
  @Input() set setConcurrencyUserArr(data: any) {
    this.concurrencyUserArr = data;
  }
  @Output() outEditDetail = new EventEmitter<any>();
  @Output() outNewWorkflow = new EventEmitter<any>();

  constructor(@Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('d3.service') public D3Service: any,
              @Inject('file.service') public FileService: any,
              @Inject('im.service') public IMService: any,
              public workflowModelService: WorkflowModelService,
              public TypeService: TypeService,
              public renderer: Renderer,
              public activatedRoute: ActivatedRoute,
              public router: Router) {
    this.initD3Configuration();
  }





  /**
   * 顶部菜单栏，对于父子级关联的workflow，需要跳转到含有父级id的URL
   * @param data
   * @param index
   */
  changeWorkflow(data: any, index: number) {
    let newId = data.id;
    let parentIds = '';
    if (this.workflowTitles.hasOwnProperty(index - 1)) {
      for (let i = index; i > this.workflowTitles.length; i--) {
        if (this.workflowTitles.hasOwnProperty(i.toString()) && this.workflowTitles[i].hasOwnProperty('id')) {
          parentIds += '-' + this.workflowTitles[i].id;
        }
      }
    }
    this.router.navigate(['workflow/detail', newId + parentIds]);
  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  /**
   * D3相关配置初始化
   */
  initD3Configuration() {
    this.d3 = this.D3Service.getInstance();
  }

  /**
   * 初始化画布
   */
  private initCanvas() {
    //选择画布
    this.topCanvas = this.d3.select(WorkflowSVGConfig.topCanvas);
    this.d3Painter = this.d3.select(WorkflowSVGConfig.painter);
    //清除数据
    this.d3Painter.selectAll("*").remove();
    this.svgCanvas = this.d3Painter.append('svg').attr('width', '100%').attr('height', '100%').attr('x', 0).attr('y', 0);
    this.lines = this.svgCanvas.append('g').attr('class', WorkflowSVGConfig.groupLines);
    this.approveLines = this.lines.append('g').attr('class', WorkflowSVGConfig.groupAcceptLines);
    this.refuseLines = this.lines.append('g').attr('class', WorkflowSVGConfig.groupRefuseLines);
    this.userContactDialog = this.topCanvas.append('div').attr('class', 'common-list');
  }


  dealMessage(message: any) {
  }

  /**
   * 绘图主方法
   */
  public draw() {
    //this.currentId = (typeof workflowId !== 'undefined') ? workflowId : this.currentId;
    if (!this.currentId) {
      return;
    }
    //根据用户获得workflow详情
    let splitIds =  this.currentIds ? this.currentIds.split('-') : [this.currentId];
    let data = {
      'id': this.currentId,
      'ids': splitIds
    };
    this.workflowModelService.getWorkflowDetail(data, (response: any) => {
      this.workflowData = response;
      this.stepData = response.data.steps;
      this.stepDataDetail = response.data.steps_details;
      // 按照当前路由显示
      this.workflowTitles = [];
      if (splitIds.length <= 1) {
        this.workflowTitles.unshift({
          title: response.data.name,
          id: this.currentId,
        });
      } else {
        splitIds.forEach((obj: any) => {
          if (response.data.workflow_name.hasOwnProperty(obj)) {
            this.workflowTitles.unshift({
              title: response.data.workflow_name[obj],
              id: obj,
            });
          }
        });
      }

      if (response.status === 1) {
        // 画布初始化
        this.initCanvas();
        let totalSteps = this.TypeService.getDataLength(this.stepData);
        let maxTotalSubSteps = 1,
          minRefuseStep = 99999;

        for (let currentStep in this.stepData) {
          if (this.stepData.hasOwnProperty(currentStep)) {
            let obj = this.stepData[currentStep];
            // 步骤详情
            if (!this.stepDataDetail.hasOwnProperty(currentStep)) {
            } else {
              let nextSubStepCount = 0;
              let refuseStepSubStepCount = 0;
              // 查看下一步是否有子步骤，决定同意线样式
              if (this.stepData.hasOwnProperty(parseInt(currentStep) + 1)) {
                let nextObj = this.stepData[parseInt(currentStep) + 1];
                nextSubStepCount = parseInt(nextObj.sub_number);
              }
              // 查看拒绝回到的最先前的一步，用于画固定的竖直拒绝线
              let stepDetail = this.stepDataDetail[currentStep];
              if (parseInt(currentStep) > 0 && parseInt(stepDetail.refuse.after) < minRefuseStep) {
                minRefuseStep = parseInt(stepDetail.refuse.after);
              }
              // 查看拒绝回到的那一步本身是否有子步骤, 决定拒绝线样式
              if (parseInt(currentStep) > 0 &&
                this.stepData.hasOwnProperty(parseInt(stepDetail.refuse.after))) {
                let refuseObj = this.stepData[parseInt(stepDetail.refuse.after)];
                refuseStepSubStepCount = parseInt(refuseObj.sub_number);
              }
              // 是否为子步骤
              // 如果非0，表示有对应数字的子步骤
              // 如sub_number为3表示第二步中共有三个子步骤，需要有3个并行的元素
              if (obj.sub_number > 0) {
                let tmp = this.TypeService.getDataLength(stepDetail.sub);
                maxTotalSubSteps = (maxTotalSubSteps < tmp) ? tmp : maxTotalSubSteps;
                for (let currentSubStep in stepDetail.sub) {
                  if (stepDetail.sub.hasOwnProperty(currentSubStep)) {
                    let subStepDetail = stepDetail.sub[currentSubStep];
                    // 元素
                    let elePos = this.drawChild(parseInt(currentStep), parseInt(currentSubStep));
                    // 连线数据
                    let linesData = WorkflowSVGEle.calculateLines(new WorkflowStepData(
                      totalSteps,
                      stepDetail,
                      elePos.x,
                      elePos.y,
                      parseInt(currentStep),
                      nextSubStepCount,
                      refuseStepSubStepCount,
                      subStepDetail,
                      parseInt(currentSubStep)
                    ));
                    // 同意线
                    this.drawApproveLines(linesData.approve, currentStep, currentSubStep);
                    // 拒绝线
                    this.drawRefusedLines(linesData.refuse, currentStep, currentSubStep);
                  }
                }
              } else {
                // 元素
                let position = this.drawChild(parseInt(currentStep));
                // 连线数据
                let linesData = WorkflowSVGEle.calculateLines(new WorkflowStepData(
                  totalSteps,
                  stepDetail,
                  position.x,
                  position.y,
                  parseInt(currentStep),
                  nextSubStepCount,
                  refuseStepSubStepCount
                ));
                // 同意线
                this.drawApproveLines(linesData.approve, currentStep);
                // 拒绝线
                this.drawRefusedLines(linesData.refuse, currentStep);
              }
            }// end if (!this.stepDataDetail.hasOwnProperty(currentStep))
          } // end if this.stepData.hasOwnProperty(currentStep)
        }// end for
        this.drawFixRefuseLines(minRefuseStep, totalSteps - 1);
        this.resizeCanvas(maxTotalSubSteps, totalSteps);
        this.bindHighlightEvents();
      } else {
        this.dialogService.openError({
          simpleContent: 'There has an error, please try later. <br/> <b> Error: ' + response.message + '</b>',
        })
      }
    })
  }


  /**
   * 重置画布大小，使滚动条效果可以实现
   * @param maxTotalSubSteps
   * @param totalSteps
   */
  resizeCanvas(maxTotalSubSteps: number, totalSteps: number) {
    let newWidth = (maxTotalSubSteps + 1) * (WorkflowSVGConfig.width + WorkflowSVGConfig.marginX),
      newHeight = (totalSteps + 1) * (WorkflowSVGConfig.height + WorkflowSVGConfig.marginY);
    //this.topCanvas.attr('style', 'width:' + newWidth + 'px;');
    //this.d3Painter.attr('style', 'width:' + newWidth + 'px;');
    this.svgCanvas.attr('width', newWidth).attr('height', newHeight);
  }

  /**
   * 竖直中垂线, 为了避免线段重复，取最高点和最低点画一条主干
   * @param start
   * @param end
   */
  drawFixRefuseLines(start: number, end: number) {
    let lines = [
      {x: WorkflowSVGEle.refuseLineXFixed(), y: WorkflowSVGEle.calculateY(start) - WorkflowSVGConfig.marginY / 2 + 5},
      {
        x: WorkflowSVGEle.refuseLineXFixed(),
        y: WorkflowSVGEle.calculateY(end) + WorkflowSVGConfig.height + WorkflowSVGConfig.marginY / 4
      },
    ];
    this.refuseLines.append('path')
      .attr('d', this.prepareLineData(lines))
      .attr('class', WorkflowSVGEle.getLinesClass('refuse-display'))
      .attr("stroke", WorkflowSVGConfig.refuseColor)
      .attr("stroke-width", 1)
      .attr("fill", "none");
  }

  bindHighlightEvents() {
    //this.initLinesEvents();
    // 绑定Approve按钮 高亮所有同意线
    this.approveBtnEvent();
    // 绑定Refuse按钮 高亮所有拒绝线
    this.refuseBtnEvent();
  }

  /**
   * 同意按钮
   */
  approveBtnEvent() {
    var approveLines = this.svgCanvas.selectAll('path.' + WorkflowSVGEle.getLinesClass('approve'));
    var approveDisplayLines = this.svgCanvas.selectAll('path.' + WorkflowSVGEle.getLinesClass('approve-display'));
    let self = this;
    this.svgCanvas.selectAll('.' + WorkflowSVGConfig.groupAcceptBtn).on('mouseenter', (typenames: any, listener: any, capture: any) => {
      let target = this.d3.select(capture[listener]).attr('data-step');
      let filter = '[data-step="' + target + '"]';
      let relatedApproveLines = approveLines.filter(filter);
      let relatedApprDisplayLines = approveDisplayLines.filter(filter);
      if (relatedApprDisplayLines.size()) {
        self.customCancelHighlightApproveDisplay(relatedApprDisplayLines, typenames, listener, capture)
      }
      if (relatedApproveLines.size()) {
        self.customHighlightApprove(relatedApproveLines, typenames, listener, capture)
      }

    }).on('mouseleave', (typenames: any, listener: any, capture: any) => {
      let target = this.d3.select(capture[listener]).attr('data-step');
      let filter = '[data-step="' + target + '"]';
      let relatedApproveLines = approveLines.filter(filter);
      let relatedApprDisplayLines = approveDisplayLines.filter(filter);
      if (relatedApproveLines.size()) {
        self.customCancelHighlightApprove(relatedApproveLines, typenames, listener, capture)
      }
      if (relatedApprDisplayLines.size()) {
        self.customHighlightApproveDisplay(relatedApprDisplayLines, typenames, listener, capture)
      }
    });
  }

  /**
   * 拒绝按钮
   */
  refuseBtnEvent() {
    var refuseLines = this.svgCanvas.selectAll('path.' + WorkflowSVGEle.getLinesClass('refuse'));
    let self = this;
    this.svgCanvas.selectAll('.' + WorkflowSVGConfig.groupRefuseBtn).on('mouseenter', (typenames: any, listener: any, capture: any) => {
      let target = this.d3.select(capture[listener]).attr('data-step');
      let filter = '[data-step="' + target + '"]';
      let relatedRefuseLines = refuseLines.filter(filter);
      if (relatedRefuseLines.size()) {
        self.customHighlightRefuse(relatedRefuseLines, typenames, listener, capture)
      }
    }).on('mouseleave', (typenames: any, listener: any, capture: any) => {
      let target = this.d3.select(capture[listener]).attr('data-step');
      let filter = '[data-step="' + target + '"]';
      let relatedRefuseLines = refuseLines.filter(filter);
      if (relatedRefuseLines.size()) {
        self.customCancelHighlightRefuse(relatedRefuseLines, typenames, listener, capture)
      }
    });
  }

  customHighlightRefuse(obj, typenames: any, listener: any, capture: any) {
    obj.raise()
      .style('stroke', WorkflowSVGConfig.highlightRefuseColor)
      .style('stroke-width', '1');
  }

  customCancelHighlightRefuse(obj, typenames: any, listener: any, capture: any) {
    obj.lower()
      .style('stroke', WorkflowSVGConfig.refuseColor)
      .style('stroke-width', '0');
  }

  customHighlightRefuseDisplay(obj, typenames: any, listener: any, capture: any) {
    obj.raise()
      .style('stroke', WorkflowSVGConfig.highlightRefuseColor)
      .style('stroke-width', '1');
  }

  customCancelHighlightRefuseDisplay(obj, typenames: any, listener: any, capture: any) {
    obj.lower()
      .style('stroke', WorkflowSVGConfig.refuseColor)
      .style('stroke-width', '0');
  }

  customCancelHighlightApprove(obj, typenames: any, listener: any, capture: any) {
    obj
      .lower()
      .style('stroke', WorkflowSVGConfig.approveColor)
      .style('stroke-width', '0');
  }

  customHighlightApprove(obj, typenames: any, listener: any, capture: any) {
    obj
      .raise()
      .style('stroke', WorkflowSVGConfig.highlightApproveColor)
      .style('stroke-width', '1');
  }


  customCancelHighlightApproveDisplay(obj, typenames: any, listener: any, capture: any) {
    obj
      .lower()
      .style('stroke-width', '0')
  }

  customHighlightApproveDisplay(obj, typenames: any, listener: any, capture: any) {
    obj
      .raise()
      .style('stroke-width', '0.5');
  }

  /**
   * 自定义高亮效果
   */
  initLinesEvents() {
    this.svgCanvas.selectAll('svg.' + WorkflowSVGEle.getSVGClass()).raise();
    // 拒绝线的效果切换
    let self = this;
    this.svgCanvas.selectAll('.' + WorkflowSVGEle.getLinesClass('refuse')).on('highlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).raise()
        .style('stroke', WorkflowSVGConfig.highlightRefuseColor)
        .style('stroke-width', '1');
    }).on('cancelHighlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).lower()
        .style('stroke', WorkflowSVGConfig.refuseColor)
        .style('stroke-width', '0');
    });
    this.svgCanvas.selectAll('.' + WorkflowSVGEle.getLinesClass('refuse-display')).on('highlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).raise()
        .style('stroke-width', '0.5');
    }).on('cancelHighlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).lower()
        .style('stroke-width', '0');
    });
    // 同意线的效果切换
    this.svgCanvas.selectAll('.' + WorkflowSVGEle.getLinesClass('approve')).on('highlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).raise()
        .style('stroke', WorkflowSVGConfig.highlightApproveColor)
        .style('stroke-width', '1');
    }).on('cancelHighlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).lower()
        .style('stroke', WorkflowSVGConfig.approveColor)
        .style('stroke-width', '0')
    });
    this.svgCanvas.selectAll('.' + WorkflowSVGEle.getLinesClass('approve-display')).on('highlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).raise()
        .style('stroke-width', '0.5');
    }).on('cancelHighlight', (typenames: any, listener: any, capture: any) => {
      this.d3.select(capture[listener]).lower()
        .style('stroke-width', '0')

    });
  }

  /**
   * 拒绝线
   * @param refusedData
   * @param currentStep
   * @param currentSubStep
   */
  drawRefusedLines(refusedData: any, currentStep: string, currentSubStep ?: string) {
    if (parseInt(currentStep) > 0 && refusedData) {
      let lines = refusedData[0].lines;
      let displayLines = refusedData[0].displayLines;
      let triangles = refusedData[0].triangles;
      let dataStep;
      if (typeof currentSubStep != 'undefined') {
        dataStep = WorkflowSVGEle.getDataStep(parseInt(currentStep), parseInt(currentSubStep));
      } else {
        dataStep = WorkflowSVGEle.getDataStep(parseInt(currentStep));
      }
      if (displayLines) {
        displayLines.forEach((displayLine: any) => {
          if (displayLine[0].hasOwnProperty('style')) {
            var style = displayLine[0].style;
            delete displayLine[0].style;
          }
          let line = this.refuseLines.append('path')
            .attr('d', this.prepareLineData(displayLine))
            .attr('class', WorkflowSVGEle.getLinesClass('refuse-display'))
            .attr('data-step', dataStep) // 当前步骤
            .attr("stroke", WorkflowSVGConfig.refuseColor)
            .attr("stroke-width", 1)
            .attr("fill", "none");
          for (let key in style) {
            line.attr(key, style[key]);
          }
        });

      }
      if (lines) {
        this.refuseLines.append('path')
          .attr('d', this.prepareLineData(lines))
          .attr('class', WorkflowSVGEle.getLinesClass('refuse'))
          .attr('data-step', dataStep)
          .attr("stroke", WorkflowSVGConfig.refuseColor)
          .attr("stroke-width", 0)
          .attr("fill", "none");
      }
      if (triangles) {
        this.refuseLines.append('path')
          .attr('d', this.prepareTriangleData(triangles))
          .attr('class', 'refused-triangles')
          .attr('data-step', dataStep)
          .attr("stroke", WorkflowSVGConfig.refuseColor)
          .attr("fill", WorkflowSVGConfig.refuseColor);
      }
    }
  }

  /**
   * 同意线
   * @param approveData
   * @param currentStep
   * @param currentSubStep
   */
  drawApproveLines(approveData: any, currentStep: string, currentSubStep ?: string) {
    if (approveData) {
      let lines = approveData[0].lines;
      let displayLines = approveData[0].displayLines;
      let triangles = approveData[0].triangles;
      if (typeof currentSubStep != 'undefined') {
        var dataStep = WorkflowSVGEle.getDataStep(parseInt(currentStep), parseInt(currentSubStep));
      } else {
        var dataStep = WorkflowSVGEle.getDataStep(parseInt(currentStep));
      }
      if (displayLines) {
        displayLines.forEach((displayLine: any) => {
          this.approveLines.append('path')
            .attr('d', this.prepareLineData(displayLine))
            .attr('class', WorkflowSVGEle.getLinesClass('approve-display'))
            .attr('data-step', dataStep)
            .attr("stroke", WorkflowSVGConfig.approveColor)
            .attr("stroke-width", 1)
            .attr("fill", "none");
        })
      }
      if (lines) {
        lines.forEach((line: any) => {
          this.approveLines.append('path')
            .attr('d', this.prepareLineData(line))
            .attr('class', WorkflowSVGEle.getLinesClass('approve'))
            .attr('data-step', dataStep)
            .attr("stroke", WorkflowSVGConfig.highlightApproveColor)
            .attr("stroke-width", 0)
            .attr("fill", "none");
        });
      }


      if (triangles) {
        triangles.forEach((triangle: any) => {
          this.approveLines.append('path')
            .attr('d', this.prepareTriangleData(triangle))
            .attr('class', 'approve-triangles ')
            .attr('data-step', dataStep)
            .attr("stroke", WorkflowSVGConfig.approveColor)
            .attr("fill", WorkflowSVGConfig.approveColor);
        });

      }
    }
  }

  /**
   * path绘制d属性
   * @param lines
   * @returns {any}
   */
  prepareLineData(lines: any) {
    if (lines) {
      var path = this.d3.path();
      path.moveTo(lines[0].x, lines[0].y);
      lines.shift();
      lines.forEach((d: any) => {
        path.lineTo(d.x, d.y);
      });
      return path;
    }
  }

  /**
   * path三角箭头数据
   * @param triangles
   * @returns {any}
   */
  prepareTriangleData(triangles: any) {
    if (triangles) {
      var path = this.d3.path();
      path.moveTo(triangles[0].x, triangles[0].y);
      triangles.shift();
      triangles.forEach((d: any) => {
        path.lineTo(d.x, d.y);
      });
      path.closePath();
      return path;
    }
  }


  /**
   * 步骤SVG元素 包括顶部圆，内部结构与按钮
   * 返回元素起始坐标(左上角顶点)
   * @param step
   * @param subStep
   * @return {{x:number, y:number}}
   */
  drawChild(step: number, subStep ?: number) {
    // 元素最上角起始坐标
    let x = WorkflowSVGEle.calculateX(step, subStep);
    let y = WorkflowSVGEle.calculateY(step, subStep);
    // 步数标识
    let stepData = WorkflowSVGEle.getDataStep(step, subStep);
    // 判定是否外联 相关信息
    let referredStepInfo = this.getReferredWorkflowInfo(step, subStep);

    // 创建人信息
    let creator = this.getCreator(step, subStep);
    // 创建人
    let creatorId = 'creator-' + stepData;
    let topCircleFilterId = 'top-circle-filter-' + stepData;
    // 是否为待填的十字
    let isToCreate = (referredStepInfo.isReferred && referredStepInfo.wid === -1);
    let currentCID = this.companyDataService.getCurrentCompanyCID();
    let workflowCID = this.workflowData.data.cid;
    // 是否可以看到待填的十字
    let couldSeeCreate = true;
    // 是否为本公司的workflow
    let couldEdit = currentCID == workflowCID;
    if (step > 0) {
      // workflow所属于的公司步骤
      let connectForm = subStep ? this.workflowData.data.steps_details[step].sub[subStep].approver[0].form :
        this.workflowData.data.steps_details[step].approver[0].form;
      let stepWorkflowCID = subStep ? this.workflowData.data.steps_details[step].sub[subStep].cid :
        this.workflowData.data.steps_details[step].cid;
      // 如果是公司性质, 需要判断只有归属于该步骤的公司的人才可以点+
      // 如果是部门性质，必须是同公司的人才可以点加号
      if (parseInt(connectForm) === WorkflowConstant.WORKFLOW_FORM_COOPERATOR && currentCID != stepWorkflowCID) {
        couldSeeCreate = false;
      } else if (parseInt(connectForm) === WorkflowConstant.WORKFLOW_FORM_DEPARTMENT && workflowCID != currentCID) {
        couldSeeCreate = false;
      }
    }

    // topChild - 最外层
    let topChild = this.svgCanvas
      .append("svg")
      .attr("xlink", "http://www.w3.org/1999/xlink").attr('version', '1.1')
      .attr("x", x).attr("y", y).attr("width", WorkflowSVGConfig.width).attr("height", WorkflowSVGConfig.height)
      .attr('class', WorkflowSVGEle.getSVGClass())
      .attr('data-step', stepData);
    // 所有的样式定义集合
    let defs = topChild.append('defs');
    // 显示层
    let pathId = 'path-bg-' + stepData;
    defs.append('rect').attr('id', pathId)
      .attr('x', 0).attr('y', 12).attr('rx', 2)
      .attr('width', WorkflowSVGConfig.widthInner).attr('height', WorkflowSVGConfig.heightInner + 1);
    // 遮罩显示层
    let maskId = 'mask-bg-' + stepData;
    let mask = defs.append('mask').attr('id', maskId).attr('x', 0).attr('y', 0)
      .attr('maskContentUnits', 'userSpaceOnUse').attr('maskUnits', 'objectBoundingBox')
      .attr('width', WorkflowSVGConfig.widthInner).attr('height', WorkflowSVGConfig.heightInner)
      .attr('fill', 'white');
    mask.append('use').attr('xlink:href', this.router.url + '#' + pathId);
    if (!isToCreate && couldEdit) {
      // 所有人物头像图片
      if (referredStepInfo.image.length) {
        for (let i in referredStepInfo.image) {
          if (referredStepInfo.image.hasOwnProperty(i)) {
            let id = 'radiusImage-' + stepData + '-' + i;
            // 如果是职位
            if (referredStepInfo.image[i].psid !== '') {
              defs.append('pattern').attr('id', 'pattern-' + id).attr('patternUnits', 'objectBoundingBox').attr('x', '0%')
                .attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize)
                .append('use').attr('xlink:href', this.router.url + '#image-' + id);
              defs.append('image').attr('id', 'image-' + id).attr('xlink:href', () => {
                if (typeof referredStepInfo.image[i].user_profile_path !== 'undefined'
                  && referredStepInfo.image[i].user_profile_path !== '') {
                  return this.config.resourceDomain + this.FileService.getImagePath(WorkflowSVGConfig.imgSize, referredStepInfo.image[i].user_profile_path);
                } else {
                  return this.FileService.getDefaultImagePath();
                }
              }).attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('class', 'the-person-list-img');
            }
          }
        }
      }
    }
    // 创建人信息
    defs.append('pattern').attr('id', 'pattern-' + creatorId)
      .attr('patternUnits', 'objectBoundingBox').attr('x', '0%')
      .attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize)
      .append('use').attr('xlink:href', this.router.url + '#image-' + creatorId);
    defs.append('image').attr('id', 'image-' + creatorId).attr('xlink:href', () => {
      return this.config.resourceDomain + this.FileService.getImagePath(WorkflowSVGConfig.imgSize, creator.creator_profile);
    }).attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('class', 'the-person-list-img');
    // top circle
    let circle1Id = 'top-circle1-' + stepData;
    let circle2Id = 'top-circle2-' + stepData;
    defs.append('circle').attr('id', circle1Id)
      .attr('cx', WorkflowSVGConfig.widthInner / 2)
      .attr('cy', 12).attr('r', 12);
    // top circle filter
    let filter = defs.append('filter').attr('xmlns', 'http://www.w3.org/2000/svg').attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%').attr('filterUnits', 'objectBoundingBox')
      .attr('id', topCircleFilterId);
    filter.append('feOffset').attr('dx', 0).attr('dy', 1).attr('in', 'SourceAlpha').attr('result', 'shadowOffsetOuter1');
    filter.append('feGaussianBlur').attr('stdDeviation', 1).attr('in', 'shadowOffsetOuter1')
      .attr('result', 'shadowBlurOuter1');
    filter.append('feColorMatrix').attr('values', '0 0 0 0 0.534704507   0 0 0 0 0.534704507   0 0 0 0 0.534704507  0 0 0 0.5 0')
      .attr('type', 'matrix').attr('in', 'shadowBlurOuter1');
    defs.append('circle').attr('id', circle2Id)
      .attr('cx', WorkflowSVGConfig.widthInner / 2)
      .attr('cy', 12).attr('r', 6);
    let circleMask1 = defs.append('mask').attr('id', 'top-circle-mask1-' + stepData)
      .attr('maskContentUnits', 'userSpaceOnUse').attr('maskUnits', 'objectBoundingBox')
      .attr('x', '-2').attr('y', '-2').attr('width', 16).attr('height', 16);
    circleMask1.append('rect').attr('x', 117).attr('y', 4).attr('width', 16).attr('height', 16).attr('fill', 'white');
    circleMask1.append('use').attr('xlink:href', this.router.url + '#' + circle2Id).attr('fill', 'black');
    let circleMask2 = defs.append('mask').attr('id', 'top-circle-mask2-' + stepData)
      .attr('maskContentUnits', 'userSpaceOnUse').attr('maskUnits', 'objectBoundingBox')
      .attr('x', '-0.5').attr('y', '-0.5').attr('width', 13).attr('height', 13);
    circleMask2.append('rect').attr('x', 118.5).attr('y', '5.5').attr('width', 13).attr('height', 13).attr('fill', 'white');
    circleMask2.append('use').attr('xlink:href', this.router.url + '#' + circle2Id).attr('fill', 'black');
    let circleMask3 = defs.append('mask').attr('id', 'top-circle-mask3-' + stepData)
      .attr('maskContentUnits', 'userSpaceOnUse').attr('maskUnits', 'objectBoundingBox')
      .attr('x', '0').attr('y', '0').attr('width', 12).attr('height', 12).attr('fill', 'white');
    circleMask3.append('use').attr('xlink:href', this.router.url + '#' + circle2Id);
    // 正式元素开始
    let childG1 = topChild.append('g').attr('stroke', 'none').attr('stroke-width', 1).attr('fill', 'none').attr('fill-rule', 'evenodd');
    let childG2 = childG1.append('g');
    let childG3 = childG2.append('g');
    let childG4 = childG3.append('g');
    let childG5 = childG4.append('g');
    let child = childG5.append('g');

    if (isToCreate) {
      child.attr('class', 'add-across');
      child.append('rect').attr('x', 0).attr('y', 12).attr('rx', 2)
        .attr('width', WorkflowSVGConfig.widthInner).attr('height', WorkflowSVGConfig.heightInner)
        .attr('fill', '#C8C9D5');
    } else {
      child.append('use').attr('stroke', '#979797').attr('stroke-width', '0.4').attr('fill', '#7078F7')
        .attr('mask', 'url(' + this.router.url + '#' + maskId + ')')
        .attr('xlink:href', this.router.url + '#' + pathId);
    }

    // 同意按钮
    let g1 = child.append('g').attr('class', WorkflowSVGConfig.groupAcceptBtn).attr('data-step', stepData);
    g1.append('path').attr('d', 'M0,123 L125,123 L125,143 L2.00136642,143 C0.896042268,143 0,142.101788 0,141.009205 L0,123 Z')
      .attr('fill', 'white');
    // .attr('class', WorkflowSVGConfig.acceptBtnClass).attr('data-step', stepData)
    // .attr('fill', '#FFFFFF').attr('x', 0).attr('y', 123).attr('width', WorkflowSVGConfig.widthInner / 2)
    // .attr('height', WorkflowSVGConfig.btnHeight).attr('rx', 2);
    // 按钮文字
    g1.append('text').attr('font-size', 10).attr('font-weight', 400).attr('fill', '#9193AB')
      .append('tspan').attr('x', this.translateService.lan == 'zh-cn' ? 50.47 : 39.47).attr('y', 136).text(this.translateService.manualTranslate('APPROVE'));

    //拒绝按钮
    let g2 = child.append('g').attr('class', WorkflowSVGConfig.groupRefuseBtn).attr('data-step', stepData);
    g2.append('path').attr('d', 'M250,123 L125,123 L125,143 L247.998634,143 C249.103958,143 250,141.718486 250,140.134488')
      .attr('fill', '#000000')
      .attr('class', WorkflowSVGConfig.refuseBtnClass)
      .attr('data-step', stepData);
    // 按钮文字
    g2.append('text').attr('font-size', 10).attr('font-weight', 400).attr('fill', '#ffffff')
      .append('tspan').attr('x', this.translateService.lan == 'zh-cn'? 178.865 : 167.865).attr('y', 136).text(this.translateService.manualTranslate('REFUSE'));

    if (!isToCreate && couldEdit) {
      // 外联图案
      child.append('rect').attr('fill', '#CECECE').attr('x', 10)
        .attr('y', 101.266667).attr('width', 14).attr('height', 3.73333333).attr('rx', 1);
      child.append('rect').attr('fill', '#CECECE').attr('x', 10)
        .attr('y', 96.1333333).attr('width', 10.2666667).attr('height', 3.73333333).attr('rx', 1);
      child.append('rect').attr('fill', '#CECECE').attr('x', 10)
        .attr('y', 91).attr('width', 7.46666667).attr('height', 3.73333333).attr('rx', 1);
      child.append('path').attr('d', 'M17.2333333,93.1 L18.1763223,93.1 C18.6971207,93.1 19.1193113,93.522681 19.1193113,94.0451708 L19.1193113,96.1398709')
        .attr('stroke', '#CECECE');
      child.append('path').attr('d', 'M20.2666667,98 L21.2096556,98 C21.7304541,98 22.1526446,98.422681 22.1526446,98.9451708 L22.1526446,101.039871')
        .attr('stroke', '#CECECE');
      // applicant
      let headText = '';
      if (step === 0) {
        headText = 'APPLICANT';
      } else {
        headText = 'APPROVER';
      }
      child.append('text').attr('fill', '#FFFFFF').attr('font-size', 13).attr('font-weight', 400)
        .append('tspan').attr('x', 10).attr('y', 35).text(this.translateService.manualTranslate(headText));
      // 人物头像图片圆角
      for (let i in referredStepInfo.image) {
        if (referredStepInfo.image.hasOwnProperty(i)) {
          let id = 'pattern-radiusImage-' + stepData + '-' + i;
          let x = 7 + 30.5 * parseInt(i);
          let y = 45;
          if (referredStepInfo.image[i].psid !== '') {
            let img = child.append('rect').attr('stroke', '#979797').attr('stroke-width', '0.2')
              .attr('fill', 'url(' + this.router.url + '#' + id + ')')
              .attr('x', x).attr('y', y).attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('rx', 2);
            if (referredStepInfo.image[i].psid != this.userDataService.getCurrentCompanyPSID()) {
              img.on('click', () => {
                this.notificationService.postNotification({
                  act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
                  data: {
                    selector: 'bi-mini-dialog',
                    options: {
                      member: {uid: referredStepInfo.image[i].psid, work_name: referredStepInfo.image[i].name},
                      form: 2
                    }
                  }
                });
              })
            }
          } else {
            let g = child.append('g').attr('class', 'no-profile-image')
              .attr('transform', 'translate(' + x + ',' + y + ')');
            g.append('rect').attr('stroke', '#979797').attr('stroke-width', '0.2')
              .attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('rx', 2)
              .attr('class', 'd-letter-a');
            g.append('text').attr('fill', '#FFF').attr('font-size', '12px')
              .append('tspan').attr('text-anchor', 'middle')
              .attr('x', 12).attr('y', 16).text(referredStepInfo.image[i].name);
          }

        }
      }
      /**
       * 如果人数超过7个，显示额外人数
       */
      if (referredStepInfo.extraCount > 0) {
        let morePeopleG = child.append('g').attr('style', 'cursor:pointer');
        morePeopleG.append('rect').attr('stroke', '#979797')
          .attr('stroke-width', '0.2').attr('fill', '#4C4B63').attr('x', 220).attr('y', 45)
          .attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('rx', 2);
        morePeopleG.append('text').attr('fill', '#FFFFFF').attr('font-size', 13).attr('font-weight', 'normal')
          .append('tspan').attr('x', 224).attr('y', '62').text('+' + referredStepInfo.extraCount);
        morePeopleG.on('click', (event: any) => {
          // alert('待显示列表弹窗');
          let evt: any = this.d3.event;
          this.renderer.setElementStyle(this.morePeopleDialog.nativeElement, 'left', evt.pageX - 31 + 'px');
          this.renderer.setElementStyle(this.morePeopleDialog.nativeElement, 'top', evt.pageY + 'px');
          this.isShowMoreDialog = true;
          this.allUser = referredStepInfo.allUser;
          //this.toggleExecutorList(referredStepInfo.allUser,x,y);
        })
      }
      // 分隔线
      child.append('path').attr('d', 'M0,78.25 L250,78.25')
        .attr('stroke', '#FFFFFF').attr('stroke-width', '0.5').attr('stroke-linecap', 'square');
      // 创建者信息
      child.append('text').attr('fill', '#CECECE').attr('font-size', 12).attr('font-weight', 'normal')
        .append('tspan').attr('x', 175).attr('y', 101).text(this.translateService.manualTranslate('Creator'));
      child.append('rect').attr('stroke', '#979797').attr('stroke-width', '0.2')
        .attr('fill', 'url(' + this.router.url + '#pattern-' + creatorId + ')')
        .attr('x', 220).attr('y', 88).attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('rx', 2);
      if (referredStepInfo.isReferred && referredStepInfo.stepCount > 0) {
        // 外联步骤数
        child.append('text').attr('font-family', 'Helvetica')
          .attr('font-size', 12).attr('font-weight', 'normal').attr('fill', '#CECECE')
          .append('tspan').attr('x', 30).attr('y', 101).text(referredStepInfo.stepCount);
      }
    } else if (isToCreate && couldSeeCreate) {
      // 创建者信息
      child.append('rect').attr('stroke', '#979797').attr('stroke-width', '0.2')
        .attr('fill', 'url(' + this.router.url + '#pattern-' + creatorId + ')')
        .attr('x', 10).attr('y', 22).attr('width', WorkflowSVGConfig.imgSize).attr('height', WorkflowSVGConfig.imgSize).attr('rx', 2);

      child.append('path').attr('fill', '#9193AB')
        .attr('d', 'M123.800001,61.2000127 L113.99668,61.2000127 C113.446229,61.2000127 113,60.7598134 113,60.1960975 L113,59.8039157 C113,59.2494687 113.450313,58.8000005 113.99668,58.8000005 L123.800001,58.8000005 L123.800001,48.9966797 C123.800001,48.4462287 124.240198,48 124.803911,48 L125.196091,48 C125.750535,48 126.200001,48.4503126 126.200001,48.9966797 L126.200001,58.8000005 L136.00332,58.8000005 C136.553771,58.8000005 137,59.2401998 137,59.8039157 L137,60.1960975 C137,60.7505445 136.549687,61.2000127 136.00332,61.2000127 L126.2,61.2000127 L126.2,71.0033335 C126.2,71.5537845 125.759803,72.0000132 125.19609,72.0000132 L124.80391,72.0000132 C124.249466,72.0000132 123.8,71.5497006 123.8,71.0033335 L123.800001,61.2000127 Z');
      child.append('text').attr('font-size', 16).attr('font-weight', '400').attr('fill', '#9193AB')
        .attr('font-family', 'HelveticaNeue-Medium, Helvetica Neue')
        .append('tspan').attr('x', this.translateService.lan == 'zh-cn' ? '94.169' : '60.196').attr('y', '95').text(this.translateService.manualTranslate('NEW WORKFLOW'));
      child.on('click', () => {
        // // TODO 如果是外联的公司并且和当前用户psid不匹配，不能点击加号
        this.outNewWorkflow.emit([step, subStep, this.workflowData, true]);
      });
    }
    if (couldEdit) {
      // 编辑按钮
      // child.append('image').attr('x', 220).attr('y', 19).attr('width', 24).attr('height', 24)
      //   .attr('class', 'workflow-edit')
      // IE下需要添加此属性才能绑定SVG的click事件
      // @see https://stackoverflow.com/questions/10086341/svg-element-not-receiving-events-in-opera-and-ie
      // 220 20
      // .attr('style', 'pointer-events:visible;cursor:pointer;display:none;')
      // .attr('xlink:href', '/assets/images/workflow-edit.png')
      // .on('click', (e: any) => {
      //   this.d3.event.stopPropagation();
      //   this.outEditDetail.emit([step, subStep, this.workflowData, false]);
      // });
      let newChild: any = child.append('svg');
      newChild.attr('class', 'workflow-edit').attr('x', 226).attr('y', 25)
        .attr('style', 'pointer-events:visible;cursor:pointer;display:none;');
      newChild.html('<rect x="0" y="0" width="13" height="13" style="cursor:pointer;" ></rect><path fill="#fff" d="M11.2060469,4.18271455 L9.82974897,5.55879652 L8.13503993,3.86435347 L6.44033089,2.16991041 L7.81662887,0.793828441 C8.05574451,0.554443033 8.44638201,0.554135734 8.68611235,0.793828441 L11.2060469,3.31336754 C11.4454699,3.55306025 11.4454699,3.94302184 11.2060469,4.18271455 L11.2060469,4.18271455 Z M4.42536672,10.9620233 L3.55188774,10.0883741 L8.52137458,5.11966719 L9.3951609,5.99331638 L4.42536672,10.9620233 Z M1.88729867,11.2705508 C1.87254603,11.2293728 1.85072442,11.1900386 1.81753099,11.1571577 L0.818961957,10.1584381 C0.792530151,10.1320104 0.761488147,10.1138798 0.729524103,10.0991295 L0.860453745,8.26640221 L3.44646786,10.8520105 L3.73260753,11.1381052 L1.88729867,11.2705508 Z M0.639164208,11.3602819 L0.673279679,10.8821257 L1.11739549,11.3258645 L0.639164208,11.3602819 Z M7.29198826,3.89047383 L7.70045187,4.29887332 L8.08678652,4.68514734 L3.11729968,9.65385422 L2.73096503,9.26758021 L2.32250142,8.85918071 L7.29198826,3.89047383 Z M6.00574283,2.60443027 L6.8574002,3.45595397 L1.88791336,8.42466086 L1.03625599,7.57313715 L6.00574283,2.60443027 Z M7.38204081,0.359308586 L5.7884488,1.95265049 L0.384373894,7.35587722 C0.380685735,7.3595648 0.379456349,7.36448158 0.376075537,7.36847646 C0.354561276,7.39213843 0.337042521,7.41825879 0.323826618,7.44714483 C0.321675192,7.45206161 0.317987033,7.45605648 0.316142954,7.46097326 C0.305078477,7.489552 0.297394812,7.51966724 0.295243386,7.55131897 L0.000805363296,11.6703459 C-0.00564891487,11.7591552 0.0269298225,11.8464279 0.0899358713,11.909424 C0.148024375,11.9675034 0.225783059,11.9994625 0.307229903,11.9994625 C0.314298874,11.9994625 0.321982539,11.9991552 0.32905151,11.9988479 L4.44749567,11.7032269 C4.47945972,11.7007685 4.51019437,11.6927787 4.53908495,11.6814087 C4.54492454,11.6789503 4.54953474,11.6749554 4.55537432,11.6721897 C4.58272817,11.6592832 4.60731589,11.6429964 4.62944485,11.6227147 C4.63344035,11.6190271 4.63897259,11.6177979 4.6429681,11.613803 L10.047043,6.21057631 L11.640635,4.61723441 C12.1197883,4.13784899 12.1197883,3.3579258 11.640635,2.87884769 L9.12070041,0.359308586 C8.6409324,-0.119769529 7.86150147,-0.119769529 7.38204081,0.359308586 Z" id="Shape"></path>')
        .on('click', (e: any) => {
          this.d3.event.stopPropagation();
          this.outEditDetail.emit([step, subStep, this.workflowData, false]);
        });
      child.on('mouseenter', () => {
        child.select('.workflow-edit').attr('style', 'pointer-events:visible;cursor:pointer;');
      });
      child.on('mouseleave', () => {
        child.select('.workflow-edit').attr('style', 'pointer-events:visible;cursor:pointer;display:none;');
      });

    }


    // 顶部圆
    let gCircle1 = child.append('g')
      .attr('data-step', stepData);
    gCircle1.append('use').attr('fill', 'black').attr('fill-opacity', 1)
      .attr('filter', 'url(' + this.router.url + '#' + topCircleFilterId + ')')
      .attr('xlink:href', this.router.url + '#top-circle1-' + stepData);
    gCircle1.append('use').attr('fill', '#FFFFFF').attr('fill-rule', 'evenodd')
      .attr('xlink:href', this.router.url + '#top-circle1-' + stepData);

    let gCircle2 = child.append('g')
      .attr('data-step', stepData);
    gCircle2.append('use').attr('stroke', '#9193AB').attr('stroke-width', 3)
      .attr('fill', '#9193AB').attr('fill-rule', 'evenodd')
      .attr('xlink:href', this.router.url + '#top-circle2-' + stepData);
    gCircle2.append('use').attr('stroke', '#9193AB').attr('stroke-width', 4)
      .attr('mask', 'url(' + this.router.url + '#top-circle-mask1-' + stepData + ')')
      .attr('xlink:href', this.router.url + '#top-circle2-' + stepData);
    gCircle2.append('use').attr('stroke', '#FFFFFF').attr('stroke-width', 1)
      .attr('mask', 'url(' + this.router.url + '#top-circle-mask2-' + stepData + ')')
      .attr('xlink:href', this.router.url + '#top-circle2-' + stepData);
    gCircle2.append('use').attr('stroke', '#FFFFFF').attr('stroke-width', 6)
      .attr('mask', 'url(' + this.router.url + '#top-circle-mask3-' + stepData + ')')
      .attr('xlink:href', this.router.url + '#top-circle2-' + stepData);

    // TODO: 检查是否有看外联的权限
    if (referredStepInfo.isReferred && !isToCreate) {
      let expandBtn = topChild.append('g').attr('stroke', 'none')
        .on('click', () => {
          let newId = referredStepInfo.wid + '-' + this.currentIds;
          this.router.navigate(['workflow/detail', newId]);
        });
      expandBtn.append('rect').attr('width', 140).attr('height', 20).attr('y', 0).attr('x', 57)
        .attr('fill-opacity', '0.636435688').attr('fill', '#000000').attr('rx', 10);
      expandBtn.append('text').attr('font-family', 'HelveticaNeue-Medium, Helvetica Neue').attr('font-size', 12)
        .attr('font-weight', 400).attr('fill', '#FFFFFF')
        .attr('class', 'wo-detail-button').append('tspan').attr('x', 65).attr('y', 14)
        .text(this.translateService.manualTranslate('click to expand detail'));
    }
    return {x: x, y: y};
  }

  /**
   * 职务
   * @param type
   * @returns {boolean}
   */
  isPositionType(type: number): boolean {
    return type == WorkflowConstant.WORKFLOW_FORM_POSITION;
  }

  /**
   * 职位
   * @param type
   * @returns {boolean}
   */
  isPositionStructureType(type: number): boolean {
    return type == WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE;
  }


  /**
   * 得到创建人信息
   * @param step
   * @param subStep
   * @returns {{creator_name: string, creator_profile: string}}
   */
  getCreator(step: number, subStep?: number) {
    let obj: any = {};
    if (step !== 0) {
      obj = this.stepDataDetail[step];
      if (subStep) {
        obj = this.stepDataDetail[step].sub[subStep];
      }
    } else {
      obj = this.workflowData.data;
    }
    return {
      'creator_name': obj.creator_name,
      'creator_profile': obj.creator_profile,
    }
  }

  /**
   * 确认是否为外联步骤
   * step 中 wid 为-1代表待填的 0为无外联 其余代表存在的外联id
   * isReferred 是否为外联
   * stepCount  子步骤数量
   * wid        外联workflow id
   * image      executor 显示用信息数组
   * title      显示名字
   * extraCount 如果超过允许显示的人数，统计未能显示的人数 （比如最多允许7个， 共有10个approver，则显示+3）
   * allUser    所有executor 信息数组
   * @param step
   * @param subStep
   * @returns {
   *  {
   *   isReferred: boolean,
   *   stepCount: number,
   *   wid: number,
   *   image: Array,
   *   extraCount: number,
   *   allUser: Array
   *   }
   *  }
   */
  getReferredWorkflowInfo(step: number, subStep?: number) {
    let imgData: Array<any> = [];
    let allUser: Array<any> = [];
    let count = 0;

    let wid = 0;
    let connectInfo: any = {};
    let maxNumber = WorkflowSVGConfig.userImageMax;
    if (step === 0) {
      let applicant = this.workflowData.data.applicant;
      let extraCount = 0;
      applicant.forEach((appl: any) => {
        if (this.isPositionType(parseInt(appl.form)) || this.isPositionStructureType(parseInt(appl.form))) {
          if (appl.hasOwnProperty('info')) {
            appl.info.forEach((obj: any) => {
              obj.p_name = obj.name;
              if (obj.psid == this.userDataService.getCurrentCompanyPSID()) {
                obj['isSelf'] = true;
              }
              allUser.push(obj);
              if (imgData.length <= maxNumber) {
                imgData.push(obj);
              } else {
                extraCount++;
              }
            });
          }

        } else {
          //如果是外联，取首字母作为图案
          let titleName = appl.name ? appl.name.charAt(0) : '';
          if (imgData.length <= maxNumber) {
            imgData.push({
              name: titleName,
              psid: ''
            });
          } else {
            extraCount++;
          }
        }
      });
      return {
        isReferred: false,
        stepCount: 0,
        wid: 0,
        image: imgData,
        extraCount: extraCount,
        allUser: allUser
      };
    }
    let extraCount = 0;
    // 无子步骤
    if (!("sub" in this.stepDataDetail[step])) {
      wid = parseInt(this.stepDataDetail[step]['wid']);
      count = parseInt(this.stepDataDetail[step]['other_w_numbers']);
      for (let i in this.stepDataDetail[step].approver) {
        if (this.stepDataDetail[step].approver.hasOwnProperty(i)) {
          let info = this.stepDataDetail[step].approver[i];
          if (this.isPositionType(parseInt(info.form)) || this.isPositionStructureType(parseInt(info.form))) {
            info.info.forEach((obj: any) => {
              allUser.push(obj);
              if (imgData.length <= maxNumber) {
                imgData.push(obj);
              } else {
                extraCount++;
              }
            });
          } else {
            //如果是外联，取首字母作为图案

            let titleName = info.name ? info.name.charAt(0) : '';
            if (info.form == 5) {
              titleName = 'D';
            }
            if (imgData.length <= maxNumber) {
              imgData.push({
                name: titleName,
                psid: ''
              });
            } else {
              extraCount++;
            }
          }
        }
      }
      // 有子步骤
    } else {
      //console.log('有子步骤 this.stepDataDetail[step]', this.stepDataDetail, step, subStep, this.stepDataDetail[step].sub[subStep]);
      wid = parseInt(this.stepDataDetail[step].sub[subStep]['wid']);
      count = parseInt(this.stepDataDetail[step].sub[subStep]['other_w_numbers']);

      if (this.stepDataDetail[step].sub.hasOwnProperty(subStep)) {
        let subAppr = this.stepDataDetail[step].sub[subStep].approver;
        subAppr.forEach((subInfo: any) => {
          if (this.isPositionType(parseInt(subInfo.form)) || this.isPositionStructureType(parseInt(subInfo.form))) {
            subInfo.info.forEach((subObj: any) => {
              allUser.push(subObj);
              if (imgData.length <= maxNumber) {
                imgData.push(subObj);
              } else {
                extraCount++;
              }
            })
          } else if (parseInt(subInfo.form) == WorkflowConstant.WORKFLOW_FORM_DEPARTMENT
            || parseInt(subInfo.form) == WorkflowConstant.WORKFLOW_FORM_COOPERATOR) {
            //如果是外联，取首字母作为图案

            let titleName = subInfo.name ? subInfo.name.charAt(0) : '';
            if (imgData.length <= maxNumber) {
              imgData.push({
                name: titleName,
                psid: ''
              });
            } else {
              extraCount++;
            }
          }
        });
      }
    }
    if (wid === -1) {
      connectInfo = {
        isReferred: true,
        stepCount: count,
        wid: wid,
        image: imgData,
        extraCount: 0,
        allUser: allUser
      };
    } else if (wid === 0) {
      connectInfo = {
        isReferred: false,
        stepCount: count,
        wid: wid,
        image: imgData,
        extraCount: extraCount,
        allUser: allUser
      };
    } else {
      connectInfo = {
        isReferred: true,
        stepCount: count,
        wid: wid,
        image: imgData,
        extraCount: extraCount,
        allUser: allUser
      };
    }
    return connectInfo;
  }

  /**
   * 对于超出显示宽度的 申请人/同意人列表，使用统一弹窗
   * @param data
   * @param x
   * @param y
   */
  toggleExecutorList(data: Array<any>, x: number, y: number) {
    let px = 106 + x + WorkflowSVGConfig.width;
    let py = 55 + y + WorkflowSVGConfig.marginY;
    this.userContactDialog.selectAll("*").remove();
    this.userContactDialog.classed('hide', false);
    //TODO 改成CSS class
    //@see .contact-per-common .common-list
    this.userContactDialog
      .attr('style', 'position: absolute;z-index: 20;' +
        'width : 320px;' +
        'height: 350px;' +
        'top   : ' + py + 'px;' +
        'left  : ' + px + 'px;' +
        'box-shadow: 0 2px 2px rgba(190,190,191,.4), 5px 0 5px rgba(190,190,191,.6), 0 8px 8px rgba(0,0,0,.5), -5px 0 5px rgba(190,190,191,.6);    ' +
        '-moz-border-radius: 4px;' +
        '-webkit-border-radius: 4px;' +
        '-ms-border-radius: 4px;' +
        '-o-border-radius: 4px;' +
        'border-radius: 4px;' +
        'background: #fff;'
      );
    /**
     * TODO: 改成CSS class
     * @see contact-per-common .common-list .common-title
     */
    let commonDialog = this.userContactDialog.append('div')
      .attr('class', 'common-title')
      .attr('style', 'height: 30px;' +
        'line-height: 30px;' +
        'background: #1f2532;' +
        '-moz-border-radius: 4px 4px 0 0;' +
        '-webkit-border-radius: 4px 4px 0 0;' +
        '-ms-border-radius: 4px 4px 0 0;' +
        '-o-border-radius: 4px 4px 0 0;' +
        'border-radius: 4px 4px 0 0;' +
        'color: #85919c;' +
        'padding-left: 12px;' +
        'padding-right: 12px;'
      );
    commonDialog.append('span').attr('class', 'pull-left').text(this.translateService.manualTranslate('Contact List'));
    /**
     * TODO: 改成CSS class
     * @see .contact-per-common .common-list .common-title em
     */
    let closeIcon = commonDialog.append('em').attr('class', 'pull-right public icon')
      .attr('style', 'display: block;' +
        'width: 8px;' +
        'height: 8px;' +
        'background-position: -107px -14px;' +
        'margin-top: 10px;' +
        'cursor: pointer;' +
        'background: url(/assets/images/icon.png) center center no-repeat red;'
      );
    closeIcon.on('click', () => {
      this.userContactDialog.classed('hide', true);
      this.userContactDialog.selectAll("*").remove();
    });
    // data.forEach((info: any) => {
    //
    // });
  }

  /**
   * closeMorePeopleDialog
   */
  closeMorePeopleDialog(event: any) {
    this.isShowMoreDialog = false;
  }


  /**
   * 切换到聊天框
   * @param event
   * @param data
   */
  friendShowChat(event: any, data: any) {
    event.stopPropagation();
    let chatData = {
      isFriend: true,
      form: 2,
      friendType: 2,
      uid: data.psid
    };
    //显示聊天框
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
      data: chatData
    });
  }


}
