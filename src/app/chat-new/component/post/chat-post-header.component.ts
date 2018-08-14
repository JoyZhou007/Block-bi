import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ElementRef, Injectable,
  HostListener
} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {DateService} from "../../../shared/services/common/data/date.service";


@Component({
  selector: 'chat-post-header',
  templateUrl: '../../template/post/chat-post-header.component.html',
  providers: []
})

export class ChatPostHeaderComponent implements OnInit {


  //点击图标显示
  @Output() public showDetail = new EventEmitter<any>();

  public _showAboutDetail: boolean = false;
  public _showDraftDetail: boolean = false;
  public _showCommentDetail: boolean = false;
  private currentForm: any;
  private btnFail: string = '';

  set showAboutDetail(data: boolean) {
    this._showAboutDetail = data;
  }

  get showAboutDetail(): boolean {
    return this._showAboutDetail;
  }

  set showDraftDetail(data: boolean) {
    this._showDraftDetail = data;
  }

  get showDraftDetail(): boolean {
    return this._showDraftDetail;
  }

  set showCommentDetail(data: boolean) {
    this._showCommentDetail = data;
  }

  get showCommentDetail(): boolean {
    return this._showCommentDetail;
  }

  //点击显示修改typeName的框
  public showName: boolean = false;
  public postNameValue: string = '';
  @ViewChild('typeName') public typeName: ElementRef;

  //draft 的名字
  public draftTitle: string = '';

  //点击save
  @Output() public saveDraft = new EventEmitter<any>();

  //点击X关闭页面
  @Output() public displayChatPost = new EventEmitter<boolean>();

  public _appearChatPost: boolean = false;

  set appearChatPost(data: boolean) {
    this._appearChatPost = data;
  }

  get appearChatPost(): boolean {
    return this._appearChatPost;
  }


  //upload chatPost
  @Output() public OutLoadChatPost = new EventEmitter<any>();

  //openShareToDialog
  @Output() public OutOpenShareToDialog = new EventEmitter<any>();

  //uploadFile
  @Output() public OutUploadFile = new EventEmitter<any>();

  //open forward dialog
  @Output() public OutForward = new EventEmitter<any>();

  public postGroupName: string = 'GLOBAL';
  public postGroupClsName: string = '';
  public postFriendName: string = '';
  public isFriend: boolean = false;


  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              @Inject('date.service') public dateFormatService: DateService,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public config: any,
              public chatModelService: ChatModelService) {

  }

  ngOnInit() {
    this.draftTitle = 'Type your post name in here';
  }

  /**
   * 设置当前form
   */
  @Input() set setchannelFormChat(data: any) {
    this.currentForm = data ? data.form : 1;

  };

  /**
   * 错误信息
   * @param data
   */
  @Input() set btnFailData(data: any) {
    if(data && data.msg){
      this.btnFail = data.msg;
      setTimeout(() => {
        this.btnFail = '';
      },3000);
    }
  }

  /**
   * 点击显示对应的内容
   */
  showCont(event: any, type): void {
    event.stopPropagation();
    switch (type) {
      case 'about' :
        this._showAboutDetail = !this._showAboutDetail;
        this._showDraftDetail = false;
        this._showCommentDetail = false;
        break;
      case 'draft' :
        this._showDraftDetail = !this._showDraftDetail;
        this._showAboutDetail = false;
        this._showCommentDetail = false;

        break;
      default:
      case 'comment' :
        this._showCommentDetail = !this._showCommentDetail;
        this._showAboutDetail = false;
        this._showDraftDetail = false;
        break;
    }
    let detail = {
      about: this._showAboutDetail,
      draft: this._showDraftDetail,
      comment: this._showCommentDetail
    };
    this.showDetail.emit(detail);
  }

  /**
   * 点击修改名字
   */
  showTypeName(event: any, ipt: HTMLInputElement): void {
    event.stopPropagation();
    setTimeout(() => {
      ipt.focus();
    });
    this.showName = true;
    if (this.draftTitle && this.draftTitle !== 'Type your post name in here') {
      this.postNameValue = this.draftTitle;
    }
  }

  /**
   * 还原title文本框
   * @param event
   */
  setupTitleInput(event) {
    if (this.showName) {
      if (event.target.tagName !== 'INPUT') {
        this.showName = false;
        if (this.postNameValue) {
          this.draftTitle = this.postNameValue;
          // this.displayName.nativeElement.innerText = this.postNameValue;
        } else {
          this.draftTitle = 'Type your post name in here';
        }
      }
    }
  }
  /**
   * 回车确定修改名字
   */
  editName(event: any): void {
    if (event.keyCode === 13 || event.keyCode === 9) {
      if (this.postNameValue) {
        this.draftTitle = this.postNameValue;
        // this.displayName.nativeElement.innerText = this.postNameValue;
      } else {
        this.draftTitle = 'Type your post name in here';
      }
      this.showName = false;
    } else if (event.keyCode === 27) {
      this.showName = false;
    }
  }

  /**
   * 存进草稿箱
   */
  addIntoDraft(event: any,element?:any): void {
    // event.stopPropagation();
    if (this.showName) {
      if (event.target.tagName !== 'INPUT') {
        this.showName = false;
        if (this.postNameValue) {
          this.draftTitle = this.postNameValue;
          // this.displayName.nativeElement.innerText = this.postNameValue;
        } else {
          this.draftTitle = 'Type your post name in here';
        }
      }
    }
    this.saveDraft.emit({title:this.draftTitle,element:element});
  }

  /**
   *  upload chatPost
   */
  uploadChatPost(event: any,element:any) {
    // event.stopPropagation();
    if (this.showName) {
      if (event.target.tagName !== 'INPUT') {
        this.showName = false;
        if (this.postNameValue) {
          this.draftTitle = this.postNameValue;
          // this.displayName.nativeElement.innerText = this.postNameValue;
        } else {
          this.draftTitle = 'Type your post name in here';
        }
      }
    }
    this.OutLoadChatPost.emit({title:this.draftTitle,element:element});
  }

  /**
   * 点击X返回chat
   */
  returnToChat(event: any): void {
    event.stopPropagation();
    this.appearChatPost = true;
    this.displayChatPost.emit(this.appearChatPost);
  }

  /**
   * open shareTo dialog
   */
  openShareToDialog(): void {
    this.OutOpenShareToDialog.emit(this.draftTitle)
  }

  /**
   * upload file
   */
  uploadFile(event: any, inputFileObj: any): void {
    event.stopPropagation();
    inputFileObj.click();
  }

  /**
   * selectedFile
   */
  selectedFile(event: any, file: any): void {
    event.stopPropagation();
    let filesObj = file.files;
    this.OutUploadFile.emit(filesObj);
    file.value = null;
    /* for(let value of filesObj){
     let reader: FileReader = new FileReader();
     reader.onload = function (oFREvent: any) {
     value['fileSrc'] = oFREvent.target.result;
     };
     }*/

    /* for(let i=0; i<filesObj.length;i++){
     let reader: FileReader = new FileReader();
     reader.onload = function (oFREvent: any) {
     filesObj[i]['fileSrc'] = oFREvent.target.result;
     };
     filesObj.test='test';
     }*/

  }

  /**
   * open forward dialog
   */
  openForwardDialog(event: any): void {
    event.stopPropagation();
    this.OutForward.emit();
  }


  /**
   *
   * @param event
   */
  openChat(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_OPEN_FULL_DIALOG
    })
  }

  /**
   * importFileFromBI
   */
  importFileFromBI(event: any) {
    event.stopPropagation();
    let optionData: any = {
      currentItem: {
        isPost: true,
        form: this.currentForm
      },
    };
    this.dialogService.openNew({
      mode: '4',
      isSimpleContent: false,
      componentSelector: 'import-file',
      componentData: this.typeService.clone(optionData),
      buttons: [
        {
          type: 'cancel',
          btnText: 'CANCEL'
        },
        {
          type: 'send',
          btnText: 'IMPORT',
          btnEvent: 'importFileToPost'
        }
      ]
    })
  }

  /**
   * 点击? 弹出 post 帮助
   */
  showNewPostHelp(event:any) {
    event.stopPropagation();
    this.router.navigate(['help/help-post']);
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_HIDE_CHAT_COMPONENT,
      data: {}
    });
  }


}

