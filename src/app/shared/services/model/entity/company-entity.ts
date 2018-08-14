//Company Search List
export class SearchCompany {
  static init() {
    return new SearchCompany(0, 0, '', '');
  }

  constructor(public cid: number,
              public type: number,
              public name: string,
              public business_licence_path: string) {
  }
}

//Company permission
export class Permission {
  static init() {
    return new Permission('', '', '', '', '', '', '', '', '');
  }

  constructor(public company_id: string,
              public id: string,
              public profile_id: string,
              public suid: string,
              public type: string,
              public user_profile_path: string,
              public work_name: string,
              public psid: string,
              public uuid: string) {
  }
}

//
export class CompanyAccount {
  static init() {
    return new CompanyAccount(0, '', 0);
  }

  constructor(public tax_id: number,
              public business_license: string,
              public login_user_type: number) {
  }
}

export class CompanyCreatorInfo {
  static init() {
    return new CompanyCreatorInfo('', '', '', '');
  }

  constructor(public business_licence_path: string,
              public created: string,
              public user_profile_path: string,
              public work_name: string) {
  }
}

export class AllCompanyList {
  static init() {
    return new AllCompanyList(0, '', '', '', 0);
  }

  constructor(public company_id: number,
              public address: string,
              public business_licence_path: string,
              public name: string,
              public type: number) {
  }
}

export class CompanyRegisterData {
  constructor(public company_name: string,
              // new company
              // public company_email : string,
              public company_industries: number,
              public register: number,
              public lang: string,
              public company_profile_id ?: number,
              public company_license_id ?: number) {
  }
}

export class CompanyGeneralData {
  constructor(public user_profile: string,
              public user_name: string,
              public logo_image_path: string,
              public login_user_type: any,
              public companies_information: any,
              public add_company_group: any,
              public current_company_info: any,
              public company_types: any,
              public company_industries: any) {
  }
}

export class GeneralSaveData {
  static init() {
    return new GeneralSaveData(0, 0, 0, '', '', '', '', '', '');
  }

  constructor(public company_id: number,
              public company_type: number,
              public company_industry: number,
              public company_name: string,
              public company_found_date: string,
              public company_address: string,
              public company_description: string,
              public suid: string,
              public add_company_data: any) {
  }
}

//Company List
//export class CompanyAnalysis {
//  static init() {
//    return new CompanyAnalysis(0, '', '', '');
//  }
//  constructor(
//    public cid: number,
//    public address: string,
//    public logo_path: string,
//    public name: string
//  ) {}
//}


/**
 * 联系人列表公司
 */
export class CompanyList {
  static init() {
    return new CompanyList(0, '', '', '', 0, 0);
  }

  constructor(public cid: number,
              public logo_path: string,
              public name: string,
              public address: string,
              public logo_id: number,
              public check: number) {
  }
}

export class UserCompanyPermission {
  static init() {
    return new UserCompanyPermission(1, 1, 1, 1, 1, 1, 1, 1);
  }

  constructor(public info: number,
              public credentials: number,
              public resume: number,
              public location: number,
              public login_user_type: number,
              public permission_general: number,
              public permission_analysis: number,
              public ability: number) {
  }

}

//公司列表
export class AllCompanyInfo {
  static init() {
    return new AllCompanyInfo('1','', '', '', [], '', 0, '', '', [], 0);
  }

  constructor(public is_studio: string,
              public cid: string,
              public name: string,
              public psid: string,
              public role: Array<string>,
              public suid: string,
              public type: number,
              public logo_path: string,
              public p_name: string,
              public permission: Array<string>,
              public super_admin: number) {
  }
}

/**
 * 当前公司信息
 */
export class CurrentCompanyInfo {
  static init() {
    return new CurrentCompanyInfo('', '', 0, '', '');
  }

  constructor(public name: string,
              public found_date: string,
              public industry: number,
              public address: string,
              public description: string) {
  }
}

export class AccountLicense {
  static init() {
    return new AccountLicense('', '', '', '');
  }

  constructor(public user_profile_path: string,
              public work_name: string,
              public created: string,
              public business_licence_path: string) {
  }
}


//招聘
export class RecruitList {
  public profile: string;
  public profile_id: number;
  public status: number;
  public psid: string;
  public uuid: string;
  public work_name: string;
  //public work_phone: string;
  public email: string;
  public phone: string;
  //合同开始时间
  public commencementDate: string;
  //合同结束时间
  public terminationDate: string;
  public is_ceo: number;
  public cid: string;

  static init(): RecruitList {
    let obj = new RecruitList();
    obj.profile = '';
    obj.profile_id = 0;
    obj.status = 0;
    obj.psid = '';
    obj.uuid = '';
    obj.work_name = '';
    // obj.work_phone = '';
    obj.email = '';
    obj.phone = '';
    obj.commencementDate = '';
    obj.terminationDate = '';
    obj.is_ceo = 0;
    obj.cid = '';
    return obj;
  }
}

