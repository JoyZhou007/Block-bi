import {
  Component,
  OnInit,
  ViewChild,
  Input,
  EventEmitter,
  Output,
  Inject,
  ElementRef,
  Renderer,
  HostListener, ViewContainerRef
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import * as FolderConstant from '../../shared/config/folder.config';
import * as MissionConstant from '../../shared/config/mission.config';
import {FolderModelService, DownloadService}from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'folder-content',
  templateUrl: '../template/folder-content.component.html',
})

export class FolderContentComponent implements OnInit {

  public fileList: Array<any> = [];
  public chooseFileList: Array<any> = [];
  private allFileListFormApi: Array<any> = [];
  public isShowSelectType: boolean = false;
  public currentFolder: any = {};
  public currentForm: number = 1;
  public originalFolderName: any;
  public isShowInput: boolean = false;
  public transferFileData: any;
  public moveFileData: any;
  public isStartChoose: boolean = false;
  public startPositionX: number;
  public startPositionY: number;
  public allFileLi: Array<any> = [];
  public fileTypeList: Array<any> = []
  public fileType: string = 'Type';
  public sessionId: string;
  public isShowBigView: boolean = true;
  private userData: any;
  public isAllSelected: boolean = false;
  public allFileCount: number = 0;  //当前文件夹下的 所有文件和文件夹总数
  public selectFileCount: number = 0; //选中的文件数量
  public selectInfoArr: Array<any>;
  public selectFileInfo: any;
  public downLoadUrl: string = 'api/folder/download-file';
  public isShowSwitchBtn: boolean = false;
  public isShowPersonalResult: boolean = true;
  public isGlobalSearch: boolean = true;
  public searchFolderResult: any = {};
  public isHaveCompany: boolean;
  public isInLeftSearchList: boolean = false;
  public isInKeywordSearchList: boolean = false;
  public shareFilePart: boolean = false;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public isLoadingFile: boolean = false;
  private currentFileIndex: number = 0;
  public folderArrange: boolean = true;
  private fullPathArray: Array<string> = [];

  @ViewChild('bigContent') public bigContent: ElementRef;
  @ViewChild('listContent') public listContent: ElementRef;
  @ViewChild('iconBtn') public iconBtn: ElementRef;
  @ViewChild('iconBtn1') public iconBtn1: ElementRef;
  @ViewChild('myTargetDiv', {read: ViewContainerRef}) myTooTipTargetDiv;


  @Output() public enterFolderIn = new EventEmitter<any>();
  @Output() public doSelectChange = new EventEmitter<any>();
  @Output() public outputSwitchFolderPath = new EventEmitter<any>();
  @Output() public outDealDropEvent = new EventEmitter<any>();
  private hasSelect: boolean;
  private currentHoverFile: any = {};
  private timer: any;
  private bindPagingEvent: boolean;
  private subscription: Subscription;
  private temporaryFileArray: Array<any> = [];
  private isShowSearchResultPath: boolean;
  private isKeyboardEvent: boolean;

  constructor(public el: ElementRef,
              public renderer: Renderer,
              public router: Router,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('app.config') public config: any,
              @Inject('date.service') public dateService: any,
              public folderModelService: FolderModelService,
              public downloadService: DownloadService,
              public activatedRoute: ActivatedRoute) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  @Input() set setFileList(param: any) {
    if (param.isDeleteFolder) {
      this.bindPagingEvent = false;
      this.chooseFileList = this.typeService.clone(param.fileList);
      this.allFileListFormApi = this.typeService.clone(param.fileList);
      this.fileList = param.fileList.slice(0, this.currentFileIndex + 100);
    } else {
      this.currentFileIndex = 0;
      this.bindPagingEvent = false;
      this.chooseFileList = this.typeService.clone(param.fileList);
      this.allFileListFormApi = this.typeService.clone(param.fileList);
      this.fileList = param.fileList.slice(this.currentFileIndex, this.currentFileIndex + 100);
      this.currentFileIndex += 100;
    }
    this.dealFileListDataForTemplate();
  }


  //初始化页面后
  ngOnInit() {
    this.getUserIn();
    this.clearInfo();
    this.fileTypeList = this.getFileTypeList();
    this.selectFileInfo = {
      fileArr: [],
      folderArr: [],
      did: [],
      fid: [],
      allFile: []
    };
  }

  ngAfterViewChecked() {
    if (this.bigContent && this.listContent) {
      let element: any;
      if (this.isShowBigView) {
        element = this.bigContent.nativeElement;
      } else {
        element = this.listContent.nativeElement;
      }
      if (!this.bindPagingEvent && element) {
        this.mouseWheelFunc(element);
        this.bindPagingEvent = true;
      }
    }
  }

  /**
   * 处理通知消息
   */
  dealMessage(message: any) {
    switch (message.act) {
      //新建文件夹
      case this.notificationService.config.ACTION_FILTE_FILE_IN_EXT:
        this.filterByKeyWords(message.data);
        break;
      default:
        break;
    }
  }


  /**
   * 在左侧列表为按照文件类型过滤过的目录下按照关键字筛选文件
   * @param keywords
   */
  filterByKeyWords(keywords: string) {
    let tempFile: any = this.typeService.clone(this.temporaryFileArray);
    tempFile.forEach((ele: any) => {
      // 不要求精确匹配，使用!=而不是!==
      if (ele.hasOwnProperty('name')) {
        let name = ele.name.toLowerCase();
        let filter = keywords.toLowerCase();
        ele.hasFiltered = name.indexOf(filter) == '-1';
      }
    });
    this.fileList = [];
    for (let i in tempFile) {
      if (!tempFile[i].hasFiltered) {
        this.fileList.push(tempFile[i])
      }
    }
  }


  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //标准浏览器
    ele.addEventListener('mousewheel', (event: any) => {
      let scrollTop: number = ele.scrollTop;
      let scrollHeight: number = ele.scrollHeight;
      let clientHeight: number = ele.clientHeight;
      if (event.wheelDelta < 0 &&
        scrollHeight - clientHeight - scrollTop < 500 && this.currentFileIndex < this.allFileListFormApi.length) {
        this.fileList = this.fileList.concat(this.allFileListFormApi.slice(this.currentFileIndex, this.currentFileIndex + 100))
        this.currentFileIndex += 100;
        this.dealFileListDataForTemplate();
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      let scrollTop: number = ele.scrollTop;
      let scrollHeight: number = ele.scrollHeight;
      let clientHeight: number = ele.clientHeight;
      if (event.wheelDelta < 0 &&
        scrollHeight - clientHeight - scrollTop < 500 && this.currentFileIndex < this.allFileListFormApi.length) {
        this.fileList = this.fileList.concat(this.allFileListFormApi.slice(this.currentFileIndex, this.currentFileIndex + 100))
        this.currentFileIndex += 100;
        this.dealFileListDataForTemplate();
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      let scrollTop: number = ele.scrollTop;
      let scrollHeight: number = ele.scrollHeight;
      let clientHeight: number = ele.clientHeight;
      if (event.wheelDelta < 0 &&
        scrollHeight - clientHeight - scrollTop < 500 && this.currentFileIndex < this.allFileListFormApi.length) {
        this.fileList = this.fileList.concat(this.allFileListFormApi.slice(this.currentFileIndex, this.currentFileIndex + 100))
        this.currentFileIndex += 100;
        this.dealFileListDataForTemplate();
      }
    });
  }


  /**
   * 获得文件类型列表
   */
  getFileTypeList(): Array<{key: any}> {
    return [
      {
        key: FolderConstant.FOLDER_TYPE_All
      },
      {
        key: FolderConstant.FOLDER_TYPE_FOLDER
      },
      {
        key: FolderConstant.FOLDER_TYPE_INFORMATION
      },
      {
        key: FolderConstant.FOLDER_TYPE_ANALYSIS
      },
      {
        key: FolderConstant.FOLDER_TYPE_POST
      },
      {
        key: FolderConstant.FOLDER_TYPE_EXCEL
      },
      {
        key: FolderConstant.FOLDER_TYPE_WORD
      },
      {
        key: FolderConstant.FOLDER_TYPE_PPT
      },
      {
        key: FolderConstant.FOLDER_TYPE_IMAGE
      },
      {
        key: FolderConstant.FOLDER_TYPE_PIN
      },
      {
        key: FolderConstant.FOLDER_TYPE_PDF
      },
      {
        key: FolderConstant.FOLDER_TYPE_OTHER
      },
    ];
  }


  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowSelectType = false;
    this.isShowInput = false;
    this.hasSelect = false;
  }


  /**
   * 将格式化事件转化为事件戳和当前时区的时间 并且 处理用户owner对象
   */
  dealFileListDataForTemplate() {
    for (let i in this.fileList) {
      this.fileList[i].createTimestamp = new Date(this.fileList[i].created).getTime();
      this.fileList[i].updateTimestamp = new Date(this.fileList[i].updated).getTime();
      let startDayTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'ddS');
      let startMonthTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'mmm');
      let startYearTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'yyyy');
      let startWeekTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'dddd');
      let startHourTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'HH');
      let startMinuteTime = this.dateService.formatWithTimezone(this.fileList[i].updated, 'MM');
      this.fileList[i].formatDate = {
        day: startDayTime,
        week: startWeekTime,
        month: startMonthTime,
        minute: startMinuteTime,
        hour: startHourTime,
        year: startYearTime
      };
      //处理owner用户对象
      let owner: any = {
        id: this.fileList[i].owner,
        profile: this.fileList[i].profile
      };
      this.fileList[i].ownerInfo = owner;


    }
  }

  /**
   * 清除信息
   * @param param
   */
  clearInfo() {
    this.transferFileData = {};
    this.moveFileData = {};
    this.selectInfoArr = [];
    this.selectFileCount = 0;
    this.isAllSelected = false;
    this.isStartChoose = false;
    this.fileType = 'Type';
    for (let i = 0; i < this.fileList.length; i++) {
      this.fileList[i].isSelect = false;
      this.isAllSelected = false;
      this.selectFileCount = 0;
    }
    for (let i = 0; i < this.chooseFileList.length; i++) {
      this.chooseFileList[i].isSelect = false;
      this.isAllSelected = false;
      this.selectFileCount = 0;
    }
    if (this.iconBtn) {
      this.renderer.setElementStyle(this.iconBtn.nativeElement, 'display', 'none');
      this.renderer.setElementStyle(this.iconBtn1.nativeElement, 'display', 'none');
    }
  }


  /**
   * 切换列表视图/平铺视图
   */
  switchFolderView(param: any) {
    this.isShowBigView = !param;
    this.bindPagingEvent = false;
  }

  /**
   * 切换工作个人
   */
  switchContentFolderType(folder: any) {
    this.currentFolder = folder;
    this.currentForm = folder.form;
  }


  /**
   * 点击进入点中的文件夹
   */
  enterTheFolder(data: any, event?: any) {
    data.form = data.type;
    event.stopPropagation();
    if (data.is_dir == 1) {
      this.enterFolderIn.emit(data);
      this.clearInfo();
    } else {
      this.selectCurrent(data, event);
    }
  }

  /**
   * 点击显示文件筛选类型下拉菜单
   */
  showSelectType(event: any) {
    event.stopPropagation();
    this.isShowSelectType = !this.isShowSelectType;
  }

  /**
   * 筛选文件类型
   */
  doChooseFileType(event: any, fileType: any) {
    event.stopPropagation();
    this.fileList = [];
    this.fileType = fileType;
    this.isShowSelectType = false;
    for (let i = 0; i < this.chooseFileList.length; i++) {
      this.chooseFileList[i].isSelect = false;
      this.isAllSelected = false;
      this.selectFileCount = 0;
      if (this.fileType === 'All') {
        this.fileList.push(this.chooseFileList[i])
      } else {
        if (this.chooseFileList[i].ext_type.toLowerCase() === this.fileType.toLowerCase()) {
          this.fileList.push(this.chooseFileList[i])
        }
      }
    }
    this.getSelectFileInfo();
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
   * 平铺的视图下 选择/当前文件
   */
  selectCurrent(data: any, event: any) {
    event.stopPropagation();
    if (data.isSelect) {
      data.isSelect = false;
      this.isAllSelected = false;
    } else {
      data.isSelect = true;
    }
    this.getSelectFileInfo();
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
    this.doSelectChange.emit(this.selectFileInfo);
    this.selectFileCount = this.selectInfoArr.length;
    if (this.selectInfoArr.length === this.allFileCount) {
      this.isAllSelected = true;
    } else {
      this.isAllSelected = false;
    }
    this.notificationService.postNotification({
      act: this.notificationService.config.ACTION_FILE_CHOOSE_CHANGE,
      data: this.selectInfoArr
    });
    // 如果只选中了一个文件 并且 在搜索的目录下 显示文件路劲
    if (this.selectFileCount == 1 && (this.isInLeftSearchList || this.isInKeywordSearchList)) {
      this.folderModelService.folderFullPath({
        form: this.selectInfoArr[0].type,
        is_dir: this.selectInfoArr[0].is_dir,
        id: this.selectInfoArr[0].id,
      }, (res: any) => {
        if (res.status == 1) {
          this.dealSearchFullPath(res.data.full_path);
          this.isShowSearchResultPath = true;
        } else {
          this.dialogService.openWarning({simpleContent: 'fetch file full path failed!'})
        }
      })
    } else {
      this.isShowSearchResultPath = false;
    }


  };

  /**
   * 鼠标划入显示操作悬浮操作按钮的 button列表
   */
  mouseEnter(li: any, ul: any, btn: any, event: any, file: any, bigContent: any, bool: boolean) {
    event.stopPropagation();
    clearTimeout(this.timer);
    if (this.selectInfoArr.length) {
      this.renderer.setElementStyle(btn, 'display', 'none');
      return;
    }
    if (file.chn === 1 || file.chn === 2 || file.chn === 3) {
      this.renderer.setElementStyle(btn, 'display', 'none');
      return false;
    }
    this.currentHoverFile = file;
    if (!this.isStartChoose) {
      this.renderer.setElementStyle(btn, 'display', 'block');
      this.renderer.setElementStyle(btn, 'z-index', '20');
      if (bool) {
        this.renderer.setElementStyle(btn, 'top', li.offsetTop + 95 - bigContent.scrollTop + 'px');
        if ((ul.offsetWidth + 251) - (li.offsetLeft) < 400) {
          this.renderer.setElementStyle(btn, 'left', li.offsetLeft + 220 + 'px');
        } else {
          this.renderer.setElementStyle(btn, 'left', li.offsetLeft + 220 + 'px');
        }
      } else {
        this.renderer.setElementStyle(btn, 'top', li.offsetTop + 145 - bigContent.scrollTop + 'px');
        this.renderer.setElementStyle(btn, 'left', li.offsetLeft + 600 + 'px');
      }
    }

  }


  /**
   * 鼠标进去悬浮菜单
   * @param btn
   */
  mouseEnterBtn(btn: any) {
    clearTimeout(this.timer);
    this.renderer.setElementStyle(btn, 'display', 'block');
  }

  /**
   * 鼠标离开悬浮菜单
   * @param btn
   */
  mouseLeaveBtn(btn: any) {
    this.renderer.setElementStyle(btn, 'display', 'none');
  }


  /**
   * 鼠标离开隐藏操作按钮
   * @param btn
   * @param event
   */
  mouseLeave(btn: any, event: any) {
    event.stopPropagation();
    // clearTimeout(this.searchTime);
    // this.isShowSearchResultPath = false;
    this.timer = setTimeout(() => {
      this.renderer.setElementStyle(btn, 'display', 'none');
    }, 200);
  }


  /**
   * 处理search 文件全路径的显示
   */
  dealSearchFullPath(full_path: string) {
    let fullPath = full_path.substring(1, full_path.length);
    this.fullPathArray = fullPath.split('/');
  }


  /**
   * 删除当前文件
   */
  deleteTheFile(event: any) {
    let file = this.currentHoverFile;
    event.stopPropagation();
    if (file.op === FolderConstant.PERMISSION_FOLDER_CONTROL_ID) {
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
              let did: Array<any> = [];
              let fid: Array<any> = [];
              if (file.is_dir === 1) {
                did.push(file.id);
              } else if (file.is_dir === 0) {
                fid.push(file.id);
              }
              this.folderModelService.deleteFolder({
                form: this.currentForm,
                did: did,
                fid: fid,
              }, (res: any) => {
                if (res.status == 1) {
                  this.notificationService.postNotification({
                    act: this.notificationService.config.ACTION_DELETE_FILE,
                    data: [file]
                  });
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
   * 接受drop的文件列表
   */
  dealDropEvent(data: any) {
    if (data) {
      this.outDealDropEvent.emit(data);
    }
  }

  /**
   * 鼠标框选文件/文件夹
   */
  // 鼠标按下开始框选
  startChoose(event: any, ul: any, fileContent: any, selectBox: any) {
    if (this.element.hasClass(event.target, 'selectBtn'))  return false;
    if (event.which === 1) {
      //在元素界面上覆盖一层蒙版
      this.isStartChoose = true;
      this.allFileLi = ul.children;
      this.startPositionX = event.pageX - 267;
      this.startPositionY = event.pageY - 131 + fileContent.scrollTop;
      document.onmousemove = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        if (this.isStartChoose && !this.isShowInput) {
          this.renderer.setElementStyle
          (selectBox, 'left', Math.min(event.pageX - 267, this.startPositionX) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'top', Math.min(event.pageY - 131 + fileContent.scrollTop, this.startPositionY) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'width', Math.abs(event.pageX - 267 - this.startPositionX) + 'px');
          this.renderer.setElementStyle
          (selectBox, 'height', (Math.abs(event.pageY - 131 - this.startPositionY + fileContent.scrollTop) + 'px'));
          this.renderer.setElementStyle(selectBox, 'display', 'block');
          this.renderer.setElementStyle(selectBox, 'background', '#7078F7');
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
        // if ((Math.abs(event.pageX - 267 - this.startPositionX)) < 2) {
        //   for (let i in this.fileList) {
        //     this.fileList[i].isSelect = false;
        //   }
        //   this.getSelectFileInfo();
        // }
      }
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
   * 点击文件的name显示文件的编辑框
   */
  modifyFileName(data: any, event: any, ele: any) {
    event.stopPropagation();
    if (data.op === FolderConstant.PERMISSION_FOLDER_CONTROL_ID && data.chn == 0) {
      this.isShowInput = true;
      data.isShowInput = true;
      setTimeout(() => {
        ele.focus();
      });
      this.originalFolderName = data.name;
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'you do not have permission rename the file!'
      };
      this.dialogService.openWarning(settings);
    }
  }


  /**
   * 光标离开
   * @param data
   * @param event
   */
  doReName(data: any, event: any) {
    if (!this.isKeyboardEvent) {
      this.ensureReName(data, event)
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
    if (newName === '' || newName === this.originalFolderName) {
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
        form: this.currentForm,
        name: newName
      }, (res: any) => {
        if (res.status === 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_RENAME_FILE,
            data: this.currentFolder
          });
          data.name = res.data.filename;
        } else {
          this.dialogService.openWarning({simpleContent: 'rename file/folder failed!'})
          data.name = this.originalFolderName;
        }
        this.isKeyboardEvent = false;
      })
    }
    this.isShowInput = false;
  }

  /**
   * 复制文件
   */
  copyTheFile(event: any) {
    event.stopPropagation();
    let data = this.currentHoverFile;
    if (parseInt(data.op) >= parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACTION_COPY_FILE,
        data: data
      });

      if (this.isInLeftSearchList) {
        let simpleContent: string = data.type == 1 ? 'please go to personal folder paste the file!' : 'please go to business folder paste the file!';
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: simpleContent
        };
        this.dialogService.openWarning(settings);
      }
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'you do not have permission to copy the file!'
      };
      this.dialogService.openWarning(settings);
    }
  }

  /**
   * 给文件打标记
   */
  pinTheFile(event: any) {
    let data = this.currentHoverFile;
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
      }, (res: any) => {
        if (res.status === 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACTION_STARRED_FILE,
            data: {
              file: [data],
              way: way
            }
          });
        }
      })
    }
  }


  /**
   * 下载文件
   */
  downloadTheFile(event: any) {
    event.stopPropagation();
    let data = this.currentHoverFile;
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
          data.type + '&fid=' + data.id + '&session_id=' + this.sessionId);
      }
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'you do not have permission to download the file'
      };
      this.dialogService.openWarning(settings);
    }
  }


  /**
   * 阻止事件冒泡
   */
  stopPropagation(event: any) {
    event.stopPropagation();
  }


  /**
   * 转让文件
   */
  transferTheFile(event: any) {
    event.stopPropagation();
    if (this.currentFolder.chn == 2) {
      this.dialogService.openWarning({simpleContent: 'you can not transfer file in chat folder!'});
      return false;
    }
    if (this.currentFolder.chn == 3) {
      this.dialogService.openWarning({simpleContent: 'you can not transfer file in mission folder!'});
      return false;
    }
    let data = this.currentHoverFile;
    if (data.owner === this.userDataService.getCurrentUUID() || data.owner === this.userDataService.getCurrentCompanyPSID()) {
      let transferData: any = this.typeService.clone(this.selectFileInfo);
      if (data.is_dir === 1) {
        transferData.did = [];
        transferData.did.push(data.id);
      } else if (data.is_dir === 0) {
        transferData.fid = [];
        transferData.fid.push(data.id);
      }
      transferData.allFile = [];
      transferData.allFile.push(data);
      transferData.form = this.currentForm;
      this.dialogService.openNew({
        mode: '1',
        title: data.is_dir === 1 ? 'TRANSFER FOLDER' : 'TRANSFER FILE',
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
    } else {
      this.dialogService.openWarning({simpleContent: 'you do not have permission to transfer the file!'});
    }
  }

  /**
   * 移动文件
   */
  moveTheFile(event: any) {
    let data = this.currentHoverFile;
    this.currentFolder.pdid = this.currentFolder.id;
    event.stopPropagation();
    if (parseInt(data.op) >= parseInt(FolderConstant.PERMISSION_FOLDER_WRITE_ID)) {
      let moveFileData = {
        file: data,
        model: 'single',
        form: this.currentForm,
        currentFolder: this.currentFolder,
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
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'you do not have permission to move the file!'
      };
      this.dialogService.openWarning(settings);
    }
  }

  /**
   * 分享这个文件
   */
  shareTheFile(event: any) {
    event.stopPropagation();
    let data = this.currentHoverFile;
    let shareData: any = this.typeService.clone(this.selectFileInfo);
    shareData.did = [];
    shareData.fid = [];
    if (data.is_dir === 1) {
      shareData.did.push(data.id);
    } else if (data.is_dir === 0) {
      shareData.fid.push(data.id);
    }
    shareData.allFile = [];
    shareData.allFile.push(data);
    shareData.form = this.currentForm;
    this.dialogService.openNew({
      mode: '1',
      title: data.is_dir === 1 ? 'SHARE FOLDER' : 'SHARE FILE',
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
   * 对当前目录下文件进行排序
   */
  sortTheFile(event: any, type: number) {
    event.stopPropagation();
    if (type === 1) {
      for (let i = 0; i < this.fileList.length; i++) {
        for (let j = 0; j < this.fileList.length - i - 1; j++) {
          if (this.fileList[j].updateTimestamp > this.fileList[j + 1].updateTimestamp) {
            let temp = this.fileList[j + 1];
            this.fileList[j + 1] = this.fileList[j];
            this.fileList[j] = temp;
          }
        }
      }
      this.folderArrange = false;
    } else if (type === -1) {
      for (let i = 0; i < this.fileList.length; i++) {
        for (let j = 0; j < this.fileList.length - i - 1; j++) {
          if (this.fileList[j].updateTimestamp < this.fileList[j + 1].updateTimestamp) {
            let temp = this.fileList[j + 1];
            this.fileList[j + 1] = this.fileList[j];
            this.fileList[j] = temp;
          }
        }
      }
      this.folderArrange = true;
    }
  }

  /**
   * 切换搜索结果form(个人/商业)
   */
  switchSearchForm(event: any, bool: boolean) {
    event.stopPropagation();
    this.isShowPersonalResult = bool;
    this.currentForm = bool ? 1 : 2;
    if (this.isShowPersonalResult) {
      this.fileList = [];
      if (this.searchFolderResult['1']) {
        for (let i in this.searchFolderResult['1']) {
          this.fileList.push(this.searchFolderResult['1'][i])
        }
      }
    } else if (!this.isShowPersonalResult) {
      this.fileList = [];
      if (this.searchFolderResult['2']) {
        for (let i in this.searchFolderResult['2']) {
          this.fileList.push(this.searchFolderResult['2'][i])
        }
      }
    }
    this.temporaryFileArray = this.typeService.clone(this.fileList);
  }

  /**
   * keyword 搜索情况下 切换 全局搜索还是当前目录搜素
   */
  switchSearchPath(event: any, bool: boolean) {
    event.stopPropagation();
    this.isGlobalSearch = bool;
    this.outputSwitchFolderPath.emit(bool);
  }


  /**
   * 删除/转移/转让文件 后的后续操作
   */
  followUpOperation(data: Array<any>) {
    for (let i  in data) {
      for (let k in this.fileList) {
        if (parseInt(this.fileList[k].id) == parseInt(data[i].id)) {
          this.fileList.splice(parseInt(k), 1);
        }
      }
      for (let k in this.chooseFileList) {
        if (parseInt(this.chooseFileList[k].id) == parseInt(data[i].id)) {
          this.chooseFileList.splice(parseInt(k), 1);
        }
      }
    }
  }


  /**
   * 文件上传后续处理
   */
  dealFileUploadOperation(data: any) {
    data.id = data.fid;
    this.fileList.push(data);
    this.chooseFileList.push(data);
  }


  /**
   * dealPinOperation
   */
  dealPinOperation(data: Array<any>, way: string) {
    for (let i  in data) {
      for (let k in this.fileList) {
        if (this.fileList[k].is_dir === 1 && parseInt(this.fileList[k].id) === parseInt(data[i].id)) {
          if (way === 'add') {
            this.fileList[k].is_starred = 1;
          } else if (way === 'del') {
            this.fileList[k].is_starred = 0;
          }
        }
      }
    }
  }

  /**
   * 处理粘贴后续操作
   */
  dealPasteOrNewOperation(data: any) {
    if (data[0] && parseInt(data[0].pdid) == parseInt(this.currentFolder.id)) {
      this.fileList = this.fileList.concat(data);
      this.chooseFileList = this.chooseFileList.concat(data);
    }
  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.isHaveCompany = this.companyDataService.getCurrentCompanyCID() != '';
  }

  keyUpEvent(file: any, event: any) {
    if (event.keyCode === 13) {
      this.isKeyboardEvent = true;
      this.ensureReName(file, event);
    }
  }

  /**
   * 默认页面新建文件夹
   */
  createNewFolder(param: number) {
    let createFolderInfo = {
      form: param,
      path: '/',
      parentName: param == 1 ? 'Personal Folder' : 'Work Folder',
      isDefaultPage: true
    };
    let settings = {
      mode: '2',
      title: '',
      isSimpleContent: false,
      componentSelector: 'new-folder',
      componentData: this.typeService.clone(createFolderInfo),
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