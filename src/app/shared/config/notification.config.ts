/**
 * 所有notification通讯数字长度为7位
 * 占位 AA BB CCC
 * AA位  1~99 设备号/渠道号 目前只有PC端
 *       99 - 模块间通讯
 1  -PC
 * BB位  01~99 模块
 01 - ACCOUNT   账户相关 (添加删除推荐好友)
 02 - CHAT      聊天相关
 03 - COMPANY   组织架构、公司相关 （招聘离职、权限变更、owner/builder更改、link to parent）
 04 - FOLDER    文件相关
 05 - WORKFLOW  工作流程相关
 06 - MISSION   任务相关
 07 - OTHER FUNCTION 其他功能
 99 - SYSTEM    其他（如站内信）

 * CCC位 001~999 行为号，不同用户行为身份操作排列组合为号
 * 如:
 *  1 01 001 代表IM通知PC端用户添加私人好友
 *  1 01 002 代表IM通知PC端用户接受私人好友
 *  1 01 003 代表IM通知PC端用户拒绝私人好友
 *  99 06 103 mission function track开启关闭
 * 所有参数定义见
 * {@see /src/app/shared/config/readme.md}
 *
 */

export class NotificationConfigNew {
  public ACTION_WINDOW_RESIZE: number = 50003;
  public ACTION_GLOBAL_COMPONENT_SHOW: number = 50006;
  public ACTION_GLOBAL_COMPONENT_CLOSE: number = 50008;

  /**---模块间通讯 开始 ---**/
  // Socket连接报错
  public ACT_COMPONENT_IM_CONNECT_ERROR: number = 9901000;
  // socket open时
  public ACT_SYSTEM_IM_RE_LOGOUT: number = 9901001;



  //切换公司
  public ACT_COMPONENT_SWITCH_COMPANY: number = 9901001;
  //重新读取contact list
  public ACT_COMPONENT_CONTACT_LIST_RELOAD: number = 9901002;
  //contact search result
  public ACT_COMPONENT_CONTACT_SEARCH_RESULT: number = 9901003;
  //添加会议室
  public ACT_COMPONENT_MEETING_ADD_ROOM: number = 9901004;
  //修改会议室
  public ACT_COMPONENT_MEETING_UPDATE_ROOM: number = 9901005;
  //预定会议室
  public ACT_COMPONENT_MEETING_ADD_BOOKING_ROOM: number = 9901006;
  public ACT_COMPONENT_MEETING_UPDATE_BOOKING_ROOM: number = 9901007;
  public ACT_COMPONENT_USER_HAS_LOGIN: number = 9901008;
  public ACT_COMPONENT_USER_HAS_LOGOUT: number = 9901009;
  //账户email修改
  public ACT_COMPONENT_ACCOUNT_RESET_EMAIL: number = 9901010;

  //通知occupation 刷新
  public ACT_COMPONENT_OCCUPATION_REFRESH: number = 9901011;

  //打开dialog
  public ACT_COMPONENT_USER_ACCOUNT_RESET_PWD: number = 9901012;
  public ACT_COMPONENT_USER_ACCOUNT_RESET_ACCOUNT: number = 9901013;



  //展开全屏聊天
  public ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG: number = 9902001;
  //收起全屏聊天
  public ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG: number = 9902002;
  //点击聊天菜单中 某个私人聊天/群组聊天/任务聊天/收藏/最近
  public ACT_COMPONENT_CHAT_MENU_CLICK: number = 9902003;
  //用户收藏/取消收藏组, 私人聊天
  public ACT_COMPONENT_CHAT_ENSHRINE_OR_NOT = 9902004;
  //具体某个人聊天
  public ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE: number = 9902005;
  //打开创建群弹窗
  public ACT_COMPONENT_CHAT_OPEN_CREATE_NEW_GROUP: number = 9902006;
  // CHAT POST设置Share to
  public ACT_COMPONENT_CHAT_POST_SET_SHARETO: number = 9902007;
  // 聊天窗内展开某个用户详情
  public ACT_COMPONENT_CHAT_SHOW_MEMBER_DETAIL: number = 9902008;
  // 点击过聊天菜单之后刷新读取的min,max时间
  public ACT_COMPONENT_CHAT_MENU_UPDATE_TIME: number = 9902009;
  // CHAT content message input 点击加号后新建post
  public ACT_COMPONENT_CHAT_CONTENT_MESSAGE_INPUT_NEW_POST: number = 9902010;
  // CHAT设置 chat post Share to 为空
  //清除全局模式的post share to后再点击 有currentGroup后无法选中
  public ACT_COMPONENT_CHAT_POST_SET_SHARETO_NULL: number = 9902011;
  //刷新pin列表
  public ACT_COMPONENT_CHAT_PIN_REFRESH: number = 9902012;

  //个人聊天半屏聊天数据同步
  public ACT_SYNCHRONIZATION_PERSONAL_MESSAGE: number = 9902013;

  //新建tips
  public ACT_COMPONENT_OTHER_TIPS: number = 9902014;

  public ACT_SYNCHRONIZATION_PERSONAL_MESSAGE_MINI: number = 9902015;
  //post通知聊天模块转发
  public ACT_COMPONENT_CHAT_FORWARD: number = 9902016;
  //删除群成员
  // public ACT_COMPONENT_CHAT_DELETE_PERSONAL: number = 9902017;
  //修改tips
  public ACT_COMPONENT_OTHER_UPDATE_TIPS: number = 9902018;
  //contact list加载完毕
  public ACT_COMPONENT_OTHER_CONTACT_LOADED: number = 9902019;
  //向聊天发送post
  public ACT_COMPONENT_CHAT_POST_SEND_POST: number = 9902020;
  //闹钟提示框 点击 向tips 传送当前tip的id
  public ACT_COMPONENT_ALARM_SEND_TIPS: number = 9902021;
  //notification 通知到左侧
  //public ACT_COMPONENT_UPDATE_COMPANY_OWNER: number = 9902022;


  //获取用户首页设置最大弹出框个数
  public ACT_COMPONENT_SETTING_SEND_DIALOG = 9902023;

  //图片打PIN
  public ACT_COMPONENT_IMAGE_PIN: number = 9902024;

  //content-message-post发送给post read的settings
  public ACT_COMPONENT_CHAT_CONTENT_MESSAGE_POST_SEND_SETTINGS: number = 9902025;
  //未读消息提示
  public ACT_COMPONENT_CHAT_HAS_UNREAD_MESSAGE: number = 9902026;

  //图片评论
  public ACT_COMPONENT_IMAGE_COMMENT: number = 9902027;

  //打开图片
  public ACT_COMPONENT_OPEN_IMAGE_DIALOG: number = 9902028;

  public ACT_COMPONENT_CLOSE_IMAGE_DIALOG: number = 9902029;

  //同步图片like
  public ACT_COMPONENT_IMAGE_LIKE: number = 9902030;

  public ACT_COMPONENT_IMAGE_DIALOG_REMOVE_MESSAGE: number = 9902031;


  //chat message search
  public ACT_COMPONENT_CHAT_MESSAGE_SEARCH: number = 9902032;
  //search
  public ACT_COMPONENT_SEARCH_CLOSE: number = 9902033;

  //post评论
  public ACT_COMPONENT_CHAT_POST_COMMENT: number = 9902034;

  // 确认共享文件
  public ACT_COMPONENT_CHAT_SHARE_FILE: number = 9902035;
  // tips列表刷新
  public ACT_COMPONENT_TIPS_RELOAD: number = 9902036;
  // chat菜单刷新
  public ACT_COMPONENT_CHAT_MENU_RELOAD: number = 9902037;
  // @用户
  public ACT_COMPONENT_CHAT_AT_USER: number = 9902038;

  //点击打开聊天窗口
  public ACT_COMPONENT_CHAT_SEARCH_OPEN_CHAT_GROUP: number = 9902039;
  public ACT_COMPONENT_CHAT_PIN_OPEN_MESSAGE: number = 9902040;
  public ACT_COMPONENT_NOTIFICATION_SELF_MESSAGE: number = 9902041;           //通知自己消息
  public ACT_COMPONENT_NOTIFICATION_UPDATE_SHARE_HOLDER: number = 9902042;     //修改本地公司列表
  public ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER: number = 9902043;     //接受owner修改本地公司列表

  public ACT_COMPONENT_CHAT_POST_REVOKE: number = 9902044;// post 消息的删除
  public ACT_COMPONENT_IMAGE_DIALOG_FORWARD_MESSAGE: number = 9902045;
  public ACT_COMPONENT_IMPORT_BI_FILE: number = 9902046;
  public ACT_COMPONENT_REMOVE_MESSAGE_FROM_PIN_LIST: number = 9902047;
  public ACT_COMPONENT_CHAT_FILE_UPLOAD: number = 9902048;
  public ACT_COMPONENT_IMPORT_FILE_TO_POST: number = 9902049;
  public ACT_COMPONENT_SYNCHRONIZATION_GROUP_MESSAGE: number = 9902050;
  public ACT_COMPONENT_HIDE_CHAT_COMPONENT: number = 9902051;
  //post file 刷新
  public ACT_COMPONENT_CHAT_POST_FILE: number = 9902052;

  public ACT_COMPONENT_CHAT_REFRESH_HEADER: number = 9902053; //邀请人进群后 右侧侧边栏 通知头部 刷新人员列表


  // 离线Notification通知
  public ACT_COMPONENT_NOTIFICATION_READ_OFFLINE: number = 9999001;
  public ACT_COMPONENT_NOTIFICATION_PUSH_DATA: number = 9999002;              //新的  notification 通知
  public ACT_COMPONENT_NOTIFICATION_DELETE_FRIEND: number = 9999003;          //删除好友 notification
  public ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS: number = 9999004;         //更改Notification状态
  public ACT_COMPONENT_NOTIFICATION_SELF_OFFLINE_STATUS: number = 9999005;    //通知当前用户在线状态
  public ACT_NOTIFICATION_ADD_FRIEND: number = 9999006;                        //接受好友通知
  public ACT_NOTIFICATION_AGREE_HIRE: number = 9999007;                        //接受招聘
  public ACT_NOTIFICATION_GROUP_NAME_MODIFY: number = 9999008;                 //修改群信息
  public ACT_NOTIFICATION_COMPANY_CEO_MODIFY: number = 9999009;                //修改 company ceo
  public ACT_COMPONENT_DIALOG_DEAL_BUTTON: number = 9999010;

  public ACT_COMPONENT_DIALOG_BTN_DISABLE: number = 9999011;  //通知dialog 按钮不可点


  //folder
  public ACTION_NEW_FOLDER: number = 990401; //新建文件夹
  public ACTION_UPLOAD_FILE: number = 990402; //文件上传
  public ACTION_DELETE_FILE: number = 990403; //删除文件
  public ACTION_COPY_FILE: number = 990405; //复制文件
  public ACTION_RENAME_FILE: number = 990406; //重命名文件
  public ACTION_TRANSFER_FILE: number = 990407; //转让文件
  public ACTION_MOVE_FILE: number = 990408; //移动文件
  public ACTION_STARRED_FILE: number = 990409; //标记文件
  public ACTION_FILE_CHOOSE_CHANGE: number = 990410; //选择的文件数量及类型发生变化
  public ACTION_PASTE_FILE: number = 990411; //粘贴文件
  public ACTION_FILTE_FILE_IN_EXT: number = 990412; //在根据文件ext 类型分类的情况下按照关键字页面内帅选


  //mission模块
  public ACTION_MEETING_ATTENDEE_CHANGE: number = 990601; //会议参与人
  public ACTION_ASSIGNMENT_OPERATOR_CHANGE: number = 990602; //ASSIGNMENT OPERATOR的变化
  public ACTION_TASk_OPERATOR_CHANGE: number = 990603; //TASK OPERATOR
  public ACTION_TASK_APPROVER_CHANGE: number = 990604; //TASK APPROVER
  public ACTION_TASK_BIDDER_CHANGE: number = 990605; //TASK BIDDING
  public ACTION_TASK_PUBLISHER_IDENTITY_CHANGE: number = 990606; //TASK BIDDING
  public ACTION_TASK_INIT_TARGET: number = 990607;
  public ACTION_ASSIGNMENT_INIT_TARGET: number = 990608;
  //mission function 的开启关闭
  public ACTION_MISSION_FUNCTION_PARTICIPANT: number = 990609; //开启/关闭 participant function
  public ACTION_MISSION_FUNCTION_RECORDER: number = 990610;  //开启/关闭recorder function
  public ACTION_MISSION_FUNCTION_IMPORTANCE: number = 990611; //开启关闭importance function
  public ACTION_MISSION_FUNCTION_TRACK: number = 990612; //开启/关闭track function
  public ACTION_MISSION_FUNCTION_TARGET: number = 990613; //开启/关闭target function
  public ACTION_MISSION_FUNCTION_BIDDING: number = 990614; //开启/关闭bidding function
  public ACTION_MISSION_FUNCTION_EXPENSE: number = 990615; //开启/expense function
  //mission folder
  public ACT_COMPONENT_MISSION_FOLDER_CREATE: number = 990620;
  public ACT_COMPONENT_MISSION_FOLDER_DELETE: number = 990621;
  public ACT_COMPONENT_MISSION_FILE_UPLOAD: number = 990622;
  public ACT_COMPONENT_MISSION_IMPORT_FILE: number = 990623;
  //日历添加pin
  public ACT_COMPONENT_MISSION_CALENDAR_ADD_PIN: number = 990624;
  //日历修改pin
  public ACT_COMPONENT_MISSION_CALENDAR_UPDATE_PIN: number = 990625;


  //更新vacation天数
  public ACT_COMPONENT_VACATION_UPDATE_VACATION: number = 990701;

  //更新国家法定假日
  public ACT_COMPONENT_UPDATE_NATIONAL_HOLIDAY: number = 990702;




  //dialog 发送当前position
  public ACT_DIALOG_SERVICE_POSITION: number = 9903001;
  //组织架构 import
  public ACT_COMPONENT_STRUCTURE_IMPORT: number = 9903002;
  //将import的文件传送
  public ACT_COMPONENT_STRUCTURE_IMPORT_FILE: number = 9903003;
  //import的文件加载完毕
  public ACT_COMPONENT_STRUCTURE_IMPORT_FILE_COMPLETE: number = 9903004;

  public ACT_COMPONENT_REFRESH_COMPANY: number = 9903005;

  public ACT_COMPONENT_REFRESH_POSITION_NAME: number = 9903006;



  /**---模块间通讯 结束 ---**/

  /**---IM间通讯 开始 ---**/
    //保持IM心跳
  public ACT_SYSTEM_IM_KEEP_ONLINE: number = -1;
  //登陆IM
  public ACT_SYSTEM_IM_LOGIN: number = 199001;
  //退出IM
  public ACT_SYSTEM_IM_LOGOUT: number = 199002;
  // 用户权限变更, 非静默通知，强制退出，解雇/辞职
  // 发送给uuid
  public ACT_USER_PERMISSION_CHANGED: number = 199003;
  //用户登录状态过期
  public ACT_USER_SESSION_EXPIRED: number = 199004;
  // 用户权限冻结, psid变为pending
  public ACT_USER_PERMISSION_FREEZE: number = 199005;
  // 静默权限变更。
  // pending变为psid, 权限新增, 后期psid平移
  public ACT_USER_PERMISSION_CHANGED_IN_SILENCE: number = 199006;
  // 已经存在的导入变为psid
  public ACT_USER_STRUCTURE_IMPORTED: number = 199007;

  //站内信
  public ACT_IN_MAIL: number = 199010;
  //小闹钟
  public ACT_SYSTEM_ALARM: number = 199020;

  public ACT_SYSTEM_COMPANY_UPGRADE_SUCCESS: number = 199030;

  public ACT_SYSTEM_COMPANY_UPGRADE_FAILED: number = 199031;

  //联系人
  public ACT_USER_REQUEST_ADD_FRIEND: number = 101001;                        //申请添加好友
  public ACT_USER_NOTICE_ACCEPT_ADD_FRIEND: number = 101002;                  //接受添加好友
  public ACT_USER_NOTICE_REFUSE_ADD_FRIEND: number = 101003;                  //拒绝添加好友
  public ACT_USER_NOTICE_USER_DELETE_FRIEND: number = 101004;                 //删除好友
  public ACT_USER_REQUEST_RECOMMEND_USER: number = 101005;                    //推荐好友
  public ACT_USER_REQUEST_RECOMMEND_ADD_FRIEND: number = 101006;              //发起添加好友申请(给被推荐人)
  public ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND: number = 101007;        //被推荐人同意
  public ACT_USER_NOTICE_RECOMMEND_REFUSE_ADD_FRIEND: number = 101008;        //被推荐人拒绝
  public ACT_USER_NOTICE_REFUSE_RECOMMEND_ADD_FRIEND: number = 101009;        //拒绝推荐过来的好友

  // 群主邀请用户(被邀请用户收到)
  public ACT_NOTICE_MASTER_GROUP_INVITE: number = 102002;                  //群主邀请用户(被邀请用户收到)
  public ACT_REQUEST_MEMBER_GROUP_INVITE_RECEIVER: number = 102003;        //发送邀请通知(被邀请人收到)
  public ACT_REQUEST_MEMBER_GROUP_INVITE: number = 102005;                 //非群主邀请用户(群主收到)
  public ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_ACCEPT: number = 102006;    //群主同意邀请行为(邀请人收到)
  public ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE: number = 102007;    //群主拒绝邀请行为(邀请人收到)
  public ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT: number = 102008;           //被邀用户同意(邀请人收到)
  public ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE: number = 102009;           //被邀用户拒绝(邀请人收到)


  // 组织架构并行用户
  public ACT_NOTICE_STRUCTURE_CONCURRENCY: number = 103001;
  // 工作流程并行用户
  public ACT_NOTICE_WORKFLOW_CONCURRENCY: number = 103002;
  public ACT_REQUEST_COMPANY_RELATIONSHIP: number = 103003;
  public ACT_REQUEST_HIRE: number = 103004;                             //雇用员工
  public ACT_NOTICE_HIRE_ACCEPT: number = 103005;                       //接受雇佣
  public ACT_NOTICE_HIRE_REFUSE: number = 103006;                       //拒绝雇佣
  // 切换公司
  public ACT_NOTICE_SWITCH_COMPANY: number = 103007;
  public ACT_NOTICE_COMPANY_RELATIONSHIP_ACCEPT: number = 103008;       //同意公司关系申请
  public ACT_NOTICE_COMPANY_RELATIONSHIP_REFUSE: number = 103009;       //拒绝公司关系申请
  //组织架构模块
  public ACT_STRUCTURE_NOTICE_STRUCTURE_CHANGE: number = 103010;
  //多人同时在线同步
  // structure
  public ACT_STRUCTURE_CONCURRENCY_ADD:number = 103011;
  public ACT_STRUCTURE_CONCURRENCY_DELETE:number = 103012;
  public ACT_STRUCTURE_CONCURRENCY_HEARTBEAT:number = 103013;
  // workflow
  public ACT_WORKFLOW_CONCURRENCY_ADD:number = 103014;
  public ACT_WORKFLOW_CONCURRENCY_DELETE:number = 103015;
  public ACT_WORKFLOW_CONCURRENCY_HEARTBEAT:number = 103016;


  public ACT_REQUEST_SET_COMPANY_ADMIN: number = 103020;                              //设置公司 owner/builder/shareholder
  public ACT_REQUEST_SHAREHOLDER_APPROVE: number = 103022;                            //股东同意公司admin
  public ACT_REQUEST_SHAREHOLDER_DISAPPROVE: number = 103023;                         //股东拒绝公司admin
  public ACT_REQUEST_COMPANY_ADMIN_ACCEPT: number = 103026;                           //公司admin接受
  public ACT_REQUEST_COMPANY_ADMIN_REFUSE: number = 103027;                           //公司admin拒绝

  public ACT_REQUEST_SET_COMPANY_STRUCTURE_ADMIN: number = 103021;                    //设置公司 structure-admin
  public ACT_REQUEST_SHAREHOLDER_APPROVE_STRUCTURE_ADMIN: number = 103024;            //股东同意公司structure_admin
  public ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN: number = 103025;         //股东拒绝公司structure_admin
  public ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT: number = 103028;                 //公司structure_admin接受
  public ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_REFUSE: number = 103029;                 //公司structure_admin拒绝

  public ACT_NOTICE_ADMIN_CHANGE: number = 103030;                                    //股东变更


  public ACT_REQUEST_OUT_OFFICE_APPLY: number = 103043;                               //离开公司申请
  public ACT_NOTICE_OUT_OFFICE_ACCEPT: number = 103044;                               //同意离开公司申请
  public ACT_NOTICE_OUT_OFFICE_REFUSE: number = 103045;                               //驳回离开公司申请


  //用户切换聊天状态
  public ACT_NOTICE_CHAT_USER_ONLINE_STATUS = 102015;
  //获取单个用户在线状态
  public ACT_CHAT_USER_GET_STATUS: number = 102016;
  //重命名群
  public ACT_NOTICE_GROUP_NAME_MODIFY: number = 102010;
  //发送聊天消息
  public ACT_CHAT_SEND_MESSAGE: number = 102000;
  //创建群
  public ACT_CHAT_NOTICE_GROUP_CREATE: number = 102001;
  //删除群
  public ACT_NOTICE_GROUP_DELETE: number = 102014;
  //退出群
  public ACT_NOTICE_USER_EXIT_GROUP: number = 102011;
  //删除群成员
  public ACT_NOTICE_MASTER_DELETE_GROUP_USER: number = 102012;
  //群组转让
  public ACT_NOTICE_GROUP_TRANSFER: number = 102013;
  public ACT_CHAT_MESSAGE_REVOKE: number = 102030;


  // mission
  public ACT_MISSION_CREATED: number = 106001; //mission的创建
  public ACT_MISSION_MODIFY: number = 106002;
  public ACT_MISSION_RESET: number = 106003;
  public ACT_MISSION_DOING: number = 106004;
  public ACT_MISSION_PAUSE: number = 106005;
  public ACT_MISSION_RESTART: number = 106006;
  public ACT_MISSION_CANCEL: number = 106007;
  public ACT_MISSION_DONE: number = 106008;
  public ACT_MISSION_STORAGE: number = 106009;
  public ACT_MISSION_DELETED: number = 106010;

  public ACT_MISSION_AP_APPROVED: number = 106020;
  public ACT_MISSION_AP_REFUSE: number = 106021;
  public ACT_MISSION_AP_NEXT_STEP: number = 106022;

  public ACT_MISSION_ACCEPTED: number = 106030;
  public ACT_MISSION_REFUSE: number = 106031;
  public ACT_MISSION_ALL_ACCEPTED: number = 106032;
  public ACT_MISSION_OP_ACCEPTED: number = 106033;
  public ACT_MISSION_OP_REFUSE: number = 106034;
  public ACT_MISSION_OP_ALL_ACCEPTED: number = 106035;
  public ACT_MISSION_OP_COMPLETE: number = 106036;
  public ACT_MISSION_OP_ALL_COMPLETE: number = 106037;

  public ACT_MISSION_BIDDING_PERIOD_START: number = 106040;
  public ACT_MISSION_BIDDING_PERIOD_END = 106041;
  public ACT_MISSION_VOTED: number = 106042;
  public ACT_MISSION_ALL_VOTED: number = 106043;

  public ACT_MISSION_ADD_MISSION_MEMBER: number = 106050;
  public ACT_MISSION_DELETE_MISSION_MEMBER: number = 106051;
  //vacation 通知
  public ACT_USER_VACATION_APPLY: number = 103040;
  public ACT_USER_VACATION_APPLY_ACCEPT: number = 103041;
  public ACT_USER_VACATION_APPLY_REFUSE: number = 103042;

  //员工离职申请
  public ACT_APPLICATION_REQUEST_APPLY_DISMISSION: number = 103046;
  //通过离职申请 line manager
  public ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT: number = 103047;
  //拒绝离职申请 line manager
  public ACT_APPLICATION_NOTICE_DISMISSION_REFUSE: number = 103048;
  // hr admin | main admin | ceo  handle dismission
  public ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED: number = 103049;

  // hr admin | main admin | ceo  handle dismission, sent to line manager
  public ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED_SEND_TO_LINE_MANAGER: number = 103050;


}


/**
 * notification 模块
 */
export class NotificationList {
  public MESSAGE_MODULE: string = 'message';
  public COMPONENT_MODULE: string = 'component';

  public getModule(): Array<string> {
    return [
      this.MESSAGE_MODULE,
      this.COMPONENT_MODULE,
      'test'
    ];
  }
}



