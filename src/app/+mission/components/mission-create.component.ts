import {
  Component,
  OnInit,
  Inject,
  HostListener,
  ViewEncapsulation,
  ViewChild,
  AfterViewChecked,
  Renderer
} from "@angular/core";
import {Router, ActivatedRoute} from '@angular/router';
import * as MissionConstant from '../../shared/config/mission.config.ts';
import {
  MissionDetailAPIModel,
  MissionApplication, MissionAssignment, MissionMeeting, MissionProject, MissionTask, MissionFunctionObserver,
  MissionFunctionMemoRecorder, MissionFunctionImportance, MissionFunctionTarget, MissionFunctionExpense,
  MissionFunctionBidding, MissionFunctionTracking
} from "../../shared/services/model/entity/mission-entity";
import {MissionModelService} from "../../shared/services/model/mission-model.service";
import {DateService} from "../../shared/services/common/data/date.service";
let introInit = require('intro.js');

@Component({
  selector: 'mission-create',
  templateUrl: '../template/mission-create.component.html',
  styleUrls: ['../../../assets/css/mission/mission.css',
    '../../../assets/css/mission/mission-create.css',
    '../../../assets/css/date/date.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MissionModelService]
})

export class MissionCreateComponent implements OnInit, AfterViewChecked {

  //五大类
  @ViewChild('createApplication') public createApplication: any;
  @ViewChild('createAssignment') public createAssignment: any;
  @ViewChild('createMeeting') public createMeeting: any;
  @ViewChild('createTask') public createTask: any;
  @ViewChild('createProject') public createProject: any;

  //七大功能
  @ViewChild('observer') public observer: any;
  @ViewChild('recorder') public recorder: any;
  @ViewChild('expense') public expense: any;
  @ViewChild('importance') public importance: any;
  @ViewChild('track') public track: any;
  @ViewChild('target') public target: any;
  @ViewChild('bidding') public bidding: any;

  //Project专属
  @ViewChild('projectParticipant') public projectParticipant: any;
  @ViewChild('projectImportance') public projectImportance: any;

  //日历calendar
  // biMultiCalendar
  @ViewChild('calendarProfile') public calendarProfile: any;
  @ViewChild('createFolder') public createFolder: any;
  public hasAccess: boolean = false;
  public missionTitle: string;
  public missionType: string;
  public currentMissionText: string;
  public missionCreateData: any;
  public isShowOnTable: boolean = false;
  public isCanUpload: boolean = true;
  public isShowPencil: boolean = false;
  public isShowEditInput: boolean = false;
  public missionName: string = '';
  public originalName: string;
  //function 相关
  public isShowKnowPeople: boolean = false;
  public isShowTrack: boolean = false;
  public isShowExpense: boolean = false;
  public isShowImportance: boolean = false;
  public isShowBidding: boolean = false;
  public isShowTarget: boolean = false;
  public isShowRecorder: boolean = false;
  public missionConstant: any;
  public missionCommonList: Array<any> = [];
  public tplTypeList: Array<{key: any, title: any}> = [];

  //Project专属变量

  //在已经建完的project添加子mission
  public isAddProjectChild: boolean = false;
  public projectToken: string;
  public projectData: any = {};
  public projectMissionName: string = '';
  public projectId: string;
  //剩余人员
  public remainMember: Array<any> = [];
  public isShowLinkList: boolean = false;
  public linkMissionList: Array<any>;
  public linkInfoName: string = '';
  private KEY_PROJECT_TOKEN: string = 'project_token';
  private KEY_GENERAL_TOKEN: string = 'general_token';
  private KEY_FOLDER_ID: string = 'folder_id';
  private KEY_SUB_MISSION_TOKEN: string = 'sub_mission_token';
  private KEY_SUB_MISSION_FOLDER: string = 'sub_mission_folder';

  public dateTemplate: any = {
    start: {
      defaultContent: '',  //进去默认显示的文字
      isAbleLink: false, //是否可以link
      isShowNowBtn: false, //是否有NOW的 button
      isShowCloseBtn: false, //是否有关闭的button
      isAbleSelectDate: false, //是否可以弹出日历控件
      isShowDateTime: false, //是否选择了时间
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
        unit: '' //单位
      }
    }
  };
  public formatStartDate: any = {};
  public formatEndDate: any = {};
  public isShowCalendar: boolean = false;//显示日历
  public multiCalendar: any = {}; //父组件传入对象
  public selectDate: any;
  public calendarData: any = {
    start: '',
    end: '',
  };
  public generalToken: any;
  public subMissionGeneralToken: any;
  public isShowDatePeriodUnit: boolean = false;
  public dateUnit: Array<any>;
  public initData: boolean = false;
  public showMissionName: string = '';
  public isHelpPage: boolean = false;
  private btnFail: string = '';
  private isCalendar: string = '';

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    if (this.currentMissionText === MissionConstant.MISSION_TYPE_PROJECT_TEXT && this.createProject) {
      this.createProject.storageProjectName(this.missionName);
      this.projectMissionName = this.missionName;
    }
    this.clearInfo();
  }


  constructor(public router: Router,
              private renderer: Renderer,
              private activatedRoute: ActivatedRoute,
              public missionModelService: MissionModelService,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('mission-data.service') public missionDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('page.element') public element: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any) {
    if (!this.userDataService.getCurrentCompanyPSID()) {
      this.dialogService.openNoAccess();
    } else {
      this.missionConstant = MissionConstant;
      this.hasAccess = true;
    }

  }

  ngAfterViewChecked(): void {
    if (this.hasAccess && !this.initData) {
      this.initData = true;
      this.activatedRoute.params.subscribe((params: any) => {
        let str = params['type'].substring(0, 1).toUpperCase();
        let strS = params['type'].substring(1);
        this.currentMissionText = str + strS;
        if (params.hasOwnProperty('mid')) {    //已经建完的有project的id 下添加 子mission
          this.projectId = params['mid'];
          this.isAddProjectChild = true;
          this.getChildMissionToken();
        }
        this.judgeMissionType(this.currentMissionText);
      });
      this.missionCreateData = {};
      this.setMissionTypeList();
      this.setDateUnit();
      this.projectData = {
        childMissionInfo: [],
        isProjectPart: false,
        name: ''
      };
      this.getGeneralToken();
    }
  }

  //初始化页面后
  ngOnInit() {
    if (this.hasAccess) {

    }
  }

  /**
   * 判断当前类型=>并且左侧显示不同的事件模板
   */
  judgeMissionType(param: string) {
    this.linkInfoName = '';
    this.dateTemplate.start.linkArr = [];
    this.missionTitle = param.toUpperCase();
    switch (param) {
      case MissionConstant.MISSION_TYPE_APPLICATION_TEXT:
        this.missionType = MissionConstant.MISSION_TYPE_APPLICATION;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: false,
            isShowCloseBtn: true,
            isShowDateTime: false, //是否选择了时间
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
              data: '',
              unit: 'Months'
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_TASK_TEXT:
        this.missionType = MissionConstant.MISSION_TYPE_TASK;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isShowDateTime: false, //是否选择了时间
            isNow: true, //是否当前显示NOW
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
              data: '',
              unit: 'Months'
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_MEETING_TEXT:
        this.missionType = MissionConstant.MISSION_TYPE_MEETING;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isNow: true,
            linkArr: [],
            isShowDateTime: false, //是否选择了时间
            isHasLink: false,
          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isShowDateTime: false,
            date_period: {
              data: '',
              unit: 'Months'
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_ASSIGNMENT_TEXT:
        this.missionType = MissionConstant.MISSION_TYPE_ASSIGNMENT;
        this.dateTemplate = {
          start: {
            defaultContent: 'NOW',
            isAbleLink: true,
            isShowNowBtn: true,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isNow: true,
            linkArr: [],
            isShowDateTime: false, //是否选择了时间
            isHasLink: false,
          },
          end: {
            defaultContent: 'PENDING',
            isShowDatePeriod: false,
            isShowCloseBtn: true,
            isAbleSelectDate: true,
            isShowDateTime: false,
            date_period: {
              data: '',
              unit: 'Months'
            }
          }
        };
        break;
      case MissionConstant.MISSION_TYPE_PROJECT_TEXT:
        this.missionType = MissionConstant.MISSION_TYPE_PROJECT;
        this.dateTemplate = {
          start: {
            defaultContent: 'planning',
            isAbleLink: false,
            isShowNowBtn: false,
            isShowCloseBtn: false,
            isAbleSelectDate: false,
            isNow: false,
            linkArr: [],
            isShowDateTime: false, //是否选择了时间
            isHasLink: false
          },
          end: {
            defaultContent: 'planning',
            isShowDatePeriod: false,
            isShowCloseBtn: false,
            isAbleSelectDate: false,
            isShowDateTime: false,
            date_period: {
              data: '',
              unit: 'Months'
            }
          }
        };
        break;
      default:
        break;
    }
  }


  /**
   * 获得mission类型数组
   */
  setMissionTypeList(): void {
    this.tplTypeList = MissionDetailAPIModel.getTypeList();
  }

  setDateUnit() {
    this.dateUnit = MissionDetailAPIModel.getDateUnit()
  }

  /**
   * 点击重新创建其他类型
   */
  createMission(param: any) {
    if (param !== this.currentMissionText) {
      if (!this.isAddProjectChild) {
        if (this.projectData.isProjectPart && this.currentMissionText !== MissionConstant.MISSION_TYPE_PROJECT_TEXT) {
          let settings = {
            mode: '1',
            title: 'SWITCH CREATE MISSION TYPE',
            isSimpleContent: true,
            simpleContent: 'This operation will be given up current mission?',
            buttons: [
              {type: 'cancel'},
              {
                type: 'send',
                btnText: 'CONFIRM',
                btnEvent: () => {
                  this.judgeMissionType(param);
                  this.closeAllFunction();
                  this.clearInfo();
                }
              }
            ]
          };
          this.dialogService.openNew(settings);
        } else {
          let settings = {
            mode: '1',
            title: 'SWITCH CREATE MISSION TYPE',
            isSimpleContent: true,
            simpleContent: 'This operation will be given up current mission?',
            buttons: [
              {type: 'cancel'},
              {
                type: 'send',
                btnText: 'CONFIRM',
                btnEvent: () => {
                  this.missionName = '';
                  this.router.navigate(['mission/create', param.toLowerCase()]);
                  this.closeAllFunction();
                  this.clearInfo();
                  //在建非project的子mission的时候 切换类型 清除token 并重新获取general token
                  this.missionDataService.removeToken(this.KEY_PROJECT_TOKEN);
                  this.missionDataService.removeToken(this.KEY_GENERAL_TOKEN);
                  this.missionDataService.removeToken(this.KEY_FOLDER_ID);
                  this.getGeneralToken();
                }
              }
            ]
          };
          this.dialogService.openNew(settings);
        }
      } else {
        let settings = {
          mode: '1',
          title: 'SWITCH CREATE MISSION TYPE',
          isSimpleContent: true,
          simpleContent: 'This operation will cause you to give up create current mission?',
          buttons: [
            {type: 'cancel'},
            {
              type: 'send',
              btnText: 'CONFIRM',
              btnEvent: () => {
                this.missionName = '';
                this.router.navigate(['mission/create', param.toLowerCase(), this.projectId]);
                this.closeAllFunction();
                this.clearInfo();
              }
            }
          ]
        };
        this.dialogService.openNew(settings);
      }

    }
  }


  /**
   * 关闭所有function!
   */
  closeAllFunction() {
    this.isShowKnowPeople = false;
    this.isShowTrack = false;
    this.isShowExpense = false;
    this.isShowImportance = false;
    this.isShowBidding = false;
    this.isShowRecorder = false;
    this.isShowTarget = false;
  }


  /**
   function  部分
   */
  //点击开启相关的功能
  showFunction(param: any, event: any) {
    if (this.element.hasClass(event.target, 'g-checkbox-selected')) {
      event.target.setAttribute('class', 'g-checkbox  font-selectbutton-select');
    } else {
      event.target.setAttribute('class', 'g-checkbox g-checkbox-selected font-selectbutton-select');
    }
    switch (param) {
      case MissionConstant.MISSION_FUNCTION_OBSERVER:
        this.isShowKnowPeople = !this.isShowKnowPeople;
        if (this.missionType === MissionConstant.MISSION_TYPE_PROJECT) {
          this.projectData.functionParticipant = this.isShowKnowPeople;
        }
        break;
      case MissionConstant.MISSION_FUNCTION_MEMO_RECORDER:
        this.isShowRecorder = !this.isShowRecorder;
        break;
      case MissionConstant.MISSION_FUNCTION_IMPORTANCE:
        this.isShowImportance = !this.isShowImportance;
        if (this.missionType === MissionConstant.MISSION_TYPE_PROJECT) {
          this.projectData.functionImportance = this.isShowImportance;
        }
        break;
      case MissionConstant.MISSION_FUNCTION_TRACKING:
        this.isShowTrack = !this.isShowTrack;
        if (this.missionType === MissionConstant.MISSION_TYPE_PROJECT) {
          this.projectData.functionTrack = this.isShowTrack;
        }
        break;
      case MissionConstant.MISSION_FUNCTION_BIDDING:
        this.isShowBidding = !this.isShowBidding;
        this.createTask.doJudgeBidding(this.isShowBidding);
        break;
      case MissionConstant.MISSION_FUNCTION_EXPENSE:
        this.isShowExpense = !this.isShowExpense;
        break;
      case MissionConstant.MISSION_FUNCTION_TARGET:
        this.isShowTarget = !this.isShowTarget;
        break;
      default:
        break;
    }
  }


  /**
   * 创建Application类型
   * @param element 按钮标签
   * @param param mission 类型
   */
  uploadMission(element: any, param: string) {
    //判断mission name 不能为空
    if (this.missionName === '') {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      this.renderer.setElementClass(element, 'but-fail', true);
      this.btnFail = 'The Mission Name cannot be empty';
      setTimeout(() => {
        this.renderer.setElementClass(element, 'but-fail', false);
        this.btnFail = '';
      }, this.config.btnFailTime);
    } else {
      let missionCreateData = new MissionDetailAPIModel().init();
      //mission公用基本数据
      // mission的name
      missionCreateData.name = this.missionName;
      //创建子mission 的时候 传 子mission 的general_token  和 子mission 的folder_id
      if (this.projectData.isProjectPart && this.currentMissionText !== MissionConstant.MISSION_TYPE_PROJECT_TEXT) {
        missionCreateData.folder_id = this.subMissionGeneralToken.fid;
        missionCreateData.general_token = this.subMissionGeneralToken.token;
      } else if (this.isAddProjectChild) {
        missionCreateData.folder_id = this.subMissionGeneralToken.fid;
        missionCreateData.general_token = this.subMissionGeneralToken.token;
      } else {
        missionCreateData.general_token = this.generalToken.token;
        missionCreateData.folder_id = this.generalToken.fid;
      }
      //folder_id
      //mission 的开始/结束时间
      if (this.dateTemplate.start.isHasLink) {  //有link 的时候 传link 并且传 date_period
        missionCreateData.link_info.before = this.dateTemplate.start.linkArr;
        //application 不可以设置 date_period
        if (param === MissionConstant.MISSION_TYPE_APPLICATION) {
          missionCreateData.date_period = '';
        } else {
          missionCreateData.date_period = this.calculationDateMsec(this.dateTemplate.end.date_period);
          if (!missionCreateData.date_period) {
            this.renderer.setElementClass(element, this.config.btnProgress, false);
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail = 'If you choose link after a mission,the date period is request!';
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
              this.btnFail = '';
            }, this.config.btnFailTime);
            return;
          }
        }
      } else {
        //没有link 的情况下 application/project 传  0000-00-00 00:00:00
        if (param === MissionConstant.MISSION_TYPE_APPLICATION ||
          param === MissionConstant.MISSION_TYPE_PROJECT) {
          missionCreateData.start = MissionConstant.MISSION_TIME_NULL;
          missionCreateData.end = MissionConstant.MISSION_TIME_NULL;
        } else {
          //如果是now 就传'now'字符串
          if (this.dateTemplate.start.isNow) {
            missionCreateData.start = 'now';
          } else {
            missionCreateData.start = this.formatStartDate.formatUtcString ? this.formatStartDate.formatUtcString : MissionConstant.MISSION_TIME_NULL;
          }
          if (param === MissionConstant.MISSION_TYPE_MEETING) {
            if (!this.formatStartDate.formatUtcString) {
              this.renderer.setElementClass(element, this.config.btnProgress, false);
              this.renderer.setElementClass(element, 'but-fail', true);
              this.btnFail = 'meeting must has start time!';
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-fail', false);
                this.btnFail = '';
              }, this.config.btnFailTime);
              return false;
            } else {
              let date = this.formatStartDate.formatUtcString.replace(/-/g, '/');
              let setTime = new Date(date).getTime();  //utsc 时间
              let currentTime = new Date().getTime();
              if (setTime + 8 * 60 * 60 * 1000 - currentTime < 5 * 60 * 1000) {
                this.renderer.setElementClass(element, this.config.btnProgress, false);
                this.renderer.setElementClass(element, 'but-fail', true);
                this.btnFail = 'meeting start time must after five minuter later!';
                setTimeout(() => {
                  this.renderer.setElementClass(element, 'but-fail', false);
                  this.btnFail = '';
                }, this.config.btnFailTime);
                return false;
              }
            }
            if (!this.formatEndDate.formatUtcString) {
              this.renderer.setElementClass(element, this.config.btnProgress, false);
              this.renderer.setElementClass(element, 'but-fail', true);
              this.btnFail = 'meeting must has end time!';
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-fail', false);
                this.btnFail = '';
              }, this.config.btnFailTime);
              return false;
            }
          }
          missionCreateData.end = this.formatEndDate.formatUtcString ? this.formatEndDate.formatUtcString : MissionConstant.MISSION_TIME_NULL;
          if (this.isShowBidding) {  //选择了bidding
            if (missionCreateData.end == MissionConstant.MISSION_TIME_NULL || missionCreateData.start == MissionConstant.MISSION_TIME_NULL) {  //选择bidding 必须有开始和结束时间
              this.renderer.setElementClass(element, this.config.btnProgress, false);
              this.renderer.setElementClass(element, 'but-fail', true);
              this.btnFail = 'if you choose bidding,  start and end time is required';
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-fail', false);
                this.btnFail = '';
              }, this.config.btnFailTime);
              return false;
            }
            if (!this.bidding.biddingCreateData.start || !this.bidding.biddingCreateData.start) {  //选择bidding 必须有开始和结束时间
              this.renderer.setElementClass(element, this.config.btnProgress, false);
              this.renderer.setElementClass(element, 'but-fail', true);
              this.btnFail = 'bidding time is required';
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-fail', false);
                this.btnFail = '';
              }, this.config.btnFailTime);
              return false;
            } else {
              let biddingStartDate = new Date(this.bidding.biddingCreateData.start.replace(/-/g, '/')).getTime();
              let biddingEndDate = new Date(this.bidding.biddingCreateData.end.replace(/-/g, '/')).getTime();
              let missionStartDate = new Date(missionCreateData.start.replace(/-/g, '/')).getTime();
              let missionEndDate = new Date(missionCreateData.end.replace(/-/g, '/')).getTime();

              if (biddingStartDate < missionStartDate || biddingEndDate > missionEndDate) {
                this.renderer.setElementClass(element, this.config.btnProgress, false);
                this.renderer.setElementClass(element, 'but-fail', true);
                this.btnFail = 'Bidding time must be between task time';
                setTimeout(() => {
                  this.renderer.setElementClass(element, 'but-fail', false);
                  this.btnFail = '';
                }, this.config.btnFailTime);
                return false;
              }
            }
          }
          //+meeting 必须设置结束时间
          //task/assignment可以不设置结束时间
        }
      }
      //  是否在首页显示
      if (this.isShowOnTable) {
        missionCreateData.promoted = '1';
      } else {
        missionCreateData.promoted = '0';
      }

      //存在token创建project的时候添加子mission
      if (this.projectData.isProjectPart && this.projectToken) {
        missionCreateData.initProjectToken(this.projectToken);
      }

      //是否是在已经建好的project里面添加子mission
      if (this.isAddProjectChild) {
        missionCreateData.initProjectId(this.projectId);
      }
      //类型部分
      //1 Application
      if (param === MissionConstant.MISSION_TYPE_APPLICATION) {
        //Application基础数据
        let missionApplicationDataObj = new MissionApplication().init();
        missionCreateData.initDetail(missionApplicationDataObj);
        missionCreateData.type = MissionConstant.MISSION_TYPE_APPLICATION;
        missionCreateData.detail.app_type.wid = this.createApplication.createApplicationData.chosenWorkflow.id;
        missionCreateData.description = this.createApplication.createApplicationData.missionDescription;
      }

      //2 Assignment
      if (param === MissionConstant.MISSION_TYPE_ASSIGNMENT) {
        let missionAssignmentDataObj = new MissionAssignment().init();
        missionCreateData.initDetail(missionAssignmentDataObj);
        this.createAssignment.getAssignnmentData();
        missionCreateData.type = MissionConstant.MISSION_TYPE_ASSIGNMENT;
        missionCreateData.description = this.createAssignment.createAssignmentData.missionDescription;
        missionCreateData.detail.operator = this.createAssignment.createAssignmentData.operatorData;
      }

      //3 Meeting
      if (param === MissionConstant.MISSION_TYPE_MEETING) {
        let missionMeetingDataObj = new MissionMeeting().init();
        missionCreateData.initDetail(missionMeetingDataObj);
        missionCreateData.type = MissionConstant.MISSION_TYPE_MEETING;
        this.createMeeting.getMeetingData();
        missionCreateData.description = this.createMeeting.createMeetingData.missionDescription;
        missionCreateData.detail.conferee = this.createMeeting.createMeetingData.confereeData;
      }

      //4 Project
      if (param === MissionConstant.MISSION_TYPE_PROJECT) {
        let missionProjectDataObj = new MissionProject().init();
        missionCreateData.initDetail(missionProjectDataObj);
        missionCreateData.initProjectToken(this.createProject.missionProjectData.missionToken);
        missionCreateData.type = MissionConstant.MISSION_TYPE_PROJECT;
        missionCreateData.description = this.createProject.missionProjectData.description;
        missionCreateData.detail.operator = [];
        missionCreateData.detail.approver = [];
      }

      //5 Task
      if (param === MissionConstant.MISSION_TYPE_TASK) {
        let missionTaskDataObj = new MissionTask().init();
        missionCreateData.initDetail(missionTaskDataObj);
        missionCreateData.type = MissionConstant.MISSION_TYPE_TASK;
        missionCreateData.description = this.createTask.createTaskData.missionDescription;
        this.createTask.getTaskData();
        if (this.isShowBidding) {
          missionCreateData.detail.as_identity = MissionConstant.MISSION_USER_IDENTITY_APPROVER;
          missionCreateData.detail.operator = [];
        } else {
          missionCreateData.detail.as_identity = this.createTask.publisherId;
          if (!this.createTask.operatorData.length) {
            this.renderer.setElementClass(element, this.config.btnProgress, false);
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail = 'Operator must be at least one!';
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
              this.btnFail = '';
            }, this.config.btnFailTime);
            return false;
          }
          missionCreateData.detail.operator = this.createTask.operatorData;
        }
        if (!this.createTask.approveData.length) {
          this.renderer.setElementClass(element, this.config.btnProgress, false);
          this.renderer.setElementClass(element, 'but-fail', true);
          this.btnFail = 'Approver must be at least one!';
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
            this.btnFail = '';
          }, this.config.btnFailTime);
          return false;
        }
        missionCreateData.detail.approver = this.createTask.approveData;
      }

      //功能部分
      let missionFunctionObj = {};
      //第一个功能 observer
      if (this.isShowKnowPeople) {
        let missionFunctionObserver = new MissionFunctionObserver().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_OBSERVER] = missionFunctionObserver;
        missionCreateData.initFunction(missionFunctionObj);
        this.observer.getParticipantData();
        missionFunctionObserver.user_info = this.observer.observerData;
      }

      //第二个功能 recorder
      if (this.isShowRecorder) {
        let missionFunctionMemoRecorder = new MissionFunctionMemoRecorder().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_MEMO_RECORDER] = missionFunctionMemoRecorder;
        missionCreateData.initFunction(missionFunctionObj);
        this.recorder.getRecorderData();
        missionFunctionMemoRecorder.user_info = this.recorder.recorderData;
      }

      //第三个功能 importance
      if (this.isShowImportance) {
        let missionFunctionImportance = new MissionFunctionImportance().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_IMPORTANCE] = missionFunctionImportance;
        missionCreateData.initFunction(missionFunctionObj);
        missionFunctionImportance.value = this.importance.importanceLevel;
      }

      //第四个功能 track
      if (this.isShowTrack) {
        let missionFunctionTracking = new MissionFunctionTracking().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_TRACKING] = missionFunctionTracking;
        missionCreateData.initFunction(missionFunctionObj);
        this.track.getTrackData();
        missionFunctionTracking.user_info = this.track.trackData;
      }

      //第五个功能 bidding
      if (this.isShowBidding) {
        let missionFunctionBidding = new MissionFunctionBidding().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_BIDDING] = missionFunctionBidding;
        missionCreateData.initFunction(missionFunctionObj);
        this.bidding.getBiddingCreateData();
        missionFunctionBidding.type = this.bidding.biddingCreateData.type;
        missionFunctionBidding.bidding_start = this.bidding.biddingCreateData.start;
        missionFunctionBidding.bidding_end = this.bidding.biddingCreateData.end;
        missionFunctionBidding.bidder = this.bidding.biddingCreateData.bidder;
        if (this.bidding.biddingCreateData.bidder.length < 2) {
          this.renderer.setElementClass(element, this.config.btnProgress, false);
          this.renderer.setElementClass(element, 'but-fail', true);
          this.btnFail = 'BIDDER MUST MORE THAN ONE!';
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
            this.btnFail = '';
          }, this.config.btnFailTime);
          return false
        }
        missionFunctionBidding.amount = this.bidding.biddingCreateData.amount;
        missionFunctionBidding.accept_line = this.bidding.biddingCreateData.accept_line;
      }

      //第六个功能 expense
      if (this.isShowExpense) {
        let missionFunctionExpense = new MissionFunctionExpense().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_EXPENSE] = missionFunctionExpense;
        missionCreateData.initFunction(missionFunctionObj);
        this.isCanUpload = this.expense.VerificationExpenseData();
        missionFunctionExpense.form = this.expense.expenseData.form;
        missionFunctionExpense.payee = this.expense.expenseData.payee;
        missionFunctionExpense.payee_account = this.expense.expenseData.payee_account;
        missionFunctionExpense.account_type = this.expense.expenseData.account_type;
        missionFunctionExpense.contract_amount = this.expense.expenseData.contract_amount;
        missionFunctionExpense.contract_unit = this.expense.expenseData.contract_unit;
        missionFunctionExpense.contract_times = this.expense.expenseData.contract_times;
        missionFunctionExpense.payment_details = this.expense.expenseData.payment_details;
        missionFunctionExpense.variation_offer = this.expense.variationOffer;
      }

      //第七个功能 target
      if (this.isShowTarget) {
        let missionFunctionTarget = new MissionFunctionTarget().init();
        missionFunctionObj[MissionConstant.MISSION_FUNCTION_TARGET] = missionFunctionTarget;
        missionCreateData.initFunction(missionFunctionObj);
        this.target.getCreateTargetData();
        this.isCanUpload = this.target.verificationTargetDate();
        missionFunctionTarget.type = this.target.targetData.type;
        missionFunctionTarget.amount = this.target.targetData.amount;
        missionFunctionTarget.unit = this.target.unit;
        missionFunctionTarget.total = this.target.total;
      }
      this.missionCreateData = {
        act: MissionConstant.MISSION_ACT_CREATE,
        mission: missionCreateData
      };
      if (this.isCanUpload) {
        this.missionUpload(this.typeService.clone(this.missionCreateData), element);
      }
    }
  }

  /**
   * 调用创建的接口
   * @param data mission 数据
   * @param element 按钮元素
   */
  missionUpload(data: any, element: any) {
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
    }, (data: any) => {
      if (data.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
        }, this.config.btnSuccessTime);

        if (this.projectData.isProjectPart && this.currentMissionText !== MissionConstant.MISSION_TYPE_PROJECT_TEXT) {
          this.missionCreateData.mid = data.data;
          this.projectData.name = this.projectMissionName;
          this.projectData.childMissionInfo.push(this.missionCreateData);
          this.missionName = this.projectData.name;
          this.closeAllFunction();
          this.goBackToProject();
          this.dealProjectFunction();
          this.missionDataService.removeToken(this.KEY_SUB_MISSION_TOKEN);
          this.missionDataService.removeToken(this.KEY_SUB_MISSION_FOLDER);
          this.createFolder.getGeneralToken(this.generalToken);
        } else if (this.isAddProjectChild) {  //在已经创建完成的project里面编辑 添加子 mission
          this.router.navigate(['mission/detail', this.projectId]);
          this.missionDataService.removeToken(this.KEY_SUB_MISSION_TOKEN);
          this.missionDataService.removeToken(this.KEY_SUB_MISSION_FOLDER);
        } else {
          this.router.navigate(['mission/list']);
          this.missionDataService.removeToken(this.KEY_PROJECT_TOKEN);
          this.missionDataService.removeToken(this.KEY_GENERAL_TOKEN);
          this.missionDataService.removeToken(this.KEY_FOLDER_ID);
        }
        this.messageDataService.setChatHasLoaded(false);
      } else {
        this.renderer.setElementClass(element, 'but-fail', true);
        this.btnFail = 'create mission failed!';
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail', false);
          this.btnFail = '';
        }, this.config.btnFailTime);
      }
      this.renderer.setElementClass(element, this.config.btnProgress, false);
    })
  }

  /**
   * 点击铅笔出现编辑框
   */
  doShowInput(event: any) {
    event.stopPropagation();
    this.originalName = this.missionName;
    this.isShowPencil = false;
    this.isShowEditInput = true;
    if (this.missionName === '') {
      this.showMissionNameHover = true;
    }


  }

  /**
   * 按下回车 或者 ESC 确认 name
   */
  confirmMissionName(event: any) {
    if (event.keyCode === 13) {
      this.isShowEditInput = false;
      if (this.currentMissionText === MissionConstant.MISSION_TYPE_PROJECT_TEXT && this.createProject) {
        this.createProject.storageProjectName(this.missionName);
      }
    } else if (event.keyCode === 27) {
      this.isShowEditInput = false;
      this.missionName = this.originalName;
      if (this.currentMissionText === MissionConstant.MISSION_TYPE_PROJECT_TEXT && this.createProject) {
        this.createProject.storageProjectName(this.missionName);
      }
    }
  }


  /**
   * 在首页显示
   */
  showOnTable() {
    this.isShowOnTable = !this.isShowOnTable;
  }

  /**
   * 阻止时间冒泡专用
   */
  doStopPropagation(event: any) {
    event.stopPropagation();
  }

  /**
   * 退出创建Mission
   */
  quitCreateMission(bool: boolean) {
    let settings = {
      mode: '1',
      title: bool ? 'BACK TO PROJECT' : 'QUIT CREATION MISSION',
      isSimpleContent: true,
      simpleContent: bool ? 'back to project desc' : 'Do you accept to give up mission?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'CONFIRM',
          btnEvent: () => {
            if (this.projectData.isProjectPart && this.currentMissionText !== MissionConstant.MISSION_TYPE_PROJECT_TEXT) {
              this.projectData.name = this.projectMissionName;
              this.missionName = this.projectData.name;
              this.closeAllFunction();
              this.goBackToProject();
              this.dealProjectFunction();
              this.missionDataService.removeToken(this.KEY_SUB_MISSION_TOKEN);
              this.missionDataService.removeToken(this.KEY_SUB_MISSION_FOLDER);
              this.createFolder.getGeneralToken(this.generalToken);
            } else if (this.isAddProjectChild) {  //在已经创建完成的project里面编辑 添加子 mission
              this.router.navigate(['mission/detail', this.projectId]);
              this.missionDataService.removeToken(this.KEY_SUB_MISSION_TOKEN);
              this.missionDataService.removeToken(this.KEY_SUB_MISSION_FOLDER);
            } else {
              this.missionDataService.removeToken(this.KEY_PROJECT_TOKEN);
              this.missionDataService.removeToken(this.KEY_GENERAL_TOKEN);
              this.missionDataService.removeToken(this.KEY_FOLDER_ID);
              this.router.navigate(['mission/list']);
            }
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * PROJECT专属模块 (创建project的时候添加子mission)
   */
  addProjectMission(data) {
    //生成子mission的token
    this.showMissionName = this.missionName;
    this.getChildMissionToken();
    this.projectToken = data.missionToken;
    this.projectData.isProjectPart = true;
    this.currentMissionText = MissionConstant.MISSION_TYPE_APPLICATION_TEXT;
    this.projectMissionName = data.name;
    this.missionName = '';
    if (this.importance) {
      this.projectData.importanceLevel = this.importance.importanceLevel;
    }
    if (this.observer) {
      this.projectData.participant = this.observer.observerArr;
    }
    this.closeAllFunction();
    this.judgeMissionType(this.currentMissionText);
  }


  public  getChildMissionToken() {
    let data = {
      type: MissionConstant.MISSION_GENERAL_TOKEN
    };
    this.missionModelService.missionGetToken({
      data
    }, (res: any) => {
      if (res.status === 1) {
        this.subMissionGeneralToken = res.data;
        this.missionDataService.cacheToken(this.KEY_SUB_MISSION_TOKEN, res.data.token);
        this.missionDataService.cacheToken(this.KEY_SUB_MISSION_FOLDER, res.data.fid);
        this.createFolder.getGeneralToken(this.subMissionGeneralToken);
      }
    })
  }


  /**
   * 回退到project页面
   */
  goBackToProject() {
    this.currentMissionText = MissionConstant.MISSION_TYPE_PROJECT_TEXT;
    this.judgeMissionType(this.currentMissionText);
  }

  /**
   * 获取Project已经开启的function
   */
  dealProjectFunction() {
    this.isShowImportance = this.projectData.functionImportance;
    this.isShowKnowPeople = this.projectData.functionParticipant;
    setTimeout(() => {
      this.doProjectFunction();
    }, 100);
  }

  /**
   * 处理project function()
   */
  doProjectFunction() {
    if (this.projectData.functionImportance && this.projectImportance) {
      this.projectImportance.nativeElement.setAttribute('class', 'g-checkbox g-checkbox-selected font-selectbutton-select');
      this.importance.getProjectLevel(this.projectData.importanceLevel);
    }
    if (this.projectData.functionParticipant && this.projectParticipant) {
      this.projectParticipant.nativeElement.setAttribute('class', 'g-checkbox g-checkbox-selected font-selectbutton-select');
      this.observer.getProjectParticipant(this.projectData.participant);
    }
  }

  /**
   * 计算已经选中的人员
   */
  doCalculationChooseMember(data: any) {
    this.remainMember = data;
  }


  /**
   * 获取link列表
   */
  linkTheMission(event: any) {
    event.stopPropagation();
    this.missionModelService.fetchLinkList({
      mid: ''
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
      this.linkMissionList[i].day = this.dateService.formatWithTimezone(this.linkMissionList[i].created, 'ddS');
      this.linkMissionList[i].hm = this.dateService.format(this.linkMissionList[i].created, 'HH:MM');
      this.linkMissionList[i].ap = this.dateService.format(this.linkMissionList[i].created, 'tt');
    }
  }


  /**
   * 选择需要link 的mission
   */
  selectLinkMission(data: any) {
    this.linkInfoName = data.name;
    this.isShowLinkList = false;
    this.dateTemplate.start.isHasLink = true;
    this.dateTemplate.start.isShowDateTime = false;
    this.dateTemplate.start.isNow = false;
    this.dateTemplate.start.linkArr = [];
    this.dateTemplate.start.linkArr.push(data);
    if (this.missionType !== MissionConstant.MISSION_TYPE_APPLICATION) {
      this.dateTemplate.end.isShowDatePeriod = true;
    }
  }

  /**
   * 重置为pending (application重置为now) 点击X号按钮
   * @param event
   */
  recoveryPending(event: any, param: string) {
    event.stopPropagation();
    if (param === 'start') {
      this.linkInfoName = '';
      this.dateTemplate.start.linkArr = [];
      this.dateTemplate.start.isHasLink = false;
      this.dateTemplate.start.isNow = false;
    }
    if (this.missionType === MissionConstant.MISSION_TYPE_APPLICATION) {
      this.dateTemplate[param].defaultContent = 'NOW';
    } else {
      this.dateTemplate[param].defaultContent = 'PENDING';
    }
    this.dateTemplate.end.isShowDatePeriod = false;
    this.dateTemplate[param].isShowDateTime = false;
    this.calendarData[param] = '';
  }

  /**
   * 重置为now 点击时钟按钮
   * @param event
   */
  resetTime(event: any) {
    event.stopPropagation();
    this.linkInfoName = '';
    this.dateTemplate.start.linkArr = [];
    this.dateTemplate.end.isShowDatePeriod = false;
    this.dateTemplate.start.isHasLink = false;
    this.dateTemplate.start.isShowDateTime = false;
    this.dateTemplate.start.isNow = true;
    this.dateTemplate.start.defaultContent = 'NOW';
    this.calendarData.start = '';
  }

  /**
   * 点击start 时间
   * @param event
   * @param startCalendar
   */
  onStartCalendar(event: any, startCalendar) {
    if (this.dateTemplate.start.isAbleSelectDate) {
      event.stopPropagation();
      this.isShowCalendar = !this.isShowCalendar;
      if (this.isCalendar === 'end') {
        this.isShowCalendar = true;
      }
      this.isCalendar = this.isShowCalendar ? 'start' : '';
      this.multiCalendar.isClickStart = true;
      this.multiCalendar = {
        isClickStart: true,
        isClickEnd: false,
        data: this.calendarData,
        dateTemplate: this.dateTemplate,
        isShow: true,
        isFixed: true,
        isParent: true,
        parentElement: startCalendar,
        currentShowElement: this.calendarProfile.nativeElement
      }
    }
    this.isShowLinkList = false;
    if (this.bidding) {
      this.bidding.getOutDefault();
    }
  }

  /**
   * 点击结束时间
   */
  onEndCalendar(event: any, endCalendar: any) {
    if (this.dateTemplate.end.isAbleSelectDate) {
      event.stopPropagation();
      this.isShowCalendar = !this.isShowCalendar;
      if (this.isCalendar === 'start') {
        this.isShowCalendar = true;
      }
      this.isCalendar = this.isShowCalendar ? 'end' : '';
      this.multiCalendar.isClickStart = true;
      this.multiCalendar = {
        isClickStart: false,
        isClickEnd: true,
        data: this.calendarData,
        dateTemplate: this.dateTemplate,
        isShow: true,
        isFixed: true,
        isParent: true,
        parentElement: endCalendar,
        currentShowElement: this.calendarProfile.nativeElement
      }
    }
    this.isShowLinkList = false;
    if (this.bidding) {
      this.bidding.getOutDefault();
    }
  }

  /**
   * 得到日历传来的开始，结束日期对象
   */
  getSelectData(event: any) {
    // this.isShowCalendar = false;
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
      //TODO
      this.formatStartDate = this.selectDate.startDate;
      this.selectDate.startDate.stringMonth = this.dateService.format(this.selectDate.startDate.formatUtcString, 'mmm');
      this.dateTemplate.start.isShowDateTime = this.selectDate.startDate.year !== '';
    }
    this.dateTemplate.end.isShowDatePeriod = this.selectDate.endDate.isShowDatePeriod;
    this.dateTemplate.end.date_period = this.selectDate.endDate.date_period;
    this.dateTemplate.end.isShowDateTime = this.selectDate.endDate.year !== '';
    this.formatEndDate = this.selectDate.endDate;

    this.selectDate.endDate.stringMonth = this.dateService.format(this.selectDate.endDate.formatUtcString, 'mmm');
    this.calendarData = {
      start: this.selectDate.startDate.formatUtcString,
      end: this.selectDate.endDate.formatUtcString
    }

  }


  /**
   * 点击link的mission (新窗口打开页面)
   */
  hrefToLinkMission(event: any) {
    event.stopPropagation();
  }

  /**
   * 页面初始化进去调用  token => map/folder session里面有取session存的值,没有的时候调接口
   */
  getGeneralToken() {
    if (!this.missionDataService.requestToken(this.KEY_GENERAL_TOKEN)) {
      let data = {
        type: MissionConstant.MISSION_GENERAL_TOKEN
      };
      this.missionModelService.missionGetToken({
        data
      }, (res: any) => {
        if (res.status === 1) {
          this.generalToken = res.data;
          this.missionDataService.cacheToken(this.KEY_GENERAL_TOKEN, res.data.token);
          this.missionDataService.cacheToken(this.KEY_FOLDER_ID, res.data.fid);
          this.createFolder.getGeneralToken(this.generalToken);
        }
      })
    } else {
      this.generalToken = {
        fid: this.missionDataService.requestToken(this.KEY_FOLDER_ID),
        token: this.missionDataService.requestToken(this.KEY_GENERAL_TOKEN)
      }
      this.createFolder.getGeneralToken(this.generalToken);
    }

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
   *clearInfo
   */
  clearInfo() {
    this.isShowEditInput = false;
    this.isShowDatePeriodUnit = false;
    this.isShowLinkList = false;
    // this.isShowCalendar = false;
    //this.biMultiCalendar.isShowHour = false;
  }


  public showMissionNameHover: boolean = false;


  /**
   * 必填字段验证
   */
  blurEvent(event: any, type: string) {
    if (event.target.value === '') {
      if (type === 'missionName') {
        this.showMissionNameHover = true;
      }
    }
  }

  focusEvent(event: any, type: string) {
    if (type === 'missionName') {
      this.showMissionNameHover = false;
    }
  }


  /**
   * 点击？显示mission 帮助
   */

  showMissionHelp(event: any) {
    let missionHelpDesc: string = '';
    event.stopPropagation();
    //help页面下 强制改变body的高度
    let body: any = document.getElementsByTagName('body')[0];
    let scrollBar: any = document.getElementById('scrollBar');
    this.renderer.setElementStyle(body, 'height', 'auto');
    this.renderer.setElementStyle(scrollBar, 'height', 'auto');
    this.isHelpPage = true;
    setTimeout(() => {
      let intro = introInit.introJs();
      if (this.translateService.lan == 'zh-cn') {
        switch (this.missionType) {
          case MissionConstant.MISSION_TYPE_APPLICATION:
            missionHelpDesc = '选择已有的流程，描述此次的申请说明';
            break;
          case MissionConstant.MISSION_TYPE_ASSIGNMENT:
            missionHelpDesc = '安排是指上级对直属下级直接安排的任务，可选择的执行人只有直属下级';
            break;
          case MissionConstant.MISSION_TYPE_MEETING:
            missionHelpDesc = '设置参会人员以及会议说明';
            break;
          case MissionConstant.MISSION_TYPE_PROJECT:
            missionHelpDesc = '项目任务需要在项目里建立不同的子任务，选择添加任务即可';
            break;
          case MissionConstant.MISSION_TYPE_TASK:
            missionHelpDesc = '设置任务的执行人或批复人';
            break;
        }
        intro.setOptions({
          prevLabel: '<em class="icon1-help-arrow"></em><i class="base">上一步</i>',
          nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">下一步</i>',
          exitOnEsc: true,
          hidePrev: false,
          hideNext: true,
          exitOnOverlayClick: true,
          showProgress: true,
          showBullets: true,
          showStepNumbers: false,
          disableInteraction: true,
          tooltipClass: 'help-wrap help-no-padding show-btn',
          steps: [
            {
              element: '#step_mission_1',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">新建任务名称以及选择任务的类型，判断是否要把任务快捷在桌面上</div>'
            },
            {
              element: '#step_mission_2',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">设置任务的开始和结束时间或设置关联任务， 某些任务无法设置结束时间例如：申请，项目（需要根据子任务的开始时间）</div>'
            },
            {
              element: '#step_mission_3',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">可设置任务的附加功能增加任务的功能性</div>'
            },
            {
              element: '#step_mission_4',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">知情人功能</div>'
            },
            {
              element: '#step_mission_5',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">选择此项，用户可选择需要观察但不参与具体实施的任务人员</div>'
            },
            {
              element: '#step_mission_6',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">纪要功能</div>'
            },
            {
              element: '#step_mission_7',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">在会议模式下可设置会议纪要人员</div>'
            },
            {
              element: '#step_mission_8',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">优先等级</div>'
            },
            {
              element: '#step_mission_9',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">可设置任务的优先等级,等级越高的任务</div>'
            },
            {
              element: '#step_mission_10',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">位置定位功能</div>'
            },
            {
              element: '#step_mission_11',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">聊天通道，包括个人，公司以及任务聊天</div>'
            },
            {
              element: '#step_mission_12',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">投标功能</div>'
            },
            {
              element: '#step_mission_13',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">安排会议时间以及会议室，管理会议室</div>'
            },
            {
              element: '#step_mission_14',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">目标功能</div>'
            },
            {
              element: '#step_mission_15',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">制定和管理员工假期以及请假</div>'
            },
            {
              element: '#step_mission_16',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">收入和支出功能</div>'
            },
            {
              element: '#step_mission_17',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">收入和支出适用于申请任务，可管理项目收入和支出状况</div>'
            },
            {
              element: '#step_mission_18',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">任务文件夹</div>'
            },
            {
              element: '#step_mission_19',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">建立共享位置或查看追踪位置</div>'
            },
            {
              element: '#step_mission_20',
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">' + missionHelpDesc + '</div>'
            },
            {
              intro: '<h3 class="f53-f help-title help-title2">教程' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>取消</span></h3><div class="help-line"></div>' +
              '<div class="help-click">仍然困惑？你可以回放这个教程或联系xxxxxxxxxxxxx更多的帮助！</div>'
            },
          ]
        });
      } else {
        switch (this.missionType) {
          case MissionConstant.MISSION_TYPE_APPLICATION:
            missionHelpDesc = 'Select existing process (required), give a description of this process (optional)';
            break;
          case MissionConstant.MISSION_TYPE_ASSIGNMENT:
            missionHelpDesc = 'Set an assignment to your subordinate';
            break;
          case MissionConstant.MISSION_TYPE_MEETING:
            missionHelpDesc = 'Decide the topic and participants';
            break;
          case MissionConstant.MISSION_TYPE_PROJECT:
            missionHelpDesc = "A project must contain more than one task, achived by click 'add task' button.";
            break;
          case MissionConstant.MISSION_TYPE_TASK:
            missionHelpDesc = 'Decide on the choice of executor and approver';
            break;
        }
        intro.setOptions({
          prevLabel: '<em class="icon1-help-arrow"></em><i class="base">Previous</i>',
          nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">Next</i>',
          exitOnEsc: true,
          hidePrev: false,
          hideNext: true,
          exitOnOverlayClick: true,
          showProgress: true,
          showBullets: true,
          showStepNumbers: false,
          disableInteraction: true,
          tooltipClass: 'help-wrap help-no-padding show-btn',
          steps: [
            {
              element: '#step_mission_1',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">New project, able to create a shortcut on your desktop</div>'
            },
            {
              element: '#step_mission_2',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Sets the start and due dates for tasks or sets the associated task. Certain tasks ' +
              'cannot set due dates, for example: the application, the project (depending on the start time of the associated task)</div>'
            },
            {
              element: '#step_mission_3',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Additional features  and increase the functionality for tasks.</div>'
            },
            {
              element: '#step_mission_4',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Observer</div>'
            },
            {
              element: '#step_mission_5',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Only observe the tasks, no execution and reply function </div>'
            },
            {
              element: '#step_mission_6',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Memo</div>'
            },
            {
              element: '#step_mission_7',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Appoint a recorder</div>'
            },
            {
              element: '#step_mission_8',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Priority</div>'
            },
            {
              element: '#step_mission_9',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">You can set priority for tasks</div>'
            },
            {
              element: '#step_mission_10',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Location</div>'
            },
            {
              element: '#step_mission_11',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">knowing where the are.</div>'
            },
            {
              element: '#step_mission_12',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Bidding</div>'
            },
            {
              element: '#step_mission_13',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">A process to decide on the winner in several suppliers by the form of ballot.</div>'
            },
            {
              element: '#step_mission_14',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Target</div>'
            },
            {
              element: '#step_mission_15',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Executor performing a number of tasks together or individually</div>'
            },
            {
              element: '#step_mission_16',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Revenues and expenses</div>'
            },
            {
              element: '#step_mission_17',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Applicable to application type task,able to manage revenues and expenses of the project</div>'
            },
            {
              element: '#step_mission_18',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Specific folder, very convenient for users to find and organize and share</div>'
            },
            {
              element: '#step_mission_19',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Share your location or looking for someone</div>'
            },
            {
              element: '#step_mission_20',
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">' + missionHelpDesc + '</div>'
            },
            {
              intro: '<h3 class="f53-f help-title help-title2">tutorial' +
              '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
              '<em>esc </em>to cancel</span></h3><div class="help-line"></div>' +
              '<div class="help-click">Still confused? You can replay this tutorial or contact xxxxxxxxxxxxx for more help!</div>'
            },
          ]
        });
      }
      intro.start();
      intro.onafterchange((targetElement) => {
        if (!targetElement.getAttribute('data-step')) {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
        } else {
          intro.setOption('tooltipClass', 'help-wrap help-no-padding')
        }
      });
      intro.onexit(() => {
        this.isHelpPage = false;
        this.renderer.setElementStyle(body, 'height', '');
        this.renderer.setElementStyle(scrollBar, 'height', '');
        this.renderer.setElementClass(document.getElementsByTagName('body')[0], 'body-help', false);
      })
    }, 1000);
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }
}