import {Component, OnInit, ViewEncapsulation, Inject, Input, Renderer} from '@angular/core';

import {
  FolderModelService
}
  from '../../shared/services/index.service';

import * as FolderConstant from '../../shared/config/folder.config';
@Component({
  selector: 'import-file',
  encapsulation: ViewEncapsulation.None,
  templateUrl: '../template/import-file.component.html',
  providers: [FolderModelService]
})


export class ImportFileComponent implements OnInit {
  private currentFolderId: number = 0;
  private optionData: any;
  private fileList: Array <any> = [];
  private isStartChoose: boolean = false;
  public startPositionX: number;
  private startPositionY: number;
  private allFileLi: any;
  private selectInfoArr: Array<any> = [];
  public selectFileInfo: any;
  public nodes: Array<any>;
  private selectPath: string;
  private temporaryFileList: Array <any> = [];
  public searchKeyWord: string = '';
  private currFileIndex: number = 0;
  public isFolderShow: boolean = false;
  private toggleSelectElement: any;
  private isMiniDialog: boolean;
  private btnObj: any;
  private btnError: string = '';

  constructor(public renderer: Renderer,
              public folderModelService: FolderModelService,
              @Inject('app.config') public config: any,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {

  }


  ngOnInit() {

  }


  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    this.btnObj = data;
    this.optionData = data.currentItem;
    this.isMiniDialog = data.isMiniDialog;
    this.currentFolderId = 0;
    this.currFileIndex = 0;
    this.searchKeyWord = '';
    this.isFolderShow = false;
    this.selectPath = this.optionData.form === 2 ? 'Work Folder' : 'Personal Folder'
    this.getAllCommonFileList();
    this.getAllFileList(data);
  };

  /**
   * 获取所有普通文件
   */
  getAllCommonFileList() {
    this.folderModelService.folderLists({
      form: this.optionData.form ? this.optionData.form : 1,
      pdid: this.currentFolderId,
      own: 1
    }, (data: any) => {
      if (data.status == 1) {
        this.fileList = [];
        for (let i in data.data.sub) {
          if (data.data.sub[i].is_dir === 0) {
            this.fileList.push(data.data.sub[i]);
            this.temporaryFileList = this.typeService.clone(this.fileList);
          }
        }
        this.searchKeyWord = '';
      } else {
          this.dialogService.openWarning({simpleContent:'get all common file failed!'})
      }
    })
  }

  /**
   * 点击选择文件
   */
  selectCurrent(data: any, event: any) {
    event.stopPropagation();
    if (data.isSelect) {
      data.isSelect = false;
    } else {
      if (this.selectInfoArr.length < 5) {
        data.isSelect = true;
      }
    }
    this.getSelectFileInfo();
  }


  getSelectFileInfo() {
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
  }


  /**
   * mission 文件夹 内鼠标框选文件
   */
  // 鼠标按下开始框选
  startChoose(event: any, ul: any, fileContent: any, selectBox: any) {
    // if (this.element.hasClass(event.target, 'selectBtn'))  return false;
    // if (event.which === 1) {
    //   let _left = this.element.getPosition(fileContent).x - 241;
    //   this.isStartChoose = true;
    //   this.allFileLi = ul.children;
    //   this.startPositionX = event.pageX - _left;
    //   this.startPositionY = event.pageY - 275 + fileContent.scrollTop;
    //   document.onmousemove = (evcent: any) => {
    //     if (this.isStartChoose) {
    //       this.renderer.setElementStyle
    //       (selectBox, 'left', Math.min(event.pageX - _left, this.startPositionX) + 'px');
    //       this.renderer.setElementStyle
    //       (selectBox, 'top', Math.min(event.pageY - 275 + fileContent.scrollTop, this.startPositionY) + 'px');
    //       this.renderer.setElementStyle
    //       (selectBox, 'width', Math.abs(event.pageX - _left - this.startPositionX) + 'px');
    //       this.renderer.setElementStyle
    //       (selectBox, 'height', (Math.abs(event.pageY - 275 - this.startPositionY + fileContent.scrollTop) + 'px'));
    //       this.renderer.setElementStyle(selectBox, 'display', 'block');
    //       this.renderer.setElementStyle(selectBox, 'background', '#7078F7');
    //       let _l = selectBox.offsetLeft, _t = selectBox.offsetTop;
    //       let _w = selectBox.offsetWidth, _h = selectBox.offsetHeight;
    //       for (let k in this.fileList) {
    //         this.fileList[k].isSelect = false;
    //       }
    //       for (let i = 0; i < this.allFileLi.length; i++) {
    //         let sl = this.allFileLi[i].offsetWidth + this.allFileLi[i].offsetLeft;
    //         let st = this.allFileLi[i].offsetHeight + this.allFileLi[i].offsetTop;
    //         if (sl > _l && st > _t && this.allFileLi[i].offsetLeft < _l + _w && this.allFileLi[i].offsetTop < _t + _h) {
    //           this.fileList[i].isSelect = true;
    //         }
    //       }
    //     }
    //     this.getSelectFileInfo();
    //   };
    //   document.onmouseup = (event: any) => {
    //     event.stopPropagation();
    //     this.clearMaskInfo(selectBox);
    //     this.isStartChoose = false;
    //     document.onmousemove = null;
    //   };
    // }
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
   * 从bi导入文件到chat
   * @returns {boolean}
   */
  importFileToChat() {
    if(!this.selectFileInfo || !this.selectFileInfo.fid.length) {
      this.btnError = 'Select at least one file';
      return false;
    }else{
      this.btnError = '';
    }
    if (this.currFileIndex === this.selectFileInfo.fid.length)
    {
      return false;
    }
    this.folderModelService.fileImport({
        id: this.optionData.isFriend ? this.optionData.uid : this.optionData.gid,
        fid: this.selectFileInfo.fid[this.currFileIndex],
        moduleType: this.optionData.isFriend ? FolderConstant.MODULE_CHAT_FRIEND_TYPE : FolderConstant.MODULE_CHAT_GROUP_TYPE,
        form: this.optionData.form
      }, (res: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_IMPORT_BI_FILE,
            data: {
              data: res.data
            },
            isMiniDialog: this.isMiniDialog
          })
        }
        this.currFileIndex++;
        this.importFileToChat();
      }
    );
  }

  /**
   * 从bi导入文件到mission
   */
  importFileToMission() {
    if(!this.selectFileInfo || !this.selectFileInfo.fid.length) {
      this.btnError = 'Select at least one file';
      return false;
    }else{
      this.btnError = '';
    }
    if (this.currFileIndex === this.selectFileInfo.fid.length)
    {
      return false;
    }
    this.folderModelService.fileImport({
        pdid: this.optionData.missionFolderId,
        id: '',
        fid: this.selectFileInfo.fid[this.currFileIndex],
        moduleType: FolderConstant.MODULE_MISSION_TYPE,
        form: this.optionData.form
      }, (res: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_MISSION_IMPORT_FILE,
            data: res.data
          })
        }
        this.currFileIndex++;
        this.importFileToMission();
      }
    );
  }

  /**
   * import file to post
   */
  importFileToPost() {
    if ( !this.selectFileInfo || this.currFileIndex === this.selectFileInfo.fid.length) return false;
    this.folderModelService.fileImport({
        pdid: 0,
        fid: this.selectFileInfo.fid[this.currFileIndex],
        form: this.optionData.form,
        is_post: 1
      }, (res: any) => {
      this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: res });
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_IMPORT_FILE_TO_POST,
            data: {
              data: res.data
            }
          })
        }
        this.currFileIndex++;
        this.importFileToPost();
      }
    );
  }


  /**
   *获取所有文件夹目录
   * @param data
   * @param callback
   */
  getAllFileList(data: any, callback?: any) {
    this.folderModelService.folderDirList({
      form: this.optionData.form ? this.optionData.form : 1,
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
    event.stopPropagation();
    this.currentFolderId = data.id;
    this.selectPath = data.name;
    this.isFolderShow = true;
    this.getAllCommonFileList();
    this.renderer.setElementClass(this.toggleSelectElement, 'hide', true);
    this.toggleSelectService.emptyElement();
    this.isFolderShow = false;
  }

  /**
   * 按下开始搜索
   */
  keyToSearch(event: any, filterText: any) {
    if (event.keyCode === 13) {
      if (filterText == '') {
        this.fileList = this.typeService.clone(this.temporaryFileList);
      } else {
        this.temporaryFileList.forEach((ele: any) => {
          // 不要求精确匹配，使用!=而不是!==
          if (ele.hasOwnProperty('name')) {
            let name = ele.name.toLowerCase();
            let filter = filterText.toLowerCase();
            ele.hasFiltered = name.indexOf(filter) == '-1';
          }
        });
        this.fileList = [];
        for (let i in this.temporaryFileList) {
          if (!this.temporaryFileList[i].hasFiltered) {
            this.fileList.push(this.temporaryFileList[i])
          }
        }
      }
    } else if (event.keyCode === 8) {
      if (filterText == '') {
        this.fileList = this.typeService.clone(this.temporaryFileList);
      }
    }
  }

  /**
   *
   * @param obj
   */
  getData(obj: any) {
    this.toggleSelectElement = obj.toggleSelectElement;
    this.isFolderShow = true;
  }
}