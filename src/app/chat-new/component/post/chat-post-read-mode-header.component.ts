import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ElementRef, Injectable,
  HostListener
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ChatModelService } from "../../../shared/services/model/chat-model.service";
import { DateService } from "../../../shared/services/common/data/date.service";
import { ChatMenuList } from "../../../shared/services/model/entity/chat-entity";


@Component({
  selector: 'chat-post-read-mode-header',
  templateUrl: '../../template/post/chat-post-read-mode-header.component.html',
  providers: []
})

export class ChatPostReadModeHeaderComponent implements OnInit {

  public mode: string = 'read';
  @Output() public OutputRevokePost = new EventEmitter<any>();

  @Input('settings')
  set settings(data: any) {
    if (data) {
      this.mode = data.hasOwnProperty('mode') && data.mode ? data.mode : 'create';
    }

  }

  //点击图标显示
  @Output() public showDetail = new EventEmitter<any>();

  public _showAboutDetail: boolean = false;
  public _showCommentDetail: boolean = false;

  set showAboutDetail(data: boolean) {
    this._showAboutDetail = data;
  }

  get showAboutDetail(): boolean {
    return this._showAboutDetail;
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
  @ViewChild('displayName') public displayName: ElementRef;

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


  //read模式下隐藏相应的模块
  public _hideInRead: boolean = false;

  set hideInRead(data: boolean) {
    this._hideInRead = data;
  }

  get hideInRead(): boolean {
    return this._hideInRead;
  }


  //open forward dialog
  @Output() public OutForward = new EventEmitter<any>();
  @Output() public outArchivePostToFolder = new EventEmitter<any>();
  @Output() public outDownloadPost = new EventEmitter<any>();

  public currentItem: ChatMenuList;

  public currentGroupName: string = 'GLOBAL';
  public currentGroupClsName: string = '';
  public currentForm: number = 0;
  public isFriend: boolean = false;
  public currentFriendName: boolean = false;

  @Input() public showDelete: boolean = false;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              @Inject('date.service') public dateFormatService: DateService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public config: any,
              public chatModelService: ChatModelService) {

  }

  ngOnInit() {
    this.draftTitle = 'Type your post name in here';
  }

  /**
   * 点击显示对应的内容
   */
  showCont(event: any, type): void {
    switch (type) {
      case 'about' :
        this._showAboutDetail = !this._showAboutDetail;
        this._showCommentDetail = false;
        break;
      case 'draft' :
        this._showAboutDetail = false;
        this._showCommentDetail = false;

        break;
      default:
      case 'comment' :
        this._showCommentDetail = !this._showCommentDetail;
        this._showAboutDetail = false;
        break;
    }
    let detail = {
      about: this._showAboutDetail,
      comment: this._showCommentDetail
    };
    this.showDetail.emit(detail);
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
   * open forward dialog
   */
  openForwardDialog(event: any): void {
    event.stopPropagation();
    this.OutForward.emit();
  }

  /**
   * revoke post
   * @param event
   */
  revokePost(event: any): void {
    event.stopPropagation();
    this.OutputRevokePost.emit();
  }


  archiveToFolder(event: any) {
    event.stopPropagation();
    this.outArchivePostToFolder.emit();
  }


  /**
   * 下载这个邮件
   */
  downloadThePost(event: any) {
    event.stopPropagation();
    this.outDownloadPost.emit();
  }

}

