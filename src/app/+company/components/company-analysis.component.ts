import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';

import {CurrentCompanyInfo,CompanyModelService}
  from '../../shared/services/index.service';

@Component({
  selector: 'company-analysis',
  templateUrl: '../template/company-analysis.component.html',
  styleUrls: [
    '../../../assets/css/company/company.css',
    '../../../assets/css/account/account.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class CompanyAnalysisComponent implements OnInit {
  public currentCompanyInfo:CurrentCompanyInfo;
  public companyIn:any;
  public showCompanyList:boolean =false;
  public companyShow : any;
  public moduleId :number;
  public companyLogoPath: string;

  constructor(
      public companyService : CompanyModelService,
      @Inject('company-data.service') public companyDataService : any,
      @Inject('app.config') public config : any,
      @Inject('type.service') public typeService : any,
      @Inject('dialog.service') public dialogService : any,
      @Inject('notice-dialog.service') public noticeDialogService: any
  ) {}

  ngOnInit() {
    this.moduleId = 2;
    this.companyIn = this.companyDataService.getLocationCompanyIn();
    this.currentCompanyInfo = CurrentCompanyInfo.init();

    this.getAnalysisInfo();
  }

  /**
   * 获取info
   */
  getAnalysisInfo() {
    this.companyService.companyGeneral({company_module: 'company_analysis'}, (data: any) => {
      if(data.status === 1) {
        //this.companyLogoPath = data.data.logo_image_path;
        //this.noticeDialogService.setNoticeDialog({type: data.status, content: data.message});
      }else if(data.status === 0) {
        this.noticeDialogService.setNoticeDialog({type: data.status, content: data.message});
      }
    });
  }

  /**
   *显示公司，关闭窗口
   * @param event
   */
  public toggleCompanyBox(event : any) {
    this.showCompanyList = !this.showCompanyList;
    event.stopPropagation();
    return false;
  }

  /**
   * 保存数据
   */
  doSaveData() {

  }

}
