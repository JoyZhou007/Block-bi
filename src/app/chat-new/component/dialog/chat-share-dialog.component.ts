/**
 * Created by joy
 * on 2017/4/17.
 */
import {AfterViewInit, Component, Inject, Input, OnInit, ViewChild} from "@angular/core";
import {DropdownOptionModel, DropdownOptionModelChatPost} from "../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatConfig} from "../../../shared/config/chat.config";
import {ChatMenuList, ChatMessage} from "../../../shared/services/model/entity/chat-entity";

@Component({
  selector: 'chat-share-dialog',
  templateUrl: '../../template/dialog/chat-share-dialog.component.html'
})
/**
 * Share的弹窗
 */
export class ChatShareDialogComponent implements AfterViewInit {
  public chatConfig: ChatConfig = new ChatConfig();

  public shareList: Array<DropdownOptionModel> = [];
  public shareSettings: DropdownSettings;
  public selectedOptions: Array<any> = [];

  //当前选中的options
  public currSelectedOption: Array<DropdownOptionModel> = [];

  public currentMenuItem: ChatMenuList;
  public currentMessage: ChatMessage;
  private showError: any = {text:'',isShow:false};

  constructor(@Inject('im.service') public chatService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              public contactModelService: ContactModelService,
              public chatModelService: ChatModelService,
              @Inject('chat-message-data.service') public messageDataService: any,) {
  }

  ngAfterViewInit(): void {
  }


  @Input('setOption')
  public set setOption(data: any) {
    if (data.hasOwnProperty('chatMenuItem')) {

      // 第一次初始化或者更改了被share的群组性质时候
      if (!this.currentMenuItem
        || (this.currentMenuItem.form !== data.chatMenuItem.form)) {
        this.initSettings();
      }
      this.currentMenuItem = data.chatMenuItem;
      this.currentMessage = data.messageData;
      this.setShareChannelList();
    }
  }

  /**
   *
   */
  initSettings() {
    this.shareList = [];
    this.selectedOptions = [];
    this.shareSettings = new DropdownSettings({
      enableTab: true,
      isMultiple: false,
      group: []
    });
  }

  /**
   * 设置能够被分享的群组列表
   */
  setShareChannelList() {
    let sessionGroupList = this.messageDataService.getChatListCache();
    this.shareSettings.group = [];
    if (this.currentMenuItem.form === 2) { // 工作
      this.shareSettings.group = [{key: 'mission', 'title': 'MISSION'},  {key: 'business', 'title': 'BUSINESS'}];
      sessionGroupList['MISSION'].forEach((item: any) => {
        let tmp = new DropdownOptionModel().initData({
          id: item.gid,
          group: 'mission',
          key: item.name,
          label: item.name
        });
        this.shareList.push(tmp);
      });
      sessionGroupList['WORK'].forEach((item: any) => {
        let tmp = new DropdownOptionModel().initData({
          id: item.gid,
          group: 'business',
          key: item.name,
          label: item.name
        });
        this.shareList.push(tmp);
      });
    } else { //私人
      //过滤当前点击的群组
      this.shareSettings.group = [{key: 'private', 'title': 'PRIVATE'}];
      sessionGroupList['PRIVATE'].forEach((item: any) => {
        let tmp = new DropdownOptionModel().initData({
          id: item.gid,
          group: 'private',
          key: item.name,
          label: item.name
        });
        this.shareList.push(tmp);
      });

    }
  }

  /**
   * 下拉菜单联动选项 People
   * @param data
   */
  setSelectedOption(data: any) {
    this.currSelectedOption = data[0];
    if( this.currSelectedOption && this.currSelectedOption.length > 0){
        this.showError.text = '';
        this.showError.isShow = false;

    }
  }

  /**
   * 发送数据
   */
  sendData() {
    // 生成share id
    // 对于文件一些字段，不要传递给后端

    if (!this.currSelectedOption || this.currSelectedOption.length < 1) {
      // alert('请选择一个目标群');
      this.showError.isShow = true;
      this.showError.text = '请选择一个目标群';
    }

    let fid = this.currentMessage.detail.fid;
    this.chatModelService.generateShareId({data: {gid: this.currentMenuItem.gid, resource_id: fid, form: this.currentMenuItem.form.toString()}}, (response: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: response });
      if (response.status === 1) {
        // 发送消息
        let shareId = response.data.share_id;
        if (shareId) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_SHARE_FILE,
            data: {
              targetGroup: this.currSelectedOption[0].id,
              targetName: this.currSelectedOption[0].label,
              shareId: shareId,
              originMsgObj: this.currentMessage
            }
          })
        }
      }
    })
  }

  /**
   * 关闭时销毁数据
   * 作用：改变chatPost的currShareToArr
   */
  destroyData(): void {
    if (this.currSelectedOption) {
      this.currSelectedOption = [];
    }
  }
}