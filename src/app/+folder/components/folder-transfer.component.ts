import {
  Component, Inject, OnInit, Input, Renderer
} from '@angular/core';

import {
  FolderModelService
}from '../../shared/services/index.service';
import {DropdownSettings} from "../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../dropdown/dropdown-element";

@Component({
  selector: 'folder-transfer',
  templateUrl: '../template/folder-transfer.component.html',
  providers: [FolderModelService]
})

export class FolderTransferComponent implements OnInit {

  private userData: any;
  private companyData: any;
  public contactList: any;
  public transferFileIn: any = {};
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public transferArr: Array<any> = [];
  public transferFileList: any;

  constructor(@Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any,
              public renderer:Renderer,
              public folderModelService: FolderModelService) {

  }

  //初始化页面后
  ngOnInit() {
    this.getUserIn();
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.transferFileIn = data;
      this.transferFileList = data.allFile;
      this.gteLastUpdate(this.transferFileList);
      this.getContactListIn();
      this.transferArr = [];
    }
  };


  /**
   * last update function
   */
  gteLastUpdate(fileQueue: any) {
    for (let i in fileQueue) {
      //计算最后更新时间与当前时间的差返回相应的显示
      let timeDifference: number = (new Date().getTime() - fileQueue[i].updateTimestamp) / 1000;
      if (timeDifference >= 365 * 24 * 3600) {
        fileQueue[i].lastUpdateTemplate = this.translateService.manualTranslate('more than a year ago')
      } else if (timeDifference < 365 * 24 * 3600 && timeDifference >= 30 * 24 * 3600) {
        fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (30 * 24 * 3600))).toString() + this.translateService.manualTranslate(' months ago')
      } else if (timeDifference < 30 * 24 * 3600 && timeDifference >= 24 * 3600) {
        fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (24 * 3600))).toString() + this.translateService.manualTranslate(' days ago')
      } else if (timeDifference < 24 * 3600 && timeDifference >= 3600) {
        fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (3600))).toString() + this.translateService.manualTranslate(' hours ago')
      } else if (timeDifference < 3600 && timeDifference >= 60) {
        fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / 60)).toString() + this.translateService.manualTranslate(' minutes ago')
      } else {
        fileQueue[i].lastUpdateTemplate = this.translateService.manualTranslate('less than one minute ago')
      }
    }
  }


  /**
   * 转让文件
   */
  transferTheFile() {
    this.folderModelService.folderTransfer({
      form: this.transferFileIn.form,
      did: this.transferFileIn.did,
      fid: this.transferFileIn.fid,
      transfer: this.transferFileIn.transfer,
    }, (data: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: data });
      //获取成功
      if (data.status == 1) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_TRANSFER_FILE,
          data: this.transferFileList
        });
      }
    });
  }

  /**
   * 获取联系人列表
   */
  getContactListIn() {
    this.contactList = this.userDataService.getContactList();
    this.getTransferList(this.contactList);
  }

  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }


  modelChange(data: any) {
    this.transferArr = data[0];
    if (data[0] && data[0][0]) {
      this.transferFileIn.transfer = data[0][0].id;
    }
  }

  initSettings() {
    this.dropdownSettings = new DropdownSettings();
  }


  /**
   * 设置文件转让弹窗
   * @param params
   */
  getTransferList(params: any) {
    let param: any = {
      friend: [],
      internal: [],
      cooperator: [],
    };
    if (this.transferFileIn.form === 1) {
      param.friend = params.Friend;
      delete param.internal;
      delete param.cooperator;
    } else if (this.transferFileIn.form === 2) {
      param.internal = params.Internal;
      param.cooperator = params.Cooperator;
      delete param.friend;
    }
    this.initSettings();
    this.dropdownOptions = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          });
          this.dropdownOptions.push(tmpModel);
        }
      }
    }
  }


  /**
   * 删除文件
   */
  deleteTemporaryFile(event: any, file: any, index: number) {
    event.stopPropagation();
    this.transferFileList.splice(index, 1);
    if (file.is_dir === 1) {
      for (let i in this.transferFileIn.did) {
        if (this.transferFileIn.did[i] === file.id) {
          this.transferFileIn.did.splice(i, 1);
        }
      }
    } else {
      for (let i in this.transferFileIn.fid) {
        if (this.transferFileIn.fid[i] === file.id) {
          this.transferFileIn.fid.splice(i, 1);
        }
      }
    }
  }
}
