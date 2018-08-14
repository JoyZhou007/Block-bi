import {Component,OnInit,Inject,Input,ViewChild} from '@angular/core';
import {NotificationDataService} from '../../../shared/services/index.service';

@Component({
  selector: 'new-group-invite',
  templateUrl: '../../template/message/new-group-invite.component.html'
})
export class NewGroupInviteComponent implements OnInit {
  public notificationIn:any;
  public locationCompanyIn : any;
  public userData : any;
  private notificationKey:string;
  private notificationStatus:number;



  constructor(
    @Inject('user-data.service') public userDataService:any,
    @Inject('company-data.service') public companyDataService:any,
    @Inject('im.service') public chatService:any,
    @Inject('notification.service') public notificationService:any,
    @Inject('app.config') public config : any,
    @Inject('dialog.service') public dialogService : any,
    @Inject('type.service') public typeService : any,
    @Inject('app.config') public appConfig:any,
    @Inject('page.element') public element : any,
    public notificationDataService : NotificationDataService ) {
  }
  //启动
  ngOnInit() {
    this.getUserIn();
  }

  //
  @Input() set setNotification(notification:any) {
    this.notificationIn = notification.data;
    this.notificationKey=notification.nKey;
    this.notificationStatus=notification.resultStatus;
  }

  /**
   * 同意被邀请入群
   */
  acceptInvite() {
    if(!this.notificationStatus){
      this.chatService.agreeGroupInvite({
        form:this.notificationIn.form,
        gid:this.notificationIn.gid,
        name:this.notificationIn.name,
      });
    }
  }

  /**
   * 拒绝入群邀请
   */
  refuseInvite() {
   if(!this.notificationStatus){
     this.chatService.refuseGroupInvite({
       gid:this.notificationIn.gid,
       name:this.notificationIn.name,
       friend: this.notificationIn.owner ? this.notificationIn.owner : ''
     });
   }
  }


  /**
   * 群主收到非群主邀请通知后选择人员邀请
   */
  selcetInvite() {
    if(!this.notificationStatus){
      this.dialogService.open({
        title: '<b>Invite</b> people',
        componentSelector: 'deal-invite',
        icon: 'icon-addpeople',
        componentData :this.notificationIn,
        buttons: [{
          classes: 'cancel half',
          value: 'Cancel'
        },
          {
            classes: 'green half',
            value: 'Invite',
            componentEvent : 'inviteNewMembers'
          }]
      });
    }
  }



  //获取当前登录用户信息
  getUserIn() {
    if(!this.userData) {
      this.userData = this.userDataService.getUserIn();
    }
    if(!this.locationCompanyIn) {
      this.locationCompanyIn = this.companyDataService.getLocationCompanyIn();
    }
  }

}
