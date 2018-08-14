import {Component, Inject, OnInit, HostListener, ViewEncapsulation, ElementRef} from '@angular/core';
import {Router} from '@angular/router';

import {CurrentCompanyInfo,CompanyModelService, CompanyAccount, CompanyCreatorInfo}
    from '../../shared/services/index.service';

@Component({
  selector: 'company-account',
  templateUrl: '../template/company-account.component.html',
  styleUrls: ['../../../assets/css/company/company.css'],
  encapsulation: ViewEncapsulation.None
})

export class CompanyAccountComponent implements OnInit {
  public currentCompanyInfo:CurrentCompanyInfo;
  public companyIn:any;
  public moduleId:number;

  //2016.05.24
  public companyAccount:CompanyAccount;
  public companyCreatorInfo:CompanyCreatorInfo;
  public showCompanyCer:boolean = false;

  //2016.06.30
  public licensePath:string;
  public userPath:string;
  public companyAccountToggle:boolean = false;
  public bankList:any;
  public bankListShow:boolean = false;
  public bankVal:string;
  public currentBankId:number = 1;

  constructor(
    public router:Router,
    private ele: ElementRef,
    @Inject('company-data.service') public companyDataService:any,
    @Inject('app.config') public config:any,
    @Inject('type.service') public typeService:any,
    @Inject('dialog.service') public dialogService:any,
    public companyService:CompanyModelService) {
    this.ele.nativeElement.addGlobalEventListener('click', () => {
      if (this.bankListShow) {
        this.bankListShow = false;
      }
    })
  }

  ngOnInit() {

    this.companyIn = this.companyDataService.getLocationCompanyIn();

    if (!this.companyIn.hasOwnProperty('cid')) {
      this.dialogService.openNew({
        mode: '3',
        modeIcon: 'error',
        simpleContent: 'You don\'t have any company yet',
        buttons: [{
          type: 'ok',
          btnEvent: () => {
            this.router.navigate(['user/index'])
          }
        }]
      })
    } else {
      this.moduleId = 3;
      this.currentCompanyInfo = CurrentCompanyInfo.init();
      this.companyAccount = CompanyAccount.init();
      this.companyCreatorInfo = CompanyCreatorInfo.init();

      //获取Account信息
      this.getCompanyAccount();

      //获取银行列表
      this.getBank();
    }
  }

  /**
   * 银行选择显示隐藏
   * @param event
   */
  addCompanyBank(event:any) {
    this.companyAccountToggle = !this.companyAccountToggle;
    event.stopPropagation();
  }

  //隐藏银行
  companyAccountCancel() {
    this.companyAccountToggle = false;
  }

  //显示隐藏银行列表
  bankListToggle(event:any) {
    this.bankListShow = !this.bankListShow;
    event.stopPropagation();
  }

  /**
   * 选择银行
   * @param text 选择的银行
   * @param i 当前银行对应 ID
   */
  selectBank(text:string, i:number) {
    this.bankVal = text;
    this.currentBankId = i + 1;
  }

  /**
   * 保存银行
   */
  saveBank() {}

  /**
   * 获取银行列表
   */
  getBank() {
    this.companyService.companyAccountBank(
      (data:any) => {
        if (data.status === 1) {
          this.bankList = data.data;
          this.bankVal = this.bankList[0].short_name;
        } else if (data.status === 0) {
          this.dialogService.open({
            type: 'error',
            title: 'error!',
            content: data.message,
            closeEvent: () => {
              //this.router.navigate(['UserIndex']);
            }
          });
        }
      }
    );
  }

  /**
   * 获取Account
   */
  getCompanyAccount() {
    this.companyService.companyGeneral({company_module: 'account'}, (data: any) => {
      if (data.status === 1) {
        this.typeService.bindData(this.companyAccount, data.data.account);
        this.typeService.bindData(this.companyCreatorInfo, data.data.creator_info);
        //Logo头像
        //this.companyLogoPath = data.data.logo_image_path;
        //资质证书大图
        this.licensePath = data.data.account.business_license_path;
        //当前用户名
        this.userPath = data.data.creator_info.user_profile_path;
      } else if (data.status === 0) {
        this.dialogService.open({
          type: 'error',
          title: 'error!',
          content: data.message,
          closeEvent: () => {
            //this.router.navigate(['UserIndex']);
          }
        });
      }
    });
  }

  /**
   * 显示营业执照大图
   */
  clickShowCert() {
    this.showCompanyCer = !this.showCompanyCer;
  }

  /**
   * 关闭营业执照大图
   */
  closeCompanyCert() {
    this.showCompanyCer = !this.showCompanyCer;
  }

  /**
   * 修改
   * @param value
   */
  public onSubmit():any {
    this.companyService.generalSave(
      {suid: this.companyIn.suid, company_id: this.companyIn.id},
      (data:any) => {
        if (data.status === 1) {  //修改成功
          this.dialogService.open({
            type: 'success',
            title: 'success!',
            content: data.message,
            closeEvent: () => {
              //this.router.navigate(['UserIndex']);
            }
          });
        } else if (data.status === 0) {
          this.dialogService.open({
            type: 'error',
            title: 'error!',
            content: data.message,
            closeEvent: () => {
              //this.router.navigate(['/user/index']);
            }
          });
        }
      }
    );
  }
}
