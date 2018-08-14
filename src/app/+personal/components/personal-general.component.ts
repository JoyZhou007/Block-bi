import {Component, OnInit, Inject, ViewEncapsulation, Renderer, ViewChild, OnDestroy} from '@angular/core';
import {PersonalModelService, PersonalInformation, AccountInformation} from '../../shared/services/index.service';
import * as profileConfig from '../../shared/config/profile.config';
import {Subscription} from "rxjs";
import {config} from "shelljs";
@Component({
  selector: 'personal-general',
  styleUrls: ['../../../assets/css/account/account.css'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: '../template/personal-general.component.html'
})
export class PersonalGeneralComponent implements OnInit {

  public personalInformation: PersonalInformation;
  public accountInformation: AccountInformation;
  public genderType: string;
  public currentCountry: string;
  public areaCountryArray: Array<any> = [];
  public banksName: string = 'ICBC';
  public banksListArray: any = [];
  public banksList: any;
  public areaCountry: any;
  public savePersonalInfo: any = {};
  public userLoginData: any;
  public personalData: any;
  public isUploadPic: any;//是否上传图片

  //下拉列表变量
  public dateOption: any;

  //表单验证
  public isShowPhoneError: boolean = false;
  public isShowBirthdayError: boolean = false;
  public isPhoneCorrect: boolean = false;
  public isShowWorkNameError: boolean = false;

  //错误提示
  public nameError: any = {isSHow: false, text: ''};
  public emptyError: string = profileConfig.PROFILE_EMPTY_ERROR;
  public phoneError: string = profileConfig.PROFILE_PHONE_ERROR;
  public workNameError: string = profileConfig.PROFILE_WORKNAME_ERROR;
  public dateError: string = profileConfig.PROFILE_DATE_ERROR;
  public subscription: Subscription;
  private uploadImg: boolean = false;//上传图片是否成功

  @ViewChild('phoneCode') public phoneCode: any;

  public countryData: any;
  private btnFail: any;

  constructor(private renderer: Renderer,
              public personalService: PersonalModelService,
              @Inject('notification.service') public notificationService: any,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('const-interface.service') public constInterfaceService: any) {
  }

  ngOnInit() {
    this.personalInformation = PersonalInformation.init();
    this.accountInformation = AccountInformation.init();


    /**
     * 获取用户信息
     */
    this.getPersonalInfo();

    /**
     * 设置日期
     * @param event 回调的时间
     */
    this.dateOption = {
      type: 1,
      setEvent: (date: any) => {
        this.personalInformation.birthday = date;
      },
      date: {
        selected: this.personalInformation.birthday
      }
    };

    this.userLoginData = this.userDataService.getUserIn();

    //头像参数
    this.personalData = {
      logo_image_path: this.userLoginData.user.user_profile_path,
      module: 'general'
    };
  }

  /**
   * 获取用户信息
   */
  getPersonalInfo() {
    this.personalService.getUserInfo(
      {personal_module: 'general'},
      (data: any) => {
        if (data.status === 1) {

          //用户信息
          this.typeService.bindData(this.personalInformation, data.data.personal_information);

          //用户账号信息
          this.typeService.bindData(this.accountInformation, data.data.account_information);

          //性别初始化
          this.genderType = this.translate.manualTranslate(this.constInterfaceService.transformGender(this.personalInformation.gender));

          //国家初始化
          let countryType: string = this.personalInformation.country ? this.personalInformation.country : 'CN';
          this.constInterfaceService.initCountry(countryType, (data: string, list: any) => {
            this.currentCountry = data;
            this.areaCountry = list.setData;
            if(this.translate.lan == 'en') {
              this.areaCountryArray = list.en;
            }else {
              this.areaCountryArray = list.chs;
            }
            this.countryData = {
              data: this.areaCountryArray,
              type: 'country',
              defaultValue: this.currentCountry
            };
          });

          //银行初始化
          let bankType: string = this.accountInformation.bank_type ? this.accountInformation.bank_type : '1';
          this.constInterfaceService.initBank(parseInt(bankType), (data: string, list: any) => {
            this.banksListArray = list;
            this.banksName = data;
          });

        } else {
          this.dialogService.openError({simpleContent: data.message});
        }
      })
  }

  /**
   * 接收当前选择值
   * @param data
   */
  getCurrentValue(data: any) {
    if(data.type === 'country') {
      this.personalInformation.country = this.areaCountry[data.index].code;
    }
  }

  /**
   * 银行选择
   */
  public setWageCarView(num: any) {
    event.stopPropagation();
    num = parseInt(num);
    this.banksName = this.banksListArray[num].short_name;
    this.accountInformation.bank_type = this.banksListArray[num].id;
  }

  /**
   * 性别选择
   */
  public setGenderView(type: string, num: any) {
    num = parseInt(num);
    this.genderType = this.translate.manualTranslate(type);
    this.personalInformation.gender = num;
  }

  /**
   * 验证表单合法性
   */
  checkValue() {
    let result = true;
    if (!this.nameBlur()) {
      result = false;
    }
    return result;
  }


  /**
   * 个人信息修改
   * @param element
   */
  doUploadInfo(element: any) {
    if (!this.checkValue()) {
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      return;
    }
    let personalInfo: any = this.typeService.clone(this.personalInformation);
    for (let key in personalInfo) {
      this.savePersonalInfo[key] = personalInfo[key];
    }

    let accountInfo: any = this.typeService.clone(this.accountInformation);
    for (let key in accountInfo) {
      this.savePersonalInfo[key] = accountInfo[key];
    }
    this.isUploadPic = new Date();
    //上传个人信息
    this.personalService.userSaveBaseInfo(this.savePersonalInfo,
      (data: any) => {
        if (data.status === 1) {
          // this.dialogService.openSuccess({simpleContent: data.message});
          //更新缓存中的某些字段
          let newUserInfo = {
            work_name: data.data.work_name
          };
          this.userDataService.updateUserIn(newUserInfo);

        //成功，按钮添加对号，1秒后消失
         this.renderer.setElementClass(element, 'but-success', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-success', false);
          },this.config.btnSuccessTime);
        } else {

          //失败，按钮添加叉号，错误提示，1秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
          },this.config.btnFailTime);
          this.btnFail = data.message;


          // this.dialogService.openError({simpleContent: data.message});
        }
        this.renderer.setElementClass(element, this.config.btnProgress, false);
      }
    );
  }

  /**
   * name 失去焦点
   * @param event
   * @returns {boolean}
   */
  nameBlur(event?: any): boolean {
    if (event) {
      event.stopPropagation();
    }
    if (this.personalInformation.work_name == '') {
      this.nameError.isShow = true;
      this.nameError.text = "Work name can't be empty";
      return false;
    } else {
      //用户名 3 - 20 中文算3个字符
      if (this.checkStrLength(this.personalInformation.work_name) > 2 && this.checkStrLength(this.personalInformation.work_name) < 21) {
        this.nameError.isShow = false;
        this.nameError.text = '';
        return true;
      } else {
        this.nameError.isShow = true;
        this.nameError.text = 'The length of the work name must be between 3 and 20';
        return false;
      }
    }
  }

  /**
   * 判断字符长度 中文算3个字符
   */
  checkStrLength(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加3
        strlen += 3;
      } else {
        strlen++;
      }
    }
    return strlen;
  }
}
