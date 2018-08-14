import {Injectable} from '@angular/core';
import {PageConfig, PageDefaultTitle} from '../../../config/page.config';

import {Title} from '@angular/platform-browser';

@Injectable()
export class PageService {

  private appTitle: string;

  constructor(//private titleService: Title
  ) {
  }

  getPageIn(routeIn: any) {
    //设置标题
    this.appTitle = PageConfig[routeIn] ? PageConfig[routeIn]['title'] : PageDefaultTitle;

  }

  /**
   * 设置页面全局信息
   * @param routeIn
   */
  setPageIn(accessDataService: any) {
    //设置访问信息
    //accessDataService.setAccessRouteIn(routeIn);
  }


  /**
   * 设置文档标题
   * @param routeIn route信息
   *
   *
   */
  public setPageTitle(routeIn: any, secondTitle?: any) {
    this.getPageIn(routeIn);

    //this.titleService.setTitle( this.appTitle );
  }
}
