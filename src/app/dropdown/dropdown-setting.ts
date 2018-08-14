/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/8.
 */
export class DropdownSettings{
  /**
   * 选项设置
   * - enableSearch 是否允许对下拉菜单选项搜索
   * - enableTab    是否支持Tab形式的下拉内容
   * - isMultiple   是否多选
   * - group        分组标题与key
   * - delBtnClass  输入框中删除选中值的按钮 class
   * - readonly     是否只读模式
   * - addEvent     点击添加前自定义事件
   * - removeEvent  点击删除前自定义事件
   * - searchPH     搜索文本框的placeholder文字
   */
  public enableSearch: boolean = true;
  public enableTab: boolean = false;
  public isMultiple: boolean = false;
  public group: Array<{key: any, title: any}> = [];
  public delBtnClass: string = 'remove-but';
  public delBtnClass1: string = 'font-remove';
  public readonly: boolean = false;
  public addEvent: any = {};
  public removeEvent: any = {};
  public searchPH: string = 'Search';
  constructor(data?: any) {
    if (data) {
      for (let key in data) {
        if (data.hasOwnProperty(key) &&
          (key === 'addEvent' || key === 'removeEvent') &&
          typeof data[key] === 'function'
        ) {
          this[key] = data[key];
        } else if (data.hasOwnProperty(key) && typeof this[key] !== 'undefined') {

          this[key] = data[key];
        }
      }
    }
  }
}

