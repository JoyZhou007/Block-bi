import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';
import {Router} from "@angular/router";

@Injectable()
export class UserModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any,
              @Inject('im.service') public IMService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('notification-data.service') public notificationDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('structure-data.service') public structureDataService: any,
              private router: Router) {
    super(api);
  }

  doLogin(data: any, callback?: any) {
    this.getData('login', data, callback);
  }

  logout(callback?: Function): any {
    this.getData('logout', null, callback);
  }

  register(data?: any, callback?: any) {
    this.getData('register', data, callback);
  }

  //切换公司
  switchCompany(data?: any, callback?: any) {
    this.getData('switchCompany', {cid: data.cid}, (result: any) => {
      callback(result);
    });
  }

  //重新设置权限
  resetPermission(callBack: any) {
    this.getData('resetPermission', null, callBack);
  }

  //contact-us
  contactUs(data?: any, callBack?: any) {
    this.getData('contact', data, callBack);
  }

  //reset-password by token
  resetPassword(data?: any, callBack?: any) {
    this.getData('resetPsd', data, callBack);
  }

  //account  reset pwd
  resetPwd(data?: any, callBack?: any) {
    this.getData('resetPassword', data, callBack);
  }

  //recover-password
  recoverPassword(data?: any, callBack?: any) {
    this.getData('recoverPsd', data, callBack);
  }

  //发送手机号获取验证码
  sendPhoneOrEmail(data?: any, callBack?: any) {
    this.getData('sendEmailOrPhone', data, callBack);
  }

  validateToken(data?: any, callBack?: any) {
    this.getData('checkToken', data, callBack);
  }

  /**
   * 检查用户在线状态
   * @param data {uid}
   * @param callback
   */
  getOnlineStatus(data?: any, callback?: any) {
    this.getData('getOnlineStatus', data, callback);
  }

  //homepage dashboard
  getHomepageDashboard(data?: any, callback?: any) {
    this.getData('getHomeDashboard', data, callback);
  }

  /**
   * new tips
   */
  newTips(data?: any, callBack?: any) {
    this.getData('createTips', data, callBack);
  }

  /**
   * update tips
   */
  updateTips(data?: any, callBack?: any) {
    this.getData('modificationTips', data, callBack);
  }

  /**
   * delete tips
   */
  deleteTips(data?: any, callBack?: any) {
    this.getData('removeTips', data, callBack);
  }

  /**
   * since rid to show tips detail
   */
  showTipsDetail(data?: any, callBack?: any) {
    this.getData('showTipsDetailApi', data, callBack);
  }


  /**
   * 首页删除mission
   */
  deletePromoted(data: any, callBack?: any) {
    this.getData('deletePromoted', data, callBack);
  }


  /**
   * 获取用户个人设置中心，权限、通知等相关设置
   *
   * return
   * {
   *  'general':1,
   *  'contact':1,
   *  'chat':1,
   *  'mission':1,
   *  'file':1,
   *  'sound':1,
   *  'quantity':1
   * }
   * @param callback
   */
  getSettingNote(callback?: any) {
    this.getData('userGetSettingNote', null, callback);
  }

  /**
   * 设置用户个人设置中心，权限、通知等相关设置
   * @param data
   *  {
   *  'general':1,
   *  'contact':1,
   *  'chat':1,
   *  'mission':1,
   *  'file':1,
   *  'sound':1,
   *  'quantity':1
   *  }
   * @param callback
   */
  setSettingNote(data?: any, callback?: any) {
    this.getData('userSetSettingNote', data, callback);
  }

  getTimeLine(data?: any, callback?: any) {
    this.getData('achieveTimeLine', data, callback);
  }

  /**
   * 查看权限
   * @param data
   * @param callback
   */
  allocatedPrivilege(data?: any, callback?: any) {
    this.getData('userAllocatedPrivilege', data, callback);
  }

  /**
   * 设置权限
   * @param data
   * @param callback
   */
  grantPrivilege(data?: any, callback?: any) {
    this.getData('userGrantPrivilege', data, callback);
  }

  /**
   * 邀请人注册
   * @param data
   * @param callback
   */
  invitePeoples(data?: any, callback?: any) {
    this.getData('invitePeople', data, callback);
  }

  companyAttention(data?: any, callback?: any) {
    this.getData('companyAttention', data, callback)
  }

  attentionList(data?: any, callback?: any) {
    this.getData('attentionList', data, callback)
  }

  outOffice(data?: any, callback?: any) {
    this.getData('outOffice', data, callback)
  }

  /**
   *
   * @param data
   * @param callback
   */
  vacationList(data?: any, callback?: any) {
    this.getData('getVacationList', data, callback);
  }

  /**
   *
   * @param data
   * @param callback
   */
  vacationUsage(data?: any, callback?: any) {
    this.getData('applicationVacationUsage', data, callback);
  }

  /**
   *
   * @param data
   * @param callback
   */
  vacationDays(data?: any, callback?: any) {
    this.getData('remainingVacationDays', data, callback);
  }

  checkContainNationalHoliday(data?: any, callback?: any) {
    this.getData('containNationalHoliday', data, callback);
  }

//  添加国家法定假日

  createNationalHoliday(data?: any, callback?: any) {
    this.getData('createNationalHoliday', data, callback);
  }

//查看法定假日列表
  showNationalHoliday(data?: any, callback?: any) {
    this.getData('showNationalHoliday', data, callback);
  }

  //删除国家法定假日
  deleteNationalHoliday(data?: any, callback?: any) {
    this.getData('deleteNationalHoliday', data, callback)
  }

  //更新公司考勤时间
  updateNationalHoliday(data?: any, callback?: any) {
    this.getData('updateNationalHoliday', data, callback);
  }


//查看公司设置的时间
  showWorKTime(data?: any, callback?: any) {
    this.getData('showWorKTime', data, callback);
  }

  //新建公司考勤时间
  createWorKTime(data?: any, callback?: any) {
    this.getData('createWorKTime', data, callback);
  }


  //更新公司考勤时间
  updateWorKTime(data?: any, callback?: any) {
    this.getData('updateWorKTime', data, callback);
  }

//  显示员工考勤列表
  showAttendance(data: any, callback?: any) {
    this.getData('showAttendance', data, callback)
  }

  //显示员工详情
  showAttendanceDetail(data: any, callback?: any) {
    this.getData('showAttendanceDetail', data, callback)
  }

  //验证 验证码
  verifyAuthCode(data: any, callback?: any) {
    this.getData('testAuthCode', data, callback)
  }

  //申请更换邮箱 发送验证码
  applyChangeEmail(data: any, callback?: any) {
    this.getData('applyUpdateEmail', data, callback)
  }

  //申请更换邮箱
  changeEmail(data: any, callback?: any) {
    this.getData('updateEmail', data, callback)
  }

  //申请更换手机号
  changePhone(data: any, callback?: any) {
    this.getData('updatePhone', data, callback)
  }

  //获取手机注册验证码
  fetchRegisterCode(data: any, callback?: any) {
    this.getData('getRegisterCode', data, callback)
  }

  //获取手机 account验证码
  fetchAccountPhoneCode(data: any, callback?: any) {
    this.getData('getAccountPhoneCode', data, callback)
  }

  //验证注册手机验证码
  verifyRegisterAuthCode(data: any, callback?: any) {
    this.getData('verifyRegisterCode', data, callback)
  }

  //帮助
  helpRecorder(data: any, callback?: any) {
    this.getData('helpRecorder', data, callback)
  }

  updateHelper(data: any, callback?: any) {
    this.getData('updateHelper', data, callback)
  }

  //获取第三方的信息
  fetchThirdAccountInfo(data: any, callback?: any) {
    this.getData('getThirdAccountInfo', data, callback)
  }

  //获取第三方的地址
  fetchAuthorizedAddress(data: any, callback?: any) {
    this.getData('getAuthorizedAddress', data, callback)
  }

  getGrantList(callback?: any) {
    this.getData('getGrantList', null, callback);
  }

  //获取绑定了的第三方账户
  fetchAuthorizedPartner(data: any, callback?: any) {
    this.getData('getAuthorizedPartner', data, callback)
  }

  //获取绑定了的第三方账户
  unbindAuthorizedPartner(data: any, callback?: any) {
    this.getData('unbindAuthorizedPartner', data, callback)
  }

  //获取绑定了的第三方账户
  bindAuthorizedPartner(data: any, callback?: any) {
    this.getData('bindAuthorizedPartner', data, callback)
  }

  //用户更新session
  flushSession(data: any, callback?: any) {
    this.getData('flushSession', data, callback);
  }

  userSetting(data: any, callback?: any) {
    this.getData('userSetting' , data , callback);
  }

  /**
   * 获取用户权限
   * @param callBack
   */
  getPermission(callBack: Function) {
    this.getData('getPermission', null, callBack);
  }

  /**
   * 设置用户权限
   * @param data
   * @param callBack
   */
  setPermission(data: any, callBack?: Function) {
    this.getData('setPermission', data, callBack);
  }

  /**
   * 恢复用户默认权限
   * @param callBack
   */
  defaultSetPermission(callBack?: Function) {
    this.getData('defaultSetPermission', null, callBack);
  }

}
