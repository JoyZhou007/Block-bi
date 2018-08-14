import {Component, Renderer, OnInit, Inject, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {ContactModelService, ContactInfo} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'send-notification-message',
  templateUrl: '../template/send-notification-message.component.html',
  providers:[ContactModelService]
})
export class SendNotificationMessageComponent implements OnInit, OnDestroy {
  public subscription: Subscription;
  constructor(
      @Inject('app.config') public config : any,
      public renderer:Renderer,
      public router:Router,
      public contactModelService : ContactModelService,
      @Inject('type.service') public typeService: any,
      @Inject('dialog.service') public dialogService : any,
      @Inject('notification.service') public notificationService : any
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //启动
  ngOnInit() {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message : any) => {
        this.dealMessage(message);
      });
  }


	/**
   * 处理消息
   * @param data
   */
  dealMessage(data : any) {
    switch (parseInt(data['act'])) {

    }
  }

}
