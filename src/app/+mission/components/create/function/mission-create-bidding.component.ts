import {Component, OnInit, Inject, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {DateService} from "../../../../shared/services/common/data/date.service";

@Component({
  selector: 'create-bidding',
  templateUrl: '../../../template/create/function/mission-create-bidding.component.html'
})

export class MissionCreateBiddingComponent {

  public approveList: Array<any>;
  public bidderList: Array<any>;
  public isUnanimous: boolean = true;
  public isPercent: boolean = false;
  public isVote: boolean = false;
  public biddingCreateData: any;
  public missionUserInfo: any;
  public amountData: any;
  public formatDate: any;
  public multiCalendar: any = {};
  public dateTemplate: any = {
    start: {
      isShowDateTime: true, //是否选择了时间
    },
    end: {
      isShowDatePeriod: false,
    }
  };


  public isShowCalendar: boolean = false;
  public selectDate: any;
  private formatStartDate: any = {};
  private formatEndDate: any = {};
  public startTemplate: string =  this.translate.manualTranslate('select start time');
  public endTemplate: string = this.translate.manualTranslate('select end time');
  public hasTime = false;
  private isCalendar: string = '';

  @ViewChild('calendarProfile') private calendarProfile: any;
  @Output() public outCalendarParent = new EventEmitter();

  constructor(@Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('type.service') public typeService: any) {
  }


  //页面初始化
  ngOnInit() {
    this.amountData = {
      scale: '',
      user_info: {}
    };
    this.biddingCreateData = {
      start: '',
      end: '',
      bidder: [],
      type: '1',
      amount: [],
      accept_line: '0'
    };
    this.missionUserInfo = {
      psid: '',
      user_profile_path: ' ',
      name: '',
      p_name: ''
    }
  }


  /**
   * setParams
   * @param param
   */
  @Input() set setParams(param: any) {
    this.approveList = param;
  }

  @Input() set setBidder(param: any) {
    this.bidderList = param;
  }


  /**
   * 切换bidding 的状态
   */
  switchBiddingType(type: string) {
    if (type === 'UNANIMOUS') {
      this.isUnanimous = true;
      this.isPercent = false;
      this.isVote = false;
      this.biddingCreateData.type = '1'
    } else if (type === '%') {
      this.isUnanimous = false;
      this.isPercent = true;
      this.isVote = false;
      this.biddingCreateData.type = '2'
    } else if (type === 'VOTE') {
      this.isUnanimous = false;
      this.isPercent = false;
      this.isVote = true;
      this.biddingCreateData.type = '3';
    }
  }

  /**
   * 计算每个人的百分比标
   */
  calculateBidding(data: any) {
    let amountCount: number = 0;
    if ((parseInt(data)) > 100) {
      data = 100;
    } else {
      for (let i = 0; i < this.approveList.length - 1; i++) {
        amountCount = amountCount + parseInt(this.approveList[i].data);
        this.approveList[this.approveList.length - 1].data = (100 - amountCount).toString();
      }
    }
  }

  /**
   *获取bidding 的数据
   */
  getBiddingCreateData() {
    this.biddingCreateData.bidder = [];
    this.biddingCreateData.amount = [];
    for (let k in this.approveList) {
      let a: any;
      a = this.typeService.clone(this.missionUserInfo);
      a.psid = this.approveList[k].id;
      let b: any;
      b = this.typeService.clone(this.amountData);
      b.scale = this.approveList[k].data;
      b.user_info = a;
      this.biddingCreateData.amount.push(b);
    }
    for (let k in this.bidderList) {
      let a: any;
      a = this.typeService.clone(this.missionUserInfo);
      a.psid = this.bidderList[k].id;
      a.user_profile_path = this.bidderList[k].imageLabel;
      a.name = this.bidderList[k].label;
      this.biddingCreateData.bidder.push(a);
    }
  }

  /**
   * 点击++--更换接收线
   * @param data
   */
  changeAcceptLine(data: any) {
    if (data === 'min' && parseInt(this.biddingCreateData.accept_line) > 1) {
      this.biddingCreateData.accept_line = parseInt(this.biddingCreateData.accept_line) - 1;
    } else if (data === 'add' && parseInt(this.biddingCreateData.accept_line) < 100) {
      this.biddingCreateData.accept_line = parseInt(this.biddingCreateData.accept_line) + 1;
    }
  }

  /**
   * 接收线超过100默认为100
   * @param data
   */
  calculateAcceptLine(data: any) {
    if ((parseInt(data) > 100)) {
      this.biddingCreateData.accept_line = '100';
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
      data: this.biddingCreateData,
      dateTemplate: this.dateTemplate,
      isShow:true,
      subtractValue: 80,
      parentElement: event,
      currentShowElement: this.calendarProfile.nativeElement,
      positionRight:true
    };
  }

  /**
   * 点击日历回调时间数据
   */
  getSelectData(data: any) {
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
    this.biddingCreateData.start = this.selectDate.startDate.formatUtcString;
    this.biddingCreateData.end = this.selectDate.endDate.formatUtcString;
    let a: any = this.selectDate.startDate;
    let b: any = this.selectDate.endDate;
    this.startTemplate = this.dateTemplate.start.isShowDateTime ? a.hour + ':' + a.minute + ' ' + a.dayString + ' ' + a.monthString + ' ' + a.year : 'select start time';
    this.endTemplate = this.dateTemplate.end.isShowDateTime ? b.hour + ':' + b.minute + ' ' + b.dayString + ' ' + b.monthString + ' ' + b.year : 'select end time';
    this.hasTime = true;
  }


  getOutDefault() {
    this.isShowCalendar = false;
  }

}

