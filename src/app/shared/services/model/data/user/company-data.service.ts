import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';
import {AllCompanyInfo} from '../../entity/company-entity';

@Injectable()
export class CompanyDataService extends UserDataBaseService {

  constructor(@Inject('store.service') public storeService: any,
              @Inject('type.service') public typeService: any) {
    super(storeService);
  }

  /**
   * 根据cid获取公司信息
   * @param cid
   */
  getCompanyByCid(cid: string): any {
    let returnCompany: any;
    let allCompanyData: any = this.getData(UserDataBaseService.storeDataKey.COMPANY_DATA);

    if (allCompanyData) {
      for (let key in allCompanyData) {
        if (allCompanyData[key].cid === cid) {
          returnCompany = allCompanyData[key];
          break;
        }
      }
    }
    return returnCompany;
  }

  /**
   * 设置公司列表
   */
  setAllCompany(companyDataList: any, setDefault: boolean = true) {
    if (companyDataList) {
      this.setData(UserDataBaseService.storeDataKey.COMPANY_DATA, this.typeService.bindDataList(
        AllCompanyInfo.init(),
        companyDataList,
        false
      ));

      if (setDefault || (companyDataList && companyDataList.length === 1)) {
        this.setDefaultCompany();
      }
    }
  }

  addCompany(companyData: any) {
    if (companyData) {
      let addCompanyData = AllCompanyInfo.init();
      this.typeService.bindData(
        addCompanyData,
        companyData
      );
      this.setData(UserDataBaseService.storeDataKey.COMPANY_DATA, this.getAllCompany().push(addCompanyData));
    }
  }

  /**
   * 获取所有公司信息
   *
   */
  getAllCompany(): Array<any> {
    let allCompanyData: any = this.getData(UserDataBaseService.storeDataKey.COMPANY_DATA);
    if (this.typeService.getDataLength(allCompanyData) > 0) {
      // //后台默认第一家公司处理
      // allCompanyData[0].isFirstDefault = true;
      return allCompanyData;
    } else {
      return [];
    }
  }

  /**
   * 获取当前操作的公司信息
   *
   */
  getLocationCompanyIn(): any {
    let locationCompanyIn: any = this.getLoginUserLocationCompanyIn();
    return locationCompanyIn ? locationCompanyIn : AllCompanyInfo.init();
  }

  /**
   * 公司名
   * @return {string}
   */
  getCurrentCompanyName(): any {
    let info = this.getLocationCompanyIn();
    if (info && info.hasOwnProperty('name')) {
      return info.name;
    }
    return '';
  }

  /**
   * 获取公司类型
   * @return {string}
   */
  getBusinessType(): any {
    let info = this.getLocationCompanyIn();
    if (info && info.hasOwnProperty('is_studio')) {
      return info.is_studio;
    }
    return '';
  }

  /**
   * 获取当前公司的id
   * @returns {boolean}
   */
  getCurrentCompanyCID(){
    let info = this.getLocationCompanyIn();
    if (info && info.hasOwnProperty('cid') && info.cid != '') {
      return info.cid;
    }
    return false;
  }

  getCurrentCompanyPositionName(){
    let info = this.getLocationCompanyIn();
    if ((info && info.hasOwnProperty('cid') && info.cid != '')
      && info.hasOwnProperty('p_name') && info.p_name != '') {
      return info.p_name;
    }
    return '';
  }

  /**
   * 设置默认公司(默认为第一家公司)
   */
  setDefaultCompany(): any {
    let companyData: any = this.getAllCompany();
    let locationCompanyIn: any;

    if (this.typeService.getDataLength(companyData) > 0) {
      locationCompanyIn = companyData[0];
      this.setLocationCompanyIn(locationCompanyIn);
    } else {
      this.removeLocationCompanyIn();
    }
  }

  /**
   * 获取当前操作的公司信息
   * @param companyIn
   */
  setLocationCompanyIn(companyIn: any) {
    this.setPersonalData(UserDataBaseService.storeDataKey.LOCATION_COMPANY_KEY, companyIn, 1);
  }

  /**
   * 移除当前操作的公司信息
   */
  removeLocationCompanyIn() {
    this.removePersonalData(UserDataBaseService.storeDataKey.LOCATION_COMPANY_KEY, 1);
  }

  /**
   * 获取当前公司LOGO
   */
  getCompanyLogo(): string {
    let companyData = this.getLocationCompanyIn();
    if (companyData['logo_path']) {
      return companyData['logo_path'];
    }
    return '';
  }

  /**
   * 获取当前公司LOGO
   * @param imgPath
   */
  setCompanyLogo(imgPath: any) {
    this.addCompanyData({logo_path: imgPath});
  }

  /**
   * 设置当前公司的缓存数据
   * @param dataObj
   */
  addCompanyData(dataObj: any) {
    let companyData = this.getLocationCompanyIn();
    this.typeService.mergeObj(companyData, dataObj);
    this.setLocationCompanyIn(companyData);
  }

  /**
   * 删除公司缓存信息
   */
  removeCompanyData() {
    this.removeLocationCompanyIn();
    this.removeData(UserDataBaseService.storeDataKey.COMPANY_DATA);
    this.removePendingUpgradeStudio();
  }

  /**
   * 获取公司权限
   * @return {any}
   */
  getCurrentPermission(){
    let companyData = this.getLocationCompanyIn();
    if (companyData && companyData.hasOwnProperty('permission')) {
      return companyData.permission;
    }
    return false;
  }

  checkIsSuperAdmin(){
    let companyData = this.getLocationCompanyIn();
    if (companyData && companyData.hasOwnProperty('super_admin')) {
      return companyData.super_admin == 1;
    }
    return false;
  }

  setCurrentPermission(newPermArr: Array<any>){
    let companyData = this.getLocationCompanyIn();
    if (companyData && companyData.hasOwnProperty('permission')) {
      companyData['permission'] = newPermArr;
      this.setLocationCompanyIn(companyData);
    }
  }

  setPendingUpgradeStudio(data:any) {
    this.setStoreData(UserDataBaseService.storeDataKey.PENDING_UPGRADE_STUDIO, data);
  }


  removePendingUpgradeStudio() {
    this.removeData(UserDataBaseService.storeDataKey.PENDING_UPGRADE_STUDIO);
  }


  getPendingUpgradeStudio() {
    return this.getData(UserDataBaseService.storeDataKey.PENDING_UPGRADE_STUDIO);
  }


}

