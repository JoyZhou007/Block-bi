import {Component, Input, Output, EventEmitter, Inject} from '@angular/core';
import * as profileConfig from '../../shared/config/profile.config';
import {element} from "protractor";
@Component({
  selector: 'educations-list',
  templateUrl: '../template/personal-educations.component.html'
})

export class PersonalEducationsComponent {

  public getEducationsData: any = {};
  public getCurrent: number;
  public startDate: any;
  public endDate: any;
  public dateFormat: string = 'yyyy-mm-dd';
  public isAdd: boolean = false;
  public errorObj: any = {};
  public hasStartEnd: boolean = false;
  public emptyError: string = profileConfig.PROFILE_EMPTY_ERROR;
  public select_start: string = this.translate.manualTranslate(profileConfig.PROFILE_SELECT_START);
  public select_end: string = this.translate.manualTranslate(profileConfig.PROFILE_SELECT_END);
  public showTime: any = {};

  /**
   * 接收父级数据
   * @param data
   */
  @Input() set educationsData(data: any) {
    this.getEducationsData = data;
      this.dealDate();
  }

  @Input() set error(data: any) {
    this.errorObj = data;
  }

  /**
   * 当前是哪个对象 方便操作
   * @param i
   */
  @Input() set currentObj(i: number) {
    this.getCurrent = i;
  }

  /**
   * 向父级传入数据
   * @type {EventEmitter}
   */
  @Output() public callBackData: EventEmitter<any> = new EventEmitter();
  @Output() public outDate: EventEmitter<any> = new EventEmitter();

  constructor(
    @Inject('date.service') public dateService: any,
    @Inject('page.element') public pageElement: any,
    @Inject('bi-translate.service') public translate: any
  ) {}

  /**
   * 返回删除当前的length
   * @param event
   */
  deleteCurrentObj(event: any) {
    this.callBackData.emit(event);
  }

  /**
   * 处理显示日期
   */
  dealDate(){
  if (this.getEducationsData.start_date != this.select_start && this.getEducationsData.end_date != this.select_end) {
    this.showTime.start = this.dateService.formatLocal(this.getEducationsData.start_date, 'ddS') + " " +
      this.dateService.formatLocal(this.getEducationsData.start_date, 'mmmm') + " " +
      this.dateService.formatLocal(this.getEducationsData.start_date, 'yyyy');
    this.showTime.end = this.dateService.formatLocal(this.getEducationsData.end_date, 'ddS') + " " +
      this.dateService.formatLocal(this.getEducationsData.end_date, 'mmmm') + " " +
      this.dateService.formatLocal(this.getEducationsData.end_date, 'yyyy');
  }
}
  /**
   * 设置时间
   * @param event
   * @param type
   */
  dateClick(event: any, type: string) {
      this.dealDate();
    event.stopPropagation();
    this.outDate.emit({
      getCurrent: this.getCurrent,
      type: type,
      start_date: this.getEducationsData.start_date,
      end_date: this.getEducationsData.end_date,
      currentClickElement: event,
      module: 'educations'
    });
  }

}
