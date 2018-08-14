import {
  Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, Renderer,
  ViewChild, ViewEncapsulation
} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ContactModelService, FetchOccupation} from "../../shared/services/index.service";
import {Subscription} from "rxjs/Subscription";
import {UserModelService} from "../../shared/services/model/user-model.service";
import * as UserDataConstant from "../../shared/config/user.config"

@Component({
  selector: 'occupation',
  templateUrl: '../template/occupation.component.html',
  styleUrls: [
    '../../../assets/css/occupation/occupation.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class OccupationComponent implements OnInit, OnDestroy {
  public uConst = UserDataConstant;
  public showOccupation: boolean = true;
  //权限list 模板显示
  public permissionList: Array<any> = [];


  //薪水
  public salaryShow: boolean;
  public allowanceShow: boolean;
  public currency: number = 1;
  public period: number = 1;
  public getRouteParams: any;
  public companyInfo: any;

  public currCurrency: string = '￥';
  public currPeriod: string = 'Month';
  public currencyArray: Array<string> = ['￥', '$'];
  public periodArray: Array<string> = ['Day', 'Week', 'Month', 'Year'];
  public commonIn: any;

  public currencyVal: string = '￥';
  public periodVal: string;
  public periodNum: number;
  public currencyNum: number = 1;
  public fetchOccupation: FetchOccupation;
  private currentSelectEl: any;
  public isShowHire: number;
  private getUserObj: any;

  public type: string;
  public startDate: any;
  public endDate: any;
  public multiCalendar: any = {};
  public isShowCalendar: boolean = false;         //日历显示
  public isShowStartError: boolean = false;
  public isShowEndError: boolean = false;
  public dateFormat: string = 'yyyy-mm-dd';
  public hasStartEnd: boolean = false;
  public currentElement: any;
  public messageElement: any;
  public attrElement: any;

  public subscription: Subscription;

  @ViewChild('selectSalary') public selectSalary: any;
  @ViewChild('selectPeriod') public selectPeriod: any;
  @ViewChild('toggleSelect') public toggleSelect: any;
  @ViewChild('calendarProfile') public calendarProfile: any;
  private showTime: any = {};
  private showTimeCommencement: any = {};
  public dialogPosition: any = {};
  public permissions: any = {
    0: {
      1: {
        4: true,
        5: true,
        6: {8: true, 9: true},
        7: true,
      },
      2: {3: true},
      10: true,
    }
  };
  public permission0 = [0];
  public permission2Child = [3];
  public permission0Child = [1, 2, 10];
  public permission1Child = [4, 5, 6, 7];
  public permission6Child = [8, 9];

  public permissionsRelation: Array<any> = [
    {key: 0, child: [1, 2, 10], name: 'CEO'},
    {key: 1, child: [4, 5, 6, 7], name: 'MAIN_ADMIN'},
    {key: 2, child: [3], name: 'WORKFLOWER_COMPANY'},
    {key: 3, name: 'WORKFLOWER_COMPANY_DEPT'},
    {key: 4, name: 'MAIN_ADMIN_STRUCTURE_EDITOR'},
    {key: 5, name: 'MAIN_ADMIN_STAFF_MANAGER'},
    {key: 6, child: [8, 9], name: 'MAIN_ADMIN_HR'},
    {key: 7, name: 'MAIN_ADMIN_RESERVATION'},
    {key: 8, name: 'MAIN_ADMIN_HR_VACATIONER'},
    {key: 9, name: 'MAIN_ADMIN_HR_ATTENDANCER'},
    {key: 10, name: 'SYSTEM_ADMIN'}
  ];

  private permLevel: number = 4;
  //可以设置的权限
  public assignPermissionList: Array<string> = [];
  //当前拥有的权限
  public ownPermissionList: Array<number> = [];
  private isSelf: boolean = false;
  private selectPeriodEl: any;
  private currencyEl: any;
  private toggleInputEl: any;
  //显示没有权限
  public showNoPermission: boolean = false;
  //显示no data
  public showNoData: boolean = false;
  private isCalendar: string = '';

  @HostListener('document:click')
  onClick() {
    this.salaryShow = false;
    this.allowanceShow = false;
  }

  @Output() public outPutOccupation = new EventEmitter();
  @Output() public outPutUpdateList = new EventEmitter();

  set currentUserObj(data: any) {
    if (data) {
      this.getUserObj = data;
    }
  }

  constructor(private renderer: Renderer,
              public activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              public userModelService: UserModelService,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('date.service') public dateService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('verification.service') public verificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }

  @Input('setOption')
  public set setOption(dialogData: any) {
    let data = dialogData.data;
    if (data) {
      this.verificationService.clearElementArr();
      this.getUserObj = data;
      //获取招聘信息
      this.showTime = {};
      let now = new Date();
      let tomorrowYear = now.setFullYear(now.getFullYear() + 1);
      this.showTimeCommencement = {};
      this.fetchOccupation = FetchOccupation.init();
      this.fetchOccupation.probationStartTime = this.dateService.formatLocal(new Date(), 'yyyy-mm-dd');
      this.fetchOccupation.probationEndTime = this.dateService.formatLocal(tomorrowYear, 'yyyy-mm-dd');
      this.fetchOccupation.commencementDate = this.dateService.formatLocal(new Date(), 'yyyy-mm-dd');
      this.fetchOccupation.terminationDate = this.dateService.formatLocal(tomorrowYear, 'yyyy-mm-dd');
      this.multiCalendar = {};
      this.getOccupation();
      this.showOccupation = true;
      if (data.hasOwnProperty('psid') && data.psid) {
        if (data.is_ceo === 1) {
          this.showNoPermission = true;
        } else {
          this.showNoPermission = false;
          this.fetchPermissionInterface()
        }
      }
      // this.verificationService.initInputError();
    }
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.companyInfo = this.companyDataService.getLocationCompanyIn();
    this.commonIn = this.userDataService.getUserIn();
    //获取地址参数
    this.getParams();
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACT_DIALOG_SERVICE_POSITION:
        this.dialogPosition = data.data;
        break;
      default:
        break;
    }
  }

  /**
   * 接收日历的传出对象
   * @param event
   */
  getSelectData(event: any) {
    this.hasStartEnd = true;
    if (event && event.startDate && event.startDate.startTimeStamp) {
      let start = new Date(event.startDate.startTimeStamp);
      this.startDate = this.dateService.formatWithTimezone(start.toUTCString(), this.dateFormat);
    }
    if (event && event.endDate && event.endDate.endTimeStamp) {
      let end = new Date(event.endDate.endTimeStamp);
      this.endDate = this.dateService.formatWithTimezone(end.toUTCString(), this.dateFormat);
    }
    if (this.type === 'contract') {
      this.fetchOccupation.commencementDate = this.startDate;
      this.fetchOccupation.terminationDate = this.endDate;
      //要显示的格式
      this.setshowTimeCommencement();
    } else {
      this.fetchOccupation.probationStartTime = this.startDate;
      this.fetchOccupation.probationEndTime = this.endDate;
      //要显示的格式
      this.setShowTime();
    }

    this.element.setClass(this.currentElement, '', 'g-show-input-error');
    this.element.setClass(this.messageElement, '', 'g-show-error');
    this.element.setElementAttrVal(this.attrElement, 'data-true', 'false');

    this.isShowCalendar = false;
    //判断开始结束时否全部选择
    // todo 在IE下不兼容
    this.startAndEnd();

  }

  /**
   * 设置时间
   * @param event
   * @param isBool
   * @param type
   * @param element
   * @param messageElement
   * @param attrElement
   */
  onClickDate(event: any, isBool: boolean, type: string, element: any, messageElement: any, attrElement: any, param: string) {
    event.stopPropagation();
    this.currentElement = element;
    this.messageElement = messageElement;
    this.attrElement = attrElement;
    this.isShowCalendar = !this.isShowCalendar;
    if (this.type && this.type !== type) {
      this.isShowCalendar = true;
    }
    this.type = type;

    if (this.isCalendar !== param) {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? param : '';
    let startDate: string;
    let endDate: string;
    if (type === 'contract') {
      startDate = this.fetchOccupation.terminationDate ? this.fetchOccupation.commencementDate : '';
      endDate = this.fetchOccupation.terminationDate ? this.fetchOccupation.terminationDate : '';
    } else {
      startDate = this.fetchOccupation.probationStartTime ? this.fetchOccupation.probationStartTime : '';
      endDate = this.fetchOccupation.probationEndTime ? this.fetchOccupation.probationEndTime : '';
    }
    this.multiCalendar = {
      data: {
        start: startDate,
        end: endDate
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: !!startDate
        },
        end: {
          isShowDateTime: !!endDate
        }
      },
      isClickStart: isBool,
      isClickEnd: !isBool,
      isMeeting: true,
      isProfile: true,
      parentElement: event,
      isFixed: true,
      currentShowElement: this.calendarProfile.nativeElement
    };
  }

  /**
   *判断开始结束时否全部选择
   */
  startAndEnd() {
    if (this.startDate == '') {
      this.isShowStartError = true;
    }
    if (this.endDate == '') {
      this.isShowEndError = true;
    }
    if (this.startDate && this.endDate) {
      this.isShowStartError = false;
      this.isShowEndError = false;
    }
  }

  /**
   * select
   * @param elem
   */
  doCallBackData(elem: any) {
    this.currentSelectEl = elem.toggleSelectElement;
    this.toggleInputEl = elem.toggleInput;
  }

  /**
   * 查看招聘信息
   */
  getOccupation() {
    this.contactModelService.fetchOccupation({data: {uid: this.getUserObj.uuid}},
      (data: any) => {
        if (data.status === 1) {
          if (!(data.data instanceof Array)) {
            this.typeService.bindData(this.fetchOccupation, data.data);
            this.currCurrency = this.currencyArray[this.fetchOccupation.currency - 1];
            this.currPeriod = this.periodArray[this.fetchOccupation.period - 1];

            //赋值要显示的时间格式
            this.setShowTime();
            this.setshowTimeCommencement();
          }
          this.isShowHire = data.data.is_hire;
        }
      }
    )
  }

  /**
   * 选择薪水币种
   * @param value
   * @param num
   * @param event
   */
  selectCurrency(value: string, num: number, event: any) {
    if (this.currencyEl) {
      this.renderer.setElementClass(this.currencyEl, 'current', false);
    }
    this.renderer.setElementClass(event, 'current', true);
    this.currencyVal = value;
    this.currencyNum = num;
    this.currencyEl = event;
  }

  /**
   * 选择期限
   * @param value
   * @param num
   * @param event
   */
  selectPeriodVal(value: string, num: number, event: any) {
    if (this.selectPeriodEl) {
      this.renderer.setElementClass(this.selectPeriodEl, 'current', false);
    }
    this.renderer.setElementClass(event, 'current', true);
    this.periodVal = value;
    this.periodNum = num;
    this.selectPeriodEl = event;
  }

  /**
   * 保存值
   */
  doneValue() {
    if (this.periodNum) {
      this.fetchOccupation.period = this.periodNum;
      this.currPeriod = this.periodVal;
    }
    if (this.currencyNum) {
      this.fetchOccupation.currency = this.currencyNum;
      this.currCurrency = this.currencyVal;
    }
    this.salaryShow = false;
    if (this.currentSelectEl) {
      this.renderer.setElementClass(this.currentSelectEl, 'hide', true);
    }
    if (this.toggleInputEl) {
      this.renderer.setElementClass(this.toggleInputEl, 'se-input-selected', false);
    }
    if (this.selectPeriodEl) {
      this.renderer.setElementClass(this.selectPeriodEl, 'current', false);
    }
    if (this.currencyEl) {
      this.renderer.setElementClass(this.currencyEl, 'current', false);
    }
    this.toggleSelectService.emptyElement();
  }

  /**
   * 获取参数
   */
  getParams() {
    this.activatedRoute.params.subscribe(params => {
      this.getRouteParams = params;
    });
  }

  /**
   * 保存招聘
   */
  doUploadInfo() {
    let isBool: boolean = this.verificationService.elementData();
    if (isBool) {
      return false;
    }
    this.fetchOccupation.cid = this.companyInfo.cid;
    this.fetchOccupation.uuid = this.getUserObj.uuid;
    this.fetchOccupation.currency = this.currencyNum;
    this.fetchOccupation.allowance = 1;

    let saveParams = {
      data: this.fetchOccupation
    };
    this.contactModelService.saveOccupation(saveParams,
      (data: any) => {
        if(data.status !=1 && data.data == 1062){
          data = {
            message:"User's work email or work phone duplicated",
            data:1062,
            status:0
          };
        }
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: data
        });
        if (data.status === 1) {
          this.outPutUpdateList.emit(this.getUserObj.uuid);
          this.closeOccupation();
          //通知recruit 刷新列表
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_OCCUPATION_REFRESH
          })
        }
      });
  }

  /**
   * 关闭弹窗
   */
  closeOccupation() {
    this.outPutOccupation.emit();
  }

  /**
   * 重复点击开始、结束
   *
   onClickClose() {
    this.isShowCalendar = false;
  }

   /**
   * 赋值显示时间
   */
  setShowTime() {
    this.showTime.start = this.dateService.formatLocal(this.fetchOccupation.probationStartTime, 'ddS') + " " +
      this.dateService.formatLocal(this.fetchOccupation.probationStartTime, 'mmmm') + " " +
      this.dateService.formatLocal(this.fetchOccupation.probationStartTime, 'yyyy');
    this.showTime.end = this.dateService.formatLocal(this.fetchOccupation.probationEndTime, 'ddS') + " " +
      this.dateService.formatLocal(this.fetchOccupation.probationEndTime, 'mmmm') + " " +
      this.dateService.formatLocal(this.fetchOccupation.probationEndTime, 'yyyy');
  }

  setshowTimeCommencement() {
    this.showTimeCommencement.start = this.dateService.formatLocal(this.fetchOccupation.commencementDate, 'ddS') + " " +
      this.dateService.formatLocal(this.fetchOccupation.commencementDate, 'mmmm') + " " +
      this.dateService.formatLocal(this.fetchOccupation.commencementDate, 'yyyy');
    this.showTimeCommencement.end = this.dateService.formatLocal(this.fetchOccupation.terminationDate, 'ddS') + " " +
      this.dateService.formatLocal(this.fetchOccupation.terminationDate, 'mmmm') + " " +
      this.dateService.formatLocal(this.fetchOccupation.terminationDate, 'yyyy');
  }

  /**
   * 点击保存
   * @returns {boolean}
   */
  sendData() {
    if (this.showOccupation) {
      this.doUploadInfo();
    } else {
      if (this.isSelf) {

      } else {
        let setPerArr = [];
        for (let k in this.permissionList) {
          if (!this.permissionList[k].isClose) {
            setPerArr.push(this.permissionList[k].key);
          }
        }
        let grant = [];
        let revoke = [];
        setPerArr.forEach((value) => {
          if (this.ownPermissionList.indexOf(value) === -1) {
            grant.push(value);
          }
        });
        this.ownPermissionList.forEach((value) => {
          if (setPerArr.indexOf(value) === -1) {
            revoke.push(value);
          }
        });
        if (grant.length || revoke.length) {
          this.userModelService.grantPrivilege({
            data: {
              "psid": this.getUserObj.psid,
              "privilege": {"grant": grant, "revoke": revoke}
            }
          }, (response: any) => {
            if(response.status !=1 && response.data == 1062){
              response = {
                message:"User's work email or work phone duplicated",
                data:1062,
                status:0
              };
            }
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
              data: response
            });
          })
        }
      }
    }

  }

  /**
   * 点击标题切换
   * @param data
   */
  clickTitle(data): void {

    this.showOccupation = !this.showOccupation;
  }

  /**
   *
   * @param data
   * @param permissionObj
   */
  public clickOpenPermission(data: {
    perm: number, bgColorClass: string
  }, permissionObj: any): void {
    permissionObj.isClose = !permissionObj.isClose;
  }

  /**
   * 请求权限接口
   */
  private fetchPermissionInterface() {
    this.userModelService.allocatedPrivilege({data: {"psid": this.getUserObj.psid}}, (response: any) => {
      if (response.status === 1) {
        if (response.data.hasOwnProperty('privilege') && response.data.hasOwnProperty('own')) {
          let privilege = response.data.privilege;
          this.ownPermissionList = response.data.own;
          this.permissionList = [];
          //this.initPerMission(privilege, own);
          this.assignPermissionList = [];
          this.isSelf = false;
          let checkPer = [];
          for (let k in privilege) {
            switch (k) {
              case 'company_workflow':
                if (privilege[k] === 1) {
                  checkPer.push(2)
                }
                break;
              case 'human_resource':
                if (privilege[k] === 1) {
                  checkPer.push(6)
                }
                break;
              case 'main_admin':
                if (privilege[k] === 1) {
                  checkPer.push(1)
                }
                break;
              case 'super_admin':
                if (privilege[k] === 1) {
                  checkPer.push(0)
                }
                break;
            }
          }
          this.buildPermissionData(checkPer, this.ownPermissionList);

        }
        this.showNoData = false;
      } else {
        this.showNoData = true;
      }
    })
  }

  /**
   *  查询最高等级
   * @param {Array<any>} checkPerm
   * @param level
   * @param permissions
   */
  checkPermLevel(checkPerm: number, level?: number, permissions?: any) {
    if (typeof level === 'undefined') {
      level = 0;
    }
    if (typeof permissions === 'undefined') {
      permissions = this.permissions;
    }
    for (let k in permissions) {
      if (typeof permissions[k] !== 'boolean') {
        if (parseInt(k) === checkPerm) {
          // 数字越小 等级越高
          this.permLevel = this.permLevel > level ? level : this.permLevel;
          let arr = Object.keys(permissions[k]);
          this.assignPermissionList = this.assignPermissionList.concat(arr);

        } else {
          level++;
          this.checkPermLevel(checkPerm, level, permissions[k]);
          level--;
        }
      } else if (checkPerm == parseInt(k)) {
        // 数字越小 等级越高
        this.permLevel = this.permLevel > level ? level : this.permLevel;
      }
    }
    level--;
  }


  public buildPermissionData(myPermission: Array<any>, userOwnPermission: Array<any>) {
    let isCEO = myPermission.indexOf(0) !== -1;
    let isSelf = false;
    if (this.userDataService.getCurrentCompanyPSID() === this.getUserObj.psid) {
      isSelf = true;
      this.isSelf = isSelf;

      //看自己

      if (isCEO) {
        ['0'].forEach((value) => {

          this.initPermissionList(value)
        });
      } else {
        userOwnPermission.forEach((value) => {

          this.initPermissionList(value)
        });
      }
      return;
    }
    let level;
    if (isCEO) {
      this.permLevel = 0;
      this.assignPermissionList = this.assignPermissionList.concat(Object.keys(this.permissions[0]))
    } else {
      myPermission.forEach((myPerm: number) => {
        this.checkPermLevel(myPerm);
      });
    }
    //可分配权限永远是level + 1

    //
    // this.fetchPermChild(myPermission, userOwnPermission);

    this.assignPermissionList.forEach((value) => {

      this.initPermissionList(value)

    });
  }


  /**
   * 点击 收缩 permission
   * @param {MouseEvent} event
   * @param permissionObj
   */
  public clickExpendPermission(event: MouseEvent, permissionObj: any): void {
    event.stopPropagation();
    permissionObj.isExpand = !permissionObj.isExpand;
  }

  private initPermissionList(value: string) {
    switch (parseInt(value)) {
      case UserDataConstant.ROLE_CEO:
        this.permissionList.push({
          key: 0,
          name: this.translate.manualTranslate('CEO'),
          description: '',
          isClose: this.ownPermissionList.indexOf(1) === -1,
          isExpand: false,
          children: [{
            key: 1,
            name: this.translate.manualTranslate('MAIN ADMIN'),
            description: this.translate.manualTranslate('Can authorize structure'),
            isExpand: false,
            children: [{
              key: 4,
              name: this.translate.manualTranslate('STRUCTURE EDITOR'),
              isExpand: false,
              description: this.translate.manualTranslate('Edit staff'),
            }, {
              key: 5,
              name: this.translate.manualTranslate('STAFF ADMIN'),
              isExpand: false,
              description: this.translate.manualTranslate('Edit and manage staff'),
            }, {
              key: 6,
              name: 'HUMAN RESOURCE MANAGEMENT',
              isExpand: false,
              description: this.translate.manualTranslate('Edit and manage staff'),
              children: [{
                key: 8,
                name: 'VACATIONER',
                isExpand: false,
                description: 'set and manage staff vacation and leave',
              }, {
                key: 9,
                name: 'MAIN_ADMIN_HR_ATTENDANCER',
                description: 'set and manage staff working time and national hoilday',
                isExpand: false,
              }]
            }, {
              key: 7,
              name: 'MAIN_ADMIN_RESERVATION',
              isExpand: false,
            }]
          },
            {
              key: 2,
              name: this.translate.manualTranslate('WORKFLOWER COMPANY'),
              isClose: this.ownPermissionList.indexOf(2) === -1,
              isExpand: false,
              children: [{
                key: 3,
                name: 'WORKFLOWER_COMPANY_DEPT',
                isExpand: false,
              }]
            },
            {
              key: 10,
              name: this.translate.manualTranslate('SYSTEM_ADMIN'),
              isClose: this.ownPermissionList.indexOf(10) === -1,
              isExpand: false,
            }

          ]
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN:
        this.permissionList.push({
          key: 1,
          name: this.translate.manualTranslate('MAIN ADMIN'),
          description: this.translate.manualTranslate('Can authorize structure'),
          isClose: this.ownPermissionList.indexOf(1) === -1, //按钮开关
          isExpand: false,
          children: [{
            key: 4,
            name: this.translate.manualTranslate('STRUCTURE EDITOR'),
            isExpand: false,
            description: this.translate.manualTranslate('Edit staff'),
          }, {
            key: 5,
            name: this.translate.manualTranslate('STAFF ADMIN'),
            isExpand: false,
            description: this.translate.manualTranslate('Edit and manage staff'),
          }, {
            key: 6,
            name: 'MAIN_ADMIN_HR',
            description: this.translate.manualTranslate('Edit and manage staff'),
            children: [{
              key: 8,
              name: 'VACATIONER',
              isExpand: false,
              description: this.translate.manualTranslate('set and manage staff vacation and leave'),
            }, {
              key: 9,
              name: 'MAIN_ADMIN_HR_ATTENDANCER',
              description: this.translate.manualTranslate('set and manage staff working time and national hoilday'),
              isExpand: false,
            }]
          }, {
            key: 7,
            name: 'MAIN_ADMIN_RESERVATION',
            isExpand: false,
          }]
        });
        break;
      case UserDataConstant.ROLE_WORKFLOWER_COMPANY:
        this.permissionList.push({
          key: 2,
          name: this.translate.manualTranslate('WORKFLOWER COMPANY'),
          isClose: this.ownPermissionList.indexOf(2) === -1,
          isExpand: false,
          children: [{
            key: 3,
            name: 'WORKFLOWER_COMPANY_DEPT',
            isExpand: false,
          }]
        });
        break;
      case UserDataConstant.ROLE_WORKFLOWER_COMPANY_DEPT:
        this.permissionList.push({
          key: 3,
          name: 'WORKFLOWER_COMPANY_DEPT',
          isClose: this.ownPermissionList.indexOf(3) === -1,
          isExpand: false,
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_STRUCTURE_EDITOR:
        this.permissionList.push({
          key: 4,
          name: this.translate.manualTranslate('STRUCTURE EDITOR'),
          isClose: this.ownPermissionList.indexOf(4) === -1,
          isExpand: false,
          description: this.translate.manualTranslate('Edit staff'),
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_STAFF_MANAGER:
        this.permissionList.push({
          key: 5,
          name: this.translate.manualTranslate('STAFF ADMIN'),
          isClose: this.ownPermissionList.indexOf(5) === -1,
          isExpand: false,
          description: this.translate.manualTranslate('Edit and manage staff'),
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_HR:
        this.permissionList.push({
          key: 6,
          name: 'MAIN_ADMIN_HR',
          description: this.translate.manualTranslate('Edit and manage staff'),
          isClose: this.ownPermissionList.indexOf(6) === -1,
          isExpand: false,
          children: [{
            key: 8,
            name: 'VACATIONER',
            isExpand: false,
            description: 'set and manage staff vacation and leave',
          }, {
            key: 9,
            name: 'MAIN_ADMIN_HR_ATTENDANCER',
            description: 'set and manage staff working time and national hoilday',
            isExpand: false,
          }]
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_RESERVATION:
        this.permissionList.push({
          key: 7,
          name: 'MAIN_ADMIN_RESERVATION',
          isClose: this.ownPermissionList.indexOf(7) === -1,
          isExpand: false,
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_HR_VACATIONER:
        this.permissionList.push({
          key: 8,
          name: 'VACATIONER',
          isClose: this.ownPermissionList.indexOf(8) === -1,
          isExpand: false,
          description: 'set and manage staff vacation and leave',
        });
        break;
      case UserDataConstant.ROLE_MAIN_ADMIN_HR_ATTENDANCER:
        this.permissionList.push({
          key: 9,
          name: 'MAIN_ADMIN_HR_ATTENDANCER',
          description: 'set and manage staff working time and national hoilday',
          isClose: this.ownPermissionList.indexOf(9) === -1,
          isExpand: false,
        });
        break;
      case UserDataConstant.ROLE_SYSTEM_ADMIN:
        this.permissionList.push({
          key: 10,
          name: this.translate.manualTranslate('SYSTEM_ADMIN'),
          isClose: this.ownPermissionList.indexOf(10) === -1,
          isExpand: false,
        });
        break;
    }
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}
