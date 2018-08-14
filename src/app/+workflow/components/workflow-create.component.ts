import {
  AfterContentChecked,
  Component,
  EventEmitter,
  Inject, Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer
} from "@angular/core";
import { UserModelService, WorkflowModelService } from "../../shared/services/index.service";
import { Router } from "@angular/router";
import { WorkflowUploadData } from "../../shared/services/model/entity/workflow-entity";
import * as WorkflowConstant from "../../shared/config/workflow.config";
import { DropdownSettings } from "../../dropdown/dropdown-setting";
import { DropdownOptionModel } from "../../dropdown/dropdown-element";
import { Subscription } from "rxjs/Subscription";
import { ContactModelService } from "../../shared/services/model/contact-model.service";
import { el } from '@angular/platform-browser/testing/browser_util';
import { TextConst } from "../../shared/config/text-const.config";

@Component({
  selector: 'workflow-create',
  templateUrl: '../template/workflow-create.component.html',
  providers: [UserModelService, ContactModelService]
})
export class WorkflowCreateComponent implements OnInit, AfterContentChecked, OnDestroy {
  private POSITION_VACANCY: string = TextConst.JOB_VACANCY;
  public isNewType: number = WorkflowConstant.WORKFLOW_ACT_NEW;
  public isActive: boolean = false;
  public hasInited: boolean = false;
  private scrollToStepNumber: number = -1;
  public editType: number;
  public hasUnsavedData: boolean = false;
  public _currentId: string;
  public _currentIds: string;
  public _activeSteps: string;
  public isValid: boolean = true; // TODO: 验证
  public departmentList: Array<{ form: number, name: string, reid: number }> = [];
  public internalContactList: any = [];
  public toggleIn: any = {
    //removeToggleClass: 'show',
    toggleClass: 'show'
  };

  // workflow外联下拉列表相关参数
  public connectDropdownSettings: DropdownSettings;
  public connectDropdownOptions: Array<DropdownOptionModel> = [];
  public connectSelectedOptions: Array<DropdownOptionModel> = [];
  public connectDropdownHasInited: boolean = false;

  // workflow申请人下拉列表相关参数
  public applDropdownSettings: DropdownSettings;
  public applDropdownOptions: Array<DropdownOptionModel> = [];
  public applSelectedOptions: Array<DropdownOptionModel> = [];
  public applDropdownHasInited: boolean = false;

  // 同意人下拉列表 （非外联）
  public execDropdownSettings: DropdownSettings;
  public execDropdownOptions: any = [];
  public execDropdownHasInited: boolean = false;

  // workflow的内部连接人，成员为自身 + Internal分组 下拉列表
  public internalConnecterDropdownSettings: DropdownSettings;
  public internalConnecterDropdownOptions: Array<DropdownOptionModel> = [];
  public internalConnecterSelectedOptions: Array<DropdownOptionModel> = [];
  public internalConnecterDropdownHasInited: boolean = false;

  // workflow的外部连接人，成员为根据workflow选出的可选内部人员
  public externalConnecterDropdownSettings: DropdownSettings;
  public externalConnecterDropdownOptions: Array<DropdownOptionModel> = [];
  public externalConnecterSelectedOptions: Array<DropdownOptionModel> = [];
  public externalConnecterDropdownHasInited: boolean = false;
  public applyForPlaceHolder: string = 'People can apply for';
  public execDropdownPlaceHolder: string = 'Anyone in a reply that jump next step';


  public isConnect: boolean = false; // 是否外联别的Workflow


  private _workflowData: any;
  public subscription: Subscription;
  public executorTypes = {
    approver: {
      id: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_APPROVER,
      name: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_NAME_APPROVER
    },
    operator: {
      id: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_OPERATOR,
      name: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_NAME_OPERATOR
    }
  }; // 已废弃
  @Output() outRedirectToNew = new EventEmitter<any>();
  @Output() outRefreshEntirety = new EventEmitter<any>();
  private btnFail: string = '';

  constructor(public renderer: Renderer,
              public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              public workflowModelService: WorkflowModelService,
              public router: Router) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
    if (!this.currentId) {
    }
    this.connectDropdownSettings = new DropdownSettings();
    this.applDropdownSettings = new DropdownSettings();
    this.applDropdownSettings.isMultiple = true;
    this.execDropdownSettings = new DropdownSettings();
    this.execDropdownSettings.searchPH = 'Approver';
    this.execDropdownSettings.isMultiple = true;
    this.execDropdownSettings.enableTab = true;
    this.internalConnecterDropdownSettings = new DropdownSettings();
    this.externalConnecterDropdownSettings = new DropdownSettings();
  }

  set workflowData(data: any) {
    this._workflowData = data;
  }

  get workflowData() {
    return this._workflowData;
  }

  @Input() set currentId(data: any) {
    if (data !== this._currentId) {
      this.isActive = false;
    }
    this._currentId = data;
  }

  get currentId() {
    return this._currentId;
  }

  @Input() set currentIds(data: any) {
    if (data !== this._currentIds && typeof this._currentIds !== 'undefined') {
      this.resetStatus();
    }
    this._currentIds = data;
  }

  get currentIds() {
    return this._currentIds;
  }

  set activeSteps(data: any) {
    this._activeSteps = data;
  }

  get activeSteps() {
    return this._activeSteps;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterContentChecked() {
    if (this.hasInited && this.scrollToStepNumber !== -1) {
      let element: HTMLElement = document.getElementById('step-detail-' + this.scrollToStepNumber);
      let box: HTMLElement = document.getElementById('workflow-create-box');
      this.scrollToStep(box, element);
    }
  }

  /**
   * 是否展开
   * @returns {string|string}
   */
  getIsActive() {
    return this.isActive ? 'display' : 'hide';
  }

  toggleConnectOrNot() {
    this.isConnect = !this.isConnect;
    this.hasUnsavedData = true;
  }

  /**
   * 重设表单
   */
  resetStatus() {
    this.isActive = false;
    this.isConnect = false;
    this.hasInited = false;
    this.scrollToStepNumber = -1;
    this.hasUnsavedData = false;
    this.connectSelectedOptions = [];
    this.connectDropdownOptions = [];
    this.connectDropdownSettings.group = [];
    this.connectDropdownHasInited = false;

    this.applSelectedOptions = [];
    this.applDropdownOptions = [];
    this.applDropdownSettings.group = [];
    this.applDropdownHasInited = false;


    this.execDropdownOptions = [];
    this.execDropdownSettings.group = [];
    this.execDropdownHasInited = false;


    this.internalConnecterDropdownOptions = [];
    this.internalConnecterSelectedOptions = [];
    this.internalConnecterDropdownSettings.group = [];
    this.internalConnecterDropdownHasInited = false;


    this.externalConnecterDropdownOptions = [];
    this.externalConnecterSelectedOptions = [];
    this.externalConnecterDropdownSettings.group = [];
    this.externalConnecterDropdownHasInited = false;

    delete this.workflowData;
  }

  /**
   * 初始化创建表单数据
   * @param initAjax:
   * @param data
   */
  initCreateData(initAjax?: boolean, data?: any) {
    if (!this.isActive) {
      return;
    }
    this.workflowData = {};
    this.workflowData.workflowName = '';
    this.workflowData.workflowDescription = '';
    this.workflowData.revision = "0";
    // 对于从entirety点击SVG+直接创建的表单，Connect exist需要默认值, data有值
    // @see WorkflowEntiretyComponent.outNewWorkflow
    this.workflowData.connectStatus = false;
    this.workflowData.connectId = [];
    this.connectSelectedOptions = [];
    if (typeof data !== 'undefined' && data.hasOwnProperty(2) && data[2].hasOwnProperty('data')
      && data[2].data.hasOwnProperty('id')) {
      let step = data[0];
      let subStep = data[1];
      let step_id = '';
      if (subStep) {
        step_id = data[2].data['steps_details'][step]['sub'][subStep].id;
      } else {
        step_id = data[2].data['steps_details'][step].id;
      }
      this.workflowData.connectId = [{
        id: data[2].data.id,
        step_id: step_id
      }];
      this.isConnect = true;
    }
    this.workflowData.applicantIds = [];
    this.workflowData.applicantStatus = false;
    this.initConnecterList(() => {
      this.initStepDataArr();
    });
    if ((typeof initAjax !== 'undefined' && initAjax)) {
      this.initAjaxCreateData();
    }

    this.scrollToStepNumber = 0;
    let element: HTMLElement = document.getElementById('step-detail-' + this.scrollToStepNumber);
    let box: HTMLElement = document.getElementById('workflow-create-box');
    this.scrollToStep(box, element);
  }

  /**
   * 初始化外部连接人信息
   */
  initConnecterList(callback?: Function) {
    // contactList
    // Internal
    this.internalConnecterDropdownSettings.group.push({
      key: 'Internal',
      title: 'Internal',
    });
    let func = () => {
      this.internalContactList.forEach((info: any) => {
        let tmp = new DropdownOptionModel().initData({
          group: 'Internal',
          key: info.work_name ? info.work_name : info.p_name,
          label: info.work_name ? info.work_name : info.p_name,
          id: info.uid,
          imageLabel: info.user_profile_path ? this.config.resourceDomain + info.user_profile_path : (info.work_name ? '' : 'NaN'),
          desc: info.work_name ? info.p_name : ''
        });
        this.internalConnecterDropdownOptions.push(tmp);
      });
      // 自己
      let tmp = new DropdownOptionModel().initData({
        group: 'Internal',
        id: this.userDataService.getCurrentCompanyPSID(),
        key: this.userDataService.getCurrentUserName(),
        label: this.userDataService.getCurrentUserName(),
        imageLabel: this.config.resourceDomain + this.userDataService.getCurrentProfilePath(),
        desc: 'You',
      });
      this.internalConnecterDropdownOptions.push(tmp);
      if (callback) {
        callback();
      }
    };

    if (!this.internalContactList.length) {
      // 防止缓存没有值的初始化
      let contactList = this.userDataService.getContactList();
      if (!contactList) {
        this.getContactList(() => {
          func();
        });
      } else {
        this.internalContactList = contactList.hasOwnProperty('Internal') ? contactList['Internal'] : [];
        func();
      }
    } else {
      func();
    }
  }

  /**
   * 是否请求接口
   */
  initAjaxCreateData() {
    this.getConnectExist();
    this.getApplicantList();
    this.getExecutorList();
  }

  /**
   *
   * @param callback
   */
  getDepartmentList(callback?: Function) {
    this.workflowModelService.getDepartmentList((response: any) => {
      if (response.status === 1) {
        this.departmentList = this.typeService.bindDataList({
          form: -1,
          name: '',
          reid: -1
        }, response.data);
        if (callback) {
          callback();
        }
      }
    });
  }


  /**
   * 防止contact list本地缓存失效
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff
          });
          this.internalContactList = response.data.staff.hasOwnProperty('Internal') ? response.data.staff['Internal'] : [];
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 当点击详情中的编辑图标时
   * 初始化编辑表单
   * @see workflow-entirety.component.ts:782
   *  this.outEditDetail.emit([step, subStep, this.workflowData]);
   *
   */
  initEditData(data: any) {
    if (!this.isActive) {
      return;
    }
    let detailData: any = {};
    let requestAjax = true;
    if (typeof data != 'undefined') {
      this.scrollToStepNumber = data[0];
      detailData = data[2].data;
      if (this.hasInited && this.currentId == detailData.id) {
        requestAjax = false;
      }
    } else {
      let splitIds = this.currentIds ? this.currentIds.split('-') : [this.currentId];
      let data = {
        'id': this.currentId,
        'ids': splitIds
      };
      this.workflowModelService.getWorkflowDetail(data, (response: any) => {
        if (response.status === 1) {
          detailData = response.data;
        }
      });
    }
    // request为true代表已经没有初始化过该id的数据 否则不用再初始化
    if (requestAjax) {
      this.workflowData = {};
      this.workflowData.id = this.currentId;
      this.workflowData.workflowName = detailData.name;
      this.workflowData.workflowDescription = detailData.descr;
      this.workflowData.revision = detailData.revision;
      this.workflowData.connectStatus = false;
      if (detailData.parent_id && detailData.parent_step_id && detailData.connecter) {
        this.isConnect = true;
        this.workflowData.connectId = [{
          id: detailData.parent_id,
          step_id: detailData.parent_step_id,
          connecter: detailData.connecter,
        }];
      }
      this.workflowData.applicantIds = [];
      this.workflowData.applicantStatus = false;

      // 从Entirety传过来的数据结构不一致，需要根据情况分析
      detailData.applicant.forEach((appl: any, i: number) => {
        if (parseInt(appl.form) === WorkflowConstant.WORKFLOW_FORM_DEPARTMENT || parseInt(appl.form) === WorkflowConstant.WORKFLOW_FORM_POSITION) {
          appl['selectId'] = appl['reid'] + ' ' + appl['form'];
          this.workflowData.applicantIds.push(appl);
        } else if (parseInt(appl.form) === WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
          appl.info.forEach((applObj: any) => {
            if (applObj.hasOwnProperty('psid') && !applObj.hasOwnProperty('reid')) {
              let reid = applObj['psid'];
              delete applObj['psid'];
              applObj['reid'] = reid;
            }
            applObj['form'] = appl.form;
            applObj['selectId'] = applObj['reid'] + ' ' + applObj['form'];
            this.workflowData.applicantIds.push(applObj);
          });
        }
      });
      // 设置完id 和 appl id以后可以请求ajax查询了

      this.initConnecterList(() => {
        if (detailData.hasOwnProperty('steps_details')) {
          let stepDetails = detailData.steps_details;
          this.workflowData.stepDataArr = [];
          // 默认第0步
          this.workflowData.stepDataArr.push(this.typeService.clone(this.getStepInitSettings(0)));
          for (let i = 1; i < this.typeService.getDataLength(stepDetails); i++) {
            if (stepDetails.hasOwnProperty(i)) {
              let tmpCurrentStepInfo = this.typeService.clone(this.getStepInitSettings(i));
              if (stepDetails[i].hasOwnProperty('id')) {
                tmpCurrentStepInfo.step_id = stepDetails[i].id;
              }
              if (stepDetails[i].hasOwnProperty('wid')) {
                tmpCurrentStepInfo.wid = stepDetails[i].wid;

              }
              if (stepDetails[i].hasOwnProperty('response')) {
                tmpCurrentStepInfo.isAutoResponse =
                  ((!(stepDetails[i].response.hasOwnProperty('switchStatus') && stepDetails[i].response.switchStatus === '0')));
                tmpCurrentStepInfo.autoResponseSettingIsRefuse = (stepDetails[i].response.optionStatus === '0');
                tmpCurrentStepInfo.autoResponseSettingUnit = parseInt(stepDetails[i].response.type);
                tmpCurrentStepInfo.autoResponseSettingUnitValue = tmpCurrentStepInfo.isAutoResponse ? parseInt(stepDetails[i].response.time) : '';
              }

              if (stepDetails[i].hasOwnProperty('refuse')) {
                tmpCurrentStepInfo.refuseGoTo = parseInt(stepDetails[i].refuse.after);
              }
              // 有子步骤
              let stepSelectedExecutors = [];
              if (stepDetails[i].hasOwnProperty('sub')) {
                let tmpExecutors: any = [];
                for (let j = 1; j <= this.typeService.getDataLength(stepDetails[i].sub); j++) {
                  let tmpExecutor = this.typeService.clone(this.getStepInitExecutor());
                  if (stepDetails[i].sub[j].id) {
                    tmpExecutor.sub_step_id = stepDetails[i].sub[j].id;
                  }
                  if (stepDetails[i].sub[j].wid) {
                    tmpExecutor.wid = stepDetails[i].sub[j].wid;
                  }
                  if (stepDetails[i].sub[j].hasOwnProperty('connecter') && stepDetails[i].sub[j].connecter != 0) {
                    tmpExecutor.isExternal = true;
                    tmpExecutor.selectedConnecter = [new DropdownOptionModel().initData({
                      id: stepDetails[i].sub[j].connecter
                    })];
                  }
                  if (stepDetails[i].sub[j].hasOwnProperty('approver')) {
                    stepDetails[i].sub[j].approver.forEach((appr: any, subStepCount: number) => {
                      if (parseInt(appr.form) !== WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
                        let stepSelectedExecObj = new DropdownOptionModel();
                        stepSelectedExecObj.initData({
                          id: appr.reid + ' ' + appr.form
                        });
                        stepSelectedExecutors.push(stepSelectedExecObj);
                        tmpExecutor.selectedExecutorsOptions.push(stepSelectedExecObj);
                        tmpExecutor.executorsOptions.push([]);
                        tmpExecutor.selectedExecutors.push(appr);
                      } else {
                        if (appr.hasOwnProperty('info')) {
                          appr.info.forEach((aObj: any) => {
                            if (aObj.hasOwnProperty('psid') && !aObj.hasOwnProperty('reid')) {
                              let reid = aObj['psid'];
                              delete aObj['psid'];
                              aObj['reid'] = reid;
                            }
                            aObj['form'] = appr.form;
                            let stepSelectedExecObj = new DropdownOptionModel();
                            stepSelectedExecObj.initData({
                              id: appr.reid + ' ' + appr.form
                            });
                            stepSelectedExecutors.push(stepSelectedExecObj);
                            tmpExecutor.selectedExecutorsOptions.push(stepSelectedExecObj);
                            tmpExecutor.executorsOptions.push([]);
                            tmpExecutor.selectedExecutors.push(aObj);
                          });
                        }
                      }
                    });
                  }
                  tmpExecutors.push(tmpExecutor);
                }
                tmpCurrentStepInfo.executors = tmpExecutors;
                this.workflowData.stepDataArr.push(tmpCurrentStepInfo);
              } else {
                // 无子步骤
                let tmpExecutors: any = [];
                let tmpExecutor = this.typeService.clone(this.getStepInitExecutor());
                if (stepDetails[i].hasOwnProperty('id')) {
                  tmpExecutor.step_id = stepDetails[i].id;
                }
                if (stepDetails[i].hasOwnProperty('wid')) {
                  tmpExecutor.wid = stepDetails[i].wid;
                }
                if (stepDetails[i].hasOwnProperty('connecter') && stepDetails[i].connecter != 0) {
                  tmpExecutor.isExternal = true;
                  tmpExecutor.selectedConnecter = [new DropdownOptionModel().initData({
                    id: stepDetails[i].connecter
                  })];
                }
                if (stepDetails[i].hasOwnProperty('approver')) {
                  stepDetails[i].approver.forEach((appr: any) => {
                    if (parseInt(appr.form) !== WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
                      tmpExecutor.selectedExecutors.push(appr);
                      let stepSelectedExecObj = new DropdownOptionModel();

                      stepSelectedExecObj.initData({
                        id: appr.reid + ' ' + appr.form
                      });
                      if (appr.form == 5) {
                        stepSelectedExecObj.initData({
                          id: -1
                        });
                      }
                      stepSelectedExecutors.push(stepSelectedExecObj);
                      tmpExecutor.selectedExecutorsOptions.push(stepSelectedExecObj);
                      tmpExecutor.executorsOptions.push([]);
                    } else {
                      if (appr.hasOwnProperty('info')) {
                        appr.info.forEach((aObj: any) => {
                          if (aObj.hasOwnProperty('psid') && !aObj.hasOwnProperty('reid')) {
                            let reid = aObj['psid'];
                            delete aObj['psid'];
                            aObj['reid'] = reid;
                          }
                          aObj['form'] = appr.form;
                          let stepSelectedExecObj = new DropdownOptionModel();
                          stepSelectedExecObj.initData({
                            id: appr.reid + ' ' + appr.form
                          });
                          stepSelectedExecutors.push(stepSelectedExecObj);
                          tmpExecutor.selectedExecutorsOptions.push(stepSelectedExecObj);
                          tmpExecutor.executorsOptions.push([]);
                          tmpExecutor.selectedExecutors.push(aObj);
                        });
                      }
                    }
                  });
                }
                tmpExecutors.push(tmpExecutor);
                tmpCurrentStepInfo.executors = tmpExecutors;
                this.workflowData.stepDataArr.push(tmpCurrentStepInfo);
              }
            }
          }
        }
        this.initAjaxCreateData();
      });
    }
    this.hasInited = true;
  }


  /**
   * step_id 主步骤Id
   * wid 外联步骤Id
   * executors 子步骤的集合，如果没有子步骤，则为唯一数组，代表主步骤自身.
   * selectedExecutors 选中的执行人数组集合
   * executorType 该步骤设置的值 0或1
   * workflowExecutorTypeName 该步骤设置的值对应的label approver或operator
   * workflowExecutorTypesKeys 用来筛选key对应的label
   * refuseGoTo 拒绝后回到第几步
   * isAutoResponse 是否自动响应
   * autoUnitStatus 是否展开自动响应单位下拉菜单
   * autoOperatorStatus  是否展开自动响应操作下拉菜单
   * autoResponseSettingIsRefuse   自动响应操作设置
   * autoResponseSettingUnit       自动响应单位设置 （月/日/时/分）
   * autoResponseSettingUnitValue  自动响应单位对应数据 (具体多少月/日/时/分)
   * addStepStatus 是否展开加主步骤下拉菜单
   * stepTitle 步骤对应标题 1st, 2nd, ... 11th ...
   * @returns {
   * {executors:
   *   {
   *   step_id: string,
   *   wid: string,
   *   selectedExecutors: Array,
   *   executorType: number,
   *   workflowExecutorTypeName: string,
   *   workflowExecutorTypes: {
   *     approver: {id: number, name: string},
   *     operator: {id: number, name: string}
   *     },
   *   workflowExecutorTypesKeys: string[]
   *   }[],
   * refuseGoTo: number,
   * isAutoResponse: boolean,
   * autoUnitStatus: boolean,
   * autoOperatorStatus: boolean,
   * autoResponseSettingIsRefuse: boolean,
   * autoResponseSettingUnit: number,
   * autoResponseSettingUnitValue: string,
   * addStepStatus: boolean,
   * stepTitle:string}
   * }
   */
  getStepInitSettings(step?: number): any {
    return {
      step_id: '',
      wid: '',
      executors: [
        this.typeService.clone(this.getStepInitExecutor())
      ], // 第0步的executors为applicant
      refuseGoTo: step ? (step - 1) : -1,
      refuseGoToStatus: false,
      isAutoResponse: false,
      autoUnitStatus: false,
      autoOperatorStatus: false,
      autoResponseSettingIsRefuse: true,
      autoResponseSettingUnit: WorkflowConstant.WORKFLOW_AUTOMATE_UNIT_DAY,
      autoResponseSettingUnitValue: '',
      addStepStatus: false,
      addExecutorStatus: false,
      stepTitle: (typeof step === 'number') ? this.getStepTitle(step) : '',
      refuseGoToTitle: (typeof step === 'number') ? this.getStepTitle(step - 1) : ''
    };
  }

  /**
   *
   * @returns {
   *  {
   *   sub_step_id: string,
   *   wid: string,
   *   internalConnecter: Array,  可选连接人数组
   *   selectedConnecter: any,    选中的连接人
   *   executorsOptions: Array,   同意人列表 如果选了连接人 为部门或者外部公司 不然为职位或者职务
   *   selectedExecutors: Array,  选中的同意人 供API接口使用
   *   selectedExecutorsOptions: Array, 选中的同意人 供页面插件用
   *   executorType: number,
   *   workflowExecutorTypeName: string,
   *   workflowExecutorTypes:
   *    {approver: {id: number, name: string},
   *     operator: {id: number, name: string}
   *    },
   *   workflowExecutorTypesKeys: string[]
   *  }
   * }
   */
  getStepInitExecutor(): any {
    return {
      sub_step_id: '',
      wid: '', // 外联id,
      isExternal: false,
      executorsSettings: this.execDropdownSettings ? this.typeService.clone(this.execDropdownSettings) : {},
      executorsOptions: this.execDropdownOptions ? this.typeService.clone(this.execDropdownOptions) : [],
      internalConnecter: this.internalConnecterDropdownOptions ? this.typeService.clone(this.internalConnecterDropdownOptions) : [],
      selectedConnecter: '',
      selectedExecutors: [],
      selectedExecutorsOptions: [],
      executorType: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_APPROVER,
      workflowExecutorTypeName: WorkflowConstant.WORKFLOW_EXECUTOR_TYPE_NAME_APPROVER,
      workflowExecutorTypes: this.executorTypes,
      workflowExecutorTypesKeys: Object.keys(this.typeService.clone(this.executorTypes))
    };
  }

  /**
   * 初始化步骤数据
   */
  initStepDataArr() {
    this.workflowData.stepDataArr = [
      this.typeService.clone(this.getStepInitSettings(0)),// 第0步为applicant数据预留
      this.typeService.clone(this.getStepInitSettings(1)),
      //this.typeService.clone(this.getStepInitSettings(2))
    ];
  }

  /**
   * 步骤标题
   * @param step  子步骤
   * @param stepLength 如果有传步骤 例如添加或者删除步骤，那么以传入的length为参考
   * @returns string
   */
  getStepTitle(step: number, stepLength?: any): String {
    if (step < 0 || typeof step !== 'number') {
      return '';
    }
    if (step === 0) {
      return 'Start';
    }
    // if (this.workflowData.hasOwnProperty('stepDataArr')
    //   && (step == (stepLength ? stepLength - 1 : this.workflowData.stepDataArr.length - 1))) {
    //   return 'Last';
    // }
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
   * 根据分组标题获得分组值
   * @param selectGroupTitle
   * @returns {number}
   */
  getFormGroupByTitle(selectGroupTitle: string): number {
    let selectGroup = 0;
    switch (selectGroupTitle.toLowerCase()) {
      case 'department':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_DEPARTMENT;
        break;
      case 'position':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_POSITION;
        break;
      case 'position structure':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE;
        break;
      case 'cooperator':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_COOPERATOR;
        break;
      // case 'client':
      //   selectGroup = WorkflowConstant.WORKFLOW_FORM_CLIENT;
      //   break;
      case 'partner':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_PARTNER;
        break;
      case 'supplier':
        selectGroup = WorkflowConstant.WORKFLOW_FORM_SUPPLIER;
        break;
    }
    return selectGroup;
  }

  /**
   * 删除某一步的拒绝数据
   * @param event
   * @param step
   */
  deleteStepRefuseGoTo(event: any, step: any) {
    event.stopPropagation();
    if (event.target) {
      let element = event.target;
      let a = element.classList;
      if (a.length) {
        for (let i = 0; i < a.length; i++) {
          // 点在删除按钮上
          if (a[i] === 'del-btn') {
            if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
              this.workflowData.stepDataArr[step].refuseGoTo = -1;
            }
          }
        }
      }
    }
  }

  /**
   * 设置某一步的拒绝数据
   * @param event
   * @param step
   * @param to
   */
  setStepRefuseGoTo(event: any, step: any, to: any) {
    event.stopPropagation();
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      this.workflowData.stepDataArr[step].refuseGoTo = to;
      this.workflowData.stepDataArr[step].refuseGoToStatus = !this.workflowData.stepDataArr[step].refuseGoToStatus;
      this.workflowData.stepDataArr[step].refuseGoToTitle = this.getStepTitle(to);
    }
    this.hasUnsavedData = true;
  }


  /**
   * 初始化Approver列表
   */
  getExecutorList() {
    this.execDropdownOptions = [];
    this.workflowData.executorList = [];
    this.execDropdownSettings.group = [];

    this.workflowModelService.getWorkflowApproverList({}, (response: any) => {
      if (response.status === 1) {
        //添加line manager
        this.execDropdownSettings.group.push({
          key: 'lineManager',
          title: 'Line Manager'
        });
        let tmp = new DropdownOptionModel();
        tmp.initData({
          id: -1,
          key: 'lineManager',
          label: 'Line Manager',
          group: 'lineManager',
          desc: 'Direct manager of last step'
        });
        this.execDropdownOptions.push(tmp);
        for (let i in response.data) {
          if (response.data.hasOwnProperty(i)) {
            let title = i.split(/(?=[A-Z])/).join(' ').toLowerCase();
            let group = this.getFormGroupByTitle(title);
            this.execDropdownSettings.group.push({
              key: group,
              title: title
            });
            response.data[i].forEach((info: any) => {
              let tmp = new DropdownOptionModel();
              tmp.initData({
                id: info.reid + ' ' + info.form,
                key: info.name,
                label: info.user_profile_path === '' ? this.POSITION_VACANCY + ' ID:' + info.name : info.name,
                group: group,
                desc: info.hasOwnProperty('title') ? info.title +
                  (info.hasOwnProperty('level') ? ' ' + info.level : '') : ''
              });
              if (info.form === WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
                tmp.imageLabel = (info.hasOwnProperty('user_profile_path') && info.user_profile_path !== '') ?
                  this.config.resourceDomain + info.user_profile_path : 'NaN';
              } else {
                tmp.imageLabel = '';
              }
              this.execDropdownOptions.push(tmp);
            });
            this.workflowData.executorList.push({
              displayStatus: !this.typeService.getDataLength(response.data[i]),
              group: group,
              title: title,
              info: response.data[i]
            });
          }
        }
        if (this.workflowData.hasOwnProperty('stepDataArr')) {
          // 防止部门多次循环获取，事先获取
          this.getDepartmentList(() => {
            this.workflowData.stepDataArr.forEach((stepData: any, i: number) => {
              stepData.executors.forEach((exeu: any, k: number) => {
                let old = exeu.executorsOptions;
                if (old.length) {
                  stepData.executors[k].executorsOptions = [];
                }
                if (!stepData.executors[k].isExternal) {
                  stepData.executors[k].executorsSettings = this.typeService.clone(this.execDropdownSettings);
                  stepData.executors[k].executorsOptions = this.typeService.clone(this.execDropdownOptions);
                  let oldSelect = this.typeService.clone(exeu.selectedExecutorsOptions);
                  if (oldSelect.length) {
                    let newSelectArr = [];
                    oldSelect.forEach((oldS: any) => {
                      let tmp = this.typeService.clone(oldS);
                      newSelectArr.push(tmp);
                    });
                    delete stepData.executors[k].selectedExecutorsOptions;

                    stepData.executors[k].selectedExecutorsOptions = newSelectArr;
                  }
                } else {
                  stepData.executors[k].executorsSettings = this.typeService.clone(this.execDropdownSettings);
                  stepData.executors[k].executorsSettings.isMultiple = false;
                  stepData.executors[k].executorsSettings.group = [
                    {
                      key: this.getFormGroupByTitle('Cooperator'),
                      title: 'Cooperator'
                    }, {key: this.getFormGroupByTitle('Department'), title: 'Department'}
                  ];
                  let oldSelect = this.typeService.clone(stepData.executors[k].selectedExecutorsOptions);
                  // 有选中值
                  if (stepData.executors[k].selectedConnecter.hasOwnProperty(0)
                    && stepData.executors[k].selectedConnecter[0].hasOwnProperty('id')) {
                    this.setExternalExecutorsOptions(stepData.executors[k], stepData.executors[k].selectedConnecter[0]['id'], oldSelect);
                  }
                }
              });
            });
          });
        }
      }
    });
  }


  /**
   * 切换显示添加主步骤下拉菜单
   * @param event
   * @param step
   */
  toggleAddStep(event: any, step: any) {
    event.stopPropagation();
    if (this.workflowData.hasOwnProperty('stepDataArr') && this.workflowData.stepDataArr.hasOwnProperty(step)) {
      this.workflowData.stepDataArr[step].addStepStatus = !this.workflowData.stepDataArr[step].addStepStatus;
    }
  }

  /**
   * 删除某个主步骤
   * @param event
   * @param step
   */
  deleteStep(event: any, step: any) {
    event.stopPropagation();
    if (step === 1) return false;
    // TODO 删除权限验证
    // 第一步和最后一步不可以删除
    let oldStepDataArr = this.workflowData.stepDataArr;
    if (oldStepDataArr.length <= 2) {
      this.dialogService.openError({
        simpleContent: 'Can not delete! Workflow need 1 steps at least!'
      });
    } else {
      this.dialogService.openConfirm({
          simpleContent: 'Please confirm to remove step ' + this.getStepTitle(step)
        },
        () => {
          let newStepDataArr: Array<any> = [];
          for (let i = 0; i < oldStepDataArr.length; i++) {
            if (i < step) {
              newStepDataArr[i] = oldStepDataArr[i];
            }
            else if (i > step) {
              newStepDataArr[i - 1] = oldStepDataArr[i];
            }
          }
          this.workflowData.stepDataArr = newStepDataArr;
        }
      );
    }


  }

  /**
   * 删除某个子步骤
   * @param event
   * @param step
   * @param subStep
   */
  deleteSubStep(event: any, step: any, subStep: any) {
    event.stopPropagation();
    let oldStepDataArr = this.workflowData.stepDataArr;
    if (oldStepDataArr[step].executors.length <= 1) {
      this.dialogService.openError({
        simpleContent: 'Each workflow step need 1 executor at least'
      });
    } else {
      this.dialogService.openConfirm({
        simpleContent: 'Please confirm to remove this executor.',
      }, () => {
        let newSubStepDataArr: Array<any> = [];
        for (let i = 0; i < oldStepDataArr[step].executors.length; i++) {
          if (i < subStep) {
            newSubStepDataArr[i] = oldStepDataArr[step].executors[i];
          }
          else if (i > subStep) {
            newSubStepDataArr[i - 1] = oldStepDataArr[step].executors[i];
          }
        }
        this.workflowData.stepDataArr[step].executors = newSubStepDataArr;
      });
    }
  }


  /**
   * 添加步骤
   * @param event
   * @param sourceStep 被操作的步骤
   * @param flag  0|1
   *              0表示在sourceStep之前添加
   *              1表示在sourceStep之后添加
   */
  addStep(event: any, sourceStep: any, flag: number) {
    event.stopPropagation();
    if (!this.workflowData.stepDataArr.hasOwnProperty(sourceStep)) {
      return;
    }
    this.workflowData.stepDataArr[sourceStep].addStepStatus = !this.workflowData.stepDataArr[sourceStep].addStepStatus;
    let oldDataArr = this.workflowData.stepDataArr;
    let newDataArr: Array<any> = [];
    if (flag === 0) {
      for (let i = 0; i <= oldDataArr.length; i++) {
        if (i < sourceStep) {
          newDataArr[i] = oldDataArr[i];
        } else if (i === sourceStep) {
          newDataArr[i] = this.typeService.clone(this.getStepInitSettings(sourceStep));
        } else {
          newDataArr[i] = oldDataArr[i - 1];
        }
      }
      // 更新title
      for (let i = 0; i < newDataArr.length; i++) {
        newDataArr[i].stepTitle = this.getStepTitle(i);
        newDataArr[i].refuseGoToTitle = this.getStepTitle(newDataArr[i].refuseGoTo);
      }
      // 更新title
      for (let i = 0; i < newDataArr.length; i++) {
        newDataArr[i].stepTitle = this.getStepTitle(i, newDataArr.length);
        newDataArr[i].refuseGoToTitle = this.getStepTitle(newDataArr[i].refuseGoTo, newDataArr.length);
      }
      this.workflowData.stepDataArr = newDataArr;
    } else if (flag === 1) {
      for (let i = 0; i <= oldDataArr.length; i++) {
        if (i <= sourceStep) {
          newDataArr[i] = oldDataArr[i];
        } else if (i === sourceStep + 1) {
          newDataArr[i] = this.typeService.clone(this.getStepInitSettings(sourceStep));
        } else {
          newDataArr[i] = oldDataArr[i - 1];
        }
      }
      // 更新title
      for (let i = 0; i < newDataArr.length; i++) {
        newDataArr[i].stepTitle = this.getStepTitle(i, newDataArr.length);
        newDataArr[i].refuseGoToTitle = this.getStepTitle(newDataArr[i].refuseGoTo, newDataArr.length);
      }
      this.workflowData.stepDataArr = newDataArr;
    }
  }

  /**
   * 添加子步骤（横向显示的表示，一票通过）
   * @param event
   * @param step
   */
  addSubStep(event: any, step: any) {
    event.stopPropagation();
    if (this.workflowData.stepDataArr.hasOwnProperty(step)
      && this.workflowData.stepDataArr[step].executors) {
      let data = this.typeService.clone(this.getStepInitExecutor());
      this.workflowData.stepDataArr[step].executors.push(data);
    }
  }

  /**
   *
   * @param event
   * @param step
   */
  setStepAutoMatedInfo(event: any, step: any) {
    event.stopPropagation();
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      this.workflowData.stepDataArr[step].isAutoResponse = !this.workflowData.stepDataArr[step].isAutoResponse;
    }
  }

  /**
   *
   * @param step
   * @returns {string}
   */
  getAutoMateUnitTitle(step: any) {
    let title = 'Days';
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      switch (this.workflowData.stepDataArr[step].autoResponseSettingUnit) {
        case WorkflowConstant.WORKFLOW_AUTOMATE_UNIT_MONTH:
          title = 'Months';
          break;
        case WorkflowConstant.WORKFLOW_AUTOMATE_UNIT_DAY:
          title = 'Days';
          break;
        case WorkflowConstant.WORKFLOW_AUTOMATE_UNIT_HOUR:
          title = 'Hours';
          break;
        case WorkflowConstant.WORKFLOW_AUTOMATE_UNIT_MINUTE:
          title = 'Minutes';
          break;
      }
    }
    return title;
  }

  /**
   *
   * @param step
   * @returns String
   */
  getAutoMateOperatorTitle(step: any) {
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      return this.workflowData.stepDataArr[step].autoResponseSettingIsRefuse ? 'To refuse' : 'To approve';
    }
    return 'To refuse';
  }

  /**
   *
   * @param event
   * @param step
   * @param data
   */
  setStepAutoMateOperator(event: any, step: any, data: any) {
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      this.workflowData.stepDataArr[step].autoResponseSettingIsRefuse = (data === WorkflowConstant.WORKFLOW_AUTOMATE_OPERATOR_REFUSE);
    }
    this.hasUnsavedData = true;
  }

  /**
   *
   * @param event
   * @param step
   * @param data
   */
  setStepAutoMateUnit(event: any, step: any, data: any) {
    if (this.workflowData.stepDataArr.hasOwnProperty(step)) {
      this.workflowData.stepDataArr[step].autoResponseSettingUnit = data;
      // this.toggleStepAutoMateUnitSettings(event, step);
    }
    this.hasUnsavedData = true;
  }

  /**
   * 设置同意人
   * @param event
   * @param step
   * @param subStep
   */
  setStepExecutorList(event: any, step: any, subStep: any) {
    let action = event[2]; // 'add' or 'delete'
    if (typeof event !== 'undefined' && event.hasOwnProperty(0)) {
      let selectData = event[0];
      this.workflowData.stepDataArr[step].executors[subStep].selectedExecutors = [];
      selectData.forEach((ele: any) => {
        if (ele.id === -1) { //line manager
          this.workflowData.stepDataArr[step].executors[subStep].selectedExecutors.push({
            reid: '',
            form: 5,
          });
        } else {
          let tmp = ele.id.split(' ');
          if (tmp[1] == WorkflowConstant.WORKFLOW_FORM_POSITION || tmp[1] == WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
            this.workflowData.executorList.forEach((exeList: any) => {
              exeList.info.forEach((info: any) => {
                if (info.hasOwnProperty('reid') && info['reid'] == tmp[0]
                  && info.hasOwnProperty('form') && info['form'] == tmp[1]
                ) {
                  this.workflowData.stepDataArr[step].executors[subStep].selectedExecutors.push(info);
                }
              });
            });
          }
          else if (tmp[1] == WorkflowConstant.WORKFLOW_FORM_DEPARTMENT) {
            this.departmentList.forEach((exeList: any) => {
              if (exeList.hasOwnProperty('reid') && exeList['reid'] == tmp[0]
                && exeList.hasOwnProperty('form') && exeList['form'] == tmp[1]
              ) {
                this.workflowData.stepDataArr[step].executors[subStep].selectedExecutors.push(exeList);
              }
            });
          } else if (tmp[1] == WorkflowConstant.WORKFLOW_FORM_COOPERATOR) {
            this.workflowData.stepDataArr[step].executors[subStep].selectedExecutors.push({
              reid: tmp[0],
              form: tmp[1],
            });

          }
        }

      });
      this.hasUnsavedData = true;
    }

  }

  /**
   * 初始化所有applicant数据
   */
  getApplicantList() {
    this.workflowModelService.getWorkflowApplicantList({}, (response: any) => {
      this.applDropdownHasInited = true;
      if (response.status === 1) {
        this.workflowData.applicantList = [];
        this.applDropdownOptions=[];
        this.applDropdownSettings.group = [];
        for (let i in response.data) {
          if (response.data.hasOwnProperty(i)) {
            let title = i.split(/(?=[A-Z])/).join(' ').toUpperCase();
            let group = this.getFormGroupByTitle(title);
            this.applDropdownSettings.group.push({
              key: group,
              title: title
            });
            response.data[i].forEach((obj: any) => {
              let tmp = new DropdownOptionModel();
              tmp.initData({
                id: obj.reid + ' ' + obj.form,
                key: obj.name,
                label: obj.user_profile_path === '' ? this.POSITION_VACANCY + ' ID:' + obj.name : obj.name,
                group: group,
                desc: obj.hasOwnProperty('title') ? obj.title +
                  (obj.hasOwnProperty('level') ? ' ' + obj.level : '') : ''
              });
              if (obj.form === WorkflowConstant.WORKFLOW_FORM_POSITION_STRUCTURE) {
                tmp.imageLabel = (obj.hasOwnProperty('user_profile_path') && obj.user_profile_path !== '') ?
                  this.config.resourceDomain + obj.user_profile_path : 'NaN';
              } else {
                tmp.imageLabel = '';
              }
              this.applDropdownOptions.push(tmp);
            });
            this.workflowData.applicantList.push({
              displayStatus: !this.typeService.getDataLength(response.data[i]),
              group: group,
              title: title,
              info: response.data[i]
            });
          }
        }
        this.applDropdownSettings = this.typeService.clone(this.applDropdownSettings);
        if (this.workflowData.hasOwnProperty('applicantIds')) {
          this.applSelectedOptions = [];
          this.workflowData.applicantIds.forEach((selectAppl: any) => {
            let selectTmp = new DropdownOptionModel();
            selectTmp.initData({
              'id': selectAppl.selectId
            });
            this.applSelectedOptions.push(selectTmp);
          });
        }
      }
    });
  }


  /**
   * 单独一个Applicant的选中
   * @param event
   */
  setApplicantList(event: any) {
    if (typeof event !== 'undefined' && event.hasOwnProperty(0)) {
      let selectData = event[0];
      this.workflowData.applicantIds = [];
      selectData.forEach((ele: any) => {
        let tmp = ele.id.split(' ');
        let data = {
          reid: tmp[0],
          form: tmp[1],
        };
        this.workflowData.applicantIds.push(data);
      });
      this.hasUnsavedData = true;
    }
  }

  /**
   * 初始化可外链的workflow列表
   */
  getConnectExist() {
    let data = {};
    // 传当前id 可以在exist list里获取当前连接的父级
    if (this.workflowData.id && this.editType === WorkflowConstant.WORKFLOW_ACT_EDIT) {
      data = {id: this.workflowData.id};
    }
    // 传被连接的id 需要在exist list里过滤掉已经连接到workflow id
    if (this.editType === WorkflowConstant.WORKFLOW_ACT_NEW
      && this.workflowData.hasOwnProperty('connectId')
      && this.workflowData.connectId.hasOwnProperty('0')) {
      data = {filter_id: this.workflowData.connectId[0].id};
    }
    this.connectSelectedOptions = [];
    this.connectDropdownSettings.group = [];
    this.workflowModelService.getWorkflowExistList(data, (response: any) => {
      this.connectDropdownHasInited = true;
      if (response.status === 1) {
        this.workflowData.workflowExistList = [];
        this.connectDropdownOptions = [];
        for (let i in response.data) {
          if (response.data.hasOwnProperty(i)) {
            this.connectDropdownSettings.group.push({
              key: i.toUpperCase(),
              title: i.toUpperCase()
            });
            let tmpDataArr = response.data[i];
            for (let j = 0; j < tmpDataArr.length; j++) {
              if (tmpDataArr.hasOwnProperty(j)) {
                let tmpData = tmpDataArr[j];
                let tmp = new DropdownOptionModel();
                tmp.initData({
                  id: tmpData.step_id + ' ' + tmpData.id,
                  key: tmpData.name,
                  label: tmpData.name,
                  group: i.toUpperCase(),
                });
                this.connectDropdownOptions.push(tmp);
              }
            }
            // 查看是否有默认选中的连接人
            this.workflowData.workflowExistList.push({
              displayStatus: !this.typeService.getDataLength(response.data[i]),
              title: i.toUpperCase(),
              info: response.data[i]
            });
          }
        }// 分组for循环end
        // 如果有默认值
        if (this.workflowData.hasOwnProperty('connectId')
          && this.workflowData.connectId.hasOwnProperty(0)
          && this.workflowData.connectId[0].hasOwnProperty('step_id')
          && this.workflowData.connectId[0].hasOwnProperty('id')) {
          this.connectSelectedOptions = [];
          let tmp = new DropdownOptionModel();
          tmp.initData({
            id: this.workflowData.connectId[0].step_id + ' ' + this.workflowData.connectId[0].id,
          });
          this.connectSelectedOptions = [tmp];
          this.initExternalCooperatorList();
        }
      }
    });
  }

  /**
   * 获取内部连接人列表
   * @param callback
   */
  initExternalCooperatorList(callback?: Function) {
    // 无选中值，清空下拉菜单
    if (!this.workflowData || !this.workflowData.connectId || !this.workflowData.connectId[0]) {
      this.externalConnecterDropdownSettings.group = [];
      this.externalConnecterDropdownOptions = [];
      return;
    }
    this.externalConnecterDropdownSettings.group = [{
      key: 'Internal',
      title: 'Internal',
    }];
    this.externalConnecterSelectedOptions = [];
    this.externalConnecterDropdownOptions = [];
    this.workflowModelService.getExternalCooperatorListByStepId({
      data: {
        step_id: parseInt(this.workflowData.connectId[0].step_id),
        id: parseInt(this.workflowData.connectId[0].id)
      }
    }, (response: any) => {
      if (response.status === 1 && response.data) {
        //下拉内容
        response.data.forEach((info: any) => {
          let tmp = new DropdownOptionModel().initData({
            group: 'Internal',
            key: info.work_name,
            label: info.user_profile_path === '' ? this.POSITION_VACANCY + ' ID:' + info.work_name : info.work_name,
            id: info.uid,
            imageLabel: info.user_profile_path ? this.config.resourceDomain + info.user_profile_path : 'NaN',
            desc: info.hasOwnProperty('p_name') ? info.p_name : '',
          });
          this.externalConnecterDropdownOptions.push(tmp);
        });
        //选中值
        if (this.workflowData.connectId[0].hasOwnProperty('connecter')) {
          this.externalConnecterSelectedOptions = [new DropdownOptionModel().initData({
            id: this.workflowData.connectId[0].connecter.toString()
          })];
        }
      }
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Workflow type为Connect exist时候的下拉菜单
   * 点击事件
   * @param data
   * @param IsConnecter 是否为设置连接人
   */
  setConnectExist(data: any, IsConnecter?: boolean) {
    if (data) {
      let action = data[2];
      let clickedOption: DropdownOptionModel = data[1];

      if (action === 'add') {
        // 根据step id查询workflow id
        if (!IsConnecter) {
          let tmp = clickedOption.id.split(' ');
          let step_id = tmp[0];
          let id = tmp[1];
          this.workflowData.connectId = [{
            id: id,
            step_id: step_id
          }];
          this.connectSelectedOptions = [clickedOption];
          this.initExternalCooperatorList();
        } else {
          this.externalConnecterSelectedOptions = [clickedOption];
          this.workflowData.connectId[0]['connecter'] = clickedOption.id;
        }
      } else {
        this.workflowData.connectId = [];
        this.connectSelectedOptions = [];
        this.initExternalCooperatorList();
      }
    }
    this.hasUnsavedData = true;
  }

  /**
   * Workflow有两种类型 applicant或者connect exist
   * 设置类型方法
   * @param type
   */
  setWorkflowType(type: any) {
    if (!this.workflowData.hasOwnProperty('type')) {
      this.workflowData['type'] = 0;
    }
    if (type === WorkflowConstant.WORKFLOW_TYPE_APPLICANT) {
      this.workflowData.type = WorkflowConstant.WORKFLOW_TYPE_APPLICANT;
    } else if (type === WorkflowConstant.WORKFLOW_TYPE_EXIST) {
      this.workflowData.type = WorkflowConstant.WORKFLOW_TYPE_EXIST;
    } else {
      this.workflowData.type = WorkflowConstant.WORKFLOW_TYPE_APPLICANT;
    }
    this.hasUnsavedData = true;
  }

  /**
   * Workflow有两种类型 applicant或者connect exist
   * 获取类型方法
   * @param type
   * @returns {boolean}
   */
  isWorkflowTypeText(type: any) {
    // 默认text显示
    if (!this.workflowData.hasOwnProperty('type')) {
      return type !== WorkflowConstant.WORKFLOW_TYPE_APPLICANT;
    } else {
      return type !== this.workflowData.type;
    }

  }

  /**
   * 此模块是否展开
   * @returns {boolean}
   */
  couldActive() {
    return !this.isActive;
  }

  /**
   * 要展示新建或者编辑的表单
   * @see WorkflowComponent.editWorkflow
   * @param data
   */
  openWorkflowForm(data?: any) {
    let forceOpen = false;
    // @see WorkflowEntiretyComponent.outNewWorkflow
    if (typeof data != 'undefined' && typeof data[3] != 'undefined') {
      forceOpen = data[3];
    }
    if (typeof data === 'undefined' || forceOpen) {
      if (!this.hasUnsavedData) {
        this.isNewForm(data, forceOpen);
      } else {
        this.confirmLeaveDialog(() => {
          this.isNewForm(data, forceOpen);
        });
      }
    } else {
      if (!this.hasUnsavedData) {
        this.isEditForm(data);
      } else {
        this.confirmLeaveDialog(() => {
          this.isEditForm(data);
        });
      }
    }
  }

  closeWorkflowForm(event: any) {
    event.stopPropagation();
    if (this.hasUnsavedData) {
      this.confirmLeaveDialog(() => {
        this.resetStatus();
      });
    } else {
      this.resetStatus();
    }

  }

  /**
   * 点击取消按钮
   */
  cancelForm() {
    if (this.hasUnsavedData) {
      this.confirmLeaveDialog(() => {
        this.resetStatus();
      })
    } else {
      this.resetStatus();
    }
  }

  /**
   * 点击上传按钮
   */
  uploadWorkflow(element: any) {
    let submitData: WorkflowUploadData = new WorkflowUploadData();
    // TODO: 失败后将数据放入缓存
    let valid = submitData.buildUploadData(this.workflowData, this.editType, this.isConnect);
    if (valid.result) {
      this.workflowModelService.uploadWorkflow({
          data: {
            act: submitData.act,
            workflowData: submitData.workflowData
          }
        },
        (response: any) => {
          if (response.status === 1) {
            //成功，按钮添加对号，1秒后消失
            this.renderer.setElementClass(element, 'but-success', true);
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-success', false);
            }, this.config.btnSuccessTime);
            let responseId = parseInt(response.data);
            this.dialogService.openSuccess({
              simpleContent: this.editType === WorkflowConstant.WORKFLOW_ACT_NEW ? 'Success to create the workflow' : 'Success to update the workflow',
              beforeCloseEvent: () => {
                this.resetStatus();
                // 如果是新建，跳转到新建workflow并且刷新menu
                if (this.editType === WorkflowConstant.WORKFLOW_ACT_NEW && parseInt(this.currentId) !== responseId) {
                  this.outRedirectToNew.emit([responseId, true]);
                  // 如果是编辑，刷新绘图并且关闭表单
                } else if (this.editType === WorkflowConstant.WORKFLOW_ACT_EDIT) {
                  this.outRefreshEntirety.emit([responseId]);
                }
              },
              buttons: [
                {
                  type: 'ok',
                  btnEvent: () => {
                    this.resetStatus();
                    // 如果是新建，跳转到新建workflow并且刷新menu
                    if (this.editType === WorkflowConstant.WORKFLOW_ACT_NEW && parseInt(this.currentId) !== responseId) {
                      this.outRedirectToNew.emit([responseId, true]);
                      // 如果是编辑，刷新绘图并且关闭表单
                    } else if (this.editType === WorkflowConstant.WORKFLOW_ACT_EDIT) {
                      this.outRefreshEntirety.emit([responseId]);
                    }
                  }
                },
                {
                  type: 'cancel',
                  btnEvent: () => {
                    this.resetStatus();
                    if (this.editType === WorkflowConstant.WORKFLOW_ACT_NEW) {
                      this.outRedirectToNew.emit([responseId, true]);
                    } else if (this.editType === WorkflowConstant.WORKFLOW_ACT_EDIT) {
                      this.outRefreshEntirety.emit([responseId]);
                    }
                  }
                }
              ]
            })
          } else {
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail = this.editType === WorkflowConstant.WORKFLOW_ACT_NEW ?
              this.translateService.manualTranslate('Failed to create the workflow.'):
              this.translateService.manualTranslate('Failed to update the workflow.');
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
              this.btnFail = '';
            }, this.config.btnFailTime);
          }
          this.renderer.setElementClass(element, this.config.btnProgress, false);
        }
      );
    } else {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      this.renderer.setElementClass(element, 'but-fail', true);
      this.btnFail = this.editType === WorkflowConstant.WORKFLOW_ACT_NEW ?
        this.translateService.manualTranslate('Failed to create the workflow.'):
        this.translateService.manualTranslate('Failed to update the workflow.');
      setTimeout(() => {
        this.renderer.setElementClass(element, 'but-fail', false);
        this.btnFail = '';
      }, this.config.btnFailTime);
    }


  }

  /**
   * 新建表单
   * @param data
   * @param forceOpen
   */
  isNewForm(data?: any, forceOpen?: boolean) {
    if (typeof this.editType !== 'undefined' && this.editType !== WorkflowConstant.WORKFLOW_ACT_NEW) {
      this.resetStatus();
    }
    if (typeof forceOpen !== 'undefined' && forceOpen) {
      this.isActive = forceOpen;
    } else {
      this.isActive = !this.isActive;
    }

    this.editType = WorkflowConstant.WORKFLOW_ACT_NEW;
    this.initCreateData(true, data);
  }

  /**
   * 编辑表单
   */
  isEditForm(data: any, forceOpen?: boolean) {
    // 新建与创建之间切换 需要清除数据
    if (typeof this.editType !== 'undefined' && this.editType !== WorkflowConstant.WORKFLOW_ACT_EDIT) {
      this.resetStatus();
    }

    this.editType = WorkflowConstant.WORKFLOW_ACT_EDIT;
    this.isActive = true;
    this.initEditData(data);

  }

  /**
   * 编辑标题
   * @returns {string|string}
   */
  getEditTypeTitle() {
    return this.editType === WorkflowConstant.WORKFLOW_ACT_NEW ? 'CREATE' : 'MODIFY';
  }

  dealMessage(message: any) {
  }

  setWorkflowName(): void {
    if (!this.workflowData.hasOwnProperty('workflowName') || !this.workflowData) {
      return;
    }
    this.hasUnsavedData = true;
  }

  setWorkflowDescription(value: any) {
    if (!this.workflowData.hasOwnProperty('workflowDescription') || !this.workflowData) {
      return;
    }
    if (this.workflowData.workflowDescription != value) {
      this.hasUnsavedData = true;
    }
    this.workflowData.workflowDescription = value;
  }

  /**
   * 当编辑Workflow时候，跳转到指定步骤高度
   * @param box 容器
   * @param targetElement 要跳转到的元素
   */
  scrollToStep(box: HTMLElement, targetElement: HTMLElement): void {
    try {
      // TODO:动画效果
      if (targetElement !== null && box !== null) {
        box.scrollTop = targetElement.offsetTop;
        this.scrollToStepNumber = -1; // 重设值防止无法还原状态
      }
    } catch (err) {
      return
    }
  }

  /**
   * 当有未保存数据时候，弹窗确认是否离开
   * @param callback
   */
  confirmLeaveDialog(callback: any) {
    this.dialogService.openConfirm({
      simpleContent: 'You have not saved or update data, if leave,those will not be saved',
    }, () => {
      this.hasUnsavedData = false;
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  setDropdownElementStyle(isExternal: boolean, dropdownSearchParent: any, dropdownSearch: any) {
    if (isExternal) {
      this.renderer.setElementAttribute(dropdownSearch, 'data-height', dropdownSearch.offsetHeight);
      this.renderer.setElementStyle(dropdownSearchParent, 'height', dropdownSearch.offsetHeight + 'px');
      this.renderer.setElementStyle(dropdownSearchParent, 'overflow', 'hidden');
      setTimeout(() => {
        this.renderer.setElementStyle(dropdownSearchParent, 'height', '0');
      }, 16.7);
    } else {
      this.renderer.setElementStyle(dropdownSearchParent, 'height', '36px');
      setTimeout(() => {
        this.renderer.setElementStyle(dropdownSearchParent, 'overflow', 'inherit');
        this.renderer.setElementStyle(dropdownSearchParent, 'height', 'auto');
      }, 300);
    }

  }

  /**
   * 切换是否步骤为外联
   * @param event
   * @param subStep
   * @param executors
   * @param dropdownSearch
   */
  toggleStepIsExternal(event: any, subStep: any) {
    event.stopPropagation();
    // 显示变量
    subStep.isExternal = !subStep.isExternal;
    // 下拉菜单
    subStep.selectedExecutors = [];
    subStep.selectedExecutorsOptions = [];
    // 重置下拉菜单设置
    subStep.executorsSettings = new DropdownSettings();
    subStep.executorsSettings.searchPH = 'Approver';
    if (subStep.isExternal) {
      subStep.internalConnecter = this.typeService.clone(this.internalConnecterDropdownOptions);
      subStep.executorsSettings.isMultiple = false;
      subStep.executorsSettings.group = [
        {
          key: this.getFormGroupByTitle('Cooperator'),
          title: 'Cooperator'
        }, {key: this.getFormGroupByTitle('Department'), title: 'Department'}
      ];
      subStep.executorsOptions = [];
      //this.setDropdownElementStyle(subStep.isExternal, dropdownSearch, executors);
    } else {
      subStep.internalConnecter = [];
      subStep.executorsSettings.isMultiple = true;
      subStep.executorsSettings.group = [
        {
          key: this.getFormGroupByTitle('Position'),
          title: 'Position'
        }, {key: this.getFormGroupByTitle('Position Structure'), title: 'Position Structure'}
      ];
      subStep.executorsOptions = this.typeService.clone(this.execDropdownOptions);

    }
  }

  /**
   * 设置外联的部门或者公司的下拉菜单
   * @param subStepData
   * @param psid
   * @param selectedOptions
   */
  setExternalExecutorsOptions(subStepData: any, psid: number, selectedOptions?: Array<DropdownOptionModel>) {
    subStepData.executorsOptions = [];
    // 设置部门列表
    let func = () => {
      this.departmentList.forEach((info: any) => {
        let tmp = new DropdownOptionModel().initData({
          id: parseInt(info.reid) + ' ' + WorkflowConstant.WORKFLOW_FORM_DEPARTMENT,
          label: info.name,
          key: info.name,
          group: this.getFormGroupByTitle('Department')
        });
        subStepData.executorsOptions.push(tmp);
      });
    };
    if (!this.departmentList.length) {
      this.getDepartmentList(func);
    } else {
      func();
    }

    let initSelect = () => {
      if (selectedOptions) {
        subStepData.selectedExecutorsOptions = [];
        let newSelectArr = [];
        selectedOptions.forEach((oldS: any) => {
          let tmp = this.typeService.clone(oldS);
          newSelectArr.push(tmp);
        });
        subStepData.selectedExecutorsOptions = newSelectArr;
      }
    }

    //根据所选Position id，获取外部公司列表
    this.workflowModelService.getCooperateCompanyListByConnector({data: psid}, (response: any) => {
      if (response.status === 1) {
        if (response.data && this.typeService.getObjLength(response.data) > 0) {
          response.data.forEach((info: any) => {
            let tmp = new DropdownOptionModel().initData({
              id: parseInt(info.reid) + ' ' + WorkflowConstant.WORKFLOW_FORM_COOPERATOR,
              label: info.name,
              key: info.name,
              group: this.getFormGroupByTitle('Cooperator'),
            });
            subStepData.executorsOptions.push(tmp);
          });
        }
        initSelect();
      } else {
        initSelect();
      }
    });
  }

  /**
   * 更改步骤连接人
   * @param event
   * @param subStepData
   */
  clickStepExecutorConnecterList(event: any, subStepData: any, executors: any, dropdownSearch: any) {
    if (!event.hasOwnProperty(0) && !event[0].hasOwnProperty(0)) {
      return;
    }
    let selectedPerson: DropdownOptionModel = event[0][0];
    if (typeof selectedPerson !== 'undefined') {
      subStepData.selectedConnecter = event[0];
      subStepData.selectedExecutors = [];
      subStepData.selectedExecutorsOptions = [];
      this.setExternalExecutorsOptions(subStepData, selectedPerson.id);
    } else {
      subStepData.selectedConnecter = '';
    }
  }
}
