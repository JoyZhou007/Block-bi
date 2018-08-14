import {Component, Inject, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {CompanyModelService} from "../../shared/services/index.service";
import * as profileConfig from "../../shared/config/profile.config";


@Component({
  selector: 'view-company',
  templateUrl: '../template/view-company-general.component.html',
  styleUrls: ['../../../assets/css/contacts/contact.css'],
  encapsulation: ViewEncapsulation.None
})
export class ViewCompanyGeneralComponent implements OnInit {

  public currentCompanyInfo: any = {};
  public general: any = {};
  public privacy: any = {};
  public parentName: string;
  public builderData: any = {};
  public ownerData: any = {};
  public shareHolderData: any[] = [];
  public structureAdminData: any = {};
  private industry: any;
  public industryName: string;
  public logoPath: string;
  public couldEdit: boolean = false;

  //profile 常量
  public noData = profileConfig.PROFILE_COMPANY_NODATA;
  private isZhLan: boolean;

  constructor(public companyModelService: CompanyModelService,
              @Inject('app.config') public config: any,
              @Inject('notice-dialog.service') public noticeDialogService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('const-interface.service') public constInterfaceService: any) {
  }

  @Input()
  public set setCouldEdit(data: boolean) {
    this.couldEdit = data;
  }

  ngOnInit() {
    this.getViewCompanyGeneralInfo();
    if (this.translate.lan == 'zh-cn') {
      this.isZhLan = true;
      this.noData = profileConfig.PROFILE_COMPANY_NODATA_ZH;
    } else {
      this.isZhLan = false;
      this.noData = profileConfig.PROFILE_COMPANY_NODATA;
    }
  }

  /**
   * 获取公司信息
   */
  getViewCompanyGeneralInfo() {
    this.companyModelService.companyGeneral({company_module: 'introduction'}, (data: any) => {
      if (data.status === 1) {
        let contactsInfo: any = data.data;
        this.general = contactsInfo.general;
        this.privacy = contactsInfo.privacy;
        this.parentName = this.privacy.parent.name;
        this.builderData = this.privacy.builder ? this.privacy.builder : {};
        this.ownerData = this.privacy.owner ? this.privacy.owner : {};
        this.shareHolderData = this.privacy.share_holder;
        this.structureAdminData = this.privacy.structure_admin ? this.privacy.structure_admin : {};
        this.logoPath = this.general.logo_image_path;
        this.constInterfaceService.companyIndustry(this.general.industry, (industry: any) => {
          this.industryName = this.isZhLan ? industry.name_zh : industry.name;
        });

      } else if (data.status === 0) {
          this.dialogService.openWarning({simpleContent:'get company info failed!'})
      }
    });
  }
}
