import { Component, Inject, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserModelService } from "../../shared/services/index.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'contacts-member',
  templateUrl: '../template/contacts-member.component.html'
})

export class ContactsMemberComponent implements OnDestroy {


  public workName: string;
  public imgPath: string;

  public uid: any;
  public userOnline: number;
  public userState: number;
  public subscription: Subscription;
  public onlineCls: string = 'ct-people-status';

  @Input()
  set setCurrentUserInfo(data: any) {
    if (data) {
      this.imgPath = data.user_profile_path ? this.config.resourceDomain + data.user_profile_path : '';
      this.workName = data.work_name;
    }
  }

  constructor(public activatedRoute: ActivatedRoute,
              private userModelService: UserModelService,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any) {
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      switch (data.act) {
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          if (
            data.data.hasOwnProperty('friend')
            && data.data.friend.hasOwnProperty('uuid') &&
            (data.data.friend.uuid == this.uid || data.data.friend.psid == this.uid)) {
            this.userState = data.data.friend.state;
            this.userOnline = data.data.friend.online === 0 ? 3 : 1;
          }
          break;
      }
    })
  }

  ngOnInit() {
    this.activatedRoute.params.forEach((params: any) => {
      //用户在线状态
      if (params.hasOwnProperty('uid')) {
        if (typeof this.userOnline == 'undefined' || this.uid !== params.uid) {
          this.userModelService.getOnlineStatus({uid: params.uid}, (data: any) => {
            if (data.status === 1) {
              this.userOnline = data.data.online === 0 ? 3 : 1;
              this.userState = data.data.state;
            }
          });
        }
        this.uid = params.uid;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
