import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer
} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ContactModelService, ContactsList} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";
import * as profileConfig from '../../shared/config/profile.config';


@Component({
  selector: 'contacts-header',
  templateUrl: '../template/contacts-header.component.html',
})

export class ContactsHeaderComponent implements OnInit, OnDestroy {
  // 空数据
  public noData: string = profileConfig.PROFILE_COMPANY_NODATA;
  // 路由参数
  public currentType: string = '';
  public currentUid: any;

  public setClass: string = 'header-alarm';

  private personInfo: any;
  private contactList: any;

  public showInternal: boolean;
  // 0 无关系 1 私人好友 2 公司好友
  private friendType: number;
  // 搜索缓存结构列表
  private retainList: any;
  // 权限相关
  public couldHire: boolean = false;
  public couldAddRelation: boolean = false;
  public couldRemoveRelation: boolean = false;
  public showCommonFriend: boolean = false;
  // 是否能够推荐好友
  public couldForward: boolean = false;


  public subscription: Subscription;
  public menuArr: Array<{
    title: string,
    api: string,
    key: string,
    access: boolean
  }> = [];
  public currentUserInfo: any;

  // 共同好友
  public inCommonList: Array<any>;
  private toggleInput: any;
  private toggleSelect: any;

  //save
  @Output() public uploadInfo: any = new EventEmitter();
  @ViewChild('inCommonElement') private inCommonElement: ElementRef;

  @Input() set setCurrentUserInfo(data: any) {
    if (data) {
      this.initSettings(data);
    }
  }

  constructor(public router: Router,
              public renderer: Renderer,
              private activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('file.service') public file: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('im.service') public memberService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
    //接收消息
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.hasOwnProperty('type') && params.hasOwnProperty('uid')) {
        this.currentType = params.type;
        this.currentUid = params.uid;
        if (this.toggleInput && this.toggleSelect) {
          this.renderer.setElementClass(this.toggleInput, 'header-alarm', false);
          this.renderer.setElementClass(this.toggleSelect, 'hide', true);
          this.toggleSelectService.emptyElement();
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'You have an error, please try later'});
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   *
   */
  ngOnInit() {
    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        this.dealMessage(data);
      });
  }


  dealMessage(data: any) {
    switch (data.act) {
      //删除好友成功跳转到首页
      case this.notificationService.config.ACT_USER_NOTICE_USER_DELETE_FRIEND:
        if (data.status === 1) {
          this.router.navigate(['user/index']);
        }
        break;

      //接受好友请求
      case this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND:
        if(data.data && data.data.owner && data.data.owner.uuid){
          if(data.data.owner.uuid == this.currentUid){
            this.couldAddRelation = false;
          }
        }
        this.contactList = this.userDataService.getContactList();
        let groupKey: string = this.typeService.getContactType(this.contactList, this.currentUid);
        this.showInternal = (groupKey === 'Internal') ? false : (groupKey !== 'searchMemberList');
        break;

      //接受好友请求
      case this.notificationService.config.ACT_NOTIFICATION_ADD_FRIEND:
        if (data.data.psid === this.currentUid || data.data.uuid === this.currentUid) {
          this.currentUserInfo.isFriend = true;
        }
        break;

      //接受招聘
      case this.notificationService.config.ACT_NOTIFICATION_AGREE_HIRE:
        this.couldHire = false;
        break;
    }
  }


  initSettings(data: any) {
    this.currentUserInfo = data;

    let relationship = data.relationship;
    this.couldAddRelation = relationship.person || relationship.company;
    if (relationship.inContactList) {
      this.couldRemoveRelation = relationship.friendGroup != 'Internal';
      this.showCommonFriend = relationship.friendGroup != 'Internal';
      this.couldForward = true;
      this.friendType = relationship.friendGroup === 'Friend' ? 1 : 2;
    } else {
      this.couldForward = false;
      this.showCommonFriend = false;
      this.couldRemoveRelation = false;
      this.friendType = 0;
    }
    this.retainList = this.userDataService.sessionGetData('retain_list');
  }


  /**
   * 保存数据
   */
  saveData() {
    this.uploadInfo.emit();
  }

  /**
   * 页面跳转
   * @param data
   */
  routerLink(data: string) {
    this.router.navigate(['contacts/info', data, this.currentUid]);
  }

  /**
   * 跳转首页
   */
  targetIndex() {
    this.userDataService.sessionRemoveData('retain_list');
    this.userDataService.sessionRemoveData('result_member');
    this.router.navigate(['home/index']);
  }

  /**
   * 发送 hire
   */
  hirePerson() {
    this.hirePersonSetting(this.currentUserInfo);
  }

  hirePersonSetting(data: any) {
    let settings = {
      mode: '1',
      title: 'HIRE',
      isSimpleContent: false,
      componentSelector: 'hire-contact',
      componentData: this.typeService.clone(data),
      buttons: [{type: 'cancel'}, {btnEvent: 'sendHireRequest'}]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 删除联系人
   */
  delPerson() {
    let settings = {
      mode: '1',
      title: 'REMOVE THIS CONTACT',
      isSimpleContent: true,
      simpleContent: 'REMOVE NOTICE',
      buttons: [
        {type: 'cancel'},
        {
          btnEvent: () => {
            this.memberService.sendDeleteFriends({
              friends: [{relation: this.friendType, uid: this.currentUid}]
            });
          },
          type: 'delete'
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * 添加好友
   */
  addFriend() {
    this.currentUserInfo.user_profile_path = this.file.getImagePath(36, this.currentUserInfo.user_profile_path);
    let settings = {
      mode: '1',
      title: 'NEW CONTACT',
      isSimpleContent: false,
      componentSelector: 'new-contact',
      componentData: this.currentUserInfo,
      buttons: [{type: 'cancel'}, {btnEvent: 'sendFriendRequest'}]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 推荐好友
   */
  forwardFriend() {
    let personInfo = this.typeService.clone(this.currentUserInfo);
    personInfo.form = this.friendType;
    let settings = {
      mode: '1',
      title: 'FORWARD PERSONAL CARD',
      isSimpleContent: false,
      componentSelector: 'new-recommendation',
      componentData: personInfo,
      buttons: [{type: 'cancel'}, {btnEvent: 'sendRecFriendRequest'}]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 获取共同好友
   * @param data
   */
  initInCommon(data: any) {
    this.toggleInput = data.toggleInput;
    this.toggleSelect = data.toggleSelectElement;

    if (/[hide]$/.test(this.toggleSelect.className)) {
      this.contactModelService.getInCommon({
          uid: this.currentUid
        },
        (data: any) => {
          if (data.status === 1 && data.data.hasOwnProperty('in_common')) {
            this.inCommonList = this.typeService.bindDataList(
              ContactsList.init(), data.data['in_common']);
          } else {
            this.dialogService.openError({simpleContent:'fetch common friend failed!'});
          }
        }
      );
    }
  }

  /**
   * 关闭共同好友
   * @param event
   */
  closeCommonList(event: any) {
    event.stopPropagation();
    this.renderer.setElementClass(this.toggleInput, 'header-alarm', false);
    this.renderer.setElementClass(this.toggleSelect, 'hide', true);
    this.toggleSelectService.emptyElement();
  }

  /**
   * 切换到聊天框
   * @param event
   * @param data
   */
  friendShowChat(event: any, data: any) {
    event.stopPropagation();
    let chatData = {
      isFriend: true,
      form: data.form,
      work_name: data.work_name,
      friendType: data.form,
      uid: data.uid
    };
    //显示聊天框
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
      data: chatData
    });
  }

}
