import {Component, Inject, OnInit, Input, Renderer, ElementRef} from '@angular/core';

import {FolderModelService}from '../../shared/services/index.service';
import {DragComponent} from "../../drag/drag";
import {DropdownSettings} from "../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../dropdown/dropdown-element";
import * as FolderConstant from '../../shared/config/folder.config';
import {Router} from '@angular/router';

@Component({
  selector: 'new-folder',
  templateUrl: '../template/new-folder.component.html',
  providers: [FolderModelService]
})

export class NewFolderComponent implements OnInit {

  public newFoldIn: any = {};
  public nodes: any;
  public shareArr: Array<any> = [];
  public shareInfo: any = {
    permission: '1',
    permissionName: 'Read',
    isShowMemberList: false,
    isShowPermissionList: false,
    contactList: {},
    selectMemberInfo: [],
    uids: []
  };
  public contactList: any;

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: any = {
    Read: [],
    Control: [],
    Write: []
  };
  public comments: string = '';

  public currentPermission: string = 'Read';

  public selectMember: any = {
    Read: [],
    Control: [],
    Write: []
  };

  public inputSelectMember: any = {};

  public isShowSelectBox: boolean = false;

  public selectPath: string = '';
  public regResult: boolean = true;
  public errorMsg: string;
  private toggleSelectElement: any;
  public isFolderShow: boolean = false;
  private toggleInput: any | ElementRef;
  private btnError: string = '';


  constructor(private renderer: Renderer,
              public router: Router,
              public folderModelService: FolderModelService,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }

  //初始化页面后
  ngOnInit() {
    this.newFoldIn.name = '';
  }

  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      this.newFoldIn = data;
      this.isFolderShow = false;
      //普通文件夹
      if (!this.newFoldIn.isMission) {
        this.selectMember = {
          Read: [],
          Control: [],
          Write: []
        };
        this.selectPath = this.newFoldIn.parentName;
        this.comments = '';
        this.shareArr = this.selectMember[this.currentPermission];
        this.inputSelectMember = this.typeService.clone(this.selectMember);
        this.clearComponentData();
        this.getAllFileList(this.newFoldIn);
        this.getContactListIn();
      }
      this.regResult = true;
    }
  };


  /**
   * 清除组件数据
   */
  clearComponentData() {
    this.shareArr = [];
  }


  /**
   * 点击add添加权限人员
   */
  addPermission(event: any) {
    event.stopPropagation();
    this.isShowSelectBox = true;
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


  getShareList(params: any) {
    let param: any = {
      friend: [],
      internal: [],
      cooperator: [],
    };
    if (this.newFoldIn.form === 1) {
      param.friend = params.Friend;
      delete param.internal;
      delete param.cooperator;
    } else if (this.newFoldIn.form === 2) {
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
   * keyUp验证 folder_name 是否含有特殊字符串
   */
  validateFolderName(event: any) {
    if (event.target.value === '') {
      this.regResult = false;
      this.errorMsg = 'The folder name can not be empty!';
    } else {
      let regTest = new RegExp("[&,<,>]");
      this.regResult = !(regTest.test(event.target.value));
      this.errorMsg = 'The folder name cannot contain special character(&,<,>)!';
    }
  }


  /**
   * 点击弹框create按钮新建文件
   */
  newTheFolder() {
    let shareInfoArr: Array<any> = [];
    let shareInfo: any = {
      uids: [],
      permission: ''
    };
    for (let i in this.shareArr) {
      let a = this.typeService.clone(shareInfo);
      a.uids = this.shareArr[i].uids;
      a.permission = this.shareArr[i].permission
      shareInfoArr.push(a);
    }

    let newName: string = this.newFoldIn.name.replace(/(^\s*)|(\s*$)/g, "");
    if (!this.newFoldIn.name || newName == '' || !this.regResult) {
      this.errorMsg = 'The folder name can not be empty!';
      this.regResult = false;
      return false;
    } else {
      this.folderModelService.folderCreate({
        form: this.newFoldIn.form,
        chn: 0,
        pdid: this.newFoldIn.pdid,
        name: newName,
        path: this.newFoldIn.path,
        share: this.getPermissionLists()
      }, (data: any) => {
        this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: data });
        //获取成功
        if (data.status === 1) {
          this.transformDateFormat(data.data[0]);
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_NEW_FOLDER,
            data: data.data
          });
          if (this.newFoldIn.isDefaultPage) {
            let type: string = this.newFoldIn.form == 1 ? 'personal' : 'business';
            let routerObj = this.newFoldIn.path ? {queryParams: {path: data.path}} : {queryParams: {path: ('/')}};
            this.router.navigate(['/folder/' + type], routerObj);
          }
        }
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
   *获取所有文件夹目录
   * @param data
   */
  getAllFileList(data: any, callback?: any) {
    this.folderModelService.folderDirList({
      form: this.newFoldIn.form,
      own: 1,
      pdid: data.id ? data.id : 0,
    }, (response: any) => {
      if (!data.id) {
        this.nodes = this.typeService.getObjLength(response.data) > 0 ? response.data : [];
      }
      if (callback) {
        callback(response.data);
      }
    })
  }

  /**
   * 获取联系人列表
   */
  getContactListIn() {
    this.contactList = this.userDataService.getContactList();
    this.getShareList(this.contactList);
  }

  /**
   * 获取权限人员列表
   * @returns {Array<any>}
   */
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


//  mission部分
  newMissionFolder() {
    let newName: string = this.newFoldIn.name.replace(/(^\s*)|(\s*$)/g, "");
    if (!this.newFoldIn.name || newName == '' || !this.regResult) {
      this.errorMsg = 'The folder name can not be empty!';
      this.regResult = false;
      return false;
    }
    this.folderModelService.folderCreate({
      form: 2,
      chn: 0,
      pdid: this.newFoldIn.pdid,
      name: newName,
    }, (data: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: data });
      //获取成功
      if (data.status === 1) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACT_COMPONENT_MISSION_FOLDER_CREATE,
          data: data.data
        });
      }
    })
  }


  /**
   * angular2-tree onEvent
   */
  onEvent(data: any) {
    this.getAllFileList(data.node, (res: any) => {
      if (res.length > 0) {
        this.nodes = this.typeService.clone(this.getList(this.nodes, res, res[0].pdid));
      }
    });
  }

  /**
   * 递归插入子节点
   * @param data
   * @param nextList
   * @param nextPdid
   * @returns {any}
   */
  getList(data: any, nextList: any, nextPdid: string) {
    // let array: any = Array();
    let flag = 0;
    for (let k in data) {
      if (data[k].id === nextPdid && data[k].hasChildren) {
        data[k].children = nextList;
        flag = 1;
      }
    }
    if (flag === 0) {
      for (let k in data) {
        this.getList(data[k].children, nextList, nextPdid);
      }
    }
    return data;
  }


  /**
   * 选择目录
   */
  selectThePath(event: any, data: any) {
    this.newFoldIn.pdid = data.id;
    this.selectPath = data.name;
    this.renderer.setElementClass(this.toggleSelectElement, 'hide', true);
    this.renderer.setElementClass(this.toggleInput, 'se-input-current', false);
    this.toggleSelectService.emptyElement();
    this.isFolderShow = false;
  }

  /**
   *
   * @param obj
   */
  getData(obj: any) {
    this.toggleSelectElement = obj.toggleSelectElement;
    this.toggleInput = obj.toggleInput;
    this.isFolderShow = true;
  }
}
