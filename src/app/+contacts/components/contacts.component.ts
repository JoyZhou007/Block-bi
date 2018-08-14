import {Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewChecked} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ContactModelService} from '../../shared/services/index.service';
import {ContactsHeaderComponent} from "./contacts-header.component";
import {ContactsListComponent} from "./contacts-list.component";
import {ContactsMemberComponent} from "./contacts-member.component";


@Component({
  selector: 'personal-skill',
  templateUrl: '../template/contacts.component.html',
  styleUrls: ['../../../assets/css/contacts/contacts.css'],
  encapsulation: ViewEncapsulation.None
})

export class ContactsComponent implements OnInit {
  public type: string = '';
  public uid: any;
  private contactList: any;
  public currentUserInfo: any;

  // 好友关系，由access权限接口初始化
  public relation: {company: number, person: number};
  public isFriend: boolean = true;

  @ViewChild('contactsHeader') public contactsHeader: ContactsHeaderComponent;
  @ViewChild('contactList') public contactListElement: ContactsListComponent;
  @ViewChild('contactsMemberComponent') public contactsMemberComponent: ContactsMemberComponent;

  constructor(public activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              @Inject('file.service') public file: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.hasOwnProperty('type') && params.hasOwnProperty('uid')) {
        // 切换查看人信息时候，需要初始化所有相关数据
        this.type = params.type;
        if (this.uid !== params.uid) {
          this.uid = params.uid;
          if (this.contactsHeader) {
            delete this.contactsHeader.inCommonList;
          }

          this.initUserData();
          //
          this.contactListElement.showContactView = false;
          this.contactListElement.initSelectedElement();
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'You have an error, please try later'})
      }
    });
  }

  /**
   * 子component初始化完毕
   */
  hasInit() {
  }

  /**
   * 获取用户访问权限
   */
  getAuthorizationAccessInfo(uid: any, callback?: Function) {
    let tmp = [];
    // 如果是psid 只显示公司相关信息
    if (this.typeService.isNumber(uid)) {
      tmp = [
        {
          key: 'general',
          api: 'general',
          title: this.translateService.lan == 'zh-cn'? '通用信息' : 'General',
          access: true
        },
        {
          key: 'intro',
          api: 'introduction',
          title: this.translateService.lan == 'zh-cn'? '公司信息' : 'Business information',
          access: true
        },
        {
          key: 'company-analysis',
          api: 'company_analysis',
          title: this.translateService.lan == 'zh-cn'? '公司情况分析' : 'Business analysis',
          access: true
        },
      ];
    } else {
      //如果是uuid 显示个人相关
      tmp = [
        {
          key: 'general',
          api: 'general',
          title: this.translateService.manualTranslate('General'),
          access: true
        },
        {
          key: 'resume',
          api: 'resume',
          title: this.translateService.manualTranslate('Resume'),
          access: true
        },
        {
          key: 'ability',
          api: 'analysis',
          title: this.translateService.manualTranslate('Analysis'),
          access: true
        }
      ];
    }

    this.contactModelService.authorizationAccessInfo({data: {uid: uid}}, (data: any) => {
      if (data.status === 1) {
        if (data.data) {
          if (this.contactsHeader) {
            let newMenuArr = [];
            if (data.data) {
              this.contactsHeader.couldHire = (data.data.hasOwnProperty('hired') && data.data.hired === 1);
              this.relation = data.data.hasOwnProperty('relation') ? data.data.relation : {company: 0, person: 0};
              //TODO no access 页面
              for (let i = 0; i < tmp.length; i++) {
                let search = tmp[i].api;
                if (data.data[search] != 1) {
                  tmp[i].access = false;
                }
                newMenuArr.push(tmp[i]);
              }
              if (callback) {
                callback();
              }
              this.contactsHeader.menuArr = newMenuArr;
            }
          }
        }
      }
    });
  }

  /**
   * 防止contact list本地缓存失效
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {
          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff ? response.data.staff : []
          });
          this.contactList = response.data.staff ? response.data.staff : [];
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  initUserData() {
    //初始化权限
    this.getAuthorizationAccessInfo(this.uid, () => {
      this.contactList = this.userDataService.getContactList();
      if (!this.contactList) {
        this.getContactList(() => {
          this.initUserInfo();
        })
      } else {
        this.initUserInfo();
      }
    });
  }

  /**
   * 初始化好友关系
   * @return
   * {
      inContactList: boolean,
      friendGroup: string,
      friendObj: any,
      company: boolean,
      person: boolean
      uuid: string
     }
   */
  initRelationship() {
    if (!this.contactList || !this.uid) {
      return;
    }
    let friendObjInContactList: any;
    let friendGroup: string = '';
    searchFriend:
      for (let key in this.contactList) {
        if (this.contactList.hasOwnProperty(key)) {
          for (let k in this.contactList[key]) {
            if (this.contactList[key].hasOwnProperty(k)) {
              if (
                (this.contactList[key][k].uid === this.uid) ||
                (this.contactList[key][k].psid === this.uid) ||
                (this.contactList[key][k].uuid === this.uid)
              ) {
                friendObjInContactList = this.contactList[key][k];
                friendGroup = key;
                break searchFriend;
              }
            }
          }
        }
      }
    let couldAddPrivateFriend: boolean = false;
    let couldAddBusinessFriend: boolean = false;
    // 根据当前uid是psid或uuid初始化不同的数据
    if (this.typeService.isNumber(this.uid)) {
      // 如果是psid 分为两种情况
      if (typeof friendObjInContactList !== 'undefined') {
        // 如果psid在好友列表里，只查看this.relation中是否可以加私人好友
        couldAddPrivateFriend = this.relation.person !== 0;
        couldAddBusinessFriend = false;
      } else {
        // 如果不在好友列表，代表是搜索结果或者URL直接跳转, 只允许加公司好友
        couldAddBusinessFriend = this.relation.company !== 0;
        couldAddPrivateFriend = false;
      }
    } else {
      // uuid 只查看是否能加私人好友
      couldAddPrivateFriend = this.relation.person !== 0;
      couldAddBusinessFriend = false;
    }
    return {
      inContactList: typeof friendObjInContactList !== 'undefined',
      friendGroup: friendGroup,
      friendObj: friendObjInContactList,
      company: couldAddBusinessFriend,
      person: couldAddPrivateFriend,
      personUuid: couldAddPrivateFriend ? this.relation.person : ''
    };

  }

  /**
   * 确认当前好友是否是好友，以及初始化一些基本信息
   */
  protected initUserInfo() {
    let relationship = this.initRelationship();
    // 查看分组信息
    let currFriendObj: any = relationship.friendObj;
    if (relationship.inContactList) {
      this.currentUserInfo = {
        relationship: relationship,
        work_name: currFriendObj.work_name,
        p_name: currFriendObj.p_name,
        company_name: currFriendObj.company_name,
        user_profile_path: currFriendObj.user_profile_path ? this.file.getImagePath(380, currFriendObj.user_profile_path) : '',
        uid: this.uid
      };
    } else {
      this.contactModelService.userInfo({uid: this.uid}, (data: any) => {
        if (data.status === 1) {
          let info: any = data.data;
          this.currentUserInfo = {
            relationship: relationship,
            work_name: info.work_name,
            p_name: info.position ? info.position : '',
            company_name: info.company_name ? info.company_name : '',
            user_profile_path: info.user_profile_path ? this.file.getImagePath(380, info.user_profile_path) : '',
            uid: this.uid
          };
        }
      })
    }
  }


}
