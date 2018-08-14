import {
  Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy
} from '@angular/core';

import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {DateService} from "../../shared/services/common/data/date.service";
import {ChatConfig} from "../../shared/config/chat.config";
import {
  ChatMenuList, ChatMessage, ChatPostAttachmentFile, ChatPostContactUserInfoModel, PostReadSettings
} from "../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import * as FolderConstant from '../../shared/config/folder.config';
import {FolderModelService} from "../../shared/services/model/folder-model.service";
import {DownloadService} from "../../shared/services/common/file/download.service";
import {ChatPostReadModeHeaderComponent} from "./post/chat-post-read-mode-header.component";
import * as MissionConstant from '../../shared/config/mission.config';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'read-chat-post',
  templateUrl: '../template/chat-post-read-mode.component.html',
  styleUrls: ['../../../assets/css/chat/chat-new.css'],
  providers: [FolderModelService,]
})
/**
 * POST相关component
 */
export class ChatPostReadComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  public showDelete: boolean = false;

  get currentItem(): ChatMenuList {
    return this._currentItem;
  }

  set currentItem(value: ChatMenuList) {
    this._currentItem = value;
  }

  //常量
  public ChatConfigConstant: ChatConfig;

  //富文本编辑的默认toolbar
  private emptyArray: any[] = [];
  public toolbar: Object = {
    toolbar: [
      [{'header': [1, 2, 3, 4, 5, 6, false]}],
      ['bold', 'strike', 'underline'],
      [{'color': this.emptyArray.slice()}],
      ['link'],
      [{'align': this.emptyArray.slice()}],
    ]
  };
  public messageData: ChatMessage;

  //获取子组件chat-post-header
  @ViewChild('chatPostHeader') public chatPostHeader: ChatPostReadModeHeaderComponent;
  @ViewChild('test') public test: ElementRef;

  //点击图标显示
  public showAboutDetail: boolean = false;
  public showDraftDetail: boolean = false;
  public showCommentDetail: boolean = false;

  public downLoadUrl: string = 'api/folder/download-file';

  //点击显示修改typeName的框
  public showName: boolean = false;
  public postNameValue: string = '';
  //获取quill对象
  @ViewChild('quillEditor') quillEditor: any;
  @ViewChild('typeName') public typeName: ElementRef;

  public settings: PostReadSettings;
  public mode: string = 'read';
  //富文本状态为只读
  public quillReadOnly: boolean = false;
  private currentContactList: Array<any>;
  private currentGroupList: Array<any>;


  //富文本的内容
  public postContentDetail: string = '';

  //存放draft的list数组
  public draftArr: Array<any> = [];


  //draft 的名字
  public draftTitle: string = '';


  //点击X关闭页面
  public showChatPost: boolean = false;

  //时间格式
  public dateFormatStr: string = 'yyyy-mm-dd HH:MM:ss';

  //存放当前share_to的uid
  public currShareToArr: Array<any> = [];

  //存放当前share_to详情
  public currShareToDetailArr: Array<ChatPostContactUserInfoModel> = [];


  //comment Content
  public commentContent: string = '';

  //tpl comments list

  //获取鼠标滚动元素 comments
  @ViewChild('commentsScrollToBottom') public commentsScrollToBottom: ElementRef;


  //save current attachment file id
  public currentAttachmentList: Array<string> = [];

  //save attachment list
  public attachmentFileList: Array<ChatPostAttachmentFile> = [];


  public chatConfig: ChatConfig = new ChatConfig();
  public isLoading: boolean = false;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public loadEnd: boolean = false;
  public commentLists: Array<any> = [];
  public sendCommentTxt: string = '';

  @ViewChild('commentScroll') public commentScroll: any;
  private currentCommentPage: number = 1;
  private commentUsers: any = {};
  private bindPagingEvent: boolean = false;
  public isShowCommentList: boolean = false;
  public currentUUID: string;
  public currentPSID: string;

  private _currentItem: ChatMenuList;
  public subscription: Subscription;


  constructor(@Inject('date.service') public dateFormatService: DateService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public chatService: any,
              @Inject('page.element') public pageElement: any,
              @Inject('file.service') public fileService: any,
              public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              public downloadService: DownloadService,
              public folderModelService: FolderModelService) {
    this.ChatConfigConstant = new ChatConfig();
    this.settings = PostReadSettings.initReadMode();
    this.currentPSID = this.userDataService.getCurrentCompanyPSID();
    this.currentUUID = this.userDataService.getCurrentUUID();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        case this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_POST_SEND_SETTINGS:
          this.initReadModeSettings(message.data);
          if (message.data.showComments) {
            this.showCommentDetail = message.data.showComments;
            this.showAboutDetail = !message.data.showComments;
            this.chatPostHeader.showCommentDetail = message.data.showComments;
            this.chatPostHeader.showAboutDetail = !message.data.showComments;
          } else {
            this.showCommentDetail = false;
            this.showAboutDetail = true;
            this.chatPostHeader.showCommentDetail = false;
            this.chatPostHeader.showAboutDetail = true;
          }
          if (message.data.currentItem) {
            this.currentItem = message.data.currentItem;
            this.chatPostHeader.currentGroupName = message.data.currentItem.name;
            this.chatPostHeader.currentGroupClsName = message.data.currentItem.clsName;
            this.chatPostHeader.currentForm = message.data.currentItem.form;
            this.chatPostHeader.isFriend = message.data.currentItem.isFriend;
            this.chatPostHeader.currentFriendName = message.data.currentItem.work_name;

          }
          break;
        case this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE:
          if (this.messageData && message.data.msg_id === this.messageData.msg_id) {
            this.displayChatPost(true);
          }

          break;
        default:
          break;
      }
    })
  }

  initReadModeSettings(messageData): void {
    let contactListCache = this.userDataService.getContactList();
    let chatListCache = this.messageDataService.getChatListCache();
    if (contactListCache && contactListCache.hasOwnProperty('Cooperator') &&
      contactListCache.hasOwnProperty('Friend') &&
      contactListCache.hasOwnProperty('Internal')) {
      this.currentContactList =
        contactListCache.Cooperator.concat(contactListCache.Friend.concat(contactListCache.Internal));
    }

    if (chatListCache && chatListCache.hasOwnProperty('MISSION') &&
      chatListCache.hasOwnProperty('WORK') &&
      chatListCache.hasOwnProperty('PRIVATE')) {
      this.currentGroupList =
        chatListCache.MISSION.concat(chatListCache.WORK.concat(chatListCache.PRIVATE));

    }
    if (messageData) {
      let data = messageData.postSet;
      this.messageData = messageData.messageData;
      this.showChatPost = false;
      this.settings = PostReadSettings.init();
      this.settings.mode = data.hasOwnProperty('mode') && data.mode ? data.mode : 'create';
      this.settings.quillReadOnly = this.settings.mode === 'read';
      this.settings.quillCont = data.content;
      this.settings.shared_to = data.shared_to;
      this.settings.owner = data.owner;
      // change current shared_to
      this.currShareToArr = data.shared_to;
      this.settings.form = data.form;
      this.settings.post_id = data.post_id;
      this.settings.fid = data.fid;
      this.settings.title = data.title;
      //show share to
      this.fetchShareToDetail();
      this.chatPostHeader.draftTitle = data.title;
      this.showDelete = this.settings.owner == (this.userDataService.getCurrentUUID() || this.userDataService.getCurrentCompanyPSID());
      if (this.quillEditor) {
        //显示内容
        this.quillEditor.writeValue(data.content);
        this.quillEditor.draggable = false;

      }
      //读取评论
      if (this.settings.mode === 'read') {
        this.commentLists = [];
        this.loadEnd = false;
        this.showComment();
        //显示附件
        let formData = {
          data: {
            post_id: this.settings.post_id
          }
        };
        this.getAttachmentDetail(formData);
      }
    }
  }


  /**
   * 点击X关闭页面
   */
  displayChatPost(data: boolean): void {
    this.showChatPost = data;
  }

  /**
   * 监听富文本编辑器的内容
   */
  postContentChange(event: {
    editor: any
    html: any,
    text: any,
    delta: any,
    oldDelta: any,
    source: any
  }): void {
    this.postContentDetail = event.html;
  }


  /**
   * 接受头部传来的信息显示对应的右边的模块
   */
  showDetailCont(event: any): void {
    this.showAboutDetail = event.about;
    this.showDraftDetail = event.draft;
    this.showCommentDetail = event.comment;
  }

  /**
   * 点击detail里的x关闭detail
   */
  closeDetail(): void {
    this.showDraftDetail = false;
    this.showCommentDetail = false;
    this.showAboutDetail = false;
    this.chatPostHeader.showAboutDetail = false;
    this.chatPostHeader.showCommentDetail = false;
  }


  /**
   * 时间差, 允许显示单位为mo - 月, h - 小时, d - 天
   * @param d2 timestamp 结束时间
   * @param d1 timestamp 开始时间
   * @returns {{gapTime: number, diffUnit: string}}
   */
  public dateDiff(d2: any, d1: any) {
    if (typeof d1 === 'string') {
      d1 = d1.replace(/-/g, '/');
    }
    if (typeof d2 === 'string') {
      d2 = d2.replace(/-/g, '/');
    }
    let gapTime = (Date.parse(d2) - Date.parse(d1)) / 1000;
    gapTime = gapTime < 0 ? 0 : gapTime;
    let diffStatus =
      gapTime > 3600 ? 'detail' : 'min';
    let gapTimeStr: any;
    let diffUnit = '';

    switch (diffStatus) {
      case 'min':
        diffUnit = 'minutes';
        gapTimeStr = Math.floor(gapTime / (60));
        break;
      case 'detail':
      default:
        let D1 = new Date(d1);
        diffUnit = 'detail';
        gapTimeStr = this.dateFormatService.formatWithTimezone(D1);
        break;
    }
    return {
      gapTime: gapTimeStr.toString() !== 'NaN' ? gapTimeStr : -1,
      diffUnit: diffUnit
    }
  };


  /**
   * 请求share_to详情
   */
  fetchShareToDetail(): void {
    this.currShareToDetailArr = [];
    if (this.currShareToArr.length) {
      this.currShareToArr.forEach((value) => {
        for (let i in this.currentGroupList) {
          if (this.currentGroupList.hasOwnProperty(i)) {
            let dataValue = this.currentGroupList[i];
            if (dataValue.gid === value) {
              this.currShareToDetailArr.push(dataValue);
              break;
            }
          }
        }
      })
    }

  }

  /**
   * 根据id请求联系人详情
   */
  getUserInfo(formData: any): void {
    this.contactModelService.getUserInfo(formData, (response: any) => {
      if (response.status === 1) {
        this.currShareToDetailArr = response.data;
      } else {
        this.dialogService.openWarning({simpleContent: 'get user info failed!'})
      }
    })
  }


  /**
   * open forward dialog
   */
  openForwardDialog(): void {
    let channelFormChat = {
      form: this.settings.form
    };
    let componentData: any = {
      messageData: this.messageData,
      channelFormChat: channelFormChat
    };
    this.dialogService.openNew({
      mode: '1',
      title: 'FORWARD',
      isSimpleContent: false,
      componentSelector: 'chat-forward-dialog',
      componentData: this.typeService.clone(componentData),
      buttons: [{
        type: 'send',
        btnEvent: 'sendForwardData',
      }, {
        type: 'cancel'
      }]
    })
  }


  /**
   * get attachment detail api
   */
  getAttachmentDetail(formData): void {
    this.chatModelService.getDraftAttachmentInfo(formData, (response: any) => {
      if (response.status === 1) {
        //TODO attachment
        if (response.data && response.data.hasOwnProperty('fileInfo')) {
          if (response.data.fileInfo.length) {
            this.attachmentFileList = response.data.fileInfo;
            //转化成模板所需要的数据
            this.initTplAttachmentModel(this.attachmentFileList);
          }
        }
      }
    })
  }

  /**
   * init attachment
   * 处理成模板显示的数据
   */
  initTplAttachmentModel(data: Array<any>): void {
    let fidArr = [];
    data.forEach((value, index, array) => {
      if (value.ext_type === FolderConstant.FILE_TYPE_IMAGE) {
        value['isImage'] = true;
      } else {
        value['isImage'] = false;
      }
      value['whichFileType'] = {
        isExcel: value.ext_type === 'excel',
        isWord: value.ext_type === 'word',
        isPpt: value.ext_type === 'ppt',
        isAcrobat: value.ext_type === 'pdf',
        isOther: value.ext_type === 'other',
      };
      //根据时间算离最近一次修改相差的时间
      let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
      let updateTime = this.dateFormatService.utcDateFormat(new Date(value.created).getTime(), this.dateFormatStr);
      let diffTime = this.dateDiff(currentDate, updateTime);
      //离最近一次修改的时间 前端显示用
      value['fileUploadTime'] =
        diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit}` : diffTime.gapTime;
      fidArr.push(value.fid)
    });
    this.currentAttachmentList = fidArr;
  }


  /**
   * 点击下载聊天文件
   */
  downloadAttachment(event: any, fileObj: any) {
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'DOWNLOAD THE ATTACHMENT',
      isSimpleContent: true,
      simpleContent: 'Are you sure download the attachment?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnEvent: () => {
            let formData = {
              form: fileObj.type,
              fid: fileObj.fid
            };
            this.downloadService.downloadFolderFile(formData);
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * 下载整个post
   */
  downloadThePost() {
    if (!this.messageData || !this.currentItem) return;
    let sessionId = this.userDataService.getSessionId();
    let fileInfo= this.messageData.detail;
    this.downloadService.downloadTheFile(this.config.resourceFolderDomain + this.downLoadUrl + '?form=' +
      this.currentItem.form + '&fid=' + fileInfo.fid + '&session_id=' + sessionId);
  }

  /**
   * 将post 归档到BI云盘
   */
  archivePostToFolder() {
    let data = {
      isChatFile: true,
      file: this.messageData.detail,
      form: this.currentItem.form
    };
    let setOptionData = this.typeService.clone(data);
    let settings = {
      mode: '3',
      title: 'ARCHIVE',
      isSimpleContent: false,
      componentSelector: 'folder-move',
      componentData: setOptionData,
      buttons: [{
        type: 'ok',
        btnEvent: 'confirmCopyTheFile',
      }],
    };
    this.dialogService.openNew(settings);
  }




  /**
   * 发送评论
   */
  sendComment() {
    if (this.sendCommentTxt !== '') {
      let data = {
        fid: this.settings.fid,
        content: this.sendCommentTxt
      };
      this.loadEnd = false;
      this.chatModelService.addChatPostComment({
        data
      }, (res: any) => {
        //获取成功
        if (res.status === 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_COMMENT,
            data: {
              post: {
                file_name: this.settings.title,
                post_id: this.settings.post_id,
                isPost: true,
                fid: this.settings.fid
              },
              commentTxt: this.sendCommentTxt
            }
          });
          this.currentCommentPage = 1;
          this.sendCommentTxt = '';
          this.pageElement.scrollBottom(this.commentScroll.nativeElement);
          this.fetchComment();
        } else {
          this.dialogService.openWarning({simpleContent: 'send post comments failed!'})
        }
      });
    } else {
      this.dialogService.openWarning({simpleContent: 'comment content can not be empty!'})
    }
  }

  addCommentKeyDown(event): void {
    if (event.keyCode === 13) {
      this.sendComment();
    }
  }

  /**
   * 删除这条评论
   */
  deleteComment(event: any, comment: any) {
    event.stopPropagation();
    let settings = {
      mode: '1',
      title: 'DELETE IMAGE COMMENTS',
      isSimpleContent: true,
      simpleContent: 'Are you sure to delete the comments?',
      buttons: [
        {type: 'cancel'},
        {
          type: 'delete',
          btnText: 'DELETE',
          btnEvent: () => {
            let data = {
              doc_id: comment._id,
              fid: this.settings.fid,
              page: comment.page
            };
            this.chatModelService.removeChatPostComment({
              data
            }, (res: any) => {
              //获取成功
              if (res.status === 1) {
                this.sendCommentTxt = '';
                for (let i in this.commentLists) {
                  if (this.commentLists[i]._id === comment._id) {
                    this.commentLists.splice(parseInt(i), 1)
                  }
                }
              } else {
                this.dialogService.openWarning({simpleContent: 'delete the comment failed!'})
              }
            });
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * fetchComment
   */
  fetchComment() {
    if (this.currentCommentPage !== 1) {
      this.isLoading = true;
    }
    let data = {
      page: this.currentCommentPage,
      fid: this.settings.fid,
    };
    this.chatModelService.showChatCommentsList({
      data
    }, (res: any) => {
      //获取成功
      this.isLoading = false;
      if (res.status === 1) {
        if (this.typeService.getObjLength(res.data) == 0) {
          this.loadEnd = true;
        } else if (res.data.comments) {
          for (let i in res.data.comments) {
            res.data.comments[i].page = this.currentCommentPage;
          }
          if (this.currentCommentPage === 1) {
            this.commentLists = res.data.comments.reverse();
          } else {
            let a: Array<any> = this.typeService.clone(this.commentLists);
            res.data.comments.reverse();
            let b: Array<any> = res.data.comments.concat(a);
            this.commentLists = this.typeService.clone(b);
          }
          this.commentUsers = res.data.users_info;
          this.dealComments();
        }
        if (this.currentCommentPage === 1) {
          this.pageElement.scrollBottom(this.commentScroll.nativeElement, 0);
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'fetch post comments failed!'});
      }
    });
  }

  /**
   * 显示评论列表
   * @param event
   */
  showComment() {
    this.currentCommentPage = 1;
    this.fetchComment();
  }


  /**
   * 滚轮事件
   * @param ele
   */
  mouseWheelFunc(ele: any) {
    //标准浏览器
    ele.addEventListener('mousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.commentScroll.nativeElement.scrollTop === 0 && !this.isLoading && !this.loadEnd) {
        this.currentCommentPage++;
        this.fetchComment();
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail > 0 && this.commentScroll.nativeElement.scrollTop === 0 && !this.isLoading && !this.loadEnd) {
        this.currentCommentPage++;
        this.fetchComment();
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.commentScroll.nativeElement.scrollTop === 0 && !this.isLoading && !this.loadEnd) {
        this.currentCommentPage++;
        this.fetchComment();
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.commentScroll) {
      let element = this.commentScroll.nativeElement;
      if (!this.bindPagingEvent && element) {
        this.mouseWheelFunc(element);
        this.bindPagingEvent = true;
      }
    }
  }

  /**
   * 处理评论的头像信息
   */
  dealComments() {
    for (let i in this.commentLists) {
      for (let key in  this.commentUsers) {
        if (this.commentLists[i].owner === key) {
          this.commentLists[i].userInfo = this.commentUsers[key]
          this.commentLists[i].userInfo.user_profile_path = this.fileService.getImagePath(36, this.commentLists[i].userInfo.user_profile_path);
        }
      }
      this.doFormatDate(this.commentLists[i], 2);
    }
  }

  /**
   * format时间格式
   * @param data
   * @param type
   */
  doFormatDate(data: any, type: number) {
    if (type === 1) {
      data.timeStr = new Date(data.inserted);
    } else if (type === 2) {
      data.timeStr = new Date(data.inserted * 1000);
    }
    data.timeStr1 = this.dateFormatService.formatLocal(data.timeStr);
    data['day'] = this.dateFormatService.format(data.timeStr, 'ddS');
    data['month'] = this.dateFormatService.format(data.timeStr, 'mmm');
    data['year'] = this.dateFormatService.format(data.timeStr, 'yyyy');
    data['week'] = this.dateFormatService.format(data.timeStr, 'dddd');
    data['hour'] = data.timeStr.getHours();
    data['minute'] = this.dateFormatService.formatWithTimezone(data.timeStr, 'MM');
    data['ap'] = this.dateFormatService.format(data.timeStr, 'tt');
  }


  /**
   * 消息撤回
   */
  clickOnRevoke() {
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_REVOKE,
      data: {
        messageData: this.messageData
      }
    })

  }


}













