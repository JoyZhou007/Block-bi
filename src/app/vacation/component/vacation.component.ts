import {Component, Inject, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import {CompanyModelService} from '../../shared/services/index.service';
import {Subscription} from "rxjs";
import *  as VacationConfig from '../../shared/config/vacation.config';
@Component({
  selector: 'vacation',
  templateUrl: '../template/vacation.component.html',
  styleUrls: ['../../../assets/css/vacation/vacation.css'],
  encapsulation: ViewEncapsulation.None
})

export class VacationComponent implements OnInit {
  public vacationInfoList: Array<any> = [];
  public vacations: Array<any> = [];
  public subscription: Subscription;
  public vacationSettings: any = {};
  private selectAll: boolean = false;
  private key: number = 0;
  public multiCalendar: any = {};
  // public isShowCalendar: boolean = false;
  public startDate: string;                   //会议对象的开始时间
  public endDate: string;                     //会议对象的结束时间
  public formatString = 'yyyy-mm-dd HH:MM';
  public format = 'yyyy-m-d';
  public startTime: string = 'select start time';  //显示的开始时间
  public endTime: string = 'select start end';     //显示的结束时间
  public dateWord = {
    //月份
    month: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],

    monthSmall: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //周
    week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday']
  };
  public showStartTime:any={};
  public showEndTime:any={};
  private isAll: boolean = false;
  private searchText: string = '';

  public isShowCalendar: boolean = false;
  private isCalendar: string = '';
  @ViewChild('calendarProfile') private calendarProfile: any;


  constructor(public companyModelService: CompanyModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,) {

  }

  ngOnInit() {
    let now = new Date();
    this.startDate = this.dateService.formatLocal(now,this.formatString);
    this.endDate = this.dateService.formatLocal(now,this.formatString);
    //获取假期列表
    this.getVacationList();
    this.subscription = this.notificationService.getNotification().subscribe(
      (data: any) => {
        if (data.act == this.notificationService.config.ACT_COMPONENT_VACATION_UPDATE_VACATION) {
          if (data.data) {
             this.getVacationList();
            this.dealVacation(data.data);
          }
        }
      });
    this.showStartTime = {
      year:now.getFullYear().toString(),
      month:this.dateWord.monthSmall[now.getMonth()],
      day:now.getDate()<10?`0${now.getDate()}`:now.getDate().toString(),
      hourMinute:'08:00',
      week:this.dateWord.week[now.getDate()]
    }
    this.showEndTime = {
      year:now.getFullYear().toString(),
      month:this.dateWord.monthSmall[now.getMonth()],
      day:now.getDate()<10?`0${now.getDate()}`:now.getDate().toString(),
      hourMinute:'09:00',
      week:this.dateWord.week[now.getDate()]
    }
    this.getVacationList();
  }

  /**
   * 获取假期列表
   */
  getVacationList() {
    let date = {
      "filter": {"start": this.startDate+":00", "end": this.endDate+":00"}
    };
    this.companyModelService.showVacationUsage({data: date}, (response: any) => {
      if (response.status === 1) {
        if (response.data) {
          this.dealVacation(response.data.vacation);
          //员工列表
          this.vacationInfoList = response.data.internal;
          //添加是否隐藏
          for (let i = 0; i < this.vacationInfoList.length; i++) {
            this.vacationInfoList[i].isHide = true;
            this.vacationInfoList[i].isSelect = false;
            this.vacationInfoList[i].user_profile_path = this.config.resourceDomain + this.vacationInfoList[i].user_profile_path;
          }
        }
      }
    })
  }

  /**
   * 添加vacation 类型，天数
   */
  dealVacation(obj: any) {
    //type假期类型,num假期总天数
    if(obj && obj[1]) {
      this.vacations = [];
      for (let key in obj) {
        this.key = parseInt(key);
        switch (key) {
          case VacationConfig.VACATION_CASUAL_NUMBER :
            this.vacations.push({type: VacationConfig.VACATION_CASUAL_LEAVE, num: parseInt(obj[key])});
            break;
          case VacationConfig.VACATION_SICK_NUMBER :
            this.vacations.push({type: VacationConfig.VACATION_SICK_LEAVE, num: parseInt(obj[key])});
            break;
          case VacationConfig.VACATION_MARITAL_NUMBER :
            this.vacations.push({type: VacationConfig.VACATION_MARITAL_LEAVE, num: parseInt(obj[key])});
            break;
          case VacationConfig.VACATION_MATERNITY_NUMBER :
            this.vacations.push({type: VacationConfig.VACATION_MATERNITY_LEAVE, num: parseInt(obj[key])});
            break;
          case VacationConfig.VACATION_ANNUAL_NUMBER :
            this.vacations.push({type: VacationConfig.VACATION_ANNUAL_LEAVE, num: parseInt(obj[key])});
            break;
        }
      }

    }else{
      this.initVacation();
    }
  }

  /**
   * 初始化假期
   */
  initVacation(){
  if (!this.vacations.length) {
    this.vacations = [
      {
        type: 'Casual leave',
        num: '0'
      },
      {
        type: 'Sick leave',
        num: '0'
      },
      {
        type: 'Marital leave',
        num: '0'
      },
      {
        type: 'Maternity leave',
        num: '0'
      },
      {
        type: 'Annual leave',
        num: '0'
      }
    ]
  }
}
  /**
   * 点击隐藏员工信息
   * @param vacation
   * @param event
   */
  onClickHideUser(vacation: any, event: any, index: number) {
    if (event) {
      event.stopPropagation();
    }
    if (vacation) {
      vacation.isHide = !vacation.isHide;
    }
    if (!vacation.isHide) {
      let data = {
        "uid": vacation.uid,
        "filter": {"start": this.startDate+":00", "end": this.endDate+":00"}
      };
      this.companyModelService.showStaffVacation({data: data}, (response: any) => {
        if (response.status === 1) {
          if(!Array.isArray(response.data)) {
            this.vacationInfoList[index].vacationList = [];
            return false;
          }
          if (response.data) {
            this.vacationInfoList[index].vacationList = response.data;
            for(let i=0;i< this.vacationInfoList[index].vacationList.length;i++){
              for(let j=1;j<=this.key;j++){
                if(this.vacationInfoList[index].vacationList[i][j]){
                  this.vacationInfoList[index].vacationList[i][j].showStart = this.dateService.formatLocal( this.vacationInfoList[index].vacationList[i][j].start,'mmm ddS');
                }
                if(this.vacationInfoList[index].vacationList[i][j]){
                  this.vacationInfoList[index].vacationList[i][j].showEnd = this.dateService.formatLocal( this.vacationInfoList[index].vacationList[i][j].end,'mmm ddS');
                }
              }
            }
          }
        }
      })
    }
  }

  /**
   * 点击设置按钮
   * @param event
   */
  onClickSetting(event: any) {
    if (event) {
      event.stopPropagation();
    }
    //获取设置数据
    this.companyModelService.getVacationSetting((response: any) => {
      if (response.status === 1) {
        if (response.data) {
          this.vacationSettings = response.data;
          this.openSettingDialog();
        }
      } else {
        this.dialogService.openError({simpleContent: 'Fail to get vacation settings!'});
      }
    });
  }

  /**
   * 打开vacation setting 弹框
   */
  openSettingDialog() {
    let settings = {
      mode: '2',
      titleAction: 'Set',
      titleComponent: 'Vacation',
      titleIcon: 'font-setting di1-setting',
      isSimpleContent: false,
      componentSelector: 'set-vacation-dialog',
      componentData: this.typeService.clone(this.vacationSettings),
      titleDesc: [
        'Set',
        'company',
        'vacation general information'
      ],
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'send',
          btnEvent: 'onSendVacationSettings'
        }
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 点击multi vacation
   * @param event
   */
  onClickMulti(event: any) {
    if (event) {
      event.stopPropagation();
    }
    let settings = {
      mode: '1',
      title: 'SET MULTI VACATION',
      isSimpleContent: false,
      componentSelector: 'multi-vacation-dialog',
      componentData: this.typeService.clone(this.vacations),
      buttons: [
        {
          type: 'cancel',
        },
        {
          type: 'send',
          btnEvent: 'updateVacation'
        }
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 点击选择框
   * @param event
   * @param index
   */
  onClickSelect(event: any, index: number) {
    if (event) {
      event.stopPropagation();
    }
    this.vacationInfoList[index].isSelect = !this.vacationInfoList[index].isSelect;
    if(!this.vacationInfoList[index].isSelect){
      this.isAll = false;
    }
    let flag = 1;
    for (let i = 0; i < this.vacationInfoList.length; i++) {
      if(!this.vacationInfoList[i].isSelect){
        flag = 0;
      }
    }
    if(flag){
      this.isAll = true;
    }
  }

  onSelectAll(event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.selectAll = !this.selectAll;
    this.isAll = !this.isAll;
    for (let i = 0; i < this.vacationInfoList.length; i++) {
      this.vacationInfoList[i].isSelect = this.isAll;
    }
  }

  /**
   * 点击开始时间
   */
  onClickStart(event: any, startCalendar: any) {
    event.stopPropagation();
    this.isShowCalendar = !this.isShowCalendar;
    if(this.isCalendar === 'end') {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? 'start' : '';
    this.multiCalendar = {
      data: {
        start: this.startDate ? this.dateService.utcDateFormat(this.startDate, this.formatString) : '',
        end: this.endDate ? this.dateService.utcDateFormat(this.endDate, this.formatString) : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: !!this.startDate
        },
        end: {
          isShowDateTime: !!this.endDate
        }
      },
      isClickStart: true,
      isClickEnd: false,
      isBidding:true,
      isShow:true,
      isFixed: true,
      isParent: true,
      parentElement: startCalendar,
      currentShowElement: this.calendarProfile.nativeElement
    };
  }

  /**
   * 点击结束时间
   */
  onClickEnd(event: any, endCalendar: any) {
    event.stopPropagation();
    this.isShowCalendar = !this.isShowCalendar;
    if(this.isCalendar === 'start') {
      this.isShowCalendar = true;
    }
    this.isCalendar = this.isShowCalendar ? 'end' : '';
    this.multiCalendar = {
      data: {
        start: this.startDate ? this.dateService.utcDateFormat(this.startDate, this.formatString) : '',
        end: this.endDate ? this.dateService.utcDateFormat(this.endDate, this.formatString) : ''
      },
      dateTemplate: {   //传入是否有具体时间
        start: {
          isShowDateTime: !!this.startDate
        },
        end: {
          isShowDateTime: !!this.endDate
        }
      },
      isClickStart: false,
      isClickEnd: true,
      isBidding:true,
      isShow:true,
      isFixed: true,
      isParent: true,
      parentElement: endCalendar,
      currentShowElement: this.calendarProfile.nativeElement
    };

  }

  /**
   * 接收日历的传出对象
   * @param event
   */
  getSelectData(event: any) {
    // this.isShowCalendar = false;
    if (event.startDate.year) {
      let date = new Date(event.startDate.startTimeStamp);
      let minute = date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes();
      let hour = date.getHours()<10?`0${date.getHours()}`:date.getHours();
      this.startDate = this.dateService.formatLocal(new Date(event.startDate.startTimeStamp),this.formatString);
      this.showStartTime = {
        year:date.getFullYear().toString(),
        month:this.dateWord.monthSmall[date.getMonth()],
        day:date.getDate()<10?`0${date.getDate()}`:date.getDate().toString(),
        hourMinute:hour+':'+minute,
        week:this.dateWord.week[date.getDate()]
      }
    }
    if (event.endDate.year) {
      let date = new Date(event.endDate.endTimeStamp);
      let minute = date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes();
      let hour = date.getHours()<10?`0${date.getHours()}`:date.getHours();
      this.endDate = this.dateService.formatLocal(new Date(event.endDate.endTimeStamp),this.formatString);
      this.showEndTime = {
        year:date.getFullYear().toString(),
        month:this.dateWord.monthSmall[date.getMonth()],
        day:date.getDate()<10?`0${date.getDate()}`:date.getDate().toString(),
        hourMinute:hour+':'+minute,
        week:this.dateWord.week[date.getDate()]
      }
    }

    this.getVacationList();
  }


  /**
   * 取消search
   * @param event
   */
  onCloseSearch(event: any){
    if(event){
      event.stopPropagation()
    }
    this.searchText = '';
  }

  getOutDefault() {
    this.isShowCalendar = false;
  }

}