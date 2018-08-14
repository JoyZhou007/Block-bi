/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 *
 * on 2016/11/1.
 */
import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

/**
 * Workflow 模型
 */

export class Workflow {
  cid: string;      // workflow id
  name: string;     // workflow name
  isCurrent: boolean = false; // is active or not
  constructor(data: any) {
    this.cid = (data.id).toString();
    this.name = (data.name).toString();
  }
}

/**
 * WorkflowList 列表模型
 */
export class WorkflowList {
  title: string;
  size: number;
  data: Workflow[] = [];
  isCurrent: boolean = false;
  constructor(title: string, size: number, data: any) {
    this.title = title;
    this.size = size;
    if (Array.isArray(data)) {
      data.forEach((info: any) => {
        this.data.push(new Workflow(info))
      });
    } else {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.data.push(new Workflow(data[key]));
        }
      }
    }

  }
}




@Injectable()
export class WorkflowModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any
  ) {
    super(api);
  }


  /**
   * workflow列表
   * @param data
   * @param callback
   * @returns {any}
   */
  getWorkflowList(data?: any, callback?: any) {
     return this.getData('workflowLists', data, callback);
  }

  /**
   * workflow可外链 Connect Exist数据
   * @param data
   * @param callback
   * @returns {any}
   */
  getWorkflowExistList(data?: any, callback?: any) {
    return this.getData('workflowExistList', data, callback);
  }

  /**
   * workflow可外链 Connect Exist数据
   * @param data
   * @param callback
   * @returns {any}
   */
  getWorkflowApplicantList(data?: any, callback?: any) {
    return this.getData('workflowApplicantList', data, callback);
  }

  getWorkflowApproverList(data?: any, callback?: any) {
    return this.getData('workflowApproverList', data, callback);
  }
  /**
   * workflow详情
   * @returns {undefined}
   */
  getWorkflowDetail(data:any, callback?: any) {
    this.getData('workflowDetail', data, callback);
  }

  uploadWorkflow(data:any, callback?: any) {
    this.getData('workflowUpload', data, callback);
  }

  deleteWorkflow(data:any, callback?:any) {
    this.getData('workflowDelete', data, callback);
  }

  /**
   *
   * @param response
   * @returns {WorkflowList[]}
   */
  dealResult(response: any): WorkflowList[] {
    let resultArr:WorkflowList[] = [];
    for (let group in response.data) {
      if (response.data.hasOwnProperty(group)) {
        resultArr.push(new WorkflowList(
          group.toUpperCase(),
          response.data[group].length,
          response.data[group]
        ));
      }
    }
    return resultArr;
  }

  /**
   * 根据所选PSID获取外部公司列表
   * @param data
   * {
   *  data: number
   * }
   * @param callback
   */
  getCooperateCompanyListByConnector(data: any, callback?: any){
    this.getData('workflowCooperatorCompany', data, callback);
  }

  /**
   * data
   * @param data
   * {
   *  step_id: number, 外联步骤id
   *  id: number       外联workflow id
   * }
   * @param callback
   */
  getExternalCooperatorListByStepId(data: any, callback?: any) {
    this.getData('workflowExternalCooperator', data, callback);
  }

  /**
   * 获取部门列表
   * @param callback
   */
  getDepartmentList(callback?: any){
    this.getData('workflowDepartmentList', null, callback);
  }
}
