import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class CompanyModelService extends BaseModelService {
  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  /**
   * 注册公司或者studio
   * @param data
   * @param callback
   */
  studioUpgrade(data: any, callback?: any) {
    this.getData('studioUpgrade', data, callback);
  }

  companyRegister(data: any, callback?: any) {
    this.getData('companyRegister', data, callback);
  }

  companyIndustry(callback?: any) {
    this.getData('companyIndustry', null, callback);
  }

  generalSave(data: any, callback?: any) {
    this.getData('generalSave', data, callback);
  }

  permissionSave(data: any, callback?: any) {
    this.getData('permissionSave', data, callback);
  }

  permission(data: any, callback?: any) {
    this.getData('permission', data, callback);
  }

  //搜索公司
  companySearch(data?: any, callback?: any) {
    this.getData('companySearch', data, callback);
  }

  //公司Account
  companyAccount(data?: any, callback?: any) {
    this.getData('companyAccount', data, callback);
  }

  //公司Analysis
  companyAnalysis(data?: any, callback?: any) {
    this.getData('companyAnalysis', data, callback);
  }

  //银行列表
  companyAccountBank(callBack?: any) {
    this.getData('banksList', null, callBack);
  }

  /********************************************************/

  //公司数据
  companyGeneral(data: any, callback?: any) {
    this.getData('companyGeneral', data, callback);
  }

  //保存公司数据
  upDateCompanyGeneral(data: any, callback?: any) {
    this.getData('upDateCompanyGeneral', data, callback);
  }

  //保存公司CEO
  updateCompanyCeo(data: any, callback?: any) {
    this.getData('updateCompanyCeo', data, callback);
  }

  //CEO查询
  searchCeoCandidates(data: any, callback?: any) {
    this.getData('searchCeoCandidates', data, callback);
  }

  //获取当前CEO
  getCurrentCeo(callback?: any) {
    this.getData('getCurrentCeo', null, callback);
  }

  //搜索
  searchAdminCandidates(data: any, callback?: any) {
    this.getData('searchAdminCandidates', data, callback);
  }

  //获取招聘列表
  getAllStaff(data: any, callback?: any) {
    this.getData('getAllStaff', data, callback);
  }

  //获取待招聘人员列表
  getRecruitment(data: any, callback?: any) {
    this.getData('getRecruitment', data, callback);
  }

  //获取所有公司
  getAllCompany(callback?: any) {
    this.getData('getAllCompany', null, callback);
  }

  //上传图片 license
  uploadLicense(data: any, callback?: any) {
    this.getData('upload', data, callback);
  }
  newImgUpload(data: any, callback: any) {
    this.api.ajaxFormSend('upload', data, callback);
  }

  //获取未审核公司列表
  getUnReviewCompanyList(callback?: any){
    this.getData('getUnverifiedCompany', null, callback);
  }

  //假期
  showVacationUsage(data: any,callback?: any){
    this.getData('showVacationUsage', data, callback);
  }

  //更新假期天数
  updateVacation(data: any,callback?: any){
    this.getData('updateVacation',data,callback);
  }

  //获取假期设置
  getVacationSetting(callback?: any){
    this.getData('getVacationSetting',null,callback);
  }
  //更新假期设置
  updateVacationSetting(data: any,callback?: any){
    this.getData('updateVacationSetting',data,callback);
  }
  //显示假期员工假期
  showStaffVacation(data: any,callback?: any){
    this.getData('showStaffVacation',data,callback);
  }

  /**
   * 解雇未入组织架构的员工
   * @param data
   * @param callback
   */
  fireEmployeeNoStructure(data: any, callback: any){
    this.getData('dismissEmployeeNoStructure', data, callback);
  }

  /**
   * 解雇not entry员工
   * @param data
   * @param callback
   */
  fireNotEntry(data: any, callback: any){
    this.getData('dismissNotEntry', data, callback);
  }
}
