import {Injectable} from '@angular/core';

@Injectable()
export class StringService {

  //private TYPE_OBJ = 'object';
  //private TYPE_ARRAY = 'array';
  //private TYPE_UNDEFINED = 'undefined';
  //private TYPE_STRING = 'string';


  //中文字符截取
  subString(str: any, start: number, len: number, hasDot?: boolean) {
    if (!str || !len) {
      return '';
    }
    str = str.toString();

    var newLength = 0;
    var newStr = '';
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = '';
    var strLength = str.replace(chineseRegex, '**').length;

    for (var i = 0; i < strLength; i++) {

      if (i < start) {
        continue;
      }

      singleChar = str.charAt(i).toString();
      if (singleChar.match(chineseRegex) !== null) {
        newLength += 2;
      } else {
        newLength++;
      }
      if (newLength > len) {
        break;
      }
      newStr += singleChar;
    }

    if (hasDot && strLength > len) {
      newStr += '...';
    }
    return newStr;
  }

  /**
   * 截取字符串最后一个分隔符之后所有字符
   * @param str 要截取的字符串
   * @param intercept 分隔符号
   */
  subStr(str: string, intercept?: string): any {
    if (typeof str === 'string' && str !== '') {
      if (!intercept) {
        return str;
      }
      let strPos: number = str.lastIndexOf(intercept) + 1;
      if (strPos - 1 > 0) {
        return str.substring(strPos);
      } else {
        return str;
      }
    } else {
      return '';
    }
  }

  /**
   * 移除空格
   * @param str
   * @param position
   */
  removeSpaces(str: string, position?: string): string {
    let res: string = '';
    switch (position) {
      case 'left':
        res = str.replace(/(^\s*)/g, '');
        break;
      case 'right':
        res = str.replace(/(\s*$)/g, '');
        break;
      default:
        res = str.replace(/(^\s*)|(\s*$)/g, '');
        break;
    }
    return res;
  }
}
