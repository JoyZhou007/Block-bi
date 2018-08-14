import {Injectable, Inject} from '@angular/core';
import {UserDataBaseService} from '../userDataBase.service';

@Injectable()
export class BehaviourDataService extends UserDataBaseService {

  private userBehaviourData: any;

  constructor(@Inject('store.service') public storeService: any) {
    super(storeService);
    //this.getUserBehaviourData();
  }

  /**
   * 获取用户行为数据
   */
  getUserBehaviourData() {
    this.userBehaviourData = this.getData(UserDataBaseService.storeDataKey.USER_BEHAVIOUR_LIST);
    this.userBehaviourData = this.userBehaviourData ? this.userBehaviourData : {};
  }

  /**
   * 根据用户行为key,设置行为数据
   * @param userBehaviourKey
   * @param data
   */
  setUserBehaviourDataByKey(userBehaviourKey: string, data: any) {
    this.userBehaviourData[userBehaviourKey] = data;
    this.setUserBehaviourData();
  }

  /**
   * 根据用户行为key,获取行为数据
   * @param userBehaviourKey
   * @param data
   */
  getUserBehaviourDataByKey(userBehaviourKey: string): any {
    return this.userBehaviourData[userBehaviourKey];
  }

  /**
   * 设置用户行为数据
   */
  setUserBehaviourData() {
    this.setData(UserDataBaseService.storeDataKey.USER_BEHAVIOUR_LIST, this.userBehaviourData);
  }

}

export const behaviourKey: any = {
  CONTACT_LIST: 'contact_list'
};
