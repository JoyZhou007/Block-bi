import {Injectable} from '@angular/core';
import * as CalendarConfig from '../shared/config/calendar.config';

@Injectable()
export class CalendarService {
  public dateWord = {
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],//月份
    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] //周
    };
  public showSelectYearArr: Array<any>;   // 保存年份数组

  /**
   * 设置选择的年份
   */
  setShowSelectYear() {
    this.showSelectYearArr = [];
    let nowYear = new Date().getFullYear();
    for (let startYear = nowYear - CalendarConfig.CALENDAR_YEAR_START;        //年份显示从70年前到10年后
         startYear <= nowYear + CalendarConfig.CALENDAR_YEAR_End; startYear++) {
      this.showSelectYearArr.push(startYear);
    }
  }
}