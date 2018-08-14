import { Component, Inject } from "@angular/core";
import { Router } from "@angular/router";
@Component({
  selector: 'user-logout',
  template: ''
})
export class UserLogoutComponent {

  constructor(@Inject('user.service') public userService: any,
              @Inject('user-data.service') public userDataService: any,
              public router: Router,
              @Inject('notification.service') public notificationService: any) {
    this.userLogout();
  }

  /**
   * 用户登出
   */
  userLogout() {
    if (!this.userDataService.checkUserLoginStatus()) {
      this.router.navigate(['home/login']);
    } else {
      //退出socket
      this.userService.initLogout();
    }
  }
}
