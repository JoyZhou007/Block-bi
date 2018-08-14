/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/9/25.
 */
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/9/12.
 */

import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";

@Component({
  selector: 'home-header',
  templateUrl: '../template/home-header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class HomeHeaderComponent {
  public current: string = '';
  constructor(public router: Router,public activeRouter: ActivatedRoute, @Inject('bi-translate.service') public translate: any) {
    this.activeRouter.url.subscribe((value: UrlSegment[]) => {
      if (value.length === 2 && value[0].path == 'home') {
        this.current = value[1].path;
      }
    })
  }

  switchLanguage(event: any, lan: string) {
    event.stopPropagation();
    this.translate.switchLan(lan);
  }

  clickLogo() {
    this.router.navigateByUrl('home/login');
  }
}