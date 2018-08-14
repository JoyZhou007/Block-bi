import {Component, OnInit, ViewEncapsulation, Inject, Input, Renderer, ElementRef} from '@angular/core';

import {
  FolderModelService
}
  from '../../shared/services/index.service';

@Component({
  selector: 'folder-move',
  templateUrl: '../template/folder-move.component.html',
  styleUrls: ['../../../assets/css/folder/folder.css'],
  providers: [FolderModelService]
})


export class FolderMoveComponent implements OnInit {

  public currentFoldIn: any;
  public nodes: Array<any>;
  public moveFileIn: any = {};
  public setComponentData: any;
  public selectPath: string = '';
  private isSpecialFile: boolean = false;
  private selectPathParent: string = '';
  private toggleSelectElement: any;
  public isFolderShow: boolean = false;
  private toggleInput: any | ElementRef;

  constructor(private renderer: Renderer,
              public folderModelService: FolderModelService,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('toggle-select.service') public toggleSelectService: any) {
  }

  //初始化页面后
  ngOnInit() {
    this.currentFoldIn = {};
  }


  /**
   * 设置component 数据
   * @param data
   */
  @Input() set setOption(data: any) {
    this.setComponentData = data;
    this.isFolderShow = false;
    this.selectPath = this.setComponentData.form === 1 ? 'Personal Folder' : 'Work Folder';
    if (this.setComponentData.isChatFile) {
      this.isSpecialFile = true;
    }
    this.nodes = [];
    this.getAllFileList(data);
  }

  /**
   *获取所有文件夹目录
   * @param data
   */
  getAllFileList(data: any, callback?: any) {
    this.folderModelService.folderDirList({
      form: this.setComponentData.form,
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
   * 确认移动
   */
  confirmMoveTheFile() {
    let did: Array<any> = [];
    let fid: Array<any> = [];
    if (this.setComponentData.model === 'single') {
      if (this.setComponentData.file.is_dir === 1) {
        did.push(this.setComponentData.file.id);
      } else {
        fid.push(this.setComponentData.file.id);
      }
    } else if (this.setComponentData.model === 'multiple') {
      did = this.setComponentData.file.did;
      fid = this.setComponentData.file.fid;
    }
    this.folderModelService.modifyFolder({
      did: did,
      fid: fid,
      modifyid: this.moveFileIn.modifyid ? this.moveFileIn.modifyid : 0,
      form: this.setComponentData.form
    }, (data: any) => {
      if (data.status === 1) {
        if (this.moveFileIn.modifyid == this.setComponentData.currentFolder.pdid ||
          (!this.moveFileIn.modifyid && this.setComponentData.currentFolder.folderPath == '/')) {
        } else {
          if (this.setComponentData.model === 'single') {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACTION_MOVE_FILE,
              data: [this.setComponentData.file]
            });
          } else if (this.setComponentData.model === 'multiple') {
            this.notificationService.postNotification({
              act: this.notificationService.config.ACTION_MOVE_FILE,
              data: this.setComponentData.file.allFile
            });
          }
        }
        let settings = {
          mode: '3',
          title: 'Success',
          isSimpleContent: true,
          simpleContent: 'Success'
        };
        this.dialogService.openSuccess(settings);
      } else {
        this.dialogService.openWarning({simpleContent: 'move file failed!'})
      }
    });
  }

  /**
   * 确认归档该文件
   */
  confirmCopyTheFile() {
    this.folderModelService.folderCopy({
        did: [],
        fid: [this.setComponentData.file.fid],
        pdid: this.moveFileIn.modifyid ? this.moveFileIn.modifyid : 0,
        form: this.setComponentData.form
      }, (data: any) => {
        if (data.status == 1) {
          this.dialogService.openSuccess({simpleContent: 'archive success'})
        } else {
          this.dialogService.openWarning({simpleContent: 'archive failed'})
        }
      }
    );
  }

  /**
   * angular-tree toggleExpanded
   */
  toggleExpanded(data: any) {
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
      if (!data[k].path) {
        data[k].path = data[k].name;
      }
      if (data[k].id === nextPdid && data[k].hasChildren) {
        for (let i in nextList) {
          nextList[i].path = data[k].path + '/' + nextList[i].name;
        }
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
    this.moveFileIn.modifyid = data.id;
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

