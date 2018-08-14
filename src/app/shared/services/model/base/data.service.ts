import {Inject, Injectable} from '@angular/core';

/**
 * @see Store2 https://github.com/nbubna/store
 */
@Injectable()
export class DataService {
  public s: any;
  // 加密设置
  public secureMode: boolean = false;

  constructor(@Inject('store.service') public storeService: any) {
    if (typeof this.s === 'undefined') {
      this.s = this.storeService.getInstance();
    }
  }

  /**
   * 获取数据
   * @param key
   */
  getData(key: string): any {
    return this.s.get(key);
  }

  /**
   * 设置数据
   * @param key
   * @param data
   */
  setData(key: string, data: any): any {
    this.s.set(key, data);
  }

  /**
   * 移除数据
   * @param key
   */
  removeData(key: string) {
    this.s.remove(key);
  }

  /**
   *
   * @param key
   * @param data
   */
  sessionSetData(key: string, data: any) {
    this.s.session(key, data);
  }

  /**
   *
   * @param key
   * @returns {any}
   */
  sessionGetData(key: string) {
    return this.s.session(key);
  }

  /**
   *
   * @param key
   */
  sessionRemoveData(key: string) {
    this.s.area('session').remove(key);
  }
}


