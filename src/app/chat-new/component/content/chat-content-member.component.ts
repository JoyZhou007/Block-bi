/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */
import {AfterViewInit, Component, EventEmitter, HostListener, Inject, OnDestroy, OnInit, Output} from "@angular/core";
import {Router} from "@angular/router";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatMenuList, ChatUserInfo} from "../../../shared/services/model/entity/chat-entity";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'chat-content-member',
  templateUrl: '../../template/content/chat-content-member.component.html',
})
export class ChatContentMemberComponent implements OnInit, OnDestroy {
  public groupMemberInfo: Array<any> = [];
  public menuItem: ChatMenuList;
  public onlineCount: number = 0;
  public switchStatus: boolean = false;
  //是否收起组员列表
  public menuStatus: boolean = false;

  public USER_STATE_ONLINE: number = 1;
  public USER_STATE_OFFLINE: number = 0;

  public deleteMember: any;
  public personalInfo: any = {};
  public currentUserIsHost: boolean;
  public subscription: Subscription;

  @Output('outClickMenu') outClickMenu = new EventEmitter<any>();

  constructor(private chatModelService: ChatModelService,
              @Inject('app.config') public appConfig: any,
              @Inject('type.service') public typeService: any,
              @Inject('im.service') public chatSocketService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {

  }

  @HostListener('click', ['$event']) onClick(event: any) {
    event.stopPropagation();
    let targetCls = event.target.classList;
    let clickOnToggle = false;
    for (let i in targetCls) {
      if (targetCls.hasOwnProperty(i) && targetCls[i] === 'change-im-status') {
        clickOnToggle = true;
        break;
      }
    }
    if (!clickOnToggle && this.switchStatus) {
      this.switchStatus = false;
    }
  }

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          if (message.status === 1) {
              this.dealUserIMStatusChange(message.data);
          }
          break;
        case this.notificationService.config.ACT_NOTICE_MASTER_DELETE_GROUP_USER:
          //如果被删除的人在当前群里 聊天页面跳转默认页
          if (message.hasOwnProperty('status') && message.status === 1) {
            if (message.data.hasOwnProperty('sent') && message.data.sent === 1) {
              message.data.friend = this.deleteMember.uid;
              this.dealRemoveMemberResult(message);
            } else if (!message.data.hasOwnProperty('sent') && message.data.hasOwnProperty('frd_type') &&
              message.data.frd_type === 4 && this.menuItem && this.menuItem.gid === message.data.gid) {
              this.dealRemoveMemberResult(message);
            }
          }
          break;
        case this.notificationService.config.ACT_NOTICE_MASTER_GROUP_INVITE:
        case this.notificationService.config.ACT_NOTICE_MEMBER_GROUP_INVITE_ACCEPT:
          this.chatModelService.fetchGroupInfo({im_data: {gid: message.data.gid}}, (data: any) => {
            if (data.status === 1) {
              this.personalInfo = ChatMenuList.init();
              let obj: any = data.data;
              let isHost: number = 0;
              for (let key in obj) {
                if (obj[key].uid === data.creator_uid) {
                  isHost = 1;
                  break;
                }
              }
              let newData: any = {
                form: obj.form,
                group: obj.form === 1 ? 'private' : 'work',
                name: obj.name,
                gid: obj.gid,
                is_host: isHost,
                is_mission: '0'
              };
              this.typeService.bindData(this.personalInfo, newData, (obj: ChatMenuList) => {
                obj.initIdentity();
              });
              this.fetchGroupMemberInfo(data.data, this.personalInfo);
              //通知chat-content-header刷新人员列表
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_CHAT_REFRESH_HEADER,
                data: data.data
              })
            }
          });
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  toggleMemberMenuStatus(event: any) {
    event.stopPropagation();
    this.menuStatus = !this.menuStatus;
    this.outClickMenu.emit();
  }

  getOnlineStatusCls(state: number) {
    let cls = '';
    switch (state) {
      case this.USER_STATE_ONLINE:
        cls = 'ch-member-list-circle-available';
        break;
      case this.USER_STATE_OFFLINE:
        cls = 'ch-member-list-circle-offline';
        break;
    }
    return cls;
  }

  /**
   * 接收到IM在线状态切换
   * @param data
   */
  dealUserIMStatusChange(data: any) {
    // 切换本人
    let flag = false;
    if (data.hasOwnProperty('sent')) {
      let newState = data.owner.online;
      this.groupMemberInfo.forEach((info: any) => {
        if (info.isMyself) {
          info.state = newState;
          info.onlineStatusCls = this.getOnlineStatusCls(newState);
        }
        flag = true;
      });
      // 其他人切换
    } else if (data.hasOwnProperty('friend')) {
      let newState = data.friend.state;
      this.groupMemberInfo.forEach((info: any) => {
        if (data.friend.hasOwnProperty('uuid') && info.uid === data.friend.uuid
          || data.friend.hasOwnProperty('psid') && parseInt(info.uid) === parseInt(data.friend.psid)) {
          info.state = newState;
          info.onlineStatusCls = this.getOnlineStatusCls(newState);
          flag = true;
        }
      });
    }
    if (flag) {
      this.calculateOnline();
    }
  }

  /**
   * 统计在线人数
   */
  calculateOnline() {
    this.onlineCount = 0;
    if (this.groupMemberInfo) {
      this.groupMemberInfo.forEach((info: any) => {
        if (info.hasOwnProperty('online') && parseInt(info.online) === 1
          && info.hasOwnProperty('state') && info.state !== this.USER_STATE_OFFLINE) {
          this.onlineCount++;
        }
      })
    }
  }

  /**
   * 通知component chat-member-detail展开详情
   */
  showMemberDetail(member: any) {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_SHOW_MEMBER_DETAIL,
      data: member
    })
  }

  /**
   * 用户群组成员信息
   * @param groupInfo
   * @param menuItem
   * @return Array<any>
   */
  fetchGroupMemberInfo(groupInfo: any, menuItem: ChatMenuList): Array<any> {
    this.switchStatus = false;
    this.menuItem = menuItem;
    if (groupInfo.hasOwnProperty('info')) {
      this.groupMemberInfo = [];
      for (let i in groupInfo.info) {
        if (groupInfo.info.hasOwnProperty(i)) {
          let userInfo = groupInfo.info[i];
          let isMySelf = false;
          let isHost = false;
          if (userInfo.hasOwnProperty('uid')) {
            let uuid = this.userDataService.getCurrentUUID();
            let psid = this.userDataService.getCurrentCompanyPSID();
            isMySelf = uuid === userInfo.uid || psid === userInfo.uid;
            if (isMySelf) {
              isHost = userInfo.uid === groupInfo.creator_uid || parseInt(psid) === parseInt(groupInfo.creator_uid);
            } else {
              isHost = userInfo.uid === groupInfo.creator_uid;
            }
            if (groupInfo.info[i].uid === uuid || psid === userInfo.uid) {
              this.currentUserIsHost = userInfo.uid === groupInfo.creator_uid || parseInt(psid) === parseInt(groupInfo.creator_uid);
            }
          }
          let tmp = {
            form: groupInfo.form,
            user_profile_path: userInfo.user_profile_path ? userInfo.user_profile_path : '',
            work_name: userInfo.work_name,
            state: userInfo.state,
            isMyself: isMySelf,
            isHost: isHost,
            uid: userInfo.uid,
            online: userInfo.online
          };
          if (userInfo.online === 0) {
            tmp['onlineStatusCls'] = this.getOnlineStatusCls(parseInt(userInfo.online));
          } else {
            tmp['onlineStatusCls'] = this.getOnlineStatusCls(parseInt(userInfo.online));
          }
          let memberInfo = new ChatUserInfo(tmp);
          this.groupMemberInfo.push(memberInfo);
        }
      }
      this.calculateOnline();
      return this.groupMemberInfo;
    }
  }

  /**
   * 是否显示切换用户状态下拉菜单
   * @param member
   */
  toggleSwitchOnline(member: any) {
    if (member.isMyself) {
      this.switchStatus = !this.switchStatus;
    }
  }

  /**
   * 当前群群成员被删除后右侧列表移除当前成员
   */
  dealRemoveMemberResult(message: any) {
    for (let i in this.groupMemberInfo) {
      if (this.groupMemberInfo[i].uid === message.data.friend) {
        this.groupMemberInfo.splice(parseInt(i), 1);
      }
    }
  }


  /**
   * 向IM发送切换用户状态信息
   * @param event
   * @param member
   * @param status
   */
  switchOnlineStatus(event, member, status: number) {
    event.stopPropagation();
    if (member.isMyself) {
      this.chatSocketService.sendChangState({
        state: status
      });
      this.toggleSwitchOnline(member);
    }
  }


  /**
   * 群主点击删小按钮删除成员
   * @param event
   * @param member
   */
  deleteGroupMember(event: any, member: any) {
    event.stopPropagation();
    this.deleteMember = member;
    let settings = {
      mode: '1',
      title: 'DELETE GROUP MEMBER',
      isSimpleContent: true,
      simpleContent: 'Are you sure to delete the member?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'delete',
          btnText: 'DELETE',
          btnEvent: () => {
            this.chatSocketService.sendDeleteGroupMember({
              gid: this.menuItem.gid,
              name: this.menuItem.name,
              friend: member.uid,
              form: member.form
            });
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


}