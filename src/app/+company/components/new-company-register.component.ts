import { Component, Inject, OnInit, HostListener, ViewChild, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  CompanyModelService, CompanyRegisterData, PersonalModelService, ConstInterFaceService
}
  from '../../shared/services/index.service';
import { Subscription } from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";

interface notificationTpl {
  perm: number,
  bgColorClass: string,
}

@Component({
  selector: 'new-company-register',
  templateUrl: '../template/new-company-register.component.html',
  styleUrls: ['../../../assets/css/company/new-company-register.css'],
  providers: [ConstInterFaceService, PersonalModelService]
})
export class NewCompanyRegisterComponent implements OnInit {
  //页面交互
  public showRegNameHover: boolean = false;
  public showRegEmailHover: boolean = false;
  public industryMustBe: boolean = false;
  public showLicenceText: boolean = true;
  public showImg: boolean = false;

  //注册信息
  public registerData: CompanyRegisterData;
  public registerMessage: string;
  public registerIndustry: any;
  public registerIndustryName: string = '';
  public errorMsgIndex: number;
  public errorMsg: string;

  public avatarId: number;
  public avatarType: number;
  public avatarUrl: any;
  public cropStatus: number = 0;
  public fileData: string = '';

  public licenceId: number;
  public licenceType: number;
  public licenceUrl: any = '';
  public uploadFileParam: any;

  public COMPANY_LICENCE_TYPE = 3;
  public comRegLicence: boolean = false;
  public industryActive: boolean = false;
  private uploadLogo: any;
  private fileSrc: any;
  private fileList: Array<any> = [];
  //industry active状态，标题上移

  //错误提示
  public name_error: any = {};
  public industry_error: any = {};
  public license_error: boolean = false;
  public toggleBgCls: string = 'g-d-bg2';
  public isCompany: number = 0;
  private registerSuccess: boolean = false;
  private successRegisterTimer: any;
  private INDUSTRY_LIST: string = 'industry_list';
  private isZhLan: boolean;
  public companyData: any;
  private upgradeStudio: any;
  private isUpgradeStudio: boolean;
  private isAbleClick: boolean;
  private loadingClass: string = 'but-loading';

  @ViewChild('registerBtn') registerBtn: any;

  constructor(
    private domSanitizer: DomSanitizer,
    public companyService: CompanyModelService,
              public personalModelService: PersonalModelService,
              public activatedRoute: ActivatedRoute,
              public constInterFaceService: ConstInterFaceService,
              public renderer: Renderer,
              @Inject('store.service') public storeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('company-data.service') public companyDataService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              public router: Router) {
  }

  ngOnInit() {
    this.registerData = new CompanyRegisterData('', 0, 1, this.userDataService.getLanguageNum(), 0, 0);
    this.avatarId = 0;
    this.avatarType = 2; //公司LOGO

    this.licenceId = 0;
    this.licenceType = 3; //营业执照


    this.uploadFileParam = {
      type: this.COMPANY_LICENCE_TYPE
    };
    if (this.translate.lan == 'zh-cn') {
      this.isZhLan = true;
    } else {
      this.isZhLan = false;
    }

    if (this.router.url.indexOf('upgrade') != -1) {
      this.getStudioInfo();
      this.isAbleClick = true;
    } else {
      this.getCompanyIndustry();
      this.isAbleClick = false;
    }
  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    if (this.registerIndustryName) {
      this.industryActive = true;
    } else {
      this.industryActive = false;
    }
  }

  updateBusinessType(data: any) {
    this.isCompany = data.perm;
  }

  /**
   * 资质荣誉
   */
  mouseEnterLicence() {
    this.comRegLicence = true;
  }

  mouseLeaveLicence() {
    this.comRegLicence = false;
  }

  /**
   * 获取带升级的studio的信息
   */
  getStudioInfo() {
    this.isUpgradeStudio = true;
    this.isCompany = 1;
    this.upgradeStudio = this.companyDataService.getPendingUpgradeStudio();
    this.avatarUrl = this.config.resourceDomain + this.upgradeStudio.logo_image_path;
    this.registerData.company_name = this.upgradeStudio.name;
    this.showRegNameHover = this.upgradeStudio.name ? true : false;
    this.registerData.company_industries = this.upgradeStudio.industry;
    this.getCompanyIndustry(this.upgradeStudio.industry);
  }


  /**
   * 获取行业类型
   */
  public getCompanyIndustry(value?: any) {
    let storeIndustryList: any = this.storeService.getInstance().get(this.INDUSTRY_LIST);
    if (storeIndustryList) {
      this.registerIndustry = storeIndustryList;
      this.getIndustryList(value);
    } else {
      this.personalModelService.queryJson(
        'GET',
        this.config.staticResourceDomain + 'assets/json/industry.json',
        '',
        (data: any) => {
          this.constInterFaceService.setStoreData(this.INDUSTRY_LIST, data);
          this.registerIndustry = data;
          this.getIndustryList(value);
        }
      );
    }
  }


  getIndustryList(value: any) {
    let newArr = this.getNewArray(this.registerIndustry);
    let industryDefaultValue: string;
    if (value) {
      for (let i in this.registerIndustry) {
        if (this.registerIndustry[i].id == value) {
          industryDefaultValue = this.isZhLan ? this.registerIndustry[i].name_zh : this.registerIndustry[i].name;
        }
      }
      this.registerIndustryName = industryDefaultValue;
      this.industryActive = industryDefaultValue ? true : false;
    }
    this.companyData = {
      data: newArr,
      type: 'company',
      defaultValue: industryDefaultValue ? industryDefaultValue : '',
    };
  }


  /**
   * 返回数组['value','value]格式
   * @param data
   * @returns {Array}
   */
  getNewArray(data: Array<any>): Array<any> {
    let newIndustry = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        let item = this.typeService.clone(data[i]);
        item = this.translate.lan == 'zh-cn' ? item['name_zh'] : item['name'];
        newIndustry.push(item);
      }
    }
    return newIndustry;
  }

  /**
   * 文本框鼠标经过事件
   * @param event
   * @param type placehold样式
   */
  public inputMouseEnter(event: any, type: string) {
    event.target.focus();
    if (type === 'name') {
      this.showRegNameHover = true;
      if (this.errorMsgIndex === 2) {
        this.errorMsgIndex = 0;
      }
    } else if (type === 'email') {
      this.showRegEmailHover = true;
      if (this.errorMsgIndex === 4) {
        this.errorMsgIndex = 0;
      }
    }
  }

  /**
   *选择Industry值，关闭窗口
   * @param value
   */
  public selectIndustryValue(value: number, name: string) {
    this.registerData.company_industries = value;
    this.registerIndustryName = name;
    this.industryMustBe = false;
    this.industryActive = true;
    this.industryCheck();
  }

  /**
   * 文本框失去焦点事件
   * @param event 标识文本框数据类型
   */
  public nameBlur(event?: any) {
    if (this.registerData.company_name == '') {
      this.showRegNameHover = false;
      this.name_error.isShow = true;
      this.name_error.text = 'business name is required';
    } else {
      if (this.checkStrLength(this.registerData.company_name) < 90 && this.checkStrLength(this.registerData.company_name) > 3) {
        this.name_error.isShow = false;
        return true;
      } else {
        this.name_error.isShow = true;
        this.name_error.text = 'The length of the business name must be between 6 and 30';
      }
    }
  }

  /**
   * 判断字符长度
   */
  checkStrLength(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加2
        strlen += 3;
      } else {
        strlen++;
      }
    }
    return strlen;
  }

  /**
   * 创建公司
   * @returns {boolean}
   */
  public createCompany(): any {
    if (!this.checkValue()) {
      return false;
    }
    if (!this.avatarUrl || this.avatarUrl == this.config.userDefaultAvatar || this.avatarId !== 0 || this.isUpgradeStudio) {
      this.sendInfoToAPI();
    } else {
      // 触发上传
      this.uploadLogo = new Date();
    }
  }

  /**
   * 验证合法值
   */
  checkValue() {
    let result = true;
    if (!this.nameBlur()) {
      result = false;
    }
    if (!this.industryCheck()) {
      result = false;
    }
    return result;
  }

  /**
   * 调用后台注册
   */
  sendInfoToAPI() {
    this.registerData['is_studio'] = this.isCompany ? 0 : 1;
    //上传licese
    let param = {
      type: this.COMPANY_LICENCE_TYPE,
      base64_file: this.licenceUrl
    };
    let element = this.registerBtn.nativeElement;
    //添加进度条
    this.renderer.setElementClass(element, this.loadingClass, true);
    setTimeout(() => {
      this.renderer.setElementClass(element, this.loadingClass, false);
      if (this.isCompany) {
        this.companyService.uploadLicense(param, (res: any) => {
          if (res.status === 1) {
            //上传license成功
            this.licenceId = res.data.fileInfo.id;
            this.registerData.company_license_id = res.data.fileInfo.id;
            if (!this.isUpgradeStudio) {  //直接注册公司或者studio
              this.companyService.companyRegister(this.registerData,
                (data: any) => {
                  if (data.status === 1) {  //注册成功
                    //成功，按钮添加对号，1秒后消失
                    this.renderer.setElementClass(element, 'but-success', true);
                    setTimeout(() => {
                      this.renderer.setElementClass(element, 'but-success', false);
                    }, this.config.btnSuccessTime);
                    this.companyDataService.setAllCompany(data.data, false);
                    if (!this.isCompany) {
                      this.registerSuccess = true;
                      this.successRegisterTimer = setTimeout(() => {
                        this.registerSuccess = true;
                        this.router.navigate(['/user/index']);
                      }, 3000);
                    } else {
                      let settings = {
                        mode: '3',
                        title: ' ',
                        isSimpleContent: false,
                        componentSelector: 'company-register-success-dialog',
                        buttons: [
                          {
                            type: 'ok',
                            btnEvent: () => {
                              this.router.navigate(['/user/index']);
                            }
                          }
                        ],
                      };
                      this.dialogService.openNew(settings);
                    }
                  } else if (data.status === 0) {
                    //失败，按钮添加叉号，错误提示，1秒后消失，
                    this.renderer.setElementClass(element, 'but-fail2', true);
                    setTimeout(() => {
                      this.renderer.setElementClass(element, 'but-fail2', false);
                    }, this.config.btnSuccessTime);
                    this.errorMsg = data.message;
                    this.errorMsgIndex = data.data;
                    if (data.data == this.config.duplicateEntry) {
                      this.name_error.isShow = true;
                      this.name_error.text = 'Duplicate business name';
                      this.errorMsg = 'Duplicate business name';
                    }
                    this.dialogService.openError({
                      simpleContent: this.errorMsg
                    });
                  }
                }
              );
            } else { //将studio 升级为company
              let data = {
                cid: this.upgradeStudio.cid,
                company_profile_id: this.registerData.company_profile_id ? this.registerData.company_profile_id : 0,
                company_license_id: this.registerData.company_license_id,
                company_name: this.registerData.company_name,
                company_industries: this.registerData.company_industries,
                is_studio: 1
              };
              this.companyService.studioUpgrade({data}, (res: any) => {
                if (res.status == 1) {
                  //成功，按钮添加对号，1秒后消失
                  this.renderer.setElementClass(element, 'but-success', true);
                  setTimeout(() => {
                    this.renderer.setElementClass(element, 'but-success', false);
                  }, this.config.btnSuccessTime);
                  let settings = {
                    mode: '3',
                    title: ' ',
                    isSimpleContent: false,
                    componentSelector: 'company-register-success-dialog',
                    buttons: [
                      {
                        type: 'ok',
                        btnEvent: () => {
                          this.router.navigate(['/user/index']);
                        }
                      }
                    ],
                  };
                  this.dialogService.openNew(settings);
                  this.companyDataService.removePendingUpgradeStudio();
                } else {
                  //失败，按钮添加叉号，错误提示，1秒后消失，
                  this.renderer.setElementClass(element, 'but-fail2', true);
                  setTimeout(() => {
                    this.renderer.setElementClass(element, 'but-fail2', false);
                  }, this.config.btnSuccessTime);
                  this.dialogService.openWarning({simpleContent: res.message})
                }
              })
            }
          } else {
            //失败，按钮添加叉号，错误提示，1秒后消失，
            this.renderer.setElementClass(element, 'but-fail2', true);
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail2', false);
            }, this.config.btnSuccessTime);
            //上传license 失败
            this.dialogService.openError({
              simpleContent: res.message
            });
          }
        });
      } else {
        this.companyService.companyRegister(this.registerData,
          (data: any) => {
            if (data.status === 1) {  //注册成功
              //成功，按钮添加对号，1秒后消失
              this.renderer.setElementClass(element, 'but-success', true);
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-success', false);
              }, this.config.btnSuccessTime);
              this.companyDataService.setAllCompany(data.data, false);
              this.registerSuccess = true;
              this.successRegisterTimer = setTimeout(() => {
                this.registerSuccess = true;
                this.router.navigate(['/user/index']);
              }, 3000);

            } else if (data.status === 0) {
              //失败，按钮添加叉号，错误提示，1秒后消失，
              this.renderer.setElementClass(element, 'but-fail2', true);
              setTimeout(() => {
                this.renderer.setElementClass(element, 'but-fail2', false);
              }, this.config.btnSuccessTime);
              this.errorMsg = data.message;
              this.errorMsgIndex = data.data;
              if (data.data == this.config.duplicateEntry) {
                this.name_error.isShow = true;
                this.name_error.text = 'Duplicate business name';
                this.errorMsg = 'Duplicate business name';
              }
              this.dialogService.openError({
                simpleContent: this.errorMsg
              });
            }
          }
        );
      }
    }, 600);
  }

  //显示上传的头像
  doShowAvatar(data: any) {
    // this.avatarUrl = this.config.resourceDomain + data.file_path;
    this.avatarId = data.id;
    this.registerData.company_profile_id = data.id;
    this.sendInfoToAPI();
  }


  /**
   * 裁剪图片后
   */
  doCropEvent(img: any) {
    this.avatarUrl = img;
    this.fileData = img;
    this.avatarId = 0;
  }

  //end
  /**
   * 点击删除图片
   */
  onClickDeletePic() {
    this.licenceUrl = '';
    this.showLicenceText = true;
  }

  /**
   * 点击下拉菜单
   */
  onClicktoggleSelectBut(event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.industryActive = true;
    this.industryCheck();
  }

  /**
   * 验证industry
   */
  industryCheck() {
    let result = false;
    let r1 = false;
    let r2 = false;
    if (this.registerIndustryName == '') {
      this.industry_error.isShow = true;
      this.industry_error.text = 'industry is required';
      r1 = false;
    } else {
      this.industry_error.isShow = false;
      r1 = true;
    }
    if (this.isCompany) {
      if (!this.licenceUrl) {
        this.license_error = true;
        r2 = false;
      } else {
        this.license_error = false;
        r2 = true;
      }
    } else {
      this.license_error = false;
      this.registerData['company_license_id'] = 0;
      r2 = true;
    }
    return r1 && r2;
  }


  clickOnLicense(event: any, input: any) {
    event.stopPropagation();
    input.click();
  }

  /**
   * 上传license
   */
  uploadLicense(ele: any) {
    if (ele.files.length === 0) return false;
    let reg = /.(jpg|png|JPG|PNG|jpeg|JPEG)$/i;
    if (!ele.files[0] || !reg.test(ele.files[0].name)) {
      this.dialogService.openError({simpleContent: 'Picture format is not correct'});
      return false;
    }else if((ele.files[0].size / 1024) > 1024) {
      this.dialogService.openError({simpleContent: 'The file you uploaded is too big'});
      return false;
    }

    this.licenceUrl = this.domSanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(ele.files[0]));
    this.showImg = true;
    this.showLicenceText = false;
    this.license_error = false;
  }

  /**
   * 点击成功注册提示页
   * @param event
   */
  onClickSuccess(event: any) {
    event.stopPropagation();
    clearTimeout(this.successRegisterTimer);
    this.router.navigate(['/user/index'])
  }

  /**
   * 接收当前选择值
   * @param data
   */
  getCurrentValue(data: any) {
    if (data.type === 'company') {
      this.registerData.company_industries = this.registerIndustry[data.index].id;
      this.industryMustBe = false;
      this.industryActive = true;
      this.registerIndustryName = this.isZhLan ? this.registerIndustry[data.index].name_zh : this.registerIndustry[data.index].name;
      this.industryCheck();
    }
  }

  /**
   * 失去焦点，内容为空
   * @param event
   */
  onBlurEmpty(event: any) {
    if (event) {
      this.registerIndustryName = '';
    } else {
      this.registerIndustryName = ' ';
    }
  }
}

