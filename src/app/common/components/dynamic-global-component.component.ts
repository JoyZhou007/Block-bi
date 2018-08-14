import {Component, ViewContainerRef, Inject, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {DialogNewComponent} from "./dialog-new.component";
import { MissionModelService } from "../../shared/services/model/mission-model.service";

@Component({
  selector: 'dynamic-global-component',
  templateUrl: '../template/dynamic-global.component.html',
  providers: [MissionModelService]
})
export class DynamicGlobalComponent implements AfterViewInit, OnDestroy {
  public subscription: Subscription;
  @ViewChild('biDate') biDate: any;
  @ViewChild('biDialog') biDialog: any;
  @ViewChild('biDialogNew') biDialogNew: DialogNewComponent;
  @ViewChild('biCalendar') biCalendar: any;
  @ViewChild('biMiniDialog') biMiniDialog: any;
  @ViewChild('missionChatDialog') missionChatDialog: any;
  private isLogin: any;

  constructor(//@Inject('type.service') public typeService : any,
              @Inject('notification.service') public notificationService: any,
              @Inject('user-data.service') public userDataService: any,) {

  }
  
  
  ngOnInit() {
      this.isLogin = this.userDataService.checkUserLoginStatus()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }


  /**
   * 处理消息
   * @param data
   */
  dealMessage(data: any) {
    if (data.act === this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW) {
      switch (data.data.selector) {
        case 'bi-date':
          this.biDate.setOption(data.data.options);
          break;
        case 'bi-dialog':
          this.biDialog.setOption(data.data.options);
          break;
        case 'bi-dialog-new':
          this.biDialogNew.setOption(data.data.options);
          break;
        case 'bi-calendar':
          this.biCalendar.setOptionData(data.data.options);
          break;
        case 'bi-mini-dialog':
          this.biMiniDialog.setOptionData(data.data.options);
          break;
        case 'mission-chat-dialog':
          this.missionChatDialog.setOptionData(data.data.options);
      }
    } else if (data.act === this.notificationService.config.ACTION_GLOBAL_COMPONENT_CLOSE) {
      switch (data.data.selector) {
        case 'bi-dialog-new':
          this.biDialogNew.close();
          break;
      }
    }
  }
}
