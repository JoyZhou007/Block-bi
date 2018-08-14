import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

Injectable()
export class AlarmModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }
  //添加闹钟
  alarmAdd(data?: any, callback?: any): any{
    return this.getData('alarmAdd', data, callback);
  }
  //删除闹钟
  alarmDelete(data: any, callback: any): any{
    return this.getData('alarmDelete', data, callback);
  }
  //修改闹钟
  alarmUpdate(data: any, callback: any):any{
    return this.getData('alarmUpdate',data, callback);
  }
}