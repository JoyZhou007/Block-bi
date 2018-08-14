import {Component, OnInit, Inject, ViewEncapsulation, ViewChild} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'company-general',
  templateUrl: '../template/company-general.component.html',
  styleUrls: ['../../../assets/css/account/account.css'],
  encapsulation: ViewEncapsulation.None
})
export class CompanyGeneralComponent implements OnInit {

  private couldEdit: boolean;

  @ViewChild('editCompany') private editCompany: any;
  private btnFailObj: any;

  constructor(public router: Router,
              @Inject('type.service') public typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('company-data.service') public companyDataService: any) {
  }

  ngOnInit() {
    let companyLocationData: any = this.companyDataService.getLocationCompanyIn();
    if (!companyLocationData || !companyLocationData.hasOwnProperty('cid') || !companyLocationData.cid) {
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
      let roleArr: Array<any> = companyLocationData.role;
      if (this.typeService.getDataLength(roleArr) === 1 && roleArr.indexOf('')) {

      }
      this.couldEdit = (roleArr.length > 0 && roleArr.indexOf('2') !== -1) || (roleArr.length > 0 && roleArr.indexOf('4') !== -1);
    }
  }

  /**
   * 保存数据
   * @param element 按钮元素
   */
  doSaveData(element: any) {
    this.editCompany.saveData(element);
  }

  /**
   * 保存失败，返回错误提示
   * @param event
   */
  btnFailEvent(event: any) {
    if (event && event.msg) {
      this.btnFailObj = {'msg':event.msg};
    }
  }
}
