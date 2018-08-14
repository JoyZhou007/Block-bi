import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

Injectable()
export class SearchModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }
  searchGeneral(data?: any, callback?: any): any{
    return this.getData('searchGeneral', data, callback);
  }
}