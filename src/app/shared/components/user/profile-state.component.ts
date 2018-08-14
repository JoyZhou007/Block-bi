/**
 * 用户state
 */

import { Component, Inject, Input } from '@angular/core';
import * as userConstant from "../../config/user.config"
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'profile-state',
  template: `

      <div *ngIf="showStates">
          <div [ngSwitch]="states">
                    <span class="icon-ctrl icon1-business-travel"
                          [class.g-icon-control]="isChatContent"
                          *ngSwitchCase="userConstant.USER_SHOW_STATE_BUSINESS_TRAVEL"
                          title="business travel"
                    >
                        <em class="path1"></em>
                        <em class="path2"></em>
                        <em class="path3"></em>
                        <em class="path4"></em>
                        <em class="path5"></em>
                        <em class="path6"></em>
                        <em class="path7"></em>
                        <em class="path8"></em>
                        <em class="path9"></em>
                        <em class="path10"></em>
                        <em class="path11"></em>
                </span>
              <span class="icon-ctrl icon1-in-work"
                    [class.g-icon-control]="isChatContent"
                    *ngSwitchCase="userConstant.USER_SHOW_STATE_IN_WORKING"
                    title="in work"
              >
                        <em class="path1"></em>
                        <em class="path2"></em>
                        <em class="path3"></em>
                        <em class="path4"></em>
                        <em class="path5"></em>
                        <em class="path6"></em>
                        <em class="path7"></em>
                        <em class="path8"></em>
                        <em class="path9"></em>
                        <em class="path10"></em>
                        <em class="path11"></em>
                        <em class="path12"></em>
                        <em class="path13"></em>
                        <em class="path14"></em>
                        <em class="path15"></em>
                        <em class="path16"></em>
                        <em class="path17"></em>
                        <em class="path18"></em>
                        <em class="path19"></em>
                    </span>
              <span class="icon-ctrl icon1-in-meeting"
                    [class.g-icon-control]="isChatContent"
                    *ngSwitchCase="userConstant.USER_SHOW_STATE_IN_MEETING"
                    title="in meeting"
              >
                        <em class="path1"></em>
                        <em class="path2"></em>
                        <em class="path3"></em>
                        <em class="path4"></em>
                        <em class="path5"></em>
                        <em class="path6"></em>
                        <em class="path7"></em>
                        <em class="path8"></em>
                        <em class="path9"></em>
                        <em class="path10"></em>
                        <em class="path11"></em>
                        <em class="path12"></em>
                        <em class="path13"></em>
                        <em class="path14"></em>
                        <em class="path15"></em>
                        <em class="path16"></em>
                        <em class="path17"></em>
                        <em class="path18"></em>
                        <em class="path19"></em>
                        <em class="path20"></em>
                        <em class="path21"></em>
                        <em class="path22"></em>
                    </span>
              <span class="icon-ctrl icon1-vacation2"
                    [class.g-icon-control]="isChatContent"
                    *ngSwitchCase="userConstant.USER_SHOW_STATE_VACATION"
                    title="vacation"
              >
                        <em class="path1"></em>
                        <em class="path2"></em>
                        <em class="path3"></em>
                        <em class="path4"></em>
                        <em class="path5"></em>
                        <em class="path6"></em>
                        <em class="path7"></em>
                        <em class="path8"></em>
                    </span>
          </div>
      </div>

  `,

})

export class ProfileStateComponent {
  public userConstant = userConstant;
  private _states: any;
  private showStates: boolean;
  private subscription: Subscription;

  @Input()
  set states(data: any) {
    if (data) {
      this._states = parseInt(data);
    }
  }

  get states(): any {
    return this._states;
  }

  @Input()
  set uid(id: any) {
    if (id) {
      this.showStates = this.typeService.isNumber(id);
    }
  }

  @Input() isChatContent: boolean = false;

  constructor(@Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,) {
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      switch (data.act) {
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          this.dealChangeUserOnline(data.data);
          break;
      }
    });
  }


  /**
   * 接受用户上下线
   * @param data
   */
  dealChangeUserOnline(data: any) {
    // 当前tab
    if (data.hasOwnProperty('sent') && data.hasOwnProperty('owner')) {
      this.states = data.owner.state;
      // 其他tab
    } else if (data.hasOwnProperty('friend')) {
      if (data.friend.hasOwnProperty('uuid') && data.friend['uuid'] == this.userDataService.getCurrentUUID() ||
        (data.friend.hasOwnProperty('psid') && data.friend['psid'] == this.userDataService.getCurrentCompanyPSID())
      ) {
        this.states = data.hasOwnProperty('owner') ? data.owner.state : data.state;
      }
    }
  }

}