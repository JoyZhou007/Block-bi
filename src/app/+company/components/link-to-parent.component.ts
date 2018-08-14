import {Component, OnInit, Input, Inject, Renderer} from '@angular/core';
import {CompanyModelService} from '../../shared/services/index.service';


@Component({
  selector: 'link-to-parent',
  templateUrl: '../template/link-to-parent.component.html',
  providers: [CompanyModelService]
})

export class LinkToParentComponent implements OnInit {

  public personalInfo: any = {};
  public comments: string;
  public companyName: string;
  public selectCompanyName: string;
  public diSearchListHeight: boolean = false;
  public companyList: any[];
  public selectButton: boolean = false;
  private searchDelay: number;
  private companyIn: any;
  private co_type: number = 3;
  private isAllow: number = 0;
  private cid: number;
  private userInfo: any;
  private trimSearch: any = null;


  constructor(public companyModelService: CompanyModelService,
              public renderer: Renderer,
              @Inject('app.config') public config: any,
              @Inject('type.service') public typeService: any,
              @Inject('im.service') public memberService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('company-data.service') public companyDataService: any) {

  }

  ngOnInit() {
    //this.companyIn = this.companyDataService.getLocationCompanyIn();
    this.userInfo = this.userDataService.getUserIn();
    this.personalInfo = {
      perm: 0,
      defaultWord: this.translate.manualTranslate('Subsidiary'),
      acrossWord: this.translate.manualTranslate('Branch'),
      bgColorClass: 'g-d-bg2'
    };

  }


  @Input() set setOption(data: any) {
    if (data) {
      this.comments = '';
      this.selectCompanyName = '';
      this.selectButton = false;
      this.companyName = '';
      this.companyIn = data;

    }
  }

  /**
   * 设置
   * @param data
   */
  getSwitchButEvent(data: any) {
    this.co_type = (data.perm === 0) ? 3 : 2;
  }

  /**
   * 设置focus
   * @param element
   */
  selectFocus(element: any) {
    element.focus();
    if (this.companyName && this.typeService.getDataLength(this.companyList) > 0) {
      this.diSearchListHeight = true;
    }
  }

  /**
   * 选择公司
   * @param company
   */
  selectParentCompany(company: any) {
    //this.diSearchListHeight = false;
    this.companyName = company.name;
    this.cid = company.cid;
  }

  /**
   * 权限复选框
   */
  doSelectButton() {
    this.selectButton = !this.selectButton;
    this.isAllow = this.selectButton ? 1 : 0;
  }

  /**
   * 搜索公司
   * @param event
   */
  searchCompanyList(event: any) {
    clearTimeout(this.trimSearch);
    let keyCodeVal = event.keyCode;
    this.searchDelay = new Date().getTime();
    if ((keyCodeVal >= 48 && keyCodeVal <= 105) || (keyCodeVal === 8) || (keyCodeVal === 32) || (keyCodeVal === 110)) {
      this.trimSearch = setTimeout(() => {
        this.companyModelService.companySearch({keywords: this.companyName},
          (response: any) => {
            if (response.status === 1) {
              this.companyList =  response.data &&  response.data.hasOwnProperty('company') ? response.data.company : [];
              if (this.typeService.getDataLength(this.companyList) === 0) {
                this.diSearchListHeight = false;
              } else {
                this.diSearchListHeight = true;
              }
            }
          }
        );
      }, 300)
    }
  }

  /**
   * 发送请求
   */
  linkParentCompany() {
    let data = {
      status:1
    };
    this.notificationService.postNotification({ act: this.notificationService.config.ACT_COMPONENT_DIALOG_DEAL_BUTTON, data: {data:data} });
    this.memberService.applyCompany({
      cid: this.companyIn.cid,
      pcid: this.cid,
      co_type: this.co_type,
      is_allow: this.isAllow,
      company_name: this.selectCompanyName,
      comment: this.comments
    });
  }

  /**
   * 取消搜索
   */
  onCloseSearch(){
    this.companyName = '';
  }
}