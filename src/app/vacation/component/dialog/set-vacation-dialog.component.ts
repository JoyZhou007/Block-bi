import {Component, Input, Inject, OnInit, Renderer} from "@angular/core";
import {CompanyModelService} from '../../../shared/services/index.service';
@Component({
  selector: 'set-vacation-dialog',
  templateUrl: '../../template/dialog/set-vacation-dialog.component.html',
})
export class SetVacationDialog implements OnInit {
  private superimposedPerm: {};
  private probationPerm: {};
  private isSuperimposed: number = 0;
  private isProbation: number = 0;
  public setttings = {
  };
  public selectCalendarData: any = {};
  public sendData: any = {
    id: '',
    day: 0,
    month: 0,
    probation: 0,
    superimposedPerm: 0
  };
  // public isShowSelectCalendar: boolean = false;
  public showSelectDate: string = '';
  public monthSmall:Array<any> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public monthSuffix: Array<any> = [
    'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
    'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st', 'nd',
    'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'
  ];
  private showError: boolean = false;

  @Input() set setOption(data: any) {
    if (!data) {
    } else {
      this.typeService.mergeObj(this.sendData, data);
      //显示日期
      if (this.sendData.month != '' && this.sendData.day != '') {
        this.showSelectDate = this.sendData.day + '' + this.monthSuffix[this.sendData.day - 1] + ' ' +
          this.monthSmall[this.sendData.month - 1];
      }
    }
    this.isSuperimposed = this.sendData.superimposed;
    this.isProbation = this.sendData.probation;
    this.superimposedPerm = {perm: this.isSuperimposed, bgColorClass: 'g-d-bg1'};
    this.probationPerm = {perm: this.isProbation, bgColorClass: 'g-d-bg1'};
  };

  constructor(@Inject('type.service') public typeService,
              @Inject('notification.service') public notificationService,
              public renderer :Renderer,
              public companyModelService: CompanyModelService) {
  }

  ngOnInit() {
    // this.selectCalendarData = {month:this.sendData.month,day:this.sendData.day};
  }

  /**
   * 点击Superimposed 按钮
   * @param event
   */
  setSuperimposedPerm(event: any) {
    if (event) {
      this.isSuperimposed = event.perm;
      this.sendData.superimposed = this.isSuperimposed;
    }
  }

  /**
   * 点击Probation按钮
   * @param event
   */
  setProbationPerm(event: any) {
    if (event) {
      this.isProbation = event.perm;
      this.sendData.probation = this.isProbation;
    }
  }

  /**
   * 显示时间
   * @param event
   */
  getSelectData(event: any) {
    if (event) {
      this.sendData.day = event.day;
      this.sendData.month = event.month;
      this.showSelectDate = this.sendData.day +'' + this.monthSuffix[this.sendData.day -1] +' '+
        this.monthSmall[this.sendData.month -1];
    }
    // this.isShowSelectCalendar = false;
  }

  /**
   * 点击选择时间
   * @param event
   */
  onClickSelectInput(event: any) {
    event.stopPropagation();
    this.selectCalendarData = {
      topValue:this.sendData.month,
      bottomValue:this.sendData.day,
      isShow:true
    };
  }

  /**
   * 设置假期
   */
  onSendVacationSettings() {
    if(!this.showSelectDate){
      this.showError = true;
      return false;
    }
    this.companyModelService.updateVacationSetting({data: this.sendData}, (response) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
    })
  }

  /**
   * 失去焦点事件
   * @param event
   */
  onBlurEvent(event: any){
    event.stopPropagation();
      if(this.showSelectDate){
        this.showError = false;
      }else{
        this.showError = true;
      }
  }
}