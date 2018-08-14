import {Component, Inject, Input, OnInit} from "@angular/core";

@Component({
  selector: 'chat-history-dialog',
  templateUrl: '../../template/dialog/chat-history-dialog.component.html'
})

export class ChatHistoryDialogComponent implements OnInit {

  constructor(
    @Inject('im.service') public chatService: any,
    @Inject('app.config') public config: any,
    @Inject('user-data.service') public userDataService: any,
    @Inject('notification.service') public notificationService: any
  ) {}

  ngOnInit(): void {
  }


  @Input('setOption') public set setOption(data: any) {
  }
}