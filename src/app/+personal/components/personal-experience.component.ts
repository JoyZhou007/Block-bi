import {Component, Input, Output, EventEmitter, OnInit, Inject, HostListener} from '@angular/core';
import * as profileConfig from '../../shared/config/profile.config';
@Component({
  selector: 'experience-list',
  templateUrl: '../template/personal-experience.component.html'
})

export class PersonalExperienceComponent implements OnInit {

  public getExperienceData: any;
  public getCurrentObj: number;

  public startDate: any;
  public endDate: any;
  public multiCalendar: any = {                   //传入日历数据
  };
  public isShowCalendar: boolean = false;         //日历显示
  public isShowStartError:boolean = false;
  public isShowEndError:boolean = false;
  public dateFormat:string = 'yyyy-mm-dd';
  public hasStartEnd:boolean = false;
  public errorObj:any={};
  public emptyError:string = profileConfig.PROFILE_EMPTY_ERROR;
  public select_start:string = this.translate.manualTranslate(profileConfig.PROFILE_SELECT_START);
  public select_end:string =  this.translate.manualTranslate(profileConfig.PROFILE_SELECT_END);
  private showTime: any = {};
  private getCurrent: number;

  /**
   * 获取经验数据
   * @param data
   */
  @Input() set experienceData(data: any) {
     this.getExperienceData = data;
   this.dealDate();
  }

  /**
   * 获取当前对象
   * @param i
   */
  @Input() set currentObj(i: number) {
    this.getCurrent = i;
  }

  @Input() set error(data: any) {
    this.errorObj = data;
  }
  /**
   * 向父级传入数据
   * @type {EventEmitter}
   */
  @Output() public expCallBackData: EventEmitter<any> = new EventEmitter();
  @Output() public outDate: EventEmitter<any> = new EventEmitter();

  constructor(
    @Inject('date.service') public dateService: any,
    @Inject('bi-translate.service') public translate: any
  ) {
  }
  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowCalendar = false;
  }

  deleteExperience(event: number) {
    this.expCallBackData.emit(event);
  }

  ngOnInit() {
  }
  /**
   * 处理显示日期
   */
  dealDate(){
    if (this.getExperienceData.start_date != this.select_start && this.getExperienceData.end_date != this.select_end) {
      this.showTime.start = this.dateService.formatLocal(this.getExperienceData.start_date, 'ddS') + " " +
        this.dateService.formatLocal(this.getExperienceData.start_date, 'mmmm') + " " +
        this.dateService.formatLocal(this.getExperienceData.start_date, 'yyyy');
      this.showTime.end = this.dateService.formatLocal(this.getExperienceData.end_date, 'ddS') + " " +
        this.dateService.formatLocal(this.getExperienceData.end_date, 'mmmm') + " " +
        this.dateService.formatLocal(this.getExperienceData.end_date, 'yyyy');
    }
  }
  /**
   * 设置时间
   * @param event
   * @param type
   */
  dateClick(event: any, type: string) {
    event.stopPropagation();
    this.dealDate();
    this.outDate.emit({
      getCurrent: this.getCurrent,
      type: type,
      start_date: this.getExperienceData.start_date,
      end_date: this.getExperienceData.end_date,
      currentClickElement: event,
      module: 'experience'
    });
  }

}
