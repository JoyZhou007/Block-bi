import {Component, Input, Inject, OnInit, Renderer} from "@angular/core";
import {MeetingModelService} from "../../shared/services/index.service";
import * as meetingConfig from '../../shared/config/meeting.config';
@Component({
  selector: 'meeting-room-dialog',
  templateUrl: '../template/meeting-room.component.html',
  providers: [MeetingModelService]
})
export class MeetingRoomDialog implements OnInit {

  public meetingObj: any; //从meeting页面传入的对象
  public roomName: any = ''; //房间名
  public roomNumber: any = '';//房间人数
  public meetingRoomProject: any;//是否需要project
  public meetingRoomVideo: any; //是否需要video
  public isShowNumberError: boolean = false; //是否显示填写数量错误
  public isShowNameError: boolean = false; //room 名字不能空
  public numberErrorText: string = meetingConfig.MEETING_QUANTITY_ERROR; //数量错误显示
  public type: string;  //是add 还是 update
  public btnError: string = '';  //是add 还是 update

  //错误提示
  public roomEmpty: string = meetingConfig.MEETING_ROOM_ERROR;


  @Input() set setOption(data: any) {
    if (data) {
      this.clearDialog();
      this.meetingObj = data;
      this.btnError = data.btnError ? data.btnError : '';
      this.type = data.type;
      if (data.type == 'update') {
        this.roomName = data.name;
        this.roomNumber = data.amount;
      }
      if (this.meetingObj.type == 'add') {
        this.meetingRoomProject = {type: 'project', perm: 0, bgColorClass: 'g-d-bg1'};
        this.meetingRoomVideo = {type: 'video', perm: 0, bgColorClass: 'g-d-bg1'};
      } else if (this.meetingObj.type == 'update') {
        this.meetingRoomProject = {type: 'project', perm: parseInt(this.meetingObj.projector), bgColorClass: 'g-d-bg1'};
        this.meetingRoomVideo = {type: 'video', perm: parseInt(this.meetingObj.video), bgColorClass: 'g-d-bg1'};
      }
    }
  };

  constructor(@Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translateService: any,
              public meetingModelService: MeetingModelService,
              public renderer: Renderer,) {
  }

  ngOnInit() {
  }

  getSwitchButEvent(data: any) {
    if (data.type === 'project') {
      this.meetingRoomProject.perm = data.perm;
    } else if (data.type === 'video') {
      this.meetingRoomVideo.perm = data.perm;
    }
  }

  /**
   * 清空上次数据
   */
  clearDialog() {
    this.roomNumber = '';
    this.roomName = '';
    this.isShowNameError = false;
    this.isShowNumberError = false;

  }

  /**
   * 验证表单
   */
  validFormValue(): boolean {
    if (this.roomNumber && this.roomName) {
      return true;
    } else {

      if (this.roomNumber == '') {
        this.isShowNumberError = true;
        this.numberErrorText = meetingConfig.MEETING_QUANTITY_ERROR;
      }
      if (this.roomName == '') {
        this.isShowNameError = true;
      }
      return false;
    }
  }

  /**
   * 处理 add 房间 和 update 房间
   */
  sendHandle() {
    if (this.type == 'add') {
      this.sendAdd();
    } else if (this.type == 'update') {
      this.sendUpdate();
    }
  }

  /**
   * 确定添加
   */
  sendAdd() {
    if (this.validFormValue()) {
      let data = {
        "id": "",
        "mode": "1",
        "name": this.roomName,
        "amount": this.roomNumber,
        "projector": this.meetingRoomProject.perm,
        "video": this.meetingRoomVideo.perm
      };
      this.meetingModelService.addMeetingRoom({data: data}, (response: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
        if (response.status == 1) {
          data.id = response.data;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_MEETING_ADD_ROOM,
            data: this.typeService.clone(data)
          });
        } else {
          this.btnError = this.translateService.manualTranslate('add meeting room failed');
          return false;
        }
      })
    } else {
      throw 'has invalid form value';
    }

  }

  /**
   * 确定修改
   */
  sendUpdate() {
    let data = {
      "id": this.meetingObj.id,
      "mode": "2",
      "name": this.roomName,
      "amount": this.roomNumber,
      "projector": this.meetingRoomProject.perm,
      "video": this.meetingRoomVideo.perm
    };
    this.meetingModelService.updateMeetingRoom({data: data}, (response: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
      if (response.status == 1) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_MEETING_UPDATE_ROOM,
          data: this.typeService.clone(data)
        });
      } else {
        this.btnError = this.translateService.manualTranslate('updated meeting room failed!');
        return false;
      }
    });
  }

  /**
   *room name 失去焦点
   */
  onRoomNameBlur() {
    if (this.roomName == '') {
      this.isShowNameError = true;
    } else {
      this.isShowNameError = false;
    }
  }

  /**
   * 人数input失去焦点
   */
  onRoomNumberBlur() {
    if (this.roomNumber == '') {
      this.isShowNumberError = true;
      this.numberErrorText = meetingConfig.MEETING_QUANTITY_ERROR;
    } else {
      this.isShowNumberError = false;
    }
  }

  /**
   * 控制键盘只能输入数字
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      this.numberErrorText = meetingConfig.MEETING_NUMBER_ERROR;
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }


}
