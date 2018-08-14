import {Component, HostListener, Inject, ViewChild, ViewEncapsulation} from "@angular/core";
import { UserContactComponent } from "./user-contact.component";
import { Router } from "@angular/router";
@Component({
  selector: 'user-about',
  templateUrl: '../template/user-about-us.component.html',
  styleUrls: ['../../../assets/css/user/new-login.css'],
  encapsulation: ViewEncapsulation.None
})

export class UserAboutComponent {
  // public clickCounts: number = 0;
  public isFilterShow: boolean = false;
  public isPicShow: boolean = false;
  public isIdeaFlip: boolean = false;
  public isServiceFlip: boolean = false;
  public isMarketingFlip: boolean = false;
  public isTechnicalFlip: boolean = false;
  public isMainShow: boolean = true;
  //显示contact-us
  public isShowContactUs: boolean = false;

  @ViewChild('contactUs') public contactUsComponent: UserContactComponent;

  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any) {
  }

  switchLanguage(event: any, lan: string) {
    event.stopPropagation();
    this.translate.switchLan(lan);
  }


  @HostListener('document:mousewheel', ['$event'])
  mousewheel(event: any) {
    // event.stopPropagation();
    if (event.wheelDelta > 0) {
      this.isMainShow = true;
      this.isPicShow = false;
      this.isFilterShow = false;
    } else {
      this.isPicShow = true;
      this.isMainShow = false;
      this.isFilterShow = true;
    }
  }

  @HostListener('document:DOMMouseScroll', ['$event'])
  DOMMouseScroll(event: any) {
    // event.stopPropagation();
    if (event.detail < 0) {
      this.isMainShow = true;
      this.isPicShow = false;
      this.isFilterShow = false;
    } else {
      this.isPicShow = true;
      this.isMainShow = false;
      this.isFilterShow = true;
    }
  }

  @HostListener('document:onmousewheel', ['$event'])
  onmousewheel(event: any) {
    // event.stopPropagation();
    if (event.wheelDelta < 0) {
      this.isMainShow = true;
      this.isPicShow = false;
      this.isFilterShow = false;
    } else {
      this.isPicShow = true;
      this.isMainShow = false;
      this.isFilterShow = true;
    }
  }

  /**
   * 点击翻牌事件
   */
  public flip(event: any, type: string, num: number): void {
    event.stopPropagation();
    if (type === 'idea') {
      this.isIdeaFlip =
        this.isIdeaFlip != true;
      this.isServiceFlip = false;
      this.isMarketingFlip = false;
      this.isTechnicalFlip = false;
    } else if (type === 'service') {
      this.isServiceFlip =
        this.isServiceFlip != true;
      this.isIdeaFlip = false;
      this.isMarketingFlip = false;
      this.isTechnicalFlip = false;
    } else if (type === 'marketing') {
      this.isMarketingFlip =
        this.isMarketingFlip != true;
      this.isIdeaFlip = false;
      this.isServiceFlip = false;
      this.isTechnicalFlip = false;
    } else if (type === 'technical') {
      this.isTechnicalFlip =
        this.isTechnicalFlip != true;
      this.isIdeaFlip = false;
      this.isServiceFlip = false;
      this.isMarketingFlip = false;
    }
  }

  /**
   *
   * @param event
   */
  clickShowContactUs(event: any): void {
    if (event) {
      event.stopPropagation();
    }

    this.isShowContactUs = !this.isShowContactUs;
    this.contactUsComponent.isShow = this.isShowContactUs;
    if (!this.contactUsComponent.isShow) {
      this.contactUsComponent.form.reset();
      this.contactUsComponent.resetError();
    }
  }

  /**
   * 点击logo
   */
  onClickLogo(event: any) {
    this.router.navigate(['/home/login']);
  }

}