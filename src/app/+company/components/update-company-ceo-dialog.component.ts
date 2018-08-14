import {Component, OnInit, Inject, Input} from '@angular/core';
import {NotificationDataService} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'update-company-ceo-dialog',
  templateUrl: '../template/update-company-ceo-dialog.component.html'
})

export class UpdateCompanyCeoDialogComponent implements OnInit {

  public diNSuccess: boolean = false;
  public diNError: boolean = false;
  public notificationIn: any;

  public getData: any;
  public senderInfo: any = {};
  private userLoginData: any;
  private subscription: Subscription;

  constructor(
    @Inject('app.config') public appConfig:any,
    @Inject('im.service') public memberService : any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('notification.service') public notificationService : any,
    public notificationDataService : NotificationDataService
  ) {
    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN ||
        message.act === this.notificationService.config.ACT_NOTICE_ADMIN_CHANGE) {
        let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
        if (isSelf) {
          let result = {status: message.status, message: message.status != 1 ? 'Accept failed!' : ''};
          if(message.act === this.notificationService.config.ACT_REQUEST_SHAREHOLDER_DISAPPROVE_STRUCTURE_ADMIN){
            result.message = message.status != 1 ? 'Refuse failed!' : ''
          }
          this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
        }
      }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
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
      this.getData = data.data;
      this.senderInfo = data.obj.senderInfo;
    }
  }

  /**
   * 鼠标经过/离开
   * @param param
   */
  updateCompanyCeoButDialog(param: any) {
    if(param.type === 'accept') {
      this.diNSuccess = !this.diNSuccess;
    }else if(param.type === 'refuse') {
      this.diNError = !this.diNError;
    }
  }

  /**
   * 拒绝邀请
   */
  updateCompanyCeoDialogRefuse() {
    if(this.getData.to_shareholder === 1) {
      let data: any = {
        request_id: this.getData.request_id,
        company_name: this.getData.company_name,
        role: this.getData.role,
        deleted: this.getData.deleted,
        added: this.getData.added,
        initiator: this.getData.owner
      };
      this.memberService.shareHolderRefuseCompanyCeo(data);
    }else if(this.getData.to_shareholder === 0) {
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
  }

  /**
   * 接受邀请
   */
  updateCompanyCeoDialogAccept() {
    if(this.getData.to_shareholder === 1) {
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
      this.memberService.shareHolderAcceptCompanyCeo(data);
    }else if(this.getData.to_shareholder === 0) {
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

}
