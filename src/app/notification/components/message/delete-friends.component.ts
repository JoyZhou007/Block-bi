import {Component,OnInit,Inject,Input} from '@angular/core';

@Component({
  selector: 'delete-friends',
  templateUrl: '../../template/message/delete-friends.component.html'
})
export class DeleteFriendsComponents implements OnInit {

  public notificationIn : any;
  public senderInfo: any;

  constructor(
    @Inject('app.config') public appConfig:any
  ) {
  }
  //启动
  ngOnInit() {}

  //父级传入的提示消息
  @Input() set setNotification(notification:any) {
    if(notification) {
      this.notificationIn = notification.data;
      this.senderInfo = notification.obj.senderInfo;
    }
  }

}
