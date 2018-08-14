import {Component, Input} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'company-tabs',
  templateUrl: '../template/company-tabs.component.html'
})
export class CompanyTabsComponent {
  public companyIn:any;
  public _pageModuleId : number = 1;

  constructor(public activatedRoute:ActivatedRoute) {

    this.activatedRoute.params.forEach((params: Params) => {
      this.companyIn = params;
    });
  }

  /**
   * 当前标签样式
   * @param $event 当前路径
   * @param path
   */
  getLinkStyle($event: any, path: string) {
    return true;
  }

  /**
   * markId 标记那个页面
   * @param markId
   */
  @Input() set pageModuleId(moduleId : number) {
    this._pageModuleId = moduleId;
  }

}
