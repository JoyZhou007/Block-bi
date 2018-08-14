import {Inject, Injectable} from '@angular/core';
import {NotificationModelService} from '../../services/index.service';
import {NotificationDialog} from "../model/entity/notification-entity";

@Injectable()
export class NotificationOffLineMessageService {

  private _notificationDialog: NotificationDialog;
  private primaryData: any;
  private membersUid: Array<any> = [];
  private gidArr: Array<number> = [];
  private noticeData: Array<any> = [];
  private requestData: Array<any> = [];
  private midArr: Array<any> = [];

  constructor(@Inject('type.service') private typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification-data.service') public notificationDataService,
              private notificationModelService: NotificationModelService) {
  }

  /**
   * 获取所有 notification
   */
  getAllNotification() {
    this.notificationModelService.fetchOffLineMessage({}, (data: any) => {
      if (data.status === 1) {
        let getData: any = data.data;
        let getHandleData: any = this.dataHandle(getData, true);
        let newArr: any = [];
        this.getFetchNotificationFetchSummary(newArr, getHandleData, () => {
          //request 离线消息
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_READ_OFFLINE,
            status: 1,
            data: newArr
          });
        });
      }
    })
  }

  /**
   * 获取离线 notice 数据列表
   * @param ast_doc_id
   * @param form
   * @param callBack
   */
  getNoticeNotification(ast_doc_id: string, form: number, callBack: any) {
    this.notificationModelService.fetchNotice({data: {last_doc_id: ast_doc_id, form: form}}, (data: any) => {
      if (data.status === 1) {
        let getData: any = data.data;
        this.noticeData = [];
        let getHandleData: any = this.dataHandle(getData);
        if (this.typeService.getDataLength(data.data) > 0) {
          this.getFetchNotificationFetchSummary(this.noticeData, getHandleData, () => {
            if (callBack) {
              callBack(this.noticeData);
            }
          });
        } else {
          if (callBack) {
            callBack(this.noticeData);
          }
        }
      }
    });
  }

  /**
   * 获取离线 request 数据列表
   * @param last_doc_id
   * @param form notification数据类型 1 是个人 2 是公司 不传或者为空是所有
   * @param callBack
   */
  getRequestNotification(last_doc_id: string, form: number, callBack: any) {
    this.notificationModelService.fetchRequest({data: {last_doc_id: last_doc_id, form: form}}, (data: any) => {
      if (data.status === 1) {
        let getData: any = data.data;
        this.requestData = [];
        let getHandleData: any = this.dataHandle(getData);
        if (this.typeService.getDataLength(data.data) > 0) {
          this.getFetchNotificationFetchSummary(this.requestData, getHandleData, () => {
            if (callBack) {
              callBack(this.requestData);
            }
          });
        } else {
          if (callBack) {
            callBack(this.requestData);
          }
        }
      }
    });
  }

  /**
   * 获取用户信息
   * @param pushArr
   * @param getHandleData
   * @param callBack
   */
  getFetchNotificationFetchSummary(pushArr: Array<any>, getHandleData: any, callBack: any) {
    let data: any = {user: this.membersUid, mission: this.midArr, file: [], group: this.gidArr, tips: []};
    this.notificationModelService.fetchNotificationFetchSummary(data, (response: any) => {
      let result: any = response.data;
      this._notificationDialog = new NotificationDialog();
      if (response.status === 1) {
        for (let list in getHandleData) {
          let listData: any = getHandleData[list];
          if (!listData.hasOwnProperty('act')) continue;
          let newNotificationDialog: NotificationDialog = this.typeService.clone(this._notificationDialog);
          this.primaryData = {
            act: listData.act,
            data: listData,
            obj: newNotificationDialog,
            isMission: listData.hasOwnProperty('mid') ? true : false
          };
          if(listData.act === this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT) {
            this.primaryData.act = this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT;
          }else if(listData.hasOwnProperty('cid') && listData.role === 4 &&
            listData.act === this.notificationService.config.ACT_NOTICE_ADMIN_CHANGE) {
            //act 等于 103030 并且 cid 不为空 并且 role 等于 4
            this.primaryData.act = this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT;
          }
          delete listData.act;
          this.primaryData.obj.detail = {group: [], user: [], tips: [], mission: [], file: []};

          //group
          if (this.typeService.getDataLength(result.group) > 0) {
            for (let group in result.group) {
              if (parseInt(result.group[group].gid) == parseInt(listData.gid)) {
                this.primaryData['obj']['detail']['group'].push(result.group[group]);
                break;
              }
            }
          }

          //user
          if (result.hasOwnProperty('user') && this.typeService.getDataLength(result.user) > 0) {
            for (let user in result.user) {
              if (Object.prototype.toString.apply(listData.owner) === '[object Object]') {
                if (listData.owner.psid == result.user[user].uid ||
                  listData.owner.uuid == result.user[user].uid ||
                  listData.owner.uid == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                  this.primaryData['obj']['senderInfo'] = result.user[user];
                }
              } else {
                if (listData.owner == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                  this.primaryData['obj']['senderInfo'] = result.user[user];
                }
              }

              //initiator
              if(listData.hasOwnProperty('cid') && listData.initiator == result.user[user].uid && !listData.hasOwnProperty('owner')) {
                this.primaryData['obj']['detail']['user'].push(result.user[user]);
                this.primaryData['obj']['senderInfo'] = result.user[user];
                this.primaryData['companyName'] = this.companyDataService.getCurrentCompanyName();
              }

              //referral 被推荐人
              if (listData.hasOwnProperty('referral')) {
                if (listData.referral == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                  // this.primaryData['obj']['senderInfo'] = result.user[user];
                }
              }

              //referee 介绍人
              if (listData.hasOwnProperty('referee')) {
                if (listData.referee == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                  // this.primaryData['obj']['senderInfo'] = result.user[user];
                }
              }

              //referee 介绍人
              if (listData.hasOwnProperty('acceptor')) {
                if (listData.acceptor == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                  // this.primaryData['obj']['senderInfo'] = result.user[user];
                }
              }

              //receiver
              if (listData.hasOwnProperty('receiver')) {
                if (listData.receiver == result.user[user].uid) {
                  this.primaryData['obj']['detail']['user'].push(result.user[user]);
                }
              }


              //邀请好友进群有 members
              if (listData.hasOwnProperty('members')) {
                for (let member in listData.members) {
                  if (listData.members[member].uid == result.user[user].uid) {
                    this.primaryData['obj']['detail']['user'].push(result.user[user]);
                    break;
                  }
                }
              }
            }
            for (let i in result.mission) {
              if (listData.hasOwnProperty('mid') && parseInt(listData.mid) == parseInt(result.mission[i].id)) {
                this.primaryData['obj']['detail']['mission'].push(result.mission[i]);
              }
            }


          }

          //tips
          if (this.typeService.getDataLength(result.tips)) {

          }

          newNotificationDialog.init(this.primaryData, true, this.translate);
          pushArr.push(this.typeService.clone(this.primaryData));
        }
        if (callBack) {
          callBack();
        }
      }
    })
  }

  /**
   * 数据处理
   * @param getData
   * @param bool 是否是离线
   */
  dataHandle(getData: any, bool?: boolean): any {
    let returnData: Array<any> = [];
    this.membersUid = [];
    this.gidArr = [];
    for (let list in getData) {
      if (bool && getData[list].handled === 1) continue;
      returnData.push(getData[list]);

      //receiver
      if (this.typeService.getDataLength(this.membersUid) === 0) {
        this.membersUid.push(getData[list].receiver);
      }

      //owner
      if (Object.prototype.toString.apply(getData[list].owner) === '[object Object]') {
        //owner 是对象的里面是 uid
        let uid: string = getData[list].owner.uid ? getData[list].owner.uid : getData[list].owner.uuid;
        this.isInArray(this.membersUid, uid);

      } else if (typeof getData[list].owner === 'string' || typeof getData[list].owner === 'number') {
        //owner 是字符串
        this.isInArray(this.membersUid, getData[list].owner);

      }

      //initiator
      if(getData[list].hasOwnProperty('initiator') && getData[list].hasOwnProperty('cid') &&
        getData[list].hasOwnProperty('role')) {
        this.isInArray(this.membersUid, getData[list].initiator);
      }

      //referral
      if (getData[list].hasOwnProperty('referral')) {
        this.isInArray(this.membersUid, getData[list]['referral']);
      }

      //referee
      if (getData[list].hasOwnProperty('referee')) {
        this.isInArray(this.membersUid, getData[list]['referee']);
      }

      //members
      if (getData[list].hasOwnProperty('members') && Object.prototype.toString.call(getData[list].members) === '[object Array]') {
        for (let key in getData[list].members) {
          this.isInArray(this.membersUid, getData[list].members[key].uid);
        }
      }

      //gid
      if (getData[list].hasOwnProperty('gid')) {
        this.isInArray(this.gidArr, parseInt(getData[list].gid));
      }

      //gid
      if (getData[list].hasOwnProperty('mid')) {
        getData[list].isMission = true;
        this.isInArray(this.midArr, parseInt(getData[list].mid));
      }
    }
    return returnData;
  }

  /**
   * 是否存在数组中
   * @param data
   * @param uid
   */
  isInArray(data: Array<any>, uid: any) {
    let bool: boolean = this.typeService.isArrayVal(data, '', uid, true);
    if (!bool) {
      data.push(uid);
    }
  }


}
