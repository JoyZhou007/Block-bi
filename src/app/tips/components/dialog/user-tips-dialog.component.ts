import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownOptionModelChatPost } from "../../../dropdown/dropdown-element";
import { DropdownSettings } from "../../../dropdown/dropdown-setting";
import { ContactModelService } from "../../../shared/services/model/contact-model.service";

@Component({
  selector: 'user-tips-dialog',
  templateUrl: '../../template/tips-dialog.html',
})

export class TipsDialogComponent implements OnInit {

  public shareList: Array<DropdownOptionModelChatPost> = [];
  public shareSettings: DropdownSettings;
  public selectedOptions: Array<any> = [];
  public shareSettingsBusiness: DropdownSettings;
  public selectedMember: Array<any> = [];
  public shareListBusiness: Array<DropdownOptionModelChatPost> = [];
  //当前选中的options
  public currSelectedOption: Array<DropdownOptionModelChatPost> = [];

  //title

  //specification
  public tipsSpecificationValue: string = '';
  public selectedForm: string = '0';
  private isShowContentError: boolean;


  constructor(public router: Router,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('notification.service') public notificationService: any,
              public contactModelService: ContactModelService,) {
    this.initSettings();
  }

  // @ViewChild('loginForm') loginForm: NgForm;
  ngOnInit() {
  }


  @Input('setOption')
  public set setOption(data: any) {
    this.resetTipsContent();
    let contactListData = this.userDataService.getContactList();
    if (!contactListData) {
      this.getContactList(() => {
        this.setInvitePeopleListGlobal();
      });
    } else {
      this.setInvitePeopleListGlobal();
    }
    // let sessionGroupList = this.messageDataService.getChatListCache();

  }


  initSettings() {
    this.shareList = [];
    this.shareListBusiness = [];
    this.selectedMember = [];
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
   *
   * 设置能够被邀请人的列表
   */
  setInvitePeopleListGlobal(): void {
    this.shareList = [];
    this.shareListBusiness = [];
    let contactListData = this.userDataService.getContactList();
    // let sessionGroupList = this.messageDataService.getChatListCache();
    this.shareSettings.group = [];
    // this.shareSettings.group.push({key: 'channel', 'title': 'Channel'});
    this.shareSettings.group.push({key: 'friend', 'title': 'Friend'}, {
      key: 'cooperator',
      'title': 'Cooperator'
    }, {key: 'internal', 'title': 'Internal'});
    contactListData['Friend'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.uid,
        group: 'friend',
        key: item.work_name,
        label: item.work_name,
        form: '1',
        imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN',
      });
      this.shareList.push(tmp);
    });

    //Business
    this.shareSettingsBusiness.group = [];
    // this.shareSettingsBusiness.group.push({key: 'channel', 'title': 'Channel'});
    this.shareSettingsBusiness.group.push({key: 'cooperator', 'title': 'Cooperator'}, {
      key: 'internal',
      'title': 'Internal'
    });
    contactListData['Cooperator'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.uid,
        group: 'cooperator',
        key: item.work_name,
        label: item.work_name,
        form: '2',
        imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN',
        desc: item.company_name + ' ' + item.p_name
      });
      this.shareList.push(tmp);
    });
    contactListData['Internal'].forEach((item: any) => {
      let tmp = new DropdownOptionModelChatPost().initData({
        id: item.uid,
        group: 'internal',
        key: item.work_name,
        label: item.work_name,
        form: '2',
        imageLabel: item.user_profile_path ? this.appConfig.resourceDomain + item.user_profile_path : 'NaN',
        desc: item.company_name + ' ' + item.p_name
      });
      this.shareList.push(tmp);
    });

  }

  /**
   * 下拉菜单联动选项 People
   * @param data
   */
  setSelectedOption(data: any) {
    this.currSelectedOption = data[0];
    this.selectedMember = [];

    if (this.currSelectedOption && this.currSelectedOption.length && this.currSelectedOption.hasOwnProperty(0)) {
      this.selectedForm = this.currSelectedOption[0].form;
    } else {
      this.selectedForm = '0';
    }

    if (this.currSelectedOption && this.currSelectedOption.length === 1) {
      let arr = [];
      this.shareList.forEach((item) => {
        if (item.form === this.selectedForm) {
          arr.push(item);
        }
      });
      this.shareList = arr;
    } else if (this.currSelectedOption && this.currSelectedOption.length === 0) {
      this.setInvitePeopleListGlobal();
    }


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
    if (this.tipsSpecificationValue == '') {
      this.isShowContentError = true;
    }
    let shareToIdArr: Array<Object> = [];
    this.selectedMember.forEach((value) => {
      shareToIdArr.push({
        id: value.uid,
        form: value.form
      });
    });
    if (this.tipsSpecificationValue) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_OTHER_TIPS,
        data: {
          shareToArr: shareToIdArr,
          value: {
            tipsSpecificationValue: this.tipsSpecificationValue
          }
        }
      });
    } else {
      throw 'has invalid form value ';
    }

  }



  /**
   * add
   * 监听options增加
   */
  controlAddSelectGroup(option: DropdownOptionModelChatPost): boolean {
    if (this.currSelectedOption.length > 0) {
      let currentForm = this.currSelectedOption[0].form;
      return option.form === currentForm;
    } else {
      return true;
    }
  }

  /**
   * 重置内容
   */
  private resetTipsContent(): void {
    this.tipsSpecificationValue = '';
    this.selectedOptions = [];
    this.selectedForm = '0';
    this.selectedMember = [];
    this.currSelectedOption = [];
    this.isShowContentError = false;
  }
}