/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/4.
 * Mission相关的常量定义
 */

/**
 * 显示模式
 */
export const MISSION_MODE_DEFAULT = "2";
export const MISSION_MODE_SCHEDULE = "1";
export const MISSION_MODE_CALENDAR = "2";
/**
 * Mission的五种类型模型
 */
export const MISSION_TYPE_ALL = "-1";
export const MISSION_TYPE_APPLICATION = "1";
export const MISSION_TYPE_ASSIGNMENT = "2";
export const MISSION_TYPE_MEETING = "3";
export const MISSION_TYPE_PROJECT = "4";
export const MISSION_TYPE_TASK = "5";

export const MISSION_TYPE_ALL_TEXT = 'All Types';
export const MISSION_TYPE_APPLICATION_TEXT = 'Application';
export const MISSION_TYPE_ASSIGNMENT_TEXT = 'Assignment';
export const MISSION_TYPE_MEETING_TEXT = 'Meeting';
export const MISSION_TYPE_PROJECT_TEXT = 'Project';
export const MISSION_TYPE_TASK_TEXT = 'Task';
/**
 * Mission七种功能方法
 */
export const MISSION_FUNCTION_OBSERVER = "1";
export const MISSION_FUNCTION_MEMO_RECORDER = "2";
export const MISSION_FUNCTION_IMPORTANCE = "3";
export const MISSION_FUNCTION_TRACKING = "4";
export const MISSION_FUNCTION_BIDDING = "5";
export const MISSION_FUNCTION_EXPENSE = "6";
export const MISSION_FUNCTION_TARGET = "7";

/**
 * Mission Filter
 **/
export const MISSION_FILTER_ISSELF_DEFAULT = "-1";
export const MISSION_FILTER_ISSELF_ALL = "-1";
export const MISSION_FILTER_ISSELF_SELF = "0";
export const MISSION_FILTER_ISSELF_OTHER = "1";

export const MISSION_FILTER_ISSELF_DEFAULT_TEXT = 'From All';
export const MISSION_FILTER_ISSELF_ALL_TEXT = "From All";
export const MISSION_FILTER_ISSELF_SELF_TEXT = "Yours";
export const MISSION_FILTER_ISSELF_OTHER_TEXT = "Others";


/**
 * Mission Priority level
 */
export const MISSION_PRIORITY_LEVEL_FIRST = "1";
export const MISSION_PRIORITY_LEVEL_SECOND = "2";
export const MISSION_PRIORITY_LEVEL_THIRD = "3";


/**
 * Mission User Identity
 **/
export const MISSION_USER_IDENTITY_PUBLISHER = '1';  //发布者
export const MISSION_USER_IDENTITY_APPROVER = '2';   //同意者
export const MISSION_USER_IDENTITY_OPERATOR = '3';   //执行者
export const MISSION_USER_IDENTITY_BIDDER = '4';     //竞标者
export const MISSION_USER_IDENTITY_VOTER = '5';      //竞标投票者
export const MISSION_USER_IDENTITY_CONFEREE = '6';   //参加会议者
export const MISSION_USER_IDENTITY_OBSERVER = '7';   //抄送者
export const MISSION_USER_IDENTITY_MEMO = '8';       //会议记录者
export const MISSION_USER_IDENTITY_WORKFLOW_APPROVER = '9';       //WORKFLOW的同意者

/**
 * mission user operator status
 */
export const MISSION_USER_OPERATOR_PENDING = '0';
export const MISSION_USER_OPERATOR_ACCEPT = '1';
export const MISSION_USER_OPERATOR_REFUSE = '2';
export const MISSION_USER_OPERATOR_COMPLETE = '3';
export const MISSION_USER_OPERATOR_APPROVOR = '4';  //workflow 专用


/**
 * Mission status
 * */
export const MISSION_STATUS_DELETE = '0';     //被删除的
export const MISSION_STATUS_TODO = '1';     //准备进行的
export const MISSION_STATUS_PENDING = '2';     // 延期
export const MISSION_STATUS_RESET = '3';     // 重置时间
export const MISSION_STATUS_DOING = '4';    // 正在进行的
export const MISSION_STATUS_PAUSE = '5';
export const MISSION_STATUS_CANCEL = '6';    //取消
export const MISSION_STATUS_DONE = '7';
export const MISSION_STATUS_STORAGE = '8';


/**
 * 货币常量
 * ISO代码 - 符号
 */

export const MISSION_CURRENCY_CNY = '￥';
export const MISSION_CURRENCY_CNY_ISO = 'CNY';
export const MISSION_CURRENCY_USD = '$';
export const MISSION_CURRENCY_USD_ISO = 'USD';
export const MISSION_CURRENCY_EUR = '€';
export const MISSION_CURRENCY_EUR_ISO = 'EUR';
export const MISSION_CURRENCY_JPY = '￥';
export const MISSION_CURRENCY_JPY_ISO = 'JPY';


/**
 *Mission ACT
 **/
export const MISSION_ACT_CREATE = 1;
export const MISSION_ACT_EDIT = 2;


// mission detail 详情显示用按钮
export const MISSION_BTN_UPLOAD = 'upload';
export const MISSION_BTN_CANCEL = 'cancel';
export const MISSION_BTN_ACCEPT = 'accept';
export const MISSION_BTN_REFUSE = 'refuse';
export const MISSION_BTN_VOTE = 'vote';
export const MISSION_BTN_TARGET_UPLOAD = 'target_upload';
export const MISSION_BTN_COMPLETE = 'complete';
export const MISSION_BTN_CHECK = 'check';
export const MISSION_BTN_RESTART = 'restart';


/**
 * 模板用常量
 */
export const MISSION_LOADING_CLASS = 'ball-scale-multiple';  //'m-calendar-loading-show';
export const MISSION_LOADING_PAGE_CLASS = 'ball-scale-ripple-multiple'; //'m-calendar-loading-show';
export const MISSION_LOADING_SECONDS = 1500;
export const MISSION_PROGRESS_TIME_DEFAULT = '?';
export const MISSION_DATABASE_DATE_FORMAT = 'yyyy-mm-dd HH:MM:ss';
export const MISSION_TIME_NULL = '0000-00-00 00:00:00';
export const MISSION_PAGER_ENDING = '-1';

//获取token的常量
export const MISSION_CREATE_PROJECT_TOKEN = '2';
export const MISSION_GENERAL_TOKEN = '1';

//unit单位常量
export const MISSION_UNIT_MEASUREMENT_MM = 'mm';
export const MISSION_UNIT_MEASUREMENT_CM = 'cm';
export const MISSION_UNIT_MEASUREMENT_IM = 'im';
export const MISSION_UNIT_MEASUREMENT_M = 'm';
export const MISSION_UNIT_MEASUREMENT_kM = 'km';
export const MISSION_UNIT_WEIGHT_G = 'g';
export const MISSION_UNIT_WEIGHT_KG = 'kg';
export const MISSION_UNIT_WEIGHT_TON = 'ton';
export const MISSION_UNIT_WEIGHT_IB = 'lb';
export const MISSION_UNIT_TIMING_YEAR = 'year';
export const MISSION_UNIT_TIMING_MONTH = 'month';
export const MISSION_UNIT_TIMING_WEEK = 'week';
export const MISSION_UNIT_TIMING_DAY = 'day';
export const MISSION_UNIT_TIMING_HOUR = 'hour';
export const MISSION_UNIT_TIMING_MINUTE = 'minute';
export const MISSION_UNIT_TIMING_SECOND = 'second';
export const MISSION_UNIT_CURRENCY_CNY = '￥';
export const MISSION_UNIT_CURRENCY_USD = '$';
export const MISSION_UNIT_CURRENCY_JPY = '円';
export const MISSION_UNIT_ARER_MM2 = 'mm²';
export const MISSION_UNIT_ARER_CM2 = 'cm²';
export const MISSION_UNIT_ARER_IM2 = 'im²';
export const MISSION_UNIT_ARER_M2 = 'm²';
export const MISSION_UNIT_ARER_KM2 = 'km²';
export const MISSION_UNIT_VOLUMETER_MM3 = 'mm³';
export const MISSION_UNIT_VOLUMETER_CM3 = 'cm³';
export const MISSION_UNIT_VOLUMETER_IM3 = 'im³';
export const MISSION_UNIT_VOLUMETER_M3 = 'm3';
export const MISSION_UNIT_VOLUMETER_KM3 = 'km³';
export const MISSION_UNIT_VOLUMETER_ML = 'ml';
export const MISSION_UNIT_VOLUMETER_I = 'i';
export const MISSION_UNIT_OTHER_PERCENT = '%';
export const MISSION_UNIT_OTHER_CENTIGRADE = '℃';
export const MISSION_UNIT_OTHER_FAHRENHEIT = '℉';

export const DATE_UNIT_MONTH = 'Months';
export const DATE_UNIT_WEEK = 'Weeks';
export const DATE_UNIT_DAY = 'Days';
export const DATE_UNIT_HOUR = 'Hours';


/**
 * 延迟常量
 */
export const MISSION_DIFFER_TIME = 10 * 60 * 1000;  //mission 实际开始与结束如果有10分钟的差距判断有延迟或者提前
