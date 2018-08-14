import {
  Component, OnInit, Inject, EventEmitter, Output, OnDestroy,
  AfterViewChecked, ElementRef, ViewChild, Renderer, Input
} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs/Subscription";
import {UserModelService} from "../../shared/services/model/user-model.service";
import {TimeLine} from "../../shared/services/model/entity/user-entity";
import * as TimeLineConfig from "../../shared/config/timeLine.config.ts"
import {DateService} from "../../shared/services/common/data/date.service";
import * as MissionConstant from '../../shared/config/mission.config';
import * as UserPermission from "../../shared/config/user.config"

@Component({
  selector: 'user-nav',
  templateUrl: '../template/user-nav.component.html'
})
export class UserNavComponent implements OnInit, OnDestroy, AfterViewChecked {


  public navSearSelect: string = 'all types';
  public navSearchType: number = 0;
  public navSearMouseClick: boolean = false;
  public navPromptToggle: boolean = true;
  public subscription: Subscription;
  public hasUnReadChatMessage: boolean = false;
  public hasUnReadNotificationMessage: boolean = false;
  public isAttention: boolean = false;
  public isHelpModule: boolean;


  @Output() public userEvent: EventEmitter<any> = new EventEmitter();
  @Output() public OutputGlobalSearchResult: EventEmitter<any> = new EventEmitter();
  @Output() public OutputCloseSearhComponent: EventEmitter<any> = new EventEmitter();
  @Output() public OutputShowApplication: EventEmitter<any> = new EventEmitter();

  //searchInput
  @ViewChild('searchInput') public searchInput: any;
  @ViewChild('companyFunction') public companyFunction: any;
  private isInputChinese: boolean = false;
  //timeLine显示数据
  public timeLineList: Array<TimeLine> = [];
  //timeLine 滚动
  @ViewChild('scrollToBottom') public scrollToBottom: ElementRef;
  //是否绑定滚轮事件
  public bindPageEvent: boolean = false;

  public isLoading: boolean = false;
  //timeLine slice end index
  public timeLineSliceEndIndex: number = 0;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;

  // 从父级传递的权限
  // @see user-index.component
  public permConst = UserPermission;
  public companyLength: number = 0;
  private _isSuperAdmin: boolean;
  private _accessArr: {
    is_main_admin: boolean, // 1
    space: boolean, // 10
    workflow: boolean, // 3,2
    structure: boolean, // 4,1
    staff_manager: boolean, // 5,1
    meeting_room: boolean, // 7,1
    attendance: boolean, // 9,6
    vacation: boolean, // 8,6
  };
  //是否time line 初始化成功
  public hasInitTimeLine: boolean = false;
  public navSearFormVisible: boolean = true;

  @Input('isSuperAdmin')
  public set isSuperAdmin(data: boolean) {
    this._isSuperAdmin = data;
  }

  public get isSuperAdmin() {
    return this._isSuperAdmin;
  }

  @Input('accessArr')
  public set accessArr(data: {
    is_main_admin: boolean, // 1
    space: boolean, // 10
    workflow: boolean, // 3,2
    structure: boolean, // 4,1
    staff_manager: boolean, // 5,1
    meeting_room: boolean, // 7,1
    attendance: boolean, // 9,6
    vacation: boolean, // 8,6
  }) {
    this._accessArr = data;
  }

  public get accessArr() {
    return this._accessArr;
  }


  constructor(public router: Router,
              public renderer: Renderer,
              public userModelService: UserModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public tanslateService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('notification-data.service') public notificationDataService: any) {
  }

  //初始化页面后
  ngOnInit() {
    //接收消息
    this.companyLength = this.companyDataService.getCurrentCompanyCID();
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        //chat未读消息
        if (message.hasOwnProperty('act') && message.act == this.notificationService.config.ACT_CHAT_SEND_MESSAGE) {
          if (message.hasOwnProperty('data') && !message.data.hasOwnProperty('sent')) {
            this.hasUnReadChatMessage = true;
          }
          //notification未读消息
        } else if (message.hasOwnProperty('act') &&
          (message.act == this.notificationService.config.ACT_COMPONENT_NOTIFICATION_PUSH_DATA)) {
          this.hasUnReadNotificationMessage = true;
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPageEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'timeLine') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelEvent(targetElement.children[0]);
            this.bindPageEvent = true;
          }
        }

      }
    }
  }


  /**
   * index 页面元素滚动触发分页数据事件
   * @param ele
   */
  mouseWheelEvent(ele: any): void {
    ele.addEventListener('mousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.timeLineSliceEndIndex !== this.timeLineList.length) {
        this.isLoading = true;
        setTimeout(() => {
          this.changeTimeLineSlice()
        }, 300)

      }
    });
    //FF
    ele.addEventListener('DOMMouseScroll', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom) {
        this.isLoading = true;
        setTimeout(() => {
          this.changeTimeLineSlice()
        }, 300)
      }
    });
    //IE
    ele.addEventListener('onmousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom) {
        this.isLoading = true;
        setTimeout(() => {
          this.changeTimeLineSlice()
        }, 300)
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  /**
   * 选择搜索列表内容
   */
  navSearListClick(content: string, type: number) {
    this.navSearSelect = content;
    this.navSearchType = type;
    this.OutputGlobalSearchResult.emit([event, this.searchInput.nativeElement.value, this.navSearchType])
  }


  navSearchClick(event: any) {      //鼠标点击
    event.stopPropagation();
    this.navSearMouseClick = true;
    this.navSearFormVisible = true;
  }

  /**
   * 聊天入口
   */
  loadChat() {
    //显示聊天框
    this.hasUnReadChatMessage = false;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG
    });
    this.OutputCloseSearhComponent.emit();
  }

  jumpToMission() {
    let access = this.companyLength > 0;
    if (!access) {
      return false;
    }
    this.router.navigate(['/mission/list']);
  }

  jumpToVocation() {
    let access = this.isSuperAdmin || this.accessArr.vacation;
    if (!access) {
      return false;
    }
    this.router.navigate(['/vacation/index']);
  }

  jumpToAttendance() {
    let access = this.isSuperAdmin || this.accessArr.attendance;
    if (!access) {
      return false;
    }
    this.router.navigate(['/attendance/index']);
  }

  jumpToStaffManagement() {
    let access = this.isSuperAdmin || this.accessArr.staff_manager;
    if (!access) {
      return false;
    }
    this.router.navigate(['/staff-management/index']);
  }

  jumpToMeeting() {
    let access = this.isSuperAdmin || this.accessArr.meeting_room;
    if (!access) {
      return false;
    }
    this.router.navigate(['/meeting/index']);
  }

  jumpToSpace() {
    let access = this.isSuperAdmin || this.accessArr.space;
    if (!access) {
      return false;
    }
    this.router.navigate(['/space/index']);
  }

  /**
   * 隐藏搜索列表
   */
  navSearchClose() {
    this.navSearMouseClick = false;
    this.navSearFormVisible = true;
    this.searchInput.nativeElement.value = '';
    this.navSearSelect = 'All Types';
    this.navSearchType = 0;
  }

  /**
   * 鼠标经过显示 Invite people to the BI
   */
  navPrompt() {
    this.navPromptToggle = false;
  }

  /**
   * 鼠标点击隐藏 Invite people to the BI
   */
  closeNavPrompt() {
    this.navPromptToggle = true;
  }

  //显示个人联系人列表
  public showContactList(event: any) {
    this.userEvent.emit({showContactList: true});
    event.stopPropagation();
  }

  //显示通知信息
  public showUserNotification() {
    this.userEvent.emit({loadUserNotification: true});
    this.hasUnReadNotificationMessage = false;
  }

  //进入文件管理器
  enterInFolder(event: any) {
    this.router.navigate(['/folder/default']);
  }


  /**
   * 点击展开timeLine
   * @param element
   */
  public clickShowTimeLine(element: any): void {
    this.timeLineList = [];
    if (/hide/.test(element.className)) {
      this.hasInitTimeLine = true;
      this.requestTimeLineInterface();
    } else {
      this.hasInitTimeLine = false;
    }
  }

  /**
   * 请求接口 timeLine
   */
  private requestTimeLineInterface(): void {
    this.userModelService.getTimeLine({}, (response: any) => {
      if (response.status === 1) {
        if (response.data) {
          this.timeLineList = this.initTimeLineTpl(response.data);
          this.timeLineSliceEndIndex = this.timeLineList.length > 12 ? 12 : this.timeLineList.length;
          this.isLoading = false;
          this.bindPageEvent = false;
        }
      }
    })
  }

  /**
   * 初始化 timeLine数据 转化成显示的模板数据
   * @param infoList
   */
  private initTimeLineTpl(infoList: Array<{
    act: number,
    content: string,
    module: number,
    owner: string,
    target: string,
    time: number,
    _id: string,
  }>): Array<TimeLine> {
    let tplArr: Array<TimeLine> = [];
    if (infoList.length) {
      for (let k = 0; k < infoList.length; k++) {
        let item = infoList[k];
        let timeLineTpl = TimeLine.init();
        timeLineTpl.act = item.act;
        timeLineTpl.content = item.content;
        timeLineTpl.owner = item.owner;
        timeLineTpl.target = item.target;
        timeLineTpl.msg_id = item._id;
        timeLineTpl.title = UserNavComponent.initTimeLineTitle(item.act, item.target, this);
        timeLineTpl.timestamp = item.time * 1000;
        timeLineTpl.timeColor = TimeLine.initRandomColor(timeLineTpl.timestamp);
        timeLineTpl.day = this.initDay(timeLineTpl.timestamp);
        timeLineTpl.detailTime = this.initDetailTime(timeLineTpl.timestamp);
        if (tplArr[k - 1]) {
          timeLineTpl.isMerge = tplArr[k - 1].day === timeLineTpl.day;
        }
        tplArr.push(timeLineTpl);
      }
    }
    return tplArr;
  }

  /**
   * 初始化timeLine 标题
   * @param act
   * @param target
   * @returns {string}
   */
  private static initTimeLineTitle(act: number, target: string, self: any): string {
    let left: string = '';
    let right: string =  self.tanslateService.manualTranslate(target.toUpperCase());
    switch (act) {
      case TimeLineConfig.TIMELINE_ACT_CREATE:
        left = self.tanslateService.manualTranslate('CREATE');
        break;
      case TimeLineConfig.TIMELINE_ACT_DELETE:
        left = self.tanslateService.manualTranslate('DELETE');
        break;
      case TimeLineConfig.TIMELINE_ACT_EDIT:
        left = self.tanslateService.manualTranslate('EDIT');
        break;
      case TimeLineConfig.TIMELINE_ACT_UPLOAD:
        left = self.tanslateService.manualTranslate('UPLOAD');
        break;
      default:
        break;
    }
    return `${left} ${right}`;
  }


  /**
   * 初始化timeLine的day
   * @param timestamp
   * @returns {string}
   */
  private initDay(timestamp: number): string {
    let formatStr = 'ddS mmm';
    let todayStr = this.dateService.formatLocal(new Date().getTime(), formatStr);
    let time = this.dateService.formatLocal(timestamp, formatStr);
    return todayStr === time ? 'Today' : time;
  }

  /**
   * 初始化timeLine的具体时间
   * @param timestamp
   * @returns {string}
   */
  private initDetailTime(timestamp: number): string {
    let formatStr = 'HH:MM';
    return this.dateService.formatLocal(timestamp, formatStr);
  }

  /**
   * 改变timeLine slice end 的值
   */
  private changeTimeLineSlice(): void {
    if (this.timeLineList) {
      this.timeLineSliceEndIndex =
        this.timeLineSliceEndIndex + 12 < this.timeLineList.length ?
          this.timeLineSliceEndIndex + 12 : this.timeLineList.length;
      this.isLoading = false;
      this.bindPageEvent = false;
    }
  }

  /**
   * 全局搜索
   */
  onKey(event: any, input: any): void {
    event.stopPropagation();
    if (!this.isInputChinese) {
      this.OutputGlobalSearchResult.emit([event, input.value, this.navSearchType])
    }
  }

  inputChineseCodeStart(event: KeyboardEvent): void {
    this.isInputChinese = true;
  }

  inputChineseCodeEnd(event: KeyboardEvent): void {
    this.isInputChinese = false;
  }

  /**
   *
   * @param {MouseEvent} event
   */
  public clickShowInviteDialog(event: MouseEvent): void {
    event.stopPropagation();
    this.dialogService.openNew({
      mode: '2',
      isAddClass: 'di1-warp-width',
      isSimpleContent: false,
      componentSelector: 'invite-people',
      componentData: {},
      titleAction: 'Invite ',
      titleComponent: 'friends or cooperative partner',
      titleIcon: 'icon-big-invite di-invite-friend',
      titleDesc: [
        'Let us',
        'start',
        'a whole new way of communication! You can invite everyone to join BI!'
      ],
      buttons: [{
        type: 'send',
        btnEvent: 'sendData',
        btnText: 'INVITE',
        btnClass: 'but-invite'
      }],
      beforeCloseEvent: () => {

      }
    });
  }

  onClickAttention(event: any) {
    let access = this.companyLength > 0;
    if (!access) {
      return false;
    }
    this.isAttention = !this.isAttention;
    if (this.companyDataService.getCurrentCompanyCID() != '') {
      this.OutputShowApplication.emit();
    } else {
      this.OutputShowApplication.emit();
    }
  }

  showCompanyFunctionBtn(bool: any) {
    this.renderer.setElementClass(this.companyFunction.nativeElement, 'show', bool);
  }

  getData(data: any) {
    this.navSearFormVisible = false;
  }

}
