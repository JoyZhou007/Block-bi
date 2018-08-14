import {BaseModelService} from "./base-model.service";
import {Inject} from "@angular/core";
import {UserModelService} from "./user-model.service";
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/21.
 */
export class NotificationModelService extends BaseModelService {
  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  /**
   * 批量获取通知需要显示用的详情，包括用户，任务，文件
   * user 可传psid和uuid
   * mission mid
   * file fid
   * {
   *  data:{
   *   user:[143,"1c496f1b2bd0aa14eeedb20990f66731"],
   *   mission:[346],
   *   file:[588],
   *   group: [12],
   *   tips: [12]
   *  }
   * }
   * @param data
   * @param callback
   */
  public fetchNotificationFetchSummary(data: {user:Array<any>, mission: Array<any>, file:Array<any>, group: Array<any>, tips: Array<any>}, callback?: any) {
    this.getData('notificationFetchSummary', {data: data}, callback);
  }

  /**
   * notification notice 数据
   * @param data
   * @param callBack
   */
  fetchNotice(data: any, callBack: any) {
    this.getData('fetchNotice', data, callBack);
  }

  /**
   * notification request 数据
   * @param data
   * @param callBack
   */
  fetchRequest(data: any, callBack: any) {
    this.getData('fetchRequest', data, callBack);
  }


  notificationUpdatedRequest(data: any, callBack: any) {
    this.getData('notificationUpdatedRequest', data, callBack);
  }


  /**
   * notification request 数据
   * @param callBack
   */
  fetchOffLineMessage(data: any,callBack: any) {
    this.getData('fetchOffLineMessage', null, callBack);
  }
}