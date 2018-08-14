import {Injectable} from '@angular/core';
//本地存储
const Store = require('store/store');

const Store2 = require('store2/dist/store2');

@Injectable()
export class StoreService {

  getInstance() {
    //return Store;
    return Store2;
  }

}

