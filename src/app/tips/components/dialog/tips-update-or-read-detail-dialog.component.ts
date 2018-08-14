import {Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DropdownOptionModel, DropdownOptionModelChatPost} from "../../../dropdown/dropdown-element";
import {DropdownSettings} from "../../../dropdown/dropdown-setting";
import {ContactModelService} from "../../../shared/services/model/contact-model.service";
import {Tips} from "../../../shared/services/model/entity/tips-entity";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {ContactsList} from "../../../shared/services/model/entity/contact-entity";

@Component({
  selector: 'update-or-read-detail-tips',
  templateUrl: '../../template/tips-update-or-read-detail-dialog.component.html',
})

export class TipsUpdateOrReadDetailDialogComponent implements OnInit {

  public shareList: Array<DropdownOptionModelChatPost> = [];
  public shareSettings: DropdownSettings;
  public selectedOptions: Array<any> = [];
  public shareSettingsBusiness: DropdownSettings;
  public selectedMember: Array<any> = [];
  public shareListBusiness: Array<DropdownOptionModelChatPost> = [];
  //当前选中的options
  public currSelectedOption: Array<DropdownOptionModelChatPost> = [];

  //current tipObj
  public currentTipObj: Tips;
  //title
  public tipsTitleValue: string = '';

  //specification
  public tipsSpecificationValue: string = '';
  private showPrivateDropDown: boolean = false;

  //form
  public currentForm: string = '';
  // tips id
  public currentTip_id: string = '';

  //is read tips
  public isReadTip: boolean = false;
  private chatGroupList: any;
  public currentContactList: Array<ContactsList> = [];


  constructor(public router: Router,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('type.service') public typeService: any,
              public chatModelService: ChatModelService,
              @Inject('notification.service') public notificationService: any,
              public contactModelService: ContactModelService,) {

    this.currentTipObj = Tips.init();
    let contactListCache = this.userDataService.getContactList();
    this.currentContactList =
      contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
  }

  ngOnInit() {
  }


  @Input('setOption')
  public set setOption(data: any) {


    if (data) {
      this.isReadTip = data.readTips;
      /*if (this.isReadTip) {
        //只读模式设置初始化
        this.initReadSettings();
      } else {
        //编辑模式设置初始化
        this.initSettings();
      }*/
      this.initSettings();
      let tipObj = data.tipObj;
      this.currentTipObj = data.tipObj;
      let selectList = [];
      //根据form显示相应的下拉框
      switch (tipObj.type) {
        case '1': //个人
          this.showPrivateDropDown = true;
          this.currentForm = '1';
          break;
        default:
        case '2': //公司
          this.showPrivateDropDown = false;
          this.currentForm = '2';
          break;
      }
      this.setInvitePeopleListGlobal(tipObj.sharedToInfoList);


      this.tipsTitleValue = tipObj.title;
      this.tipsSpecificationValue = tipObj.content;

      tipObj.shared_to.forEach((uid) => {
          selectList.push(new DropdownOptionModelChatPost().initData({
            id: uid,
            form: this.currentForm
          }));
          //默认选中值
          this.selectedMember.push({
            uid: uid,
          });
      });
      this.selectedOptions = selectList;
      this.currentTip_id = tipObj.rid;
    }


  }


  initSettings() {
    this.shareList = [];
    this.shareListBusiness = [];
    this.selectedMember = [];
    this.selectedOptions = [];
    this.shareSettings = new DropdownSettings({
      readonly: true,
      enableTab: true,
      isMultiple: true,
      group: [],
    });
    this.shareSettingsBusiness = new DropdownSettings({
      readonly: true,
      enableTab: true,
      isMultiple: true,
      group: [],
    });
  }

/*
  /!**
   * init settings 只读模式
   *!/
  initReadSettings() {
    this.shareList = [];
    this.shareListBusiness = [];
    this.selectedMember = [];
    this.selectedOptions = [];
    this.shareSettings = new DropdownSettings({
      readonly: true,
      enableTab: true,
      isMultiple: true,
      group: [],
    });
    this.shareSettingsBusiness = new DropdownSettings({
      readonly: true,
      enableTab: true,
      isMultiple: true,
      group: [],
    });
  }
*/

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
   * 无分组 全局 global group
   * 设置能够被邀请人的列表
   */
  setInvitePeopleListGlobal(sharedToInfoList:Array<ContactsList>): void {
    // let contactListData = this.userDataService.getContactList();
    // let sessionGroupList = this.messageDataService.getChatListCache();
    this.shareSettings.group.push({key: 'friend', 'title': 'Friend'});
    sharedToInfoList.forEach((item)=>{
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.uid,
        group: 'friend',
        key: item.work_name,
        label: item.work_name,
        form: '1',
        imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN'
      });
      this.shareList.push(tmp);
    })
  }

  /**
   * 发送数据
   * 作用：改变chatPost的currShareToArr
   */
  sendData(): void {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_OTHER_UPDATE_TIPS,
      data: {
        form: this.currentForm,
        // shareToArr: shareToIdArr,
        tip_id: this.currentTip_id,
        value: {
          tipsSpecificationValue: this.tipsSpecificationValue
        }
      }
    });
  }

/*  /!**
   * add
   * 监听options增加
   *!/
  controlAddSelectGroup(option: DropdownOptionModelChatPost): boolean {
    if (this.currSelectedOption.length > 0) {
      let currentForm = this.currSelectedOption[0].form;
      return option.form === currentForm;
    } else {
      return true;
    }
  }*/

  /**
   * 当有菜单缓存时 不需要再次刷新菜单
   * @returns {boolean}
   */
  couldLoadList(): boolean {
    let chatMenuCache = this.messageDataService.getChatListCache();
    return !(this.messageDataService.getChatHasLoaded() && chatMenuCache && chatMenuCache !== null);
  }

  /**
   * 获取聊天列表
   */
  getChatList(callBack?: any) {
    if (this.couldLoadList()) {
      this.chatModelService.getGroupList((data: any) => {
        //获取成功
        if (data.status === 1) {
          this.messageDataService.setChatHasLoaded(true);
          this.messageDataService.setChatListCache(data.data);
          if (typeof callBack === 'function') {
            callBack();
          }
        } else {
          this.messageDataService.setChatHasLoaded(false);
        }
      });
    } else if (this.messageDataService.getChatListCache()) {
      this.chatGroupList = this.messageDataService.getChatListCache();
      if (typeof callBack === 'function') {
        callBack();
      }
    }
  }

}