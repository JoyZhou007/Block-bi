import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class ContactModelService extends BaseModelService {
  private COMPANY_IDENTITY: number = 2;
  private PERSONAL_IDENTITY: number = 1;

  constructor(@Inject('api.service') public api: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any) {
    super(api);
  }

  authorizationAccessInfo(data?: any, callback?: any) {
    this.getData('authorizationAccessInfo', data, callback);
  }

  getContactList(data?: any, callback?: any) {
    this.getData('contactDisplay', data, callback);
  }

  contactSearch(data?: any, callback?: any) {
    this.getData('contactSearch', data, callback);
  }

  /**
   *
   * @param data {
     * uid,
     * multi
   * }
   * @param callback
   */
  getUserInfo(data: any, callback?: any) {
    this.getData('userInfo', data, callback);
  }

  //查看两人之间的关系
  checkRelation(data: any, callback?: any) {
    this.getData('checkRelation', data, callback);
  }


  /**
   * 查看联系人
   */
  viewContact(data?: any): any {
    this.getData('viewContact', data);
  }

  /**
   * 获取被推荐人可以加什么类型好友
   * 0 => 加任何类型好友 1 => 加私人好友 2 => 加工作类型的好友
   * @param data
   * @param callback
   */
  checkRecommendRelation(data?: any, callback?: any): any {
    this.getData('checkRecommendRelation', data, callback);
  }

  /**
   * 获取好友信息
   * @param data
   * @param callback
   */
  getInCommon(data?: any, callback?: any): any {
    this.getData('getInCommon', data, callback);
  }

  /**
   * 删除好友
   * @param data
   * @param callback
   */
  removeFriends(data?: any, callback?: any): any {
    this.getData('removeFriends', data, callback);
  }

  /**
   * 获取招聘信息
   * @param data
   * @param callback
   */
  fetchOccupation(data?: any, callback?: any): any {
    this.getData('fetchOccupation', data, callback);
  }

  /**
   * 保存招聘
   * @param data
   * @param callback
   */
  saveOccupation(data?: any, callback?: any) {
    return this.getData('saveOccupation', data, callback);
  }

  /**
   * 查看好友信息
   * @param data
   * @param callback
   */
  fetchFriendInfo(data?: any, callback?: any): any {
    this.getData('fetchFriendInfo', data, callback);
  }

  /**
   * 查看个人信息
   * @param data
   * @param callback
   */
  userInfo(data?: any, callback?: any): any {
    this.getData('userInfo', data, callback);
  }

  /**
   * 检测是否已被招聘
   * @param data
   * @param callback
   */
  checkIsOccupation(data?: any, callback?: any): any {
    this.getData('checkIsOccupation', data, callback);
  }

  /**
   * 用户所有公司列表
   * @param data
   * @param callback
   */
  fetchUserCompany(data?: any, callback?: any): any {
    this.getData('fetchUserCompany', data, callback);
  }


  /**
   * 查看是否有hire权限 isHireUsers
   */
  isHireUsers(data?: any, callback?: any): any {
    this.getData('isHireUsers', data, callback);
  }

  /**
   * 匹配是否是本人的操作
   * uid
   * user 本地存储的用户数据
   */
  isSelf(uid: string, userData: any): boolean {
    return userData.user.uuid === uid || parseInt(userData.locationCompany.psid) === parseInt(uid);
  }
}

