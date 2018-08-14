import {Injectable} from '@angular/core';
const D3 = require('d3/build/d3');

@Injectable()
export class D3Service {

  /**
   * 初始化对象
   * @returns {any}
   */
  getInstance(): any {
    return D3;
  }
}
 