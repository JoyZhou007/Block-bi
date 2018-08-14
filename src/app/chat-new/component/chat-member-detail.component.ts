/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */
import {AfterViewInit, Component, Inject, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {ChatMenuList} from "../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import {Subscription} from "rxjs/Subscription";
import * as userConstant from "../../shared/config/user.config"

@Component({
  selector: 'chat-member-detail',
  templateUrl: '../template/chat-member-detail.component.html',
})
export class ChatMemberDetailComponent implements AfterViewInit, OnDestroy {

  public showOrHide: boolean = true;
  public memberInfo: any = {};
  public isFriendRelation: boolean = false;
  public subscription: Subscription;

  public USER_IM_OFFLINE: number = 0;
  public USER_STATE_ONLINE: number = 1;
  public USER_STATE_BUSY: number = 2;
  public USER_STATE_OFFLINE: number = 0;
  public friendContactItem: any;
  public showStates: boolean = false;
  public userConstant = userConstant;

  constructor(public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              @Inject('app.config') public appConfig: any,
              @Inject('file.service') public fileService: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any) {
  }

  ngAfterViewInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        case this.notificationService.config.ACT_COMPONENT_CHAT_MENU_CLICK:
          this.closeDetail();
          break;
        case this.notificationService.config.ACT_COMPONENT_CHAT_SHOW_MEMBER_DETAIL:
          this.displayDetail(message.data);
          break;
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          if (message.status === 1 && message.data.hasOwnProperty('friend') && this.memberInfo) {
            this.dealUserIMStatusChange(message.data.friend);
          }
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 在线时候如果查看的用户切换了状态
   * @param info
   */
  dealUserIMStatusChange(info: any) {
    if (info.hasOwnProperty('uuid') && this.memberInfo.uid === info.uuid
      || info.hasOwnProperty('psid') && parseInt(this.memberInfo.uid) === parseInt(info.psid)) {
      this.memberInfo.online = info.online;
      this.memberInfo.state = info.state;
      if (this.typeService.isNumber(this.memberInfo.uid)) {
        this.showStates = true;
      }
      if (info.online === 0) {
        this.memberInfo.onlineStatusCls = this.getOnlineStatusCls(this.memberInfo.online);
      } else {
        this.memberInfo.onlineStatusCls = this.getOnlineStatusCls(this.memberInfo.online);
      }
    }
  }

  /**
   * 关闭
   * @param event
   */
  closeDetail(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.showOrHide = true;
  }

  /**
   * 切换到一对一聊天
   * @param event
   */
  switchToChat(event: any) {
    event.stopPropagation();
    this.closeDetail(event);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
      data: this.friendContactItem,
    })
  }

  /**
   *
   * @param event
   */
  viewProfile(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG,
      data: this.memberInfo.uid ? 'contacts/info/general/' + this.memberInfo.uid : ''
    });
  }

  /**
   * 展开
   * @param member
   */
  displayDetail(member: any) {
    if (!member.isMyself) {
      this.memberInfo = this.typeService.clone(member);
      //头像转为大图
      if (this.memberInfo.hasOwnProperty('user_profile_path')) {
        this.memberInfo.user_profile_path = this.appConfig.resourceDomain + this.fileService.getImagePath(300, this.memberInfo.user_profile_path);
      } else {
        this.memberInfo['user_profile_path'] = '';
      }
      //获取详情
      this.contactModelService.getUserInfo({uid: member.uid}, (response: any) => {
        this.showOrHide = false;
        if (response.status === 1) {
          //私人群 显示私人邮箱，私人手机
          //工作群 显示工作邮箱，工作手机
          if (member.form === 1) {
            this.memberInfo['email'] = response.data.hasOwnProperty('email') ? response.data.email : '';
            this.memberInfo['phone'] = response.data.hasOwnProperty('phone') ? response.data.phone : '';
          } else {
            this.memberInfo['email'] = response.data.hasOwnProperty('work_email') ? response.data.work_email : '';
            this.memberInfo['phone'] = response.data.hasOwnProperty('work_phone') ? response.data.work_phone : '';
          }
          this.memberInfo['location'] = response.data.hasOwnProperty('location') ? response.data.location : '';
          this.memberInfo['position'] = response.data.hasOwnProperty('position') ? response.data.position : '';
          this.memberInfo['company_name'] = response.data.hasOwnProperty('company_name') ? response.data.company_name : '';

        }
      });
      //在线状态
      if (member.online === 0) {
        this.memberInfo.onlineStatusCls = this.getOnlineStatusCls(this.memberInfo.online);
      } else {
        this.memberInfo.onlineStatusCls = this.getOnlineStatusCls(this.memberInfo.online);
      }

      this.showStates = !!this.typeService.isNumber(this.memberInfo.uid);

      //是否是好友，遍历contact list列表
      let contactListData = this.userDataService.getContactList();
      if (!contactListData) {
        this.getContactList(() => {
          this.checkFriendRelation(member)
        });
      } else {
        this.checkFriendRelation(member)
      }
    }
  }

  /**
   * 查看是否是好友关系
   * @param member
   */
  checkFriendRelation(member: any) {
    let contactListData = this.userDataService.getContactList();
    this.isFriendRelation = false;
    for (let group in contactListData) {
      if (contactListData.hasOwnProperty(group)) {
        for (let i in contactListData[group]) {
          if (contactListData[group].hasOwnProperty(i)) {
            if (contactListData[group][i].hasOwnProperty('uid') && contactListData[group][i].uid === member.uid) {
              this.isFriendRelation = true;
              this.friendContactItem = contactListData[group][i];
              if (group === 'Friend') {
                this.friendContactItem['form'] = 1;
              } else {
                this.friendContactItem['form'] = 2;
              }
              this.friendContactItem['isFriend'] = true;
              return;
            }
          }
        }
      }
    }
  }

  /**
   * 防止本地缓存失效
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 在线状态
   * @param check
   * @returns {string}
   */
  getOnlineStatusCls(check: number) {
    let cls = '';
    switch (check) {
      case this.USER_STATE_ONLINE:
        cls = 'ch-member-list-circle-available';
        break;
      case this.USER_STATE_OFFLINE:
        cls = 'ch-member-list-circle-offline';
        break;
    }
    return cls;
  }


}