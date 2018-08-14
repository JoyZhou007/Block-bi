/**
 * Created by christine.guo
 * on 2017/9/6.
 */
import {AfterViewInit, Component, EventEmitter, Inject, OnDestroy, Output, ViewChild} from "@angular/core";

@Component({
  selector: 'chat-file-comments',
  templateUrl: '../../template/content/chat-file-comments.component.html',
})
export class ChatFileCommentsComponent{
  constructor(@Inject('app.config') public config: any) {

  }

}