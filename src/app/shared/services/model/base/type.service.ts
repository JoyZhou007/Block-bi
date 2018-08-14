import { Injectable } from "@angular/core";
import Timer = NodeJS.Timer;

@Injectable()
export class TypeService {

  private TYPE_OBJ = 'object';
  private TYPE_ARRAY = 'array';
  private TYPE_UNDEFINED = 'undefined';
  private TYPE_STRING = 'string';
  private TYPE_NUMBER = 'number';
  private TYPE_NULL = 'null';

  //执行类型转换
  bindData(ClassObject: any, dataObj: any, callback?: Function): any {
    if (this.getDataLength(dataObj) === 0) {
      return ClassObject;
    }
    //let returnDataObj = this.clone(ClassObject);
    for (let property in ClassObject) {
      let dataType = typeof dataObj[property];
      if (dataType !== 'undefined') {
        let varType = typeof ClassObject[property];
        dataObj[property] = dataObj[property] === null ? '' : dataObj[property];
        switch (varType) {
          case 'number':
            let val: number = 0;
            dataObj[property] = dataObj[property].toString();
            let reg: any = /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/;
            let numReg = new RegExp(reg);
            if (numReg.test(dataObj[property])) {   //是数字
              if (dataObj[property].indexOf('.') !== -1) { //小数
                val = parseFloat(dataObj[property]);
              } else {
                val = parseInt(dataObj[property]);
              }
            } else {
              val = 0;
            }
            ClassObject[property] = val;
            break;
          case 'string':
            ClassObject[property] = dataObj[property].toString();
            break;
          default:
            ClassObject[property] = dataObj[property];
            break;
        }
      }
    }
    if (typeof callback === 'function') {
      callback(ClassObject);
    }
    //销毁数据对象
    //dataObj = null;
  }

  /**
   *  绑定数组对象数据
   *
   * @param ClassObject 数据Class类型
   * @param dataListObj 数据列表
   * @param isDestroy   是否销毁原始数据
   * @param callback
   * @returns {any[]}
   */
  bindDataList(ClassObject: any, dataListObj: any, isDestroy: boolean = true, callback?: Function) {
    let returnListObject: any[] = [];
    if (dataListObj) {
      for (let key in dataListObj) {
        let newDataObj = this.clone(ClassObject);
        this.bindData(newDataObj, dataListObj[key]);
        if (typeof callback === 'function') {
          callback(newDataObj);
        }
        returnListObject.push(newDataObj);

        if (isDestroy) {
          //注销数据对象
          delete dataListObj[key];
        }
      }
    }
    return returnListObject;
  }

  /**
   * 克隆对象 (解决对象绑定值遇到数据引用类型的问题)
   * @param obj
   * @returns {any}
   */
  clone(obj: any): any {
    if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj) {
      return obj;
    }

    let cloneObj: any = new obj.constructor;
    for (let attr in obj) {
      if (typeof obj[attr] === 'object' && attr !== 'timer') {
        cloneObj[attr] = this.clone(obj[attr]);
      } else {
        cloneObj[attr] = obj[attr];
      }
    }
    return cloneObj;
  }

  /**
   * 合并对象属性
   * @param setObj
   * @param newObj 需要合并到setObj的数据
   * @returns {any}
   */
  mergeObj(setObj: any, newObj: any) {
    for (let property in newObj) {
      setObj[property] = newObj[property];
    }
    return setObj;
  }

  /**
   * 获取对象长度
   * @param obj
   */
  getObjLength(obj: any) {
    let length: number = 0;
    if (obj) {
      for (let key in obj) {
        //key = key;
        length++;
      }
    }
    return length;
  }

  /**
   * 获取数据长度
   * @param data
   */
  getDataLength(data: any) {
    let length = 0;
    let type = (typeof data).toLocaleLowerCase();
    switch (type) {
      case this.TYPE_NULL :
        length = 0;
        break;
      case this.TYPE_ARRAY :
        length = data.length;
        break;
      case this.TYPE_OBJ :
        length = this.getObjLength(data);
        break;
      case this.TYPE_UNDEFINED:
        length = 0;
        break;
      case this.TYPE_STRING:
        length = data.length;
        break;
      case this.TYPE_NUMBER:
        data = data.toString();
        length = data.length;
        break;
      default :
        length = 1;
        break;

    }
    return length;
  }

  /**
   * 获取中英文混合字符串定义长度
   */
  getStringLocaleLen(text: any) {
    if (!text) {
      return 0;
    }
    let cnCharLen = 3;
    let textLen: number = 0;
    // 英文
    let regExpEn = /[a-z|A-Z|0-9]|[`|!|@|#|$|%|^|&|*|(|)|\-|_|+|{|}|<|>|?|,|.|/|[|'|;|:|"|\\]/gi;
    // 换行
    let regExpSpace: any = /\s/g;
    for (let i = 0; i < text.length; i++) {
      regExpEn.lastIndex = 0;
      if (regExpEn.test(text[i]) || regExpSpace.test(text[i])) {
        textLen += 1;
      } else {
        textLen += cnCharLen;
      }
    }
    return textLen;
  }

  /**
   * 按照中英文混合长度截取字符串
   */
  localeSubString(text: any, start: number, maxLen: number) {
    if (!text) {
      return '';
    }
    if (start > text.length) {
      return '';
    }
    let cnCharLen = 3;
    let textLen: number = 0;
    let returnStr: string = '';
    // 英文
    let regExpEn = /[a-z|A-Z|0-9]|[`|!|@|#|$|%|^|&|*|(|)|\-|_|+|{|}|<|>|?|,|.|/|[|'|;|:|"|\\]/gi;
    // 换行
    let regExpSpace: any = /\s/g;
    for (let i = start; i < text.length; i++) {
      regExpEn.lastIndex = 0;
      if (regExpEn.test(text[i]) || regExpSpace.test(text[i])) {
        textLen += 1;
      } else {
        textLen += cnCharLen;
      }
      if (textLen > maxLen) {
        break;
      } else {
        returnStr += text[i];
      }
    }
    return returnStr;
  }

  /**
   * 判断元素是否在数组内
   * @param search
   * @param array
   * @returns {boolean}
   */
  inArray(search: any, array: any): boolean {
    let bol: boolean = false;
    for (let i in array) {
      if (array[i] === search) {
        bol = true;
        break;
      }
    }
    return bol;
  }

  /**
   * 判断数组中键是否存在
   * @param search
   * @param array
   * @returns {boolean}
   */
  isSetKey(search: any, array: any): boolean {
    let bol: boolean = false;
    for (let i in array) {
      if (i === search) {
        bol = true;
        break;
      }
    }
    return bol;
  }


  /**
   * 判断数组中是否存在Key
   * @param search
   * @param array
   * @param key
   * @returns {boolean}
   */
  isArrayKey(search: any, array: any, key?: string): boolean {
    let arraySear: any;
    for (let i in array) {
      if (!!key) {
        arraySear = array[i][key];
      } else {
        arraySear = array[i];
      }
      if (arraySear == search) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断数组中值是否相等
   * @param searchArray
   * @param arrayKey
   * @param searchVal
   * @param type
   * @returns {boolean}
   */
  isArrayVal(searchArray: any, arrayKey: string, searchVal: string, type?: boolean): boolean {
    for (let val in searchArray) {
      if (type) {
        if (searchArray[val] == searchVal) {
          return true;
        }
      } else {
        if (searchArray[val][arrayKey] == searchVal) {
          return true;
        }
      }

    }
    return false;
  }

  /**
   * 获取对象名
   */
  getObjName(obj: any) {
    let name: string = '';
    if (obj && obj.constructor) {
      name = obj.constructor.toString().match(/function\s*([^(]*)\(/)[1];
    }
    return name;
  }

  /**
   * 返回当前 uid 所在组的 key
   * @param fList
   * @param uid
   * @returns {string}
   */
  getContactType(fList: any, uid: string): string {
    let type: string = 'Internal';
    for (let key in fList) {
      for (let k in fList[key]) {
        if ((fList[key][k].uid === uid) || (fList[key][k].uuid === uid) || fList[key][k].psid === uid) {
          type = key;
          break;
        }
      }
    }
    return type;
  }

  /**
   * 索引列表
   * @param data
   * @param str
   * @param nameType 搜索匹配名
   * @param start true 是否从起始位值开始
   */
  regExpList(data: any, str: string, nameType?: string, start?: boolean): any {
    str = str.replace(/\\/g, '\\');
    str = str.replace(/\[/g, '\\[');
    str = str.replace(/]/g, '\\]');
    str = str.replace(/\./g, '\.');
    let reg: any = start ? new RegExp('^' + str, 'i') : new RegExp(str, 'i');
    if (start && str === '#') {
      reg = /^[0-9|\u4E00-\u9FA5\uF900-\uFA2D]/;
    }
    let result: any[] = [];
    nameType = nameType ? nameType : 'work_name';
    for (let list in data) {
      let name: string = data[list][nameType];
      if (reg.test(name)) {
        result.push(data[list]);
      }
    }
    return result;
  }

  /**
   * 返回好友对象
   * @param contactList
   * @param uid
   * @param del 是否删除当前对象
   */
  friendObj(contactList: any, uid: string, del?: boolean) {
    let member: any = {};
    for (let key in contactList) {
      if (contactList.hasOwnProperty(key)) {
        for (let k in contactList[key]) {
          if ((contactList[key][k].uid === uid) ||
            (contactList[key][k].psid === uid) ||
            (contactList[key][k].uuid === uid)) {
            if (del) {
              contactList[key].splice(k, 1);
            } else {
              member = contactList[key][k];
            }
            break;
          }
        }
      }
    }
    return del ? contactList : member;
  }


  /**
   * 判断两个值是否相等
   * @param x
   * @param y
   * @returns {boolean}
   */
  isEquals(x: any, y: any) {
    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!( x instanceof Object ) || !( y instanceof Object )) return false;
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (let p in x) {
      if (!x.hasOwnProperty(p)) continue;
      // other properties were tested using x.constructor === y.constructor

      if (!y.hasOwnProperty(p)) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

      if (x[p] === y[p]) continue;
      // if they have the same strict value or identity then they are equal

      if (typeof( x[p] ) !== "object") return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

      if (!this.isEquals(x[p], y[p])) return false;
      // Objects and Arrays must be tested recursively
    }

    for (let p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
      // allows x[ p ] to be set to undefined
    }
    return true;
  };


  /**
   * 判断是字符串还是数字
   * e.g
   *  123         true
   * '123'       true
   * 'AAAAAAAA'  false
   * @param val
   * @returns {boolean}
   */
  isNumber(val: any) {
    return !isNaN(val);
  }
}
