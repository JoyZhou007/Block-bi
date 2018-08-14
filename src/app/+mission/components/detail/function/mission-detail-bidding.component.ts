import {Component, OnInit, Inject, Input, Renderer, OnDestroy, ViewChild, Output, EventEmitter} from '@angular/core';
import {Router} from "@angular/router";
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {MissionFunctionBidding} from "../../../../shared/services/model/entity/mission-entity";
import {any} from "codelyzer/util/function";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'read-bidding',
  templateUrl: '../../../template/detail/function/mission-detail-bidding.component.html'
})


export class MissionDetailBiddingComponent implements OnDestroy {

  public missionObj: any;
  public isEditModel: boolean = false;
  public missionConstant: any;
  public biddingInfo: any;
  public biddingStartDate: any;
  public biddingEndDate: any;
  public missionUserInfo: any;
  public isPending: any;
  public isApprover: boolean = false;
  public isBidder: boolean = false;
  public isPublisher: boolean = false;
  public isVoter: boolean = false;
  public isCanVote: boolean = false;
  public voterAmount: any;
  private bidderList: Array<any> = [];
  public currentApproverIndex: number = 0;
  public moveLeft: number = 0;//列表向左移动的距离
  public moveIndex: number = 0;//已经移动隐藏了几个头像
  public userData: any;
  public isWinner: boolean;
  // public isShowCalendar = false;
  public multiCalendar: any = {};

  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDatePeriod: false,
    }
  };

  public selectDate: any;

  private formatStartDate: any = {};
  private formatEndDate: any = {};
  public startTemplate: string = '';
  public endTemplate: string = '';
  public subscription: Subscription;
  public hasTime = false;
  public isShowCalendar: boolean = false;
  private isCalendar: string = '';

  @ViewChild('calendarProfile') private calendarProfile: any;
  @Output() public outCalendarParent = new EventEmitter();

  constructor(public missionModelService: MissionModelService,
              public renderer: Renderer,
              public router: Router,
              @Inject('user-data.service') public userDataService: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {
    this.missionConstant = MissionConstant;
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  @Input() set setMissionDetail(param: any) {
    this.missionObj = this.typeService.clone(param);
  }

  @Input() set setReadType(type: any) {
    this.isEditModel = type;
  }

  ngOnInit() {
    this.getUserIn();
    this.voterAmount = {
      scale: '0',
      user_info: {
        name: '',
        p_name: '',
        psid: '',
        user_profile_path: '',
        isAdd: true
      }
    };
    this.missionUserInfo = {
      psid: '',
      user_profile_path: ' ',
      name: '',
      p_name: ''
    };
    if (this.missionObj.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_BIDDING)) {
      this.biddingInfo = this.missionObj.fns[MissionConstant.MISSION_FUNCTION_BIDDING];
      this.getUserRoles(this.missionObj.roles);
      this.getBiddingTime(this.biddingInfo.bidding_start, 1);
      this.biddingInfo.start = this.biddingInfo.bidding_start;
      this.getBiddingTime(this.biddingInfo.bidding_end, 2);
      this.biddingInfo.end = this.biddingInfo.bidding_end;
      this.getBidderList(this.biddingInfo.bidder);
      this.judgeCanVote(this.biddingInfo.bidding_end);
      this.getEachBidderVoter(this.biddingInfo.bidder);
      this.judgeIsWinner(this.biddingInfo.winnerInfo);
    } else {
      this.biddingInfo = new MissionFunctionBidding().init();
      this.biddingInfo.type = '1';
      this.biddingInfo.start = '';
      this.biddingInfo.end = '';
      this.startTemplate = 'select start time';
      this.endTemplate = 'select end time';
      this.biddingInfo.accept_line = '0';
      this.hasTime = false;
    }
    this.formatDate(this.biddingInfo.bidding_start, 1);
    this.formatDate(this.biddingInfo.bidding_end, 2);


  }

  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_TASK_APPROVER_CHANGE:
        this.getVoteLists(data);
        break;
      case this.notificationService.config.ACTION_TASK_BIDDER_CHANGE:
        this.bidderList = [];
        for (let i in data.data[0]) {
          let a = this.typeService.clone(this.missionUserInfo);
          a.psid = data.data[0][i].id;
          a.name = data.data[0][i].label;
          a.user_profile_path = data.data[0][i].imageLabel
          this.bidderList.push(a);
        }
        break;
    }
  }

  /**
   * 获取bidding start end 时间
   */
  getBiddingTime(data: any, type: number) {
    if (type === 1) {
      let startDayTime = this.dateService.formatWithTimezone(data, 'ddS');
      let startMonthTime = this.dateService.formatWithTimezone(data, 'mmmm');
      let startYearTime = this.dateService.formatWithTimezone(data, 'yyyy');
      let startHourTime = this.dateService.formatWithTimezone(data, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(data, 'MM');
      this.startTemplate = startHourTime + ':' + startMinuteTime + ' ' + startDayTime + ' ' + startMonthTime + ' ' + startYearTime
      this.hasTime = true;
    } else if (type === 2) {
      let endDayTime = this.dateService.formatWithTimezone(data, 'ddS');
      let endMonthTime = this.dateService.formatWithTimezone(data, 'mmm');
      let endYearTime = this.dateService.formatWithTimezone(data, 'yyyy');
      let endWeekTime = this.dateService.formatWithTimezone(data, 'dddd');
      let endHourTime = this.dateService.formatWithTimezone(data, 'HH');
      let endMinuteTime = this.dateService.formatWithTimezone(data, 'MM');
      this.endTemplate = endHourTime + ':' + endMinuteTime + ' ' + endDayTime + ' ' + endMonthTime + ' ' + endYearTime
      this.hasTime = true;
    }
  }


  /**
   * 只能输入数字
   * @param event
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }

  /**
   * 点击显示日历
   */
  showCalendar(event: any, param: string) {
    event.stopPropagation();
    this.outCalendarParent.emit();
    if(this.isShowCalendar && this.isCalendar !== param) {
      this.isShowCalendar = true;
    }else {
      this.isShowCalendar = !this.isShowCalendar;
    }
    this.isCalendar = param;
    this.multiCalendar = {
      isBidding: true,
      isClickStart: param === 'start',
      isClickEnd: param === 'end',
      data: this.biddingInfo,
      dateTemplate: this.dateTemplate,
      isShow:true,
      subtractValue: 80,
      parentElement: event,
      currentShowElement: this.calendarProfile.nativeElement,
      positionRight:true
    }
  }

  /**
   * 点击日历回调时间数据
   */
  getSelectData(data: any) {
    // this.isShowCalendar = false;
    this.selectDate = data;
    this.formatEndDate = this.selectDate.endDate;
    this.formatStartDate = this.selectDate.startDate;
    this.dateService.formatCalendarData(this.selectDate);
    this.dateTemplate.start.isShowDateTime = this.selectDate.startDate.year === '' ? false : true;
    this.dateTemplate.end.isShowDateTime = this.selectDate.endDate.year === '' ? false : true;
    this.selectDate.startDate.monthString = this.dateService.format(this.selectDate.startDate.formatDateString, 'mmmm');
    this.selectDate.startDate.dayString = this.dateService.formatWithTimezone(this.selectDate.startDate.formatDateString, 'ddS');
    this.selectDate.endDate.monthString = this.dateService.format(this.selectDate.endDate.formatDateString, 'mmmm');
    this.selectDate.endDate.dayString = this.dateService.formatWithTimezone(this.selectDate.endDate.formatDateString, 'ddS');
    this.biddingInfo.start = this.selectDate.startDate.formatUtcString;
    this.biddingInfo.end = this.selectDate.endDate.formatUtcString;
    let a: any = this.selectDate.startDate;
    let b: any = this.selectDate.endDate;
    this.startTemplate = this.dateTemplate.start.isShowDateTime ? a.hour + ':' + a.minute + ' ' + a.dayString + ' ' + a.monthString + ' ' + a.year : 'select start time';
    this.endTemplate = this.dateTemplate.end.isShowDateTime ? b.hour + ':' + b.minute + ' ' + b.dayString + ' ' + b.monthString + ' ' + a.year : 'select end time';
    this.hasTime = true;
  }

  /**
   * 计算每个人的百分比标
   */
  calculateBidding(data: any) {
    let amountCount: number = 0;
    for (let i = 0; i < this.biddingInfo.amount.length - 1; i++) {
      amountCount = amountCount + parseInt(this.biddingInfo.amount[i].scale);
      this.biddingInfo.amount[this.biddingInfo.amount.length - 1].scale = (100 - amountCount).toString();
    }
  }

  changeAcceptLine(data: any) {
    if (data === 'min' && parseInt(this.biddingInfo.accept_line) > 1) {
      this.biddingInfo.accept_line = (parseInt(this.biddingInfo.accept_line) - 1).toString();
    } else if (data === 'add' && parseInt(this.biddingInfo.accept_line) < 100) {
      this.biddingInfo.accept_line = (parseInt(this.biddingInfo.accept_line) + 1).toString();
    }
  }

  /**
   * 接收线超过100默认为100
   * @param data
   */
  calculateAcceptLine(data: any) {
    if ((parseInt(data) > 100)) {
      this.biddingInfo.accept_line = '100';
    }
  }

  /**
   * 获得用户的角色信息
   */
  getUserRoles(data: Array<any>) {
    for (let i in data) {
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_BIDDER)) {
        this.isBidder = true;
      }
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_APPROVER)) {
        this.isApprover = true;
      }
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_VOTER)) {
        this.isVoter = true;
      }
      if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_PUBLISHER)) {
        this.isPublisher = true;
      }
    }
  }

  /**
   * 获得投票者信息
   */
  getVoteLists(data: any) {
    let originalAmount = this.typeService.clone(this.biddingInfo.amount);
    this.biddingInfo.amount = [];
    for (let i in data.data[0]) {
      let a = this.typeService.clone(this.voterAmount);
      a.user_info.psid = data.data[0][i].id;
      a.user_info.name = data.data[0][i].label;
      a.user_info.p_name = data.data[0][i].desc;
      a.user_info.user_profile_path = data.data[0][i].imageLabel;
      this.biddingInfo.amount.push(a);
    }
    for (let i in  this.biddingInfo.amount) {
      for (let k in originalAmount) {
        if (this.biddingInfo.amount[i].user_info.psid === originalAmount[k].user_info.psid) {
          this.biddingInfo.amount[i].scale = originalAmount[k].scale;
        }
      }
    }
  }


  /**
   * 获取bidder信息
   */
  getBidderList(data: any) {
    this.bidderList = [];
    for (let i in data) {
      data[i].moveLeft = 0;
      this.bidderList.push(data[i].user_info);
    }
  }

  /**
   * 获得每个bidder里面的投票者信息
   */
  getEachBidderVoter(data: any) {
    for (let i  in data) {
      data[i].vote_info = [];
      for (let k in this.biddingInfo.amount) {
        if (data[i].user_info.psid === this.biddingInfo.amount[k].vote_psid) {
          data[i].vote_info.push(this.biddingInfo.amount[k]);
        }
      }
      for (let j in this.biddingInfo.winnerInfo) {
        if (data[i].user_info.psid === this.biddingInfo.winnerInfo[j].user_info.psid) {
          data[i].isWinner = true;
        }
      }
    }
  }

  /**
   * 判断当前登录这是否是bidder的winner
   */
  judgeIsWinner(data: any) {
    for (let j in this.biddingInfo.winnerInfo) {
      if (this.userDataService.getCurrentCompanyPSID() === this.biddingInfo.winnerInfo[j].user_info.psid) {
        this.isWinner = true;
      }
    }


  }

  /**
   * 整理时间格式
   * @param startDate
   * @param type
   */
  formatDate(startDate: any, type: number) {
    if (startDate === MissionConstant.MISSION_TIME_NULL) {
      this.isPending = true;
      startDate = this.dateService.nowDateFormat('yyyy-mm-dd HH:MM:ss');
    }
    let startDayTime = this.dateService.formatWithTimezone(startDate, 'dd');
    let startMonthTime = this.dateService.formatWithTimezone(startDate, 'mmm');
    let startYearTime = this.dateService.formatWithTimezone(startDate, 'yyyy');
    let startWeekTime = this.dateService.formatWithTimezone(startDate, 'dddd');
    let startHourTime = this.dateService.formatWithTimezone(startDate, 'HH');
    let startMinuteTime = this.dateService.formatWithTimezone(startDate, 'MM');
    if (type === 1) {
      this.biddingStartDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    } else if (type === 2) {
      this.biddingEndDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
    }
  }

  /**
   * 判断当前是否进入封标期(voter是否可以投票)
   */
  judgeCanVote(endTime: any) {
    let currentDate: string = new Date().toUTCString();
    let currentTime: number = Date.parse(currentDate);
    let biddingEndTime: number = Date.parse(endTime);
    if (currentTime < biddingEndTime) {
      this.isCanVote = false;
    } else {
      this.isCanVote = true;
    }
  }

  /**
   * 选择这个mission
   */
  chooseTheBidder(bidder: any) {
    let settings = {
      mode: '1',
      title: ' QUIT CREATE MISSION',
      isSimpleContent: true,
      simpleContent: 'Are you sure to choose the bidder?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'CONFIRM',
          btnEvent: () => {
            this.missionModelService.biddingVote({
              votePsid: bidder.user_info.psid,
              mid: this.missionObj.mid
            }, (res) => {
              if (res.status === 1) {
                this.router.navigate(['mission/list']);
              } else {
                this.dialogService.openWarning({simpleContent:'vote failed!'});
              }
            });
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 验证bidder 里面表单是否正确
   * @constructor
   */
  VerificationBiddingData() {
    let count: number = 0;
    let sum: number = 0;
    for (let i in this.biddingInfo.amount) {
      if (parseInt(this.biddingInfo.amount[i].scale) > 0 && parseInt(this.biddingInfo.amount[i].scale) < 100) {
        count++;
      }
      sum += parseInt(this.biddingInfo.amount[i].scale);
    }
    if (count === this.biddingInfo.amount.length && sum === 100) {
      return true;
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The vote data is not correct'
      };
      this.dialogService.openWarning(settings);
    }
  }


  /**
   * 切换bidding 的状态
   */
  switchBiddingType(type: string) {
    if (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING
    ) {
      if (type === 'UNANIMOUS') {
        this.biddingInfo.type = '1';
      } else if (type === '%') {
        this.biddingInfo.type = '2';
        if (this.biddingInfo.amount.length === 0) {
          for (let i in this.missionObj.detail.approver) {
            let a = this.typeService.clone(this.voterAmount);
            a.user_info.psid = this.missionObj.detail.approver[i].psid;
            a.user_info.name = this.missionObj.detail.approver[i].name;
            a.user_info.p_name = this.missionObj.detail.approver[i].p_name;
            a.user_info.isAdd = false;
            a.user_info.user_profile_path = this.missionObj.detail.approver[i].user_profile_path;
            this.biddingInfo.amount.push(a);
          }
        }
      } else if (type === 'VOTE') {
        this.biddingInfo.type = '3';
      }
    }
  }

  /**
   * 移动Approver
   */
  moveVoter(page: number, type: string, data?: any) {
    if (type === 'list') {
      if (page === -1) {
        if (data.moveLeft / 30 < 0) {
          data.moveLeft += 30;
        }
      } else if (page === 1) {
        if (data.moveLeft / 30 > (0 - (data.vote_info.length - 1))) {
          data.moveLeft -= 30;
        }
      }
    } else if (type === 'voter') {
      if (page === -1) {
        if (this.moveIndex === 0) {
          return false;
        }
        if (this.moveIndex > 0) {
          this.moveIndex--;
        }
        this.moveLeft += 28;
      } else if (page === 1) {
        if (this.moveIndex >= this.biddingInfo.amount.length - 5) {
          return false;
        } else {
          this.moveIndex++;
        }
        this.moveLeft -= 28;
      }
    }


  }

  /**
   * 点击voter头像 变大并显示 其权重值
   * @param index
   */
  showApproverData(index: any) {
    this.currentApproverIndex = index;
  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }

}