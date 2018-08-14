import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {Router} from "@angular/router";
import {
  ChatModelService,
  ContactModelService,
  DateService,
  OfflineDataModelService
} from "../../shared/services/index.service";
import {NotificationDialog} from "../../shared/services/model/entity/notification-entity";
import {NotificationModelService} from "../../shared/services/model/notification-model.service";
import {Subscription} from "rxjs/Subscription";
import {storeDataKey} from "../../shared/config/member.config";
import {UserModelService} from "../../shared/services/model/user-model.service";


@Component({
  selector: 'notification-dialog',
  templateUrl: '../template/notification-dialog.component.html',
  styleUrls: ['../../../assets/css/notification/notification-dialog.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ContactModelService, OfflineDataModelService, ChatModelService]
})
export class NotificationDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  //我收到的提示
  public myNotificationList: Array<any> = [];
  private notificationListArr: Array<any> = [];
  public recommendInfo: any;

  public notificationKey: number;

  public chatGroupInfo: any;

  public fadeIn: any = {
    hideClass: '',
    showClass: 'showDialog'
  };


  public userData: any;
  public companyData: any;

  public isActive: boolean = true;
  private contactList: any;
  public maxNotificationNumber: number = 3;
  public waitNotificationArr: Array<any> = [];
  public subscription: Subscription;
  public fadeoutNumber: number = 0;
  //messageDialog
  // @ViewChild messageDialog
  @ViewChild('messageDialog') public messageDialog: any;
  @ViewChild('autoFadeElement') public autoFadeElement: any;
  @ViewChild('closeBut') closeBut: any;
  @ViewChild('progress') progress: any;
  public clearNotification: boolean = false;
  private notificationStatusKey: string = storeDataKey.USER_NOTIFICATION_MESSAGE_STATUS;

  constructor(public router: Router,
              public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              public notificationModelService: NotificationModelService,
              public userModelService: UserModelService,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification-data.service') public notificationDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('notice-dialog.service') public noticeDialogService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('const-interface.service') public constInterfaceService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('notification-offLine-message.service') private notificationOffLineMessageService: any) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //启动
  ngOnInit() {
    let thenFunc = (settings: any) => {
      this.maxNotificationNumber = settings.hasOwnProperty('quantity') ? settings.quantity : 3;
      this.notificationDataService.setNotificationSetting(settings);
      this.notificationOffLineMessageService.getAllNotification();
    };
    let settings = this.notificationDataService.getNotificationSetting();
    if (typeof settings == 'undefined' || !settings) {
      this.userModelService.getSettingNote((data: any) => {
        thenFunc(data.data);
      });
    } else {
      thenFunc(settings);
    }
  }

  ngAfterViewInit() {
    this.contactList = this.typeService.clone(this.userDataService.getContactList());
    this.getUserIn();
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      this.dealMessage(data);
    });
  }


  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any): any {
    this.getUserIn();
    if (data && data.hasOwnProperty('act') && data.hasOwnProperty('status')) {
      this.isActive = false;
      switch (parseInt(data.act)) {
        // case this.notificationService.config.ACT_COMPONENT_IM_CONNECT_ERROR:
        //   this.doConnectError();
        //   break;

        //好友申请的通知
        case this.notificationService.config.ACT_USER_REQUEST_ADD_FRIEND:
          this.setFriendApplyMessage(data);
          break;

        //好友同意添加请求的通知
        case this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND:
          this.setAcceptFriendMessage(data);
          break;

        //好友拒绝添加好友的通知
        case this.notificationService.config.ACT_USER_NOTICE_REFUSE_ADD_FRIEND:
          this.setRefuseFriendMessage(data);
          break;

        //推荐好友的通知
        case this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_USER:
          this.setRecommendMessage(data);
          break;

        //添加被推荐好友消息
        case this.notificationService.config.ACT_USER_REQUEST_RECOMMEND_ADD_FRIEND:
          this.setAddRecommendFriendMessage(data);
          break;

        //被推荐人接受好友请求
        case this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND:
          this.setAcceptReferralFriend(data);
          break;

        //创建群组的通知
        case this.notificationService.config.ACT_CHAT_NOTICE_GROUP_CREATE:
          this.setCreateGroupMessage(data);
          break;

        //改变群组信息的通知
        case this.notificationService.config.ACT_NOTICE_GROUP_NAME_MODIFY:
          this.setGroupNameModify(data);
          break;

        //邀请好友进群的通知
        case this.notificationService.config.ACT_NOTICE_MASTER_GROUP_INVITE:
          this.setGroupInviteMessage(data);
          break;

        ////////群主收到非群主邀请别人进去的通知
        case this.notificationService.config.ACT_REQUEST_MEMBER_GROUP_INVITE:
          this.setHostDealInviteMessage(data);
          break;

        ////////非群主邀请好友进群通知（不通知群主）
        case this.notificationService.config.ACT_REQUEST_MEMBER_GROUP_INVITE_RECEIVER:
          this.InvitingFriendsIntoGroup(data);
          break;

        ////////群主拒绝邀请人进群
        case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_REFUSE:
          this.memberGroupRefuse(data);
          break;

        ////////群主同意邀请人进群
        case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_MASTER_ACCEPT:
          this.memberGroupAgree(data);
          break;

        //被邀请人同意进群的通知
        case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT:
          this.setAcceptInviteMessage(data);
          break;

        //被邀请人拒绝进群的通知
        case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_REFUSE:
          this.setRefuseInviteMessage(data);
          break;

        //删除群成员的通知
        case this.notificationService.config.ACT_NOTICE_MASTER_DELETE_GROUP_USER:
          this.setDeleteMemberMessage(data);
          break;

        //退群通知
        case this.notificationService.config.ACT_NOTICE_USER_EXIT_GROUP:
          this.outCurrentGroup(data);
          break;

        //删除群组的通知
        case this.notificationService.config.ACT_NOTICE_GROUP_DELETE:
          this.setDeleteGroupMessage(data);
          break;

        //招聘的通知
        case this.notificationService.config.ACT_REQUEST_HIRE:
          this.setHirePeopleMessage(data);
          break;

        //接受招聘的通知
        case this.notificationService.config.ACT_NOTICE_HIRE_ACCEPT:
          this.setHireAcceptMessage(data);
          break;

        //拒绝招聘的通知
        case this.notificationService.config.ACT_NOTICE_HIRE_REFUSE:
          this.setHireRefuseMessage(data);
          break;

        //删除好友通知
        case this.notificationService.config.ACT_USER_NOTICE_USER_DELETE_FRIEND:
          this.setDeleteFriends(data);
          break;

        //群主转让
        case this.notificationService.config.ACT_NOTICE_GROUP_TRANSFER:
          this.setTransferGroup(data);
          break;

        //申请加公司
        case this.notificationService.config.ACT_REQUEST_COMPANY_RELATIONSHIP:
          this.setJoinCompany(data);
          break;

        //同意加入
        case this.notificationService.config.ACT_NOTICE_COMPANY_RELATIONSHIP_ACCEPT:
          this.setAcceptApply(data);
          break;

        //拒绝加入
        case this.notificationService.config.ACT_NOTICE_COMPANY_RELATIONSHIP_REFUSE:
          this.setRefuseApply(data);
          break;

        //mission部分相关的notification
        case this.notificationService.config.ACT_MISSION_CREATED:  //mission 创建
          // data.data.notificationTitle = 'NEW MISSION';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_DOING:   //mission 开始
          // data.data.notificationTitle = 'MISSION START';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_ACCEPTED:  //mission 接受
          // data.data.notificationTitle = 'MISSION ACCEPTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_MODIFY:  //mission修改
          // data.data.notificationTitle = 'MISSION MODIFY';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_RESET:  //mission重置
          // data.data.notificationTitle = 'MISSION RESET';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_PAUSE: //mission暂停
          // data.data.notificationTitle = 'MISSION PAUSE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_RESTART: //mission重新开始
          // data.data.notificationTitle = 'MISSION RESTART';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_CANCEL: //mission取消
          // data.data.notificationTitle = 'MISSION CANCEL';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_DONE: //mission完成
          // data.data.notificationTitle = 'MISSION DONE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_STORAGE: //mission归档
          // data.data.notificationTitle = 'MISSION STORAGE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_DELETED: //mission删除
          // data.data.notificationTitle = 'MISSION DELETED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_AP_APPROVED: //mission_application  同意
          // data.data.notificationTitle = 'MISSION APPLICATION APPROVED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_AP_REFUSE:  //mission_application  拒绝
          // data.data.notificationTitle = 'MISSION APPLICATION REFUSE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_REFUSE:  //mission  拒绝
          // data.data.notificationTitle = 'MISSION REFUSE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_AP_NEXT_STEP:  //通知下一步application同意人
          // data.data.notificationTitle = 'MISSION REFUSE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_ALL_ACCEPTED: //mission 所有人接受
          // data.data.notificationTitle = 'MISSION ALL ACCEPTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_OP_ACCEPTED: //mission操作者接收
          // data.data.notificationTitle = 'MISSION OPERATOR ACCEPTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_OP_REFUSE: //mission操作者拒绝
          // data.data.notificationTitle = 'MISSION OPERATOR REFUSE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_OP_ALL_ACCEPTED: //mission所有操作者接收
          // data.data.notificationTitle = 'MISSION OPERATOR ALL ACCEPTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_OP_COMPLETE:  //mission 完成
          // data.data.notificationTitle = 'MISSION OPERATOR COMPLETE';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_OP_ALL_COMPLETE: //mission 所有人完成
          // data.data.notificationTitle = 'MISSION ALL COMPLETE';
          // this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_BIDDING_PERIOD_START: //bidding 开始
          // data.data.notificationTitle = 'MISSION _BIDDING START';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_BIDDING_PERIOD_END:  //biding结束
          // data.data.notificationTitle = 'MISSION BIDDING END';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_VOTED: //voter投票
          // data.data.notificationTitle = 'MISSION VOTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_ALL_VOTED:  //所有voter投票
          // data.data.notificationTitle = 'MISSION ALL VOTED';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_ADD_MISSION_MEMBER:  //mission加人
          // data.data.notificationTitle = 'MISSION ADD MEMBER';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_MISSION_DELETE_MISSION_MEMBER: //mission 删人
          // data.data.notificationTitle = 'MISSION DELETE MEMBER';
          this.setMissionRequestMessage(data);
          break;
        case this.notificationService.config.ACT_IN_MAIL:
          data.isInMail = true;
          this.setInMailMessage(data);
          break;

        //设置公司owner
        case this.notificationService.config.ACT_REQUEST_SET_COMPANY_ADMIN:
          this.setCompanyOwnerMessage(data);
          break;

        //拒绝owner
        case this.notificationService.config.ACT_REQUEST_COMPANY_ADMIN_REFUSE:
          this.refuseCompanyOwnerMessage(data);
          break;

        //接受owner
        case this.notificationService.config.ACT_REQUEST_COMPANY_ADMIN_ACCEPT:
          this.acceptCompanyOwnerMessage(data);
          break;

        //share holder 变更通知
        case this.notificationService.config.ACT_NOTICE_ADMIN_CHANGE:
          if((data.data.role === 4) && data.data.hasOwnProperty('cid')) {
            data.act = this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE_STRUCTURE_ADMIN;
            this.shareHolderAcceptCeo(data);
          }else if((data.data.hasOwnProperty('cid') && (data.data.role === 2)) ||
            (data.data.hasOwnProperty('cid') && (data.data.role === 1))){
            data.act = this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE;
            data.data.isRequest = 1;
            this.acceptCompanyOwnerMessage(data);
          }else {
            this.shareHolderChange(data);
          }
          break;

        //设置 structure admin
        case this.notificationService.config.ACT_REQUEST_SET_COMPANY_STRUCTURE_ADMIN:
          this.setStructureAdmin(data);
          break;

        //拒绝 structure admin
        case this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_REFUSE:
          this.refuseStructureAdmin(data);
          break;

        //设置 structure admin
        case this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT:
          this.acceptStructureAdmin(data);
          break;
        
        //share holder 同意设置 ceo
        case this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE_STRUCTURE_ADMIN:
          this.shareHolderAcceptCeo(data);
          break;

        //share holder 拒绝设置 ceo
        case this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN:
          this.shareHolderRefuseCeo(data);
          break;

        //share holder 拒绝除 structure admin
        case this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE:
          this.shareHolderRefuseAdmin(data);
          break;

        //share holder 接受除 structure admin
        case this.notificationService.config.ACT_REQUEST_SHAREHOLDER_APPROVE:
          this.shareHolderAcceptAdmin(data);
          break;

        //接受闹钟
        case this.notificationService.config.ACT_SYSTEM_ALARM:
          this.setAlarm(data);
          break;

        case this.notificationService.config.ACT_REQUEST_OUT_OFFICE_APPLY:
          this.setOutOfficeMsg(data);
          break;
        case this.notificationService.config.ACT_NOTICE_OUT_OFFICE_ACCEPT:
          this.setAcceptOutOffice(data);
          break;
        case this.notificationService.config.ACT_NOTICE_OUT_OFFICE_REFUSE:
          this.setRefuseOutOffice(data);
          break;
        //设置每次显示多少条 notification
        case this.notificationService.config.ACT_COMPONENT_SETTING_SEND_DIALOG:
          this.maxNotificationNumber = data.num;
          break;

        //离线消息
        case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_READ_OFFLINE:
          this.notificationListArr = data.data;
          this.loadOfflineNotification(data.data);
          break;
        //离线消息
        case this.notificationService.config.ACT_USER_VACATION_APPLY:
          this.setVacationMsg(data);
          break;

        case this.notificationService.config.ACT_USER_VACATION_APPLY_ACCEPT:
          this.setAcceptVacation(data);
          break;
        case this.notificationService.config.ACT_USER_VACATION_APPLY_REFUSE:
          this.setRefuseVacation(data);
          break;
        case this.notificationService.config.ACT_APPLICATION_REQUEST_APPLY_DISMISSION:
          this.getResignation(data);
          break;
        case this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ACCEPT:
          this.setAcceptResignation(data);
          break;
        case this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_REFUSE:
          this.setRefuseResignation(data);
          break;
        case this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED:
          this.setAdminHandleResignation(data);
          break;
        case this.notificationService.config.ACT_APPLICATION_NOTICE_DISMISSION_ADMIN_HANDLED_SEND_TO_LINE_MANAGER:
          this.setAdminHandleResignationSendToLineManager(data);
          break;
        case this.notificationService.config.ACT_SYSTEM_COMPANY_UPGRADE_SUCCESS:
          this.setStudioUpgradeSuccess(data);
          break;
        case this.notificationService.config.ACT_SYSTEM_COMPANY_UPGRADE_FAILED:
          this.setStudioUpgradeFail(data);
          break;
      }
    }
    else {
      switch (data.act) {
        case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS:
          let requestId: string = data.data.data.request_id;
          let storeData: any;
          storeData = this.notificationDataService.initNotificationData(storeDataKey.USER_NOTIFICATION, 1);
          let isBool: boolean = this.notificationDataService.filterNotification(data.data);
          let userKey: string = this.notificationDataService.getUserDataKey(isBool ? 1 : 2);
          let list = storeData[userKey];
          for (let k in list) {
            if (list[k].data.request_id == requestId) {
              list[k].data.handled = 1;
              break;
            }
          }
          this.notificationDataService.setStoreData(storeDataKey.USER_NOTIFICATION, storeData);
          break;
      }
    }
  }


  /**
   * 载入离线消息
   * @param data
   */
  loadOfflineNotification(data: any) {
    for (let key in data) {
      if (parseInt(key) < this.maxNotificationNumber) {
        this.myNotificationList.push(data[key]);
      }
    }
  }

  /**
   * 申请加公司
   * @param data
   */
  setJoinCompany(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent !== 1) {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      }
    } else {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NoTIFICATION_POST_DIALOG,
        data: false
      });
      this.dialogService.openError({simpleContent: 'Accept failed!'});
    }
  }

  /**
   * 同意加入公司
   * @param data
   */
  setAcceptApply(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent == 1) {
        this.dialogService.openSuccess({simpleContent: 'Accept success!'});
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Accept failed!'});
    }
  }

  /**
   * 拒绝加入公司
   * @param data
   */
  setRefuseApply(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (data.data.sent == 1) {
        this.dialogService.openSuccess({simpleContent: 'Refuse success!'});
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Refuse failed!'});
    }
  }

  /**
   * 群主转让
   * @param data
   */
  setTransferGroup(data: any) {
    if (data.status == 1) {
      if (!data.data.hasOwnProperty('sent') && data.data.sent != 1) {
        if (!data.data.receiver) {
          data.data.receiver = this.userDataService.getCurrentUUID();
          data.data.isNewHost = true;
        }
        this.getMembersFetchSummary(data, [[data.data.receiver], null, null, [data.data.gid], null], data.data.receiver);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Transfer failed!'});
    }
  }

  /**
   * 发送招聘信息
   * @param data
   */
  setHirePeopleMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent !== 1) {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      }
    }
  }

  /**
   * 接受招聘
   * @param data
   */
  setHireAcceptMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent == 1) {
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_NOTIFICATION_AGREE_HIRE,
          data: data
        });
      }
    } else {
      this.dialogService.openError({simpleContent: 'Accept failed!'});
    }
  }

  /**
   * 拒绝招聘
   * @param data
   */
  setHireRefuseMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent == 1) {
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      }
    }
  }

  /**
   * 添加好友申请
   * @param data
   */
  setFriendApplyMessage(data: any) {
    let getData: any = data.data;
    if (data.data) {
      if (data.status == 1) {
        if (getData.hasOwnProperty('owner')) {
          this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
        } else {
          if (getData.sent != 1) {
            this.dialogService.openError({simpleContent: 'Apply friend failed!'});
          }
        }
      } else {
        this.dialogService.openError({simpleContent: 'The Relation is irrational!'});
      }
    }
  }

  /**
   * 拒绝好友申请
   */
  setRefuseFriendMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid);
      } else {
        if (getData.sent == 1) {
          //处理离线消息状态
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
            data: data
          });
        } else {
          this.dialogService.openError({simpleContent: 'Refuse friend failed!'});
        }
      }
    } else {
      this.dialogService.openError({simpleContent: 'add friend failed!'});
    }
  }

  /**
   * 接收友申请
   */
  setAcceptFriendMessage(data: any) {
    let getData: any = data.data;
    if (getData) {
      if (data.status == 1 && getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid, () => {
          this.userDataService.removeContactList();
          this.initListSettings(() => {
            //接受好友成功
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_NOTIFICATION_ADD_FRIEND,
              data: getData.owner
            });
          });
        });
      } else {
        if (getData.sent == 1) {
          //处理离线消息状态
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
            data: data
          });
        }
        this.userDataService.removeContactList();
        this.initListSettings();
      }
    }
  }

  /**
   * 好友列表
   */
  initListSettings(callback?: any) {
    this.contactModelService.getContactList({form: 0, group: 0},
      (data: any) => {
        if (data.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: data.data.staff
          });
          if (callback) {
            callback(data);
          }
        } else if (data.status) {
          this.dialogService.openError({simpleContent: data.message});
        }
      }
    );
  }

  /**
   * 删除好友
   * @param data
   */
  setDeleteFriends(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData.hasOwnProperty('owner')) {
      this.getMembersFetchSummary(data, [[getData.owner.uuid], null, null, null, null], getData.owner.uuid, (result: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_DELETE_FRIEND,
          owner: result.data.owner,
          relation: result.data.relation
        });
      }, true);
    } else {
      this.dialogService.openError({simpleContent: 'Delete failed!'});
    }
  }

  /**
   * 好友推荐通知
   */
  setRecommendMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && !getData.hasOwnProperty('sent')) {
      this.getMembersFetchSummary(data, [[getData.owner, getData.referral], null, null, null, null], getData.owner);
    } else if (data.status != 1 && getData.hasOwnProperty('sent') && data.sent == 1) {
      this.dialogService.openError({simpleContent: 'Recommend friend failed!'});
    }
  }

  /**
   * 添加被推荐好友消息
   * @param data
   */
  setAddRecommendFriendMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent != 1) {
        this.getMembersFetchSummary(data, [[getData.receiver,getData.acceptor], null, null, null, null], getData.acceptor);
      }
    }
  }

  /**
   * 被推荐人接受好友请求
   * @param data
   */
  setAcceptReferralFriend(data: any) {
    let getData: any = data.data;
    if (data.status == 1) {
      if (getData.sent != 1) {
        // let arr: Array<string>;
        // if (getData.receiver) {
        //   arr = [getData.receiver, getData.referral];
        // } else {
        //   arr = [getData.referral];
        // }
        getData.owner = getData.referral;
        this.getMembersFetchSummary(data, [[getData.referral], null, null, null, null], getData.referral);
      }
      this.initListSettings();
    }
  }

  /**
   * 建群时, 被选中的成员列表收到的通知消息
   */
  setCreateGroupMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData
      && !getData.hasOwnProperty('sent')
      && getData.hasOwnProperty('owner')) {
      this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
    }
  }

  /**
   *
   * @param user
   * @param mission
   * @param file
   * @param group
   * @param tips
   * @param callback
   */
  fetchNotificationFetchSummary(user: Array<any> = [],
                                mission: Array<any> = [],
                                file: Array<any> = [],
                                group: Array<any> = [],
                                tips: Array<any> = [],
                                callback ?: any) {
    let result = {};
    let data = {user: [], mission: [], file: [], group: [], tips: []};
    if (Array.isArray(user) && user.length) {
      data.user = user;
    }
    if (Array.isArray(mission) && mission.length) {
      data.mission = mission;
    }
    if (Array.isArray(file) && file.length) {
      data.file = file;
    }
    if (Array.isArray(group) && group.length) {
      data.group = group;
    }
    if (Array.isArray(tips) && tips.length) {
      data.tips = tips;
    }
    this.notificationModelService.fetchNotificationFetchSummary(data, (response: any) => {
      if (response.status == 1) {
        result = response.data;
        if (typeof callback == 'function') {
          callback(result);
        }
        return result;
      }

    });
  }

  /**
   * 修改群信息
   * @param data
   */
  setGroupNameModify(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData) {
      if (getData.sent == 1) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_NOTIFICATION_GROUP_NAME_MODIFY,
          data: data.data
        });
      } else {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner, () => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_NOTIFICATION_GROUP_NAME_MODIFY,
            data: data.data
          });
        });
      }
    } else {
      this.dialogService.openError({simpleContent: 'Update group info failed!'});
    }
  }

  /**
   * 群主邀请人入群
   */
  setGroupInviteMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Invite friend failed!'});
    }
  }

  /**
   * 非群主邀请后群主同意之后的通知
   */
  setHostDealInviteMessage(data: any) {
    let getData: any = data.data;
    if (getData && data.status == 1) {
      if (getData.hasOwnProperty('owner')) {
        let members: string[] = [getData.owner];
        for (let uid in getData.members) {
          members.push(getData.members[uid].uid);
        }
        this.getMembersFetchSummary(data, [members, null, null, [getData.gid], null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Invite friend failed!'});
    }
  }

  /**
   * 非群主邀请好友进群 不经过群主同意
   */
  InvitingFriendsIntoGroup(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      }
    }
  }

  /**
   * 非群主邀请人进群群主同意
   */
  memberGroupAgree(data: any) {
    let getData: any = data.data;
    if (getData && data.status == 1) {
      if (getData.sent == 1) {
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else if (getData.hasOwnProperty('members')) {
        let members: string[] = [getData.owner];
        for (let uid in getData.members) {
          members.push(getData.members[uid].uid);
        }
        this.getMembersFetchSummary(data, [members, null, null, [getData.gid], null], getData.owner);
      } else if (getData.hasOwnProperty('introducer')) {
        data.act = this.notificationService.config.ACT_REQUEST_MEMBER_GROUP_INVITE_RECEIVER;
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Invite friend failed!'});
    }
  }

  /**
   * 非群主邀请人进群群主拒绝
   */
  memberGroupRefuse(data: any) {
    let getData: any = data.data;
    if (getData && data.status == 1) {
      if (getData.sent == 1) {
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else if (getData.owner) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Invite friend failed!'});
    }
  }

  /**
   * 好友同意进群通知
   */
  setAcceptInviteMessage(data: any) {
    let getData: any = data.data;
    if (data.status == 1 && getData) {
      if (getData.owner) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      } else {
        if (getData.sent == 1) {
          //处理离线消息状态
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
            data: data
          });
        }
      }
    }
  }

  /**
   * 好友拒绝入群通知
   */
  setRefuseInviteMessage(data: any) {
    let getData: any = data.data;
    if (getData) {
      if (getData.owner) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, [getData.gid], null], getData.owner);
      } else {
        if (getData.sent == 1) {
          //处理离线消息状态
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
            data: data
          });
        }
      }
    }
  }



  /**
   * 删除群组成员的通知
   */
  setDeleteMemberMessage(data: any) {
    let getData: any = data.data;
    if (data.data && data.status == 1) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner,getData.friend], null, null, [getData.gid], null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'You delete the group member failed!'});
    }
  }

  /**
   * 退群通知
   * @param data
   */
  outCurrentGroup(data: any) {
    let getData: any = data.data;
    if (data.data && data.status == 1) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner.uid], null, null, [getData.gid], null], getData.owner.uid);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Out group failed!'});
    }
  }

  /**
   * 删除群组的通知
   */
  setDeleteGroupMessage(data: any) {
    let getData: any = data.data;
    if (data.data && data.status == 1) {
      if (getData.hasOwnProperty('owner')) {
        this.getMembersFetchSummary(data, [[getData.owner], null, null, null, null], getData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'The dissolution of the group failed!'});
    }
  }

  /**
   * MISSION 部分
   */
  //mission的notification
  setMissionRequestMessage(data: any) {
    data.isMission = true;
    data.data.currentPsid = this.userDataService.getCurrentCompanyPSID();
    this.getMembersFetchSummary(data, [[data.data.owner ? data.data.owner : ''], [data.data.mid ? data.data.mid : ''], null, null, null], data.data.owner);
  }

  /**
   * 闹钟
   */
  setAlarm(data: any) {
    let now = new Date().getTime();
    let offset = parseInt(data.data.effective_time) * 1000 - now;
    setTimeout(() => {
      let obj: any = new NotificationDialog();
      data['obj'] = obj;
      obj.init(data, true, this.translate);
      this.setMyNotification(data);
    }, offset);
  }

  /**
   * 站内信
   */
  setInMailMessage(data: any) {
    this.getMembersFetchSummary(data, [[data.data.owner ? data.data.owner : ''], null, null, null, null], data.data.owner);
  }


  /**
   * 删除message
   * @param event
   * @param index
   */
  deleteMessage(event: any, index: number) {
    if (event && event.isHide) {
      this.myNotificationList[event.data]['isShow'] = false;
      this.fadeoutNumber++;

      //如果有待显示的，则显示，没有队列清空
      //如果待显示数组有值，继续显示队列第一个数值,显示后删除
      this.notificationMaxNumber();

      setTimeout(() => {
        if (this.myNotificationList[event.data]) {
          this.myNotificationList[event.data]['isHide'] = true;
        }
      }, 500);
    }
  }

  /**
   * 设置notification最大个数
   */
  notificationMaxNumber() {
    if (this.waitNotificationArr.length) {
      if (!(this.fadeoutNumber % this.maxNotificationNumber)) {
        let num = (this.waitNotificationArr.length >= this.maxNotificationNumber) ? this.maxNotificationNumber : this.waitNotificationArr.length;
        //每次输出指定个数，最后一次输出时删除已输出的值
        for (let i = 0; i < num; i++) {
          let data = this.waitNotificationArr[i];
          this.myNotificationList.push(data);
          if (i == num - 1) {
            this.waitNotificationArr.splice(0, num);
          }
          setTimeout(() => {
            data.isShow = true;
          }, 500);
          this.notificationDataService.addMyNotification(data);
          //显示左边通知栏notification
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_PUSH_DATA,
            data: data
          });
        }
      }
    } else {
      setTimeout(() => {
        if (this.hasShow()) {
          this.fadeoutNumber = 0;
          this.myNotificationList = [];
          this.waitNotificationArr = [];
          return false;
        }
      }, 200);
    }
  }

  /**
   * 判断是否有正在显示的notification
   */
  hasShow(): boolean {
    let flag = true;
    for (let i = 0; i < this.myNotificationList.length; i++) {
      if (this.myNotificationList[i].isShow) {
        flag = false;
      }
    }
    return flag;
  }

  /**
   * socket 连接失败
   */
  doConnectError() {
    this.dialogService.openError({simpleContent: 'Your network looks like a problem!!'});
  }


  /**
   * 添加通知消息
   * 但会消息数量
   */
  setMyNotification(data: any) {
    if (this.typeService.getDataLength(this.myNotificationList) < this.maxNotificationNumber) {
      this.myNotificationList.push(data);
      setTimeout(() => {
        data.isShow = true;
      }, 600);
      this.notificationDataService.addMyNotification(data);
      //显示左边通知栏notification
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_PUSH_DATA,
        data: data
      });
    } else {
      //如果超出最大个数，存入新数组
      this.waitNotificationArr.push(data);
    }

  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }

  /**
   * 设置公司owner/builder/share holder
   * @param data
   */
  setCompanyOwnerMessage(data: any) {
    let newData: any = data.data;
    let titleName = this.titleName(newData.role);
    if (newData && data.status == 1) {
      if (newData.hasOwnProperty('owner')) {
        newData.title = this.titleName(newData.role);
        let userArr: any[] = [newData.owner];
        if(newData.role === 2) {
          userArr.push(newData.added[0]);
        }
        this.getMembersFetchSummary(data, [userArr, null, null, null, null], newData.owner);
      } else {
        this.dialogService.openSuccess({simpleContent: 'Set ' + (titleName ? titleName : '') + ' success!'});
      }
    } else {
      this.dialogService.openError({simpleContent: 'Set ' + (titleName ? titleName : '') + ' failed!'});
    }
  }

  /**
   * 拒绝owner
   * @param data
   */
  refuseCompanyOwnerMessage(data: any) {
    let newData: any = data.data;
    if (newData && data.status == 1) {
      if (newData.hasOwnProperty('owner')) {
        newData.title = this.titleName(newData.role);
        this.getMembersFetchSummary(data, [[newData.owner], null, null, null, null], newData.owner);
      } else {
        this.dialogService.openSuccess({simpleContent: 'Refuse success!'});
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      }
    } else {
      this.dialogService.openError({simpleContent: 'Refuse failed!'});
    }
  }

  /**
   * 接受owner
   * @param data
   */
  acceptCompanyOwnerMessage(data: any) {
    let newData: any = data.data;
    if (newData && data.status == 1) {
      if (newData.hasOwnProperty('owner')) {
        newData.title = this.titleName(newData.role);
        this.getMembersFetchSummary(data, [[newData.owner], null, null, null, null], newData.owner, () => {
          this.constInterfaceService.updateCompanyList(() => {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER
            });
          });
        });
      } else {
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
        this.dialogService.openSuccess({simpleContent: 'Accept success!'});
        this.constInterfaceService.updateCompanyList(() => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER
          });
        });
      }
    } else {
      this.noticeDialogService.setNoticeDialog({type: data.status, content: data.message});
      this.dialogService.openError({simpleContent: 'Refuse failed!'});
    }
  }

  /**
   * share holder 变更
   * @param data
   */
  shareHolderChange(data: any) {
    let newData: any = data.data;
    if (newData && data.status == 1) {
      if (newData.hasOwnProperty('owner')) {
        let members: Array<string> = [newData.owner];
        if (this.typeService.getDataLength(newData.added) > 0) {
          for (let added in newData.added) {
            members.push(newData.added[added]);
          }
        }
        if (this.typeService.getDataLength(newData.deleted) > 0) {
          for (let deleted in newData.deleted) {
            members.push(newData.deleted[deleted]);
          }
        }
        this.getMembersFetchSummary(data, [members, null, null, null, null], newData.owner, (response: any) => {
          let userArr: Array<any> = response.obj.detail.user;
          let addedArr: Array<any> = [];
          for (let user in userArr) {
            let isBool: boolean = this.typeService.isArrayVal(newData.added, userArr[user].uuid, '', true);
            if (isBool) {
              addedArr.push(userArr[user]);
            }
          }
          this.constInterfaceService.updateCompanyList(() => {
            //设置公司share holder
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_SHARE_HOLDER,
              data: data.data,
              user: userArr
            });
          }, 300);
        });
      }
    } else {
      this.dialogService.openError({simpleContent: 'Share holder update failed!'});
    }
  }

  /**
   * 设置 structure admin
   * @param data
   */
  setStructureAdmin(data: any) {
    let newData: any = data.data;
    if (data.status == 1) {
      if (newData.hasOwnProperty('sent') && newData.sent == 1) {
        this.dialogService.openSuccess({simpleContent: 'Structure admin update info send success!'});
      } else {
        let userArr: Array<any> = [newData.owner];
        if(newData.hasOwnProperty('added') && newData.role === 4) {
          userArr.push(newData.added[0]);
          newData['companyName'] = this.companyDataService.getCurrentCompanyName();
        }
        this.getMembersFetchSummary(data, [userArr, null, null, null, null], newData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Structure admin update failed!'});
    }
  }

  /**
   * 拒绝 structure admin
   * @param data
   */
  refuseStructureAdmin(data: any) {
    let newData: any = data.data;
    if (data.status == 1) {
      if (newData.hasOwnProperty('sent') && newData.sent == 1) {
        this.dialogService.openSuccess({simpleContent: 'Refused structure admin!'});
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
      } else {
        this.getMembersFetchSummary(data, [[newData.owner], null, null, null, null], newData.owner);
      }
    } else {
      this.dialogService.openError({simpleContent: 'Refuse structure admin failed!'});
    }
  }

  /**
   * 接受 structure admin
   * @param data
   */
  acceptStructureAdmin(data: any) {
    let newData: any = data.data;
    if (data.status == 1) {
      if (newData.hasOwnProperty('sent') && newData.sent == 1) {
        this.dialogService.openSuccess({simpleContent: 'Accepted structure admin!'});
        //处理离线消息状态
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_HANDLED_STATUS,
          data: data
        });
        this.constInterfaceService.updateCompanyList(() => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER,
          });
        });
      } else {
        this.getMembersFetchSummary(data, [[newData.owner], null, null, null, null], newData.owner, () => {
          this.constInterfaceService.updateCompanyList(() => {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER,
            });
          });
        });
      }
    } else {
      this.dialogService.openError({simpleContent: 'Accept structure admin failed!'});
    }
  }

  /**
   * share holder 同意设置 ceo
   * @param data
   */
  shareHolderAcceptCeo(data: any) {
    let newData: any = data.data;
    if(data.status === 1) {
      if (!newData.hasOwnProperty('sent') && newData.sent != 1) {
        let user: Array<any> = [];
        if(newData.hasOwnProperty('added')) {
          user.push(newData.added[0])
        }
        user.push(newData.owner);
        newData['companyName'] = this.companyDataService.getCurrentCompanyName();
        this.getMembersFetchSummary(data, [user, null, null, null, null], newData.owner);
      }
    }
  }

  /**
   * share holder 拒绝设CEO
   * @param data
   */
  shareHolderRefuseCeo(data: any) {
    let newData: any = data.data;
    if(data.status === 1) {
      if (!newData.hasOwnProperty('sent') && newData.sent != 1) {
        let user = newData.hasOwnProperty('added') ? newData.added : null;
        user.push(newData.owner);
        this.getMembersFetchSummary(data, [user, null, null, null, null], newData.owner);
      }
    }
  }

  /**
   * share holder 拒绝除 structure admin
   * @param data
   */
  shareHolderRefuseAdmin(data: any) {
    let newData: any = data.data;
    if(data.status === 1) {
      if (!newData.hasOwnProperty('sent') && newData.sent != 1) {
        newData.title = this.titleName(newData.role);
        let user = newData.hasOwnProperty('added') ? newData.added : null;
        user.push(newData.owner);
        this.getMembersFetchSummary(data, [user, null, null, null, null], newData.owner);
      }
    }
  }

  /**
   * share holder 接受除structure admin
   * @param data
   */
  shareHolderAcceptAdmin(data: any) {
    let newData: any = data.data;
    if(data.status === 1) {
      if (!newData.hasOwnProperty('sent') && newData.sent != 1) {
        newData.title = this.titleName(newData.role);
        let user = newData.hasOwnProperty('added') ? newData.added : null;
        user.push(newData.owner);
        this.getMembersFetchSummary(data, [user, null, null, null, null], newData.owner);
      }
    }
  }


  /**
   * 发出vacation application
   */
  setVacationMsg(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
    }
  }


  /**
   * 发出离开公司申请 out-office-application
   */
  setOutOfficeMsg(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
    }
  }


  /**
   * 主管同意外出申请
   */
  setAcceptOutOffice(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管同意假期申请
   */
  setAcceptVacation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管驳回外出申请
   */
  setRefuseOutOffice(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管驳回假期申请
   */
  setRefuseVacation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管收到申请
   */
  getResignation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管驳回辞职申请
   */
  setRefuseResignation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * 主管同意辞职申请
   */
  setAcceptResignation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * hr admin | main admin | ceo  handle dismission
   */
  setAdminHandleResignation(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner], null, null, null, null], data.data.owner);
      }
    }
  }
  /**
   * hr admin | main admin | ceo  handle dismission to send to linemanager  处理好后发给line manager
   */
  setAdminHandleResignationSendToLineManager(data: any) {
    if (data.hasOwnProperty('data') && data.data) {
      if (data.data.owner) {
        this.getMembersFetchSummary(data, [[data.data.owner,data.data.applicant], null, null, null, null], data.data.owner);
      }
    }
  }

  /**
   * studio 升级成功
   */
  setStudioUpgradeSuccess(data: any) {
    this.getMembersFetchSummary(data, [null, null, null, null, null], null);
  }


  /**
   * studio 升级失败
   */
  setStudioUpgradeFail(data: any) {
    this.getMembersFetchSummary(data, [null, null, null, null, null], null);
  }


  /**
   * 头衔
   * @param role
   */
  titleName(role: number | string): string {
    let title: string;
    switch (role) {
      case 1:
        title = 'BUILDER';
        break;
      case 2:
        title = 'OWNER';
        break;
      case 3:
        title = 'SHARE HOLDER';
        break;
      case 4:
        title = 'STRUCTURE ADMIN';
        break;
    }
    return title;
  }

  /**
   * 获取接口信息
   * @param data
   * @param params
   * @param callBack
   */
  getMembersFetchSummary(data: any, params: any[], ownerUid: any, callBack ?: any, isHide?: boolean) {
    let obj = new NotificationDialog();
    let newObj: any = this.typeService.clone(obj);
    this.fetchNotificationFetchSummary(params[0], params[1], params[2], params[3], params[4], (result: any) => {
      for (let i in result.user) {
        if (result.user[i].uid == ownerUid) {
          newObj.senderInfo.init(result.user[i]);
        }
      }
      newObj.detail = result;
      data['obj'] = newObj;
      newObj.init(data, true, this.translate);
      if (callBack) {
        callBack(data);
      }
      if (!isHide) {  //去掉不需要显示的notification弹窗
        this.setMyNotification(data);
      }
    });
  }

  /**
   * 点击关闭notification按钮
   * @param index
   * @param str
   * @param data
   * @returns {boolean}
   */
  clickCloseBtn(index: number, str: string, data ?: any) {
    //   点击前会触发鼠标移入事件，点击关闭后会触发鼠标移出事件
    if ((data && data.obj.msgType == 'request') || str == 'but') {
      clearTimeout(this.myNotificationList[index].timer);
      this.myNotificationList[index].isShow = false;
      setTimeout(() => {
        if (this.myNotificationList[index]) {
          this.myNotificationList[index]['isHide'] = true;
        }
      }, 500);
    }
  }
}
