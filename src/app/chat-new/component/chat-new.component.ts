/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/28.
 */
import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation, ElementRef
} from "@angular/core";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {ChatMenuNewComponent} from "./chat-menu-new.component";
import {ChatContentNewComponent} from "./chat-content-new.component";
import {ChatSearchNewComponent} from "./chat-search-new.component";
import {ChatCommentsNewComponent} from "./chat-comments-new.component";
import {ChatMemberDetailComponent} from "./chat-member-detail.component";
import {ChatPostNewComponent} from "./chat-post.component";
import {ChatPostReadComponent} from "./chat-post-read.component";
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {Subscription} from "rxjs/Subscription";
import {EmojiPickerOptions} from "../../bi-emoji-panel/services/emoji-picker.service";
import {EmojiPickerAppleSheetLocator} from "../../bi-emoji-panel/sheets/sheet_apple_map";


@Component({
  selector: 'bi-chat-new',
  templateUrl: '../template/chat-new.component.html',
  providers: [Location, {
    provide: LocationStrategy,
    useClass: PathLocationStrategy
  }, EmojiPickerOptions],
  styleUrls: ['../../../assets/css/chat/chat-new.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatNewComponent implements AfterViewInit, OnDestroy {


  // 用户是否打开全局聊天
  public hasInit: boolean = false;
  public chatFullOpen: boolean = false;
  // 显示默认首页
  public isDefaultContent: boolean = true;

  public isShowImgDialog: boolean = false;

  @ViewChild('chatMenuComponent') public chatMenuComponent: ChatMenuNewComponent;
  @ViewChild('chatContentComponent') public chatContentComponent: ChatContentNewComponent;
  @ViewChild('chatSearchComponent') public chatSearchComponent: ChatSearchNewComponent;
  @ViewChild('chatMemberDetailComponent') public chatMemberDetailComponent: ChatMemberDetailComponent;
  @ViewChild('chatCommentsComponent') public chatCommentsComponent: ChatCommentsNewComponent;
  @ViewChild('newChatPostComponent') public newChatPostComponent: ChatPostNewComponent;
  @ViewChild('readChatPostComponent') public readChatPostComponent: ChatPostReadComponent;

  //显示chat-post
  public showPostChat: boolean = false;
  //打开chat-post的次数
  public openPostCounts: number = 0;
  private showReadPostChat: boolean = false;
  private searchChatInfo: string = '';
  public location: any;
  public subscription: Subscription;
  public counters: number = 1;
  public specificData: any = {};

  constructor(public router: Router,
              private ele: ElementRef,
              private activateRouter: ActivatedRoute,
              public chatModelService: ChatModelService,
              @Inject('app.config') public appConfig: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('im.service') public chatService: any,
              @Inject('type.service') public typeService: any,
              private emojiPickerOptions: EmojiPickerOptions,
              location: Location,
              @Inject('notification.service') public notificationService: any,
              @Inject('chat-message-data.service') public messageDataService: any) {
    this.emojiPickerOptions.setEmojiSheet({
      url: '../../assets/images/sheet_apple_32.png',
      locator: EmojiPickerAppleSheetLocator
    });
    this.location = location;
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
    this.ele.nativeElement.addEventListener('click', (evt: any) => {
      // search
      if (this.chatSearchComponent && this.chatSearchComponent.showSearchComponent) {
        this.chatSearchComponent.resetSearchStatus(evt);
      }

    })
  }

  ngAfterViewInit(): void {
    //TODO 确认加载完数据之后允许显示
    this.hasInit = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dealMessage(message: any) {
    switch (message.act) {
      case this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG:
        this.openChat(message.data);
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_SPECIFIC_PEOPLE:
        this.openSpecificChat();
        if (message.data) {
          this.specificData = message.data;
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_HIDE_CHAT_COMPONENT:
        this.chatFullOpen = false;
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_CLOSE_FULL_DIALOG:
        this.closeChat(message.data);
        break;
      case this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_INPUT_NEW_POST:
        if (message.data.isReadMode) {
          this.showReadModePost(message.data.isReadMode);
        } else { //新建
          this.showChatPost(message.data);
        }
        break;
      case this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG:
        this.isShowImgDialog = true;
        break;
      case this.notificationService.config.ACT_COMPONENT_CLOSE_IMAGE_DIALOG:
        this.isShowImgDialog = false;
        break;
      default:
        break;
    }
  }

  openSpecificChat() {
    if (!this.chatFullOpen) {
      this.chatFullOpen = true;
    }
  }

  /**
   *
   * @param data
   */
  openChat(data?: any) {
    // 打开时是显示默认首页还是关闭之前的聊天组
    // let navigationExtras: NavigationExtras = {
    //   preserveQueryParams: true,
    //   fragment: this.appConfig.loadChatFragment
    // };
    // let redirectTo = redirect ? redirect: this.location.path();
    // this.router.navigateByUrl(redirectTo, navigationExtras);
    this.chatFullOpen = true;
    this.isDefaultContent = (typeof data === 'undefined') || data.hasOwnProperty('isDefault');
    this.chatMenuComponent.initMenuList();
    if (this.isDefaultContent) {
      this.chatContentComponent.loadDefaultContent();
      if (this.chatMenuComponent.hasOwnProperty('currentGroup')) {
        delete this.chatMenuComponent.currentGroup;
      }
    } else {
      this.chatContentComponent.loadChatContent(data);
    }
    // this.showPostChat = false;
    this.counters++;
  }

  closeChat(redirect?: string) {
    let navigationExtras: NavigationExtras = {
      preserveQueryParams: false,
      preserveFragment: false
    };
    let redirectTo = redirect ? redirect : this.location.path();
    this.router.navigateByUrl(redirectTo, navigationExtras);
    this.chatFullOpen = false;
    this.searchChatInfo = '';
  }

  /**
   * 新建chat-post
   */
  showChatPost(data): void {
    this.showPostChat = data.showPost;
    this.newChatPostComponent.showChatPost = !data.showPost;
    if (data.currentItem) {
      this.newChatPostComponent.channelFormChat = data.currentItem;
    } else {
      this.newChatPostComponent.channelFormChat = this.chatMenuComponent.currentGroup;
    }

    if (this.chatMenuComponent.currentGroup) {
      this.notificationService.postNotification({
        act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_SET_SHARETO_NULL,
        data: {
          destroyShareToDialogData: true
        }
      });
    }
    // 第一次进去会读取最新一条draft
    this.openPostCounts++;
    if (this.openPostCounts === 1) {
      this.newChatPostComponent.showLastedDraft()

    }
    this.newChatPostComponent.counters++;
  }

  /**
   * 打开read模式post
   */
  showReadModePost(data): void {
    this.showReadPostChat = data;
    this.readChatPostComponent.showChatPost = !data;
  }

  /**
   * 发送聊天搜索信息
   */
  sendSearchChatMessage(data: string): void {
    this.searchChatInfo = data;
    this.chatSearchComponent.getOutDefault();
  }

  /**
   * 清空搜索框
   */
  clearSearchContent() {
    this.chatContentComponent.clearSearch();
  }

}