import {Inject, Injectable} from "@angular/core";
import {UserDataBaseService} from "../userDataBase.service";
//程序全局配置
import {clearStoreData} from "../../../../config/clear.config";
import {StoreService} from "../../../storage/store.service";
import {ContactsList} from "../../entity/contact-entity";

//中文简体
const CN = 'zh-Hans';
//中文繁体
const TW_CN = 'zh-Hant';
//英文
const EN = 'en_US';

@Injectable()
export class UserDataService extends UserDataBaseService {


  constructor(@Inject('app.config') private appConfig: any,
              @Inject('type.service') private typeService: any,
              @Inject('store.service') public storeService: StoreService,
              @Inject('file.service') public fileService: any,
              @Inject('company-data.service') public companyDataService: any) {
    super(storeService);
  }

  /**
   * 设置用户信息
   * @param userData
   * @param resetUserData 重置用户数据
   */
  setUserIn(userData: any, resetUserData: boolean, isAutoLogout?: boolean) {
    if (resetUserData) {
      this.removeUserData();
    }
    if (userData[UserDataBaseService.storeDataKey.USER_SESSION_ID]) {
      this.setSessionId(userData[UserDataBaseService.storeDataKey.USER_SESSION_ID], true);
      delete userData[UserDataBaseService.storeDataKey.USER_SESSION_ID];
    }
    this.setData(UserDataBaseService.storeDataKey.USER_DATA_KEY, userData);
    if (userData.companies_information) {
      if (resetUserData) {
        this.companyDataService.removeCompanyData();
      }
      this.companyDataService.setAllCompany(userData.companies_information);
      delete userData.companies_information;
    }

  }

  /**
   * 更改用户状态
   */
  refreshCompanyInfo(companyData: any) {
    if (companyData) {
      let userData = this.getUserIn();
      this.companyDataService.setAllCompany(companyData, false);

      if (userData.locationCompany.cid === '') { //当前用户没有公司,切换到公司
        this.companyDataService.setDefaultCompany();
      } else {
        let curCompany: any = this.companyDataService.getCompanyByCid(userData.locationCompany.cid);

        //没有删除公司
        if (curCompany) {
          //重新设置当前公司的数据
          this.companyDataService.setLocationCompanyIn(curCompany);
        } else {
          this.companyDataService.setDefaultCompany();
        }
      }
    }
  }

  /**
   * 更新user data中某些字段
   * @param data
   */
  updateUserIn(data: {[key: string]: any}) {
    let userData = this.getLoginUserIn();
    if (userData) {
      for (let key in data) {
        if (userData.user.hasOwnProperty(key)) {
          userData.user[key] = data[key];
        }
      }
      this.setUserIn(userData, true, true);
    }
  }

  /**
   * 获取用户信息
   * @param key
   */
  getUserIn(key?: string): any {
    let userData = this.getLoginUserIn();
    if (userData && !userData.hasOwnProperty('locationCompany')) {
      userData.locationCompany = this.companyDataService.getLocationCompanyIn();
    }
    let returnData: any = {};
    if (userData) {
      returnData = key ? userData[key] : userData;
    }
    return returnData;
  }

  getCurrentProfilePath(size?: number) {
    let s = size ? size : 36;
    let userData = this.getLoginUserIn();
    if (userData && userData.hasOwnProperty('user') && userData.user.hasOwnProperty('user_profile_path')) {
      //获取用户不同尺寸图片
      return this.fileService.getImagePath(s, userData.user.user_profile_path);
    } else {
      return '';
    }
  }

  /**
   * 获取当前公司所在职位ID
   */
  getCurrentCompanyPSID() {
    let companyInfo = this.companyDataService.getLocationCompanyIn();
    if (companyInfo && companyInfo.hasOwnProperty('psid')) {
      return companyInfo.psid;
    }
    return false;
  }

  /**
   * 获取当前用户个人ID
   * @returns {boolean}
   */
  getCurrentUUID() {
    let userData = this.getLoginUserIn();
    if (userData && userData.hasOwnProperty('user') && userData.user.hasOwnProperty('uuid')) {
      return userData.user.uuid;
    }
    return false;
  }

  /**
   * 当前登录用户名字
   * @returns {string}
   */
  getCurrentUserName() {
    let userData = this.getLoginUserIn();
    if (userData && userData.hasOwnProperty('user') && userData.user.hasOwnProperty('work_name')) {
      return userData.user.work_name;
    }
    return '';
  }

  /**
   * 当前用户私人邮箱
   * @return {string}
   */
  getCurrentUserEmail() {
    let userData = this.getLoginUserIn();
    if (userData && userData.hasOwnProperty('user') && userData.user.hasOwnProperty('email')) {
      return userData.user.email;
    }
    return '';
  }

  removeUserLoginData() {
    this.removeSessionId();
    this.removeContactList();
    this.removeUserData();
    this.removeHelp();
  }


  /**
   * 设置用户登录会话
   * @param sessionId
   */
  setSessionId(sessionId: string, bool?: boolean) {
    if (bool) {
      this.sessionSetData(UserDataBaseService.storeDataKey.USER_SESSION_ID, sessionId);
    } else {
      this.setData(UserDataBaseService.storeDataKey.USER_SESSION_ID, sessionId);
    }
  }

  /**
   * 获取用户登录会话
   */
  getSessionId(): any {
    if (this.getData(UserDataBaseService.storeDataKey.USER_SESSION_ID)) {
      return this.getData(UserDataBaseService.storeDataKey.USER_SESSION_ID);
    } else {
      return this.sessionGetData(UserDataBaseService.storeDataKey.USER_SESSION_ID);
    }
  }

  /**
   * 清除用户登录会话
   */
  removeSessionId() {
    this.removeData(UserDataBaseService.storeDataKey.USER_SESSION_ID);
    this.sessionRemoveData(UserDataBaseService.storeDataKey.USER_SESSION_ID);
  }


  /**
   * 获取联系人列表
   */
  getContactList(): any {
    return this.getData(UserDataBaseService.storeDataKey.USER_CONTACT_LIST);
  }

  /**
   * 获取用户列表
   */
  setContactList(data: any) {
    this.setData(UserDataBaseService.storeDataKey.USER_CONTACT_LIST, data);
  }

  /**
   * 清除contact List
   */
  removeContactList() {
    this.removeData(UserDataBaseService.storeDataKey.USER_CONTACT_LIST);
  }

  /**
   * 清除用户信息
   */
  removeUserData() {
    this.removeData(UserDataBaseService.storeDataKey.USER_DATA_KEY);
  }

  /**
   * 获取清除本地存储数据信息
   */
  getClearStoreDataIn() {
    return this.getData(UserDataBaseService.storeDataKey.USER_CLEAR_STORE_DATA);
  }

  /**
   * 设置清除本地存储数据信息
   * {
	 * 	appVersion : 0.1,
	 * 	status : 1 已清除
	 * }
   */
  setClearStoreDataIn(data: any) {
    this.setData(UserDataBaseService.storeDataKey.USER_CLEAR_STORE_DATA, data);
  }


  /**
   * 设置用户最后操作时间
   */
  setUserLastRefreshTime(data: any) {
    this.setData(UserDataBaseService.storeDataKey.USER_REFRESH_TIME, data);
  }

  /**
   * 获取用户最后操作时间
   */
  getUserLastRefreshTime() {
    return this.getData(UserDataBaseService.storeDataKey.USER_REFRESH_TIME);
  }

  removeUserLastRefreshTime() {
    return this.removeData(UserDataBaseService.storeDataKey.USER_REFRESH_TIME);
  }

  /**
   * 设置用户Session过期时间
   */
  setSessionExpiresTime(data: any) {
    this.setData(UserDataBaseService.storeDataKey.SESSION_EXPRESS_TIME, data);
  }

  /**
   * 获取用户Session过期时间
   */
  getSessionExpiresTime() {
    return this.getData(UserDataBaseService.storeDataKey.SESSION_EXPRESS_TIME);
  }

  /**
   * 移除用户Session过期时间
   */
  removeSessionExpiresTime() {
    return this.removeData(UserDataBaseService.storeDataKey.SESSION_EXPRESS_TIME);
  }


  /**
   * 检测是否需要清除本地存储数据
   * 以下两种情况需要清除本地数据
   * 1. app version升级
   * 2. session过期
   */
  checkClearStoreData() {
    let isClear: boolean = true;
    //有需要清除的数据
    if (this.typeService.getDataLength(clearStoreData) > 0) {
      let clearDataIn = this.getClearStoreDataIn();
      //检测是否需要清除本地缓存数据
      if (clearDataIn && clearDataIn.appVersion && clearDataIn.appVersion > this.appConfig.appVersion
        && clearDataIn.status === 1) {
        //不需要清除
        isClear = false;
      }
    }
    return isClear;
  }

  /**
   * 清除本地存储数据
   */
  clearStoreData(force?: boolean) {
    if (this.checkClearStoreData() || force === true) {
      this.removeHelp();
      this.setClearStoreDataIn({
        appVersion: this.appConfig.appVersion,
        status: 1
      });
    }
  }

  /**
   * 返回当前好友对象
   * @param uid
   */
  getContactsObjViaUid(uid: any): any {
    let getContactsList = this.getContactList();
    for (let typeName in getContactsList) {
      if (getContactsList.hasOwnProperty(typeName)) {
        for (let type in getContactsList[typeName]) {
          if (getContactsList[typeName].hasOwnProperty(type) && getContactsList[typeName][type].hasOwnProperty('uid')) {
            if (getContactsList[typeName][type]['uid'] == uid) {
              return getContactsList[typeName][type];
            }
          }
        }
      }

    }
  }


  /**
   * 是否在登录状态
   */
  checkUserLoginStatus(): boolean {
    let sid = this.getSessionId();
    return sid !== null && sid != '';
  }

  /**
   *重新刷新contactList
   * @param data
   * @param callback
   */
  reloadContactList(data: any, callback?: any): void {
    let internalList = this.typeService.bindDataList(ContactsList.init(), data.Internal);
    let friendList = this.typeService.bindDataList(ContactsList.init(), data.Friend);
    let cooperatorList = this.typeService.bindDataList(ContactsList.init(), data.Cooperator);

    let contactsList = {
      Internal: internalList,
      Cooperator: cooperatorList,
      Friend: friendList
    };
    //设置本地缓存联系人列表缓存数据
    this.setContactList(contactsList);
    if (typeof callback === 'function') {
      callback();
    }
  }

  /**
   * 获得语言设置
   * @return {any}
   */
  getLanguage() {
    return this.getData(UserDataBaseService.storeDataKey.LANGUAGE_SETTING);
  }

  /**
   * 获得语言设置对应的字符
   * @return {any}
   */
  getLanguageNum() {
    let num;
    switch (this.getLanguage()) {
      case 'zh-cn':
        num = CN;
        break;
      case 'en':
        num = EN;
        break;
    }
    return num;
  }

  /**
   * 设置语言
   * @param lan
   */
  setLanguage(lan: string) {
    this.setData(UserDataBaseService.storeDataKey.LANGUAGE_SETTING, lan);
  }

  setHelp(param: any): void {
    this.setData(UserDataBaseService.storeDataKey.HELP_NOTICE, param);
  }

  getHelp() {
    return this.getData(UserDataBaseService.storeDataKey.HELP_NOTICE);
  }

  removeHelp() {
    this.removeData(UserDataBaseService.storeDataKey.HELP_NOTICE);
  }
}
