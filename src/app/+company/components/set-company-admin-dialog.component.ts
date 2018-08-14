import {Component, OnInit, Inject, Input} from '@angular/core';
import {NotificationDataService} from '../../shared/services/index.service';

@Component({
  selector: 'set-company-admin-dialog',
  templateUrl: '../template/set-company-admin-dialog.component.html'
})

export class SetCompanyAdminDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;
  public notificationKey: string;
  public notificationStatus: any;

  public getData: any;
  public senderInfo: any;
  private userLoginData: any;
  private getAllCompany: any[] = [];
  private isShareHolder: boolean = false;

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
  setOwnerButDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝Join
   */
  setOwnerDialogRefuse() {
    if(!this.getData.hasOwnProperty('to_shareholder') || this.getData.to_shareholder === 0) {
      this.memberService.refuseJoinCompany({
        initiator: this.getData.owner,
        role: this.getData.role,
        company_name: this.getData.company_name,
        request_id: this.getData.request_id
      });
    }else if(this.getData.to_shareholder === 1) {
      this.memberService.shareHolderRefuseSetCompanyAdmin({
        initiator: this.getData.owner,
        role: this.getData.role,
        deleted: this.getData.deleted,
        added: this.getData.added,
        company_name: this.getData.company_name,
        request_id: this.getData.request_id
      });
    }
  }

  /**
   * 接受Join
   */
  setOwnerDialogAccept() {
    let data: any;
    data = {
      deleted: this.getData.deleted,
      initiator: this.getData.owner,
      added: this.getData.added,
      role: this.getData.role,
      cid: this.getData.cid,
      comments: this.getData.comments,
      company_name: this.getData.company_name,
      request_id: this.getData.request_id
    };
    if(!this.getData.hasOwnProperty('to_shareholder') || this.getData.to_shareholder === 0) {
      this.memberService.acceptJoinCompany(data);
    }else if(this.getData.to_shareholder === 1){
      this.memberService.shareHolderAcceptSetCompanyAdmin(data);
    }
  }

}
