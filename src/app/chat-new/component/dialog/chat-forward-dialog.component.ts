/**
 * Created by joyz on 2017/5/12.
 */

import {AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DropdownOptionModel, DropdownOptionModelChatPost} from "../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatConfig} from "../../../shared/config/chat.config";
import * as FolderConstant from '../../../shared/config/folder.config';
import {ChatMessage} from "../../../shared/services/model/entity/chat-entity";
import {FolderModelService} from "../../../shared/services/model/folder-model.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'chat-forward-dialog',
  templateUrl: '../../template/dialog/chat-forward-dialog.component.html'
})
/**
 * Forward的弹窗
 */
export class ChatForwardDialogComponent implements AfterViewInit, OnDestroy {

  public chatConfig: ChatConfig = new ChatConfig();
  public forwardList: Array<DropdownOptionModelChatPost> = [];
  public forwardSettings: DropdownSettings;
  public formType: string = '';
  public showGroupList: boolean = false;
  private isCommonMessage: boolean = false;
  //当前选中的options
  public currSelectedOption: any = {};
  public forwardSelect: string = '';
  //comment Content
  public commentContent: boolean;
  public forwardMessage: ChatMessage;
  public selectedOptions: Array<any> = [];
  public subscription: Subscription;
  private showError: any = {isShow: false, text: ''};

  constructor(@Inject('im.service') public chatService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              public contactModelService: ContactModelService,
              public chatModelService: ChatModelService,
              @Inject('chat-message-data.service') public messageDataService: any,
              public folderModelService: FolderModelService) {
    this.initSettings();
    this.forwardSelect = new ChatConfig().CHAT_POST_FORWARD_UPDATE;

    // 接收到回馈信息之后
    this.subscription  = this.notificationService.getNotification().subscribe((message: any) => {
      if (message.act === this.notificationService.config.ACT_CHAT_SEND_MESSAGE ) {
         if(message.data.type == this.chatConfig.CHAT_MESSAGE_TYPE_FORWARD){
           let isSelf = message.hasOwnProperty('data') && message.data.hasOwnProperty('sent');
           if (isSelf) {
             let result = {status: message.status, message: message.status != 1 ? 'Fail to forward' : ''};
             this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: result });
           }
         }
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @Input('setOption')
  public set setOption(data: any) {
    let contactListData = this.userDataService.getContactList();
    this.isCommonMessage = data.isCommonMessage;
    this.forwardMessage = data.messageData;
    this.forwardList = [];
    this.currSelectedOption = {};
    this.selectedOptions = [];
    if (data.channelFormChat) {
      if (this.formType === ''
        || (this.formType !== '' && this.formType !== data.channelFormChat.form)) {

      }
      this.formType = data.channelFormChat.form.toString();

      if (!contactListData) {
        this.getContactList(() => {
          this.setForwardPeopleList()
        });
      } else {
        this.setForwardPeopleList();
      }
      this.showGroupList = false;
    }
  }

  initSettings() {
    this.forwardList = [];
    this.forwardSettings = new DropdownSettings({
      enableTab: false,
      isMultiple: false,
      group: [],
    });
  }

  /**
   * 有分组
   * 设置能够被转发人的列表
   */
  setForwardPeopleList() {
    let contactListData = this.userDataService.getContactList();
    let sessionGroupList: any;
    let setDropDownFun:Function = ()=>{
      this.initSettings();
      if (this.formType === '2') { // 工作
        this.forwardSettings.group = [];
        if (contactListData['Internal'].length) {
          this.forwardSettings.group.push({key: 'internal', 'title': 'Internal'});
          contactListData['Internal'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.uid,
              group: 'internal',
              key: item.work_name,
              label: item.work_name,
              imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN',
              form: '2',
            });
            this.forwardList.push(tmp);
          });
        }
        if (contactListData['Cooperator'].length) {
          this.forwardSettings.group.push({key: 'cooperator', 'title': 'Cooperator'});
          contactListData['Cooperator'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.uid,
              group: 'cooperator',
              key: item.work_name,
              label: item.work_name,
              form: '2',
              imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
            });
            this.forwardList.push(tmp);
          });
        }
        if (sessionGroupList['MISSION'].length) {
          this.forwardSettings.group.push({key: 'mission', 'title': 'Mission Channel'});
          sessionGroupList['MISSION'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.gid,
              group: 'mission',
              key: item.name,
              label: item.name,
              form: '2',
            });
            this.forwardList.push(tmp);
          });
        }
        if (sessionGroupList['WORK'].length) {
          this.forwardSettings.group.push({key: 'work', 'title': 'Work Channel'});
          sessionGroupList['WORK'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.gid,
              group: 'work',
              key: item.name,
              label: item.name,
              form: '2',
            });
            this.forwardList.push(tmp);
          });
        }
      } else { //私人
        this.forwardSettings.group = [];
        if (contactListData['Friend'].length) {
          this.forwardSettings.group.push({key: 'friend', 'title': 'Friend'});
          contactListData['Friend'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.uid,
              group: 'friend',
              key: item.work_name,
              label: item.work_name,
              form: '1',
              imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
            });
            this.forwardList.push(tmp);
          });
        }
        if (sessionGroupList['PRIVATE'].length) {
          this.forwardSettings.group.push({key: 'private', 'title': 'Private Channel'});
          sessionGroupList['PRIVATE'].forEach((item: any) => {
            let tmp = new DropdownOptionModelChatPost().initData({
              id: item.gid,
              group: 'private',
              key: item.name,
              label: item.name,
              form: '1',
            });
            this.forwardList.push(tmp);
          });
        }
      }
      this.forwardList = this.typeService.clone(this.forwardList);
    };
    if (this.messageDataService.getChatListCache()) {
      sessionGroupList = this.messageDataService.getChatListCache();
      setDropDownFun();
    } else {
      this.chatModelService.getGroupList((res: any) => {
        if(res.status == 1) {
          sessionGroupList = res.data;
          setDropDownFun();
        }
      })
    }
  }


  /**
   * 防止本地缓存失效
   */
  getContactList(callback?: Function) {
    this.contactModelService.getContactList(
      {form: 0, group: 0},
      (response: any) => {
        if (response.status === 1) {

          //设置本地缓存联系人列表缓存数据
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CONTACT_LIST_RELOAD,
            data: response.data.staff
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }
    );
  }

  /**
   * 下拉菜单联动选项 People
   * @param data
   */
  setSelectedOption(data: any) {
    if (data[0]) {
      this.currSelectedOption = data[0][0];
    }
  }

  /**
   * 向IM发送forward数据
   */
  sendForwardData(): void {
    //如果是纯文本信息 直接发IM
    let moduleType: number;
    let isForwardFriend: boolean;
    if (this.currSelectedOption.group === 'cooperator' || this.currSelectedOption.group === 'friend' || this.currSelectedOption.group === 'internal') {
      moduleType = FolderConstant.MODULE_CHAT_FRIEND_TYPE;
      isForwardFriend = true;
    } else if (this.currSelectedOption.group === 'work' || this.currSelectedOption.group === 'mission' || this.currSelectedOption.group === 'private') {
      moduleType = FolderConstant.MODULE_CHAT_GROUP_TYPE;
      isForwardFriend = false;
    }
    if (!moduleType) {
      this.showError.isShow = true;
      this.showError.text = 'please choose forward channel!';
      return;
    }
    if (this.isCommonMessage) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_FORWARD,
        data: {
          isFile: false,
          forwardMember: this.currSelectedOption,
          messageData: this.forwardMessage,
          isForwardFriend: isForwardFriend
        }
      });
    } else {  //文件信息先调file接口
      if (this.forwardMessage.type === this.chatConfig.CHAT_MESSAGE_TYPE_SHARE) {
        this.forwardMessage.detail.type = this.forwardMessage.detail.share_file_type;
        this.forwardMessage.type = this.forwardMessage.detail.share_file_type;
      }
      this.folderModelService.fileForward({
        id: this.currSelectedOption.id,
        moduleType: moduleType,
        form: this.formType,
        fid: this.forwardMessage.detail.fid
      }, (data: any) => {
        // 获取成功
        if (data.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_FORWARD,
            data: {
              isFile: true,
              forwardMember: this.currSelectedOption,
              messageData: this.forwardMessage,
              file_info: data.data,
              isForwardFriend: isForwardFriend
            }
          });
        }
        this.currSelectedOption = {};
      });
    }
  }


}