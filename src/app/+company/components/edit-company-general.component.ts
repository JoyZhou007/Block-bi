import {
  Component, OnInit, Inject, Renderer, OnDestroy, Input, Output,EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {GeneralSaveData, CurrentCompanyInfo, CompanyModelService, UserData, AllCompanyList,
  SearchCompany, AccountLicense, Permission} from '../../shared/services/index.service';
import {Subscription} from "rxjs/Subscription";
import * as profileConfig from '../../shared/config/profile.config';

@Component({
  selector: 'edit-company',
  templateUrl: '../template/edit-company-general.component.html'
})
export class EditCompanyGeneralComponent implements OnInit, OnDestroy {

  public currentCompanyInfo: CurrentCompanyInfo;
  public companyIn: any;
  public userInfo: any;
  public companyIndustryNameList: any;
  public companyIndustryName: string = 'INDUSTRY';
  public addCompanyGroupParent: any;
  public addCompanyGroupBranch: any;
  public addCompanyGroupSub: any;
  public generalSaveData: GeneralSaveData;
  public allCompanyList: AllCompanyList;
  public searchCompany: SearchCompany;
  public getCompanyGroupParent: any;
  public sendCompanyId: number;
  public sendCompanySuid: string;
  public keywords: string;
  public dateOption: any;
  public ceoGm: any;
  private getallCompanyList: any;
  public accountLicense: AccountLicense;
  public accountLicenseName: string;
  public companyOwner: any;
  public companyBuilder: any;
  public companyAdmin: any;
  public companyHolder: any;
  public showCheckboxAllow: boolean = false;
  private licenceUrl: any;
  public uploadFileParam: any;
  private COMPANY_LICENCE_TYPE = 3;
  public avatarUrl: any;
  public fileData: string = '';
  public logoPath: string;
  private privacyData: any;
  private privacyDataList: any;
  public isUpdate: boolean = true;
  public subscription: Subscription;
  public isCompany: any;
  public isShowBirthdayError: boolean = false;
  public couldEdit: boolean = false;
  public UpdateCompanyObj: any;
  private contactsList: any;
  public licenceFile: File;
  private licenceBool: boolean = false;

  //错误提示
  public emptyError: string = profileConfig.PROFILE_EMPTY_ERROR;
  public dateError: string = profileConfig.PROFILE_DATE_ERROR;
  private upload: any; //上传图片时间

  private isZhLan: boolean;
  private industryData: {data: any; type: string; defaultValue: string};
  @Output() btnFailOutput = new EventEmitter<any>();
  constructor(private router: Router,
              public renderer: Renderer,
              private domSanitizer: DomSanitizer,
              public companyService: CompanyModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('string.service') public stringService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('const-interface.service') public constInterfaceService: any) {
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  @Input()
  public set setCouldEdit(data: boolean) {
    this.couldEdit = data;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.companyIn = this.companyDataService.getLocationCompanyIn();
    this.keywords = this.companyIn.name;
    this.userInfo = this.userDataService.getUserIn();
    this.contactsList = this.userDataService.getContactList();
    this.getallCompanyList = this.companyDataService.getAllCompany();
    this.generalSaveData = GeneralSaveData.init();
    this.currentCompanyInfo = CurrentCompanyInfo.init();
    this.addCompanyGroupParent = CurrentCompanyInfo.init();
    this.allCompanyList = AllCompanyList.init();
    this.searchCompany = SearchCompany.init();
    this.getCompanyGeneral();
    this.ceoGm = UserData.init();
    this.accountLicense = AccountLicense.init();
    if (this.translate.lan == 'zh-cn') {
      this.isZhLan = true;
    } else {
      this.isZhLan = false;
    }

    /**
     * 设置日期
     * @param event 回调的时间
     */
    this.dateOption = {
      type: 0,
      setEvent: (date: any) => {
        this.currentCompanyInfo.found_date = date;
      },
      date: {selected: this.currentCompanyInfo.found_date}
    };
  }

  dealMessage(message) {
    switch (message.act) {
      //修改owner
      case this.notificationService.config.ACT_REQUEST_COMPANY_ADMIN_ACCEPT:
        let user: any = this.userInfo.user;
        if (message.send === 1) {
          this.companyOwner = {
            work_name: user.work_name,
            user_profile_path: user.user_profile_path,
            uuid: user.uuid,
            psid: user.psid
          };
        } else {
          if (this.companyAdmin[0].uuid === user.uuid) {
            this.getCompanyGeneral();
          } else {
            this.router.navigate(['/user/index/']);
            this.notificationService.postNotification({
              act: this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_OWNER
            });
          }
        }
        break;

      //通知自己消息
      case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_SELF_MESSAGE:
        if (message.hasOwnProperty('type') && message.type === 'company-builder') {
          this.UpdateCompanyObj = message;
        }
        break;

      //修改build异步通知
      case this.notificationService.config.ACT_REQUEST_SET_COMPANY_ADMIN:
        //share holder
        if (this.UpdateCompanyObj && this.UpdateCompanyObj.hasOwnProperty('name') && this.UpdateCompanyObj.name === 'holder') {
          this.companyHolder = this.UpdateCompanyObj.data;
        }
        break;

      //share holder 变更
      case this.notificationService.config.ACT_COMPONENT_NOTIFICATION_UPDATE_SHARE_HOLDER:
        //删除
        if (this.typeService.getDataLength(message.data.deleted) > 0) {
          for (let build in this.companyHolder) {
            let isBool: boolean = this.typeService.isArrayVal(message.data.deleted, '', this.companyHolder[build].uuid, true);
            if (isBool) {
              this.companyHolder.splice(parseInt(build), 1);
            }
          }
        }

        //新增
        if (this.typeService.getDataLength(message.data.added) > 0) {
          let userObj: Array<any> = message.user;
          for (let user in userObj) {
            if (userObj[user]['uid'] !== message.data.owner) {
              userObj[user]['psid'] = '';
              userObj[user]['uuid'] = userObj[user]['uid'];
              this.companyHolder.push(userObj[user]);
            }
          }
        }
        break;

      //修改 structure admin
      case this.notificationService.config.ACT_REQUEST_COMPANY_STRUCTURE_ADMIN_ACCEPT:
        if (message.data.sent === 1) {
          let structureUser: any = this.userInfo.user;
          let userInfo: any = {
            work_name: structureUser.work_name,
            user_profile_path: structureUser.user_profile_path,
            uuid: structureUser.uuid,
            psid: structureUser.psid
          };
          this.companyAdmin[0] = userInfo;
        } else if (message.data.hasOwnProperty('owner')) {
          this.companyAdmin[0] = this.typeService.friendObj(this.contactsList, message.data.owner);
        }
        break;

      //修改 structure admin
      case this.notificationService.config.ACT_NOTIFICATION_COMPANY_CEO_MODIFY:
        this.companyAdmin[0] = message.data;
        break;

      //接受公司关系申请
      case this.notificationService.config.ACT_NOTICE_COMPANY_RELATIONSHIP_ACCEPT:
        this.getCompanyGeneral();
        break;
    }
  }

  checkboxAllow() {
    this.showCheckboxAllow = !this.showCheckboxAllow;
  }

  /**
   * 获取公司信息
   */
  getCompanyGeneral() {

    this.sendCompanyId = this.companyIn.id;
    this.sendCompanySuid = this.companyIn.suid;
    this.companyService.companyGeneral({company_module: 'introduction'}, (data: any) => {
      if (data.status === 1) {
        this.isUpdate = data.data.is_update;
        let info: any = data.data;
        let general: any = info.general;
        this.companyDataService.setCompanyLogo(general.logo_image_path);
        this.typeService.bindData(this.currentCompanyInfo, general);//当前公司信息
        this.typeService.bindData(this.accountLicense, info.account);
        this.isCompany = info.account && !info.is_studio;
        this.accountLicenseName = this.stringService.subStr(this.accountLicense.user_profile_path, '/');
        this.logoPath = info.general.logo_image_path;
        this.licenceUrl = this.accountLicense.business_licence_path ? this.config.resourceDomain + this.accountLicense.business_licence_path : '';

        if (this.isUpdate) {
          //母公司
          this.getCompanyGroupParent = this.typeService.bindDataList(
            this.searchCompany, general.show_company_group.Parent);

          //所有分公司
          this.addCompanyGroupBranch = this.typeService.bindDataList(
            this.searchCompany, general.show_company_group.Branch);

          //所有子公司
          this.addCompanyGroupSub = this.typeService.bindDataList(
            this.searchCompany, general.show_company_group.Subsidiary);
        }

        //所有行业列表
        this.constInterfaceService.companyIndustry(this.currentCompanyInfo.industry, (industry: any, data: any) => {
          this.companyIndustryNameList = data;
          this.selectIndustryValue(parseInt(industry.id));
          let newArr= this.getNewArray(this.companyIndustryNameList);
          this.industryData = {
            data: newArr,
            type: 'industry',
            defaultValue: this.companyIndustryName,
          };
        });

        this.privacyData = data.data.privacy;
        this.companyBuilder = this.typeService.bindDataList(Permission.init(), this.privacyData.builder);
        this.companyOwner = this.typeService.bindDataList(Permission.init(), this.privacyData.owner);
        this.companyAdmin = this.typeService.bindDataList(Permission.init(), this.privacyData.structure_admin);
        this.companyHolder = this.typeService.bindDataList(Permission.init(), this.privacyData.share_holder);
      } else {
        this.dialogService.openError({simpleContent: data.message});
      }
    });
  }

  /**
   * 返回数组['value','value]格式
   * @param data
   * @returns {Array}
   */
  getNewArray(data:Array<any>):Array<any>{
      let newIndustry = [];
      for(let i=0; i < data.length;i++){
        let item = this.typeService.clone(data[i]);
        item = this.isZhLan ? item['name_zh']:item['name'];
        newIndustry.push(item);
      }
      return newIndustry;
}
  /**
   * 选择Industry值，关闭窗口
   */
  selectIndustryValue(value: number, el?: any) {
    if (el) {
      this.renderer.setElementClass(el, 'hide', true);
    }
    this.currentCompanyInfo.industry = value;
    this.companyIndustryName = this.isZhLan ? this.companyIndustryNameList[value - 1].name_zh : this.companyIndustryNameList[value - 1].name;
  }

  /**
   * 修改提交
   * @param element 按钮元素
   */
  saveData(element: any) {
    //修改资质证书
    if(this.licenceBool) {
      let formData = new FormData();

      formData.append('file', this.licenceFile);
      formData.append('type', this.COMPANY_LICENCE_TYPE);
      this.companyService.newImgUpload(formData, () => {
        this.licenceBool = false;
      })
    }

    this.upload = new Date();
    this.companyService.upDateCompanyGeneral(
      {data: this.currentCompanyInfo, company_module: 'introduction'},
      (data: any) => {
        if (data.status === 1) {  //修改成功

          //成功，按钮添加对号，1秒后消失
          this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          },this.config.btnSuccessTime);

          this.companyIn.name = this.currentCompanyInfo.name;
          this.companyDataService.setLocationCompanyIn(this.companyIn);
          for (let key in this.getallCompanyList) {
            if (parseInt(this.companyIn.psid) === parseInt(this.getallCompanyList[key].psid)) {
              this.getallCompanyList[key].name = this.currentCompanyInfo.name;
              this.companyDataService.setAllCompany(this.getallCompanyList, false);
              break;
            }
          }
        } else if (data.status === 0) {
          //失败，按钮添加叉号，错误提示，3秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
          },this.config.btnFailTime);
          /*this.btnFail = data.message;*/
          this.btnFailOutput.emit({msg:data.message});
        }
        this.renderer.setElementClass(element, this.config.btnProgress, false);
      }
    );
  }

  /**
   * 触发click事件
   * @param event
   * @param input
   */
  clickOnLicense(event: any, input: any) {
    event.stopPropagation();
    input.click();
  }

  /**
   * 修改license
   */
  uploadLicense(ele: any) {
    if (ele.files.length === 0) return false;
    this.licenceFile = ele.files[0];
    let reg = /.(jpg|png|JPG|PNG|jpeg|JPEG)$/i;
    if (!ele.files[0] || !reg.test(ele.files[0].name)) {
      this.dialogService.openError({simpleContent: 'Picture format is not correct'});
      return false;
    }else if((this.licenceFile.size / 1024) > 1024) {
      this.dialogService.openError({simpleContent: 'The file you uploaded is too big'});
      return false;
    }

    this.licenceUrl = this.domSanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(this.licenceFile));
  }

  /**
   * 设置母公司
   */
  doLinkParent() {
    let settings = {
      mode: '2',
      title: '',
      isSimpleContent: false,
      componentSelector: 'link-to-parent',
      componentData: this.typeService.clone(this.companyIn),
      titleAction: 'Link to',
      titleComponent: 'Parent',
      titleIcon: 'icon-big-linktoparent di-link-parent',
      titleDesc: [
        'Select',
        'subsidiary or branch',
        'to build group'
      ],
      buttons: [
        {type: 'cancel'},
        {btnEvent: 'linkParentCompany'}
      ]
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 编辑组织架构
   */
  editCoreOrg() {
    this.privacyDataList = [
      {name: 'owner', data: this.companyOwner, tab: 'OWNER', isShow: true, type: 2},
      {name: 'builder', data: this.companyBuilder, tab: 'BUILDER', isShow: false, type: 1},
      {name: 'admin', data: this.companyAdmin, tab: 'MAIN ADMIN', isShow: false, type: 4},
      {name: 'holder', data: this.companyHolder, tab: 'SHARE HOLDER', isShow: false, type: 3}
    ];
    let settings = {
      mode: '2',
      title: '',
      isSimpleContent: false,
      componentSelector: 'edit-core-orga',
      componentData: this.typeService.clone(this.privacyDataList),
      titleAction: 'Edit',
      titleComponent: 'Core Organization',
      titleIcon: 'icon1-core di-edit-icon',
      titleDesc: [
        'Set',
        'main person',
        'in this business'
      ],
      buttons: [
        {type: 'cancel'},
        {btnEvent: 'editCoreOrga'}
      ],
    };
    this.dialogService.openNew(settings);
  }

  /**
   * 日历失去焦点
   */
  onBirthBlur() {
    setTimeout(() => {
      if (this.currentCompanyInfo.found_date !== '') {
        let reg: any = /^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
        if (reg.test(this.currentCompanyInfo.found_date)) {
          this.isShowBirthdayError = false;
        } else {
          this.isShowBirthdayError = true;
        }
      } else {
        this.isShowBirthdayError = false;
      }
    }, 500);
  }

  /**
   * 接收当前选择值
   * @param data
   */
  getCurrentValue(data: any) {
    if(data.type === 'industry') {
      if(this.isZhLan){
        this.companyIndustryName = this.companyIndustryNameList[data.index].name_zh;
      }else{
        this.companyIndustryName = this.companyIndustryNameList[data.index].name;
      }
    }
  }
}
