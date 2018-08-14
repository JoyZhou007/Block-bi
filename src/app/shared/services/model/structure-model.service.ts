import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class StructureModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  /**
   * 组织架构
   */
  //personal profile

  companyStructureInfo(data: any, callback: any) {
    this.getData('companyStructure', data, callback);
  }

  deptStructureInfo(data: any, callback: any) {
    this.getData('deptStructure', data, callback);
  }


  getStructureStaff(data: any, callback: any) {
    this.getData('structureStaff', data, callback)
  }

  getAllStructure(data: any, callback: any) {
    this.getData('allStructure', data, callback)
  }

  getMainStructure(data: any, callback: any) {
    this.getData('mainStructure', data, callback)
  }

  checkPosition(data: any, callback: any) {
    this.getData('checkPosition', data, callback)
  }

  /**
   * 查询公司以及子公司 id, name
   * @param data
   * @param callback
   */
  getStructureCompany(data: any, callback: any) {
    this.getData('structureCompany', data, callback)
  }

  getStructureDept(data: any, callback: any) {
    this.getData('structureDept', data, callback);
  }

  getStructurePosition(data: any, callback: any) {
    this.getData('structurePosition', data, callback);
  }

  getStructurePositionTitle(data: any, callback: any) {
    this.getData('structurePositionTitle', data, callback);
  }

  getPendingInfo(data: any, callback: any) {
    this.getData('getPending', data, callback);
  }

  compareUploadStructure(data: any, callback: any){
    this.getData('compareUploadStructure', data, callback);
  }

  uploadStructureInfo(data: any, callback: any) {
    this.getData('uploadStructure', data, callback);
  }

  uploadStructureInfoNew(data: any, callback: any) {
    this.getData('uploadStructureNew', data, callback);
  }
  /**
   *
    * @param data
   *  {
   *   test_file: any
   *  }
   * @param callback
   */
  importStructure(data: any, callback: any) {
    this.api.ajaxFormSend('importStructure', data, callback);
  }

  /**
   * 解雇员工
   * @param data
   * @param callback
   */
  fireEmployee(data: any, callback: any) {
    this.getData('dismissEmployee', data, callback);
  }
}
