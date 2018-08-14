/**
 * Created by joyz on 2017/5/12.
 */

import {AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DropdownOptionModel, DropdownOptionModelChatPost} from "../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ChatConfig} from "../../../shared/config/chat.config";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'chat-post-forward-dialog',
  templateUrl: '../../template/dialog/chat-post-forward-dialog.component.html'
})
/**
 * Forward的弹窗
 */
export class ChatPostForwardDialogComponent implements AfterViewInit, OnDestroy {

  public chatConfig:ChatConfig = new ChatConfig();
  public chatTitle: string = '';
  public chatTopic: string = '';
  public shareList: Array<DropdownOptionModelChatPost> = [];
  public shareListBusiness: Array<DropdownOptionModelChatPost> = [];
  public chatType: string = '';
  public shareSettings: DropdownSettings;
  public shareSettingsBusiness: DropdownSettings;
  public selectedMember: Array<any> = [];
  public selectedOptions: Array<any> = [];
  public formType: string = '';
  //In global show Group
  public showGroupList: boolean = false;

  //当前选中的options
  public currSelectedOption: Array<DropdownOptionModelChatPost> = [];


  //copy or update  默认update
  public forwardSelect: string = '';

  public UPDATE: string = new ChatConfig().CHAT_POST_FORWARD_UPDATE;
  public COPY: string = new ChatConfig().CHAT_POST_FORWARD_COPY;

  //comment Content
  public commentContent: string = '';
  public subscription: Subscription;

  constructor(@Inject('im.service') public chatService: any,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              public contactModelService: ContactModelService,
              public chatModelService: ChatModelService,
              @Inject('chat-message-data.service') public messageDataService: any,) {
    this.initSettings();
    this.forwardSelect = new ChatConfig().CHAT_POST_FORWARD_UPDATE;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        default:
        case this.notificationService.config.ACT_COMPONENT_CHAT_POST_SET_SHARETO_NULL:
          if (message.data) {
            if (message.data.destroyShareToDialogData) {
              this.destroyData();
            }
          }

          break;
      }
    })
  }


  @Input('setOption')
  public set setOption(data: any) {
    let contactListData = this.userDataService.getContactList();
    if (data.channelFormChat) {
      if (this.formType === ''
        || (this.formType !== '' && this.formType !== data.channelFormChat.form)) {
        this.initSettings();
      }
      this.formType = data.channelFormChat.form.toString();

      if (!contactListData) {
        this.getContactList(() => {
          this.setInvitePeopleList()
        });
      } else {
        this.setInvitePeopleList();
      }
      this.showGroupList = false;
    } else {
      if (!contactListData) {
        this.getContactList(() => {
          this.setInvitePeopleListGlobal();
        });
      } else {
        this.setInvitePeopleListGlobal();
      }
      this.showGroupList = true;
      let sessionGroupList = this.messageDataService.getChatListCache();
      if (!sessionGroupList) {

      }

    }
  }

  initSettings() {
    this.shareList = [];
    this.shareListBusiness = [];
    this.selectedMember = [];
    this.chatTitle = '';
    this.chatTopic = '';
    this.selectedOptions = [];
    this.shareSettings = new DropdownSettings({
      enableTab: true,
      isMultiple: true,
      group: [],
      addEvent: (option: any): boolean => {
        return this.controlAddSelectGroup(option);
      }
    });
    this.shareSettingsBusiness = new DropdownSettings({
      enableTab: true,
      isMultiple: true,
      group: [],
      addEvent: (option: any): boolean => {
        return this.controlAddSelectGroup(option);
      }
    });
  }

  /**
   * 有分组
   * 设置能够被邀请人的列表
   */
  setInvitePeopleList() {
    let contactListData = this.userDataService.getContactList();
    let sessionGroupList = this.messageDataService.getChatListCache();
    if (this.formType === '2') { // 工作
      this.shareSettings.group = [];
      this.shareSettings.group.push({key: 'channel', 'title': 'Channel'});
      sessionGroupList['MISSION'].forEach((item: any) => {
        let tmp = new DropdownOptionModelChatPost().initData({
          id: item.gid,
          group: 'channel',
          key: item.name,
          label: item.name,
          form: '2',
        });
        this.shareList.push(tmp);
      });
      sessionGroupList['WORK'].forEach((item: any) => {
        let tmp = new DropdownOptionModelChatPost().initData({
          id: item.gid,
          group: 'channel',
          key: item.name,
          label: item.name,
          form: '2',
        });
        this.shareList.push(tmp);
      });
    } else { //私人
      this.shareSettings.group = [];
      this.shareSettings.group.push({key: 'channel', 'title': 'Channel'});
      sessionGroupList['PRIVATE'].forEach((item: any) => {
        let tmp = new DropdownOptionModelChatPost().initData({
          id: item.gid,
          group: 'channel',
          key: item.name,
          label: item.name,
          form: '1',
        });
        this.shareList.push(tmp);
      });
    }
  }


  /**
   * 无分组 全局 global group
   * 设置能够被邀请人的列表
   */
  setInvitePeopleListGlobal(): void {
    let sessionGroupList = this.messageDataService.getChatListCache();
    this.shareSettings.group = [];
    this.shareSettings.group.push({key: 'channel', 'title': 'Channel'});
    sessionGroupList['PRIVATE'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.gid,
        group: 'channel',
        form: '1',
        key: item.name,
        label: item.name,
      });
      this.shareList.push(tmp);
    });

    //Business
    this.shareSettingsBusiness.group = [];
    this.shareSettingsBusiness.group.push({key: 'channel', 'title': 'Channel'});
    sessionGroupList['MISSION'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.gid,
        group: 'channel',
        key: item.name,
        label: item.name,
        form: '2',
      });
      this.shareListBusiness.push(tmp);
    });
    sessionGroupList['WORK'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.gid,
        group: 'channel',
        key: item.name,
        label: item.name,
        form: '2',
      });
      this.shareListBusiness.push(tmp);
    });
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
    this.currSelectedOption = data[0];
    this.selectedMember = [];
    for (let i in this.currSelectedOption) {
      if (this.currSelectedOption.hasOwnProperty(i)) {
        this.selectedMember.push({
          uid: this.currSelectedOption[i].id,
          form: this.currSelectedOption[i].form,
        })
      }
    }
  }

  /**
   * 发送数据
   * 作用：改变chatPost的currShareToArr
   */
  sendData(): void {
    let shareToIdArr: Array<Object> = [];
    this.selectedMember.forEach((value) => {
      shareToIdArr.push({
        id: value.uid,
        form: value.form
      });
    });

    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_FORWARD,
      data: {
        shareToArr: shareToIdArr,
        forwardMode: this.forwardSelect, //update or copy
        content: this.commentContent
      }
    });

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

  /**
   * 创建群组
   */
  createNewGroup() {
    if (this.chatTitle && this.selectedMember.length > 0) {
      if (this.formType === '2') {
        this.chatService.sendCreateWorkGroup({
          name: this.chatTitle,
          topic: this.chatTopic,
          members: this.selectedMember
        });
      } else {
        this.chatService.sendCreatePrivateGroup({
          name: this.chatTitle,
          topic: this.chatTopic,
          members: this.selectedMember
        });
      }

    }

  }

  /**
   * add
   * 监听options增加
   */
  controlAddSelectGroup(option: DropdownOptionModelChatPost): boolean {
    //只能分享给群组
    if (this.currSelectedOption.length === 0) {
      return true;
    } else {
      let currentForm = this.currSelectedOption[0].form;
      let result = option.form === currentForm;
      //TODO 显示错误提示
      if (!result) {

      }
      return result;
    }
  }

  /**
   * selectCheckbox
   */
  selectCheckbox(event: any): void {
    event.stopPropagation();
    this.forwardSelect = this.forwardSelect === this.UPDATE ?
      this.COPY : this.UPDATE;
  }

}