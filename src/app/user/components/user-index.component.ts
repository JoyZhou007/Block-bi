import {
  Component, HostListener, OnInit, Inject, ViewChild, ViewEncapsulation, Renderer,
  ElementRef, AfterViewInit, OnDestroy, ViewChildren, QueryList
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserModelService} from '../../shared/services/index.service';
import {DateService} from "../../shared/services/common/data/date.service";
import {MissionModelService} from "../../shared/services/model/mission-model.service";
import {Subscription} from "rxjs/Subscription";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {CompanyModelService} from "../../shared/services/model/company-model.service";
import {NgForm} from "@angular/forms";
import * as UserPermission from "../../shared/config/user.config"
import {UserNavComponent} from "./user-nav.component";
import {document} from "@angular/platform-browser/src/facade/browser";
import {TipsComponent} from "../../tips/components/tips.component";

let introInit = require('intro.js');

@Component({
  selector: 'user-index',
  templateUrl: '../template/user-index.component.html',
  styleUrls: ['../../../assets/css/home/home.css'],
  // styles: ['.step_data{ padding: 40px;} #step_1{background-color: white;} #step_2{background-color: lightpink;}'],
  encapsulation: ViewEncapsulation.None,
  providers: [UserModelService]
})


export class UserIndexComponent implements OnInit, AfterViewInit, OnDestroy {


  //页面交互
  public userLoginData: any;
  public showCreateCompany: boolean = false;

  public allCompanyList: any = [];
  public defaultCompany: any = {};
  public companyLength: number;
  public userProfilePath: string = '';

  //记录用户时候是否打开contact list

  //calendar repeat
  public isShowCalendarRepeat: boolean = false;

  public isShowRepeatSelect: boolean = false;
  public fixData: any = {};
  public currentPosition: string = 'default position';
  public currentName: string;
  public currentEmail: string;
  public isShowBusiness: boolean = false;
  public businessFadeIn: boolean = false;
  public businessFadeOut: boolean = false;
  public businessZIndex: boolean = false;
  public isShowGlobalSearchResult: boolean = false;
  public pending: string = 'pending';


  //导航栏
  @ViewChild('userNav') public userNav: UserNavComponent;
  @ViewChild('userNav1') public userNav1: any;
  //currentContact
  @ViewChild('contactList') public contactList: any;
  @ViewChild('userNotification') public userNotification: any;
  @ViewChild('tips') public tipsComponent: TipsComponent;
  @ViewChild('tips1') public tips1: any;

  public subscription: Subscription;
  private searchData: any = {};

  public showResetPwd: boolean = false;

  //account 表单
  public user: {
    oldPassword: string,
    password: string,
    confirmPassword: string
  } = {
    oldPassword: '',
    password: '',
    confirmPassword: '',
  };

  public errorText: string = '';

  //显示错误消息
  public confirmPassword_error: any = {};
  public password_error: any = {};
  public oldPassword_error: any = {};
  public unVerifiedCompanyList: Array<any> = [];
  public couldLoadTips: boolean = false;
  public isShowApplication: boolean = false;
  //显示reset account dialog
  public showResetAccount: boolean = false;
  //切换到email
  public showEmail: boolean = false;

  public accountUser: {
    phone: string,
    email: string,
  } = {
    phone: '',
    email: ''
  };
  public account_error: any = {};
  //显示auth code 输入框
  public showAutoCodeIpt: boolean = false;

  public currentTab: number = 0;

  @ViewChild('authCodeForm') authCodeForm: NgForm;
  @ViewChild('userInfo') userInfo: any;
  @ViewChild('userInfoTop') userInfoTop: any;
  public showAuthCodeUploadBtn: boolean = false;

  public tplAuthCodeList: Array<any> = ['', '', '', '', '', ''];
  @ViewChildren('codeInput') codeInput: QueryList<ElementRef>;
  public authCodeLength: number = 0;
  public authCode_error: any = {};
  //auth code 计时器
  public authCodeTimer: number = 0;
  public account_email_error: any = {};
  public accountEmailTimer: number = 0;
  public hasSendEmail: boolean = false;
  public hasSendPhone: boolean = false;
  //重置email 提交后的信息
  public emailAlert: any = {};
  public phoneAlert: any = {};
  // email auth code 提交后的信息
  public emailCodeAlert: any = {};
  public hasSetAccount: boolean = false;
  public hasSetPwd: boolean = false;
  public phoneCodeAlert: any = {};
  // 权限相关
  public accessInit: boolean = false;
  public accessArr: {
    is_main_admin: boolean, // 1
    space: boolean, // 10
    workflow: boolean, // 3,2
    structure: boolean, // 4,1
    staff_manager: boolean, // 5,1
    meeting_room: boolean, // 7,1
    attendance: boolean, // 9,6
    vacation: boolean, // 8,6
  } = {
    is_main_admin: false,
    workflow: false,
    structure: false,
    staff_manager: false,
    meeting_room: false,
    attendance: false,
    vacation: false,
    space: false
  };
  public permConst = UserPermission;
  public isSuperAdmin: boolean = false;
  private isHelpModule: boolean = false;


  constructor(public router: Router,
              public renderer: Renderer,
              private ele: ElementRef,
              private activatedRoute: ActivatedRoute,
              public userModelService: UserModelService,
              public missionModelService: MissionModelService,
              public contactModelService: ContactModelService,
              public chatModelService: ChatModelService,
              public companyModelService: CompanyModelService,
              @Inject('page.element') public element: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('page-animation.service') public animationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public IMService: any,
              @Inject('chat-message-data.service') public chatMessageDataService: any,
              @Inject('notification-offLine-message.service') public notificationOffLineMessageService: any) {
    this.ele.nativeElement.addEventListener('click', (evt: any) => {
      // toggle user nav event
      if (this.userNav && this.userNav.navSearMouseClick) {
        this.userNav.navSearchClose();
      }
      if (this.tipsComponent && this.tipsComponent.isShowCalendarRepeat) {
        //隐藏repeat
        this.tipsComponent.isShowCalendarRepeat = false;
        this.tipsComponent.clearAlarmIcon();
      }
    })
  }

  //启动
  ngOnInit() {
    this.userLoginData = this.userDataService.getUserIn();
    this.allCompanyList = this.companyDataService.getAllCompany();
    this.defaultCompany = this.companyDataService.getLocationCompanyIn();
    this.companyLength = this.typeService.getDataLength(this.allCompanyList);
    this.currentName = this.userDataService.getCurrentUserName();
    this.currentEmail = this.userDataService.getCurrentUserEmail();
    this.userProfilePath = this.config.resourceDomain + this.userDataService.getCurrentProfilePath(80);
    this.currentPosition = this.companyDataService.getCurrentCompanyPositionName();
    // 初始化权限
    this.initAccess();

    //获取公司类型
    this.getCompanyTypeName();
    this.getHelpRecorder();

    this.activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        if (queryParam.hasOwnProperty('openAccount')) {
          if (queryParam.openAccount == 1) {
            this.clickShowGeneralAccount();
          } else {
            this.dialogService.openError({
              simpleContent: 'bind failed.'
            })
          }

        }
      }
    );
  }

  /**
   * 重新获取 公司列表
   */
  getCompanyList() {
    this.allCompanyList = this.companyDataService.getAllCompany();
    this.defaultCompany = this.companyDataService.getLocationCompanyIn();
    this.currentPosition = this.companyDataService.getCurrentCompanyPositionName();
  }

  initAccess() {
    this.accessInit = true;
    // CEO
    this.isSuperAdmin = this.companyDataService.checkIsSuperAdmin();
    if (this.isSuperAdmin) {
      for (let k in this.accessArr) {
        this.accessArr[k] = true;
      }

    } else {
      /**
       is_main_admin: boolean, // 1
       space: boolean, // 10
       workflow: boolean, // 3,2
       structure: boolean, // 4,1
       staff_manager: boolean, // 5,1
       meeting_room: boolean, // 7,1
       attendance: boolean, // 9,6
       vacation: boolean, // 8,6
       */
      let permArr = !this.companyDataService.getCurrentPermission() ? [] : this.companyDataService.getCurrentPermission();
      // 1
      if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN.toString()) > -1) {
        this.accessArr.is_main_admin = true;
        this.accessArr.structure = true;
        this.accessArr.staff_manager = true;
        this.accessArr.meeting_room = true;
      } else {
        // 4
        if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_STRUCTURE_EDITOR.toString()) > -1) {
          this.accessArr.structure = true;
        }
        // 5
        if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_STAFF_MANAGER.toString()) > -1) {
          this.accessArr.staff_manager = true;
        }
        // 7
        if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_RESERVATION.toString()) > -1) {
          this.accessArr.meeting_room = true;
        }
        // 6
        if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_HR.toString()) > -1) {
          this.accessArr.vacation = true;
          this.accessArr.attendance = true;
        } else {
          // 8
          if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_HR_VACATIONER.toString()) > -1) {
            this.accessArr.vacation = true;
          }
          // 9
          if (permArr.indexOf(UserPermission.ROLE_MAIN_ADMIN_HR_ATTENDANCER.toString()) > -1) {
            this.accessArr.attendance = true;
          }
        }
      }
      // 10
      if (permArr.indexOf(UserPermission.ROLE_SYSTEM_ADMIN.toString()) > -1) {
        this.accessArr.space = true;
      }
      // 2, 3
      if (permArr.indexOf(UserPermission.ROLE_WORKFLOWER_COMPANY.toString()) > -1
        || permArr.indexOf(UserPermission.ROLE_WORKFLOWER_COMPANY_DEPT.toString()) > -1) {
        this.accessArr.workflow = true;
      }
    }
    if (this.accessArr.staff_manager) {
      this.contactList.showHireList = true;
    } else {
      this.contactList.showHireList = false;
    }
  }


  ngAfterViewInit(): void {
    //接收消息
    if (!this.subscription) {
      this.subscription = this.notificationService.getNotification().subscribe(
        (message: any) => {
          this.dealMessage(message);
        });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER:
        this.allCompanyList = this.companyDataService.getAllCompany();
        this.defaultCompany = this.companyDataService.getLocationCompanyIn();
        break;
      case this.notificationService.config.ACT_COMPONENT_USER_ACCOUNT_RESET_PWD:
        this.showResetPwd = true;
        break;
      case this.notificationService.config.ACT_COMPONENT_USER_ACCOUNT_RESET_ACCOUNT:
        this.showResetAccount = true;

        break;
      case this.notificationService.config.ACT_COMPONENT_REFRESH_COMPANY:
        this.allCompanyList = this.companyDataService.getAllCompany();
        this.defaultCompany = this.companyDataService.getLocationCompanyIn();
        break;
      case this.notificationService.config.ACT_COMPONENT_REFRESH_POSITION_NAME:
        this.currentPosition = this.companyDataService.getCurrentCompanyPositionName();
        break;
      default:
        break;
    }
  }

  loadTips() {
    this.couldLoadTips = true;
  }

  /**
   * 隐藏弹出框
   * @param event
   */
  @HostListener('document:mousedown', ['$event'])
  mousedown(event: any) {
    let className: string = event.target.className;
    if (/h-contact-box-an/.test(className)) {
      //this.userNotification.hideElement();
    }
  }

  switchLanguage(event: any, lan: string) {
    event.stopPropagation();
    if (lan == 'zh-cn') {
      this.tipsComponent.isZhLan = true;
    } else {
      this.tipsComponent.isZhLan = false;
    }
    this.translate.switchLan(lan);
  }

  /**
   * 获取公司类型名称
   */
  public getCompanyTypeName() {
    this.showCreateCompany = this.companyLength > 0;
  }

  /**
   * 阻止事件传输
   * @param event
   */
  stopPropa(event: any) {
    event.stopPropagation();
  }

  /**
   * 公司选择
   * @param event
   * @param i
   */
  updateDefaultCompany(event: any, i: number) {
    event.stopPropagation();
    if (this.defaultCompany.cid !== this.allCompanyList[i].cid) {
      let oldPsId = this.defaultCompany.psid;

      //当前所在公司职位名
      this.userModelService.switchCompany({cid: this.allCompanyList[i].cid}, (result: any) => {
        if (result && result.status === 1) {
          // 设置公司信息
          // 搜索缓存
          //this.userDataService.sessionRemoveData(this.contactList.retainList);
          this.allCompanyList[i] = result.data;
          let newPsId = this.allCompanyList[i].psid;
          // 离线消息
          this.notificationOffLineMessageService.getAllNotification();

          // 刷新公司信息缓存
          this.companyDataService.setAllCompany(this.allCompanyList, false);
          this.companyDataService.setLocationCompanyIn(this.allCompanyList[i]);
          this.defaultCompany = this.companyDataService.getLocationCompanyIn();
          this.currentPosition = this.companyDataService.getCurrentCompanyPositionName();
          // 权限刷新
          this.initAccess();
          // 重新获取contact list
          this.userDataService.removeContactList();
          // 重置聊天菜单
          this.chatMessageDataService.removeChatListCache();
          //通知IM做公司切换
          this.IMService.switchCompany({
            psid: newPsId,
            original_psid: oldPsId
          });
          // 刷新联系人列表，刷新聊天列表
          this.contactModelService.getContactList(
            {form: 0, group: 0},
            (response: any) => {
              if (response.status === 1) {
                //刷新聊天列表
                this.chatModelService.getGroupList((data: any) => {
                  //获取成功
                  if (data.status === 1) {
                    this.messageDataService.setChatHasLoaded(true);
                    this.messageDataService.setChatListCache(data.data);
                    this.notificationService.postNotification({
                      act: this.notificationService.config.ACT_COMPONENT_CHAT_MENU_RELOAD
                    });
                    //设置本地缓存联系人列表缓存数据
                    this.notificationService.postNotification({
                      act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
                      data: response.data.staff
                    });
                    this.notificationService.postNotification({
                      act: this.notificationService.config.ACT_COMPONENT_TIPS_RELOAD,
                      data: response.data.staff
                    });
                  } else {
                    this.messageDataService.setChatHasLoaded(false);
                  }
                });
              }
            }
          );
        } else {
          this.dialogService.openError({
            simpleContent: 'System Error, please try later'
          });
        }
      });
    }
  }

  //显示个人联系人列表
  public showContactList(isShow?: boolean) {
    //关闭notification
    this.userNotification.closeNotification();
    this.contactList.isShowContactView();
  }

  //显示通知信息
  public loadUserNotification(isShow: boolean) {
    this.userNotification.doLoadUserNotification(isShow);
  }

  /**
   * 跳转到公司页
   */
  public showCompanyBox() {
    let access = this.companyLength > 0;
    if (!access) {
      return false;
    }
    this.router.navigate(['company', 'introduction']);
  }

  /**
   * 自己交互事件
   */
  doUserIndexEvent(events: any) {
    //关闭联系人列表
    this.contactList.setContactList();
    if (events) {
      for (let eventName in events) {
        if (typeof (<any>this)[eventName] === 'function') {
          (<any>this)[eventName](events[eventName]);
        } else {
          switch (eventName) {
            default:
              break;
          }
        }
      }
    }
  }

  /**
   * 跳转到Structure页面
   */
  jumpToStructure() {
    let access = this.isSuperAdmin || this.accessArr.structure;
    if (!access) {
      return false;
    }
    this.router.navigate(['structure', this.defaultCompany.cid]);
  }

  /**
   * 跳转到Workflow页面
   */
  jumpToWorkflow() {
    //是超级管理员 或者 有公司/部门workflow权限
    let access = this.isSuperAdmin || this.accessArr.workflow;
    if (!access) {
      return false;
    }
    this.router.navigate(['workflow']);
  }

  /**
   * 用户登出
   */
  userLogout() {
    this.router.navigate(['/user/logout']);
  }


  openTipsDialog(event: any): void {
    this.tipsComponent.openTipsDialog(event);
  }

  /**
   * 查看business list
   * @param event
   */
  viewBusinessList(event) {
    this.companyModelService.getUnReviewCompanyList((response: any) => {
      if (response.status === 1) {
        if (this.typeService.getObjLength(response.data) > 0) {
          this.unVerifiedCompanyList = response.data;
        } else {
          this.unVerifiedCompanyList = [];
        }
      } else {
        this.dialogService.openError({simpleContent: 'Failed to get unlisted company list'});
      }
    });
    this.isShowBusiness = !this.isShowBusiness;
    this.businessZIndex = true;
    this.businessFadeIn = true;
  }

  /**
   * 隱藏 business list
   * @param event
   * @param businessWarp
   */
  hideBusinessList(event: any, businessWarp: any) {
    event.stopPropagation();

    //隱藏business list
    this.businessFadeIn = false;
    this.animationService.cssAnimate(businessWarp, '', () => {
      this.businessZIndex = false;
      this.isShowBusiness = false;
    });
  }

  /**
   * 全局搜索
   */
  doShowSearchResult(data) {
    // this.searchData = this.typeService.clone(data);
    let searchData = {
      searchKeyWords: data[1],
      searchType: data[2]
    };
    this.searchData = this.typeService.clone(searchData);
    let searchKeyWords = data[1];
    if (searchKeyWords && searchKeyWords.length >= 3) {
      this.isShowGlobalSearchResult = true;
    } else {
      this.isShowGlobalSearchResult = false;
    }
  }

  /**
   * 关闭搜索界面
   */
  doCloseSearchTab() {
    this.isShowGlobalSearchResult = false;
    this.userNav.searchInput.nativeElement.value = '';
    this.userNav.navSearMouseClick = false;
  }

  /**
   * 显示/隐藏application
   */
  doShowApplication(event: any) {
    this.isShowApplication = !this.isShowApplication;
  }


  /**
   *
   * @param event
   */
  public clickShowGeneralAccount(event?: MouseEvent): void {
    this.dialogService.openNew({
      mode: '2',
      isSimpleContent: false,
      componentSelector: 'user-account-dialog',
      componentData: {},
      titleAction: 'Set',
      titleComponent: 'General account',
      titleIcon: 'font-setting di-password-setting',
      titleDesc: [
        'Edit',
        'you account',
        'general setting and function'
      ]
    });
  }

  /**
   * 提交 reset pwd
   * @param event
   * @param form
   * @param element
   */
  public clickSubmit(event: MouseEvent, form: NgForm, element: any) {
    // event.stopPropagation();
    if (!this.checkValid()) {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      return false;
    } else {

      this.userModelService.resetPwd({
        data: {
          old_password: this.user.oldPassword,
          password: this.user.password,
          confirm_password: this.user.confirmPassword
        }
      }, (response: any) => {
        if (response.status === 1) {
          //成功，按钮添加对号，2秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          }, this.config.btnSuccessTime);
          form.resetForm();
          this.resetAccountForm();
          this.hasSetPwd = true;
          let timer = setTimeout(() => {
             this.hasSetPwd = false;
            //关闭当前dialog
            this.showResetPwd = false;
            clearTimeout(timer);
          }, 1000);
        } else {
          this.errorText = this.translate.manualTranslate(response.message);
          //失败，按钮添加叉号，错误提示，2秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
            this.errorText = '';
          }, this.config.btnFailTime);
        }
        this.renderer.setElementClass(element, this.config.btnProgress, false);
      })
    }
  }

  public oldPasswordBlur() {
    if (!this.user.oldPassword) {
      this.oldPassword_error.isShow = true;
      this.oldPassword_error.text = 'password is required';
      return false;
    } else if (this.user.oldPassword.length < 8) {
      this.oldPassword_error.isShow = true;
      this.oldPassword_error.text = 'password must be at least 8 characters long';
      return false;
    }
    else {
      this.oldPassword_error.isShow = false;
      return true;
    }
  }

  public passwordBlur() {
    if (!this.user.password) {
      this.password_error.isShow = true;
      this.password_error.text = 'password is required';
      return false;
    } else if (this.user.password.length < 8) {
      this.password_error.isShow = true;
      this.password_error.text = 'password must be at least 8 characters long';
      return false;
    } else {
      this.password_error.isShow = false;
      return true;
    }
  }

  public confirmPasswordBlur() {
    if (!this.user.confirmPassword) {
      this.confirmPassword_error.isShow = true;
      this.confirmPassword_error.text = 'password is required';
      return false;
    } else if (this.user.confirmPassword !== this.user.password) {
      this.confirmPassword_error.isShow = true;
      this.confirmPassword_error.text = `The password you inputted twice are not identical`;
      return false;
    }
    else {
      this.confirmPassword_error.isShow = false;
      return true;
    }
  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  checkValid() {
    let result = true;

    if (!this.confirmPasswordBlur()) {
      result = false;
    }
    if (!this.passwordBlur()) {
      result = false;
    }
    if (!this.oldPasswordBlur()) {
      result = false;
    }
    return result;
  }

  public resetAccountForm(): void {
    this.confirmPassword_error = {};
    this.password_error = {};
    this.oldPassword_error = {};
    this.errorText = '';
  }

  /**
   * 点击关闭reset psd
   * @param {MouseEvent} event
   * @param {NgForm} form
   */
  public clickCloseResetPwd(event: MouseEvent, form: NgForm): void {
    // event.stopPropagation();
    this.showResetPwd = false;
    form.resetForm();
    this.resetAccountForm();
  }

  /**
   * 点击切换phone 或者email
   * @param {MouseEvent} event
   * @param {string} type
   */
  public clickToggleEmail(event: MouseEvent, type: string): void {
    // event.stopPropagation();
    if (type === 'email') {
      this.showEmail = true;
      if (this.hasSendEmail) {
        this.checkAccountEmailValid();
      }
    } else {
      this.showEmail = false;
      if (this.hasSendPhone) {
        this.checkAccountPhoneValid();
      }
    }
    this.authCodeLength = 0;
    this.emailCodeAlert = {};
    // this.resetAccountModel();
  }

  /**
   * account 手机号 验证
   * @returns {boolean}
   */
  public accountPhoneBlur(): boolean {
    let regPhone = /^1\d{10}$/;
    if (!this.accountUser.phone) {
      this.account_error.isShow = true;
      this.account_error.text = 'phone is required';
      this.showAutoCodeIpt = false;
      return false;
    } else if (!(regPhone.test(this.accountUser.phone))) {
      this.account_error.isShow = true;
      this.account_error.text = 'phone number incorrect';
      this.showAutoCodeIpt = false;
      return false;
    } else {
      this.account_error.isShow = false;
      this.showAutoCodeIpt = true;
      return true;
    }
  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  public checkAccountPhoneValid(): boolean {
    let result = true;

    if (!this.accountPhoneBlur()) {
      result = false;

    }
    return result;
  }


  /**
   * 点击发送验证码 phone
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  public clickSendAuthCode(event: MouseEvent) {
    // event.stopPropagation();
    if (this.authCodeTimer === 0) {
      if (!this.checkAccountPhoneValid()) {
        return false;
      } else {
        //TODO 加入获取手机验证码接口
        this.userModelService.fetchAccountPhoneCode({
          data: {
            means: this.accountUser.phone,
            lang: this.userDataService.getLanguageNum()
          }
        }, (res: any) => {
          if (res.status === 1) {
            this.phoneCodeAlert.show = true;
            this.phoneCodeAlert.text = 'send success.';
            this.phoneCodeAlert.success = true;
            this.showAutoCodeIpt = true;
            this.hasSendPhone = true;
            this.authCodeTimer = 60;
            let timer = setInterval(() => {
              this.authCodeTimer--;
              if (this.authCodeTimer < 1) {
                clearInterval(timer);
              }
            }, 1000)
          } else {
            this.phoneCodeAlert.show = true;
            this.phoneCodeAlert.text = this.translate.manualTranslate('send phone code failed!');
            this.phoneCodeAlert.success = false;
          }
        });
      }
    }

  }

  /**
   * 自动聚焦到下一个
   * @param event
   * @param i
   * @param input
   */
  public autoTab(event: KeyboardEvent, i: number, input: any): void {
    if (event.keyCode === 8 && input.value === '') {
      // previous.focus();
      if (i >= 1) {
        this.codeInput.toArray()[i - 1].nativeElement.focus();
        this.codeInput.toArray()[i - 1].nativeElement.select();
        if (this.authCodeLength > 0) {
          this.authCodeLength--;
        }
      }
    } else if (input.value) {
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }
      let maxLength = this.codeInput.length;
      let totalLen = 0;
      if (maxLength) {
        let next;
        this.currentTab = i;

        this.codeInput.toArray().forEach((item: ElementRef, index: number) => {
          if (i === index && i < (maxLength - 1) && !next) {

            next = index + 1;
          }
          if (item.nativeElement.value != '') {
            totalLen++;
          }
          if (index === next) {
            item.nativeElement.focus();
          }
        })
      }
      this.authCodeLength = totalLen;
    }

  }

  /**
   * 点击upload 更换手机号
   * @param {MouseEvent} event
   * @param element
   */
  public clickUpdatePhone(event: MouseEvent, element: any): void {
    // event.stopPropagation();
    if (this.authCodeForm) {
      let inputList = this.codeInput.toArray();
      let codeArr = [];
      for (let val of inputList) {
        codeArr.push(val.nativeElement.value);
      }
      let authCodeString = codeArr.join('');
      this.userModelService.changePhone({
        data: {
          phone: this.accountUser.phone,
          code: authCodeString
        }
      }, (res: any) => {
        if (res.status === 1) {
          //成功，按钮添加对号，2秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          }, this.config.btnSuccessTime);
          //加载页
          this.hasSetAccount = true;
          let timer = setTimeout(() => {
            this.hasSetAccount = false;
            //关闭当前dialog
            this.clickCloseAccount(event, 'account');
            clearTimeout(timer);
          }, 1000);
        } else {
          this.authCode_error.show = true;
          this.authCode_error.text = this.translate.manualTranslate('update phone failed!');
          //失败，按钮添加叉号，错误提示，3秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
            this.authCode_error.show = false;
            this.authCode_error.text = '';
          }, this.config.btnFailTime);

        }
        this.renderer.setElementClass(element, this.config.btnProgress, false);
      })
    }

  }

  /**
   * 点击account 的dialog关闭按钮
   * @param {MouseEvent} event
   * @param type
   */
  public clickCloseAccount(event: MouseEvent, type: string): void {
    // event.stopPropagation();
    if (type === 'account') {
      this.showResetAccount = false;
      this.showEmail = false;
      this.resetAccountModel();
    } else if (type === 'password') {
      this.showResetPwd = false;
    }
  }

  public accountEmailBlur(): boolean {
    let regEmail = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
    if (!this.accountUser.email) {
      this.account_email_error.isShow = true;
      this.account_email_error.text = 'email is required';
      this.showAutoCodeIpt = false;
      return false;
    } else if (!(regEmail.test(this.accountUser.email))) {
      this.account_email_error.isShow = true;
      this.account_email_error.text = 'email is invalid';
      this.showAutoCodeIpt = false;
      return false;
    } else {
      this.account_email_error.isShow = false;
      this.showAutoCodeIpt = true;
      return true;
    }
  }

  /**
   * 验证文本框正确性
   * @returns {boolean}
   */
  public checkAccountEmailValid(): boolean {
    let result = true;

    if (!this.accountEmailBlur()) {
      result = false;

    }
    return result;
  }

  /**
   * 点击发送验证码  email
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  public clickResendEmail(event: MouseEvent) {
    event.stopPropagation();
    if (this.accountEmailTimer === 0) {
      if (!this.checkAccountEmailValid()) {
        return false;
      } else {

        this.userModelService.applyChangeEmail({
          data: {
            means: this.accountUser.email,
            lang: this.userDataService.getLanguageNum()
          }
        }, (res: any) => {
          if (res.status === 1) {
            this.emailCodeAlert.show = true;
            this.emailCodeAlert.text = 'send success.';
            this.emailCodeAlert.success = true;
            this.showAutoCodeIpt = true;
            this.hasSendEmail = true;
            this.accountEmailTimer = 60;
            let timer = setInterval(() => {
              this.accountEmailTimer--;
              if (this.accountEmailTimer < 1) {
                clearInterval(timer);
              }
            }, 1000);
          } else {
            this.emailCodeAlert.show = true;
            this.emailCodeAlert.text = this.translate.manualTranslate('send mail verification failed!');
            this.emailCodeAlert.success = false;
          }
        })
      }
    }

  }

  /**
   * 点击上传更新 新的邮箱
   * @param {MouseEvent} event
   */
  public clickUploadEmail(event: MouseEvent): void {
    event.stopPropagation();
    let inputList = this.codeInput.toArray();
    let codeArr = [];
    for (let val of inputList) {
      codeArr.push(val.nativeElement.value);
    }
    let authCodeString = codeArr.join('');


    this.userModelService.changeEmail({
      data: {
        email: this.accountUser.email,
        code: authCodeString
      }
    }, (res: any) => {
      if (res.status === 1) {
        this.emailAlert.show = true;
        this.emailAlert.text = this.translate.manualTranslate('update email success.');
        this.emailAlert.success = true;
        //改变localStorage 里的值
        let userData = this.userDataService.getStoreData('user_data');
        userData.user.email = this.accountUser.email;
        this.userDataService.setStoreData('user_data', userData);

        //发送通知改变email
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_ACCOUNT_RESET_EMAIL,
          data: {
            email: this.accountUser.email
          }
        });
        this.currentEmail = this.accountUser.email;

        //加载页
        this.hasSetAccount = true;
        let timer = setTimeout(() => {
          this.hasSetAccount = false;
          //关闭当前dialog
          this.clickCloseAccount(event, 'account');
          clearTimeout(timer);
        }, 1000);

      } else {
        this.emailAlert.show = true;
        this.emailAlert.text = this.translate.manualTranslate('update email failed!');
        this.emailAlert.success = false;
      }
    })
  }

  /**
   * 重置 账户数据
   */
  private resetAccountModel() {
    this.accountUser = {
      phone: '',
      email: ''
    };
    this.authCodeLength = 0;
    this.account_error = {};
    this.authCode_error = {};
    this.account_email_error = {};
    this.showAutoCodeIpt = false;

    this.hasSendPhone = false;
    this.hasSendEmail = false;

    this.emailCodeAlert = {};
    this.phoneCodeAlert = {};
    this.phoneAlert = {};
    this.emailAlert = {};

  }

  /**
   * email 输入框 key up
   */
  public emailKeyUp(): void {
    this.checkAccountEmailValid();
    // this.authCodeLength = 0;
    this.emailAlert = {};
    this.emailCodeAlert = {};
  }

  /**
   * email 输入框 key up
   */
  public phoneKeyUp(): void {
    this.checkAccountPhoneValid();
    // this.authCodeLength = 0;
    this.phoneAlert = {};
    this.phoneCodeAlert = {};
  }

  /**
   * 查看该用户是否读过帮助文档
   */
  getHelpRecorder() {
    let storeHelp = this.userDataService.getHelp();
    //如果缓存没有记录 读接口
    if (!storeHelp) {
      this.userModelService.helpRecorder({}, (res: any) => {
        if (res.status === 1) {
          if (!res.data.dashboard) {
            this.openIsNeedHelpDialog(res.data);
          } else {
            this.userDataService.setHelp(res.data);
          }
        }
      });
    } else {
      let helpRecorder: any = storeHelp;
      if (!helpRecorder.dashboard) {
        this.openIsNeedHelpDialog(helpRecorder);
      }
    }
  }

  /**
   * 弹出是否需要帮助的弹框
   */
  openIsNeedHelpDialog(data: any) {
    let setOptionData: any = {
      model: 'Homepage',
    };
    let settings = {
      mode: '6',
      title: 'HOMEPAGE HELP',
      isSimpleContent: false,
      componentSelector: 'help-dialog',
      componentData: setOptionData,
      buttons: [{
        btnEvent: () => {
          this.showHelpDialog();
        },
        btnText: 'Ok, I watch it',
        btnClass: 'but-done but-animation help-btn'
      },
        {
          btnText: 'Don`t show this help again !',
          btnClass: 'but-done but-animation help-btn help-btn-bottom'
        }],
    };
    this.dialogService.openNew(settings);
    data.dashboard = 1;
    this.userDataService.setHelp(data);
    this.userModelService.updateHelper({
      data: {dashboard: 1}
    }, (res: any) => {

    })
  }

  /**
   * 将studio升级为公司
   */
  upgradeStudio(event: any, data: any) {
    event.stopPropagation();
    this.companyDataService.setPendingUpgradeStudio(data);
    this.router.navigate(['/company/upgrade']);
  }


  /**
   * 显示help 具体内容
   */
  showHelpDialog() {
    if (!this.companyLength) {
      this.companyLength = 1;
    }
    this.isHelpModule = true;
    this.userNav.isHelpModule = true;
    let intro = introInit.introJs();
    const totalHelpStepCount: number = 18;
    let totalHelpStep: Array<any> = [];
    for (let i = 1; i < totalHelpStepCount + 1; i++) {
      let steps: any = {
        element: '#step_' + i.toString(),
        intro: this.getHelpHtml('HELP_HOME_PAGE_' + i.toString())
      };
      totalHelpStep.push(steps);
    }
    intro.setOptions({
      prevLabel: '<em class="icon1-help-arrow"></em><i class="base">' + this.translate.manualTranslate('Previous') + '</i>',
      nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">' + this.translate.manualTranslate('Next1') + '</i>',
      exitOnEsc: true,
      hidePrev: false,
      hideNext: true,
      exitOnOverlayClick: true,
      showProgress: true,
      showBullets: true,
      showStepNumbers: false,
      disableInteraction: true,
      tooltipClass: 'help-wrap help-no-padding show-btn',
      steps: totalHelpStep
    });
    intro.start();
    intro.onchange((targetElement) => {
      let ele: any = targetElement.getAttribute('data-step');
      if (ele == 2 || ele == 3 || ele == 4 || ele == 13 || ele == 14 || ele == 15 || ele == 16 || ele == 17 || ele == 18) {
        this.renderer.setElementStyle(this.tips1.nativeElement, 'position', 'relative');
        this.renderer.setElementStyle(this.tips1.nativeElement, 'zIndex', '-10');
        this.renderer.setElementStyle(this.userNav1.nativeElement, 'zIndex', '-10');
        this.renderer.setElementStyle(this.userNav1.nativeElement, 'position', 'relative');
      } else {
        this.renderer.setElementStyle(this.tips1.nativeElement, 'zIndex', '');
        this.renderer.setElementStyle(this.tips1.nativeElement, 'position', '');
        this.renderer.setElementStyle(this.userNav1.nativeElement, 'zIndex', '');
        this.renderer.setElementStyle(this.userNav1.nativeElement, 'position', ' ');
      }
      if (ele == 2 || ele == 3 || ele == 4) {
        this.renderer.setElementClass(this.userInfo.nativeElement, 'show', true);
      } else {
        this.renderer.setElementClass(this.userInfo.nativeElement, 'show', false);
      }
      if (targetElement.getAttribute('data-step') == 7) {
        this.isShowApplication = true;
      } else {
        this.isShowApplication = false;
      }
      if (ele == 13 || ele == 14 || ele == 15 || ele == 16 || ele == 17 || ele == 18) {
        this.userNav.showCompanyFunctionBtn(true);
      } else {
        this.userNav.showCompanyFunctionBtn(false);
      }
    });
    intro.onafterchange((targetElement) => {
      if (!targetElement.getAttribute('data-step')) {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
      } else {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding')
      }
    });
    intro.onexit(() => {
      this.userNav.showCompanyFunctionBtn(false);
      this.renderer.setElementClass(this.userInfo.nativeElement, 'show', false);
      this.renderer.setElementStyle(this.tips1.nativeElement, 'zIndex', '');
      this.renderer.setElementStyle(this.tips1.nativeElement, 'position', '');
      this.renderer.setElementStyle(this.userNav1.nativeElement, 'zIndex', '');
      this.renderer.setElementStyle(this.userNav1.nativeElement, 'position', ' ');
      this.renderer.setElementClass(document.getElementsByTagName('body')[0], 'body-help', false);
      this.companyLength = this.typeService.getDataLength(this.allCompanyList);
      this.isHelpModule = false;
      this.userNav.isHelpModule = false;
    })
  }

  /**
   * 获取帮助html
   */
  getHelpHtml(param: string) {
    let helpHtml = '<h3 class="f53-f help-title help-title2">' + this.translate.manualTranslate("tutorial") +
      '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
      '<em>esc </em>' + this.translate.manualTranslate('to cancel') + '</span></h3><div class="help-line"></div>' +
      '<div class="help-click">' + this.translate.manualTranslate(param) + '</div>';
    return helpHtml;
  }


}
