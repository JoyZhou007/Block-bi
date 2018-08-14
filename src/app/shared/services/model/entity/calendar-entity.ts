export class CalendarDate {
  static init() {
    return new CalendarDate(0, 0, '', 'yyyy-mm-dd', false, false, false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false, false, false,false,false,false,false,false,false,false,false);
  }

  /**
   *
   * @param year  年
   * @param month  月
   * @param monthDay 日
   * @param dateFormat 格式化字符串
   * @param selectedStart 是否是开始日期（加左圆角）
   * @param selectedEnd   是否是结束日期（加右圆角）
   * @param selected      是否是点击选中的日期
   * @param isToday       是否是当天日期
   * @param done          已经完成部分
   * @param todo          未完成部分
   * @param task          是否有task （有圆点）
   * @param isHide        是否要隐藏日期
   * @param hasMargin     是否留间距显示小时分钟
   * @param noBackground  没有背景颜色
   * @param isBeforeToday  是否是今天之前的日期（背景灰色，不能点击）
   * @param spanDoneBg     span是否添加done样式
   * @param spanTodoBg     span是否添加todo样式
   * @param leftDoneBg     左边p是否添加done样式
   * @param leftTodoBg     左边p是否添加todo样式
   * @param lastBeforeToday  是否是昨天（添加右圆角）
   * @param rightDoneBg    右边p是否添加done样式
   * @param rightTodoBg    右边p是否添加todo样式
   * @param isMiddle       当前日期，开始时间小于今天，结束时间大于今天
   * @param before        上个月(背景灰色，字体浅色)
   * @param after         下个月（背景灰色，字体浅色）
   * @param leftRadius        是否有左圆角
   * @param rightRadius        是否有右圆角
   */
  constructor(public year: number,
              public month: number,
              public monthDay: string,
              public dateFormat: string,
              public selectedStart: boolean,
              public selectedEnd: boolean,
              public selected: boolean,
              public isToday: boolean,
              public done: boolean,
              public todo: boolean,
              public task: boolean,
              public isHide: boolean,
              public hasMargin: boolean,
              public noBackground: boolean,
              public isBeforeToday: boolean,
              public spanDoneBg: boolean,
              public spanTodoBg: boolean,
              public leftDoneBg: boolean,
              public leftTodoBg: boolean,
              public lastBeforeToday: boolean,
              public rightDoneBg: boolean,
              public rightTodoBg: boolean,
              public isMiddle: boolean,
              public before: boolean,
              public after: boolean,
              public leftRadius: boolean,
              public rightRadius: boolean,
              public spanGrayBg: boolean,
              public spanGoneBg: boolean,
              public leftGrayBg: boolean,
              public leftGoneBg: boolean,
              public rightGrayBg: boolean,
              public rightGoneBg: boolean,

  ) {

  }
}