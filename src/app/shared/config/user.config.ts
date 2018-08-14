export const ROLE_CEO = 0;
export const ROLE_MAIN_ADMIN = 1;

/**
 * Company workflower
 * 可制定以及编辑公司流程,可授权部门流程
 */
export const ROLE_WORKFLOWER_COMPANY = 2;

/**
 * Department workflower
 * 可制定以及编辑部门流程
 */
export const ROLE_WORKFLOWER_COMPANY_DEPT = 3;

export const ROLE_MAIN_ADMIN_STRUCTURE_EDITOR = 4;
// 员工管理列表
export const ROLE_MAIN_ADMIN_STAFF_MANAGER = 5;
// 可分配考勤与假期
export const ROLE_MAIN_ADMIN_HR = 6;
// 会议
export const ROLE_MAIN_ADMIN_RESERVATION = 7;
// 假期管理
export const ROLE_MAIN_ADMIN_HR_VACATIONER = 8;
// 考勤管理
export const ROLE_MAIN_ADMIN_HR_ATTENDANCER = 9;

/**
 * 系统管理员
 * 目前可查看公司空间使用情况
 */
export const ROLE_SYSTEM_ADMIN = 10;

/**
 *
 2->3
 1->4,5,6,7
        6->8,9
 10
 */


export const ROLE_CEO_LABEL = 'CEO';
export const ROLE_MAIN_ADMIN_LABEL = 'MAIN ADMIN';

/**
 * Company workflower
 * 可制定以及编辑公司流程,可授权部门流程
 */
export const ROLE_WORKFLOWER_COMPANY_LABEL = 2;

/**
 * Department workflower
 * 可制定以及编辑部门流程
 */
export const ROLE_WORKFLOWER_COMPANY_DEPT_LABEL = 3;

export const ROLE_MAIN_ADMIN_STRUCTURE_EDITOR_LABEL = 'STRUCTURE EDITOR';
export const ROLE_MAIN_ADMIN_STAFF_MANAGER_LABEL = 'STAFF ADMIN';
export const ROLE_MAIN_ADMIN_HR_LABEL = 'HUMAN RESOURCE MANAGEMENT';
export const ROLE_MAIN_ADMIN_RESERVATION_LABEL = 7;
export const ROLE_MAIN_ADMIN_HR_VACATIONER_LABEL = 8;
export const ROLE_MAIN_ADMIN_HR_ATTENDANCER_LABEL = 9;

/**
 * 系统管理员
 * 目前可查看公司空间使用情况
 */
export const ROLE_SYSTEM_ADMIN_LABEL = 10;

//用户在线状态
export const USER_SHOW_ONLINE_OFFLINE: number = 0;
export const USER_SHOW_ONLINE_ONLINE: number = 1;

export const USER_SHOW_STATE_IN_WORKING: number = 1;
export const USER_SHOW_STATE_IN_MEETING: number = 2;
export const USER_SHOW_STATE_VACATION: number = 3;
export const USER_SHOW_STATE_BUSINESS_TRAVEL: number = 4;
