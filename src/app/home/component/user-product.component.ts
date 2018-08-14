import {Component, OnInit, Inject, HostListener, ViewChild, ViewEncapsulation} from '@angular/core';
import {UserContactComponent} from "./user-contact.component";
import {Router} from "@angular/router";
import * as productConfig from '../../shared/config/product.config';

@Component({
  selector: 'user-product',
  templateUrl: '../template/user-product.component.html',
  styleUrls: ['../../../assets/css/user/new-login.css'],
  encapsulation:ViewEncapsulation.None
})

export class UserProductComponent implements OnInit {
  //常量
  public productChat: string = productConfig.USER_PRODUCT_CHAT;
  public productMission: string = productConfig.USER_PRODUCT_MISSION;
  public productFiles: string = productConfig.USER_PRODUCT_FILES;
  public productBusiness: string = productConfig.USER_PRODUCT_BUSINESS;
  public productPerson: string = productConfig.USER_PRODUCT_PERSON;
  public productImage: string = productConfig.USER_PRODUCT_IMAGE;
  public productStaff: string = productConfig.USER_PRODUCT_STAFF;
  public productAttendance: string = productConfig.USER_PRODUCT_ATTENDANCE;
  public productTravel: string = productConfig.USER_PRODUCT_TRAVEL;
  public productTrack: string = productConfig.USER_PRODUCT_TRACK;
  public backgroundWidth: number = productConfig.USER_PRODUCT_BACKGROUND_WIDTH;
  public backgroundHeight: number = productConfig.USER_PRODUCT_BACKGROUND_HEIGHT;


  private isShowChat: boolean = false;
  private isShowFiles: boolean = false;
  private isShowPerson: boolean = false;
  private isShowBusiness: boolean = false;
  private isShowMission: boolean = false;
  public scrollWidth: number;
  public scrollHeight: number;
  private isShowImageBubble: boolean = false;
  private isShowStaffBubble: boolean = false;
  private isShowAttendanceBubble: boolean = false;
  private isShowTravelBubble: boolean = false;
  private isShowTrackBubble: boolean = false;
  private isShowContactUs: boolean = true;
  private isProduct: boolean = true;
  private btnTop: number;
  private btnRight: number;
  private isShowLeft: boolean = false;
  private isShowRight: boolean = false;
  private isMaxHeight: boolean = false;

  constructor(public router: Router,
              @Inject('app.config') public config: any,
              @Inject('bi-translate.service') public translate: any,) {
  }

  @ViewChild('contentMove') public contentMove;
  @ViewChild('content') public content;
  @ViewChild('contactUs') public contactUsComponent: UserContactComponent;

  ngOnInit() {
    this.scrollWidth = this.contentMove.nativeElement.scrollWidth;
    this.scrollHeight = this.contentMove.nativeElement.scrollHeight;

    this.btnTop = 67 + this.content.nativeElement.clientHeight / 2;
    this.btnRight = 20;
    if (document.documentElement.clientHeight > this.backgroundHeight) {
      this.btnTop = 67 + Math.floor(this.backgroundHeight / 2);
      this.isMaxHeight = true;
    }
    if (document.documentElement.clientWidth > this.backgroundWidth) {
      this.btnRight = 20 + ((document.documentElement.clientWidth - this.backgroundWidth) / 2);
    }
    let self = this;
    window.onresize = () => {
      self.btnTop = 67 + this.content.nativeElement.clientHeight / 2;
      self.btnRight = 0;
      if (document.documentElement.clientHeight > this.backgroundHeight) {
        self.btnTop = 67 + Math.floor(this.backgroundHeight / 2);
        self.isMaxHeight = true;
      }
      if (document.documentElement.clientWidth > this.backgroundWidth) {
        self.btnRight =20 + ((document.documentElement.clientWidth - this.backgroundWidth) / 2);
      }
    }
  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowMission = false;
    this.isShowChat = false;
    this.isShowBusiness = false;
    this.isShowFiles = false;
    this.isShowPerson = false;

    this.isShowImageBubble = false;
    this.isShowAttendanceBubble = false;
    this.isShowStaffBubble = false;
    this.isShowTrackBubble = false;
    this.isShowTravelBubble = false;
  }

  /**
   * 监听鼠标移动事件
   * @param event
   */
  @HostListener('document:mousemove', ['$event'])
  mousemove(event: any) {

    //浏览器宽度大于2190
    if(document.documentElement.clientWidth > this.backgroundWidth){
      if(event.clientX > ((document.documentElement.clientWidth - this.backgroundWidth) / 2) &&
        event.clientX < ((document.documentElement.clientWidth - this.backgroundWidth) / 2) + 150){
        this.isShowLeft = true;
      }else{
        this.isShowLeft = false;
      }
      if(event.clientX > (this.backgroundWidth + ((document.documentElement.clientWidth - this.backgroundWidth) / 2) - 150) &&
        event.clientX < (this.backgroundWidth + ((document.documentElement.clientWidth - this.backgroundWidth) / 2))){
        this.isShowRight = true;
      }else{
        this.isShowRight = false;
      }

    }else{
      //浏览器宽度小于2190
      let offset =0;
      if(this.isShowChat){
        offset = 300;
      }
      if (event.clientX < 150 + offset) {
        this.isShowLeft = true;
      } else {
        this.isShowLeft = false;
      }
      if (event.clientX > document.documentElement.clientWidth - 150) {
        this.isShowRight = true;
      } else {
        this.isShowRight = false;
      }
    }
  }

  /**
   *
   * @param event
   * @param type
   */
  onClickCircle(event: any, type: string) {
    if (event) {
      event.stopPropagation();
    }
    this.dealType(type);
  }

  onCloseSideBar(event: any, type: string) {
    if (event) {
      event.stopPropagation();
    }
    this.dealType(type);
  }

  /**
   *
   * @param type
   */
  dealType(type: string) {
    switch (type) {
      case this.productChat:
        this.isShowChat = !this.isShowChat;
        this.isShowMission = false;
        this.isShowBusiness = false;
        this.isShowFiles = false;
        this.isShowPerson = false;
        if (this.isShowChat) {
          this.content.nativeElement.scrollLeft = 0;
        }
        break;
      case this.productMission:
        this.isShowMission = !this.isShowMission;
        this.isShowChat = false;
        this.isShowBusiness = false;
        this.isShowFiles = false;
        this.isShowPerson = false;
        if (this.isShowMission) {
          this.content.nativeElement.scrollTop = 1200 - document.documentElement.clientHeight;
        }
        break;
      case this.productBusiness:
        this.isShowBusiness = !this.isShowBusiness;
        this.isShowChat = false;
        this.isShowMission = false;
        this.isShowFiles = false;
        this.isShowPerson = false;
        if (this.isShowBusiness) {
          this.content.nativeElement.scrollTop = 0;
        }
        break;
      case this.productFiles:
        this.isShowFiles = !this.isShowFiles;
        this.isShowChat = false;
        this.isShowBusiness = false;
        this.isShowMission = false;
        this.isShowPerson = false;
        if (this.isShowFiles) {
          this.content.nativeElement.scrollTop = 0;
        }
        break;
      case this.productPerson:
        this.isShowPerson = !this.isShowPerson;
        this.isShowFiles = false;
        this.isShowChat = false;
        this.isShowBusiness = false;
        this.isShowMission = false;

        if (this.isShowPerson) {
          this.content.nativeElement.scrollLeft = 1850 - document.documentElement.clientWidth;
        }
        break;
    }
  }

  /**
   *
   * @param event
   * @param type
   */
  onClickIcon(event: any, type: string) {
    if (event) {
      event.stopPropagation();
    }
    switch (type) {
      case this.productImage:
        this.closeAllBubble(1);
        this.isShowImageBubble = !this.isShowImageBubble;
        break;
      case this.productStaff:
        this.closeAllBubble(2);
        this.isShowStaffBubble = !this.isShowStaffBubble;
        break;
      case this.productAttendance:
        this.closeAllBubble(3);
        this.isShowAttendanceBubble = !this.isShowAttendanceBubble;
        break;
      case this.productTravel:
        this.closeAllBubble(4);
        this.isShowTravelBubble = !this.isShowTravelBubble;
        break;
      case this.productTrack:
        this.closeAllBubble(5);
        this.isShowTrackBubble = !this.isShowTrackBubble;
        break;
    }
  }

  /**
   * 关闭所有气泡
   */
  closeAllBubble(type: number){
    if(type !== 1){
      this.isShowImageBubble = false;
    }
    if(type !== 2){
      this.isShowStaffBubble = false;
    }
    if(type !== 3){
      this.isShowAttendanceBubble = false;
    }
    if(type !== 4){
      this.isShowTravelBubble = false;
    }
    if(type !== 5){
      this.isShowTrackBubble = false;
    }

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
   * 点击sidebar
   */
  onClickSideBar(event: any){
      if(event){
        event.stopPropagation();
      }
  }
}