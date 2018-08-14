export class LoginCompanyList {
  static init() {
    return new LoginCompanyList(0, 0, 0, '', '', 0, '');
  }

  constructor(public id: number,
              public admintype: number,
              public logo_id: number,
              public name: string,
              public suid: string,
              public type: number,
              public typeName: string) {
  }
}

/**
 * 登录数据实体
 */
export class UserLoginData {
  constructor(public platform: number,
              public username: string,
              public password: string) {
  }
}

/**
 * 注册用户数据实体
 */
export class UserRegisterData {
  constructor(public module: number, //第三方注册 默认0 为没有用第三方登录
              public pid: string, //第三方账户的id
              public work_name: string,
              public email: string,
              public profile: string,
              public password: string,
              public phone: string,
              public code: string,
              public confirm_password : string,
              public lang: string,//语言
              ) {
  }
}

/**
 * 用户数据实体
 */
export class UserData {
  static init() {
    return new UserData(0, 0, '', '', '', '', '');
  }

  constructor(public id: number,
              public company_id: number,
              public work_name: string,
              public email: string,
              public user_profile_path: string,
              public phone: string,
              public suid: string //公司里唯一员工编号
  ) {
  }
}

export class UserPermissionData {
  static init() {
    return new UserPermissionData('', '', '', '');
  }

  constructor(public p_name: string,
              public suid: string,
              public user_profile_path: string,
              public work_name: string) {
  }
}

/**
 * tips用户数据实体
 */
export class TipsUserData {
  static init() {
    return new TipsUserData(0, '', '', '', '', '', '');
  }


  constructor(public id: number,
              public work_name: string,
              public email: string,
              public profile_id: string,
              public user_profile_path: string,
              public phone: string,
              public uid: string) {
  }


}


/**
 * chat content message post userInfo
 */
export class MessagePostUserInfo {
  public check: string;
  public cid: string;
  public company_name: string;
  public p_name: string;
  public psid: string;
  public type: string;
  public uid: string;
  public user_profile_path: string;
  public uuid: string;
  public work_name: string;

  static init() {
    let obj = new MessagePostUserInfo();
    obj.check = '';
    obj.cid = '';
    obj.company_name = '';
    obj.p_name = '';
    obj.psid = '';
    obj.type = '';
    obj.uid = '';
    obj.user_profile_path = '';
    obj.uuid = '';
    obj.work_name = '';
    return obj;
  }
}

/**
 * timeLine 前端显示用
 */
export class TimeLine {
  public title: string;
  public content: string;
  public detailTime: string; //具体时间
  public day: string; // 日期
  public module: number; //类型
  public act: number;//增删改查
  public owner: string;
  public target: string;
  public msg_id: string;
  public timestamp: number;
  public timeColor: string;//时间背景色
  public isMerge: boolean;

  static init() {
    let obj = new TimeLine();
    obj.title = '';
    obj.content = '';
    obj.detailTime = '';
    obj.day = '';
    obj.owner = '';
    obj.target = '';
    obj.target = '';
    obj.msg_id = '';
    obj.timeColor = '';
    obj.module = 0; //1 2 3 4 5 6 99
    obj.act = 0;//1 2 3 4
    obj.timestamp = 0;
    obj.isMerge = false;
    return obj;
  }

  /**
   * 根据时间生成随机颜色
   * @param timestamp
   * @returns {string}
   */
  static initRandomColor(timestamp: number): string {
    /*    let r = () => {
     return Math.floor(Math.random() * 256)
     };
     return `rgb(${r()},${r()},${r()})`;*/
    let r = new Date(timestamp).getDate() * 8;
    let g = new Date(timestamp).getDay() * 30;
    let b = new Date(timestamp).getMonth() * 23;

    return `rgb(${r},${g},${b})`;

  }

}