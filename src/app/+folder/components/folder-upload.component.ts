import {Component, Inject, OnInit, Input, Renderer} from '@angular/core';
import {FolderModelService}from '../../shared/services/index.service';
import * as FolderConstant from '../../shared/config/folder.config';
import {DropdownSettings} from "../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../dropdown/dropdown-element";
import {DragComponent} from "../../drag/drag";
import {ChatConfig} from "../../shared/config/chat.config";


@Component({
  selector: 'folder-upload',
  templateUrl: '../template/folder-upload.component.html',
  providers: [FolderModelService]
})


export class FolderUploadComponent implements OnInit {
  public chatConfig: ChatConfig = new ChatConfig();
  public uploader: any;
  public uploadFileList: Array<any> = [];
  public contactList: any;

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
  private currFileIndex: number = 0;
  public isCanShare: boolean = true;


  constructor(@Inject('page.element') public element: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('date.service') public dateService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('type.service') public typeService: any,
              @Inject('app.config') public config: any,
              public renderer: Renderer,
              public folderModelService: FolderModelService) {
  }

  //初始化页面后
  ngOnInit() {
  }

  @Input() set setOption(data: any) {
    if (data) {
      this.currFileIndex = 0;
      this.uploader = data;
      this.uploadFileList = [];
      if (data.isScreenCut) {
        this.isCanShare = false;
        this.uploadFileList = [this.uploader.data.file]
      } else {
        this.gteLastUpdate(this.uploader.data);
        if (!data.isMission && !data.isChat) {
          this.getContactListIn();
          this.isCanShare = true;
        } else {
          this.isCanShare = false;
        }
      }
    }
  };

  /**
   * last update function
   */
  gteLastUpdate(fileQueue: any) {
    for (let i = 0; i < fileQueue.length; i++) {
      if (fileQueue[i].size !== 0) {
        let tmpFile: any = fileQueue[i];
        this.uploadFileList.push(tmpFile);
        //计算最后更新时间与当前时间的差返回相应的显示
        let timeDifference: number;
        if (fileQueue[i].lastModifiedDate) {
          timeDifference = (new Date().getTime() - fileQueue[i].lastModifiedDate.getTime()) / 1000;
        } else {
          timeDifference = (new Date().getTime() - fileQueue[i].lastModified) / 1000;
        }
        if (timeDifference >= 365 * 24 * 3600) {
          fileQueue[i].lastUpdateTemplate = this.translateService.manualTranslate('more than a year ago');
        } else if (timeDifference < 365 * 24 * 3600 && timeDifference >= 30 * 24 * 3600) {
          fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (30 * 24 * 3600))).toString() + this.translateService.manualTranslate(' months ago');
        } else if (timeDifference < 30 * 24 * 3600 && timeDifference >= 24 * 3600) {
          fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (24 * 3600))).toString() + this.translateService.manualTranslate(' days ago');
        } else if (timeDifference < 24 * 3600 && timeDifference >= 3600) {
          fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / (3600))).toString() + this.translateService.manualTranslate(' hours ago');
        } else if (timeDifference < 3600 && timeDifference >= 60) {
          fileQueue[i].lastUpdateTemplate = Math.floor((timeDifference / 60)).toString() + this.translateService.manualTranslate(' minutes ago')
        } else {
          fileQueue[i].lastUpdateTemplate = this.translateService.manualTranslate('less than one minute');
        }

        //转化base64
        let reader: FileReader = new FileReader();
        reader.onload = function (oFREvent: any) {
          tmpFile.fileSrc = oFREvent.target.result;
        };
        //截取文件名 (去掉后缀名)
        let index1 = fileQueue[i].name.lastIndexOf(".");
        if (index1 != -1) {
          fileQueue[i].fileName = fileQueue[i].name.substring(0, index1);//截取完后缀的文件名字
          fileQueue[i].fileSuffix = fileQueue[i].name.substring(index1 + 1, fileQueue[i].name.length);//后缀名
        } else {
          fileQueue[i].fileName = fileQueue[i].name;
        }
        //获取文件的大小
        fileQueue[i].fileSize = fileQueue[i].size;
        reader.readAsDataURL(fileQueue[i]);
        //  判断当前文件的类型
        let fileType = fileQueue[i].type.split('/');
        if (fileType[0] === FolderConstant.FILE_TYPE_IMAGE) {
          fileQueue[i].isImage = true;
        } else {
          fileQueue[i].isImage = false;
          switch (fileQueue[i].type) {
            case FolderConstant.FILE_TYPE_EXCEL:
            case FolderConstant.FILE_TYPE_EXCEL_1:
              fileQueue[i].fileType = 'excel';
              break;
            case FolderConstant.FILE_TYPE_WORD:
              fileQueue[i].fileType = 'word';
              break;
            case FolderConstant.FILE_TYPE_PPT:
            case FolderConstant.FILE_TYPE_PPT_1:
              fileQueue[i].fileType = 'ppt';
              break;
            case FolderConstant.FILE_TYPE_PDF:
              fileQueue[i].fileType = 'pdf';
              break;
            default :
              fileQueue[i].fileType = 'other';
              break;
          }
        }
      }
    }
  }

  /**
   * 删除临时上传文件
   */
  deleteTemporaryFile(event: any, file: any, index: number) {
    event.stopPropagation();
    this.uploadFileList.splice(index, 1);
    if (this.uploadFileList.length === 0) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_GLOBAL_COMPONENT_CLOSE,
        data: {
          selector: 'bi-dialog-new',
          options: {}
        }
      });
    }
  }

  /**
   * 文件管理器
   * 调用upload接口
   */
  uploadTheFile(ele?: any) {
    if (this.currFileIndex === this.uploadFileList.length || this.uploadFileList.length === 0) {
      ele.value = '';
    } else {
      this.folderModelService.fileUpload({
        file: this.uploadFileList[this.currFileIndex],
        form: this.uploader.form,
        pdid: this.uploader.pdid,
        share: this.getPermissionLists(),
      }, (data: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: data
        });
        if (data.status === 1) {
          data.data.profile = this.userDataService.getCurrentProfilePath(36);
          this.transformDateFormat(data.data);
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_UPLOAD_FILE,
            data: data.data
          });
        }
        this.currFileIndex += 1;
        this.uploadTheFile(ele);
      })
    }
  }


  /**
   * 通过form表单提交
   * @param ele
   */
  newUploadFile(ele?: any) {
    if (this.currFileIndex === this.uploadFileList.length || this.uploadFileList.length === 0) {
      ele.value = '';
    } else {
      let formData = new FormData();
      formData.append('file', this.uploadFileList[this.currFileIndex]);
      formData.append('form', this.uploader.form);
      formData.append('pdid', this.uploader.pdid);
      formData.append('share', this.getPermissionLists());
      this.folderModelService.newFileUpload(formData, (res: any) => {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
          data: res
        });
        if (res.status == 1) {
          res.data.profile = this.userDataService.getCurrentProfilePath(36);
          this.transformDateFormat(res.data);
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_UPLOAD_FILE,
            data: res.data
          });
        }
        this.currFileIndex += 1;
        this.newUploadFile(ele);
      });
    }
  }


  /**
   * 将格式化事件转化为事件戳和当前时区的时间
   */
  transformDateFormat(data: any) {
    if (!data) return;
    data.createTimestamp = new Date(data.created).getTime();
    data.updateTimestamp = new Date(data.updated).getTime();
    let startDayTime = this.dateService.formatWithTimezone(data.updated, 'ddS');
    let startMonthTime = this.dateService.formatWithTimezone(data.updated, 'mmm');
    let startYearTime = this.dateService.formatWithTimezone(data.updated, 'yyyy');
    let startWeekTime = this.dateService.formatWithTimezone(data.updated, 'dddd');
    let startHourTime = this.dateService.formatWithTimezone(data.updated, 'HH');
    let startMinuteTime = this.dateService.formatWithTimezone(data.updated, 'MM');
    data.formatDate = {
      day: startDayTime,
      week: startWeekTime,
      month: startMonthTime,
      minute: startMinuteTime,
      hour: startHourTime,
      year: startYearTime
    };
  }


  /**
   * 获取联系人列表
   */
  getContactListIn() {
    this.contactList = this.userDataService.getContactList();
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
    if (this.uploader.form === 1) {
      param.friend = params.Friend;
      delete param.internal;
      delete param.cooperator;
    } else if (this.uploader.form === 2) {
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
              if (this.selectMember[key][k].id === data[0][i].id) {
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
        if (this.selectMember[key][i].id === data.dragOption.id) {
          if (key !== data.key) {
            this.selectMember[data.key].push(data.dragOption);
            for (let k in this.selectMember[key]) {
              if (this.selectMember[key][k].id === data.dragOption.id) {
                this.selectMember[key].splice(parseInt(k), 1)
              }
            }
            for (let i in  this.dropdownOptions[key]) {
              if (this.dropdownOptions[key][i].id === data.dragOption.id) {
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
      if (this.selectMember[data.key][i].id === data.deleteOption.id) {
        this.selectMember[data.key][i].isCurrent = false;
        this.selectMember[data.key].splice(parseInt(i), 1);
      }
    }
    for (let i in  this.dropdownOptions[this.currentPermission]) {
      if (this.dropdownOptions[this.currentPermission][i].id === data.deleteOption.id) {
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


  getPermissionLists(): any {
    let permissionLists: Array<any> = [];
    let eachPermission: any = {
      uids: [],
      permission: ''
    };
    for (let key in this.selectMember) {
      if (key === FolderConstant.PERMISSION_FOLDER_READ) {
        let a: any = this.typeService.clone(eachPermission);
        a.permission = FolderConstant.PERMISSION_FOLDER_READ_ID;
        for (let i in this.selectMember[key]) {
          a.uids.push(this.selectMember[key][i].id);
        }
        permissionLists.push(a);
      }
      if (key === FolderConstant.PERMISSION_FOLDER_WRITE) {
        let a: any = this.typeService.clone(eachPermission);
        a.permission = FolderConstant.PERMISSION_FOLDER_WRITE_ID;
        for (let i in this.selectMember[key]) {
          a.uids.push(this.selectMember[key][i].id);
        }
        permissionLists.push(a);
      }
      if (key === FolderConstant.PERMISSION_FOLDER_CONTROL) {
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
   * 上传mission 文件
   * @returns {boolean}
   */
  uploadMissionOrChatFile(ele: any) {
    if (this.currFileIndex === this.uploadFileList.length || this.uploadFileList.length === 0) {
      ele.value = '';
    } else {
      if (this.uploader.isMission) {
        let formData = new FormData();
        formData.append('file', this.uploadFileList[this.currFileIndex]);
        formData.append('form', this.uploader.form);
        formData.append('pdid', this.uploader.pdid);
        this.folderModelService.newFileUpload(formData, (res: any) => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: res
          });
          if (res.status == 1) {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_MISSION_FILE_UPLOAD,
              data: res.data
            });
          }
          this.currFileIndex += 1;
          this.uploadMissionOrChatFile(ele);
        });
      } else {
        let formData = new FormData();
        formData.append('file', this.uploadFileList[this.currFileIndex]);
        formData.append('form', this.uploader.form);
        formData.append('pdid', this.uploader.pdid);
        formData.append('module', this.uploader.module);
        this.folderModelService.newFileUpload(formData, (res: any) => {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
            data: res
          });
          if (res.status == 1) {
            if (this.uploader.isChat) {
              let msgData = res.data.name;
              res.data.file_name = res.data.name;
              res.data.file_type = res.data.ext_type;
              res.data.file_path = res.data.path;
              let msgType: number =
                res.data.ext_type === FolderConstant.FOLDER_TYPE_IMAGE.toLowerCase() ? this.chatConfig.CHAT_MESSAGE_TYPE_IMG : this.chatConfig.CHAT_MESSAGE_TYPE_FILE;
              this.notificationService.postNotification({
                act: this.notificationService.config.ACT_COMPONENT_CHAT_FILE_UPLOAD,
                data: {
                  msgData: msgData,
                  msgType: msgType,
                  resData: res.data
                },
                isMiniDialog: this.uploader.isMiniDialog,
                currentMenuItem: this.uploader.currentMenuItem
              });
            }
          }
          this.currFileIndex += 1;
          this.uploadMissionOrChatFile(ele);
        });
      }
    }
  }

  /**
   * 上传屏幕截图
   */
  uploadScreenImg() {
    this.folderModelService.fileUpload({
      file: this.uploadFileList[this.currFileIndex],
      form: this.uploader.form,
      id: this.uploader.pdid,
      module: this.uploader.module
    }, (res: any) => {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON,
        data: res
      });
      if (res.status === 1) {
        if (this.uploader.isChat) {
          let msgData = res.data.name;
          res.data.file_name = res.data.name;
          res.data.file_type = res.data.ext_type;
          res.data.file_path = res.data.path;
          let msgType: number =
            res.data.ext_type === FolderConstant.FOLDER_TYPE_IMAGE.toLowerCase() ? this.chatConfig.CHAT_MESSAGE_TYPE_IMG : this.chatConfig.CHAT_MESSAGE_TYPE_FILE;
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_FILE_UPLOAD,
            data: {
              msgData: msgData,
              msgType: msgType,
              resData: res.data
            },
            isMiniDialog: this.uploader.isMiniDialog,
            currentMenuItem: this.uploader.currentMenuItem
          });
        }
      }
      this.currFileIndex += 1;
    })
  }
}