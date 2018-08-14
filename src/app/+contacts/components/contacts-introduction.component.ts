import {Component, OnInit, ViewEncapsulation, Inject, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ContactModelService} from '../../shared/services/index.service';
import * as profileConfig from '../../shared/config/profile.config';

@Component({
  selector: 'contacts-introduction',
  templateUrl: '../template/contacts-introduction.component.html',
  styleUrls: [
    '../../../assets/css/contacts/contact.css',
    '../../../assets/css/account/account.css'
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ContactModelService]
})

export class ContactIntroductionComponent implements OnInit {

  private getRouteParams: any;

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
  public noData: string = profileConfig.PROFILE_COMPANY_NODATA;
  public uid: any;
  public init: boolean = false;
  @Output('hasInit') outHasInit: any = new EventEmitter<any>();
  private isZhLan: boolean;

  constructor(public activatedRoute: ActivatedRoute,
              public contactModelService: ContactModelService,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('const-interface.service') public constInterfaceService: any) {
  }

  ngOnInit() {
    if (this.translate.lan == 'zh-cn') {
      this.noData = profileConfig.PROFILE_COMPANY_NODATA_ZH;
      this.isZhLan = true;
    } else {
      this.noData = profileConfig.PROFILE_COMPANY_NODATA;
      this.isZhLan = false;
    }
    //获取URL参数
    this.activatedRoute.params.subscribe((params: any) => {
      if (this.uid != params.uid && params.type === 'intro') {
        this.init = false;
        this.uid = params.uid;
        this.getIntroduction();
      }
    });
  }

  /**
   * 获取当前公司信息
   */
  getIntroduction() {
    this.contactModelService.fetchFriendInfo(
      {
        data: {
          uid: this.uid,
          personal_module: 'introduction',
        }
      }, (data: any) => {
        this.init = true;
        if (data.status === 1) {
          let contactsInfo: any = data.data;
          this.general = contactsInfo.general ? contactsInfo.general : {};
          this.privacy = contactsInfo.privacy ? contactsInfo.privacy : {};
          this.parentName = this.privacy.parent ? this.privacy.parent.name : '';
          this.builderData = this.privacy.builder ? this.privacy.builder : {};
          this.ownerData = this.privacy.owner ? this.privacy.owner : {};
          this.shareHolderData = this.privacy ? this.privacy.share_holder : '';
          this.structureAdminData = this.privacy.structure_admin ? this.privacy.structure_admin : {};
          this.industryName = '';
          if (this.general.industry) {
            this.constInterfaceService.companyIndustry(this.general.industry, (industry: any) => {
              if (this.isZhLan) {
                this.industryName = industry.hasOwnProperty('name_zh') ? industry.name_zh : '';
              } else {
                this.industryName = industry.hasOwnProperty('name') ? industry.name : '';
              }
            });
          }
        }
        this.outHasInit.emit();
      }
    )
  }

}
