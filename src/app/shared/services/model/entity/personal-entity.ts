/**
 * Company Information
 */
export class CompanyPersonalInfo {
  static init() {
    return new CompanyPersonalInfo('', '', '');
  }

  constructor(public work_email: string,
              public work_phone: string,
              public name: string) {
  }
}

/**
 * 保存教育信息
 */

export class EducationsInfo {
  static init() {
    return new EducationsInfo(0, 0, 'start dates', 'end dates', '', '', '');
  }

  constructor(public id: number,
              public operation: number,
              public start_date: string,
              public end_date: string,
              public school: string,
              public major: string,
              public description: string) {
  }
}

/**
 * 保存经历信息
 */
export class ExperiencesInfo {
  static init() {
    return new ExperiencesInfo(0, 0, 0, 'start dates', 'end dates', '', '', '', '', 0);
  }

  constructor(public id: number,
              public operation: number,
              public company_id: number,
              public start_date: string,
              public end_date: string,
              public company: string,
              public initial_position: string,
              public finial_position: string,
              public description: string,
              public tag: number) {
  }
}

/**
 * 技能等级保存
 */
export class SkillLanguageInfo {
  static init() {
    return new SkillLanguageInfo(0, 0, 0, 0);
  }

  constructor(public id: any,
              public operation: number,
              public language: number,
              public level: number) {
  }
}

export class LanguageInfo {
  static init() {
    return new LanguageInfo(0, '');
  }

  constructor(public id: number,
              public name: string) {
  }
}

/**
 * 其它技能
 */
export class OtherSkillsInfo {
  static init() {
    return new OtherSkillsInfo(0, 0, '');
  }

  constructor(public id: number,
              public operation: number,
              public skill_name: string) {
  }
}


/*=========================================

 2016.11.30

 =========================================*/

//用户信息
export class PersonalInformation {
  static init() {
    return new PersonalInformation('', '','', '', 0, '', '', '');
  }

  constructor(public birthday: string,
              public country: string,
              public first_name: string,
              public last_name: string,
              public gender: number,
              public home_address: string,
              public nation: string,
              public work_name: string) {
  }
}

//用户账号信息
export class AccountInformation {
  static init() {
    return new AccountInformation('', '', '', '');
  }

  constructor(public bank_type: string,
              public identity_card: string,
              public wage_card: string,
              public passport: string) {
  }
}

//技能
export class SkillInfo {
  /**
   *
   * @returns {SkillInfo}
   */
  static init() {
    return new SkillInfo('', '', 0, [], '', '', 1, 0);
  }

  /**
   *
   * @param id 主键id
   * @param created 创建时间
   * @param is_point 是否对当前skill点赞过
   * @param likeUsers 点赞用户列表
   * @param skill_name 技能名
   * @param updated 更新时间
   * @param level 技能等级
   * @param operation 操作选项
   *   operation 1 + id 不为空 更新
   *   operation 1 + id 为空 新建
   *   operation -1 + id 不为空 删除
   */
  constructor(
    public id: string,
    public created: string,
    public is_point: number,
    public likeUsers: Array<any>,
    public skill_name: string,
    public updated: string,
    public operation: number,
    public level: number
  ) {
  }
}
