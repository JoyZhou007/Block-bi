import {Component, OnInit, Inject, Input} from '@angular/core';
import {NotificationDataService} from '../../shared/services/index.service';

@Component({
  selector: 'link-to-parent-dialog',
  templateUrl: '../template/link-to-parent-dialog.component.html'
})

export class LinkToParentDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('notification.service') public notificationService : any,
    public notificationDataService : NotificationDataService
  ) {}

  ngOnInit() {

  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.notificationIn = data;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  linkToParentButDialog(param: any){
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝Join
   */
  linkToParentDialogRefuse() {
    this.memberService.refuseApplyCompany({
      cid: this.notificationIn.cid,
      pcid: this.notificationIn.pcid,
      comment: this.notificationIn.comment,
      co_type: this.notificationIn.co_type,
      is_allow: this.notificationIn.is_allow,
      company_name: this.notificationIn.company_name,
      request_id: this.notificationIn.request_id ? this.notificationIn.request_id : '',
      receiver: this.notificationIn.owner.uuid
    });
  }

  /**
   * 接受Join
   */
  linkToParentDialogAccept() {
    this.memberService.acceptApplyCompany({
      cid: this.notificationIn.cid,
      pcid: this.notificationIn.pcid,
      comment: this.notificationIn.comment,
      co_type: this.notificationIn.co_type,
      is_allow: this.notificationIn.is_allow,
      company_name: this.notificationIn.company_name,
      request_id: this.notificationIn.request_id ? this.notificationIn.request_id : '',
      receiver: this.notificationIn.owner.uuid
    });
  }

}
