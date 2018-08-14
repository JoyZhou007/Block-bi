import { AfterViewInit, Component, HostListener, Inject, Input, Renderer, ViewChild } from "@angular/core";
import { ContactModelService, ContactsList } from "../../services/index.service";

@Component({
  selector: 'search-list',
  template: `
      <div [class.s-style3-warp]="needWarp" (click)="contactListSe($event)">
          <div class="s-style3" #showContactSe [class.h-contact-list-se]="showContactListSe"
               [class.h-contact-list-w]="isClosing">
              <span class="font-search-blue" [class.hide]="showContactListSe"
                    (mouseenter)="onHoverSearch($event)" (mouseleave)="onLeaveSearch($event)"></span>
              <span class="font-search-blue1" [class.hide]="!showContactListSe"></span>
              <ul class="pull-left s-style3-warp hide">
                  <li class="s-style3-list-bg1">
                      <span class="pull-left f4-f">Kenneth</span>
                      <span class="pull-left"><em class="font-page-esc-small"></em></span>
                  </li>
              </ul>
              <input class="pull-left f25-f g-search-font g-font-normal" type="text" #searchContacts
                     (keyup)="searchContactsImport(searchContacts.value)"
                     (compositionstart)="inputChineseCodeStart($event)"
                     (compositionend)="inputChineseCodeEnd($event)"
              />
              <span class="pull-right font-page-esc-small" (click)="closeSearch($event)"></span>
          </div>
      </div>`
})

export class SearchListComponent implements AfterViewInit {
  private needWarp: boolean = true;
  private isInputChinese: boolean = false;
  private searchTimer: any;

  @Input()
  public set setNeedWarp(data: boolean) {
    this.needWarp = data;
  }

  private showContactListSe: boolean = false;
  private isClosing: boolean = false;
  private searchValue: string = '';
  private data: any = {};
  private getDataList: any = {};
  private cloneData: any = {};
  private dataList: any = {};
  private searchMemberList: any[];
  private userContactList: any = {};
  private trimSearch: any = null;
  private isSearchResult: boolean = false;

  @ViewChild('showContactSe') private showContactSe: any;
  @ViewChild('searchContacts') public searchContacts: any;

  @Input() set searchParam(data: any) {
    if (data) {
      this.data = this.typeService.clone(data);
      this.getDataList = this.data.data;
      this.cloneData = this.typeService.clone(this.data.data);
      if (data.hasOwnProperty('val') && (data.val !== '')) {
        this.contactListSe();
        this.searchContacts.nativeElement.value = data.val ? data.val : '';
      }
      if (data.hasOwnProperty('close') && data.close) {
        this.searchContacts.nativeElement.value = '';
        this.closeSearch();
      }
    }
  }

  constructor(private contactModelService: ContactModelService,
              public renderer: Renderer,
              @Inject('page.element') public element: any,
              @Inject('type.service') public typeService: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('page-animation.service') public animationService: any,
              @Inject('notice-dialog.service') public noticeDialogService: any) {
  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    let className: string = this.showContactSe.nativeElement.className;
    if (this.searchContacts.nativeElement.value == '' && /h-contact-list-se/.test(className)) {
      if(this.isSearchResult) {
        this.closeSearch();
      }else {
        this.showContactListSe = false;
      }
    }
  }


  ngAfterViewInit() {
    this.data.isShow = false;
    if (this.data && this.getDataList) {
      for (let list in this.getDataList) {
        this.dataList[list] = [];
      }
    }
  }

  /**
   * 带有接口搜索
   * @param val
   */
  searchInterface(val: string) {
    switch (this.data.interfaceType) {
      case 'contacts':
        this.searchContact(val);
        break;
    }
  }

  /**
   * 联系人
   * @param val
   */
  searchContact(val: string) {
    clearTimeout(this.trimSearch);
    let args = {keywords: val};
    this.searchValue = val ? val : '';
    if (val === '') {
      this.listCallBack();
    } else {
      let strLen: number = val.length;
      if (strLen < 2) return false;
      this.trimSearch = setTimeout(() => {
        this.contactSearch(val, args);
      }, 300)
    }
  }

  /**
   * 联系人搜索接口
   * @param val
   * @param args
   */
  contactSearch(val, args: any) {
    this.contactModelService.contactSearch(args,
      (data: any) => {
        if (data.status === 1) {
          let isShow = false;
          this.dataList['isShow'] = false;
          this.searchList(val);
          this.dataList['searchMemberList'] = this.typeService.bindDataList(
            ContactsList.init(), data.data.NoRelation);
          this.data.callBack(this.dataList, isShow);
        }
      }
    );
  }

  /**
   * 不带接口搜索
   * @param val
   */
  searchList(val: string) {
    this.dataList['val'] = val;
    for (let list in this.getDataList) {
      this.dataList[list] = this.typeService.regExpList(this.getDataList[list], val, this.data.name);
    }
    if (!this.data.interfaceType) {
      if (this.data.callBack) {
        this.data.callBack(this.dataList);
      }
    }
  }

  /**
   * 搜索传过来的列表
   * @param val
   */
  searchParamList(val: string) {
    this.dataList = this.typeService.regExpList(this.getDataList, val, this.data.name);
    this.data.callBack(this.dataList);
  }

  /**
   * 展示搜索框
   */
  contactListSe(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    if (!this.element.hasClass(this.showContactSe.nativeElement, 'h-contact-list-se')) {
      clearTimeout(this.searchTimer);
      this.showContactListSe = true;
      this.isClosing = false;
    }
  }


  /**
   * 关闭搜索框
   * @param event
   */
  closeSearch(event?: any) {
    if (event) {
      event.stopPropagation();
    }
    this.isClosing = true;
    this.showContactListSe = false;
    this.searchContacts.nativeElement.value = '';
    if (this.data.hasOwnProperty('interfaceType') && this.data.interfaceType === 'contacts') {
      if (this.cloneData) {
        this.data.callBack(this.cloneData, true);
      } else {
        this.userContactList = this.userDataService.getContactList();
        this.data.callBack(this.userContactList, true);
      }
    }
  }

  /**
   * 返回值
   */
  listCallBack() {
    if (this.data.callBack) {
      switch (this.data.interfaceType) {
        case 'contacts':
          if (this.cloneData) {
            this.data.callBack(this.cloneData, true);
          } else {
            this.userContactList = this.userDataService.getContactList();
            this.data.callBack(this.userContactList, true);
          }
          break;
        default:
          this.data.callBack(this.cloneData, true);
          break;
      }
    }

  }

  /**
   * 搜索
   * @param val
   */
  searchContactsImport(val: string) {
    if(val) {
      this.isSearchResult = true;
    }else {
      this.isSearchResult = false;
    }
    if (!this.isInputChinese) {
      if (this.data.interfaceType) {
        if (this.data.interfaceType === 'not') {
          this.searchParamList(val);
        } else {
          this.searchInterface(val);
        }
      } else {
        this.searchList(val);
      }
    }

  }

  /**
   * 中文输入开始
   * @param event
   */
  public inputChineseCodeStart(event: KeyboardEvent): void {
    this.isInputChinese = true;
  }

  /**
   * 中文输入结束
   * @param event
   */

  public inputChineseCodeEnd(event: KeyboardEvent): void {
    this.isInputChinese = false;
  }

  /**
   * hover搜索超过300ms触发
   */
  onHoverSearch(event: any) {
    event.stopPropagation();
    let self = this;
    this.searchTimer = setTimeout(() => {
      self.contactListSe();
    }, 300);
  }

  /**
   * 鼠标移出取消hover触发
   */
  onLeaveSearch(event: any) {
    event.stopPropagation();
    clearTimeout(this.searchTimer);
  }

}
