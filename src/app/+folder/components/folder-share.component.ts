import {
  Component, Inject, OnInit, Input, Renderer
} from '@angular/core';

import {
  FolderModelService
}
  from '../../shared/services/index.service';
import {DropdownSettings} from "../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../dropdown/dropdown-element";
import {DragComponent} from "../../drag/drag";

import * as FolderConstant from '../../shared/config/folder.config';

@Component({
  selector: 'folder-share',
  templateUrl: '../template/folder-share.component.html',
  providers: [FolderModelService]
})

export class FolderShareComponent implements OnInit {

  public shareFileList: Array<any>;

  public contactList: any;
  public shareFileIn: any = {};

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: any = {
    Read: [],
    Control: [],
    Write: []
  };
  public shareArr: Array<any> = [];

  public comments: string = '';

  public selectMember: any = {
    Read: [],
    Control: [],
    Write: []
  };

  public inputSelectMember: any = {};

  public currentPermission: string = 'Read';

  public isShowSelectBox: boolean = false;

  private hasSetPermission: Array<any> = [];
  private currentContactList: any;
  private inputPermission: any = {};
  public permission: any = {
    isAbleControl: true,
    isAbleWrite: true
  };

  constructor(@Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any,
              public renderer:Renderer,
              public folderModelService: FolderModelService) {
  }


  ngOnInit(): void {

  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.shareFileIn = this.typeService.clone(data);
      this.shareFileList = data.allFile;
      this.fetchUserPermission(this.shareFileList[0]);
      this.getContactListIn();
      this.gteLastUpdate(this.shareFileList);
      this.getHasShareList();
      this.selectMember = {
        Read: [],
        Control: [],
        Write: []
      };
      this.comments = '';
      this.shareArr = this.selectMember[this.currentPermission];
      this.inputSelectMember = this.typeService.clone(this.selectMember);
    }
  }

  fetchUserPermission(shareFile: any) {
    if (shareFile.owner == this.userDataService.getCurrentCompanyPSID() || shareFile.owner == this.userDataService.getCurrentUUID()) {
      this.permission.isAbleControl = true;
      this.permission.isAbleWrite = true;
    } else {
      if (shareFile.op == FolderConstant.PERMISSION_FOLDER_CONTROL_ID) {
        this.permission.isAbleControl = true;
        this.permission.isAbleWrite = true;
      } else if (shareFile.op == FolderConstant.PERMISSION_FOLDER_WRITE_ID) {
        this.permission.isAbleControl = false;
        this.permission.isAbleWrite = true;
      } else if (shareFile.op == FolderConstant.PERMISSION_FOLDER_READ_ID) {
        this.permission.isAbleControl = false;
        this.permission.isAbleWrite = false;
      }
    }
    this.inputPermission = this.typeService.clone(this.permission);
  }


  /**
   * 获取share列表
   */
  getHasShareList() {
    this.folderModelService.fileShareList({
      form: this.shareFileIn.form,
      is_dir: this.shareFileIn.allFile[0].is_dir,
      id: this.shareFileIn.allFile[0].id
    }, (res: any) => {
      if (res.status == 1) {
        this.hasSetPermission = res.data;
        for (let key in this.hasSetPermission) {
          for (let i in this.hasSetPermission[key]['uids']) {
            let shareUid = this.hasSetPermission[key]['uids'][i]
            for (let i in this.currentContactList) {
              this.currentContactList[i].id = this.currentContactList[i].uid;
              this.currentContactList[i].label = this.currentContactList[i].work_name;
              this.currentContactList[i].imageLabel = this.config.resourceDomain + this.currentContactList[i].user_profile_path;
              if (shareUid == this.currentContactList[i].uid) {
                if (this.hasSetPermission[key]['permission'] == parseInt(FolderConstant.PERMISSION_FOLDER_READ_ID)) {
                  this.selectMember.Read.push(this.currentContactList[i]);
                } else if (this.hasSetPermission[key]['permission'] == parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
                  this.selectMember.Write.push(this.currentContactList[i]);
                } else if (this.hasSetPermission[key]['permission'] == parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
                  this.selectMember.Control.push(this.currentContactList[i]);
                }
              }
            }
          }
        }
        this.shareArr = this.typeService.clone(this.selectMember[this.currentPermission]);
        this.inputSelectMember = this.typeService.clone(this.selectMember);
      }
    })
  }


  /**
   * last update function
   */
  gteLastUpdate(fileQueue: any) {
    for (let i in fileQueue) {
      //计算最后更新时间与当前时间的差返回相应的显示
      let timeDifference: number = (new Date().getTime() - fileQueue[i].updateTimestamp) / 1000;
      if (timeDifference >= 365 * 24 * 3600) {
        fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (365 * 24 * 3600))).toString() + this.translateService.manualTranslate(' years ago');
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
   * 获取联系人列表
   */
  getContactListIn() {
    this.contactList = this.userDataService.getContactList();
    let contactListCache = this.userDataService.getContactList();
    this.currentContactList =
      contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
    this.getShareList(this.contactList);
  }

  /**
   * 设置文件分享下拉人员数据
   * @param params
   */
  getShareList(params: any) {
    let param: any = {
      friend: [],
      internal: [],
      cooperator: [],
    };
    if (this.shareFileIn.form == 1) {
      param.friend = params.Friend;
      delete param.internal;
      delete param.cooperator;
    } else if (this.shareFileIn.form == 2) {
      param.internal = params.Internal;
      param.cooperator = params.Cooperator;
      delete param.friend;
    }
    this.initSettings();
    this.dropdownOptions[this.currentPermission] = [];
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
          this.dropdownOptions[this.currentPermission].push(tmpModel);
        }
      }
    }
  }

  /**
   * 选中值有变化的时候出发
   */
  modelChange(data: any) {
    if (data) {
      this.selectMember[this.currentPermission] = this.typeService.clone(data[0]);
      for (let i in data[0]) {
        for (let key in this.selectMember) {
          if (key !== this.currentPermission) {
            for (let k in this.selectMember[key]) {
              if (this.selectMember[key][k].id == data[0][i].id) {
                this.selectMember[key].splice(parseInt(k), 1);
              }
            }
          }
        }
      }
    }
    this.inputSelectMember = this.typeService.clone(this.selectMember);
  }

  /**
   * 初始化 dropDown settings
   */
  initSettings() {
    this.dropdownSettings = new DropdownSettings();
    this.dropdownSettings.isMultiple = true;
  }


  /**
   * 点击选择当前的权限列表
   */
  selectCurrentPermission(data: any) {
    this.isShowSelectBox = false;
    this.currentPermission = data;
    this.shareArr = this.selectMember[this.currentPermission];
    this.getShareList(this.contactList);
  }

  /**
   * 返回drag的option
   * @param data
   */
  dragTheOption(data: any) {
    for (let key in this.selectMember) {
      for (let i in this.selectMember[key]) {
        if (this.selectMember[key][i].id == data.dragOption.id) {
          if (key !== data.key) {
            this.selectMember[data.key].push(data.dragOption);
            for (let k in this.selectMember[key]) {
              if (this.selectMember[key][k].id == data.dragOption.id) {
                this.selectMember[key].splice(parseInt(k), 1)
              }
            }
            for (let i in  this.dropdownOptions[key]) {
              if (this.dropdownOptions[key][i].id == data.dragOption.id) {
                this.dropdownOptions[this.currentPermission][i].isCurrent = false;
              }
            }
            this.dropdownOptions[this.currentPermission] = this.typeService.clone(this.dropdownOptions[this.currentPermission]);
            this.inputSelectMember = this.typeService.clone(this.selectMember);
            this.shareArr = this.typeService.clone(this.selectMember[this.currentPermission]);
          }
        }
      }
    }
  }

  /**
   * deleteOption
   */
  deleteOption(data: any) {
    for (let i in this.selectMember[data.key]) {
      if (this.selectMember[data.key][i].id == data.deleteOption.id) {
        this.selectMember[data.key][i].isCurrent = false;
        this.selectMember[data.key].splice(parseInt(i), 1);
      }
    }
    for (let i in  this.dropdownOptions[this.currentPermission]) {
      if (this.dropdownOptions[this.currentPermission][i].id == data.deleteOption.id) {
        this.dropdownOptions[this.currentPermission][i].isCurrent = false;
      }
    }
    this.dropdownOptions[this.currentPermission] = this.typeService.clone(this.dropdownOptions[this.currentPermission]);
    this.shareArr = this.typeService.clone(this.selectMember[this.currentPermission]);
    this.inputSelectMember = this.typeService.clone(this.selectMember);
  }


  /**
   * 点击add添加权限人员
   */
  addPermission(event: any) {
    event.stopPropagation();
    this.isShowSelectBox = true;
  }

  /**
   * 请求分享文件
   */
  shareTheFile() {
    this.folderModelService.folderShare({
      form: this.shareFileIn.form,
      is_dir: this.shareFileIn.allFile[0].is_dir,
      id: this.shareFileIn.allFile[0].id,
      share: this.getPermissionLists(),
      comments: this.comments
    }, (data: any) => {
      // 获取成功
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: data });
    });
  }

  getPermissionLists(): any {
    let permissionLists: Array<any> = [];
    let eachPermission: any = {
      uids: [],
      permission: ''
    };
    for (let key in this.selectMember) {
      if (key == FolderConstant.PERMISSION_FOLDER_READ) {
        let a: any = this.typeService.clone(eachPermission);
        a.permission = FolderConstant.PERMISSION_FOLDER_READ_ID;
        for (let i in this.selectMember[key]) {
          a.uids.push(this.selectMember[key][i].id);
        }
        permissionLists.push(a);
      }
      if (key == FolderConstant.PERMISSION_FOLDER_WRITE) {
        let a: any = this.typeService.clone(eachPermission);
        a.permission = FolderConstant.PERMISSION_FOLDER_WRITE_ID;
        for (let i in this.selectMember[key]) {
          a.uids.push(this.selectMember[key][i].id);
        }
        permissionLists.push(a);
      }
      if (key == FolderConstant.PERMISSION_FOLDER_CONTROL) {
        let a: any = this.typeService.clone(eachPermission);
        a.permission = FolderConstant.PERMISSION_FOLDER_CONTROL_ID;
        for (let i in this.selectMember[key]) {
          a.uids.push(this.selectMember[key][i].id);
        }
        permissionLists.push(a);
      }
    }
    return permissionLists;
  }

  /**
   * Dropdown点击done 按钮
   */
  closeDropDown() {
    this.isShowSelectBox = false;
  }


  /**
   * 删除临时上传文件
   */
  deleteTemporaryFile(event: any, file: any, index: number) {
    event.stopPropagation();
    this.shareFileList.splice(index, 1);
    if (file.is_dir == 1) {
      for (let i in this.shareFileIn.did) {
        if (this.shareFileIn.did[i] == file.id) {
          this.shareFileIn.did.splice(i, 1);
        }
      }
    } else {
      for (let i in this.shareFileIn.fid) {
        if (this.shareFileIn.fid[i] == file.id) {
          this.shareFileIn.fid.splice(i, 1);
        }
      }
    }
  }
}
