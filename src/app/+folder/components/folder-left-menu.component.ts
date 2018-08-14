import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Inject, ElementRef
} from '@angular/core';

import {
  FolderModelService,
}from '../../shared/services/index.service';
import {Router} from "@angular/router";
import * as FolderConstant from '../../shared/config/folder.config';

@Component({
  selector: 'folder-left-menu',
  templateUrl: '../template/folder-left-menu.component.html',
})


export class FolderLeftMenuComponent implements OnInit {

  public isHaveCompany: boolean;
  private userData: any;
  private isPersonal: boolean = true;
  private isBusiness: boolean = false;
  private isInformation: boolean = false;
  private isImage: boolean = false;
  private isAnalysis: boolean = false;
  private isPosts: boolean = false;
  private isPins: boolean = false;
  private isPersonalShare: boolean = false;
  private isBusinessShare: boolean = false;
  public hasInit: boolean = false;
  public folderConstant: any;
  public occupiedSpace: any;
  public occupiedSpacePercent: any;
  public totalSpace: any;
  public initSpaceSuccess: boolean;
  public currentForm: number = 1;
  public isDefaultPage: boolean;


  @Output() public doSwitchFold = new EventEmitter<any>();
  @Output() public outputSearchByExt = new EventEmitter<any>();
  @Output() public outFetchYourShare = new EventEmitter<any>();

  constructor(public router: Router,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('page.element') public element: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              public folderModelService: FolderModelService) {
    this.folderConstant = FolderConstant;
  }

  //初始化页面后
  ngOnInit() {
    this.getUserIn();
    if (this.isHaveCompany) {
      // this.innitFolder();
    }
  }

  ngAfterViewInit() {
    if (this.isBusiness) {
      this.currentForm = 2
    } else if (this.isPersonal) {
      this.currentForm = 1
    }
    this.getCurrentFolderSpace(this.currentForm);
  }


  /**
   * 点击左侧列表切换个人/工作
   * @param param
   */
  switchFolderType(ele: ElementRef, type: any) {
    if (!this.element.hasClass(ele, 'd-opacity')) {
      this.isPersonal = (type === 1);
      this.isBusiness = (type === 2);
      this.isInformation = false;
      this.isImage = false;
      this.isAnalysis = false;
      this.isPins = false;
      this.isPosts = false;
      this.doSwitchFold.emit({form: type, path: '/'});
      if (type === 1 || type === 2) {
        this.currentForm = type;
        this.getCurrentFolderSpace(this.currentForm);
      }
    }
  }


  /**
   初始化文件管理器
   */
  innitFolder() {
    this.folderModelService.folderInit({
      form: 2
    }, (data: any) => {
      //获取成功
      if (data.status == 1) {
        this.hasInit = true;
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
   * getCurrentType
   */
  getCurrentType(type: string) {
    switch (type.toLowerCase()) {
      case  FolderConstant.FOLDER_TYPE_INFORMATION.toLowerCase():
        this.isInformation = true;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_ANALYSIS.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = true;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_POST.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = true;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_PIN.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = true;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_IMAGE.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = true;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_PERSONAL_SHARE.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = true;
        this.isBusinessShare = false;
        break;
      case  FolderConstant.FOLDER_TYPE_BUSINESS_SHARE.toLowerCase() :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = true;
        break;
      case 'personal' :
        this.isInformation = false;
        this.isPersonal = true;
        this.isBusiness = false;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
      case 'business' :
        this.isInformation = false;
        this.isPersonal = false;
        this.isBusiness = true;
        this.isImage = false;
        this.isAnalysis = false;
        this.isPins = false;
        this.isPosts = false;
        this.isPersonalShare = false;
        this.isBusinessShare = false;
        break;
    }
    // if (this.isPersonal || this.isBusiness) {
    //   this.currentForm = this.isPersonal ? 1 : 2
    //   this.getCurrentFolderSpace(this.currentForm);
    // }
  }


  /**
   * 全局搜索当前类型的文件
   */
  searchTheFile(type: string) {
    this.getCurrentType(type);
    this.outputSearchByExt.emit(type.toLowerCase());
  }


  /**
   * 显示你的分享
   */
  showYourShareFile(type: string) {
    this.getCurrentType(type);
    let form: number = type == this.folderConstant.FOLDER_TYPE_PERSONAL_SHARE ? 1 : 2
    this.outFetchYourShare.emit(form);
  }


//获取当前登录用户信息
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
    this.isHaveCompany = this.companyDataService.getCurrentCompanyCID() != '';
  }

  /**
   * getCurrentFolderSpace
   */
  getCurrentFolderSpace(form: number) {
    this.folderModelService.folderDisk({
      form: form
    }, (res: any) => {
      //获取成功
      if (res.status == 1) {
        this.initSpaceSuccess = true;
        if (res.data && res.data.hasOwnProperty('occupied_space') && res.data.hasOwnProperty('space')) {
          this.occupiedSpace = res.data.occupied_space;
          this.totalSpace = res.data.space;
          this.occupiedSpacePercent = ((res.data.occupied_space / res.data.space) !== 0 && (res.data.occupied_space / res.data.space) < 0.0001) ?
            0.01 : ((res.data.occupied_space / res.data.space) * 100).toFixed(4);
        }
      }
    });
  }


}
