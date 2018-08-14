import {NotificationConfigNew} from '../../../config/notification.config';
import {Inject} from "@angular/core";
import {DateService} from '../../../../shared/services/index.service';
import * as MissionConstant from '../../../../shared/config/mission.config';
// import get = Reflect.get;

const userRolesArr: Array<any> = [
  {missionType: MissionConstant.MISSION_USER_IDENTITY_PUBLISHER, name: 'isPublisher'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_APPROVER, name: 'isApprover'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_OPERATOR, name: 'isOperator'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_BIDDER, name: 'isBidder'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_VOTER, name: 'isVoter'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_CONFEREE, name: 'isConferee'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_OBSERVER, name: 'isObserver'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_MEMO, name: 'isMemo'},
  {missionType: MissionConstant.MISSION_USER_IDENTITY_WORKFLOW_APPROVER, name: 'isWorkflowApprover'}
];
const missionTitle: Array<any> = [
  {
    type: MissionConstant.MISSION_TYPE_APPLICATION,
    text: MissionConstant.MISSION_TYPE_APPLICATION_TEXT,
    name: 'isApplication'
  },
  {
    type: MissionConstant.MISSION_TYPE_ASSIGNMENT,
    text: MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT,
    name: 'isAssignment'
  },
  {type: MissionConstant.MISSION_TYPE_MEETING, text: MissionConstant.MISSION_TYPE_MEETING_TEXT, name: 'isMeeting'},
  {type: MissionConstant.MISSION_TYPE_TASK, text: MissionConstant.MISSION_TYPE_TASK_TEXT, name: 'isTask'},
  {type: MissionConstant.MISSION_TYPE_PROJECT, text: MissionConstant.MISSION_TYPE_PROJECT_TEXT, name: 'isProject'}
];

/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/4/19.
 */
export class NotificationUserInfo {
  public uuid: string; // 私人id
  public psid: string; // 职位id
  public user_profile_path: string;
  public work_name: string; //用户名字
  public p_name: string;// 职位名字
  public status: number;

  /**
   *
   */
  constructor() {
    this.uuid = '';
    this.psid = '';
    this.user_profile_path = '';
    this.work_name = '';
    this.p_name = '';
    this.status = 0;
  }

  init(data: any) {
    let obj = new NotificationDialog();
    if (data) {
      if (data) {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            this[key] = data[key];
          }
        }
      }
    }
    return obj;
  }
}

export class NotificationMissionInfo {
  public missionName: string;
  public missionDesc: string;
  public missionCreator: NotificationUserInfo;
  public missionStatus: string;
}

export class NotificationFileInfo {

}

export class NotificationDialog {
  // 对应act数据
  act: number;
  // 通知UTC时间
  ts: string = new Date().toUTCString();
  time: number;
  // 1 - notice,  2 - request
  type: number = 1;
  // 发送人信息
  senderInfo: NotificationUserInfo = new NotificationUserInfo();
  // 显示标题
  title: string = '';
  // 显示文本
  simpleMsg: string = '';
  //隐藏头像
  hideProfile: boolean = false;

  // 需要请求summary接口再次获取详情的数据
  detail: any = {};

  constructor() {

  }

  init(data?: any, bool?: boolean, translate?: any): NotificationDialog {
    let obj = new NotificationDialog();
    if (data && !bool) {
      if (data) {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            this[key] = data[key];
          }
        }
      }
    }
    if (data.hasOwnProperty('act')) {
      this.initTitle(data, translate);
    }

    return obj;
  }

  /**
   * notification title
   * @param data
   * @param translate
   */
  initTitle(data: any, translate?: any) {
    if (data.hasOwnProperty('data')) {
      translate = translate ? translate : {};
      let dateService: any = new DateService();
      let senderInfo: any = data.obj.hasOwnProperty('senderInfo') ? data.obj.senderInfo : {};
      let userObj: any = data.obj.hasOwnProperty('detail') ? data.obj.detail.user : {};
      let groupObj: any = (data.obj.detail.hasOwnProperty('group') && data.obj.detail.group.length > 0) ? data.obj.detail.group[0] : [];
      let missionObj: any = data.obj.detail.hasOwnProperty('mission') && data.obj.detail.mission.length > 0 ? data.obj.detail.mission[0] : [];
      let getData: any = data.data ? data.data : {};
      let nConfig: NotificationConfigNew = new NotificationConfigNew();
      if (getData.hasOwnProperty('date')) {
        this.ts = new Date(parseInt(getData.date) * 1000).toUTCString();
        //Date.parse(new Date().toUTCString())/1000
        this.time = getData.date;
      } else {
        this.time = dateService.localDateTime() + dateService.getTimeZoneOffset();
      }

      //mission
      if (data.data.hasOwnProperty('is_mission') && data.data.is_mission) {
        data.isMission = true;
      }
      if (data.hasOwnProperty('isMission') && data.isMission) {
        this.getCurrentUserRoles(getData, getData.currentPsid);
        this.getMissionTitle(getData, missionObj, translate);
        data.data.request_id = data.data.notification.id;
        switch (data.act) {
          case nConfig.ACT_MISSION_CREATED:  //mission 创建
            this.title = translate.manualTranslate('NEW') + ' ' + translate.manualTranslate(getData.missionText);
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            for (let key in userRolesArr) {
              if (userRolesArr[key].name === 'isVoter' ||
                userRolesArr[key].name === 'isApprover' ||
                userRolesArr[key].name === 'isMemo' ||
                userRolesArr[key].name === 'isConferee' ||
                userRolesArr[key].name === 'isOperator') {
                // data.obj.msgType = 'request';
                getData.isAcceptBtn = true;
                getData.isRefuseBtn = true;
                break;
              }
            }
            break;
          case nConfig.ACT_MISSION_DOING:   //mission 开始
            this.title = translate.manualTranslate('MISSION') + ' ' + translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('START');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            for (let key in missionTitle) {
              if (missionTitle[key].name === 'isApplication') {
                // data.obj.msgType = 'request';
                getData.isApproveBtn = true;
                getData.isRefuseBtn = true;
                break;
              }
            }
            break;
          case nConfig.ACT_MISSION_MODIFY:  //mission修改
            this.title = translate.manualTranslate('MISSION UPDATE');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_RESET:  //mission重置
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('RESET');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_ACCEPTED:  //mission 接受
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ACCEPTED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_REFUSE:  //mission 拒绝
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('REFUSED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_PAUSE: //mission暂停
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('PAUSE');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_RESTART: //mission重新开始
            this.title = getData.missionText + ' ' + translate.manualTranslate('RESTART');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_CANCEL: //mission取消
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('CANCEL');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_DONE: //mission完成
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('MISSION DONE');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            for (let key in missionTitle) {
              if (missionTitle[key].name === 'isProject' ||
                missionTitle[key].name === 'isTask' ||
                missionTitle[key].name === 'isAssignment') {
                for (let k in userRolesArr) {
                  if (userRolesArr[k].name === '') {
                    // data.obj.msgType = 'request';
                    getData.isCheckBtn = true;
                    break;
                  }
                }
                break;
              }
            }
            break;
          case nConfig.ACT_MISSION_STORAGE: //mission归档
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('STORAGE');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_DELETED: //mission删除
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('DELETED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_AP_APPROVED: //mission_application  同意
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ACCEPTED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            getData.isApproveBtn = true;
            getData.isRefuseBtn = true;
            break;
          case nConfig.ACT_MISSION_AP_REFUSE:  //mission_application  拒绝
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('REFUSED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            getData.isApproveBtn = true;
            getData.isRefuseBtn = true;
            break;
          case nConfig.ACT_MISSION_AP_NEXT_STEP:  //通知下一步application同意人
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('NEXT STEP START');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            getData.isApproveBtn = true;
            getData.isRefuseBtn = true;
            break;
          case nConfig.ACT_MISSION_ALL_ACCEPTED: //mission 所有人接受（approver）
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ALL ACCEPTED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            for (let key in userRolesArr) {
              if (userRolesArr[key].name === 'isPublisher') {
                // data.obj.msgType = 'notice';
              } else if (userRolesArr[key].name === 'isOperator' || userRolesArr[key].name === 'isBidder') {
                // data.obj.msgType = 'request';
                getData.isAcceptBtn = true;
                getData.isRefuseBtn = true;
              }
            }
            break;
          case nConfig.ACT_MISSION_OP_ACCEPTED: //mission操作者接受(operator)
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ACCEPT');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_OP_REFUSE: //mission操作者拒绝
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('REFUSE');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_OP_ALL_ACCEPTED: //mission所有操作者接收
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ALL OPERATOR ACCEPT');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_OP_COMPLETE:  //mission 完成
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('COMPLETED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_OP_ALL_COMPLETE: //mission 所有人完成
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ALL OPERATOR COMPLETED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_BIDDING_PERIOD_START: //bidding 开始
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('BIDDING START');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_BIDDING_PERIOD_END:  //biding结束
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('BIDDING END');
            data.obj.msgType = 'notice';
            break;
          case nConfig.ACT_MISSION_VOTED: //voter投票
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('VOTER VOTED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_ALL_VOTED:  //所有voter投票
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ALL VOTER VOTED');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_ADD_MISSION_MEMBER:  //mission加人
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('ADD MISSION MEMBER');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
          case nConfig.ACT_MISSION_DELETE_MISSION_MEMBER: //mission 删人
            this.title = translate.manualTranslate(getData.missionText) + ' ' + translate.manualTranslate('DELETE MISSION MEMBER');
            data.obj.msgType = data.data.notification.type === 1 ? 'notice' : 'request';
            break;
        }
      } else {
        //其它
        switch (data.act) {

          //修改群名片 | notice
          case nConfig.ACT_NOTICE_GROUP_NAME_MODIFY:
            this.title = translate.manualTranslate('UPDATE GROUP INFO');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> ' + translate.manualTranslate('updated') + '<strong> ' +
              (groupObj.name) + '</strong>' + translate.manualTranslate('group information');
            data.obj.msgType = 'notice';
            break;

          //同意申请人的公司加入本公司 | notice
          case nConfig.ACT_NOTICE_COMPANY_RELATIONSHIP_ACCEPT:
            this.title = translate.manualTranslate('NOTICE COMPANY OWNER');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('agreed join your company') + '<strong> ' +
              (getData.company_name) + '</strong>!';
            data.obj.msgType = 'notice';
            data.obj.isOperation = true;
            break;

          //拒绝申请人的公司加入本公司 | notice
          case nConfig.ACT_NOTICE_COMPANY_RELATIONSHIP_REFUSE:
            this.title = translate.manualTranslate('NOTICE COMPANY OWNER');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> ' + translate.manualTranslate('refused join your company') + '<strong> ' +
              (getData.company_name) + '</strong>!';
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //接受招聘 | notice
          case nConfig.ACT_NOTICE_HIRE_ACCEPT:
            this.title = translate.manualTranslate('NOTICE HIRE');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your offer');
            data.obj.msgType = 'notice';
            data.obj.isOperation = true;
            break;

          //拒绝招聘 | notice
          case nConfig.ACT_NOTICE_HIRE_REFUSE:
            this.title = translate.manualTranslate('NOTICE HIRE');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('refuse your offer');
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //接受好友请求 | notice
          case nConfig.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND:
            this.title = translate.manualTranslate('NOTICE CONTACT');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your friend request');
            data.obj.msgType = 'notice';
            data.obj.isOperation = true;
            break;

          //拒绝好友请求 | notice
          case nConfig.ACT_USER_NOTICE_REFUSE_ADD_FRIEND:
            this.title = translate.manualTranslate('NOTICE CONTACT');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('refused your friend request');
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //删除好友 | notice
          case nConfig.ACT_USER_NOTICE_USER_DELETE_FRIEND:  //不需要
            // this.title = 'NOTICE CONTACT';
            // this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> removed you from friend list';
            // data.obj.msgType = 'notice';
            break;

          //新建群 | notice
          case nConfig.ACT_CHAT_NOTICE_GROUP_CREATE:
            this.title = translate.manualTranslate('NEW CHANNEL');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> '
              + translate.manualTranslate('created') + ' <strong>' + (groupObj.name) + ' </strong>';
            data.obj.msgType = 'notice';
            break;

          //删除群成员 | notice
          case nConfig.ACT_NOTICE_MASTER_DELETE_GROUP_USER:
            this.title = translate.manualTranslate('DELETE GROUP MEMBER');
            let deleteMemberInfo: any = {};
            for (let i in data.obj.detail.user) {
              if (data.obj.detail.user[i].uid == getData.friend) {
                deleteMemberInfo = data.obj.detail.user[i];
              }
            }
            if (getData.frd_type === 3) {
              this.simpleMsg = translate.manualTranslate('you have been removed from group') + '<strong>' + (groupObj.name) + '</strong>';
            } else if (getData.frd_type === 4) {
              if (translate.lan == 'zh-cn') {
                this.simpleMsg = '</strong>' + (deleteMemberInfo.work_name) +
                  '</strong>被从群<strong>' + (groupObj.name) + '</strong>移除';
              } else {
                this.simpleMsg = '</strong>' + (deleteMemberInfo.work_name) +
                  '</strong>  has been removed form group  <strong>' + (groupObj.name) + '</strong>';
              }
            } else {
              if (translate.lan == 'zh-cn') {
                this.simpleMsg = '</strong>' + (senderInfo.work_name) +
                  '</strong> remove you from group <strong>' + (groupObj.name) + '</strong> ';
              } else {
                this.simpleMsg = '</strong>' + (senderInfo.work_name) +
                  '</strong> 把你从群 <strong>' + (groupObj.name) + '</strong>移除 ';
              }
            }
            data.obj.msgType = 'notice';
            break;

          //退出当前群 | notice
          case nConfig.ACT_NOTICE_USER_EXIT_GROUP:
            this.title = translate.manualTranslate('QUIT GROUP');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('quit group') + '<strong>' +
              (groupObj.name) + '</strong>';
            data.obj.msgType = 'notice';
            break;

          //删除当前群 | notice
          case nConfig.ACT_NOTICE_GROUP_DELETE:
            this.title = translate.manualTranslate('GROUP DISBANDED');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> ' + translate.manualTranslate('disbanded group') + ' <strong>' +
              (getData.name) + '</strong>';
            data.obj.msgType = 'notice';
            break;

          //好友拒绝入群 | notice
          case nConfig.ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE:
            this.title = translate.manualTranslate('NEW MEMBER REFUSED INVITATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) +
              '</strong> ' + translate.manualTranslate('refused join the group') + '<strong>' + (groupObj.name) + '</strong>';
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //好友同意入群 | notice
          case nConfig.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT:
            this.title = translate.manualTranslate('NEW MEMBER ACCEPT INVITATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) +
              '</strong> ' + translate.manualTranslate('accepted join group') + ' <strong>' + (groupObj.name) + '</strong>';
            data.obj.msgType = 'notice';
            data.obj.isOperation = true;
            break;

          //群主拒绝非群主邀请人入群 | notice
          case nConfig.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE:
            this.title = translate.manualTranslate('INVITE PEOPLE TO JOIN IN CHANNEL');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) +
              '</strong>  ' + translate.manualTranslate('refused your invitation of group') + ' <strong>' + (groupObj.name) + '</strong>';
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //群主同意非群主邀请人入群 | notice
          case nConfig.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_ACCEPT:
            this.title = translate.manualTranslate('INVITE PEOPLE TO JOIN IN CHANNEL');
            if (getData.hasOwnProperty('members')) {
              let userArr: any[] = [];
              for (let user in userObj) {
                if (userObj[user].uid == getData.owner) {
                  senderInfo = userObj[user];
                } else {
                  userArr.push(userObj[user].work_name);
                }
              }
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> ' + translate.manualTranslate('agreed') + ' <strong>' + userArr.join(', ') +
                '</strong> ' + translate.manualTranslate('join group') + ' <strong>' + (groupObj.name) + '</strong>';
              data.obj.msgType = 'notice';
              data.obj.isOperation = true;
            } else if (getData.hasOwnProperty('introducer')) {
              data.act = nConfig.ACT_NOTICE_MASTER_GROUP_INVITE;
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
                + translate.manualTranslate('invite you to join group') + ' <strong>' + (groupObj.name) + '</strong>';
              data.obj.msgType = 'request';
            }
            break;

          //拒绝成为owner | notice
          case nConfig.ACT_REQUEST_COMPANY_ADMIN_REFUSE:
            this.title = translate.manualTranslate('NOTICE COMPANY ADMIN');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
              + translate.manualTranslate('refuse to be') + ' <strong>' + (getData.title);
            data.obj.msgType = 'notice';
            data.obj.isOperation = false;
            break;

          //同意成为owner | notice
          case nConfig.ACT_REQUEST_COMPANY_ADMIN_ACCEPT:
            this.title = translate.manualTranslate('NOTICE COMPANY ADMIN');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
              + translate.manualTranslate('agree to be') + ' ' + (getData.title);
            data.obj.msgType = 'notice';
            data.obj.isOperation = true;
            break;

          //拒绝 structure | notice
          case nConfig.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_REFUSE:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            this.simpleMsg = '<strong>' + (senderInfo.work_name)
              + '</strong>' + translate.manualTranslate('refuse to be structure admin');
            data.obj.msgType = 'notice';
            break;

          //接受 structure | notice
          case nConfig.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> '
              + translate.manualTranslate('accept to be structure admin');
            data.obj.msgType = 'notice';
            break;

          //接受 share holder 同意 设置 ceo 通知owner | notice | request
          case nConfig.ACT_REQUEST_SHAREHOLDER_APPROVE_STRUCTURE_ADMIN:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            if (data.data.hasOwnProperty('cid')) {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 把你设置为 <strong>' + (getData.companyName) + '</strong> CEO';
              data.obj.msgType = 'request';
            } else {
              //userObj
              let workName: string = '';
              for (let key in userObj) {
                if (userObj[key].uid == getData.added[0]) {
                  workName = userObj[key].work_name;
                  break;
                }
              }
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 同意你把 <strong>' +
                (getData.companyName) + '</strong>' + ' 公司的CEO更改为 <strong> ' + (workName) + '</strong>';
              data.obj.msgType = 'notice';
            }
            break;

          //拒绝 share holder 拒绝 设置CEO
          case nConfig.ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 拒绝你修改CEO';
            data.obj.msgType = 'notice';
            break;

          //share holder 拒绝除structure admin
          case nConfig.ACT_REQUEST_SHAREHOLDER_DISAPPROVE:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            let refuseName: string = '';
            for (let key in userObj) {
              if (userObj[key].uid == getData.added[0]) {
                refuseName = userObj[key].work_name;
                break;
              }
            }
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 拒绝你把 <strong>' +
              (refuseName) + '</strong> 设为 ' + getData.title;
            data.obj.msgType = 'notice';
            break;

          //share holder 接受除structure admin
          case nConfig.ACT_REQUEST_SHAREHOLDER_APPROVE:
            this.title = translate.manualTranslate('NOTICE STRUCTURE EDITOR');
            let acceptName: string = '';
            for (let key in userObj) {
              if (userObj[key].uid == getData.added[0]) {
                acceptName = userObj[key].work_name;
                break;
              }
            }
            if ((getData.role === 2) || (getData.role === 1)) {
              if (getData.isRequest === 1) {
                this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> invite ' + (acceptName) + ' to join owner';
                data.obj.msgType = 'request';
              } else {
                this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 同意你把 <strong>' +
                  (acceptName) + '</strong>' + ' 设为 <stong>' + (getData.title) + '</stong>';
                data.obj.msgType = 'notice';
              }
            } else {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> 同意你把 <strong>' +
                (getData.companyName) + '</strong>' + ' 公司的 <stong>' + (getData.title) + '</stong> 更改为 <strong> ' + (acceptName) + '</strong>';
              data.obj.msgType = 'notice';
            }
            break;

          //share holder 变更 | notice
          case nConfig.ACT_NOTICE_ADMIN_CHANGE:
            this.title = translate.manualTranslate('SHARE HOLDER CHANGE');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
              + translate.manualTranslate('updated share holder list');
            data.obj.msgType = getData.role == 3 ? 'notice' : 'request';
            break;

          //闹钟 | notice
          case nConfig.ACT_SYSTEM_ALARM:
            this.title = translate.manualTranslate('ALARM');

            let type: string = '';
            if (!getData.form) {
              getData.rid = getData.data.rid;
              getData.form = getData.data.form;
              getData.effective_time = getData.data.effective_time;
              delete getData.data;
            }
            if (getData.form === '1') {
              type = 'mission';
            } else if (getData.form === '2') {
              type = 'chat';
            } else if (getData.form === '3') {
              type = 'tips';
            }
            let newDate = new Date(parseInt(getData.effective_time) * 1000);
            let effectiveTime: string = dateService.formatLocal(newDate, 'yyyy-mm-dd HH:MMtt');

            if (translate.lan == 'zh-cn') {
              this.simpleMsg = '您在' + effectiveTime + '有一个关于' + translate.manualTranslate(type) + '的闹钟';
            } else {
              this.simpleMsg = 'Alarm of ' + type + ' at ' + effectiveTime;
            }
            this.hideProfile = true;
            data.obj.msgType = 'notice';
            break;


          //群主 | notice
          case nConfig.ACT_NOTICE_GROUP_TRANSFER:
            this.title = translate.manualTranslate('GROUP TRANSFER');
            if (!getData.isNewHost) {
              if (translate.lan == 'zh-cn') {
                this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>成为了<strong>' + (groupObj.name) + '</strong>的群主';
              } else {
                this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> become group master named <strong>' + (groupObj.name) + '</strong> ';
              }
            } else {
              if (translate.lan == 'zh-cn') {
                this.simpleMsg = '你成为了<strong>' + (groupObj.name) + '</strong>的群主';
              } else {
                this.simpleMsg = 'You become the group master named <strong>' + (groupObj.name) + '</strong>';
              }
            }
            data.obj.msgType = 'notice';
            break;

          //邀请用户入群 | notice
          case nConfig.ACT_NOTICE_MASTER_GROUP_INVITE:
            this.title = translate.manualTranslate('INVITE PEOPLE TO JOIN IN CHANNEL');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
              + translate.manualTranslate('invite you to join group') + '<strong>' + (groupObj.name) + '</strong>';
            data.obj.msgType = 'notice';
            break;

          //被推荐人同意添加好友 | notice
          case nConfig.ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND:
            this.title = translate.manualTranslate('ACCEPT RECOMMENDATION OF FRIEND');
            let receiverName: string;
            if (getData.receiver) {
              if (userObj) {
                for (let user in userObj) {
                  if (userObj[user].uid == getData.receiver) {
                    receiverName = userObj[user].work_name;
                  }
                  if (userObj[user].uid == getData.referral) {
                    senderInfo = data.obj.senderInfo = userObj[user];
                  }
                }
              }
              this.simpleMsg = '<strong> ' + (senderInfo.work_name) + '</strong> accepted friend request of <strong> ' + (receiverName) + '</strong>';
            } else {
              this.simpleMsg = '<strong> ' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your friend request');
            }
            data.obj.msgType = 'notice';
            break;


          //站内信 | isEMail
          case nConfig.ACT_IN_MAIL:
            this.title = translate.manualTranslate('MESSAGE IN MAIL');
            if (translate.lan == 'zh-cn') {
              this.simpleMsg = '你有一条来自 <strong>' + (senderInfo.work_name) + '</strong> 的站内信';
            } else {
              this.simpleMsg = 'You have one message from <strong>' + (senderInfo.work_name) + '</strong>';
            }
            data.obj.msgType = 'isMail';
            break;

          //申请加入公司 | request
          case nConfig.ACT_REQUEST_COMPANY_RELATIONSHIP:
            this.title = translate.manualTranslate('COMPANY RELATIONSHIP');
            data.obj.msgType = 'request';
            break;

          //招聘员工 | request
          case nConfig.ACT_REQUEST_HIRE:
            this.title = translate.manualTranslate('HIRE');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('send you a offer');
            data.obj.msgType = 'request';
            break;

          //添加好友 | request
          case nConfig.ACT_USER_REQUEST_ADD_FRIEND:
            let relationStr: string = getData.relation[0] === 1 ? 'FRIEND' : 'COOPERATOR';
            this.title = translate.manualTranslate('NEW ' + relationStr);
            // if (getData.relation.length === 2) {
            //   this.simpleMsg = '<strong>' + (senderInfo.work_name) +
            //     '</strong> request to add both cooperator of company <strong>' + (getData.company_name) +
            //     '</strong> and private friend.';
            // } else
            if (getData.relation[0] === 2) {
              if (translate.lan == 'zh-cn') {
                this.simpleMsg = '<strong>' + (getData.company_name) + '的' + (senderInfo.work_name) + '</strong>'
                  + '向你发起合作申请'
              } else {
                this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
                  + translate.manualTranslate('send a cooperator request of company ') + '<strong>' +
                  (getData.company_name) + '</strong> to you';
              }
            } else {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' +
                translate.manualTranslate('send a private friend request to you');
            }
            data.obj.msgType = 'request';
            break;

          //邀请好友进群 | request
          case nConfig.ACT_REQUEST_MEMBER_GROUP_INVITE_RECEIVER:
            this.title = translate.manualTranslate('INVITE PEOPLE TO JOIN IN');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' +
              translate.manualTranslate('invite you to join group') + '<strong>' + (groupObj.name) + '</strong > ';
            data.obj.msgType = 'request';
            break;

          //非群主邀请用户入群 | request
          case nConfig.ACT_REQUEST_MEMBER_GROUP_INVITE:
            this.title = translate.manualTranslate('INVITE PEOPLE TO JOIN IN');
            let userArr: any[] = [];
            for (let user in userObj) {
              if (userObj[user].uid === getData.owner) {
                senderInfo = userObj[user];
              } else {
                userArr.push(userObj[user].work_name);
              }
            }
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> '
              + translate.manualTranslate('invited') + '<strong>' + userArr.join(', ') +
              '</strong>' + translate.manualTranslate('join group') + '<strong>' + (groupObj.name) + '</strong>';
            data.obj.msgType = 'request';
            break;

          //设置公司owner | request
          case nConfig.ACT_REQUEST_SET_COMPANY_ADMIN:
            this.title = translate.manualTranslate('COMPANY ADMIN SETUP');
            getData['title'] = (getData.role === 1) ? 'BUILDER' : (getData.role === 2) ? 'OWNER' : (getData.role === 3) ? 'SHARE HOLDER' : 'STRUCTURE ADMIN';
            let userStr: string = translate.manualTranslate('invite you to be');
            if (getData.role === 2) {
              userStr = 'invite ';
              for (let user in userObj) {
                if (getData.hasOwnProperty('added') && (userObj[user].uid == getData.added[0])) {
                  userStr += userObj[user].work_name;
                }
              }
              userStr += ' to be';
            }
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> '
              + userStr + ' <strong>' + translate.manualTranslate(getData.title) + '</strong>';
            data.obj.msgType = 'request';
            break;

          //设置公司structure admin | request
          case nConfig.ACT_REQUEST_SET_COMPANY_STRUCTURE_ADMIN:
            this.title = translate.manualTranslate('STRUCTURE ADMIN SETUP');
            if (getData.hasOwnProperty('added') && getData.role === 4) {
              let user: string = '';
              for (let key in userObj) {
                if (userObj[key].uid == getData.added[0]) {
                  user = userObj[key].work_name;
                  break;
                }
              }
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
                + ' invite <strong>' + (user) + '</strong> to be <strong>' + (getData.companyName) + '</strong> structure admin';
            } else {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>'
                + translate.manualTranslate('invite you to be structure admin');
            }
            data.obj.msgType = 'request';
            break;

          //推荐好友 | request
          case nConfig.ACT_USER_REQUEST_RECOMMEND_USER:
            this.title = translate.manualTranslate('PERSONAL CARD RECOMMENDATION');
            let workName: string;
            let recommendUser: string;
            for (let uid in userObj) {
              if (getData.referral == userObj[uid].uid) {
                workName = userObj[uid].work_name;
              }
              if (getData.owner == userObj[uid].uid) {
                recommendUser = userObj[uid].work_name;
              }
            }
            this.simpleMsg = '<strong>' + (recommendUser) + '</strong>' + translate.manualTranslate('send you a recommendation of')
              + '<strong>' + (workName) + '</strong>';
            data.obj.msgType = 'request';
            break;

          //添加被推荐人为好友 | request
          case nConfig.ACT_USER_REQUEST_RECOMMEND_ADD_FRIEND:
            this.title = translate.manualTranslate('NEW CONTACT');
            for (let user in userObj) {
              if (userObj[user].uid === getData.acceptor) {
                senderInfo = userObj[user];
                data.obj.senderInfo = senderInfo;
              }
            }
            let relation: string = (getData.relation.length === 2) ? 'private and cooperator' : getData.relation[0] === 1 ? 'private' : 'cooperator';
            if (translate.lan == 'zh-cn') {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>向你发送<strong>'
                + translate.manualTranslate(relation) + '</strong>好友申请';
            } else {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> send you a <strong>'
                + translate.manualTranslate(relation) + '</strong> friend request';
            }
            data.obj.msgType = 'request';
            break;
          case nConfig.ACT_REQUEST_OUT_OFFICE_APPLY:
            data.obj.msgType = 'request';
            break;
          case nConfig.ACT_NOTICE_OUT_OFFICE_ACCEPT:
            this.title = 'ACCEPT OUT OFFICE APPLICATION';
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your out office application');
            break;
          case nConfig.ACT_NOTICE_OUT_OFFICE_REFUSE:
            this.title = 'REFUSE OUT OFFICE APPLICATION';
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong> ' + translate.manualTranslate('refused your out office application');
            break;
          case nConfig.ACT_USER_VACATION_APPLY:
            data.obj.msgType = 'request';
            break;
          case nConfig.ACT_APPLICATION_REQUEST_APPLY_DISMISSION:
            data.obj.msgType = 'request';
            break;
          case nConfig.ACT_USER_VACATION_APPLY_ACCEPT:
            this.title = translate.manualTranslate('ACCEPT VACATION APPLICATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your vacation application');
            break;
          case nConfig.ACT_USER_VACATION_APPLY_REFUSE:
            this.title = translate.manualTranslate('REFUSE VACATION APPLICATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('refused your vacation application');
            break;
          case nConfig.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED:
            this.title = translate.manualTranslate('ACCEPT RESIGNATION APPLICATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('accepted your resignation application');
            break;
          case nConfig.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED_SEND_TO_LINE_MANAGER:
            let applicantInfo;
            for (let user in userObj) {
              if (userObj[user].uid == getData.applicant) {
                applicantInfo = userObj[user];
              }
            }

            this.title = translate.manualTranslate('HANDLE RESIGNATION APPLICATION');

            if (translate.lan === 'en') {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + 'has handle the ' + applicantInfo.p_name + ' resignation application';
            } else {
              this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + ' 已经处理了' + applicantInfo.p_name + ' 的离职申请';
            }
            break;
          case nConfig.ACT_APPLICATION_NOTICE_DISMISSION_REFUSE:
            this.title = translate.manualTranslate('REFUSE RESIGNATION APPLICATION');
            this.simpleMsg = '<strong>' + (senderInfo.work_name) + '</strong>' + translate.manualTranslate('refused your resignation application');
            break;
          case nConfig.ACT_SYSTEM_COMPANY_UPGRADE_SUCCESS:
            this.title = translate.manualTranslate('STUDIO UPGRADE');
            this.simpleMsg = translate.manualTranslate('studio upgrade success');
            break;
          case nConfig.ACT_SYSTEM_COMPANY_UPGRADE_FAILED:
            this.title = translate.manualTranslate('STUDIO UPGRADE');
            this.simpleMsg = translate.manualTranslate('studio upgrade failed');
            break;
        }
      }
    }
  }

  /**
   * 获得当前用户的角色locationCompany
   * @param data
   * @param roles
   * @param psid
   */
  getCurrentUserRoles(data: any, psid: string) {
    let userRoles: any;
    for (let key in data.roles) {
      if (key === psid) {
        userRoles = data.roles[key];
      }
    }
    if (userRoles) {
      for (let i in userRoles) {
        for (let key in userRolesArr) {
          if (parseInt(userRolesArr[key].missionType) === userRoles[i]) {
            data[userRolesArr[key].name] = true;
            break;
          }
        }
      }
    }
  }

  /**
   * 判断mission的类型 => 得到mission的title
   * @param data
   * @param missionData
   */
  getMissionTitle(data, missionData: any, translate: any) {
    for (let key in missionTitle) {
      if (parseInt(missionTitle[key].type) === parseInt(missionData.type)) {
        data['missionText'] = missionTitle[key].text ? missionTitle[key].text.toUpperCase() : '';
        data[missionTitle[key].name] = true;
        break;
      }
    }
  }

}

export class NotificationDialogRequest extends NotificationDialog {
  public buttons: Array<any> = [];

  constructor() {
    super();
    this.type = 2;
  }

  init(data?: any): NotificationDialogRequest {
    let obj = new NotificationDialogRequest();
    if (data) {
      if (data) {
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            this[key] = data[key];
          }
        }
      }
    }
    return obj;
  }

  initButtons(data: any) {

  }
}


