import {DataService} from '../base/data.service';

//程序全局配置
import {storeDataKey} from '../../../config/member.config';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class UserDataBaseService extends DataService {
  public static storeDataKey: any = storeDataKey;

  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);
  }

  /**
   * 获取个人数据
   * @param key
   * @param identity 1:个人身份 2:公司身份 0:自动生成
   * @param type true: session中的缓存 false: local中的缓存
   */
  getPersonalData(key: string, identity: number = 0, type?: boolean): any {
    let userDataKey = this.getUserDataKey(identity);
    if (userDataKey !== '') {
      let data: any = this.getStoreData(key, type);
      if (data) {
        return data[userDataKey];
      } else {
        return data;
      }
    }
  }

  /**
   * 移除个人数据
   * @param key
   * @param identity
   * @param type
   */
  removePersonalData(key: string, identity: number = 0, type?: boolean) {
    let userDataKey = this.getUserDataKey(identity);
    if (userDataKey !== '') {
      let data: any = this.getStoreData(key, type);
      if (data && typeof data === 'object') {
        delete data[userDataKey];
        this.setStoreData(key, data, type);
      }
    }
  }


  /**
   * 设置个人数据
   * @param key
   * @param data
   * @param identity
   * @param type
   */
  setPersonalData(key: string, data: any, identity: number = 0, type?: boolean): any {
    let userDataKey = this.getUserDataKey(identity);
    if (userDataKey !== '') {
      let setData: any = this.getStoreData(key, type);
      setData = setData ? setData : {};
      setData[userDataKey] = data;
      this.setStoreData(key, setData, type);
    }
  }

  /**
   * 获取缓存数据
   * @param key
   * @param type
   */
  getStoreData(key: string, type?: boolean): any {
    let data: any;
    if (type) {
      data = this.sessionGetData(key);
    } else {
      data = this.getData(key);
    }
    return data;
  }

  /**
   * 设置数据
   * @param key
   * @param data
   * @param type
   */
  setStoreData(key: string, data: any, type?: boolean) {
    if (type) {
      this.sessionSetData(key, data);
    } else {
      this.setData(key, data);
    }
  }

  /**
   * 移除数据
   * @param key
   * @param type
   */
  removeStoreData(key: string, type?: boolean) {
    if (type) {
      this.sessionRemoveData(key);
    } else {
      this.removeData(key);
    }
  }

  /**
   * 获取用户存储数据标识
   */
  getUserDataKey(identity: number): string {
    let userDataKey = '';
    let userIn = this.getLoginUserIn();
    let locationCompany: any = {};
    if (identity === 1) {
      userDataKey = userIn && userIn.user ? userIn.user.uuid : '';
    } else if (identity === 2) {
      locationCompany = this.getLoginUserLocationCompanyIn();
      if (locationCompany && locationCompany.psid) {
        userDataKey = locationCompany.psid;
      }
    } else {
      locationCompany = this.getLoginUserLocationCompanyIn();
      if (locationCompany && locationCompany.psid) {
        userDataKey = locationCompany.psid;
      } else {
        userDataKey = userIn && userIn.user ? userIn.user.uuid : '';
      }
    }
    return userDataKey;
  }

  /**
   * 获取用户登录信息
   * @returns {any}
   */
  getLoginUserIn() {
    return this.getData(UserDataBaseService.storeDataKey.USER_DATA_KEY);
  }

  /**
   * 获取用户操作的默认公司信息
   * @returns {any}
   */
  getLoginUserLocationCompanyIn() {
    return this.getPersonalData(UserDataBaseService.storeDataKey.LOCATION_COMPANY_KEY, 1);
  }

}
