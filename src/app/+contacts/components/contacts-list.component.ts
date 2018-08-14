import {
  Component, Input, Inject, Renderer, OnInit, ViewChild, ViewEncapsulation, AfterViewInit,
  OnDestroy, HostListener, Output, EventEmitter
} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {
  ChatModelService,
  ContactModelService,
  ContactsList,
  UserModelService
} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";
import {SearchListComponent} from "../../shared/components/search/search-list.component";

@Component({
  selector: 'contacts-list',
  templateUrl: '../template/contacts-list.component.html',
  styleUrls: ['../../../assets/css/home/contact-people-list.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ChatModelService, UserModelService]
})

export class ContactsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchComp') public searchComp: SearchListComponent;
  public showContactView: boolean;
  public searchMoentView: boolean = true;
  public internalList: any;
  public cooperatorList: any;
  public friendList: any;
  public searchMemberList: any;
  public hSettingAn: boolean = false;
  public showHContactSort: boolean = false;
  public searchValue: string = '';
  public letterArr: Array<string> = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
  private visible: Array<string> = ['No one', 'Friend', 'Business', 'All channel'];
  private butType: string = 'g-drag-type';
  public personalVisible: any;
  public resumeVisible: any;
  public companyVisible: any;
  public contactsList: any;
  private currLetter: string = '';
  private searchParam: any;
  private path: string;
  public isContacts: boolean = true;
  public gSideLeft: number;
  public uid: string;
  private retainData: any;
  private val: string;
  private retainList: string = 'retain_list';
  public contactSubscription: Subscription;
  public contactAn: boolean = false;
  public isHire: boolean = false;
  public hideHire: boolean = false;
  public hideContact: boolean = true;
  public isNotEntry: boolean = true;
  public currentUserStatusInfo: any;
  private _isOnContact: boolean = false;
  private showHireList: boolean = true;//这个是有用的
  private isPermission: boolean = true;
  private hasCompany: boolean = false;
  public setPermission_alert: any = {};
  private currentIndex: number = -1;
  private getData: any;


  @Input('isOnContact')
  public set isOnContact(data: boolean) {
    this._isOnContact = data;
  }

  public get isOnContact() {
    return this._isOnContact;
  }

  @ViewChild('settingElement') private settingElement: any;
  @ViewChild('contactInternal') private contactInternal: any;
  @ViewChild('contactCooperator') private contactCooperator: any;
  @ViewChild('contactFriend') private contactFriend: any;
  @ViewChild('hContactBox') private hContactBox: any;
  @ViewChild('showContactSe') private showContactSe: any;
  @Output('contactListReload') public outContactListReload = new EventEmitter<any>();

  constructor(private router: Router,
              public renderer: Renderer,
              private location: Location,
              private userModelService: UserModelService,
              public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('page-animation.service') public animationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {
  }

  ngAfterViewInit(): void {
    if (!this.contactSubscription) {
      this.contactSubscription = this.notificationService.getNotification().subscribe((data: any) => {
        this.dealMessage(data);
      })
    }

  }

  ngOnDestroy(): void {
    this.contactSubscription.unsubscribe();
  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:mousedown', ['$event'])
  mousedown(event: any) {
    let className: string = event.target.className;
    if (className === 'g-fixed h-contact-box h-contact-box-an') {
      this.doShowContactView();
    }
  }

  /**
   * 显示隐藏联系人列表
   * @param event
   */
  doShowContactView(event?: any) {
    if (event) {
      event.stopPropagation();
    }

    if (this.contactAn || this.hSettingAn) {
      this.doSettingBoxHide();
    } else {
      if (this.settingElement) {
        this.animationService.cssAnimate(this.settingElement.nativeElement, '', () => {
          this.renderer.setElementStyle(this.settingElement.nativeElement, 'z-index', '-1');
        });
      }
      this.showContactView = false;
      this.showHContactSort = false;

      //搜索
      this.searchMoentView = true;
      this.searchMemberList = [];
      let newSearchParam = this.typeService.clone(this.searchParam);
      if (this.searchComp) {
        this.searchComp.closeSearch();
      }
      this.searchParam = newSearchParam;
    }

  }

  //启动
  ngOnInit() {
    this.getFriendList();
    this.urlPath();
    this.showContactView = false;

    if (/^\/contacts/.test(this.path)) {
      this.isContacts = false;
      this.gSideLeft = 0;
      let sessionRetainList: any = this.userDataService.sessionGetData(this.retainList);
      this.searchMoentView = (this.typeService.getObjLength(sessionRetainList) <= 0);
    }
    this.searchListParam();
  }

  searchListParam() {
    this.searchParam = {
      val: this.val,
      interfaceType: 'contacts',
      close: false,
      data: this.userDataService.getContactList(),
      callBack: (data: any, isShow?: boolean) => {
        this.val = data && data.val ? data.val : '';
        this.searchMoentView = typeof isShow !== 'undefined' ? isShow : true;
        if (this.val !== '') {
          this.retainData = data;
          this.restContactList(this.typeService.clone(data));
        } else {
          this.restContactList(this.userDataService.getContactList());
          this.searchMemberList = [];
        }
        this.userDataService.sessionRemoveData(this.retainList);
      }
    };
  }

  /**
   * URL
   */
  urlPath() {
    this.path = this.location.path();
    let pathArr: string[] = this.path.split('/');
    this.uid = pathArr[pathArr.length - 1];
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_USER_NOTICE_RECOMMEND_ACCEPT_ADD_FRIEND:
        this.restContactList(this.userDataService.getContactList());
        break;
      case this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD:
        this.initListSettings(data.data);
        break;

      //更新搜索出来的联系人
      case this.notificationService.config.ACT_NOTIFICATION_ADD_FRIEND:
        let sessionRetainList: any = this.userDataService.sessionGetData(this.retainList);
        this.contactsList = this.userDataService.getContactList();
        if (!sessionRetainList) {
          this.restContactList(this.contactsList);
          return false
        }
        this.doLetterSearch(sessionRetainList.val);
        sessionRetainList.data.Internal = this.internalList;
        sessionRetainList.data.Friend = this.friendList;
        sessionRetainList.data.Cooperator = this.cooperatorList;
        this.userDataService.sessionSetData(this.retainList, sessionRetainList);
        break;

      //删除联系人被删除执行
      case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_DELETE_FRIEND:
        let cList: any = this.userDataService.getContactList();
        this.delStoreFriend(data.relation, data.owner, cList);
        break;

      //删除联系人执行人接收
      case this.notificationService.config.ACT_USER_NOTICE_USER_DELETE_FRIEND:
        this.userDataService.sessionRemoveData(this.retainList);
        let getData: any = data.data;
        if (getData.hasOwnProperty('friends') && (getData.sent === 1)) {
          let cList: any = this.userDataService.getContactList();
          this.delStoreFriend(getData.friends[0].relation, getData.friends[0], cList);
        }
        break;
      case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
        if (data.hasOwnProperty('data') && data.data.hasOwnProperty('friend')) {
          this.contactsList = this.userDataService.getContactList();

          let userOnlineStatus: any = data.data.friend;
          let getRetainList: any = this.userDataService.sessionGetData(this.retainList);

          this.setOnlineStatus(this.contactsList, userOnlineStatus);
          this.userDataService.setContactList(this.contactsList);

          if (getRetainList) {
            this.setOnlineStatus(getRetainList.data, userOnlineStatus);
            this.userDataService.sessionSetData(this.retainList, getRetainList);
          }

          // if(getRetainList) {
          //   this.setOnlineStatus(getRetainList.data, userOnlineStatus);
          //   this.userDataService.sessionSetData(this.retainList, getRetainList);
          //   this.restContactList(getRetainList.data, false);
          // }else {
          //   this.restContactList(this.contactsList, false);
          // }
          let memberList: any = {
            internalList: this.internalList,
            cooperatorList: this.cooperatorList,
            friendList: this.friendList
          };
          this.setOnlineStatus(memberList, userOnlineStatus);
        }

        break;
      //接受好友请求
      case this.notificationService.config.ACT_USER_NOTICE_ACCEPT_ADD_FRIEND:
        let getRetainList: any = this.userDataService.sessionGetData(this.retainList);
        this.getData = data;
        if(this.searchMemberList){
          for (let i = 0; i < this.searchMemberList.length; i++) {
            if(this.searchMemberList[i].uid == data.data.owner.uuid){
              this.searchMemberList[i].is_friend = 1;
              getRetainList.data.searchMemberList = this.searchMemberList;
              this.userDataService.sessionSetData(this.retainList, getRetainList);
            }
        }
    }
        break;
    }
  }

  setOnlineStatus(data: any, friendData: any) {
    for (let key in data) {
      if (key === 'isShow' || key === 'val') continue;
      for (let k in data[key]) {
        if (k === 'searchMemberList') continue;
        if (data[key][k].uid === friendData.psid || data[key][k].uid === friendData.uuid) {
          data[key][k].online = friendData.online;
        }
      }
    }
  }

  /**
   * 删除本地好友
   * @param relation
   * @param owner
   * @param cList
   */
  delStoreFriend(relation: number, owner: any, cList: any) {
    for (let list in cList) {
      for (let key in cList[list]) {
        if ((relation === 2 && list === 'Cooperator' && (cList[list][key].uid === owner.psid)) ||
          relation === 2 && list === 'Cooperator' && (cList[list][key].uid === owner.uid)) {
          cList[list].splice(parseInt(key), 1);
          this.initListSettings(cList);
          break;
        }
        if (relation === 1 && list === 'Friend' && (cList[list][key].uid === owner.uuid) ||
          relation === 1 && list === 'Friend' && (cList[list][key].uid === owner.uid)) {
          cList[list].splice(parseInt(key), 1);
          this.initListSettings(cList);
          break;
        }
      }
    }
  }

  /**
   * 保留搜索列表
   * @param data
   * @param isBool
   */
  restContactList(data: any, isBool: boolean = true) {
    if (data) {
      this.internalList = data.Internal;
      this.cooperatorList = data.Cooperator;
      this.friendList = data.Friend;
      if (isBool) {
        this.searchMemberList = data.searchMemberList ? data.searchMemberList : [];
      }
    }
  }

  /**
   * 跳转到general页
   * @param member
   * @param event
   * @param str
   */
  contactRouter(member: any, event: any, str?: string, user?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.uid = member.uid;
    if (this.retainData && this.val) {
      let sessionRetainData: any = {
        val: this.val,
        data: this.retainData
      };
      this.userDataService.sessionSetData(this.retainList, sessionRetainData);
    }

    if (str === 'result') {
      this.userDataService.sessionSetData('result_member', member);
    } else {
      this.userDataService.sessionRemoveData('result_member');
    }

    //  psid 跳转到contact/intro
    //  uuid 跳转到contact/general
    let redirectUrl = '/contacts/info/general';
    // if (this.typeService.isNumber(this.uid)) {
    //   redirectUrl = '/contacts/intro'
    // }
    if (user) {
      let routerObj: any = {queryParams: {uuid: user.uid}};
      this.router.navigate([redirectUrl, this.uid], routerObj);
    } else {
      this.router.navigate([redirectUrl, this.uid]);
    }
  }

  initSelectedElement() {
    setTimeout(() => {
      this.initData();
    }, 20)
  }

  /**
   * 切换到聊天框
   * @param form
   * @param data
   * @param event
   */
  showChat(form: number, data: any, event: any) {
    event.stopPropagation();
    let chatData = {
      isFriend: true,
      form: form,
      work_name: data.work_name,
      friendType: data.type,
      uid: data.uid
    };
    //显示聊天框
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE,
      data: chatData
    });
  }

  /**
   * 获取好友列表
   */
  public getFriendList() {
    let getRetainList: any = this.userDataService.sessionGetData(this.retainList);
    this.val = getRetainList ? getRetainList.val : '';
    if (getRetainList) {
      this.restContactList(getRetainList.data);
      // 通知首页其他模块contact list加载完毕
      this.outContactListReload.emit();
      this.searchListParam();
    } else {
      this.contactsList = this.userDataService.getContactList();
      if (this.contactsList) {
        this.initListSettings(this.contactsList);
        this.outContactListReload.emit();
      } else {
        this.contactModelService.getContactList(
          {form: 0, group: 0},
          (data: any) => {
            if (data.status === 1) {
              this.initListSettings(data.data.staff);
              // 通知首页其他模块contact list加载完毕
              this.outContactListReload.emit();
              this.searchListParam();
            } else if (data.status === 0) {
              this.dialogService.openError({simpleContent: 'fetch friend list failed!'});
            }
          }
        );
      }
    }
  }

  initListSettings(data: any) {
    this.internalList = data.hasOwnProperty('Internal') ? this.typeService.bindDataList(ContactsList.init(), data.Internal) : [];
    this.friendList = data.hasOwnProperty('Friend') ? this.typeService.bindDataList(ContactsList.init(), data.Friend) : [];
    this.cooperatorList = data.hasOwnProperty('Cooperator') ? this.typeService.bindDataList(ContactsList.init(), data.Cooperator) : [];

    this.contactsList = {
      Internal: this.internalList,
      Cooperator: this.cooperatorList,
      Friend: this.friendList
    };

    //设置本地缓存联系人列表缓存数据
    this.userDataService.setContactList(this.contactsList);
  }

  isShowContactView() {
    this.showContactView = true;
    this.showHContactSort = true;
    this.getFriendList();
  }

  /**
   * 关闭联系人列表
   */
  setContactList() {
    this.showContactView = false;
  }

  /**
   * 收缩联系人
   * @param el
   * @param event
   */
  hContactPeopleShow(el: any, event: any) {
    if (this.element.hasClass(event, 'h-contact-list-rotate')) {
      this.renderer.setElementStyle(el, 'height', 'auto');
      this.element.setClass(event, '', 'h-contact-list-rotate');
    } else {
      this.renderer.setElementStyle(el, 'height', '15px');
      this.element.setClass(event, 'h-contact-list-rotate');
    }

  }

  /**
   * 显示个人setting
   */
  doSettingBoxShow() {
    if (!this.isContacts) {
      this.contactAn = true;
    } else {
      this.hSettingAn = true;
    }
    if (this.isPermission) {
      this.getPermission();
      this.isPermission = false;
    }
  }

  /**
   * 隐藏个人setting
   */
  doSettingBoxHide() {
    if (!this.isContacts) {
      this.contactAn = false;
    } else {
      this.hSettingAn = false;
    }
    this.isPermission = true;
  }

  /**
   * 索引首字母的人
   * @param letter
   * @param index
   */
  doLetterSearch(letter?: string, index?: number) {
    if (letter && (this.currLetter === letter)) {
      this.friendList = this.contactsList.Friend;
      this.internalList = this.contactsList.Internal;
      this.cooperatorList = this.contactsList.Cooperator;
      this.currLetter = '';
    } else {
      //friend
      this.friendList = this.typeService.regExpList(this.contactsList.Friend, letter, '', true);
      //internal
      this.internalList = this.typeService.regExpList(this.contactsList.Internal, letter, '', true);
      //Cooperator
      this.cooperatorList = this.typeService.regExpList(this.contactsList.Cooperator, letter, '', true);
      this.currLetter = letter;
    }
  }

  /**
   * 获取公司列表
   * @param event
   * @param member
   * @param searchElement
   * @param searchSelect
   */
  getUserCompanyList(event: any, member: any, searchElement: any, searchSelect: any) {
    event.stopPropagation();
    if (this.element.hasClass(searchElement, 'h-search-list-selected')) {
      this.element.setClass(searchElement, '', 'h-search-list-selected');
      this.element.setClass(searchSelect, 'hide', '');
    } else {
      this.element.setClass(searchElement, 'h-search-list-selected', '');
      this.element.setClass(searchSelect, '', 'hide');
      this.getCurrentUserCompany(member.uid, (data: any) => {
        member.company_list = data && data.length ? data : [];
        let storeRetainList: any = this.userDataService.sessionGetData(this.retainList);
        let searchList: any;
        if (storeRetainList) {
          searchList = storeRetainList.data.searchMemberList;
        } else {
          storeRetainList = {
            val: this.retainData.val,
            data: {
              Internal: this.retainData.Internal,
              Cooperator: this.retainData.Cooperator,
              Friend: this.retainData.Friend,
              isShow: this.retainData.isShow,
              val: this.retainData.val,
              searchMemberList: this.retainData.searchMemberList
            }
          };
          searchList = this.retainData.searchMemberList;
        }
        for (let key in searchList) {
          if (searchList[key].uid === member.uid) {
            searchList[key].company_list = data;
            break;
          }
        }
        this.userDataService.sessionSetData(this.retainList, storeRetainList);
      })
    }
    this.initData();
  }

  /**
   * 获取当前用户公司列表
   * @param uid
   * @param callBack
   */
  getCurrentUserCompany(uid: string, callBack: any) {
    this.contactModelService.fetchUserCompany({uid: uid}, (response: any) => {
      if (response.status === 1) {
        if (callBack) {
          callBack(response.data);
        }
      } else {
        this.dialogService.openError({simpleContent: 'Failed to get the company list!'});
      }
    })
  }

  //初始化contacts list
  initData() {
    this.urlPath();
    if (!this.uid) {
      return;
    }
    if (!this.searchMemberList) {
      let storeSearchList: any = this.userDataService.sessionGetData(this.retainList);
      if (storeSearchList) {
        this.searchMemberList = storeSearchList.data.searchMemberList;
      }
    }
    for (let list in this.searchMemberList) {
      this.searchMemberList[list].isActive = false;
      if (this.searchMemberList[list].hasOwnProperty('company_list')) {
        let companyList: any = this.searchMemberList[list].company_list;
        for (let key in companyList) {
          if (companyList[key].uid === this.uid) {
            this.searchMemberList[list].isCurrent = true;
            this.searchMemberList[list].isActive = true;
            break;
          }
        }
      }
    }
  }

  /**
   * 显示未招聘列表
   * @param isBool
   */
  toggleHireContact(isBool: boolean) {
    setTimeout(() => {
      this.hideContact = isBool;
    }, 200);
    this.hideHire = isBool;
    this.isHire = isBool;
    this.isNotEntry = isBool;

    this.currentUserStatusInfo = {
      showContactView: this.showContactView,
      isOnContact: this.isOnContact
    };
  }

  /**
   * 显示联系人列表
   * @param isBool
   */
  showContactList(isBool: boolean) {
    this.hideContact = !isBool;
    setTimeout(() => {
      this.isHire = isBool;
    }, 50);

    setTimeout(() => {
      this.hideHire = isBool;
    }, 200);
  }

  /**
   * 获取用户权限
   */
  getPermission() {
    this.userModelService.getPermission((data: any) => {
      let visible: any = data.data;
      if (data.status === 1) {
        this.initPermission({
          personal: visible.personal_info + 1,
          resume: visible.resume + 1,
          company: visible.company_info + 1
        });
      }
    });
  }

  /**
   * 设置用户权限返回数据
   * @param data
   */
  getUserPermission(data: any) {

    //请求更改权限的参数
    let permParam: any = {
      personal_info: this.personalVisible.perm - 1,
      resume: this.resumeVisible.perm - 1,
      company_info: this.companyVisible.perm - 1
    };

    //根据 data 中 type 判断设置的是哪个权限
    switch (data.type) {
      case 'company':
        permParam.company_info = data.currPerm - 1;
        this.companyVisible.perm = data.currPerm;
        break;
      case 'resume':
        permParam.resume = data.currPerm - 1;
        this.resumeVisible.perm = data.currPerm;
        break;
      case 'personal':
        permParam.personal_info = data.currPerm - 1;
        this.personalVisible.perm = data.currPerm;
        break;
    }

    //更新权限值
    this.userModelService.setPermission({data: permParam}, (data: any) => {
      //更改失败弹出错误信息
      if (data.status === 1) {
        this.setPermission_alert.show = true;
        this.setPermission_alert.text = 'Set up success.';
        this.setPermission_alert.success = true;
      } else {
        this.setPermission_alert.show = true;
        this.setPermission_alert.text = data.message;
        this.setPermission_alert.success = false;
      }

      let timer = setTimeout(() => {
        this.setPermission_alert.show = false;
        clearTimeout(timer);
        timer = null;
      }, 500)
    });
  }

  /**
   * 默认权限
   */
  defaultPermission() {
    this.userModelService.defaultSetPermission((data: any) => {
      if (data.status === 1) {
        this.initPermission({personal: 4, resume: 3, company: 3});
      }
    })
  }

  /**
   * 设置permission值
   * @param data
   */
  initPermission(data: any) {
    //是否有公司
    this.hasCompany = this.companyDataService.getLocationCompanyIn().cid !== '';

    this.personalVisible = {
      data: this.visible,
      butType: this.butType,
      perm: data.personal,
      type: 'personal'
    };
    this.resumeVisible = {
      data: this.visible,
      butType: this.butType,
      perm: data.resume,
      type: 'resume'
    };
    this.companyVisible = {
      data: this.visible,
      butType: this.butType,
      perm: data.company,
      type: 'company'
    };
  }

  /**
   * 添加好友
   */
  addFriend(data: any, index: number) {
    if (data.hasOwnProperty('is_friend')) {
      this.currentIndex = index;
      data.relationship = {};
      data.relationship.inContactList = data.is_friend;
      let settings = {
        mode: '1',
        title: 'NEW CONTACT',
        isSimpleContent: false,
        componentSelector: 'new-contact',
        componentData: data,
        buttons: [{type: 'cancel'}, {btnEvent: 'sendFriendRequest'}]
      };
      this.dialogService.openNew(settings);
    }
  }
}
