/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/1/3.
 */
import * as MissionConst from '../../../config/mission.config';

export class MissionUserInfo {
  public psid: string; // 职位id
  public user_profile_path: string;
  public name: string; //
  public p_name: string;// 职位名字
  constructor() {

  }

  init() {
    let obj = new MissionUserInfo();
    obj.psid = '';
    obj.user_profile_path = '';
    obj.name = '';
    obj.p_name = '';
    return obj;
  }
}

export class MissionListFilter {
  public page_no_todo: string;  // start from 1, -1代表读取完毕
  public page_no_doing: string; // start from 1
  public page_no_done: string;  // start from 1
  public page_no_storage: string; // start from 1
  public page_no_schedule: string; // start from 1
  public type: Array<string>;  //["-1"] -1是all, 1~5
  // public date_start: string;
  // public date_end: string;
  public current_date: string;
  public is_self: string; // -1-all, 0-Yours, 1-Others
  public page_no_pause: string;// start from 1
  constructor() {
  }

  init() {
    let obj = new MissionListFilter();
    obj.type = [];
    // obj.date_start = '';
    // obj.date_end = '';
    obj.is_self = MissionConst.MISSION_FILTER_ISSELF_DEFAULT;
    obj.page_no_todo = "1";
    obj.page_no_doing = "1";
    obj.page_no_done = "1";
    obj.page_no_storage = "1";
    obj.page_no_schedule = "1";
    obj.current_date = new Date().toUTCString();
    obj.page_no_pause = '1';
    return obj;
  }

  getSelfTitle() {
    if (typeof this.is_self !== 'undefined') {
      switch (this.is_self) {
        case MissionConst.MISSION_FILTER_ISSELF_ALL:
          return MissionConst.MISSION_FILTER_ISSELF_ALL_TEXT;
        case MissionConst.MISSION_FILTER_ISSELF_OTHER:
          return MissionConst.MISSION_FILTER_ISSELF_OTHER_TEXT;
        case MissionConst.MISSION_FILTER_ISSELF_SELF:
          return MissionConst.MISSION_FILTER_ISSELF_SELF_TEXT;
      }
    }
    return MissionConst.MISSION_FILTER_ISSELF_DEFAULT_TEXT;
  }

  getTypeTitle() {
    if (typeof this.type !== 'undefined') {
      switch (this.type[0]) {
        case MissionConst.MISSION_TYPE_PROJECT:
          return MissionConst.MISSION_TYPE_PROJECT_TEXT;
        case MissionConst.MISSION_TYPE_APPLICATION:
          return MissionConst.MISSION_TYPE_APPLICATION_TEXT;
        case MissionConst.MISSION_TYPE_ASSIGNMENT:
          return MissionConst.MISSION_TYPE_ASSIGNMENT_TEXT;
        case MissionConst.MISSION_TYPE_MEETING:
          return MissionConst.MISSION_TYPE_MEETING_TEXT;
        case MissionConst.MISSION_TYPE_TASK:
          return MissionConst.MISSION_TYPE_TASK_TEXT;
        case MissionConst.MISSION_TYPE_ALL:
          return MissionConst.MISSION_TYPE_ALL_TEXT;
      }
    }
    return MissionConst.MISSION_TYPE_ALL_TEXT;
  }
}
/**
 * 针对不同type的mission的特殊字段
 */
export class MissionApplication {
  // 对应workflow的字段
  public app_type: { wid: string };
  // 新建时候为空即可
  public approve_time: Array<{
    user_info: MissionUserInfo,
    time: string,
    time_str: string
  }>;
  // 当前进行到第几步 如 Completed 5th step
  public current_step_info: string = '';
  // 对应workflow的描述
  public workflow_desc: string = '';

  constructor() {

  }

  init() {
    let obj = new MissionApplication();
    obj.app_type = {wid: ''};
    obj.approve_time = [];
    obj.current_step_info = '';
    obj.workflow_desc = '';
    return obj;
  }
}
export class MissionAssignment {
  public operator: Array<any>;

  constructor() {
  }

  init() {
    let obj = new MissionAssignment();
    obj.operator = [];
    return obj;
  }
}
export class MissionMeeting {
  public conferee: Array<any>;

  constructor() {
  }

  init() {
    let obj = new MissionMeeting();
    obj.conferee = [];
    return obj;
  }
}
export class MissionProject {
  public internal: Array<MissionDetailAPIModel>;
  public users_info: any;

  constructor() {
  }

  init() {
    let obj = new MissionProject();
    obj.internal = [];
    obj.users_info = {};
    return obj;
  }

  /**
   * {
   * '100' : { // wid
   *  'extra_number': 94 // 未显示的人数
   *  'data': [ // 用户psid 合集
   *    '123',
   *    '124',
   *  ]
   * }
   * }
   * @param data
   */
  initUsersInfo(data: any) {
    this.users_info = data;
  }
}
export class MissionTask {
  public operator: Array<any>;
  public approver: Array<any>;
  public as_identity: string; //空 2 approver   3 operator
  constructor() {
  }

  init() {
    let obj = new MissionTask();
    obj.operator = [];
    obj.approver = [];
    obj.as_identity = '';
    return obj;
  }
}

export class MissionFunctionObserver {
  public id: any;
  public user_info: Array<MissionUserInfo>;

  constructor() {
  }

  init() {
    let obj = new MissionFunctionObserver();
    obj.id = '';
    obj.user_info = [];
    return obj;
  }
}
export class MissionFunctionMemoRecorder {
  public id: any;
  public meeting_content: string;
  public user_info: Array<MissionUserInfo>;

  constructor() {
  }

  init() {
    let obj = new MissionFunctionMemoRecorder();
    obj.id = '';
    obj.meeting_content = '';
    obj.user_info = [];
    return obj;
  }

  initUserInfo(userInfo: Array<MissionUserInfo>) {
    this.user_info = userInfo;
  }
}
export class MissionFunctionImportance {
  public value: any;

  constructor() {
  }

  init() {
    let obj = new MissionFunctionImportance();
    obj.value = '';
    return obj;
  }
}
export class MissionFunctionTracking {
  public id: any;
  public user_info: Array<MissionUserInfo>;

  constructor() {
  }

  init() {
    let obj = new MissionFunctionTracking();
    obj.id = '';
    obj.user_info = [];
    return obj;
  }

  initUserInfo(userInfo: Array<MissionUserInfo>) {
    this.user_info = userInfo;
  }
}
export class MissionFunctionBidding {
  public bidding_start: string;
  public bidding_end: string;
  public type: any; // 1 - decision || 2-percentage || 3 - votes
  public bidder: Array<{
    user_info: MissionUserInfo,
    status: string; // 0 - 等待 | 1 - 接受 | 2 -拒绝
    confirm_time: string; // '1970-01-01 00:00:00' 确认是否参加时间
  }>; // 投标人人数必须 > 1
  public accept_line: string; // 达标线 0~100
  public amount: Array<{
    user_info: MissionUserInfo
    scale: string; // 0~100,
    status: string; // 0|1 是否已投票
    vote_time: string // '1970-01-01 00:00:00' UTC投票时间
    vote_psid: string // 投票给谁
  }>; // 只有2的时候有值
  public winnerInfo: Array<MissionUserInfo>; // 只有mission done才会有值
  public voteInfo: Array<{
    user_info: MissionUserInfo
  }>; // 投票信息
  constructor() {
  }

  init() {
    let obj = new MissionFunctionBidding();
    let userInfo = new MissionUserInfo();
    obj.bidding_start = '';
    obj.bidding_end = '';
    obj.bidder = [];
    obj.type = '';
    obj.amount = [];
    obj.winnerInfo = [];
    obj.voteInfo = [];
    return obj;
  }
}

export class MissionFunctionExpense {
  public id: any;
  public form: any; // 1-collection || 2-payment
  public payee: any; // 收款人
  public payee_account: any;
  public account_type: any;
  public contract_amount: any;
  public contract_unit: any; //
  public contract_times: any;
  public payment_details: Array<{
    expense_status: string;
    payment_condition: any;  //分期付款(payment)或者分期收款(collection)
    payment_percentage: any; //付款百分比
    payment_to_type: any;    // 1 - 根据任务 || 2 - 根据时间
    payment_to_value: any;   //如果选择任务，应该是mid, 如果选择时间应该是日期string
    payment_to_type_direction: string; // 1-before | 2- after 如果是任务，默认为2-after
  }>;
  public variation_offer: Array<{
    expense_status: string;
    payment_condition: any;  //分期付款(payment)或者分期收款(collection)
    payment_percentage: any; //付款百分比
    payment_to_type: any;    // 1 - 根据任务 || 2 - 根据时间
    payment_to_value: any;   //如果选择任务，应该是mid, 如果选择时间应该是日期string
    payment_to_type_direction: string; // 1-before | 2- after 如果是任务，默认为2-after
  }>;

  constructor() {

  }

  init() {
    let obj = new MissionFunctionExpense();
    obj.id = '';
    obj.form = '';
    obj.payee = '';
    obj.payee_account = '';
    obj.account_type = '';
    obj.contract_amount = '';
    obj.contract_unit = '';
    obj.contract_times = '';
    obj.payment_details = [];
    obj.variation_offer = [];
    return obj;
  }

  initPaymentDetails(data: Array<{
    expense_status: '';
    payment_condition: any;
    payment_percentage: any;
    payment_to_type: any;
    payment_to_value: any;
    payment_to_type_direction: string;
  }>) {
    this.payment_details = data;
  }
}
export class MissionFunctionTarget {
  public type: string; // 1-common goal|| 2-self-goal
  public total: string; //总量 如果self情况下给0
  public unit: string; //默认单位
  public amount: Array<{
    psid?: any; // common goal没有psid
    data: any;
  }>;

  constructor() {

  }

  init() {
    let obj = new MissionFunctionTarget();
    obj.type = '';
    obj.amount = [];
    return obj;
  }

  initAmount(amount: Array<{ psid?: any; data: any; unit: any; }>) {
    this.amount = amount;
  }
}


/**
 * Mission列表模型 用于和后端交互
 */
export class MissionListAPIModel {
  public mode: string;
  public filter: MissionListFilter;
  public missions: {
    todo: Array<MissionDetailAPIModel>
    doing: Array<MissionDetailAPIModel>
    done: Array<MissionDetailAPIModel>
    storage: Array<MissionDetailAPIModel>
    pause: Array<MissionDetailAPIModel>
  };
  public missions_schedule: any;

  constructor() {
  }

  init() {
    let obj = new MissionListAPIModel();
    obj.mode = '';
    obj.filter = new MissionListFilter().init();
    obj.missions = {
      todo: [], // Array<MissionDetailAPIModel>
      doing: [], // Array<MissionDetailAPIModel>
      done: [],  // Array<MissionDetailAPIModel>
      storage: [], //Array<MissionDetailAPIModel>
      pause: [] //Array<MissionDetailAPIModel>
    };
    obj.missions_schedule = [];
    return obj;
  }

  initMissions(missions: {
    todo: Array<MissionDetailAPIModel>,
    doing: Array<MissionDetailAPIModel>,
    done: Array<MissionDetailAPIModel>,
    storage: Array<MissionDetailAPIModel>,
    pause: Array<MissionDetailAPIModel>
  }) {
    this.missions = missions;
  }

  initMissionSchedule(missionSchedule: Array<MissionDetailAPIModel>) {
    this.missions_schedule = missionSchedule;
  }
}
/**
 * Mission 连接模型
 */
export class MissionLinkModel {
  public before: Array<MissionDetailAPIModel>; // 只有一个. create状态下只能编辑这个
  public after: Array<MissionDetailAPIModel>;  // 可以多个，只能显示，无法控制
  constructor() {

  }

  init() {
    let obj = new MissionLinkModel();
    obj.before = [];
    obj.after = [];
    return obj;
  }

  initBefore(data: Array<MissionDetailAPIModel>) {
    this.before = data;
  }

  initAfter(data: Array<MissionDetailAPIModel>) {
    this.after = data;
  }
}

export class MissionStaticFunction {

  /**
   *静态方法
   * @param type
   * @param useForClass
   * @returns {string}
   */
  static getTypeTitle(type: any, useForClass?: boolean): string {

    let title = '';
    let c = (typeof useForClass !== 'undefined');
    if (typeof type !== 'undefined' && type !== '') {
      switch (type) {
        case MissionConst.MISSION_TYPE_APPLICATION:
          title = MissionConst.MISSION_TYPE_APPLICATION_TEXT;
          break;
        case MissionConst.MISSION_TYPE_TASK:
          title = MissionConst.MISSION_TYPE_TASK_TEXT;
          break;
        case MissionConst.MISSION_TYPE_MEETING:
          title = MissionConst.MISSION_TYPE_MEETING_TEXT;
          break;
        case MissionConst.MISSION_TYPE_ASSIGNMENT:
          title = MissionConst.MISSION_TYPE_ASSIGNMENT_TEXT;
          break;
        case MissionConst.MISSION_TYPE_PROJECT:
          title = MissionConst.MISSION_TYPE_PROJECT_TEXT;
          break;
      }
    }
    if (c) {
      //去空格 转小写
      title = title.toLowerCase().replace(/(^\s+)|(\s+$)/g, "");
    }
    return title;
  }

  static getTypeList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_TYPE_ALL,
        title: MissionConst.MISSION_TYPE_ALL_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_PROJECT,
        title: MissionConst.MISSION_TYPE_PROJECT_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_APPLICATION,
        title: MissionConst.MISSION_TYPE_APPLICATION_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_ASSIGNMENT,
        title: MissionConst.MISSION_TYPE_ASSIGNMENT_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_MEETING,
        title: MissionConst.MISSION_TYPE_MEETING_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_TASK,
        title: MissionConst.MISSION_TYPE_TASK_TEXT
      },

    ];
  }

  static getFilterSelfList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_FILTER_ISSELF_ALL,
        title: MissionConst.MISSION_FILTER_ISSELF_ALL_TEXT
      },
      {
        key: MissionConst.MISSION_FILTER_ISSELF_SELF,
        title: MissionConst.MISSION_FILTER_ISSELF_SELF_TEXT
      },
      {
        key: MissionConst.MISSION_FILTER_ISSELF_OTHER,
        title: MissionConst.MISSION_FILTER_ISSELF_OTHER_TEXT
      }
    ];
  }

  static getCurrencyList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_CURRENCY_CNY_ISO,
        title: MissionConst.MISSION_CURRENCY_CNY
      },
      {
        key: MissionConst.MISSION_CURRENCY_USD_ISO,
        title: MissionConst.MISSION_CURRENCY_USD
      },
      {
        key: MissionConst.MISSION_CURRENCY_EUR_ISO,
        title: MissionConst.MISSION_CURRENCY_EUR
      },
      {
        key: MissionConst.MISSION_CURRENCY_JPY_ISO,
        title: MissionConst.MISSION_CURRENCY_JPY
      }
    ];
  }

  static getUNITList(): Array<{ key: any }> {
    return [
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_MM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_CM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_IM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_M
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_kM
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_G
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_KG
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_TON
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_IB
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_YEAR
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_MONTH
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_WEEK
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_DAY
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_HOUR
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_MINUTE
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_SECOND
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_CNY
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_USD
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_JPY
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_MM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_CM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_IM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_M2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_KM2
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_MM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_CM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_IM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_M3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_KM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_ML
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_I
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_PERCENT
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_CENTIGRADE
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_FAHRENHEIT
      }
    ];
  }

  static getDateUnit(): Array<{ key: string }> {
    return [
      {
        key: MissionConst.DATE_UNIT_MONTH
      },
      {
        key: MissionConst.DATE_UNIT_WEEK
      },
      {
        key: MissionConst.DATE_UNIT_DAY
      },
      {
        key: MissionConst.DATE_UNIT_HOUR
      }
    ]
  }

  static initMissionStatusName(status: string): string {
    let str = '';
    switch (status) {
      case MissionConst.MISSION_STATUS_TODO:
        str = 'Todo';
        break;
      case MissionConst.MISSION_STATUS_PENDING:
        str = 'Pending';
        break;
      case MissionConst.MISSION_STATUS_RESET:
        str = 'Reset';
        break;
      case MissionConst.MISSION_STATUS_DOING:
        str = 'Doing';
        break;
      case MissionConst.MISSION_STATUS_PAUSE:
        str = 'Pause';
        break;
      case MissionConst.MISSION_STATUS_CANCEL:
        str = 'Cancel';
        break;
      case MissionConst.MISSION_STATUS_DONE:
        str = 'Done';
        break;
      case MissionConst.MISSION_STATUS_STORAGE:
        str = 'Storage';
        break;
    }
    return str;
  }
}


/**
 *  Mission详情模型 用户和后端交互
 */
export class MissionDetailAPIModel {
  public available_btns: any; //显示buttons
  public roles: Array<any>; //身份是逗号分隔的
  public folder_id: string; // 创建的文件夹id
  public mid: any; // 主表id
  public id: any;  // 分表id
  public type: string;
  public name: string;
  public promoted: string; // 0 1;
  public description: string;
  public project_token?: string; // 只有从Project中创建的时候才需要此字段,
  public project_id?: string; // 当project创建完毕后，关联的project id
  public start: string; // 设定开始时间点
  public start_timestamp: string; // 设定开始时间戳
  public real_start: string; //项目实际的开始时间点
  public real_start_timestamp: string; //项目实际的开始时间戳
  public end: string;  //  设定结束时间点
  public end_timestamp: string; // 设定结束时间戳
  public real_end: string; //项目变成done的时间点
  public real_end_timestamp: string; //项目变成done的时间戳
  public mission_status: string;
  public isReset: boolean;
  public status: string; //project子mission的状态
  public has_alarm: boolean; //是否有闹钟
  public alarm_id: string; //闹钟id
  public effective_time: number; //闹钟具体时间 UTC
  public repeat: number; //闹钟重复 1天  2周  3月
  public every: number; //每几 天/周/月
  public alarm_type: number; //闹钟类型  fix/repeat
  public effective_time_display: string; //闹钟显示时间
  public general_token: string;
  // 五种类型mission的不同字段
  public detail: any;
  // 开启的方法功能
  public fns: { [key: string]: any };
  // 最后状态变更信息
  public last_update_info: {
    user_info: MissionUserInfo,
    time: string,
    time_str: string
  };
  // 是否延期状态
  public delayed: string; // 1 - 正常 || 0 - 延期
  public link_info: MissionLinkModel;
  public pending_issue: any; //TODO: 用户能看到的
  public creator_info: {
    user_info: MissionUserInfo,
    time: string,
    time_str: string
  };
  public date_period: string; // 如果没有时长 默认为0
  public pin_list: Array<{
    identifier: '',
    pin_time: '2017-03-27 16:23:22',
    user_info: MissionUserInfo,
    description: ''
  }> = [];
  public is_observer:number; // 是否是抄送的人0 | 1, 抄送人不能够参与mission的聊天, 需要隐藏字段
  constructor() {

  }

  /**
   *
   * @param type
   * @param useForClass
   * @returns {string}
   */
  static getTypeTitle(type: any, useForClass?: boolean): string {

    let title = '';
    let c = (typeof useForClass !== 'undefined');
    if (typeof type !== 'undefined' && type !== '') {
      switch (type) {
        case MissionConst.MISSION_TYPE_APPLICATION:
          title = MissionConst.MISSION_TYPE_APPLICATION_TEXT;
          break;
        case MissionConst.MISSION_TYPE_TASK:
          title = MissionConst.MISSION_TYPE_TASK_TEXT;
          break;
        case MissionConst.MISSION_TYPE_MEETING:
          title = MissionConst.MISSION_TYPE_MEETING_TEXT;
          break;
        case MissionConst.MISSION_TYPE_ASSIGNMENT:
          title = MissionConst.MISSION_TYPE_ASSIGNMENT_TEXT;
          break;
        case MissionConst.MISSION_TYPE_PROJECT:
          title = MissionConst.MISSION_TYPE_PROJECT_TEXT;
          break;
      }
    }
    if (c) {
      //去空格 转小写
      title = title.toLowerCase().replace(/(^\s+)|(\s+$)/g, "");
    }
    return title;
  }

  static getTypeList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_TYPE_ALL,
        title: MissionConst.MISSION_TYPE_ALL_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_PROJECT,
        title: MissionConst.MISSION_TYPE_PROJECT_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_APPLICATION,
        title: MissionConst.MISSION_TYPE_APPLICATION_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_ASSIGNMENT,
        title: MissionConst.MISSION_TYPE_ASSIGNMENT_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_MEETING,
        title: MissionConst.MISSION_TYPE_MEETING_TEXT
      },
      {
        key: MissionConst.MISSION_TYPE_TASK,
        title: MissionConst.MISSION_TYPE_TASK_TEXT
      },

    ];
  }

  static getFilterSelfList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_FILTER_ISSELF_ALL,
        title: MissionConst.MISSION_FILTER_ISSELF_ALL_TEXT
      },
      {
        key: MissionConst.MISSION_FILTER_ISSELF_SELF,
        title: MissionConst.MISSION_FILTER_ISSELF_SELF_TEXT
      },
      {
        key: MissionConst.MISSION_FILTER_ISSELF_OTHER,
        title: MissionConst.MISSION_FILTER_ISSELF_OTHER_TEXT
      }
    ];
  }

  static getCurrencyList(): Array<{ key: any, title: any }> {
    return [
      {
        key: MissionConst.MISSION_CURRENCY_CNY_ISO,
        title: MissionConst.MISSION_CURRENCY_CNY
      },
      {
        key: MissionConst.MISSION_CURRENCY_USD_ISO,
        title: MissionConst.MISSION_CURRENCY_USD
      },
      {
        key: MissionConst.MISSION_CURRENCY_EUR_ISO,
        title: MissionConst.MISSION_CURRENCY_EUR
      },
      {
        key: MissionConst.MISSION_CURRENCY_JPY_ISO,
        title: MissionConst.MISSION_CURRENCY_JPY
      }
    ];
  }

  static getUNITList(): Array<{ key: any }> {
    return [
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_MM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_CM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_IM
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_M
      },
      {
        key: MissionConst.MISSION_UNIT_MEASUREMENT_kM
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_G
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_KG
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_TON
      },
      {
        key: MissionConst.MISSION_UNIT_WEIGHT_IB
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_YEAR
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_MONTH
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_WEEK
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_DAY
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_HOUR
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_MINUTE
      },
      {
        key: MissionConst.MISSION_UNIT_TIMING_SECOND
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_CNY
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_USD
      },
      {
        key: MissionConst.MISSION_UNIT_CURRENCY_JPY
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_MM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_CM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_IM2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_M2
      },
      {
        key: MissionConst.MISSION_UNIT_ARER_KM2
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_MM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_CM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_IM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_M3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_KM3
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_ML
      },
      {
        key: MissionConst.MISSION_UNIT_VOLUMETER_I
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_PERCENT
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_CENTIGRADE
      },
      {
        key: MissionConst.MISSION_UNIT_OTHER_FAHRENHEIT
      }
    ];
  }

  static getDateUnit(): Array<{ key: string }> {
    return [
      {
        key: MissionConst.DATE_UNIT_MONTH
      },
      {
        key: MissionConst.DATE_UNIT_WEEK
      },
      {
        key: MissionConst.DATE_UNIT_DAY
      },
      {
        key: MissionConst.DATE_UNIT_HOUR
      }
    ]
  }

  initProjectToken(data: any) {
    this.project_token = data;
  }

  initProjectId(data: any) {
    this.project_id = data;
  }


  init(o?: any) {
    let obj = new MissionDetailAPIModel();
    if (typeof o !== 'undefined') {
      obj = o;
    }
    obj.available_btns = {};
    obj.roles = [];
    obj.folder_id = '';
    obj.id = '';
    obj.mid = '';
    obj.type = '';
    obj.name = '';
    obj.promoted = '0';
    obj.description = '';
    obj.start = '';
    obj.start_timestamp = '';
    obj.end = '';
    obj.end_timestamp = '';
    obj.real_start = '';
    obj.real_start_timestamp = '';
    obj.real_end = '';
    obj.real_end_timestamp = '';
    obj.mission_status = '';
    obj.has_alarm = true;
    obj.alarm_id = '';
    obj.effective_time = 0;
    obj.repeat = 0;
    obj.every = 0;
    obj.alarm_type = 0;
    obj.effective_time_display = '';
    obj.general_token = '';
    obj.detail = {};
    obj.isReset = false;
    obj.last_update_info = {
      user_info: new MissionUserInfo().init(),
      time: '',
      time_str: ''
    };
    obj.fns = {};
    obj.delayed = '';
    obj.link_info = new MissionLinkModel();
    obj.pending_issue = '';
    obj.creator_info = {
      user_info: new MissionUserInfo().init(),
      time: '',
      time_str: ''
    };
    obj.date_period = '0';
    obj.status='';
    obj.is_observer = 0;
    return obj;
  }

  initDetail(detailObj: any) {
    this.detail = detailObj;
  }

  initLinkInfo(link: MissionLinkModel) {
    this.link_info = link;
  }

  initFunction(fns: { [key: string]: any }) {
    this.fns = fns;
  }
}

/**
 * 用于前端展示数据用mission详情
 */
export class MissionDetailTplModel extends MissionDetailAPIModel {
  public typeTitle: string;
  public typeClass: string;
  public importance: number;
  public startTime: any;
  public endTime: any;
  public last_update_locale_time: string;
  public startLinkInfo?: MissionDetailAPIModel;
  public startTimeInfo?: {
    day: string;
    week: string;
    month: string;
    minute: string;
    hour: string;
    year: string;
  };
  public endTimeInfo?: {
    day: string;
    week: string;
    month: string;
    minute: string;
    hour: string;
    year: string;
  };

  public startIsLink: boolean = false; //开始时间是否是link
  public endIsPending: boolean = false; //结束时间是否是pending

  // 时间进度条相关信息
  public todoProgressTime: string; //项目跨度时间长度(透明部分)
  public doingProgressTime: string; //项目跨度时间长度(正在进行部分)
  public doneProgressTime: string; //项目跨度时间长度(已经完成部分)

  public fillColorTodo: string = 'rgba(94, 102, 209, .6)';
  public fillColorDoing: string = '#5E66D1';
  public fillColorDone: string = '#4C4B63';
  public fillColorLink: string = '#9193AB';
  public fillColorDoneAppli: string = '#4C4B63';
  public fillColorProAppli: string = '#8EE3F5';
  public fillColorWhite: string = "#fff";
  public FillColorLine: string = '#FBFBFE';

  public fillLengthTodo: string = '100';
  public fillLengthDoing: string = '100';
  public fillLengthDone: string = '100';

  public isLoadingDetail: boolean = false; // 是否在读取详情
  public loadingTimer: any; // 悬停计时器
  public hideTimer: any; // 悬停补足计时器
  public hasInited: boolean = false; //是否读取过详情
  public hasDrawed: boolean = false; // 是否绘制

  //svg的元素对应的位置
  public svgPostion: number;
  public textPostion: number;
  public textTranslate: number = -7.5;
  public linkPosition: number;
  public showLink_info: boolean = false;
  public showTracking: boolean = false;
  public applicationPos: Array<number> = [];
  //根据activePeriod 给最小width
  /*  public showMonthMinWidth: boolean = false;
   public showWeekMinWidth: boolean = false;
   public showDayMinWidth: boolean = false;*/


  //存放project子mission的数组 schedule模式
  public appliPosInPro: Array<number> = [];
  public meetPosInPro: Array<number> = [];
  public assignPosInPro: Array<number> = [];
  public taskPosInPro: Array<number> = [];

  //application 的mission 不需要进度条
  public typeIsApplication: boolean = false;
  //mission 的 stautus
  public missionStatusName: string = '';

  //mission-table里控制是否打开project
  public isCloseProject: boolean = true;

  //checkbox是否选中
  public isChooseToDraw: boolean = false;

  init() {
    let obj = new MissionDetailTplModel();
    super.init(obj);
    obj.typeTitle = '';
    obj.typeClass = '';
    obj.importance = 0;
    obj.startTime = '';
    obj.endTime = '';
    obj.todoProgressTime = '';
    obj.doingProgressTime = '';
    obj.doneProgressTime = '';
    obj.loadingTimer = null;
    obj.hideTimer = null;
    obj.last_update_locale_time = '';
    return obj;
  }

  static initMissionStatusName(status: string): string {
    let str = '';
    switch (status) {
      case MissionConst.MISSION_STATUS_TODO:
        str = 'Todo';
        break;
      case MissionConst.MISSION_STATUS_PENDING:
        str = 'Pending';
        break;
      case MissionConst.MISSION_STATUS_RESET:
        str = 'Reset';
        break;
      case MissionConst.MISSION_STATUS_DOING:
        str = 'Doing';
        break;
      case MissionConst.MISSION_STATUS_PAUSE:
        str = 'Pause';
        break;
      case MissionConst.MISSION_STATUS_CANCEL:
        str = 'Cancel';
        break;
      case MissionConst.MISSION_STATUS_DONE:
        str = 'Done';
        break;
      case MissionConst.MISSION_STATUS_STORAGE:
        str = 'Storage';
        break;
    }
    return str;
  }

  initStartLinkInfo(data: MissionDetailAPIModel) {
    if (this.startIsLink) {
      this.startLinkInfo = data;
    }
  }

  initEndTimeInfo(data: {
    day: string,
    week: string,
    month: string,
    minute: string,
    hour: string,
    year: string
  }) {
    this.endTimeInfo = data;
  }

  initStartTimeInfo(data: {
    day: string,
    week: string,
    month: string,
    minute: string,
    hour: string,
    year: string
  }) {
    this.startTimeInfo = data;
  }

  getFillColor(fillType: string): string {
    let fillColor = '';
    switch (fillType) {
      case MissionConst.MISSION_STATUS_TODO:
      case MissionConst.MISSION_STATUS_PENDING:
      case 'todo':
        fillColor = this.fillColorTodo;
        break;
      case MissionConst.MISSION_STATUS_DOING:
      case MissionConst.MISSION_STATUS_PAUSE:
      case 'doing':
        fillColor = this.fillColorDoing;
        break;
      case MissionConst.MISSION_STATUS_DONE:
      case 'done':
        fillColor = this.fillColorDone;
        break;
      default:
        fillColor = this.fillColorTodo;
    }
    return fillColor;
  }
}
/**
 * 既可能是Tracker的数据，也可能是一个Pin
 */
export class MissionTPLTrackingData {
  id: any;
  isCurrent: boolean;
  lng: number;
  lat: number;
  isPin: boolean = false;
  user_info?: MissionUserInfo;
  pin_index?: number;
  description: string;
  map_id:string;

  constructor() {

  }

  init() {
    let obj = new MissionTPLTrackingData();
    obj.id = '';
    obj.isCurrent = false;
    obj.lng = 0;
    obj.lat = 0;
    obj.user_info = new MissionUserInfo();
    obj.pin_index = -1;
    obj.description = '';
    obj.isPin = true;
    obj.map_id = '';

    return obj;
  }

  initUserInfo(data: MissionUserInfo) {
    this.isPin = false;
    this.user_info = data;
  }

  initPinIndex(data: number) {
    this.isPin = true;
    this.pin_index = data;
  }
}

export class MissionCalendarPin {
  // pin主定义字段
  identifier: string = '';
  // token 传空
  general_token: string = '';
  // 关联mission id
  mid: number = 0;
  // 描述
  description: string = '';
  // 是否共享
  shared: number = 1;
  // 创建时间
  pin_time: string = ''; // 2017-02-27 14:24:06
  constructor() {

  }
}



