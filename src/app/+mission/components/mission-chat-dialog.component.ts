/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/8/14.
 */
import {
  Component, OnInit, AfterViewChecked, ViewChild, Output, EventEmitter, Input, Inject, Renderer,
  ViewEncapsulation
} from '@angular/core';
import {MissionModelService} from "../../shared/services/model/mission-model.service";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {ChatContentMessageComponent} from "../../chat-new/component/content/chat-content-message.component";
import {ChatMenuList} from "../../shared/services/model/entity/chat-entity";
import {Subscription} from "rxjs/Subscription";
import {Router} from "@angular/router";

@Component({
  selector: 'mission-chat-dialog',
  templateUrl: './../template/mission-chat-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
})


export class MissionChatDialogComponent implements OnInit {
  private isShowMissionChat: boolean;

  @ViewChild('chatContentMessage') chatContentMessage: ChatContentMessageComponent;
  @ViewChild('missionChatDialog') missionChatDialog: any;
  private currentGroupInfo: any = {};
  public currentMenuItem: ChatMenuList;
  private _ox: number;
  private _oy: number;
  private isStartMove: boolean;
  private subscription: Subscription;
  private missionObj: any;

  constructor(public missionModelService: MissionModelService,
              public router: Router,
              public chatModelService: ChatModelService,
              @Inject('app.config') public config: any,
              public renderer: Renderer,
              @Inject('page.element') public pageElement: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {

  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      if (this.isShowMissionChat) {
        this.dealMessage(message)
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  /**
   * 处理消息通知
   */
  dealMessage(data: any) {}


  /**
   * 设置参数
   * @param optionData
   */
  setOptionData(optionData: any) {
    if (optionData) {
      this.missionObj = optionData;
      this.missionModelService.missionGetChatGroup({
        mission_id: optionData.mid,
        type: optionData.type
      }, (response: any) => {
        if (response.status == 1) {
          if (response.data && response.data[0]) {
            this.loadMissionGroupInfo(response.data[0]);
            this.isShowMissionChat = true;
          }else {
            this.isShowMissionChat = false;
            this.dialogService.openWarning({simpleContent: 'Not find mission group!'})
          }
        }
      });
    }
  }


  /**
   * 加载mission群组信息
   */
  loadMissionGroupInfo(gid: any) {
    this.currentMenuItem = ChatMenuList.init();
    this.currentMenuItem.gid = parseInt(gid);
    this.currentMenuItem.isFriend = false;
    this.currentMenuItem.is_mission = '1';
    this.currentMenuItem.form = 2;
    this.currentMenuItem.initIdentity();
    this.chatModelService.fetchGroupInfo({im_data: {gid: this.currentMenuItem.gid}}, (data: any) => {
      if (data.status === 1) {
        this.currentGroupInfo = data.data;
        this.chatContentMessage.currentGroupMember = data.data.info
        this.chatContentMessage.loadMessageByMenuItem(this.currentMenuItem, this.currentGroupInfo);
      }
    });
  }


  /**
   * 关闭mission 聊天框
   */
  closeMissionChatDialog() {
    this.isShowMissionChat = false;
  }

  //鼠标按下 图片
  mouseDownEvent(event: any) {
    let resX: number;
    let resY: number;
    document.ondragstart = function () {
      return false;
    };
    if (event.which === 1) {
      this._ox = event.clientX;
      this._oy = event.clientY;
      this.isStartMove = true;
      resX = this.pageElement.getElementVal(this.missionChatDialog.nativeElement, 'left');
      resY = this.pageElement.getElementVal(this.missionChatDialog.nativeElement, 'top');
      document.onmousemove = (event: any) => {
        if (this.isStartMove) {
          let _cx = event.clientX;
          let _cy = event.clientY;
          this.renderer.setElementStyle(this.missionChatDialog.nativeElement, 'left', (_cx - this._ox + resX) + 'px');
          this.renderer.setElementStyle(this.missionChatDialog.nativeElement, 'top', (_cy - this._oy + resY) + 'px');
        }
      };
      document.onmouseup = (event: any) => {
        event.stopPropagation();
        this.isStartMove = false;
        document.onmousemove = null;
      };
    } else {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }

  /**
   * 打开mission详情
   */
  openMissionDetail() {
    let regTest = "mission/detail/";
    let reg: number = this.router.url.indexOf(regTest);
    if (reg == -1) {
      this.router.navigate(['mission/detail', this.missionObj.mid]);
    }
  }

}