import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class OfflineDataModelService extends BaseModelService {
  constructor(
      @Inject('api.service') public api : any
  ) {
    super(api);
  }

  //获取离线offline notification
  fetchNotification(callback? : any) {
    this.getData('offlineNotification', null, callback);
  }

}