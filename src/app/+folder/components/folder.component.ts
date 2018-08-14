import {
  Component,
  OnInit,
  ViewChild,
  Inject, ViewEncapsulation, AfterContentInit, OnDestroy
} from '@angular/core';

import {
  ActivatedRoute, Router
} from '@angular/router';
import {
  FolderModelService, FolderInfo, FolderLists
}from '../../shared/services/index.service';
import {BehaviorSubject, Observable} from "rxjs";
import {Subscription} from "rxjs/Subscription";
import {UserModelService} from "../../shared/services/model/user-model.service";
import * as FolderConstant from '../../shared/config/folder.config';

let introInit = require('intro.js');

@Component({
  selector: 'folder',
  templateUrl: '../template/folder.component.html',
  styleUrls: ['../../../assets/css/folder/folder.css'],
  encapsulation: ViewEncapsulation.None,
})

export class FolderComponent implements OnInit, AfterContentInit, OnDestroy {

  @ViewChild('folderHeader') public folderHeader: any;
  @ViewChild('folderMenu') public folderMenu: any;
  @ViewChild('folderContent') public folderContent: any;

  public folderInfo: FolderInfo;   //当前文件目录下文件信息
  public previousFolderInfo: FolderInfo;  //上一层目录信息
  public userData: any;  //用户信息
  public companyData: any;  //公司信息
  public fileObj: any = {
    fileList: [],
    isDeleteFolder: false
  }; //当前文件文件对象信息
  public currentFolder: any;  //当前文件夹信息
  private isCanOperate: boolean = true;  //当前目录是否可以操作
  public selectedInfo: any;  //选中的文件信息
  private searchResult: any; //搜索结果
  public subscription: Subscription;
  private isDefaultPage: boolean = true; //是否是默认页面
  private currentPathFileArray: Array<any> = []; //当前path 下 文件列表数组集合 （作为临时保存用的）;
  private searchFileArray: Array<any> = [];  //保存搜索结果 （作为临时保存用的）;

  constructor(public router: Router,
              public userModelService: UserModelService,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('type.service') public typeService: any,
              public folderModelService: FolderModelService,
              public activatedRoute: ActivatedRoute) {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }


  ngAfterContentInit(): void {
    //router 变更事件
    Observable.combineLatest(this.activatedRoute.params, this.activatedRoute.queryParams).subscribe(bothParams => {
      let param = bothParams[0];
      let queryParam = bothParams[1];
      this.folderContent.clearInfo();
      if (param.hasOwnProperty('folderForm')) {
        if (param['folderForm'] === 'default') {
          this.isDefaultPage = true;
          this.folderContent.isDefaultPage = true;
          this.folderMenu.isDefaultPage = true;
          this.folderHeader.isDefaultPage = true;
        } else {
          this.isDefaultPage = false;
          this.folderContent.isDefaultPage = false;
          this.folderMenu.isDefaultPage = false;
          this.folderHeader.isDefaultPage = false;
        }
        if (param['folderForm'] === 'personal' && !queryParam.hasOwnProperty('ext')
          && !queryParam.hasOwnProperty('keywords') && !queryParam.hasOwnProperty('form')) { //个人性质的文件夹
          this.currentFolder.form = 1;
          this.currentFolder.folderPath = queryParam.hasOwnProperty('path') ? queryParam['path'] : '/';
          this.getFolderLists(this.currentFolder);
          this.folderHeader.isInSearchPart = false;
          this.folderHeader.isInSearchPartByExt = false;
          this.folderHeader.shareFilePart = false;
          this.folderContent.shareFilePart = false;
          this.folderHeader.isAbleShowPasteBtn = true;
          this.folderHeader.searchKeyWords = '';
          this.folderMenu.getCurrentType('Personal');
          this.folderContent.switchContentFolderType(this.currentFolder);
          this.folderContent.isShowSwitchBtn = false;
          this.folderContent.isInLeftSearchList = false;
          this.folderContent.isInKeywordSearchList = false;
        } else if (param['folderForm'] === 'business' && !queryParam.hasOwnProperty('ext')
          && !queryParam.hasOwnProperty('keywords') && !queryParam.hasOwnProperty('form')) { //工作性质文件夹下
          if (!this.userDataService.getCurrentCompanyPSID()) {  //没有公司返回没权限
            this.dialogService.openNoAccess()
          } else {
            this.currentFolder.form = 2;
            this.folderMenu.getCurrentType('Business');
            this.currentFolder.folderPath = queryParam.hasOwnProperty('path') ? queryParam['path'] : '/';
            this.getFolderLists(this.currentFolder);
            this.folderContent.switchContentFolderType(this.currentFolder);
            this.folderContent.isShowSwitchBtn = false;
            this.folderContent.isInLeftSearchList = false;
            this.folderContent.isInKeywordSearchList = false;
            this.folderHeader.searchKeyWords = '';
            this.folderHeader.isAbleShowPasteBtn = true;
            this.folderHeader.isInSearchPart = false;
            this.folderHeader.isInSearchPartBykeyword = false;
            this.folderHeader.isInSearchPartByExt = false;
            this.folderHeader.shareFilePart = false;
            this.folderContent.shareFilePart = false;
          }
        } else if (param['folderForm'] === 'searchResult' && queryParam.hasOwnProperty('ext')) { //左侧列表搜素
          this.searchTheFile(queryParam, 1);
          this.folderMenu.getCurrentType(queryParam['ext']);
          this.folderContent.isShowSwitchBtn = true;
          this.folderContent.isInLeftSearchList = true;
          this.folderContent.isInKeywordSearchList = false;
          this.folderHeader.searchKeyWords = '';
          this.folderHeader.isCanOperate = false;
          this.folderHeader.isAbleShowPasteBtn = false;
          this.folderHeader.isInSearchPartBykeyword = false;
          this.folderHeader.isInSearchPartByExt = true;
          this.folderHeader.shareFilePart = false;
          this.folderContent.shareFilePart = false;
        } else if (param['folderForm'] === 'searchResult' && queryParam.hasOwnProperty('keywords')) {  //关键字搜索的路由
          this.searchTheFile(queryParam, 2);
          this.folderContent.isShowSwitchBtn = false;
          this.folderContent.isInLeftSearchList = false;
          this.folderContent.isInKeywordSearchList = true;
          this.folderHeader.searchKeyWords = decodeURI(queryParam['keywords']);
          this.folderHeader.isCanOperate = false;
          this.folderHeader.isAbleShowPasteBtn = true;
          this.folderHeader.isInSearchPartBykeyword = true;
          this.folderHeader.isInSearchPartByExt = false;
          this.folderHeader.shareFilePart = false;
          this.folderContent.shareFilePart = false;
          if (queryParam['form'] === '1') {
            this.folderMenu.getCurrentType('Personal');
            this.currentFolder.form = 1;
            this.folderContent.switchContentFolderType(this.currentFolder);
          } else {
            this.folderMenu.getCurrentType('Business');
            this.currentFolder.form = 2;
            this.folderContent.switchContentFolderType(this.currentFolder);
          }
        } else if (param['folderForm'] === 'share' && queryParam.hasOwnProperty('form')) {  //查看自己的分享
          if (queryParam.hasOwnProperty('path')) {
            this.currentFolder.form = queryParam['form'];
            this.currentFolder.folderPath = queryParam['path'];
            this.getFolderLists(this.currentFolder, false, 1);
          } else {
            this.getYourShareFileFromApi(queryParam['form']);
          }
          if (queryParam['form'] == 1) {
            this.folderMenu.getCurrentType(FolderConstant.FOLDER_TYPE_PERSONAL_SHARE);
          } else if (queryParam['form'] == 2) {
            this.folderMenu.getCurrentType(FolderConstant.FOLDER_TYPE_BUSINESS_SHARE);
          }
          this.currentFolder.form = queryParam['form'];
          this.folderContent.switchContentFolderType(this.currentFolder);
          this.folderContent.clearInfo();
          this.folderHeader.isShowSearchForm = false;
          this.folderHeader.isCanOperate = false;
          this.folderHeader.isAbleShowPasteBtn = false;
          this.folderHeader.isInSearchPartBykeyword = false;
          this.folderHeader.isInSearchPartByExt = false;
          this.folderHeader.isCanOperate = false;
          this.folderHeader.shareFilePart = true;
          this.folderContent.shareFilePart = true;
          this.folderContent.isShowSwitchBtn = false;
          this.folderContent.isInLeftSearchList = false;
          this.folderContent.isInKeywordSearchList = false;
        }
      }
    });
  }

  //初始化页面后
  ngOnInit() {
    this.getUserIn();
    // this.initFolder();
    this.folderInfo = FolderInfo.init();
    this.previousFolderInfo = FolderInfo.init();
    this.currentFolder = {};
    this.isCanOperate = true;
    this.showFolderHelpDialog();
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 处理消息
   */
  dealMessage(message: any) {
    switch (message.act) {
      //新建文件夹
      case this.notificationService.config.ACTION_NEW_FOLDER:
        this.folderContent.dealPasteOrNewOperation(message.data);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      //粘贴文件或者文件夹
      case this.notificationService.config.ACTION_PASTE_FILE:
        this.folderMenu.getCurrentFolderSpace(this.currentFolder.form);
        this.folderContent.dealPasteOrNewOperation(message.data, true);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      // 删除文件或者文件夹  要重新拉接口获取列表
      case this.notificationService.config.ACTION_DELETE_FILE:
        if (this.folderContent.isInKeywordSearchList) {  //搜索结果目录下
          this.searchTheFile(this.activatedRoute['queryParams']['value'], 2)
        } else if (this.folderContent.isInLeftSearchList) {
          this.searchTheFile(this.activatedRoute['queryParams']['value'], 1)
        } else if (this.folderContent.shareFilePart) { //左侧share文件夹
          this.getYourShareFileFromApi(this.currentFolder.form);
        } else {  //普通文件夹
          this.getFolderLists(this.currentFolder, true);
          this.folderMenu.getCurrentFolderSpace(this.currentFolder.form);
        }
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      //转让文件
      case this.notificationService.config.ACTION_TRANSFER_FILE:
        this.folderContent.followUpOperation(message.data);
        this.folderMenu.getCurrentFolderSpace(this.currentFolder.form);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      //移动文件
      case this.notificationService.config.ACTION_MOVE_FILE:
        this.folderContent.followUpOperation(message.data);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      //标记
      case this.notificationService.config.ACTION_STARRED_FILE:
        this.folderContent.dealPinOperation(message.data.file, message.data.way);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      //上传文件
      case this.notificationService.config.ACTION_UPLOAD_FILE:
        this.folderContent.dealFileUploadOperation(message.data);
        this.folderMenu.getCurrentFolderSpace(this.currentFolder.form);
        this.folderContent.clearInfo();
        this.folderHeader.clearInfo();
        break;
      default:
        break;
    }
  }

  dealOutDealDropEvent(data: any) {
    if (this.folderHeader) {
      this.folderHeader.inputChangeEvent(data);
    }
  }


  /**
   初始化文件管理器
   */
  initFolder() {
    this.folderModelService.folderInit({
      form: 1
    }, (data: any) => {
      //获取成功
      if (data.status == 1) {

      } else {
        let settings = {
          title: 'Error!',
          isSimpleContent: true,
          simpleContent: 'init folder failed!'
        };
        this.dialogService.openError(settings);
      }
    });
  }

  /**
   * 获取文件列表
   * @param data  文件夹信息
   * @param isDeleteFolder 是否是删除文件后重新获取列表
   * @param isShare 是否是查看分享给别人的目录
   * @param callback
   */
  getFolderLists(data: any, isDeleteFolder?: boolean, isShare?: number, callback?: any) {
    this.folderContent.isLoadingFile = true;
    this.fileObj.fileList = [];
    this.folderContent.fileList = [];
    this.folderModelService.folderLists({
      form: data.form,
      path: data.hasOwnProperty('folderPath') ? data['folderPath'] : '/',
      is_share: isShare
    }, (data: any) => {
      if (data.status == 1) {
        let fileObj: any = {};
        fileObj.fileList = this.typeService.bindDataList(FolderLists.init(), data.data.sub);
        this.fileObj = this.typeService.clone(fileObj);
        this.fileObj.isDeleteFolder = isDeleteFolder;
        this.currentPathFileArray = this.typeService.clone(this.fileObj.fileList);  //临时保存当前目录下文件列表信息
        this.folderContent.temporaryFileArray = this.typeService.clone(this.fileObj.fileList);  //临时保存当前目录下文件列表信息
        this.folderContent.isBindEvent = false;
        this.typeService.bindData(this.folderInfo, data.data.current);
        this.folderContent.currentFolder.id = this.folderInfo.id;
        this.typeService.bindData(this.previousFolderInfo, data.data.parent);
        this.folderHeader.showCurrentFolderIn(this.folderInfo, this.previousFolderInfo);
        this.folderHeader.clearInfo();
        this.currentFolder.chn = this.folderInfo.chn;
        this.judgeTheFolder(this.currentFolder);
        if (callback) {
          callback(this.currentPathFileArray)
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'fetch file list failed!'})
      }
      setTimeout(() => {
        this.folderContent.isLoadingFile = false;
      }, 300);
    });
  }

  /**
   * 切换列表视图/平铺视图
   * @param type
   */
  switchTheFolderView(type: any) {
    this.folderContent.switchFolderView(type);
  }


  /**
   * 点击文件夹父级 => 路由跳转
   */
  enterFolder(data: any) {
    //判断是不是share文件夹 如果是share传 is_perm 传 2
    if (data.is_my_share) { //如果是分享
      this.currentFolder.id = data.id ? data.id : 0;
      let type = data.form == 1 ? 'personal' : 'business';
      let routerObj: any = {queryParams: {path: data.path, form: data.form}};
      this.router.navigate(['/folder/share'], routerObj);
    } else {  //如果是普通个人/商业目录
      this.currentFolder.id = data.id ? data.id : 0;
      let type = data.form == 1 ? 'personal' : 'business';
      let routerObj = data.path ? {queryParams: {path: data.path}} : {queryParams: {path: ('/')}};
      this.router.navigate(['/folder/' + type], routerObj);
    }
  }


  /**
   * 判断是否是默认的四个文件
   */
  judgeTheFolder(data: any) {
    if (data.chn === 1 || data.chn === 2 || data.chn === 3 || data.chn === 4) {
      this.isCanOperate = false;
    } else {
      this.isCanOperate = true;
    }
    this.folderHeader.judgeCanEdit(this.isCanOperate);
  }


  //获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.companyData = this.companyDataService.getLocationCompanyIn();
  }


  /**
   * 选择文件发生变化
   * @param data
   */
  selectedChange(data: any) {
    this.selectedInfo = data;
  }


  /**
   * 调用search 文件api接口
   */
  searchTheFile(data: any, type: number) {
    this.folderContent.isLoadingFile = true;
    let requestData: any = {
      keywords: type === 1 ? '' : decodeURI(data['keywords']),
      ext: type === 1 ? data['ext'] : '',
      form: type === 1 ? 0 : data['form']
    };
    this.folderModelService.fileSearch({
      data:requestData
    }, (res: any) => {
      if (res.status === 1) {
        let fileObj: any = {};
        this.fileObj.fileList = [];
        fileObj.fileList = [];
        this.searchResult = res.data;
        this.folderContent.searchFolderResult = res.data;
        if (type === 1) {
          if (this.searchResult['1']) {
            for (let j  in this.searchResult['1']) {
              fileObj.fileList.push(this.searchResult['1'][j])
            }
          }
        } else {
          for (let i in this.searchResult) {
            for (let j in this.searchResult[i]) {
              fileObj.fileList.push(this.searchResult[i][j])
            }
          }
        }
        this.fileObj = this.typeService.clone(fileObj);
        this.searchFileArray = this.typeService.clone(this.fileObj.fileList);
      } else {
        this.dialogService.openWarning({simpleContent: 'search file failed!'})
      }
      setTimeout(() => {
        this.folderContent.isLoadingFile = false;
      }, 300);
    });
  }


  /**
   * 文件名搜索
   */
  searchFileByKeyWords(data: any) {
    let routerObj: any = {queryParams: {keywords: encodeURI(data[0]), form: data[1], path: data[2]}};
    this.router.navigate(['/folder/searchResult'], routerObj);
  }


  /**
   * 点击左侧列表按照类型搜索
   */
  searchFileByType(data: any) {
    let routerObj: any = {queryParams: {ext: data}};
    this.router.navigate(['/folder/searchResult'], routerObj);
  }

  /**
   * 进入你的分享目录 并默认获取个人的share
   */
  enterYourShareList(form: any) {
    let routerObj: any = {queryParams: {form: form}};
    this.router.navigate(['/folder/share'], routerObj);
  }


  /**
   * 从api获取我的分享文件裂列表
   * @param form
   */
  getYourShareFileFromApi(form: number) {
    this.folderContent.isLoadingFile = true;
    this.fileObj.fileList = [];
    this.folderContent.fileList = [];
    this.folderModelService.shareFolderList({form: form}, (res: any) => {
      if (res.status == 1) {
        let fileObj: any = {};
        fileObj.fileList = this.typeService.bindDataList(FolderLists.init(), res.data);
        this.folderContent.temporaryFileArray = this.typeService.clone(fileObj.fileList)
        this.fileObj = this.typeService.clone(fileObj);
        this.fileObj.isDeleteFolder = false;
      }
      setTimeout(() => {
        this.folderContent.isLoadingFile = false;
      }, 300);
    })
  }


  /**
   * 切换搜索目录（全局还是当前目录）
   */
  switchSearchFolderPath(bool: boolean) {
    if (bool) {  //全局搜索
      this.fileObj.fileList = this.typeService.clone(this.searchFileArray);
      this.fileObj = this.typeService.clone(this.fileObj);
    } else {
      if (this.currentPathFileArray.length) {
        let tempFile: any = this.typeService.clone(this.currentPathFileArray);
        tempFile.forEach((ele: any) => {
          // 不要求精确匹配，使用!=而不是!==
          if (ele.hasOwnProperty('name')) {
            let name = ele.name.toLowerCase();
            let filter = this.folderHeader.searchKeyWords.toLowerCase();
            ele.hasFiltered = name.indexOf(filter) == '-1';
          }
        });
        this.fileObj.fileList = [];
        for (let i in tempFile) {
          if (!tempFile[i].hasFiltered) {
            this.fileObj.fileList.push(tempFile[i])
          }
        }
      } else {
        this.getFolderLists(this.currentFolder, false, 0, (data: any) => {
          let tempFile: any = this.typeService.clone(data);
          tempFile.forEach((ele: any) => {
            // 不要求精确匹配，使用!=而不是!==
            if (ele.hasOwnProperty('name')) {
              let name = ele.name.toLowerCase();
              let filter = this.folderHeader.searchKeyWords.toLowerCase();
              ele.hasFiltered = name.indexOf(filter) == '-1';
            }
          });
          this.fileObj.fileList = [];
          for (let i in tempFile) {
            if (!tempFile[i].hasFiltered) {
              this.fileObj.fileList.push(tempFile[i])
            }
          }
        });
      }
      this.fileObj = this.typeService.clone(this.fileObj);
    }
  }


  /**
   * 打开帮助弹窗
   */
  showFolderHelpDialog() {
    let storeHelp = this.userDataService.getHelp();
    //如果缓存没有记录 读接口
    if (!storeHelp) {
      this.userModelService.helpRecorder({}, (res: any) => {
        if (res.status === 1) {
          if (!res.data.folder) {
            this.openIsNeedHelpDialog(res.data);
          } else {
            this.userDataService.setHelp(res.data);
          }
        }
      });
    } else {
      let helpRecorder: any = storeHelp;
      if (!helpRecorder.folder) {
        this.openIsNeedHelpDialog(helpRecorder);
      }
    }
  }


  openIsNeedHelpDialog(data: any) {
    this.router.navigate(['/folder/personal']);
    let setOptionData: any = {
      model: 'Folder',
    };
    let settings = {
      mode: '6',
      title: 'FOLDER HELP',
      isSimpleContent: false,
      componentSelector: 'help-dialog',
      componentData: setOptionData,
      buttons: [{
        btnEvent: () => {
          this.showFolderHelpIntro();
        },
        btnText: 'Ok, I watch it',
        btnClass: 'but-done but-animation help-btn'
      },
        {
          btnText: 'Don`t show this help again !',
          btnClass: 'but-done but-animation help-btn help-btn-bottom'
        }],
    };
    this.dialogService.openNew(settings);
    data.folder = 1;
    this.userDataService.setHelp(data);
    this.userModelService.updateHelper({
      data: {folder: 1}
    }, (res: any) => {

    })
  }


  /**
   * 显示help
   */
  showFolderHelpIntro() {
    this.router.navigate(['/folder/personal']);
    this.folderHeader.isMultipleSelect = true;
    let intro = introInit.introJs();
    const totalHelpStepCount: number = 14;
    let totalHelpStep: Array<any> = [];
    for (let i = 1; i < totalHelpStepCount + 1; i++) {
      if (i != 5) {
        let steps: any = {
          element: '#step_folder_' + i.toString(),
          intro: this.getHelpHtml('HELP_FOLDER_' + i.toString())
        };
        totalHelpStep.push(steps);
      }
    }
    intro.setOptions({
      prevLabel: '<em class="icon1-help-arrow"></em><i class="base">' + this.translateService.manualTranslate('Previous') + '</i>',
      nextLabel: '<em class="icon1-help-arrow help-trans"></em><i class="base">' + this.translateService.manualTranslate('Next1') + '</i>',
      exitOnEsc: true,
      hidePrev: false,
      hideNext: true,
      exitOnOverlayClick: true,
      showProgress: true,
      showBullets: true,
      showStepNumbers: false,
      disableInteraction: true,
      tooltipClass: 'help-wrap help-no-padding show-btn',
      steps: totalHelpStep
    });
    if (this.isDefaultPage) {
      setTimeout(() => {
        intro.start();
      }, 1000);
    } else {
      intro.start();
    }
    intro.onchange((targetElement: any) => {
      this.folderHeader.isMultipleSelect = true;
      if (!targetElement.getAttribute('data-step')) {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding hide-btn')
      } else {
        intro.setOption('tooltipClass', 'help-wrap help-no-padding')
      }
    });
    intro.onexit(() => {
      this.folderHeader.isMultipleSelect = false;
    });
  }


  /**
   * 获取帮助html
   */
  getHelpHtml(param: string) {
    let helpHtml = '<h3 class="f53-f help-title help-title2">' + this.translateService.manualTranslate("tutorial") +
      '<span class="pull-right f14-f di2-import-team-title help-title-right">' +
      '<em>esc </em>' + this.translateService.manualTranslate('to cancel') + '</span></h3><div class="help-line"></div>' +
      '<div class="help-click">' + this.translateService.manualTranslate(param) + '</div>';
    return helpHtml;
  }


}
