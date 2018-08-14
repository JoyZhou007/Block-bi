import {
  Component, Renderer, OnInit, Inject, EventEmitter, Output, ViewChild, AfterViewChecked,
  AfterViewInit
} from '@angular/core';
import {Router} from '@angular/router';
import {UserModelService} from "../../shared/services/model/user-model.service";

interface notificationSettings {
  general : number,
  contact : number,
  chat : number,
  mission: number,
  file: number,
  sound : number,
  quantity : number
}

interface notificationTpl {
  perm: number,
  bgColorClass: string,
}

@Component({
  selector: 'notification-setting',
  templateUrl: '../template/notification-setting.component.html',
  styleUrls: ['../../../assets/css/notification/notification-set.css']
})
export class NotificationSettingComponent implements OnInit, AfterViewChecked {

  public showNotificationSetting: boolean = true;
  public settings: notificationSettings;
  public defaultSettings: notificationSettings;
  public hSettingAn: boolean;
  public settingGeneral: notificationTpl;
  public settingContact: notificationTpl;
  public settingChat: notificationTpl;
  public settingMission: notificationTpl;
  public settingFile: notificationTpl;
  public settingSound: notificationTpl;
  public settingNotifyMaxNum: any;
  public hasInit:boolean = false;
  public bgColorClass: string = 'g-d-bg1';
  public hasNoticeMsg: boolean = false;
  public noticeMsg: string = '';


  @Output() public closeNotification: any = new EventEmitter<any>();
  @ViewChild('settingElement') public settingElement: any;
  @ViewChild('noticeEle') public noticeEle: any;

  constructor(@Inject('app.config') public config: any,
              public renderer: Renderer,
              public router: Router,
              public userModelService: UserModelService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('notification-data.service') public notificationDataService,
              @Inject('notification.service') public notificationService: any) {
  }

  //启动
  ngOnInit() {
    this.defaultSettings = {
      general : 0,
      contact : 0,
      chat : 1,
      mission: 0,
      file: 1,
      sound : 1,
      quantity : 3
    }
    this.showSettingBoxShow();
  }

  ngAfterViewChecked(): void {
    if (this.hasNoticeMsg && this.noticeEle) {
      let styleStr = 'position: absolute; top: 50px;left: 0; line-height: 12px; color: #59CD90; font-family: HelveticaNeueregular; font-size: 12px;';
      this.renderer.setElementAttribute(this.noticeEle.nativeElement, 'style', styleStr);
      setTimeout(() => {
        this.hasNoticeMsg = false;
      }, 1500)
    }
  }

  /**
   * 初始化设置
   */
  public initData(){
    this.userModelService.getSettingNote((response: any) => {
      this.hasInit = true;
      if (response.status == 1 && response.hasOwnProperty('data')) {
        this.notificationDataService.setNotificationSetting(response);
        this.settingGeneral = {perm: response.data.hasOwnProperty('general') ? response.data.general : 0, bgColorClass: this.bgColorClass};
        this.settingContact = {perm: response.data.hasOwnProperty('contact') ? response.data.contact : 0, bgColorClass: this.bgColorClass};
        this.settingChat = {perm: response.data.hasOwnProperty('chat') ? response.data.chat : 0, bgColorClass: this.bgColorClass};
        this.settingMission = {perm: response.data.hasOwnProperty('mission') ? response.data.mission : 0, bgColorClass: this.bgColorClass};
        this.settingFile = {perm: response.data.hasOwnProperty('file') ? response.data.file : 0, bgColorClass: this.bgColorClass};
        this.settingSound = {perm: response.data.hasOwnProperty('sound') ? response.data.sound : 0, bgColorClass: this.bgColorClass};
        this.settingNotifyMaxNum = {
          type: 'display',
          perm: response.data.hasOwnProperty('quantity') ?  response.data.quantity : 1,
          start: true
        };
      } else {
        this.initDefaultValue();
      }
    })
  }

  /**
   * 显示个人setting
   */
  showSettingBoxShow() {
    this.initData();
    if (!this.element.hasClass(this.settingElement.nativeElement, 'h-setting-an')) {
      this.hSettingAn = true;
    }
  }

  /**
   * 隐藏个人setting
   */
  doSettingBoxHide() {
    if (this.element.hasClass(this.settingElement.nativeElement, 'h-setting-an')) {
      this.hSettingAn = false;
      this.closeNotification.emit();
    }
  }

  /**
   * 设置返回数据
   * @param data
   * @param type
   */
  updateSettings(data: any, type: string) {
    let update = true;
    switch (type) {
      case 'general':
        if (this.settingGeneral.perm == data.perm) {
          update = false;
        } else {
          this.settingGeneral.perm = data.perm;
        }
        break;
      case 'contact':
        if (this.settingContact.perm == data.perm) {
          update = false;
        } else {
          this.settingContact.perm = data.perm;
        }
        break;
      case 'chat':
        if (this.settingChat.perm == data.perm) {
          update = false;
        } else {
          this.settingChat.perm = data.perm;
        }
        break;
      case 'mission':
        if (this.settingMission.perm == data.perm) {
          update = false;
        } else {
          this.settingMission.perm = data.perm;
        }
        break;
      case 'file':
        if (this.settingFile.perm == data.perm) {
          update = false;
        } else {
          this.settingFile.perm = data.perm;
        }
        break;
      case 'sound':
        if (this.settingSound.perm == data.perm) {
          update = false;
        } else {
          this.settingSound.perm = data.perm;
        }
        break;
      case 'quantity':
        if (this.settingNotifyMaxNum.perm == (data.currPerm + 1)) {
          update = false;
        } else {
          this.settingNotifyMaxNum.perm = data.currPerm + 1;
        }
        break;
    }
    if (update) {
      this.callSaveAPI(type,()=>{
        this.notificationDataService.setNotificationSetting(parseInt(this.settingNotifyMaxNum.perm));
      });
    }
  }

  /**
   *
   * @param type
   * @param callback
   */
  callSaveAPI(type?: string, callback?: Function){
    this.userModelService.setSettingNote({
      data: {
        general : this.settingGeneral.perm,
        contact : this.settingContact.perm,
        chat : this.settingChat.perm,
        mission: this.settingMission.perm,
        file: this.settingFile.perm,
        sound : this.settingSound.perm,
        quantity : this.settingNotifyMaxNum.perm
      }
    }, (response: any) => {
      if (response.status === 1) {
        this.hasNoticeMsg = true;
        this.noticeMsg = 'Update settings successfully.';
        if (callback) {
          callback();
        }
        if (type === 'quantity') {
          let num = this.settingNotifyMaxNum.perm;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_SETTING_SEND_DIALOG,
            status: 1,
            num: num
          });
        }
      }
    });
  }

  initDefaultValue() {
    this.settingGeneral = {perm: this.defaultSettings.general, bgColorClass: this.bgColorClass};
    this.settingContact = {perm: this.defaultSettings.contact, bgColorClass: this.bgColorClass};
    this.settingChat = {perm: this.defaultSettings.chat, bgColorClass: this.bgColorClass};
    this.settingMission = {perm: this.defaultSettings.mission, bgColorClass: this.bgColorClass};
    this.settingFile = {perm: this.defaultSettings.file, bgColorClass: this.bgColorClass};
    this.settingSound = {perm: this.defaultSettings.sound, bgColorClass: this.bgColorClass};
    this.settingNotifyMaxNum = {
      type: 'display',
      perm: this.defaultSettings.quantity,
      start: true
    };
  }

  resetDefaultSettings(){
    this.dialogService.openConfirm({simpleContent: 'Confirm to reset default settings?'}, () => {
      this.initDefaultValue();
      this.callSaveAPI('quantity');
    })
  }
}
