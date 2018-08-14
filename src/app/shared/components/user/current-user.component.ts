/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/6/30.
 *
 * 显示当前用户名字,IM状态以及所在公司名字
 */
import { Component, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { UserModelService } from "../../services/model/user-model.service";
import { Subscription } from "rxjs/Subscription";
import * as userConstant from "../../../shared/config/user.config"

@Component({
  selector: 'current-user-info',
  template: `
      <div class="slide-people relative" toggleSelectGroup>
          <div class="d-select" #toggleSelect>
              <ul #toggleSelectContent>
                  <li (click)="changeUserOnline($event, userConstant.USER_SHOW_STATE_IN_WORKING);">
                      {{'in work' | translate}}
                  </li>
                  <li (click)="changeUserOnline($event, userConstant.USER_SHOW_STATE_IN_MEETING);">
                      {{'in meeting' | translate}}
                  </li>
                  <li (click)="changeUserOnline($event, userConstant.USER_SHOW_STATE_VACATION);">
                      {{'vacation' | translate}}
                  </li>
                  <li (click)="changeUserOnline($event, userConstant.USER_SHOW_STATE_BUSINESS_TRAVEL);">
                      {{'business travel' | translate}}
                  </li>

              </ul>
          </div>
          <div class="slide-people-name clearfix add-pointer">
              <em class="slide-member-list-circle {{currentUserIMStatus}} pull-left add-pointer"></em>
              <div style="display: inline-block; width: calc(100% - 12px)">
                  <i class="pull-left">{{currentUserName}}</i>
                  <div #toggleSelectBut>
                      <profile-state  [states]="states" [uid]="currentPsid"></profile-state>
                  </div>
                  
                  <span class="font-selectbutton-soildclose cursor"
                        (click)="(companySelect.show = !companySelect.show)"
                        [class.hideCompany]="!companySelect.show"
                        [class.hide]="!currentPsid"></span>
              </div>
          </div>
          <div [class.g-opacity0]="!currentPsid || !companySelect.show"
               class="slide-people-company opacity0" #companySelect>
              <span class="f6-f g-display g-margin-top5">{{currentCompanyName}}</span>
          </div>
      </div>`,
  providers: [UserModelService]
})

export class CurrentUserComponent implements OnInit, OnDestroy {
  private currentCompanyName: string = '';
  private currentUserName: string = '';
  private currentUserIMStatus: string = '';
  public online: number;
  public USER_IM_OFFLINE: number = 0;
  public USER_STATE_ONLINE: number = 1;
  public USER_STATE_OFFLINE: number = 0;
  public subscription: Subscription;
  public isRequesting: boolean = false;
  private couldInit: boolean = false;

  public userConstant = userConstant;
  //显示states
  public showStates: boolean = false;
  private states: number;
  private currentPsid: any;

  @Input('setCouldInit')
  public set setCouldInit(data: boolean) {
    this.couldInit = data;
    if (data) {
      this.initOnlineViaAPI();
    }

  }

  constructor(public userModelService: UserModelService,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public IMService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any) {

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   *
   */
  ngOnInit(): void {
    this.currentPsid = this.userDataService.getCurrentCompanyPSID();
    this.currentCompanyName = this.companyDataService.getCurrentCompanyName();
    this.currentUserName = this.userDataService.getCurrentUserName();
    this.subscription = this.notificationService.getNotification().subscribe((data: any) => {
      switch (data.act) {
        case this.notificationService.config.ACT_SYSTEM_IM_LOGIN:
          this.initOnlineViaAPI();
          break;
        case this.notificationService.config.ACT_NOTICE_CHAT_USER_ONLINE_STATUS:
          this.dealChangeUserOnline(data.data);
          break;
        case  this.notificationService.config.ACT_NOTICE_SWITCH_COMPANY:
          this.currentCompanyName = this.companyDataService.getCurrentCompanyName();
          delete this.online;
          this.couldInit = true;
          break;
      }
    });
  }

  /**
   * 通过API检查用户在线状态
   */
  initOnlineViaAPI() {
    if (typeof this.online === 'undefined' && !this.isRequesting && this.couldInit && this.IMService.socketLoginStatus) {
      this.isRequesting = true;
      this.userModelService.getOnlineStatus({
        uid: this.userDataService.getCurrentCompanyPSID() ? this.userDataService.getCurrentCompanyPSID() :
          this.userDataService.getCurrentUUID()
      }, (response: any) => {
        this.isRequesting = false;
        if (response.status == 1) {
          this.online = response.data.online;
          this.states = response.data.state;
          this.buildClassStr();
          if (this.userDataService.getCurrentCompanyPSID()) {
            this.showStates = true;
          }
        }
      })
    }
  }

  /**
   * css class
   */
  buildClassStr(): void {
    switch (this.online) {
      case this.USER_STATE_ONLINE:
        this.currentUserIMStatus = 'slide-member-list-circle-available';
        break;
      case this.USER_STATE_OFFLINE:
        this.currentUserIMStatus = 'slide-member-list-circle-offline';
        break;
    }
  }

  /**
   * 切换IM状态
   * @param event
   * @param state
   */
  changeUserOnline(event: any, state: number) {
    event.stopPropagation();
    this.IMService.sendChangState({
      state: state
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
      this.buildClassStr();
      // 其他tab
    } else if (data.hasOwnProperty('friend')) {
      if (data.friend.hasOwnProperty('uuid') && data.friend['uuid'] == this.userDataService.getCurrentUUID() ||
        (data.friend.hasOwnProperty('psid') && data.friend['psid'] == this.userDataService.getCurrentCompanyPSID())
      ) {
        this.states = data.hasOwnProperty('owner') ? data.owner.state : data.state;
        this.buildClassStr();
      }
    }
  }


}