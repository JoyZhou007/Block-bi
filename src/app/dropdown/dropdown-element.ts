/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/9.
 *
 */
export class DropdownOptionModel {
  public id: any = ''; // 唯一标识
  public isCurrent: boolean = false;
  public hasFiltered: boolean = false;
  public key: any = '';
  public label: string = '';
  // '' - 空值，不显示 | 'http://XXXX.png' 显示小图片 | 'NaN' 显示首字母
  public imageLabel: string = '';
  public desc: string = '';
  public group: string = '';

  constructor() {

  }

  initData(data: any): DropdownOptionModel {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          if (key == 'desc' || key == 'label') {
              data[key] = data[key].toString();
          }
          this[key] = data[key];
        }
      }
    }
    return this;
  }

}

export class DropdownOptionModelChatPost extends DropdownOptionModel {
  public form: string = '';

  constructor() {
    super();
  }

  initData(data: any): DropdownOptionModelChatPost {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {
          this[key] = data[key];
        }
      }
    }
    return this;
  }

}