/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/30.
 */

import {Component, Inject, OnInit} from "@angular/core";

@Component({
  selector: 'chat-content-default',
  templateUrl: '../../template/content/chat-content-default.component.html'
})

export class ChatContentDefaultComponent implements OnInit{

  ngOnInit(): void {
  }
  constructor(
    @Inject('app.config') public config: any,
    @Inject('notification.service') public notificationService: any
  ){


  }

  createNewGroup(event: any, type: string){
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_CREATE_NEW_GROUP,
      data: {event: event, type: type},
    })
  }
}