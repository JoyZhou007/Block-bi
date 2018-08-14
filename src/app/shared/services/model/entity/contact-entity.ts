/**
 * 用户信息
 */
export class UserInfo {
  static init() {
    return new UserInfo('', '', '', '', '', '', '', '', '');
  }

  constructor(public email: string,
              public location: string,
              public p_name: string,
              public person: string,
              public phone: string,
              public user_profile_path: string,
              public work_email: string,
              public work_name: string,
              public work_phone: string) {}
}

/**
 * 联系人实体
 */
export class ContactInfo {
  static init() {
    return new ContactInfo('', 0, 0, '', '', '', '', '', '', '', '');
  }

  constructor(public uid: string,
              public fid: number,
              public frid: number,
              public email: string,
              public phone: string,
              public p_name: string,
              public work_name: string,
              public work_email: string,
              public work_phone: string,
              public location: string,
              public user_profile_path: string) {
  }
}

/**
 * 搜索联系人列表
 */
export class ContactsList {
  static init() {
    return new ContactsList('', '', '', '', '', '', 0, 0, '', 0, 0, 0, 0, 0);
  }

  constructor(
    public user_profile_path: string,
    public work_name: string,
    public p_name: string,
    public uid: string,
    public uuid: string,
    public psid: string,
    public cid: number,
    public check: number,
    public company_name: string,
    public type: number,
    public form: number,
    public is_have_company: number,
    public online : number,
    public is_friend : number
  ) {}
}

/**
 * 招聘字段
 */
export class FetchOccupation {
  static init() {
    return new FetchOccupation(0, 0, '', '', '', '', '', '', '', 0, 0, 1, 0, 0, 0, '');
  }

  constructor(public id: number,
              public cid: number,
              public uuid: string,
              public workEmail: string,  //工作邮箱
              public commencementDate: string,  //合同开始时间
              public terminationDate: string,  //合同结束时间
              public probationStartTime: string,  //试用期开始时间
              public probationEndTime: string,  //试用期结束时间
              public workPhone: string,  //工作电话
              public salary: number, //工资
              public currency: number, //金额种类
              public period: number, //期限
              public allowance: number,  //补贴
              public annualLeave: number,  //年假
              public marriageLeave: number,  //婚假
              public description: string
  ) {
  }
}
