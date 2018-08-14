import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';
@Injectable()
export class NotificationDataService extends UserDataBaseService {
  private notificationData: any;
  private noticeNotificationData: any = {};
  private notificationSettings: any = {
    general : 0,
    contact : 0,
    chat : 1,
    mission: 0,
    file: 1,
    sound : 1,
    quantity : 3
  };
  private notificationStatusKey: string = UserDataBaseService.storeDataKey.USER_NOTIFICATION_MESSAGE_STATUS;
  private ntSettingsKey: string = UserDataBaseService.storeDataKey.NOTIFICATION_SETTINGS;
  constructor(
    @Inject('type.service') public typeService: any,
    @Inject('store.service') public storeService: any,
    @Inject('notification.service') public notificationService: any
  ) {
    super(storeService);
  }

  /**
   * 通知设置
   * @return {number}
   */
  getNotificationSetting(){
    return this.getData(this.ntSettingsKey);
  }

  /**
   * 通知设置
   * @param data
   */
  setNotificationSetting(data: any){
    this.setData(this.ntSettingsKey, data);
  }

  /**
   * 删除通知设置
   */
  removeNotificationSetting(){
    this.removeData(this.ntSettingsKey);
  }

  /**
   * 叠加收到的消息
   */
  addMyNotification(data: any) {
    let type = data.hasOwnProperty('obj') && data.obj.hasOwnProperty('msgType') && data.obj.msgType === 'notice';
    //type = !!(data.hasOwnProperty('obj') && data.obj.hasOwnProperty('msgType') && data.obj.msgType === 'notice');
    this.setNotificationData(data, type);

    //未读消息状态
    this.setNotificationMessageStatus(data);
  }

  removeNotificationNoticeData(){
    this.sessionRemoveData(UserDataBaseService.storeDataKey.NOTICE_NOTIFICATION);
  }

  /**
   * 初始化notification数据
   * @param storeDataKey       notification 存储key
   * @param identity           存储需要生成的 key identity => 1是个人 identity => 2是公司
   * @param currentMsgType     1 => notice 2 => request
   */
  initNotificationData(storeDataKey: string, identity: number, currentMsgType?: number): any {
    // let notification: any = this.getPersonalData(storeDataKey, 1, (currentMsgType === 1));
    let notification: any = this.getStoreData(storeDataKey, (currentMsgType === 1));
    let dataKey: string = this.getUserDataKey(identity);
    let defaultData: Array<any> = [];
    if (notification && !notification.hasOwnProperty(dataKey)) {
      notification[dataKey] = defaultData;
    }
    if (!notification) {
      notification = {};
      if(currentMsgType === 2) {
        notification = {
          myMail: [],
          mySendList: []
        };
      }
      notification[dataKey] = defaultData;
    }
    return notification;
  }

  /**
   * 返回当前用户key
   * @param identity
   * @returns {string}
   */
  userDataKey(identity: number): string {
    return this.getUserDataKey(identity);
  }

  /**
   * 未读消息状态
   */
  initNotificationMessageStatus() {
    let notificationStatus: any = this.getPersonalData(this.notificationStatusKey, 0 , false);
    if(!notificationStatus) {
      notificationStatus = {
        notice: false,
        request: false,
        isMail: false
      }
    }
    return notificationStatus;
  }

  /**
   * 设置未读消息状态
   * @param data
   */
  setNotificationMessageStatus(data) {
    //消息状态
    let notificationStatus: any = this.initNotificationMessageStatus();
    if(data.obj.msgType === 'notice') {
      notificationStatus.notice = true;
    }else if(data.obj.msgType === 'request') {
      notificationStatus.request = true;
    }else if(data.obj.msgType === 'isMail') {
      notificationStatus.isMail = true;
    }
    this.setPersonalData(this.notificationStatusKey, notificationStatus, 0, false);
  }

  /**
   * 获取消息数据
   * @param data
   * @param type
   */
  setNotificationData(data?: any, type?: boolean): any {
    let key: string;
    let getUserKey: string;
    let storeData: any;
    let getData: Array<any> = [];
    let isBool: boolean = (data.obj.hasOwnProperty('msgType') && data.obj.msgType === 'notice' || type);
    key = isBool ? UserDataBaseService.storeDataKey.NOTICE_NOTIFICATION : UserDataBaseService.storeDataKey.USER_NOTIFICATION;

    //Email
    if(data.obj.hasOwnProperty('msgType') && data.obj.msgType === 'isMail') {
      storeData = this.getStoreData(key);
      if(!storeData) {
        storeData = {
          myMail: [],
          mySendList: []
        }
      }
      getData = storeData['myMail'];
      getData.push(data);
    }else {
      //Request / Notice
      let num: number = this.filterNotification(data) ? 1 : 2;
      getUserKey = this.getUserDataKey(num);
      storeData = this.initNotificationData(key, num, isBool ? 1 : 2);
      getData = storeData[getUserKey];
      getData.push(data);
    }

    this.setStoreData(key, storeData, isBool);
  }

  /**
   * 筛选是个人数据 还是公司数据
   * @param data
   * @return {boolean} true => 个人数据  false => 公司数据
   *
   * 根据 owner 判定
   * owner 是对象且 psid 和 uuid 都存在 特殊处理
   * owner 是 字符串 属于个人数据
   * owner 是 数字 属于公司数据
   */
  filterNotification(data: any): boolean {
    let isBool: boolean;
    let getOwner: any = data.data.owner;
    if(Object.prototype.toString.call(getOwner) === '[object Object]') {
      if((getOwner.uuid !== '') && (getOwner.psid !== '')) {
        isBool = this.filterSpecialACT(data);
      }else {
        if(getOwner.uuid !== '') {
          isBool = true;
        }else if(getOwner.psid !== '') {
          isBool = false;
        }
      }
    }else {
      if((data.data.hasOwnProperty('role') && data.data.role === 3) ||
        (data.data.hasOwnProperty('role') && data.data.role === 2)) {
        isBool = true;
      }else {
        isBool = isNaN(getOwner);
      }
    }
    return isBool;
  }

  /**
   * 过滤特殊 act
   * @param data
   * @returns {boolean}
   */
  filterSpecialACT(data): boolean {
    let getData: any = data.data;
    let act: string = data.act;
    let isBool: boolean;
    switch(act) {
      // 申请好友
      // 算个人消息
      case this.notificationService.config.ACT_USER_REQUEST_ADD_FRIEND:
        isBool = true;
        break;

      //招聘 个人数据
      case this.notificationService.config.ACT_REQUEST_HIRE:
        isBool = true;
        break;
    }
    return isBool;
  }

  /**
   * 清空Notification缓存
   */
  clearStoreNotification() {
    this.removeData(UserDataBaseService.storeDataKey.USER_NOTIFICATION);
    this.removeData(UserDataBaseService.storeDataKey.USER_NOTIFICATION_MESSAGE_STATUS);
    this.sessionRemoveData(UserDataBaseService.storeDataKey.NOTICE_NOTIFICATION);
    this.removeNotificationSetting();
  }


  /**
   * 清除缓存里面的request
   */
  removeNotificationRequestData() {
    this.removeData(UserDataBaseService.storeDataKey.USER_NOTIFICATION);
  }

}