import {Component, OnInit, Inject, ViewChild, ViewEncapsulation} from '@angular/core';
import {UserContactComponent} from "./user-contact.component";
import {Router} from "@angular/router";

@Component({
  selector: 'user-price',
  templateUrl: '../template/user-price.component.html',
  styleUrls: ['../../../assets/css/user/new-login.css'],
  encapsulation:ViewEncapsulation.None
})

export class UserPriceComponent implements OnInit {
  public isBusiness = false;
  private isShowContactUs: boolean = true;

  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any,) {
  }

  @ViewChild('contentMove') public contentMove;
  @ViewChild('content') public content;
  @ViewChild('contactUs') public contactUsComponent: UserContactComponent;

  ngOnInit() {
  }

  /**
   * 切换类型 1 private ， 0 business
   * @param type
   * @param event
   */
  onSelect(type: number, event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.isBusiness = !type;
  }

  /**
   * 切换语言
   * @param event
   * @param lan
   */
  switchLanguage(event: any, lan: string) {
    event.stopPropagation();
    this.translate.switchLan(lan);
  }


  /**
   * 点击logo
   */
  onClickLogo(event: any) {
    this.router.navigate(['/home/login']);
  }


  /**
   *
   * @param event
   */
  clickShowContactUs(event: any) {
    if (event) {
      event.stopPropagation();
    }

    this.isShowContactUs = !this.isShowContactUs;
    this.contactUsComponent.isShow = !this.isShowContactUs;
    if (!this.contactUsComponent.isShow) {
      this.contactUsComponent.form.reset();
      this.contactUsComponent.resetError();
    }
  }
}