import * as WorkflowConstant from '../../../config/workflow.config';
/**
 * Workflow 创建相关类
 */
export class WorkflowUploadStep {
  public cid: any;
  public connecter: any;
  public option: any;
  public has_child: any;
  public wid: any;
  public pattern: any;
}

export class WorkflowUploadStepDetail {
  public cid: any;
  public connecter: any;
  public creator_psid: any;
  public approver: any;
  public refused: any;
  public response: any;

  constructor() {

  }
}

export class WorkflowAPIData {


}


export class WorkflowUploadData {
  public act: any;
  public workflowData: any;

  constructor() {
  }

  private isDepartment(data: any) {
    return parseInt(data) == WorkflowConstant.WORKFLOW_FORM_DEPARTMENT;
  }

  private isCompanyType(data: any) {
    return parseInt(data) == WorkflowConstant.WORKFLOW_FORM_COOPERATOR;
  }

  valid(data: any, act: any) {
    //检查必填字段
    return true;
  }

  /**
   *
   * @param data
   * @param act
   * @param isConnect
   * @returns {boolean}
   */
  buildUploadData(data: any, act: any, isConnect: boolean): {result: boolean, message: string} {
    try {
      this.act = act;
      if (!data.workflowName) {
        throw 'please input the name of workflow.';
      }
      this.workflowData = {
        name: data.workflowName,
        descr: data.workflowDescription,
        connecter: 0,
        connectExistInfo: {},
        applicant: []
      };
      if (this.act === WorkflowConstant.WORKFLOW_ACT_EDIT) {
        this.workflowData.id = data.id;
      }
      this.workflowData.steps = {};
      this.workflowData.steps_details = {};
      this.workflowData.revision = data.revision;
      if (isConnect) {
        if (data.connectId && data.connectId.hasOwnProperty(0)) {
          this.workflowData.connectExistInfo['step_id'] = data.connectId[0].step_id;
          this.workflowData.connectExistInfo['id'] = data.connectId[0].id;
        } else {
          throw 'must choose an workflow as connect';
        }
        if (data.connectId[0].hasOwnProperty('connecter')) {
          this.workflowData.connecter = data.connectId[0].connecter;
        } else {
          throw 'must choose at least one applicant';
        }
      }
      if (!isConnect) {
        if ( data.applicantIds) {
          this.workflowData.applicant = data.applicantIds;
        } else {
          throw 'you must choose at least one applicant';
        }

      }
      data.stepDataArr.forEach((stepData: any, i: number) => {
        if (i === 0) {
          this.workflowData.steps_details[i] = {};
        }
        if (i > 0) {
          let subStepDataArr = stepData.executors;
          let stepInfo: any = {};
          let stepDetailInfo: any = {};
          if (this.act === WorkflowConstant.WORKFLOW_ACT_EDIT && stepData.step_id !== '') {
            stepInfo.step_id = stepData.step_id;
            stepDetailInfo.id = stepData.step_id;
          }
          stepDetailInfo.response = {
            switchStatus: stepData.isAutoResponse ? 1 : 0,
            time: stepData.autoResponseSettingUnitValue ? parseInt(stepData.autoResponseSettingUnitValue) : 0,
            type: stepData.autoResponseSettingUnit,
            optionStatus: stepData.autoResponseSettingIsRefuse ? WorkflowConstant.WORKFLOW_AUTOMATE_OPERATOR_REFUSE : WorkflowConstant.WORKFLOW_AUTOMATE_OPERATOR_APPROVE
          };
          // 没有横向"子步骤"
          if (subStepDataArr.length === 1) {
            stepDetailInfo.approver = [];
            stepInfo.has_child = 0;

            subStepDataArr.forEach((subStep: any) => {
              if (subStepDataArr[0].selectedExecutors.length === 0) {
                throw 'you must select at least one executor for step ' + i;
              } else {
                subStep.selectedExecutors.forEach((executorObj: any) => {
                  stepDetailInfo.approver.push(executorObj);
                });
              }
            });
            if (subStepDataArr[0].selectedExecutors.length >= 1) {
              // 公司或部门
              if (this.isCompanyType(subStepDataArr[0].selectedExecutors[0].form)) {
                stepDetailInfo.cid = stepInfo.cid = subStepDataArr[0].selectedExecutors[0].reid;  //外部公司的id
                stepDetailInfo.connecter = stepInfo.connecter = subStepDataArr[0].selectedConnecter[0].id; //外部公司的职务的psid
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  stepInfo.wid = -1; //关联到其他workflow的主键, 此时尚未创建，0为默认值
                } else {
                  stepInfo.wid = (subStepDataArr[0].wid === '' ? -1 : subStepDataArr[0].wid);
                }
              } else if (this.isDepartment(subStepDataArr[0].selectedExecutors[0].form)) {
                stepDetailInfo.cid = stepInfo.cid = 0;
                stepDetailInfo.connecter = stepInfo.connecter = subStepDataArr[0].selectedConnecter[0].id;
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  stepInfo.wid = -1; //关联到其他workflow的主键, 此时尚未创建，0为默认值
                } else {
                  stepInfo.wid = (subStepDataArr[0].wid === '' ? -1 : subStepDataArr[0].wid);
                }
              } else {
                // 职务或者职位
                stepDetailInfo.cid = stepInfo.cid = 0;
                stepDetailInfo.connecter = stepInfo.connecter = 0;
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  stepInfo.wid = 0;
                } else {
                  stepInfo.wid = subStepDataArr[0].wid === '' ? 0 : subStepDataArr[0].wid;
                }
              }
            }
            // 有横向子步骤
          } else {
            stepDetailInfo.approver = [{reid: 0, form: 0}];
            // 当有子步骤时候主步骤的数据都无效，但需要保留key值
            stepInfo.has_child = 1;
            stepDetailInfo.sub = [];
            stepDetailInfo.cid = stepInfo.cid = 0;
            stepDetailInfo.connecter = stepInfo.connecter = 0;
            stepInfo.wid = 0;
            subStepDataArr.forEach((subStepData: any,  j:number) => {
              if (subStepData.selectedExecutors.length === 0) {
                throw 'you must select at least one executor for step ' + i + '-' + (j+1);
              }
              let subStepDetailInfo: any = {};
              subStepDetailInfo.approver = [];
              if (this.act === WorkflowConstant.WORKFLOW_ACT_EDIT) {
                if (subStepData.sub_step_id) {
                  subStepDetailInfo.id = subStepData.sub_step_id;
                }
              }
              if (this.isCompanyType(subStepData.selectedExecutors[0].form)) {
                subStepDetailInfo.cid = subStepData.selectedExecutors[0].reid;
                subStepDetailInfo.connecter = subStepData.selectedConnecter[0].id;
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  subStepDetailInfo.wid = -1;
                } else {
                  subStepDetailInfo.wid = subStepData.wid === '' ? -1 : subStepData.wid;
                }
              } else if (this.isDepartment(subStepData.selectedExecutors[0].form)) {
                subStepDetailInfo.cid = 0;
                subStepDetailInfo.connecter = subStepData.selectedConnecter[0].id;
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  subStepDetailInfo.wid = -1;
                } else {
                  subStepDetailInfo.wid = subStepData.wid === '' ? -1 : subStepData.wid;
                }
              } else {
                subStepDetailInfo.cid = subStepDetailInfo.connecter = 0;
                if (this.act === WorkflowConstant.WORKFLOW_ACT_NEW) {
                  subStepDetailInfo.wid = 0;
                } else {
                  subStepDetailInfo.wid = subStepData.wid === '' ? 0 : subStepData.wid;
                }
              }
              subStepData.selectedExecutors.forEach((executorObj: any) => {
                subStepDetailInfo.approver.push(executorObj);
              });
              stepDetailInfo.sub.push(subStepDetailInfo);
            });
          }
          stepDetailInfo.refuse = {
            after: stepData.refuseGoTo,
            current_step: i
          };
          this.workflowData.steps[i] = stepInfo;
          this.workflowData.steps_details[i] = stepDetailInfo;
        }
      });
    } catch (e) {
      return {result: false, message: e};
    }
    return {result: true, message: ''};
  }
}
