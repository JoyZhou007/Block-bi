import {Component, OnInit, Inject, Input} from '@angular/core';
import {NotificationDataService} from '../../shared/services/index.service';

@Component({
  selector: 'set-company-ceo-dialog',
  templateUrl: '../template/set-company-ceo-dialog.component.html'
})

export class SetCompanyCEODialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;
  public notificationKey: string;
  public notificationStatus: any;

  public getData: any;
  public senderInfo: any;
  private userLoginData: any;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('notification.service') public notificationService : any,
    public notificationDataService : NotificationDataService
  ) {}

  ngOnInit() {
    this.userLoginData = this.userDataService.getUserIn();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if(data) {
      this.notificationIn = data;
      this.notificationKey = data.nKey;
      this.notificationStatus = data.resultStatus;

      this.getData = data.data;
      this.senderInfo = data.obj.senderInfo;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  setCeoButDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝Join
   */
  setCeoDialogRefuse() {
    let data: any = {
      initiator: this.getData.owner,
      role: this.getData.role,
      request_id: this.getData.request_id,
      company_name: this.getData.company_name,
      deleted: this.getData.deleted,
      added: this.getData.added,
      cid: this.getData.cid
    };
    this.memberService.refuseBecomeCompanyCeo(data);
  }

  /**
   * 接受Join
   */
  setCeoDialogAccept() {
    let data: any = {
      deleted: this.getData.deleted,
      initiator: this.getData.owner,
      role: this.getData.role,
      cid: this.getData.cid,
      request_id: this.getData.request_id,
      company_name: this.getData.company_name,
      comments: this.getData.comments,
      added: this.getData.added
    };
    this.memberService.acceptBecomeCompanyCeo(data);
  }

}
