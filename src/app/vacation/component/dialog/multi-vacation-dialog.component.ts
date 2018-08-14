import {Component, Input, Inject, OnInit, ViewChild, Renderer} from "@angular/core";
import {CompanyModelService} from "../../../shared/services/index.service";
import {inject} from "@angular/core/testing";
@Component({
  selector: 'multi-vacation-dialog',
  templateUrl: '../../template/dialog/multi-vacation-dialog.component.html',
  providers: [CompanyModelService]
})
export class MultiVacationDialog implements OnInit {
  public vacations: any = [];//假期类型和天数
  public init_vacations: Array<any> = [];
  //假期类型和天数
  constructor(public companyModelService: CompanyModelService,
              public renderer: Renderer,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service')public notificationService: any) {
  }

  @Input() set setOption(data: any) {
    if (data) {
      this.vacations = data;
      this.init_vacations = data;
    }
  }

  ngOnInit() {
  }

  /**
   *
   * @param event
   * @param index  假期索引
   * @param type  0 ：减少天数 ； 1 ：增加天数
   * @returns {boolean}
   */
  onClickDay(event: any, index: number, type) {
    if (event) {
      event.stopPropagation();
    }
    if (type === 1) {
      this.vacations[index].num++;
    } else if (type === 0) {
      //小于0不再减少
      if (this.vacations[index].num <= 0) {
        return false;
      } else {
        this.vacations[index].num--;
      }
    }
  }

  /**
   * 更新假期天数
   */
  updateVacation() {
    let data:any = {};
    for (let i = 0; i < this.vacations.length; i++) {
      data[i+1] = this.vacations[i].num;
      if(i==0 || i==1){
        data[i+1] = -1;
      }
    }
    this.companyModelService.updateVacation({data:data}, (response) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
      if(response.status === 1){
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_VACATION_UPDATE_VACATION,
          data: this.typeService.clone(data)
        });
      }
    })
  }
}