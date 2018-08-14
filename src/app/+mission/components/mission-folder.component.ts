import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  Input, ElementRef, Renderer, OnDestroy,
} from '@angular/core';

import {ActivatedRoute, Router, Params} from '@angular/router';
import {FolderModelService} from "../../shared/services/model/folder-model.service";
import * as FolderConstant from '../../shared/config/folder.config';
import {FolderLists, FolderInfo} from "../../shared/services/model/entity/folder-entity";
import * as MissionConstant from '../../shared/config/mission.config';
import {DownloadService} from "../../shared/services/common/file/download.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'mission-folder',
  templateUrl: '../template/mission-folder.component.html'
})

export class MissionFolderComponent implements OnDestroy {

  private isStartChoose: boolean = false;
  public startPositionX: number;
  private startPositionY: number;
  private allFileLi: any;
  public currentFolderIn: FolderInfo;
  public previousFolderInfo: FolderInfo;
  public userData: any;
  public companyData: any;
  public fileList: any;
  public missionFolderId: any = {};
  public generalToken: any;
  public sessionId: string;
  public isAllSelected: boolean = false;
  public allFileCount: number = 0;  //当前文件夹下的 所有文件和文件夹总数
  public selectFileCount: number = 0; //选中的文件数量
  public selectInfoArr: Array<any> = [];
  public selectFileInfo: any;
  public downLoadUrl: string = 'api/folder/download-file';


  @ViewChild('selectBox') public selectBox: ElementRef;
  @ViewChild('divBg') public divBg: ElementRef;
  @ViewChild('bigContent') public bigContent: ElementRef;


  public isShowNewFolder: boolean;
  private originalFolderName: any;
  public isShowInput: boolean = false;
  private pasteInfo: {did: Array<any>; fid: Array<any>};
  public isHasPasteFile: boolean = false;
  public subscription: Subscription;
  public initSuccess: boolean;
  public missionDetailData: any = {};
  public missionConstant: any = {};

  @Input() set setMissionToken(generalToken: any) {
  }

  @Input() set setFolderId(data: any) {
    this.getFolderLists(data);
    this.missionFolderId = data;
  }

  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
  }

  ngOnInit() {
  }

  constructor(public el: ElementRef,
              public folderModelService: FolderModelService,
              public renderer: Renderer,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('page.element') public element: any,
              public downloadService: DownloadService,
              @Inject('notification.service') public notificationService: any,
              @Inject('type.service') public typeService: any) {
    this.missionConstant = MissionConstant;
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 处理交互消息
   */
  dealMessage(data: any) {
    switch (data.act) {
      //新建mission文件夹
      case this.notificationService.config.ACT_COMPONENT_MISSION_FOLDER_CREATE:
        for (let i in data.data) {
          this.fileList.push(data.data[i]);
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_MISSION_FILE_UPLOAD:
        data.data.id = data.data.fid;
        this.fileList.push(data.data);
        break;
      case this.notificationService.config.ACT_COMPONENT_MISSION_IMPORT_FILE:
        data.data.id = data.data.fid;
        this.fileList.push(data.data);
        break;
    }
  }


  /**
   *创建mission时候获取临时token/fid
   * @param data
   */
  getGeneralToken(data: any) {
    this.generalToken = data;
    this.missionFolderId = this.generalToken['fid'].toString();
    this.getFolderLists(this.missionFolderId);
  }


  /**
   * 全选当前下面的文件
   */
  selectAllFile(data: any, event: any) {
    event.stopPropagation();
    if (this.isAllSelected) {
      for (let i in data) {
        data[i].isSelect = false;
        this.isAllSelected = false;
        this.selectFileCount = 0;
      }
    } else {
      for (let i in data) {
        data[i].isSelect = true;
        this.isAllSelected = true;
        this.selectFileCount = data.length;
        this.selectInfoArr = this.fileList;
      }
    }
    this.getSelectFileInfo();
  }


  /**
   * 点击进去当前文件夹
   */
  enterMissionFolder(event: any, data: any) {
    event.stopPropagation();
    if (data.is_dir == 1) {
      this.getFolderLists(data.id);
    } else {
      this.selectTheMissionFile(event, data);
    }

  }


  /**
   * 点击回退上一级
   */
  backUpperFolder(event: any) {
    event.stopPropagation();
    this.getFolderLists(this.previousFolderInfo.id);
  }


  /**
   * 获取单层列表
   */
  getFolderLists(data: any) {
    this.folderModelService.folderLists({
      form: 2,
      pdid: data
    }, (data: any) => {
      if (data.status == 1) {
        this.initSuccess = true;
        this.fileList = this.typeService.bindDataList(FolderLists.init(), data.data.sub);
        this.currentFolderIn = data.data.current;
        this.previousFolderInfo = data.data.parent;
        this.isAllSelected = false;
        this.selectFileCount = 0;
        this.selectInfoArr = [];
      } else {
        this.initSuccess = false;
        this.dialogService.openWarning({simpleContent: 'fetch file list failed'})
      }
    })
  }

  /**
   * 点击文件的name显示文件的编辑框
   */
  modifyFileName(data: any, event: any, ele: any) {
    event.stopPropagation();
    if (data.op === FolderConstant.PERMISSION_FOLDER_CONTROL_ID) {
      this.isShowInput = true;
      data.isShowInput = true;
      setTimeout(() => {
        ele.focus();
      });
      this.originalFolderName = data.name;
    } else {
      this.dialogService.openWarning({simpleContent: 'You do not have permission to rename this file!'});
    }
  }

  /**
   * 确认修改name
   */
  ensureReName(data: any, event: any) {
    event.stopPropagation();
    data.isShowInput = false;
    let newName: string = data.name.replace(/(^\s*)|(\s*$)/g, "");
    let regTest = new RegExp("[&,<,>]");
    let regResult = regTest.test(newName);
    if (newName == '' || newName == this.originalFolderName) {
      data.name = this.originalFolderName;
    } else if (regResult) {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The folder name cannot contain special character(&,<,>)!'
      };
      this.dialogService.openWarning(settings);
      data.name = this.originalFolderName;
    } else {
      let reNameIn: any = {};
      if (data.is_dir === 1) {
        reNameIn.id = data.id;
      } else if (data.is_dir === 0) {
        reNameIn.id = data.id;
      }
      this.folderModelService.folderRename({
        id: reNameIn.id,
        is_dir: data.is_dir,
        form: 2,
        name: newName
      }, (res: any) => {
        if (res.status === 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_RENAME_FILE,
            data: this.currentFolderIn
          });
        } else {
          this.dialogService.openWarning({simpleContent: 'rename file/folder failed!'})
          data.name = this.originalFolderName;
        }
      })
    }
    this.isShowInput = false;
  }


  /**
   * mission里面新建文件夹
   */
  newMissionFolder(event: any) {
    event.stopPropagation();
    let createFolderInfo: any = {
      isMission: true,
      pdid: this.currentFolderIn.id ? this.currentFolderIn.id : 0
    }
    this.isShowNewFolder = false;
    let settings = {
      mode: '2',
      title: '',
      isSimpleContent: false,
      componentSelector: 'new-folder',
      componentData: this.typeService.clone(createFolderInfo),
      buttons: [
        {type: 'cancel'},
        {btnEvent: 'newMissionFolder'}
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 上传mission里面的文件
   */
  uploadMissionFolder(event: any, input: any) {
    event.stopPropagation();
    input.click();
  }

  /**
   * 从bi导入文件
   */
  importFileFormBi() {
    let optionData: any = {
      currentItem: {
        form: 2,
        isMission: true,
        missionFolderId: this.missionFolderId
      }
    };
    this.dialogService.openNew({
      mode: '4',
      isSimpleContent: false,
      componentSelector: 'import-file',
      componentData: this.typeService.clone(optionData),
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'IMPORT',
          btnEvent: 'importFileToMission'
        }
      ]
    })
  }


  /**
   * 本地资源管理器选中文件
   * @param event
   * @param ele
   */
  inputChangeEvent(ele: any, event?: any) {
    if (ele.value === '') return;
    if (event) {
      event.stopPropagation();
    }
    for (let i in ele.files) {
      if (ele.files[i].size === 0) {
        let settings = {
          title: 'Notice!',
          simpleContent: ele.files[i].name + this.translateService.manualTranslate(' file size is 0, can not be uploaded.'),
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (ele.files[i].size > this.config.uploadImgSize * 1024 * 1024) {
        this.dialogService.openWarning({
          simpleContent: ele.files[i].name + this.translateService.manualTranslate(' file size too large, limit is ') + this.config.uploadImgSize + 'M',
        });
        return false;
      }
    }
    let optionData: any = {
      data: ele.files,
      form: 2,
      pdid: this.currentFolderIn.id ? this.currentFolderIn.id : 0,
      module: FolderConstant.MODULE_MISSION_TYPE,
      isMission: true
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'UPLOAD FILE',
      isSimpleContent: false,
      componentSelector: 'folder-upload',
      componentData: optionData,
      beforeCloseEvent: () => {
        ele.value = ''
      },
      buttons: [
        {
          type: 'cancel',
          btnEvent: () => {
            ele.value = ''
          }
        },
        {
          type: 'send',
          btnText: 'UPLOAD',
          btnEventParam: ele,
          btnEvent: 'uploadMissionOrChatFile'
        }
      ]
    });
  }


  /**
   * 阻止事件冒泡
   */
  stopPropagation(event: any) {
    event.stopPropagation();
  }


  /**
   * mission 文件夹 内鼠标框选文件
   */
  // 鼠标按下开始框选
  startChoose(event: any, ul: any, fileContent: any, selectBox: any) {
    if (this.element.hasClass(event.target, 'selectBtn'))  return false;
    if (event.which === 1) {
      let _left = this.element.getPosition(fileContent).x;
      this.isStartChoose = true;
      this.allFileLi = ul.children;
      this.startPositionX = event.pageX - _left;
      this.startPositionY = event.pageY - 127 + fileContent.scrollTop;
      document.onmousemove = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        if (this.isStartChoose && !this.isShowInput) {
          this.renderer.setElementStyle
          (selectBox, 'left', Math.min(event.pageX - _left, this.startPositionX) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'top', Math.min(event.pageY - 127 + fileContent.scrollTop, this.startPositionY) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'width', Math.abs(event.pageX - _left - this.startPositionX) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'height', (Math.abs(event.pageY - 127 - this.startPositionY + fileContent.scrollTop) + 'px'));
          this.renderer.setElementStyle(selectBox, 'display', 'block');
          this.renderer.setElementStyle(selectBox, 'background', 'rgba(112, 120, 247, .1)');
          let _l = selectBox.offsetLeft, _t = selectBox.offsetTop;
          let _w = selectBox.offsetWidth, _h = selectBox.offsetHeight;
          for (let k in this.fileList) {
            this.fileList[k].isSelect = false;
          }
          for (let i = 0; i < this.allFileLi.length; i++) {
            let sl = this.allFileLi[i].offsetWidth + this.allFileLi[i].offsetLeft;
            let st = this.allFileLi[i].offsetHeight + this.allFileLi[i].offsetTop;
            if (sl > _l && st > _t && this.allFileLi[i].offsetLeft < _l + _w && this.allFileLi[i].offsetTop < _t + _h) {
              this.fileList[i].isSelect = true;
            }
          }
        }
        this.getSelectFileInfo();
      };
      document.onmouseup = (event: any) => {
        event.stopPropagation();
        this.clearMaskInfo(selectBox);
        this.isStartChoose = false;
        document.onmousemove = null;
      };
    }
  }

  /**
   * 清除蒙层和框选背景
   */
  clearMaskInfo(selectBox: any) {
    this.isStartChoose = false;
    this.renderer.setElementStyle(selectBox, 'display', 'none');
    this.renderer.setElementStyle(selectBox, 'background', 'none');
    this.renderer.setElementStyle(selectBox, 'width', '0px');
    this.renderer.setElementStyle(selectBox, 'height', '0px');
  }


  /**
   * 获取选中文件
   */
  getSelectFileInfo() {
    this.allFileCount = this.typeService.getDataLength(this.fileList);
    this.selectInfoArr = [];
    this.selectFileInfo = {
      fileArr: [],
      folderArr: [],
      did: [],
      fid: [],
      allFile: []
    };
    this.selectFileInfo.allFile = this.selectInfoArr;
    for (let i in this.fileList) {
      if (this.fileList[i].isSelect) {
        this.selectInfoArr.push(this.fileList[i]);
      }
    }
    for (let i in this.selectInfoArr) {
      if (this.selectInfoArr[i].is_dir === 0) {
        this.selectFileInfo.fid.push(this.selectInfoArr[i].id);
        this.selectFileInfo.fileArr.push(this.selectInfoArr[i]);
      } else if (this.selectInfoArr[i].is_dir === 1) {
        this.selectFileInfo.did.push(this.selectInfoArr[i].id);
        this.selectFileInfo.folderArr.push(this.selectInfoArr[i]);
      }
    }
    if (this.selectInfoArr.length === this.allFileCount) {
      this.isAllSelected = true;
    } else {
      this.isAllSelected = false;
    }
  };

  /**
   * 鼠标划入显示操作悬浮操作按钮的 button列表
   */
  mouseEnter(li: any, ul: any, btn: any, event: any, file: any) {
    event.stopPropagation();
    if (file.chn === 1 || file.chn === 2 || file.chn === 3) return false;
    if (!this.isStartChoose) {
      this.renderer.setElementStyle(btn, 'display', 'block');
      this.renderer.setElementStyle(btn, 'top', li.offsetTop + 127 - this.bigContent.nativeElement.scrollTop - 30 + 'px');
      if ((ul.offsetWidth + this.element.getPosition(this.bigContent.nativeElement).x) - (li.offsetLeft) < 400) {
        this.renderer.setElementStyle(btn, 'left', li.offsetLeft + 'px');
      } else {
        this.renderer.setElementStyle(btn, 'left', this.element.getPosition(this.bigContent.nativeElement).x + li.offsetLeft - 20 + 'px');
      }
    }
  }

  /**
   * 鼠标离开隐藏操作按钮
   * @param btn
   * @param event
   */
  mouseLeave(btn: any, event: any) {
    event.stopPropagation();
    this.renderer.setElementStyle(btn, 'display', 'none');
  }

  /**
   * 点击选择当前文件
   */
  selectTheMissionFile(event: any, file: any) {
    event.stopPropagation();
    file.isSelect = !file.isSelect;
    this.getSelectFileInfo();
  }


  /**
   * 删除当前文件
   */
  deleteTheFile(event: any, data: any) {
    event.stopPropagation();
    if (data.op == FolderConstant.PERMISSION_FOLDER_CONTROL_ID) {
      let settings = {
        mode: '1',
        title: 'REMOVE THIS FOLDER',
        isSimpleContent: true,
        simpleContent: 'Are you sure delete the folder?',
        buttons: [
          {type: 'cancel'},
          {
            type: 'delete',
            btnEvent: () => {
              let did: Array<any> = [];
              let fid: Array<any> = [];
              if (data.is_dir === 1) {
                did.push(data.id);
              } else if (data.is_dir === 0) {
                fid.push(data.id);
              }
              this.folderModelService.deleteFolder({
                form: 2,
                did: did,
                fid: fid,
              }, (data: any) => {
                if (data.status == 1) {
                  this.dealDeleteResult(did, fid);
                } else {
                  this.dialogService.openWarning({simpleContent: 'delete file failed!'})
                }
              });
            }
          }
        ]
      };
      this.dialogService.openNew(settings);
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'you do not have permission to delete the file!'
      };
      this.dialogService.openWarning(settings);
    }
  }

  /**
   * 删除多个文件
   * @param event
   * @returns {boolean}
   */
  deleteMutileFile(event: any) {
    event.stopPropagation();
    for (let i in this.selectFileInfo.folderArr) {
      if (parseInt(this.selectFileInfo.folderArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let errorMessage: string;
        if (this.translateService.lan == 'zh-cn') {
          errorMessage = '你没有权限删除' + this.selectFileInfo.folderArr[i].name + '这个文件夹';
        } else {
          errorMessage = 'you do not have permission to delete file named ' + this.selectFileInfo.folderArr[i].name;
        }
        let settings = {
          title: 'Notice',
          isSimpleContent: true,
          simpleContent: errorMessage
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.selectFileInfo.fileArr) {
      if (parseInt(this.selectFileInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let errorMessage: string;
        if (this.translateService.lan == 'zh-cn') {
          errorMessage = '你没有权限删除' + this.selectFileInfo.fileArr[i].name + '这个文件';
        } else {
          errorMessage = 'you do not have permission to delete file named ' + this.selectFileInfo.folderArr[i].name;
        }
        let settings = {
          title: 'Notice',
          isSimpleContent: true,
          simpleContent: errorMessage
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    if (this.selectFileInfo) {
      let settings = {
        mode: '1',
        title: 'REMOVE THIS FOLDER',
        isSimpleContent: true,
        simpleContent: 'Are you sure delete the folder?',
        buttons: [
          {type: 'cancel'},
          {
            type: 'delete',
            btnEvent: () => {
              this.folderModelService.deleteFolder({
                form: 2,
                did: this.selectFileInfo.did,
                fid: this.selectFileInfo.fid,
              }, (data: any) => {
                if (data.status == 1) {
                  this.dealDeleteResult(this.selectFileInfo.did, this.selectFileInfo.fid);
                } else {
                  this.dialogService.openWarning({simpleContent: ''})
                }
              });
            }
          }
        ]
      };
      this.dialogService.openNew(settings);
    } else {
      let settings = {
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'No file selected!'
      };
      this.dialogService.openWarning(settings);
    }
  }

  dealDeleteResult(did: Array<any>, fid: Array<any>) {
    for (let i  in did) {
      for (let k in this.fileList) {
        if (this.fileList[k].id == did[i]) {
          this.fileList.splice(parseInt(k), 1)
        }
      }
    }
    for (let i in fid) {
      for (let k in this.fileList) {
        if (this.fileList[k].id == fid[i]) {
          this.fileList.splice(parseInt(k), 1)
        }
      }
    }


  }


  /**
   * 单个下载
   */
  downloadTheFile(event: any, data: any) {
    event.stopPropagation();
    if (parseInt(data.op) >= parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
      this.sessionId = this.userDataService.getSessionId();
      if (data.is_dir === 1) {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'Cannot download folder!'
        };
        this.dialogService.openWarning(settings);
      } else {
        this.downloadService.downloadTheFile(this.config.resourceFolderDomain + this.downLoadUrl + '?form=' +
          data.type + '&fid=' + data.id + '&rid=' + data.rid + '&session_id=' + this.sessionId);
      }
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'You do not have permission to download this file!'
      };
      this.dialogService.openWarning(settings);
    }
  }


  /**
   * 批量下载
   */
  downLoadMultipleFile(event: any) {
    event.stopPropagation();
    let sessionId = this.userDataService.getSessionId();
    for (let i = 0; i < this.selectFileInfo.fileArr.length; i++) {
      if (parseInt(this.selectFileInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let errorMessage: string;
        if (this.translateService.lan == 'zh-cn') {
          errorMessage = '你没有权限下载' + this.selectFileInfo.fileArr[i].name + '这个文件';
        } else {
          errorMessage = 'you do not have permission to download this file named ' + this.selectFileInfo.fileArr[i].name;
        }
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: errorMessage,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
      this.selectFileInfo.fileArr[i].type = 2;
      this.downloadService.downloadTheFile(this.config.resourceFolderDomain + this.downLoadUrl + '?form=' +
        this.selectFileInfo.fileArr[i].type + '&fid=' + this.selectFileInfo.fileArr[i].id + '&rid=' + this.selectFileInfo.fileArr[i].rid + '&session_id=' + sessionId)
    }
  }


  /**
   * 单个文件加pin
   */
  pinTheFile(event: any, data: any) {
    event.stopPropagation();
    let way: string;
    let didArr: Array<any> = [];
    if (data.is_dir === 1) {
      didArr.push(data.id);
      if (data.is_starred === 1) {
        way = 'del';
      } else {
        way = 'add';
      }
      this.folderModelService.folderStarred({
        form: data.type,
        did: didArr,
        way: way
      }, (data: any) => {
        if (data.status === 1) {
          this.getFolderLists(this.currentFolderIn.id)
        }
      })
    }
  }


  /**
   * 批量文件/文件夹PIN
   */
  pinMultipleFile(event: any) {
    event.stopPropagation();
    let count: number = 0;
    let way: string;
    for (let i in this.selectFileInfo.folderArr) {
      if (this.selectFileInfo.folderArr[i].is_starred === 1) {
        count++;
      }
    }
    if (count === this.selectFileInfo.folderArr.length) {
      way = 'del'
    } else {
      way = 'add'
    }
    this.folderModelService.folderStarred({
      form: 2,
      did: this.selectFileInfo.did,
      way: way
    }, (data: any) => {
      if (data.status === 1) {
        this.getFolderLists(this.currentFolderIn.id);
      }
    })
  }

  /**
   * mission里面文件复制
   */
  /**
   * 复制文件
   */
  copyTheFile(event: any, data: any) {
    event.stopPropagation();
    if (parseInt(data.op) >= parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
      this.pasteInfo = {
        did: data.is_dir === 1 ? [data.id] : [],
        fid: data.is_dir === 0 ? [data.id] : []
      };
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'You do not have permission to copy this file!'
      };
      this.dialogService.openWarning(settings);
    }
    this.isHasPasteFile = true;
  }

  /**
   * 复制多个文件
   */
  copyMultipleTheFile() {
    event.stopPropagation();
    for (let i in this.selectFileInfo.folderArr) {
      if (parseInt(this.selectFileInfo.folderArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let errorMessage: string;
        if (this.translateService.lan == 'zh-cn') {
          errorMessage = '你没有权限复制' + this.selectFileInfo.folderArr[i].name + '这个文件夹';
        } else {
          errorMessage = 'you do not have permission to copy file named ' + this.selectFileInfo.folderArr[i].name;
        }
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: errorMessage,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.selectFileInfo.fileArr) {
      if (parseInt(this.selectFileInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let errorMessage: string;
        if (this.translateService.lan == 'zh-cn') {
          errorMessage = '你没有权限复制' + this.selectFileInfo.fileArr[i].name + '这个文件';
        } else {
          errorMessage = 'you do not have permission to copy file named ' + this.selectFileInfo.fileArr[i].name;
        }
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: errorMessage,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    this.pasteInfo = {
      did: [],
      fid: []
    };
    this.pasteInfo = {
      did: this.selectFileInfo.did,
      fid: this.selectFileInfo.fid
    };
    this.isHasPasteFile = true;
  }


  /**
   * 点击粘贴文件/文件夹
   * @param event
   */
  pasteTheFile(event: any) {
    event.stopPropagation();
    this.isHasPasteFile = false;
    this.folderModelService.folderCopy({
        did: this.pasteInfo.did,
        fid: this.pasteInfo.fid,
        pdid: this.currentFolderIn.id ? this.currentFolderIn.id : 0,
        form: 2
      }, (data: any) => {
        if (data.status == 1) {
          for (let i in data.data) {
            this.fileList.push(data.data[i])
          }
        } else {
          this.dialogService.openWarning({simpleContent: 'paste file failed!'})
        }
      }
    );
  }


}
