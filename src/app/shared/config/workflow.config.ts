/**
 * Created by DanXia Yang on 2017/2/23 0023.
 */
// 创建类型
export const WORKFLOW_ACT_NEW = 1;
export const WORKFLOW_ACT_EDIT = 2;
// workflow 类型
export const WORKFLOW_TYPE_APPLICANT = 1;
export const WORKFLOW_TYPE_EXIST = 2;

// approver 类型
export const WORKFLOW_EXECUTOR_TYPE_APPROVER = 1;
export const WORKFLOW_EXECUTOR_TYPE_NAME_DEFAULT = 'Choose the type';
export const WORKFLOW_EXECUTOR_TYPE_NAME_APPROVER = 'Approver';
export const WORKFLOW_EXECUTOR_TYPE_OPERATOR = 2;
export const WORKFLOW_EXECUTOR_TYPE_NAME_OPERATOR = 'Operator';
//部门
export const WORKFLOW_FORM_DEPARTMENT = 1;
//职位
export const WORKFLOW_FORM_POSITION_STRUCTURE = 2;
//职务
export const WORKFLOW_FORM_POSITION = 3;
//外部公司职位
export const WORKFLOW_FORM_CLIENT = 4;
//外部公司职位
export const WORKFLOW_FORM_SUPPLIER = 5;
//外部公司职位
export const WORKFLOW_FORM_PARTNER = 6;
// 外部公司 cooperator
export const WORKFLOW_FORM_COOPERATOR = 4;

//AUTOMATE UNIT 默认by day
export const WORKFLOW_AUTOMATE_UNIT_MONTH  = 4;
export const WORKFLOW_AUTOMATE_UNIT_DAY    = 3;
export const WORKFLOW_AUTOMATE_UNIT_HOUR   = 2;
export const WORKFLOW_AUTOMATE_UNIT_MINUTE = 1;

//AUTOMATE OPERATOR 默认 refuse
export const WORKFLOW_AUTOMATE_OPERATOR_REFUSE = 0;
export const WORKFLOW_AUTOMATE_OPERATOR_APPROVE = 1;

export const WORKFLOW_STEP_OPTION_NO_CHANGE = 0;
export const WORKFLOW_STEP_OPTION_ADD = 1;
export const WORKFLOW_STEP_OPTION_UPDATE = 2;
export const WORKFLOW_STEP_OPTION_DELETE = 3;
export const WORKFLOW_STEP_OPTION_RELATION_CHANGE = 4;