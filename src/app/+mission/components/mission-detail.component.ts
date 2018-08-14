import {
  Component, ViewEncapsulation, Inject, ViewChild, OnInit, HostListener, OnDestroy, Renderer,
  ViewContainerRef
} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {MissionModelService, DateService, TypeService} from "../../shared/services/index.service";
import * as MissionConstant from '../../shared/config/mission.config';
import * as AlarmConfig from '../../shared/config/alarm.config';
import {
  MissionDetailAPIModel, MissionFunctionObserver,
  MissionFunctionMemoRecorder, MissionFunctionImportance, MissionFunctionTarget, MissionFunctionExpense,
  MissionFunctionBidding, MissionFunctionTracking,
} from "../../shared/services/model/entity/mission-entity";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'mission-detail',
  templateUrl: '../template/mission-detail.component.html',
  styleUrls: [
    '../../../assets/css/mission/mission.css',
    '../../../assets/css/mission/mission-read.css',
    '../../../assets/css/mission/mission-create.css',
    '../../../assets/css/date/date.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MissionModelService]
})

export class MissionDetailComponent implements OnDestroy {
  public isProject: boolean = false;
  public isApplication: boolean = false;
  public isTask: boolean = false;
  public isAssignment: boolean = false;
  public isMeeting: boolean = false;
  public currentId: string = '';
  public currentType: string = '';
  public currentTypeTitle: string = '';
  public missionObj: MissionDetailAPIModel;
  public missionObjClone: MissionDetailAPIModel;
  public missionConstant: any = {};
  public displayButton: any = {};
  //button按钮的显示
  public isShowUpload: boolean = false;
  public isShowCancel: boolean = false;
  public isShowCheck: boolean = false;
  public isShowComplete: boolean = false;
  public isShowPause: boolean = false;
  public isShowRefuse: boolean = false;
  public isShowAccept: boolean = false;
  public isShowRestart: boolean = false;
  public isShowTargetUpload: boolean = false;
  public isShowVote: boolean = false;

  //是否进入编辑模式
  public isEditModel: boolean = false;
  //functions
  public isUnlockRecorder: boolean = false;
  public isUnlockImportance: boolean = false;
  public isUnlockTrack: boolean = false;
  public isUnlockTarget: boolean = false;
  public isUnlockBidding: boolean = false;
  public isUnlockExpense: boolean = false;
  public isUnlockParticipant: boolean = false;
  //mission更新数据
  public missionUpdateInfo: any = {};
  public isShowEditInput: boolean = false;
  public originalName: string;
  public isShowPencil: boolean = false;
  public isShowOnTable: boolean = false;
  public formatStartDate: any = {};
  public formatEndDate: any = {};
  public importanceValue: string;
  //link相关
  public isShowLinkList: boolean = false;
  public linkMissionList: Array<any>;
  public linkInfoName: string = '';
  //用户角色相关
  public isPublisher: boolean;
  public isApprover: boolean;
  public isOperator: boolean;
  public isBidder: boolean;
  public isVoter: boolean;
  public isConferee: boolean;
  public isObserver: boolean;
  public isMemo: boolean;
  public isWorkflowApprover: boolean;
  public userRoleIntro: string = '';
  public isCanUpload: boolean = true;
  public selectDate: any = {};
  public calendarOption: any;
  public isShowCalendar: boolean = false;//显示日历
  public multiCalendar: any = {};
  public isShowDatePeriodUnit: boolean = false;
  public dateUnit: Array<any>;  //时间单位
  public dateTemplate: any = {
    start: {
      defaultContent: '',
      isAbleLink: false,
      isShowNowBtn: false,
      isShowCloseBtn: false,
      isAbleSelectDate: false,
      isShowDateTime: false,
      isNow: false, //是否当前显示NOW
      isHasLink: false,
      linkArr: []
    },
    end: {
      defaultContent: '',
      isShowDatePeriod: false,
      isShowCloseBtn: false,
      isAbleSelectDate: false,
      isShowDateTime: false,
      date_period: {
        data: '',  //period值
        unit: 'Months' //单位
      }
    }
  };

  public isShowAlarmSelect: boolean = false;  //显示闹钟下拉菜单
  public isShowCalendarRepeat: boolean = false;//显示calendar repeat
   public isShowCalendarFix: boolean = false;//显示calendar fix
  public fixInputData: any = {};//接受fix闹钟传来的数据

  /** 传入calendar repeat的对象
   *  {data：mission对象,}
   */
  public repeatData: any = {};
  public fixData: any = {};
  public weekArr: Array<any> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public monthSuffix: Array<any> = [
    'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
    'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd',
    'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'
  ];

  public subscription: Subscription;
  public isMissionShow: boolean = false;
  private el: any;
  private clickFix: boolean = true;

  @ViewChild('detailMeeting') public detailMeeting: any;
  @ViewChild('detailApplication') public detailApplication: any;
  @ViewChild('detailProject') public detailProject: any;
  @ViewChild('detailAssignment') public detailAssignment: any;
  @ViewChild('detailTask') public detailTask: any;

  @ViewChild('detailImportance') public detailImportance: any;
  @ViewChild('detailRecorder') public detailRecorder: any;
  @ViewChild('detailTrack') public detailTrack: any;
  @ViewChild('detailExpense') public detailExpense: any;
  @ViewChild('detailParticipant') public detailParticipant: any;
  @ViewChild('detailTarget') public detailTarget: any;
  @ViewChild('detailBidding') public detailBidding: any;
  @ViewChild('detailFolder') public detailFolder: any;


  @ViewChild('calendarProfile') public calendarProfile: any;

  //画mission的容器
  @ViewChild('myTargetDiv', {read: ViewContainerRef}) viewBox;
  //显示schedule的list
  public chooseList: Array<any> = [];
  //显示schedule
  public showSchedule: boolean = false;
  private isZhLan: boolean;
  private btnFail: string = '';
  private isCalendar: string = '';

  constructor(public router: Router,
              private renderer: Renderer,
              public activatedRoute: ActivatedRoute,
              public missionModelService: MissionModelService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('app.config') public config: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: TypeService,
              @Inject('date.service') public dateService: DateService,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('dialog.service') public dialogService: any) {
    this.missionConstant = MissionConstant;
    this.activatedRoute.params.subscribe((param: any) => {
      if (param.hasOwnProperty('mid')) {
        this.currentId = param['mid'];
      } else {
        this.router.navigate(['mission/list']);
      }
    });
    this.getMissionDetailInfo();

  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowLinkList = false;
    this.isShowCalendar = false;
    this.isShowEditInput = false;
    this.isShowDatePeriodUnit = false;
    this.isShowAlarmSelect = false;
    this.isShowCalendarRepeat = false;
     this.isShowCalendarFix = false;
  }


  ngOnInit() {
    this.setDateUnit();
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getMissionDetailInfo() {
    if (this.currentId) {
      let d = {mid: this.currentId};
      this.missionModelService.missionDetail(d, (response: any) => {
        if (response.status === 1) {
          this.missionObj = new MissionDetailAPIModel().init();
          this.typeService.bindData(this.missionObj, response.data);
          this.missionObjClone = this.typeService.clone(this.missionObj);
          if (!this.currentType) {
            this.currentType = this.missionObj.type;
          }
          this.dealMissionDetailData(this.missionObj);
        } else if (response.status === 400) {
          this.dialogService.openNoAccess();
        }
      });
    }
  }

  dealMissionDetailData(missionObj: any) {
    this.detectType();
    this.detectButtonList();
    this.getFunction(missionObj);
    this.getLinkInfo(missionObj.link_info);
    this.getUserRoles(missionObj.roles);
    //判断mission是否是repeat，并显示时间
    this.isRepeatAlarm();
    this.multiCalendar.data = missionObj;
    //传入calendar的数据
    this.calendarOption = {
      data: missionObj,
      start: missionObj.start,
      end: missionObj.end,
      isMissionDetail: true
    };
    //传入calendar repeat
    this.repeatData = {
      data: this.missionObj,
      isShow:true
    };
    this.isShowOnTable = missionObj.promoted == '1'? true : false
  }


  /**
   * 判断mission是否是repeat，并显示时间    alarm_type 1: repeat 2: fix
   */
  isRepeatAlarm() {
    let every: string;
    if (this.missionObj.has_alarm && this.missionObj.effective_time) {
      if (this.missionObj.alarm_type == AlarmConfig.MODE_REPEAT) {//是repeat
        if (this.missionObj.repeat == 1) {//选择的是天
          if (this.missionObj.every == 1) {
            every = 'A day';
          } else if (this.missionObj.every == 2) {
            every = 'Two days';
          } else if (this.missionObj.every == 3) {
            every = 'Three days';
          } else if (this.missionObj.every == 4) {
            every = 'Four days';
          }
        } else if (this.missionObj.repeat == 2) { //选择的是week
          every = this.weekArr[this.missionObj.every - 1];
        } else if (this.missionObj.repeat == 3) { //选择的是month
          every = this.missionObj.every + this.monthSuffix[this.missionObj.every - 1];
        }
        let nowDate = new Date();
        let now = new Date(nowDate.toLocaleDateString()).getTime();
        let end: number = now + this.missionObj.effective_time * 1000 - nowDate.getTimezoneOffset() * 60 * 1000//要提示的时间戳
        if (end >= 16 * 60 * 60 * 1000) {   //如果是小于8:00
          end = end - 24 * 3600 * 1000;
        }
        this.missionObj.effective_time_display = every + " " + this.getDateStr(end, 'HH:MMtt');
      } else {
        if (this.missionObj.effective_time) {//是fix

          this.missionObj.effective_time_display = this.getDateStr(this.missionObj.effective_time * 1000);
        }
      }
    }
  }

  /**
   * 决定显示什么类型的内容
   */
  public detectType() {
    switch (this.currentType) {
      case MissionConstant.MISSION_TYPE_APPLICATION:
        this.isApplication = true;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: false,
            isShowCloseBtn: true,
            isAbleSelectDate: false,
            isNow: false, //是否当前显示NOW
            isHasLink: false,
            linkArr: []
          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: false,
            isAbleSelectDate: false,
            isShowDateTime: false,
            date_period: {
              data: '',  //period值
              unit: 'Months' //单位
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_PROJECT:
        this.isProject = true;
        this.dateTemplate = {
          start: {
            defaultContent: 'PLANNING',
            isAbleLink: false,
            isShowNowBtn: false,
            isShowCloseBtn: false,
            isAbleSelectDate: false,
            isNow: false, //是否当前显示NOW
            isHasLink: false,
            linkArr: []
          },
          end: {
            defaultContent: 'PLANNING',
            isShowDatePeriod: false,
            isShowCloseBtn: false,
            isAbleSelectDate: false,
            isShowDateTime: false,
            date_period: {
              data: '',  //period值
              unit: 'Months' //单位
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_MEETING:
        this.isMeeting = true;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isNow: false, //是否当前显示NOW
            isHasLink: false,
            linkArr: []
          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: true,
            isShowDateTime: true,
            isAbleSelectDate: true
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_ASSIGNMENT:
        this.isAssignment = true;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isNow: false, //是否当前显示NOW
            isHasLink: false,
            linkArr: []
          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isShowDateTime: false,
            date_period: {
              data: '',  //period值
              unit: 'Months' //单位
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_TASK:
        this.isTask = true;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isNow: false, //是否当前显示NOW
            isHasLink: false,
            linkArr: []

          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isShowDateTime: false,
            date_period: {
              data: '',  //period值
              unit: 'Months' //单位
            }
          }
        };


        break;
      default:
        break;
    }
    this.currentTypeTitle = MissionDetailAPIModel.getTypeTitle(this.currentType);
  }

  /**
   * 确定显示的buttons
   */
  detectButtonList() {
    this.displayButton = this.missionObj.available_btns;
    if (this.displayButton.upload) {
      this.isShowUpload = true;
    }
    if (this.displayButton.cancel) {
      this.isShowCancel = true;
    }
    if (this.displayButton.refuse) {
      this.isShowRefuse = true;
    }
    if (this.displayButton.restart) {
      this.isShowRestart = true;
    }
    if (this.displayButton.complete) {
      this.isShowComplete = true;
    }
    if (this.displayButton.pause) {
      this.isShowPause = true;
    }
    if (this.displayButton.check) {
      this.isShowCheck = true;
    }
    if (this.displayButton.accept) {
      this.isShowAccept = true;
    }
    if (this.displayButton.target_upload) {
      this.isShowTargetUpload = true;
    }
    if (this.displayButton.vote) {
      this.isShowVote = true;
    }
  }

  /**
   * 处理通知
   */
  dealMessage(data: any) {
    switch (data.act) {
      case this.notificationService.config.ACTION_MISSION_FUNCTION_PARTICIPANT:
        this.isUnlockParticipant = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_RECORDER:
        this.isUnlockRecorder = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_TARGET:
        this.isUnlockTarget = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_IMPORTANCE:
        this.isUnlockImportance = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_BIDDING:
        this.isUnlockBidding = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_EXPENSE:
        this.isUnlockExpense = data.data;
        break;
      case this.notificationService.config.ACTION_MISSION_FUNCTION_TRACK:
        this.isUnlockTrack = data.data;
        break;

    }
  }

  /**
   * 整体编辑这个Mission
   */
  doEditTheMission(event: any) {
    event.stopPropagation();
    this.isEditModel = true;
    if (this.detailMeeting) {
      this.detailMeeting.isEditModel = true;
    }
    if (this.detailApplication) {
      this.detailApplication.isEditModel = true;
    }
    if (this.detailProject) {
      this.detailProject.isEditModel = true;
    }
    if (this.detailAssignment) {
      this.detailAssignment.isEditModel = true;
    }
    if (this.detailTask) {
      this.detailTask.isEditModel = true;
    }
    if (this.detailExpense) {
      this.detailExpense.isEditModel = true;
    }
    if (this.detailBidding) {
      this.detailBidding.isEditModel = true;
    }
    if (this.detailTarget) {
      this.detailTarget.isEditModel = true;
    }
    this.doFormatTime(1);
  }


  /**
   * format时间
   */
  doFormatTime(type: number) {
    // 获取 mission 开始时间
    let startDate = this.missionObj.start;
    //  获取mission 结束时间
    let endDate = this.missionObj.end;
    if (type === 1) {
      //获取开始时间
      if (startDate === MissionConstant.MISSION_TIME_NULL || this.dateTemplate.start.isHasLink) {
        this.dateTemplate.start.isShowDateTime = false;
        this.dateTemplate.end.defaultContent = 'PENDING';
      } else {
        this.dateTemplate.start.isShowDateTime = true;
      }
      //获取结束时间
      //如果有date_period 显示date_period  没有 显示时间 或者pending ;
      if (this.missionObj.date_period !== '0') {
        this.dateTemplate.end.isShowDatePeriod = true;
        this.dateDiff(this.missionObj.date_period);
        this.dateTemplate.end.isShowDateTime = false;
      } else {
        if (endDate === MissionConstant.MISSION_TIME_NULL) {
          this.dateTemplate.end.isShowDateTime = false;
          this.dateTemplate.end.defaultContent = 'PENDING';
        } else {
          this.dateTemplate.end.isShowDateTime = true;
        }
      }
    }
    let startDayTime = this.dateService.formatWithTimezone(startDate, 'dd');
    let startMonthTime = this.dateService.formatWithTimezone(startDate, 'mmm');
    let startYearTime = this.dateService.formatWithTimezone(startDate, 'yyyy');
    let startWeekTime = this.dateService.formatWithTimezone(startDate, 'dddd');
    let startHourTime = this.dateService.formatWithTimezone(startDate, 'HH');
    let startMinuteTime = this.dateService.formatWithTimezone(startDate, 'MM');
    this.formatStartDate = {
      monthDay: startDayTime,
      week: startWeekTime,
      stringMonth: startMonthTime,
      minute: startMinuteTime,
      hour: startHourTime,
      year: startYearTime
    };

    let endDayTime = this.dateService.formatWithTimezone(endDate, 'dd');
    let endMonthTime = this.dateService.formatWithTimezone(endDate, 'mmm');
    let endYearTime = this.dateService.formatWithTimezone(endDate, 'yyyy');
    let endWeekTime = this.dateService.formatWithTimezone(endDate, 'dddd');
    let endHourTime = this.dateService.formatWithTimezone(endDate, 'HH');
    let endMinuteTime = this.dateService.formatWithTimezone(endDate, 'MM');
    this.formatEndDate = {
      monthDay: endDayTime,
      week: endWeekTime,
      stringMonth: endMonthTime,
      minute: endMinuteTime,
      hour: endHourTime,
      year: endYearTime
    };
  }


  /**
   * 点击铅笔出现编辑框
   */
  doShowInput(event: any) {
    event.stopPropagation();
    this.originalName = this.missionObj.name;
    this.isShowPencil = false;
    this.isShowEditInput = true;
  }

  /**
   * 按下回车 或者 ESC 确认 name
   */
  confirmMissionName(event: any) {
    if (event.keyCode === 13) {
      this.isShowEditInput = false;
    } else if (event.keyCode === 27) {
      this.isShowEditInput = false;
      this.missionObj.name = this.originalName;
    }
  }

  /**
   * 在首页显示
   */
  showOnTable() {
     this.isShowOnTable = !this.isShowOnTable;
  }

  /**
   * 获取date_period_unit
   */
  setDateUnit() {
    this.dateUnit = MissionDetailAPIModel.getDateUnit()
  }


  /**
   * 阻止时间冒泡专用
   */
  doStopPropagation(event: any) {
    event.stopPropagation();
  }


  /**
   * 回退到首页
   */
  backToMissionList() {
    this.router.navigate(['mission/list']);
  }


  /**
   * 获取开启的function
   */
  getFunction(data: any) {
    let fns = data.fns;
    this.isUnlockRecorder = false;
    this.isUnlockImportance = false;
    this.isUnlockTrack = false;
    this.isUnlockTarget = false;
    this.isUnlockExpense = false;
    this.isUnlockBidding = false;
    this.isUnlockParticipant = false;
    for (let key in fns) {
      if (key === MissionConstant.MISSION_FUNCTION_MEMO_RECORDER) {
        this.isUnlockRecorder = true;
      }
      if (key === MissionConstant.MISSION_FUNCTION_IMPORTANCE) {
        this.isUnlockImportance = true;
        this.importanceValue = fns[key].value;
      }
      if (key === MissionConstant.MISSION_FUNCTION_TRACKING) {
        this.isUnlockTrack = true;
      }
      if (key === MissionConstant.MISSION_FUNCTION_TARGET) {
        this.isUnlockTarget = true;
      }
      if (key === MissionConstant.MISSION_FUNCTION_EXPENSE) {
        this.isUnlockExpense = true;
      }
      if (key === MissionConstant.MISSION_FUNCTION_BIDDING) {
        this.isUnlockBidding = true;
      }
      if (key === MissionConstant.MISSION_FUNCTION_OBSERVER) {
        this.isUnlockParticipant = true;
      }
    }
  }


  /**
   * 取消编辑
   */
  cancelEdit(event: any) {
    event.stopPropagation();
    this.isEditModel = false;
    if (this.detailMeeting) {
      this.detailMeeting.isEditModel = false;
    }
    if (this.detailApplication) {
      this.detailApplication.isEditModel = false;
    }
    if (this.detailProject) {
      this.detailProject.isEditModel = false;
    }
    if (this.detailAssignment) {
      this.detailAssignment.isEditModel = false;
    }
    if (this.detailTask) {
      this.detailTask.isEditModel = false;
    }
    if (this.detailExpense) {
      this.detailExpense.isEditModel = false;
    }
    if (this.detailBidding) {
      this.detailBidding.isEditModel = false;
    }
    if (this.detailTarget) {
      this.detailTarget.isEditModel = false;
    }
    this.missionObj = this.typeService.clone(this.missionObjClone);
    this.dealMissionDetailData(this.missionObj);
  }


  /**
   * 重新UPLOAD当前Mission
   * @param element 按钮标签
   * @param param mission类型
   */
  upLoadMission(element: any, param: string) {
    let missionUpdateData = this.missionObj;
    if (this.missionObj.name === '') {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      this.renderer.setElementClass(element, 'but-fail', true);
      this.btnFail ='The Mission Name cannot be empty';
      setTimeout(() => {
        this.renderer.setElementClass(element, 'but-fail', false);
        this.btnFail = '';
      },this.config.btnFailTime);
    } else {
      if (this.isShowOnTable) {
        missionUpdateData.promoted = '1';
      } else {
        missionUpdateData.promoted = '0';
      }
      //文件id
      //mission 的开始/结束时间
      if (this.dateTemplate.start.isHasLink) {  //有link 的时候 传link 并且传 date_period
        missionUpdateData.link_info.before = this.dateTemplate.start.linkArr;
        //有link的时候开始/结束都变成 '0000-00-00 00:00:00'
        missionUpdateData.start = MissionConstant.MISSION_TIME_NULL;
        missionUpdateData.end = MissionConstant.MISSION_TIME_NULL;
        //application 不可以设置 date_period
        if (param === MissionConstant.MISSION_TYPE_APPLICATION) {
          missionUpdateData.date_period = '';
        } else {
          missionUpdateData.date_period = this.calculationDateMsec(this.dateTemplate.end.date_period);
        }
      } else {
        //没有link 的情况下 application/project 传  0000-00-00 00:00:00
        missionUpdateData.link_info.before = [];
        if (param === MissionConstant.MISSION_TYPE_APPLICATION ||
          param === MissionConstant.MISSION_TYPE_PROJECT) {
          missionUpdateData.start = MissionConstant.MISSION_TIME_NULL;
          missionUpdateData.end = MissionConstant.MISSION_TIME_NULL;
        } else {
          //如果是now 就传'now'字符串
          if (this.dateTemplate.start.isNow) {
            missionUpdateData.start = 'now';
          } else {
            if (this.selectDate.startDate) {
              missionUpdateData.start = this.selectDate.startDate.formatUtcString ? this.selectDate.startDate.formatUtcString : MissionConstant.MISSION_TIME_NULL;
            } else {
              missionUpdateData.start = this.missionObj.start;
            }
          }
          //+meeting 必须设置结束时间
          if (param === MissionConstant.MISSION_TYPE_MEETING && !this.dateTemplate.end.isShowDateTime) {
            this.renderer.setElementClass(element, this.config.btnProgress, false);
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail ='meeting must has end time!';
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
              this.btnFail = '';
            },this.config.btnFailTime);
            return false;
          }
          //task/assignment可以不设置结束时间
          if (this.selectDate.endDate) {
            missionUpdateData.end = this.selectDate.endDate.formatUtcString ? this.selectDate.endDate.formatUtcString : MissionConstant.MISSION_TIME_NULL;
          } else {
            missionUpdateData.end = this.missionObj.end;
          }
        }
      }
      missionUpdateData.link_info.after = [];
      //类型部分
      //1 Application
      if (param === MissionConstant.MISSION_TYPE_APPLICATION) {
        missionUpdateData.type = MissionConstant.MISSION_TYPE_APPLICATION;
        missionUpdateData.detail.app_type.wid = this.detailApplication.applicationDetailData.chosenWorkflow.id;
        missionUpdateData.description = this.detailApplication.missionObj.description;
      }

      //2 Assignment
      if (param === MissionConstant.MISSION_TYPE_ASSIGNMENT) {
        this.detailAssignment.getAssignnmentData();
        missionUpdateData.type = MissionConstant.MISSION_TYPE_ASSIGNMENT;
        missionUpdateData.description = this.detailAssignment.missionObj.description;
        missionUpdateData.detail.operator = this.detailAssignment.editAssignmentData.operatorData;
      }

      //3 Meeting
      if (param === MissionConstant.MISSION_TYPE_MEETING) {
        missionUpdateData.type = MissionConstant.MISSION_TYPE_MEETING;
        this.detailMeeting.getMeetingData();
        missionUpdateData.description = this.detailMeeting.editMeetingData.description;
        missionUpdateData.detail.conferee = this.detailMeeting.editMeetingData.confereeData;
      }

      //4 Project
      if (param === MissionConstant.MISSION_TYPE_PROJECT) {
        missionUpdateData.description = this.detailProject.missionObj.description;
      }

      //5 Task
      if (param === MissionConstant.MISSION_TYPE_TASK) {
        missionUpdateData.type = MissionConstant.MISSION_TYPE_TASK;
        missionUpdateData.description = this.detailTask.missionObj.description;
        this.detailTask.getTaskData();
        if (this.isUnlockBidding) {
          missionUpdateData.detail.as_identity = '';
          missionUpdateData.detail.operator = [];
        } else {
          missionUpdateData.detail.as_identity = this.detailTask.publisherId;
          if (!this.detailTask.operatorData.length) {
            this.renderer.setElementClass(element, this.config.btnProgress, false);
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail = 'Operator must be at least one!';
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
              this.btnFail = '';
            }, this.config.btnFailTime);
            return false;
          }
          missionUpdateData.detail.operator = this.detailTask.operatorData;
        }
        if (!this.detailTask.approveData.length) {
          this.renderer.setElementClass(element, this.config.btnProgress, false);
          this.renderer.setElementClass(element, 'but-fail', true);
          this.btnFail = 'Approver must be at least one!';
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
            this.btnFail = '';
          }, this.config.btnFailTime);
          return false;
        }
        missionUpdateData.detail.approver = this.detailTask.approveData;
      }

      //功能部分
      let missionFunctionObj = {};
      //第一个功能 observer
      if (this.isUnlockParticipant) {
        let missionFunctionObserver = new MissionFunctionObserver().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_OBSERVER] = missionFunctionObserver;
        missionUpdateData.initFunction(missionFunctionObj);
        this.detailParticipant.getParticipantData();
        missionFunctionObserver.user_info = this.detailParticipant.observerData;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_OBSERVER];
      }

      //第二个功能 recorder
      if (this.isUnlockRecorder) {
        let missionFunctionMemoRecorder = new MissionFunctionMemoRecorder().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER] = missionFunctionMemoRecorder;
        missionUpdateData.initFunction(missionFunctionObj);
        this.detailRecorder.getRecorderData();
        missionFunctionMemoRecorder.user_info = this.detailRecorder.recorderData;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER];
      }

      //第三个功能 importance
      if (this.isUnlockImportance) {
        let missionFunctionImportance = new MissionFunctionImportance().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_IMPORTANCE] = missionFunctionImportance;
        missionUpdateData.initFunction(missionFunctionObj);
        missionFunctionImportance.value = this.detailImportance.importanceLevel;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_IMPORTANCE];
      }

      //第四个功能 track
      if (this.isUnlockTrack) {
        let missionFunctionTracking = new MissionFunctionTracking().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_TRACKING] = missionFunctionTracking;
        missionUpdateData.initFunction(missionFunctionObj);
        this.detailTrack.getTrackData();
        missionFunctionTracking.user_info = this.detailTrack.trackData;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_TRACKING];
      }

      //第五个功能 bidding
      if (this.isUnlockBidding) {
        let missionFunctionBidding = new MissionFunctionBidding().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_BIDDING] = missionFunctionBidding;
        missionUpdateData.initFunction(missionFunctionObj);
        if (this.detailBidding.biddingInfo.type === '2') {
          this.isCanUpload = this.detailBidding.VerificationBiddingData();
          missionFunctionBidding.amount = this.detailBidding.biddingInfo.amount;
        }
        missionFunctionBidding.bidder = this.detailBidding.bidderList;
        missionFunctionBidding.type = this.detailBidding.biddingInfo.type;
        missionFunctionBidding.bidding_start = this.detailBidding.biddingInfo.start;
        missionFunctionBidding.bidding_end = this.detailBidding.biddingInfo.end;

        missionFunctionBidding.accept_line = this.detailBidding.biddingInfo.accept_line;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_BIDDING];
      }

      //第六个功能 expense
      if (this.isUnlockExpense) {
        let missionFunctionExpense = new MissionFunctionExpense().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_EXPENSE] = missionFunctionExpense;
        missionUpdateData.initFunction(missionFunctionObj);
        this.isCanUpload = this.detailExpense.VerificationExpenseData();
        missionFunctionExpense.id = this.detailExpense.expenseData.id;
        missionFunctionExpense.form = this.detailExpense.expenseData.form;
        missionFunctionExpense.payee = this.detailExpense.expenseData.payee;
        missionFunctionExpense.payee_account = this.detailExpense.expenseData.payee_account;
        missionFunctionExpense.account_type = this.detailExpense.expenseData.account_type;
        missionFunctionExpense.contract_amount = this.detailExpense.expenseData.contract_amount;
        missionFunctionExpense.contract_unit = this.detailExpense.expenseData.contract_unit;
        missionFunctionExpense.contract_times = this.detailExpense.expenseData.contract_times;
        missionFunctionExpense.payment_details = this.detailExpense.expenseData.payment_details;
        missionFunctionExpense.variation_offer = this.detailExpense.variationOffer;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_EXPENSE];
      }

      //第七个功能 target
      if (this.isUnlockTarget) {
        let missionFunctionTarget = new MissionFunctionTarget().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_TARGET] = missionFunctionTarget;
        missionUpdateData.initFunction(missionFunctionObj);
        this.detailTarget.getEditTargetData();
        this.isCanUpload = this.detailTarget.verificationTargetDate();
        missionFunctionTarget.type = this.detailTarget.editTargetData.type;
        missionFunctionTarget.amount = this.detailTarget.editTargetData.amount;
        missionFunctionTarget.unit = this.detailTarget.editTargetData.unit;
        missionFunctionTarget.total = this.detailTarget.editTargetData.total;
      } else {
        delete missionUpdateData.fns[MissionConstant.MISSION_FUNCTION_TARGET];
      }
      this.missionUpdateInfo = {
        act: MissionConstant.MISSION_ACT_EDIT,
        mission: missionUpdateData
      };
      if (this.isCanUpload) {
        this.missionUpload(element, this.missionUpdateInfo);
      }
    }
  }

  /**
   * 修改当前mission
   * @param element 按钮标签
   * @param data mission 数据
   */
  missionUpload(element: any, data: any) {
    delete data.mission.available_btns;
    delete data.mission.start_timestamp;
    delete data.mission.real_start;
    delete data.mission.real_start_timestamp;
    delete data.mission.end_timestamp;
    delete data.mission.real_end;
    delete data.mission.real_end_timestamp;
    delete data.mission.mission_status;
    delete data.mission.isReset;
    delete data.mission.status;
    delete data.mission.has_alarm;
    delete data.mission.alarm_id;
    delete data.mission.effective_time;
    delete data.mission.repeat;
    delete data.mission.every;
    delete data.mission.alarm_type;
    delete data.mission.effective_time_display;
    delete data.mission.last_update_info;
    delete data.mission.delayed;
    delete data.mission.pending_issue;
    delete data.mission.is_observer;
    this.missionModelService.missionUpload({
      data
    }, (res: any) => {
      if (res.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
        },this.config.btnShowTime);
        this.router.navigate(['mission/list']);
      } else {
        this.renderer.setElementClass(element, 'but-fail', true);
        this.btnFail = 'update mission failed!';
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail', false);
          this.btnFail = '';
        },this.config.btnFailTime);
      }
      this.renderer.setElementClass(element, this.config.btnProgress, false);
    })
  }


  /**
   * 获取已有的linkInfo
   */
  getLinkInfo(data: any) {
    this.dateTemplate.start.linkArr = [];
    if (data.before.length !== 0) {
      this.dateTemplate.start.isHasLink = true;
      this.dateTemplate.start.isShowDateTime = false;
      let linkBefore: any = data.before[0];
      this.linkInfoName = linkBefore.name;
      this.dateTemplate.start.linkArr.push(linkBefore);
    }
  }


  /**
   * 获取link 列表
   */
  linkTheMission(event: any) {
    event.stopPropagation();
    this.missionModelService.fetchLinkList({
      mid: this.missionObj.mid
    }, (data: any) => {
      if (data.status === 1) {
        if (data.data.length) {
          this.linkMissionList = data.data;
        } else {
          this.linkMissionList = [];
        }
        if (this.linkMissionList.length !== 0) {
          this.isShowLinkList = true;
        } else {
          let settings = {
            mode: '3',
            title: 'Notice!',
            isSimpleContent: true,
            simpleContent: 'NO MISSION TO LINK!'
          };
          this.dialogService.openWarning(settings);
        }
        this.addTypeTxt();
        this.addLinkTime();
      }
    })
  }

  /**
   * 添加link type类型名字
   */
  addTypeTxt() {
    for (let i in this.linkMissionList) {
      switch (this.linkMissionList[i].type) {
        case MissionConstant.MISSION_TYPE_APPLICATION:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_APPLICATION_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_ASSIGNMENT:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_MEETING:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_MEETING_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_TASK:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_TASK_TEXT;
          break;
        case MissionConstant.MISSION_TYPE_PROJECT:
          this.linkMissionList[i].typeTxt = MissionConstant.MISSION_TYPE_PROJECT_TEXT;
          break;
      }
    }
  }

  /**
   * 添加link列表显示时间
   */
  addLinkTime() {
    for (let i in this.linkMissionList) {
      this.linkMissionList[i].month = this.dateService.format(this.linkMissionList[i].created, 'mmm');
      this.linkMissionList[i].day = this.dateService.format(this.linkMissionList[i].created, 'ddS');
      this.linkMissionList[i].hm = this.dateService.format(this.linkMissionList[i].created, 'HH:MM');
      this.linkMissionList[i].ap = this.dateService.format(this.linkMissionList[i].created, 'tt');
    }
  }


  /**
   * 选择需要link 的mission
   */
  selectLinkMission(data: any) {
    this.dateTemplate.start.linkArr = [];
    this.linkInfoName = data.name;
    this.isShowLinkList = false;
    this.dateTemplate.start.isHasLink = true;
    this.dateTemplate.start.isShowDateTime = false;
    this.dateTemplate.start.linkArr.push(data);
    if (this.currentType !== MissionConstant.MISSION_TYPE_APPLICATION) {
      this.dateTemplate.end.isShowDatePeriod = true;
    }
  }

  /**
   * 点击X 变成pending
   * @param event
   * @param param
   */
  recoveryPending(event: any, param: string) {
    event.stopPropagation();
    if (param === 'start') {
      this.linkInfoName = '';
      this.dateTemplate.start.linkArr = [];
      this.dateTemplate.start.isHasLink = false;
      this.dateTemplate.start.isNow = false;
    }
    if (this.currentType === MissionConstant.MISSION_TYPE_APPLICATION) {
      this.dateTemplate[param].defaultContent = 'NOW';
    } else {
      this.dateTemplate[param].defaultContent = 'PENDING';
    }
    this.dateTemplate.end.isShowDatePeriod = false;
    this.dateTemplate[param].isShowDateTime = false;
    this.missionObj[param] = '';
  }

  /**
   * 点击变成now
   * @param event
   */
  resetTime(event: any) {
    event.stopPropagation();
    this.dateTemplate.start.isHasLink = false;
    this.linkInfoName = '';
    this.dateTemplate.start.linkArr = [];
    this.dateTemplate.end.isShowDatePeriod = false;
    this.dateTemplate.start.defaultContent = 'NOW';
    this.dateTemplate.start.isShowDateTime = false;
    this.dateTemplate.start.isNow = true;
    this.missionObj.start = '';
  }

  /**
   * 右上角大的操作按钮
   */
  operateTheMission(event: any, param: string) {
    event.stopPropagation();
    //Application的同意拒绝
    if (this.currentType === MissionConstant.MISSION_TYPE_APPLICATION) {
      let data: any = {
        mid: this.missionObj.mid,
        wid: this.missionObj.detail.app_type.wid,
        operation_type: param
      };
      this.missionModelService.missionApplicationApprove({
        data
      }, (data: any) => {
        if (data.status === 1) {
          window.location.reload();
        }
      })
    } else {
      //其余mission的同意拒绝
      let data: any = {
        mid: this.missionObj.mid,
        operation_type: param
      };
      this.missionModelService.missionCommonOperation({
        data
      }, (data: any) => {
        if (data.status === 1) {
          window.location.reload();
        }
      })
    }
  }


//完成这个mission
  completeTheMission(event: any) {
    event.stopPropagation();
    this.missionModelService.missionComplete({
      mid: this.missionObj.mid
    }, (response: any) => {
      if (response.status === 1) {
        this.router.navigate(['mission/list']);
      }
    })
  }

  /**
   * 右上角 小的操作按钮
   */

//  获取当前用户角色
  getUserRoles(data: any) {
    if (this.translateService.lan == 'zh-cn') {
      this.userRoleIntro = '你是';
      this.isZhLan = true;
    } else if (this.translateService.lan == 'en') {
      this.userRoleIntro = 'You are ';
      this.isZhLan = false;
    }
    if (data) {
      for (let i in data) {
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_PUBLISHER)) {
          this.isPublisher = true;
          this.userRoleIntro += this.isZhLan ? '发布者，' : 'publisher,';
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_APPROVER)) {
          this.isApprover = true;
          this.userRoleIntro += this.isZhLan ? '批准人，' : 'approver,';
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_OPERATOR)) {
          this.isOperator = true;
          this.userRoleIntro += this.isZhLan ? '执行人，' : 'operator,';
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_BIDDER)) {
          this.isBidder = true;
          this.userRoleIntro += this.isZhLan ? '竞标人，' : 'bidder,';
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_VOTER)) {
          this.isVoter = true;
          this.userRoleIntro += this.isZhLan ? '投票人，' : 'voter,';
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_CONFEREE)) {
          this.isConferee = true;
          this.userRoleIntro += this.isZhLan ? '参会人，' : 'conferee,'
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_OBSERVER)) {
          this.isObserver = true;
          this.userRoleIntro += this.isZhLan ? '知情人，' : 'observer,'
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_MEMO)) {
          this.isMemo = true;
          this.userRoleIntro += this.isZhLan ? '会议记录人，' : 'memo,'
        }
        if (data[i] === parseInt(MissionConstant.MISSION_USER_IDENTITY_WORKFLOW_APPROVER)) {
          this.isWorkflowApprover = true;
          this.userRoleIntro += this.isZhLan ? '流程批准人，' : 'workflow approver,'
        }
      }
    }
    this.userRoleIntro = this.userRoleIntro.substring(0, this.userRoleIntro.length - 1);
  }

  //删除这个mission
  deleteTheMission(event: any) {
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'REMOVE THIS MISSION',
      isSimpleContent: true,
      simpleContent: 'Are you sure delete the mission?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'delete',
          btnEvent: () => {
            let data = {
              mid: this.missionObj.mid
            };
            this.missionModelService.missionDelete({
              data
            }, (data: any) => {
              if (data.status === 1) {
                this.router.navigate(['mission/list']);
              }
            })
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }

  // 转让这个mission
  transferTheMission(event: any) {
    event.stopPropagation();
    this.dialogService.openNew({
      title: 'TRANSFER MISSION',
      isSimpleContent: false,
      componentSelector: 'mission-transfer',
      componentData: this.missionObj,
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'TRANSFER',
          btnEvent: 'transferTheMission'
        }
      ]
    });
  }

// MISSION状态变化
  changeMissionStatus(event: any, param: any) {
    event.stopPropagation();
    let data = {
      mid: this.missionObj.mid,
      operation_type: param
    };
    this.missionModelService.missionStatusChange({
      data
    }, (response: any) => {
      if (response.status === 1) {
        this.router.navigate(['mission/list']);
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'mission status change success!'
        };
        this.dialogService.openSuccess(settings);
      } else {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: response.data
        };
        this.dialogService.openSuccess(settings);
      }
    })
  }

  //check 这个任务
  checkTheMission(event: any) {
    event.stopPropagation();
    this.missionModelService.missionCheck({
      mid: this.missionObj.mid
    }, (response: any) => {
      if (response.status === 1) {
        window.location.reload();
      }
    })
  }

  /**
   * 点击显示日历
   */
  showCalendar(event: any, param: string, element) {
    event.stopPropagation();
    if (this.dateTemplate.start.isAbleSelectDate && (this.missionObj.mission_status === MissionConstant.MISSION_STATUS_TODO
      || this.missionObj.mission_status === MissionConstant.MISSION_STATUS_PENDING)) {
      if(this.isShowCalendar && this.isCalendar !== param) {
        this.isShowCalendar = true;
      }else {
        this.isShowCalendar = !this.isShowCalendar;
      }
      this.multiCalendar = {
        isClickStart: param === 'start',
        isClickEnd: param === 'end',
        data: this.missionObj,
        dateTemplate: this.dateTemplate,
        isShow:true,
        isFixed: true,
        isParent: true,
        parentElement: element,
        currentShowElement: this.calendarProfile.nativeElement
      }
    }
    this.isShowLinkList = false;
    if(this.detailBidding) {
      this.detailBidding.getOutDefault();
    }
  }


  /**
   * 得到日历传来的开始，结束日期对象
   */
  getSelectData(event: any) {
    this.isShowCalendar = false;
    this.selectDate = event;
    this.dateTemplate.start.isHasLink = this.selectDate.startDate.isLink;
    this.dateTemplate.start.isNow = this.selectDate.startDate.isNow;
    this.dateService.formatCalendarData(this.selectDate);
    if (this.selectDate.startDate.isLink) {
      this.linkInfoName = this.selectDate.startDate.linkArr[0].name;
      this.dateTemplate.start.linkArr = this.selectDate.startDate.linkArr;
      this.dateTemplate.start.isShowDateTime = false;
    }
    if (this.selectDate.startDate.isNow) {
      this.dateTemplate.defaultContent = 'NOW';
      this.dateTemplate.start.isShowDateTime = false;
    } else {
      this.formatStartDate = this.selectDate.startDate;
      this.dateService.formatCalendarData(this.selectDate);
      this.dateTemplate.start.isShowDateTime = this.selectDate.startDate.year !== '';
      this.selectDate.startDate.stringMonth = this.dateService.format(this.selectDate.startDate.formatUtcString, 'mmm');
      this.missionObj.start = this.selectDate.startDate.formatUtcString;
    }
    this.dateTemplate.end.isShowDatePeriod = this.selectDate.endDate.isShowDatePeriod;
    this.dateTemplate.end.date_period = this.selectDate.endDate.date_period;
    this.dateTemplate.end.isShowDateTime = this.selectDate.endDate.year !== '';
    // this.selectDate.endDate.stringMonth = this.dateService.format(this.selectDate.endDate.formatUtcString, 'mmm');
    this.formatEndDate = this.selectDate.endDate;
    this.selectDate.endDate.stringMonth = this.dateService.format(this.selectDate.endDate.formatUtcString, 'mmm');
    this.missionObj.end = this.selectDate.endDate.formatUtcString;
    this.doFormatTime(2);
  }



  /**
   * 点击 显示date_period 列表
   */
  showDatePeriodList(event: any) {
    event.stopPropagation();
    this.isShowDatePeriodUnit = !this.isShowDatePeriodUnit;
  }

  /**
   * 选择date_period的单位
   */
  selectTheUnit(event: any, data: any) {
    event.stopPropagation();
    this.dateTemplate.end.date_period.unit = data.key;
    this.isShowDatePeriodUnit = false;
  }


  /**
   * 控制键盘只能输入数字
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
   * 计算毫秒数
   */
  calculationDateMsec(data: any) {
    switch (data.unit) {
      case MissionConstant.DATE_UNIT_MONTH:
        data.msec = 30 * 24 * 3600 * parseInt(data.data);
        break;
      case MissionConstant.DATE_UNIT_WEEK:
        data.msec = 7 * 24 * 3600 * parseInt(data.data);
        break;
      case MissionConstant.DATE_UNIT_DAY:
        data.msec = 24 * 3600 * parseInt(data.data);
        break;
      case MissionConstant.DATE_UNIT_HOUR:
        data.msec = 3600 * parseInt(data.data);
        break;
    }
    return data.msec;
  }

  /**
   * 根据毫秒算计算时间成月份
   */
  dateDiff(data: any) {
    let diffData = parseInt(data);
    let diffUnit: string = '';
    let dateData: string;
    if (diffData > (3600 * 24 * 30)) {
      diffUnit = MissionConstant.DATE_UNIT_MONTH;
      dateData = (diffData / (3600 * 24 * 30)).toFixed(1);
    } else if (diffData > (7 * 24 * 3600)) {
      diffUnit = MissionConstant.DATE_UNIT_WEEK;
      dateData = (diffData / (7 * 24 * 3600)).toFixed(1);
    } else if (diffData > (3600 * 24)) {
      diffUnit = MissionConstant.DATE_UNIT_DAY;
      dateData = (diffData / (3600 * 24)).toFixed(1);
    } else if (diffData > 3600) {
      diffUnit = MissionConstant.DATE_UNIT_HOUR;
      dateData = (diffData / 3600).toFixed(1);
    }
    this.dateTemplate.end.date_period.data = dateData;
    this.dateTemplate.end.date_period.unit = diffUnit;
  }

  /**
   * 接收元素
   * @param el
   * @param isBool
   */
  getElement(el: any, isBool: boolean) {
    this.el = el;

    //设置未点击过的闹钟
    if(this.missionObj.type == this.missionConstant.MISSION_TYPE_MEETING) {
      if (!isBool) {
        if (this.missionObj.type == this.missionConstant.MISSION_TYPE_MEETING) {
          this.renderer.setElementClass(el.toggleSelectElement, 'hide', true);
        } else {
          this.isMissionShow = !this.isMissionShow;
          this.fixData = {
            data: this.missionObj,
            hideCalendar: this.isMissionShow
          };
        }
      } else {
        this.onClickedAlarm();
      }
    }else {
      this.renderer.setElementStyle(el.toggleSelectElement, 'display', 'none');
      this.isMissionShow = !this.isMissionShow;
      this.fixData = {
        data: this.missionObj,
        hideCalendar: this.isMissionShow
      };
    }
  }

  /**
   * 恢复默认值
   */
  intiDefault() {
    this.isMissionShow = false;
  }

  /**
   * 点击设置过的闹钟
   */
  onClickedAlarm() {

    //30分钟内不可点
    let now = new Date().getTime();
    if (this.missionObj.alarm_type == 2) {  //fix
      let targetTime = this.missionObj.effective_time * 1000;
      if (targetTime - now < 30 * 60 * 1000) {
        return false;
      }
    } else if (this.missionObj.alarm_type == 1) {  //repeat
      //30分钟内不可点，消费掉可以点
      let nowDate = new Date();
      let now = new Date(nowDate.toLocaleDateString()).getTime();
      let targetTime = now + this.missionObj.effective_time * 1000;
      let end: number = now + this.missionObj.effective_time * 1000 - nowDate.getTimezoneOffset() * 60 * 1000//要提示的时间戳
      if (end - nowDate.getTime() < 30 * 60 * 1000 && 0 < end - nowDate.getTime()) {
        return false;
      }
    }
  }

  /**
   * 删除闹钟
   * @param event
   */
  deleteFix() {
    //传出设过闹钟的tip  rid
     this.isShowCalendarFix = false;
    this.isShowAlarmSelect = false;
    this.missionObj.has_alarm = false;
    this.missionObj.alarm_type = 0;
  }

  /**
   * 删除repeat
   * @param event
   */
  deleteRepeat(event: any) {
     this.isShowCalendarFix = false;
    this.isShowAlarmSelect = false;
    this.missionObj.has_alarm = false;
    this.missionObj.alarm_type = 0;
  }

  /**
   * 接受calendar repeat 传出的数据
   */
  getRepeat(event: any) {
    this.isShowCalendarRepeat = false;
    this.missionObj.alarm_id = event.alarm_id;
    this.missionObj.alarm_type = 1;
    let type: string;
    if (event.isDay) {
      if (event.day == 0) {
        type = 'A day';
      } else if (event.day == 1) {
        type = 'Two days';
      } else if (event.day == 2) {
        type = 'Three days';
      } else if (event.day == 3) {
        type = 'Four days';
      }
    } else if (event.isWeek) {
      type = this.weekArr[event.week];
    } else if (event.isMonth) {
      type = (parseInt(event.month) + 1) + this.monthSuffix[event.month];
    }
    this.missionObj.has_alarm = true;
    let str: string;
    if (parseInt(event.hour) < 13) {
      str = 'am';
    } else {
      str = 'pm';
    }
    this.missionObj.effective_time_display = type + " " + event.hour + ":" + event.minute + str;
  }

  /**
   * 点击Periodicity闹钟选项
   */
  onclickPeriodicity(event: any) {
    event.stopPropagation();
    this.isShowAlarmSelect = false;
    this.isShowCalendarRepeat = true;
    this.isShowCalendarFix = false;
    this.repeatData = {
      data: this.missionObj,
      isShow:true
    };
  }

  /**
   * 点击fix time 闹钟选项
   */
  onClickFixTime(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.isShowAlarmSelect = false;
     this.isShowCalendarFix = true;
    this.isShowCalendarRepeat = false;
    //点击时传入calendar fix 对象
    this.isMissionShow = !this.isMissionShow;
    this.fixData = {
      data: this.missionObj,
      hideCalendar: this.isMissionShow
    };
  }

  /**
   * 接受fix闹钟传入的数据
   */
  getFix(event: any) {
    this.isShowAlarmSelect = false;
     this.isShowCalendarFix = false;
    this.fixInputData = event;
    this.missionObj.effective_time_display = this.getDateStr(parseInt(this.fixInputData.effective_time) * 1000);
    this.missionObj.has_alarm = true;
    this.missionObj.alarm_type = 2;
    this.missionObj.effective_time = this.fixInputData.effective_time;
  }

  /**
   * 时间戳转化为字符串
   */
  getDateStr(date: number, format?: string): string {
    if (!format) {
      format = 'yyyy-mm-dd HH:MMtt';
    }
    // let newDate = new Date(date);
    return this.dateService.formatLocal(date, format);
  }

  /**
   * 打开mini聊天窗
   */
  openMiniDialog(data: any) {
    let event: MouseEvent = data[0];
    let memberInfo: any = data[1] ? data[1] : null;
    if (memberInfo.uid === this.userDataService.getCurrentUUID()
      || memberInfo.uid === this.userDataService.getCurrentCompanyPSID()) {
    } else {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
        data: {
          selector: 'bi-mini-dialog',
          options: {
            left: event.clientX,
            top: event.clientY,
            member: memberInfo,
            form: 2
          }
        }
      });
    }
  }

  /**
   * 点击显示schedule
   * @param event
   */
  clickShowSchedule(event: MouseEvent): void {
    event.stopPropagation();
    this.showSchedule = !this.showSchedule;
    if (this.showSchedule) {
      let drawList = [];
      drawList.push(this.missionObj)
      drawList = (drawList.concat(this.missionObj.link_info.before)).concat(this.missionObj.link_info.after);
      this.chooseList = drawList;
    }
  }

  /**
   * 打开mission 的群组聊天
   */
  openMissionChatDialog(event: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector: 'mission-chat-dialog',
        options: this.missionObj
      }
    });
  }

  getOutDefault() {
    this.isMissionShow = false;
    this.isShowCalendar = false;
  }
}