export const DEPARTMENT_MAIN_ID = "0";
export const DEPARTMENT_PENDING_ID = "-1";

/**
 * 与后端交互用，上传组织架构接口对接字段
 *
 // cid: number; // 公司id
 // did: number; // 部门id
 // structure: any; // company-structure接口
 // position: any; // search-position接口
 // position_title: any; // search-position-title
 // department: any; // search-department
 // staff: any; // search-staff

 *
 */
export interface APIStructure {
  cid: number;
  structure: { [key: string]: Array<{
    id: string;
    parent_id: string;
    pid: string;
    did: string;
    company_id: string;
    suid: string;
    tid: string;
    is_ass: string;
  }> };
  positions: Array<{
    pid:string;
    cid:string;
    p_name:string;
    p_level:string;
    is_ass:string;
  }>;
  position_title: Array<{
    tid: string;
    title_name: string;
    cid: string;
  }>;
  staff: Array<{
    suid: string;
    status: string;
  }>;
  department: Array<{
    id:  string;
    cid:  string;
    parent_id:  string;
    name:  string;
    did: string;
  }>;
}

/**
 * 旧版本position结构
 */
export interface PositionEntity {
  pid: string;
  cid: string;
  p_name: string;
  p_level: string;
  is_ass: string;
  staff: Array<{ suid: string; pid: string; }>;
}

export interface PositionLevelEntity {

}

export interface PositionLevelNameEntity {

}

export interface PositionLevelTitleEntity {

}

/**
 * 员工
 */
export interface StructureStaffEntity {
  profile: string;
  profile_id: string;
  status: string;
  suid: string;
  uuid: string;
  did: string;
  work_name: string;
  psid: string;
}

/**
 * 部门
 */
export interface StructureDepartmentEntity {
  did: string; //部门id
  name: string;//部门名称
  cid: string;
  parent_id: string; // 部门leader的psid
  num: number; //成员数
}

/**
 * 职位
 */
export interface PositionStructureEntity {
  id: string; //psid
  suid: string; // suid
  uuid: string; //uudi
  profile: string;
  work_name: string;
  parent_id: string; //line manager psid
  did: string; // 所在部门
  tid: string; // position title id, e.g "勤劳的"对应的id
  pid: string; // position id, e.g "CEO"对应的id
  is_ass: string; //是否是助理
  admin: {
    id: string;
    company_id: string;
  }, // function manager psid
  company_id: string; // 公司id
  p_level: string; // 职位等级
  p_name: string; //职位名称
  s_type: string; // u 职位上有人 | d 部门 | p 空职位
  title_name?: string; // title_name


  // "id": string; // psid
  // "parent_id": string; // line manager psid
  // "pid": string; // 在表里的pid
  // "did": string; // 部门id
  // "cid": string, // （可删除）
  // "company_id": string; // 公司id
  // "suid": string; // 职员id
  // "status": string; //0 刚入职| 1 正常职工 | 2 待分配职务员工
  // "tid": string; // position title的id
  // "created": string; // "2017-08-31 05:29:02"
  // "updated": string; // "2017-08-31 05:29:02"
  // "s_type": string; // u 职位上有人 | d 部门 | p 空职位
  // "p_level": string; // position level 1
  // "p_name": string; // position name "CEO"
  // "is_ass": string; // 0 | 1 是否是助理
  // "admin": Object;// admin manager信息
}


export class StructurePositionInfo {
  static init() {
    return new StructurePositionInfo(0, {});
  }

  constructor(public p_level: number,
              public position: Object) {
  }
}

/**
 * 组织架构个人信息
 */
export class PersonalInfo {
  static init() {
    return new PersonalInfo(0, 0, 0, '', 0, 0, '', '', 0, '');
  }

  constructor(public id: number,
              public is_ass: number,
              public level: number,
              public p_name: string,
              public parent_id: number,
              public pid: number,
              public profile: string,
              public suid: string,
              public uid: number,
              public work_name: string) {
  }
}


/**
 * 组织架构空职位信息
 */

export class PositionInfo {
  static init() {
    return new PositionInfo(0, 0, 0, '', 0, 0, {});
  }

  constructor(public id: number,
              public is_ass: number,
              public level: number,
              public p_name: string,
              public parent_id: number,
              public pid: number,
              public suid: Object) {
  }
}


/**
 * 组织架构部门信息
 */

export class DepartmentInfo {
  static init() {
    return new DepartmentInfo(0, 0, 0, '', 0, 0, {});
  }

  constructor(public id: number,
              public is_ass: number,
              public level: number,
              public p_name: string,
              public parent_id: number,
              public pid: number,
              public suid: any) {
  }
}

export class CompanyInfo {
  static init() {
    return new CompanyInfo(0, 0, 0, '', 0, [], 0, '');
  }

  constructor(public cid: number,
              public dept_num: number,
              public id: number,
              public name: string,
              public parent_id: number,
              public profile: any[],
              public staff_num: number,
              public type: string) {
  }
}
