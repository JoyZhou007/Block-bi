import {Component, Input, Inject, OnInit, AfterContentInit} from '@angular/core';

@Component({
  selector: 'company-show',
  templateUrl: '../template/company-show.component.html'
})
export class CompanyShowComponent implements OnInit, AfterContentInit {
  public showCompanyList : boolean;

  //2016.06.03
  public avatarId : number;
  public uploadFileParam : any;
  public avatarUrl : any;
  public cropStatus : number = 0;
  public fileData : string = '';

  public COMPANY_LOGO_TYPE = 2;  //公司logo图片类型
  public locationCompanyIn: any;
  public role: boolean;
  public upload: any;

  /**
   * 公司Logo地址
   */
  @Input() set logoPath(logoPath: string) {
    if (logoPath) {
      this.avatarUrl = this.config.resourceDomain + logoPath;
    }
  }
  /**
   *
   * 上传图片
   * @param upload
   */
  @Input() set uploadPic(upload){
    this.upload = new Date();
  }

  constructor(
      @Inject('company-data.service') public companyDataService : any,
      @Inject('app.config') public config : any
  ) { }

  //启动
  ngOnInit() {
    this.showCompanyList = true;
    this.locationCompanyIn = this.companyDataService.getLocationCompanyIn();
    this.role = (!((this.locationCompanyIn.role.length === 1) && (parseInt(this.locationCompanyIn.role[0]) === 3)));

    this.uploadFileParam = {
      type:this.COMPANY_LOGO_TYPE,
      cid : this.locationCompanyIn.cid
    };
    this.avatarId = 0;
  }

  ngAfterContentInit() {
    if(!this.avatarUrl) {
      this.avatarUrl = this.config.resourceDomain + this.locationCompanyIn.logo_path;
    }
  }


  //显示上传的头像
  doShowAvatar(data : any) {
    this.avatarUrl = this.config.resourceDomain + data.file_path;
    this.companyDataService.setCompanyLogo(data.file_path);
  }

  /**
   * 裁剪图片后
   */
  doCropEvent(img : any) {
    this.avatarUrl = img;
    this.fileData  = img;
  }
  //end

  doShowCompanyList() {
    this.showCompanyList = !this.showCompanyList;
  }
}
