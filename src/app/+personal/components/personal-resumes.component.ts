///<reference path="../../../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {
  Component, OnInit, Inject, ViewEncapsulation, Renderer, ViewChild, ElementRef} from '@angular/core';
import {PersonalModelService, EducationsInfo, ExperiencesInfo} from '../../shared/services/index.service';
import {PersonalEducationsComponent} from './personal-educations.component';
import {PersonalExperienceComponent} from './personal-experience.component';
import * as profileConfig from '../../shared/config/profile.config';
@Component({
  selector: 'personal-resumes',
  encapsulation: ViewEncapsulation.None,
  templateUrl: '../template/personal-resumes.component.html',
  styleUrls: [
    '../../../assets/css/account/account.css'
  ]
})
export class PersonalResumesComponent implements OnInit {

  public getEducationsInfo: EducationsInfo;
  public getExperiencesInfo: ExperiencesInfo;
  public workName: string;
  public userEduExp: any = {user_edu_exp: ''};
  public userEduExpJson: any = {user_educations: [], user_experiences: []};

  //教育变量
  public educationsListArr: Array<any> = [];

  //经历变量
  public experiencesArr: Array<any> = [];
  public experiencesListArr: Array<any> = [];

  public userLoginData: any;
  public experiencesTime: Array<any> = [];
  public errorObj: Array<any> = [];
  public cerrorObj: Array<any> = [];

  //日历
  public multiCalendar: any = {
    isFixed: true,
    scrollElement: this.scrollElement
  };
  public startDate: string;
  public endDate: string;
  public isShowCalendar: boolean = false;
  private getCurrent: string | number;

  public select_start: string = this.translate.manualTranslate(profileConfig.PROFILE_SELECT_START);
  public select_end: string = this.translate.manualTranslate(profileConfig.PROFILE_SELECT_END);
  public dateFormat: string = 'yyyy-mm-dd';
  public isShowStartError: boolean = false;
  public isShowEndError: boolean = false;
  private inputDateStart: string;
  private inputDateEnd: string;
  private module: string;
  private isCalendar: string = '';
  private btnFail: any;

  @ViewChild('educationsElement') private educationsElement: PersonalEducationsComponent;
  @ViewChild('experienceElement') private experienceElement: PersonalExperienceComponent;
  @ViewChild('scrollElement') private scrollElement: ElementRef;
  @ViewChild('calendarProfile') private calendarProfile: ElementRef;
  private sendStart: string;
  private sendEnd: string;

  constructor(
    private renderer: Renderer,
    public personalService: PersonalModelService,
    @Inject('app.config') public config: any,
    @Inject('type.service') public typeService: any,
    @Inject('date.service') public dateService: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('bi-translate.service') public translate: any,
    @Inject('user-data.service') public userDataService: any
  ) {}

  ngOnInit() {
    this.getEducationsInfo = EducationsInfo.init();
    this.getExperiencesInfo = ExperiencesInfo.init();
    this.userLoginData = this.userDataService.getUserIn();

    //获取教育信息
    this.getUserEducations();

    let start = document.querySelector('.education-start');
  }

  /**
   * 删除 学历，经验
   * @param i
   */
  getCallBackData(i: any) {
    this.educationsListArr[i].operation = -1;
  }

  getExpCallBackData(i: any) {
    this.experiencesListArr[i].operation = -1;
  }

  /**
   * 初始化教育经历信息
   */
  /**
   * 获取技能列表
   */
  getUserEducations() {
    this.personalService.getUserInfo(
      {personal_module: 'resume'},
      (data: any) => {
        if (data.status === 1) {

          this.experiencesArr = data.data.experiences;
          this.workName = this.userLoginData.user.work_name;

          //教育
          this.educationsListArr = this.typeService.bindDataList(
            this.getEducationsInfo, data.data.educations
          );

          //经历
          this.experiencesListArr = this.typeService.bindDataList(
            this.getExperiencesInfo, data.data.experiences
          );

          for (let key in this.experiencesListArr) {
            this.experiencesTime[key] = {
              type: 2,
              setEvent: (date: any) => {
                this.experiencesListArr[key].start_date = date.startDate;
                this.experiencesListArr[key].end_date = date.endDate;
              }
            };
          }
        } else {
          this.dialogService.openError({simpleContent: data.message});
        }
      })
  }

  /**
   * 添加教育
   */
  public addEducations() {
    let newEducationInfo: EducationsInfo = EducationsInfo.init();
    newEducationInfo.start_date = this.translate.manualTranslate(newEducationInfo.start_date);
    newEducationInfo.end_date = this.translate.manualTranslate(newEducationInfo.end_date);
    this.educationsListArr.push(newEducationInfo);
  };

  /**
   * 添加经历
   */
  public addExperiences() {
    let len = this.typeService.getDataLength(this.experiencesListArr);
    let newExperience: ExperiencesInfo = ExperiencesInfo.init();
    newExperience.start_date = this.translate.manualTranslate(newExperience.start_date);
    newExperience.end_date = this.translate.manualTranslate(newExperience.end_date);
    this.experiencesListArr.push(newExperience);
    this.experiencesListArr[len].id = 0;
    this.experiencesListArr[len].tag = 1;
  }

  /**
   * 教育经历信息保存
   */
  doUploadInfo(element: any) {

    if(this.educationsListArr.length === 0 && this.experiencesListArr.length === 0) {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      return false;
    }

    //教育保存
    if(this.educationsListArr.length === 0) {
      this.userEduExpJson.user_educations = [];
    }else {
      for (let key in this.educationsListArr) {
        this.userEduExpJson.user_educations[key] = this.educationsListArr[key];
      }
    }

    //经历保存
    if(this.experiencesListArr.length === 0) {
      this.userEduExpJson.user_experiences = [];
    }else {
      for (let key in this.experiencesListArr) {
        this.userEduExpJson.user_experiences[key] = this.experiencesListArr[key];
      }
    }

    this.userEduExp.user_edu_exp = this.userEduExpJson;

    //判断必选项是否全部填写
    let educations = this.userEduExp.user_edu_exp.user_educations;
    let experiences = this.userEduExp.user_edu_exp.user_experiences;

    //education所有时间，school必填
    if (educations) {
      let schoolEmpty = false;
      let timeEmpty = false;
      let companyEmpty = false;
      let ctimeEmpty = false;
      for (let i = 0; i < educations.length; i++) {
        if (this.educationsListArr[i]) {
          if (educations[i].school == '' && educations[i].operation != -1) {
            this.educationsListArr[i].schoolEmpty = true;
            schoolEmpty = true;
          } else {
            this.educationsListArr[i].schoolEmpty = false;
          }
          if ((educations[i].start_date == 'start dates' ||
            educations[i].end_date == 'end dates') && educations[i].operation != -1) {
            this.educationsListArr[i].timeEmpty = true;
            timeEmpty = true;
          } else {
            this.educationsListArr[i].timeEmpty = false;
          }
          //未填写返回错误对象
          this.errorObj.push(this.educationsListArr[i]);
        }
      }
      //experience所有时间，company必填
      for (let i = 0; i < experiences.length; i++) {
        if (experiences[i]) {
          if (experiences[i].company == '' && experiences[i].operation != -1) {
            this.experiencesListArr[i].companyEmpty = true;
            companyEmpty = true;
          } else {
            this.experiencesListArr[i].companyEmpty = false;
          }
          if ((experiences[i].start_date == 'start dates' ||
            experiences[i].end_date == 'end dates') && experiences[i].operation != -1) {
            this.experiencesListArr[i].ctimeEmpty = true;
            ctimeEmpty = true;
          } else {
            this.experiencesListArr[i].ctimeEmpty = false;
          }
          //未填写返回错误对象
          this.cerrorObj.push(this.experiencesListArr[i]);
        }
      }

      if (companyEmpty || ctimeEmpty || schoolEmpty || timeEmpty) {
        this.renderer.setElementClass(element, this.config.btnProgress, false);
        return false;
      }
    }
    this.personalService.saveEducations(this.userEduExp,
      (data: any) => {
        if (data.status === 1) {
          let response: any = data.data;
          this.educationsListArr = response.educations;
          this.experiencesListArr = response.experiences;

          //成功，按钮添加对号，1秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          },this.config.btnSuccessTime);
        } else {
          this.dialogService.openError({simpleContent: data.message});

          //失败，按钮添加叉号，错误提示，3秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
          },this.config.btnFailTime);
          this.btnFail = data.message;
        }
        this.renderer.setElementClass(element, this.config.btnProgress, false);
      }
    );
  }

  /**
   * 接收时间
   * @param data
   */
  getDateObj(data: any) {
    this.isShowCalendar = !this.isShowCalendar;
    if(this.isCalendar !== data.type || data.getCurrent !== this.getCurrent || data.module !== this.module) {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? data.type : '';
    if(this.getCurrent !== '' && data.getCurrent !== this.getCurrent) {
      this.isShowCalendar = true;
      this.inputDateStart = data.start_date;
      this.inputDateEnd = data.end_date;
    }
    this.startDate = data.start_date;

    this.endDate = data.end_date;
    if(!this.inputDateStart) {
      this.inputDateStart = data.start_date;
      this.inputDateEnd = data.end_date;
    }
    this.multiCalendar.parentElement = data.currentClickElement;
    this.getCurrent = data.getCurrent;
    this.module = data.module;
    if(data.type === 'start') {
      this.onClickStart();
    }else {
      this.onClickEnd();
    }
  }

  /**
   * 点击开始时间
   */
  onClickStart() {
    this.multiCalendar = {
      data: {
        start: this.startDate != this.select_start ? this.inputDateStart : '',
        end: this.endDate != this.select_end ? this.inputDateEnd : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: (this.startDate != this.select_start)
        },
        end: {
          isShowDateTime: (this.endDate != this.select_end)
        }
      },
      isClickStart: true,
      isClickEnd: false,
      isMeeting: true,
      currentShowElement: this.calendarProfile.nativeElement
    };
  }

  /**
   * 点击结束时间
   */
  onClickEnd() {
    this.multiCalendar = {
      data: {
        start: this.startDate != this.select_start ? this.inputDateStart : '',
        end: this.endDate != this.select_end ? this.inputDateEnd : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: (this.startDate != this.select_start)
        },
        end: {
          isShowDateTime: (this.endDate != this.select_end)
        }
      },
      isClickStart: false,
      isClickEnd: true,
      isMeeting: true,
      currentShowElement: this.calendarProfile.nativeElement
    };
  }

  /**
   * 接收日历的传出对象
   * @param event
   */
  getSelectData(event: any) {
   /* let startDate: string;
    let endDate: string;*/
    if (event && event.startDate && event.startDate.startTimeStamp) {
      let start = new Date(event.startDate.startTimeStamp);
      this.sendStart = this.dateService.formatWithTimezone(start,'yyyy-mm-dd');
      this.inputDateStart = this.dateService.formatWithTimezone(start.toUTCString(), this.dateFormat);
      this.startDate = this.dateService.formatLocal(start, 'ddS') + " " +
        this.dateService.formatLocal(start, 'mmmm') + " " +
        this.dateService.formatLocal(start, 'yyyy');
    }
    if (event && event.endDate && event.endDate.endTimeStamp) {
      let end = new Date(event.endDate.endTimeStamp);
      this.sendEnd = this.dateService.formatWithTimezone(end,'yyyy-mm-dd');
      this.inputDateEnd = this.dateService.formatWithTimezone(end.toUTCString(), this.dateFormat);
      this.endDate = this.dateService.formatLocal(end, 'ddS') + " " +
        this.dateService.formatLocal(end, 'mmmm') + " " +
        this.dateService.formatLocal(end, 'yyyy');
    }
    if(this.module === 'educations') {
      this.educationsListArr[this.getCurrent].start_date = this.sendStart;
      this.educationsListArr[this.getCurrent].end_date = this.sendEnd;
      this.educationsListArr = this.typeService.clone(this.educationsListArr);
    }else if(this.module === 'experience') {
      this.experiencesListArr[this.getCurrent].start_date = this.sendStart;
      this.experiencesListArr[this.getCurrent].end_date = this.sendEnd;
      this.experiencesListArr = this.typeService.clone(this.experiencesListArr);
    }
    this.isShowCalendar = false;

    //判断开始结束时否全部选择
    // TODO 在IE下不兼容
    this.startAndEnd();
  }

  /**
   *判断开始结束时否全部选择
   */
  startAndEnd() {
    if (this.startDate && this.endDate) {
      this.isShowStartError = false;
      this.isShowEndError = false;
      // this.getEducationsData.start_end = true;
    }
  }

  /**
   * 隐藏日历
   */
  getOutDefault() {
    this.isShowCalendar = false;
  }
}
