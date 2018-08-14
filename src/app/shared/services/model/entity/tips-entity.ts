import {ContactsList} from "./contact-entity";
import {TipsUserData} from "./user-entity";

/**
 *  tips entity 前端用
 */
export class Tips {
  public content: string;
  public created: number; //创建时间timestamp
  public createDetailTime: string; //显示用
  public end: string;
  public end_timestamp: string;
  public form: string;
  public id: string;
  public level: string;
  public promoted: boolean;
  public psid: string;
  public rid: string;
  public start: string;
  public start_timestamp: string;
  public status: string;
  // public title: string;
  public showAlarmIcon: boolean;
  //api返回
  public shared_to: Array<any>;
  //
  public sharedToInfoList: Array<ContactsList> = [];
  public has_alarm: number; // 1 or 0
  public alarm_id: string;
  public isShowCalendarFix: boolean;
  public owner: string;
  public type: string; // 1 个人 2公司
  public effective_time: any;
  public effective_time_display: string;
  public ableEdit: boolean;
  public ownerInfo: TipsUserData;//owner信息

  static init(): Tips {
    let obj = new Tips();
    obj.content = '';
    obj.created = 0;
    obj.createDetailTime = '';
    obj.end = '';
    obj.end_timestamp = '';
    obj.form = '3';
    obj.id = '';
    obj.level = '';
    obj.promoted = true;
    obj.psid = '';
    obj.rid = '';
    obj.start = '';
    obj.start_timestamp = '';
    obj.status = '';
    // obj.title = '';
    obj.showAlarmIcon = false;
    obj.sharedToInfoList = [];
    obj.shared_to = [];
    obj.has_alarm = 0;
    obj.alarm_id = '';
    obj.isShowCalendarFix = false;
    obj.owner = '';
    obj.type = '1';
    obj.effective_time = 0;
    obj.effective_time_display = '';
    obj.ableEdit = false;
    return obj;
  }
}


export class DashboardFilter {
  public page: string;

  static init(): DashboardFilter {
    let obj = new DashboardFilter();
    obj.page = '1';
    return obj;
  }
}


//update tips 后端交互
export class UpdateTips {
  public tip_id: string;
  public title: string;
  public content: string;

  static init(): UpdateTips {
    let obj = new UpdateTips();
    obj.tip_id = '';
    obj.title = '';
    obj.content = '';
    return obj;
  }
}