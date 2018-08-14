import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  ElementRef,
  Inject,
  HostListener,
  Renderer, OnDestroy
} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {
  FolderModelService, DownloadService
}
  from '../../shared/services/index.service';

import * as FolderConstant from '../../shared/config/folder.config';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'folder-header',
  templateUrl: '../template/folder-header.component.html',
})


export class FolderHeaderComponent implements OnInit, OnDestroy {
  private userData: any;
  private companyData: any;
  public isShowSmallView: boolean = false;  //切换列表视图还是平铺视图
  public newFold: number = 1; //常量 新建文件夹=>1
  public folderInfo: any;
  public isTopFolder: boolean = true;
  public isUploadFile: boolean = false;
  public isCanOperate: boolean = true;
  public selectedInfo: any;
  public currentFolderInfo: any = {};
  public isMultipleSelect: boolean = false;
  public isHasPasteFile: boolean = false;
  public isClipboardContent: boolean = false;
  public clipboard: any = {};
  public downLoadUrl: string = 'api/folder/download-file';
  public pasteInfo: any = {};
  public previousFolderInfo: any = {};
  public searchKeyWords: string = '';
  public subscription: Subscription;
  public isInSearchPartByKeyword: boolean = false;
  public isInSearchPartByExt: boolean = false;
  public isAbleShowPasteBtn: boolean = true;
  public maxFolderTitleWidth: number;
  public isDefaultPage: number;


  @ViewChild('previousFolderLi') public previousFolderLi: ElementRef;
  @ViewChild('previousFolderUl') public previousFolderUl: ElementRef;

  @Output() public doSwitchView = new EventEmitter<any>();
  @Output() public doGoPreviousFolder = new EventEmitter<any>();
  @Output() public doSearchFile = new EventEmitter<any>();
  @Output() public doShoWHelp = new EventEmitter<any>();
  private isHaveCompany: boolean;
  private beforeSearchUrl: {params: any; queryParams: any};
  public shareFilePart: boolean;


  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              public renderer: Renderer,
              public folderModelService: FolderModelService,
              public downloadService: DownloadService,
              public activatedRoute: ActivatedRoute,
              public el: ElementRef) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked() {
    if (this.previousFolderLi) {
      let ulWidth = this.previousFolderUl.nativeElement.offsetWidth;
      let liWidth = this.previousFolderLi.nativeElement.offsetWidth;
      this.maxFolderTitleWidth = ulWidth - liWidth > 100 ? 100 : ulWidth - liWidth;
    }
  }


  //初始化页面后
  ngOnInit() {
    this.getUserIn();
    this.folderInfo = {};
    this.pasteInfo = {
      did: [],
      fid: [],
      form: 1
    }
  }


  //set 被选中的文件信息
  @Input() set setSelected(param: any) {
    this.selectedInfo = param;
  }

  /**
   * clearInfo
   */
  clearInfo() {
    this.isUploadFile = false;
    this.isMultipleSelect = false;
    if (this.isClipboardContent && parseInt(this.currentFolderInfo.form) === parseInt(this.pasteInfo.form)) {
      this.isHasPasteFile = true;
    } else {
      this.isHasPasteFile = false;
    }
  }


  /**
   * dealMeesage
   */
  dealMessage(data: any) {
    switch (data.act) {
      //选择文件的变化
      case this.notificationService.config.ACTION_FILE_CHOOSE_CHANGE:
        if (data.data.length !== 0) {
          this.isMultipleSelect = true;
          this.isHasPasteFile = false;
        } else {
          this.isMultipleSelect = false;
          if (this.isClipboardContent) {
            this.isHasPasteFile = true;
          }
        }
        break;
      //  复制文件
      case this.notificationService.config.ACTION_COPY_FILE:
        this.isClipboardContent = true;
        this.isHasPasteFile = true;
        this.clipboard = data.data;
        this.pasteInfo.did = [];
        this.pasteInfo.fid = [];
        this.pasteInfo.form = data.data.type;
        if (this.clipboard.is_dir === 1) {
          this.pasteInfo.did.push(this.clipboard.id);
        } else if (this.clipboard.is_dir === 0) {
          this.pasteInfo.fid.push(this.clipboard.id);
        }
        break;
      case this.notificationService.config.ACTION_TRANSFER_FILE:
      case this.notificationService.config.ACTION_MOVE_FILE:
        this.isMultipleSelect = false;
        break;
    }
  }

  /**
   * 切换大小视图
   */
  switchFolderView() {
    this.isShowSmallView = !this.isShowSmallView;
    this.doSwitchView.emit(this.isShowSmallView);
  }


  /**
   * uploadFile
   */
  uploadFile(event: any, input: any) {
    event.stopPropagation();
    input.click();
  }

  inputChangeEvent(ele: any, event?: any) {
    if (ele.value === '') return;
    if (event) {
      event.stopPropagation();
    }
    let optionData: any = {
      data: ele.files,
      form: this.currentFolderInfo.form,
      pdid: this.currentFolderInfo.pdid
    };
    for (let i in ele.files) {
      if (ele.files[i].size === 0) {
        let errorMsg = ' file size is 0, can not be uploaded.';
        let settings = {
          title: 'Notice!',
          simpleContent: ele.files[i].name + this.translate.manualTranslate(errorMsg)
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (ele.files[i].size > this.config.uploadImgSize * 1024 * 1024) {
        let errorMsg = ' file size too large, limit is ';
        this.translate.manualTranslate(errorMsg);
        this.dialogService.openWarning({
          simpleContent: ele.files[i].name + this.translate.manualTranslate(errorMsg) + this.config.uploadImgSize + 'MB',
        });
        return false;
      }
    }
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
          btnEvent: 'newUploadFile'
        }
      ]
    });
  }


  /**
   * 新建文件
   * @param param
   */
  createNewFolder(event: any, param: any) {
    event.stopPropagation();
    let createFolderInfo: any = this.typeService.clone(this.currentFolderInfo);
    if (param === this.newFold) {
      let settings = {
        mode: '2',
        title: '',
        isSimpleContent: false,
        componentSelector: 'new-folder',
        componentData: createFolderInfo,
        titleDesc: [
          'Authorize permission for',
          'users',
          'by their difference function'
        ],
        buttons: [
          {type: 'cancel'},
          {
            btnEvent: 'newTheFolder'
          }
        ],
      };
      this.dialogService.openNew(settings);
    }
  }

  /**
   * 显示文件夹信息
   */
  showCurrentFolderIn(current: any, parent: any) {
    if (current) {
      this.folderInfo = current;
      this.currentFolderInfo.pdid = current.id;
      this.currentFolderInfo.form = current.type;
      this.currentFolderInfo.path = current.path;
      this.currentFolderInfo.parentName = current.name;
      this.isTopFolder = (current.chn === -1);
    }
    if (parent) {
      this.previousFolderInfo = parent;
    }
  }

  /**
   * 判断当前文件夹是否可以操作
   */
  judgeCanEdit(data: any) {
    this.isCanOperate = data;
  }

  /**
   * 批量删除文件/文件夹
   */
  deleteTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    for (let i in this.selectedInfo.folderArr) {
      if (parseInt(this.selectedInfo.folderArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to delete the file' + this.selectedInfo.folderArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.selectedInfo.fileArr) {
      if (parseInt(this.selectedInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to delete the file' + this.selectedInfo.fileArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    if (this.selectedInfo) {
      let settings = {
        mode: '1',
        title: 'REMOVE FILE OR FOLDER',
        isSimpleContent: true,
        simpleContent: 'Are you sure delete the file or folder?',
        buttons: [
          {type: 'cancel'},
          {
            type: 'delete',
            btnEvent: () => {
              this.folderModelService.deleteFolder({
                form: this.currentFolderInfo.form,
                did: this.selectedInfo.did,
                fid: this.selectedInfo.fid,
              }, (data: any) => {
                if (data.status == 1) {
                  this.notificationService.postNotification({
                    act: this.notificationService.config.ACTION_DELETE_FILE,
                    data: this.selectedInfo.allFile
                  });
                  this.isMultipleSelect = false;
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
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'No file selected!'
      };
      this.dialogService.openWarning(settings);
    }
  }

  /**
   * 批量文件/文件夹PIN
   */
  pinTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    let count: number = 0;
    let way: string;
    for (let i in this.selectedInfo.folderArr) {
      if (this.selectedInfo.folderArr[i].is_starred === 1) {
        count++;
      }
    }
    if (count === this.selectedInfo.folderArr.length) {
      way = 'del'
    } else {
      way = 'add'
    }
    this.folderModelService.folderStarred({
      form: this.currentFolderInfo.form,
      did: this.selectedInfo.did,
      way: way
    }, (data: any) => {
      if (data.status === 1) {
        this.notificationService.postNotification({
          act: this.notificationService.config.ACTION_STARRED_FILE,
          data: {
            file: this.selectedInfo.allFile,
            way: way
          }
        });
        this.isMultipleSelect = false;
      }
    })
  }

  /**
   * 点击复制文件/文件夹
   */
  copyTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    for (let i in this.selectedInfo.folderArr) {
      if (parseInt(this.selectedInfo.folderArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to copy the file' + this.selectedInfo.folderArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.selectedInfo.fileArr) {
      if (parseInt(this.selectedInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to copy the file' + this.selectedInfo.fileArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    this.pasteInfo.did = [];
    this.pasteInfo.fid = [];
    this.isMultipleSelect = false;
    this.isHasPasteFile = true;
    this.isClipboardContent = true;
    this.pasteInfo = {
      did: this.selectedInfo.did,
      fid: this.selectedInfo.fid,
      form: this.currentFolderInfo.form
    };
  }


  /**
   * 点击粘贴文件/文件夹
   * @param event
   */
  pasteTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    this.isHasPasteFile = false;
    this.isClipboardContent = false;
    this.folderModelService.folderCopy({
        did: this.pasteInfo.did,
        fid: this.pasteInfo.fid,
        pdid: this.currentFolderInfo.pdid,
        form: this.currentFolderInfo.form,
        path: this.folderInfo.path
      }, (res: any) => {
        if (res.status == 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_PASTE_FILE,
            data: res.data ? res.data : []
          });
          let settings = {
            simpleContent: 'paste file success!'
          };
          this.dialogService.openSuccess(settings);
        } else {
          this.dialogService.openWarning({simpleContent: 'paste file failed!'})
        }
      }
    );
  }

  /**
   * 下载文件
   */
  downloadTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    let sessionId = this.userDataService.getSessionId();
    for (let i = 0; i < this.selectedInfo.fileArr.length; i++) {
      if (parseInt(this.selectedInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to download the file' + this.selectedInfo.fileArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
      this.downloadService.downloadTheFile(this.config.resourceFolderDomain + this.downLoadUrl + '?form=' +
        this.selectedInfo.fileArr[i].type + '&fid=' + this.selectedInfo.fileArr[i].id + '&session_id=' + sessionId)
    }
  }

  /**
   * 转让文件/文件夹
   */
  transferTheFile(event: any) {
    event.stopPropagation();
    if (this.selectedInfo) {
      for (let i in this.selectedInfo.folderArr) {
        if (this.selectedInfo.folderArr[i].owner !== this.userDataService.getCurrentUUID()
          && this.selectedInfo.folderArr[i].owner !== this.userDataService.getCurrentCompanyPSID()) {
          let settings = {
            title: 'Notice!',
            isSimpleContent: true,
            simpleContent: 'you are not the owner of' + this.selectedInfo.folderArr[i].name,
          };
          this.dialogService.openWarning(settings);
          return false;
        }
      }
      for (let i in this.selectedInfo.fileArr) {
        if (this.selectedInfo.fileArr[i].owner !== this.userDataService.getCurrentUUID()
          && this.selectedInfo.fileArr[i].owner !== this.userDataService.getCurrentCompanyPSID()) {
          let settings = {
            title: 'Notice!',
            isSimpleContent: true,
            simpleContent: 'you are not the owner of' + this.selectedInfo.fileArr[i].name,
          };
          this.dialogService.openWarning(settings);
          return false;
        }
      }
      let transferData: any = this.typeService.clone(this.selectedInfo);
      transferData.form = this.currentFolderInfo.form;
      this.dialogService.openNew({
        mode: '1',
        title: 'TRANSFER SELECTED',
        isSimpleContent: false,
        componentSelector: 'folder-transfer',
        componentData: transferData,
        buttons: [
          {type: 'cancel'},
          {
            type: 'send',
            btnText: 'TRANSFER',
            btnEvent: 'transferTheFile'
          }
        ]
      });
    }
  }


  /**
   * 分享这个文件
   */
  shareTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    let shareData: any = this.typeService.clone(this.selectedInfo);
    shareData.form = this.currentFolderInfo.form;
    this.dialogService.openNew({
      mode: '1',
      title: 'SHARE SELECTED',
      isSimpleContent: false,
      componentSelector: 'folder-share',
      componentData: shareData,
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'SHARE',
          btnEvent: 'shareTheFile'
        }
      ]
    });
  }

  /**
   * 移动文件/文件夹
   */
  moveTheFile(event: any) {
    event.stopPropagation();
    if (!this.selectedInfo) return;
    for (let i in this.selectedInfo.folderArr) {
      if (parseInt(this.selectedInfo.folderArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to move the file' + this.selectedInfo.folderArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.selectedInfo.fileArr) {
      if (parseInt(this.selectedInfo.fileArr[i].op) < parseInt(FolderConstant.PERMISSION_FOLDER_CONTROL_ID)) {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'you do not have permission to move the file' + this.selectedInfo.fileArr[i].name,
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    this.currentFolderInfo.folderPath = this.currentFolderInfo.path;
    let moveFileData = {
      file: this.selectedInfo,
      model: 'multiple',
      form: this.currentFolderInfo.form,
      currentFolder: this.currentFolderInfo,
    };
    let setOptionData = this.typeService.clone(moveFileData);
    let settings = {
      mode: '3',
      title: 'MOVE',
      isSimpleContent: false,
      componentSelector: 'folder-move',
      componentData: setOptionData,
      buttons: [{
        type: 'ok',
        btnEvent: 'confirmMoveTheFile',
      }],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 点击回到上一层目录
   */
  backPreviousFolder(event: any, data: any) {
    event.stopPropagation();
    data.form = data.type;
    this.doGoPreviousFolder.emit(data);
  }


  /**
   * 关闭文件管理器
   */
  closeTheFolder(event: any) {
    this.router.navigate(['/user/index']);
  }

  /**
   * 按照名字搜索文件
   */
  keyPressEvent(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      if (this.searchKeyWords == '') {
        let settings = {
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'search words can not be empty!',
        };
        this.dialogService.openWarning(settings);
      } else {
        if (this.isInSearchPartByExt || this.shareFilePart) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_FILTE_FILE_IN_EXT,
            data: this.searchKeyWords
          });
        } else {
          if (this.activatedRoute.params['value']['folderForm'] !== 'searchResult') {
            this.beforeSearchUrl = {
              params: this.activatedRoute.params['value']['folderForm'],
              queryParams: this.activatedRoute.queryParams['value']
            };
          }
          let path: any = this.currentFolderInfo.path ? this.currentFolderInfo : '/';
          this.doSearchFile.emit([this.searchKeyWords, this.currentFolderInfo.form ? this.currentFolderInfo.form : 1, path]);
        }
      }
    }
  }

  /**
   * 取消搜索  并且跳转回搜索前的路由
   */
  clearInputValue(event: any) {
    event.stopPropagation();
    this.searchKeyWords = '';
    if (this.isInSearchPartByExt || this.shareFilePart) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_FILTE_FILE_IN_EXT,
        data: this.searchKeyWords
      });
    } else {
      if (this.activatedRoute.params['value']['folderForm'] == 'searchResult' && this.beforeSearchUrl) {
        let routerObj: any = {queryParams: this.beforeSearchUrl.queryParams};
        this.router.navigate(['/folder/' + this.beforeSearchUrl.params], routerObj);
      }
    }
  }


//获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
    this.isHaveCompany = this.companyDataService.getCurrentCompanyCID() != '';
  }

  /**
   * 打开聊天窗
   * @param event
   */
  openChat(event: MouseEvent) {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG
    })
  }

  /**
   * 点击按钮出帮助信息
   */
  showFolderHelp(event: any) {
    event.stopPropagation();
    this.doShoWHelp.emit();
  }


}
