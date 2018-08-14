import {
  Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild, ElementRef, Injectable,
  HostListener, AfterViewInit, AfterViewChecked, OnDestroy, Renderer
} from '@angular/core';
import {Router} from '@angular/router';
import {ChatModelService} from "../../shared/services/model/chat-model.service";
import {DateService} from "../../shared/services/common/data/date.service";
import {ChatPostHeaderComponent} from "./post/chat-post-header.component";
import {el} from "@angular/platform-browser/testing/browser_util";
import {ChatConfig} from "../../shared/config/chat.config";
import {
  ChatMenuList, ChatPost, ChatPostAttachment, ChatPostAttachmentFile, ChatPostCommentListFilter,
  ChatPostComments, ChatPostContactUserInfoModel, ChatPostDraftListFilter, ChatPostFirstAttachment, ChatPostUpload,
  Draft, DraftNewInterface,
  PostReadSettings
} from "../../shared/services/model/entity/chat-entity";
import {ContactModelService} from "../../shared/services/model/contact-model.service";
import * as FolderConstant from '../../shared/config/folder.config';
import {FolderModelService} from "../../shared/services/model/folder-model.service";
import {DownloadService} from "../../shared/services/common/file/download.service";
import {Observable} from "rxjs/Observable";
import {ChatContentMessageComponent} from "./content/chat-content-message.component";
import {Subscription} from "rxjs/Subscription";
import * as MissionConstant from '../../shared/config/mission.config';

@Component({
  selector: 'new-chat-post',
  templateUrl: '../template/chat-post.component.html',
  styleUrls: ['../../../assets/css/chat/chat-new.css'],
  providers: [FolderModelService,]
})
/**
 * POST相关component
 */
export class ChatPostNewComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  //常量
  public ChatConfigConstant: ChatConfig;

  //富文本编辑的默认toolbar
  public emptyArray: any[] = [];
  public toolbar: Object = {
    toolbar: [
      [{'header': [1, 2, 3, 4, 5, 6, false]}],
      ['bold', 'strike', 'underline'],
      [{'color': this.emptyArray.slice()}],
      ['link'],
      [{'align': this.emptyArray.slice()}],
    ]
  };

  //获取子组件chat-post-header
  @ViewChild('chatPostHeader') public chatPostHeader: ChatPostHeaderComponent;
  @ViewChild('test') public test: ElementRef;

  //点击图标显示
  public showAboutDetail: boolean = false;
  public showDraftDetail: boolean = false;
  public showCommentDetail: boolean = false;

  //获取quill对象
  @ViewChild('quillEditor') quillEditor: any;
  @ViewChild('typeName') public typeName: ElementRef;

  public settings: PostReadSettings;
  public mode: string = 'create';
  //富文本状态为只读
  public quillReadOnly: boolean = false;
  public currentContactList: Array<any>;
  public currentGroupList: Array<any>;


  //存放draft的list数组
  public draftArr: Array<any> = [];
  //draft 的名字
  public draftTitle: string = '';
  //点击X关闭页面
  public showChatPost: boolean = false;
  //时间格式
  public dateFormatStr: string = 'yyyy-mm-dd HH:MM:ss';
  //获取鼠标滚动元素 draft
  @ViewChild('scrollToBottom') public scrollToBottom: ElementRef;

  //是否绑定滚轮事件
  public bindPageEvent: boolean = false;

  public isLoading: boolean = false;

  public tplFilterData: ChatPostDraftListFilter;

  //记录分页下标
  public currentPageNumber: number;
  public previousPageNumberArr: Array<number> = [0];


  //从chat里传过来的channel
  public _channelFormChat: ChatMenuList;
  public currentOriginalDraft: Draft;
  public counters: number = 1;

  set channelFormChat(data: ChatMenuList) {
    this._channelFormChat = data;
    if (data) {
      this.chatPostHeader.postGroupName = data.name;
      this.chatPostHeader.postGroupClsName = data.clsName;
      this.chatPostHeader.postFriendName = data.work_name;
      this.chatPostHeader.isFriend = data.isFriend;
    }

  }

  get channelFormChat() {
    return this._channelFormChat;
  }

  //给draft加当前样式
  public currDraftIdx;

  //是否新建draft
  public isNewDraft: boolean = false;

  //当前显示的draft对象 克隆对象
  public currentDraftObj: Draft;

  public chatConfig: ChatConfig = new ChatConfig();

  //
  public postGroupName: string = 'GLOBAL';
  public subscription: Subscription;
  private btnFail: any = {};

  constructor(public router: Router,
              private ele: ElementRef,
              public renderer: Renderer,
              @Inject('date.service') public dateFormatService: DateService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('chat-message-data.service') public messageDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('notification.service') public notificationService: any,
              @Inject('im.service') public chatService: any,
              public chatModelService: ChatModelService,
              public contactModelService: ContactModelService,
              public downloadService: DownloadService,
              public folderModelService: FolderModelService) {
    this.settings = PostReadSettings.init();
    this.tplFilterData = new ChatPostDraftListFilter().init();
    this.ChatConfigConstant = new ChatConfig();
    this.ele.nativeElement.addEventListener('click', (event) => {
      // post header
      if (this.chatPostHeader) {
        this.chatPostHeader.setupTitleInput(event);
      }
    })
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

    this.subscription = this.notificationService.getNotification().subscribe((message: any) => {
      switch (message.act) {
        case this.notificationService.config.ACT_COMPONENT_CHAT_POST_SET_SHARETO:
          //message.data.shareToArr
          let shareToArr = [];
          if (message.hasOwnProperty('data') && message.data.hasOwnProperty('shareToArr')) {
            message.data.shareToArr.forEach((value) => {
              shareToArr.push(value.id)
            });
          }
          if (this.currentDraftObj) {
            this.currentDraftObj.shared_to = shareToArr;
            if(message.data.shareToArr.length){
              this.currentDraftObj.form = message.data.shareToArr[0].form;
              this.fetchShareToDetail();
            }
          }

          break;
        case  this.notificationService.config.ACT_COMPONENT_IMPORT_FILE_TO_POST:
          this.dealImportFile(message.data.data);


          break;
        default:
          break;
      }
    })
  }


  ngAfterViewChecked() {
    //draft list
    if (this.scrollToBottom) {
      let ele = this.scrollToBottom.nativeElement;
      if (!this.bindPageEvent && ele && ele.hasChildNodes()) {
        for (let i = 0, il = ele.childNodes.length; i < il; i++) {
          if (ele.childNodes[i].id === 'postContent') {
            let targetElement = ele.childNodes[i];
            this.mouseWheelEvent(targetElement);
            this.bindPageEvent = true;
          }
        }

      }
    }

  }

  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent) {

    if (!this.showChatPost && this.counters !== 1) {
      if (event.which == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
        event.preventDefault();
        this.chatPostHeader.addIntoDraft(event);
      }
    }

  }

  /**
   * draft页面元素滚动触发读取分页数据事件
   */
  mouseWheelEvent(ele: any): void {
    ele.addEventListener('mousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.index !== this.ChatConfigConstant.CHATPOST_PAGER_ENDING.toString()) {
        this.isLoading = true;
        this.loadMoreDraft(this.tplFilterData);
      }
      //向上滚动
      if (ele.scrollTop === 0 && ele.wheelDelta > 0) {
        this.currentPageNumber = this.previousPageNumberArr[this.previousPageNumberArr.length - 2];
      }
    });
    //FF
    ele.addEventListener('DOMMouseScroll', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.index !== this.ChatConfigConstant.CHATPOST_PAGER_ENDING.toString()) {
        this.isLoading = true;
        this.loadMoreDraft(this.tplFilterData);
      }
      //向上滚动
      if (ele.scrollTop === 0 && ele.wheelDelta > 0) {
        this.currentPageNumber = this.previousPageNumberArr[this.previousPageNumberArr.length - 2];
      }
    })
    //IE
    ele.addEventListener('onmousewheel', (event) => {
      //Math.floor() 发现chrome浏览器下scrollTop出现了小数点，所以用.floor取整并且在一定范围内就读取
      let isToBottom = (Math.floor(ele.scrollHeight - ele.scrollTop) - 10 < ele.clientHeight);
      if (!this.isLoading && isToBottom && this.tplFilterData.index !== this.ChatConfigConstant.CHATPOST_PAGER_ENDING.toString()) {
        this.isLoading = true;
        this.loadMoreDraft(this.tplFilterData);
      }
      //向上滚动
      if (ele.scrollTop === 0 && ele.wheelDelta > 0) {
        this.currentPageNumber = this.previousPageNumberArr[this.previousPageNumberArr.length - 2];
      }
    })
  }

  /**
   * 加载更多draft
   */
  loadMoreDraft(tplFilterData: ChatPostDraftListFilter): void {
    this.tplFilterData.index = (parseInt(tplFilterData.index) + 1).toString();
    let formData = {
      data: this.tplFilterData
    };
    this.chatModelService.requestDraftList(formData, (response: any) => {
      if (response.status === 1) {
        this.isLoading = false;
        let resData = response.data;
        if (resData.length) {
          this.bindPageEvent = false;
          //记录当前的位置 数组的最后一个下标
          this.currentPageNumber = this.draftArr.length;

          this.previousPageNumberArr.push(this.currentPageNumber);
          this.draftArr = this.draftArr.concat(response.data);
          /* response.data.forEach((value)=>{
           this.draftArr.push(value)
           })*/
          // this.scrollToCurrentPage(this.test);
          this.initDraftList(this.draftArr);
        } else {
          this.tplFilterData.index = '-1';
        }

      } else {
        this.tplFilterData.index = (parseInt(tplFilterData.index) - 1).toString();
      }
    })
  }


  /**
   * chat页面第一次点击新建post后 请求列表 并显示最新一条数据
   */
  public showLastedDraft(): void {
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

    //初始化进来读取draftList最新一条的数据
    let formData = {
      data: this.tplFilterData
    };
    this.chatModelService.requestDraftList(formData, (response: any) => {
      if (response.status === 1) {
        if (response.data.length) {
          this.draftArr = this.draftArr.concat(response.data);
          this.initDraftList(this.draftArr);
          // let DraftObj: Draft;
          if (this.draftArr[0]) {
            this.currDraftIdx = 0;
            this.isNewDraft = false;
            this.readDraftDetail(this.draftArr[0], 0, true);
            //默认打开draft
            this.showDraftDetail = true;
            this.chatPostHeader.showDraftDetail = true;
            this.fetchShareToDetail();
            //get attachment detail info
            this.getDraftAttachmentInfoLst();
          }
        } else { //一个draft也没
          this.resetPostData()
        }
      }
    });
  }


  /**
   * 点击X关闭页面
   */
  displayChatPost(data: boolean): void {
    this.showChatPost = data;
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
    this.chatPostHeader.showDraftDetail = false;
    this.chatPostHeader.showCommentDetail = false;
  }


  /**
   *    save or update draft
   */
  saveIntoDraft(draftObj: any, callback: any): void {
    let draftTitle = draftObj.title;
    let element = draftObj.element;
    if (draftTitle && draftTitle !== 'Type your post name in here') {

      let draftTplObj = new Draft().init();
      let draftInterface = DraftNewInterface.init();

      draftTplObj.title = draftTitle;
      this.currentDraftObj.title = draftTitle;

      this.typeService.bindData(draftTplObj, this.currentDraftObj);


      if (this.channelFormChat) {
        if (this.channelFormChat.gid) {
          draftTplObj.channel = this.channelFormChat.gid.toString();
        } else if (this.channelFormChat.uid) {
          draftTplObj.channel = this.channelFormChat.uid.toString();
        }
        this.currentDraftObj.form = this.channelFormChat.form.toString();
        draftTplObj.form = this.channelFormChat.form.toString();
      } else { //global has no channel
        draftTplObj.channel = '';
      }

      this.typeService.bindData(draftInterface, draftTplObj);
      if (this.isNewDraft) { //新建draft
        this.addDraft(draftInterface,element, callback);

      } else {//更新draft
        this.updateDraft(draftInterface,element, callback)
      }

    } else {
      //失败，按钮添加叉号，错误提示，2秒后消失，
      this.renderer.setElementClass(element, 'but-fail', true);
      this.btnFail={
        msg : 'please type your post name!'
      };

      setTimeout(() => {
        this.renderer.setElementClass(element, 'but-fail', false);
      },this.config.btnFailTime);
      this.renderer.setElementClass(element, this.config.btnProgress, false);
      /*this.dialogService.openError({
        simpleContent: 'please type your post name!'
      })*/

    }


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
    let quill = event.editor.clipboard.quill;
    if (quill.getLength() - 1 > new ChatConfig().CHAT_POST_QUILL_EDITOR_LIMIT) {
      this.dialogService.openWarning({
        simpleContent: 'You cannot exceed 9000 words !',
      });
      quill.deleteText(new ChatConfig().CHAT_POST_QUILL_EDITOR_LIMIT, quill.getLength());
    }
    this.currentDraftObj.content = event.html;
    this.currentDraftObj.summary = event.text.length > 300 ? event.text.substring(0, 300) : event.text;

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
   * click draftList then show content
   * 新建 or 更新
   */
  clickReadDraftDetail(event, data: any, i: number, init: boolean = false): void {
    event.stopPropagation();
    this.readDraftDetail(data, i, init);
  }

  /**
   * click draftList then show content
   * @param data
   * @param i
   * @param init
   */
  readDraftDetail(data: Draft, i: number, init: boolean = false): void {
    let title: any;
    if (typeof this.currDraftIdx !== 'undefined') {
      if (this.currDraftIdx === i && !init) {
        this.currDraftIdx = -1;
        this.isNewDraft = true;
        //清空内容
        this.draftTitle = 'Type your post name in here';
        this.resetPostData();
        title = this.draftTitle;
      } else {
        this.currDraftIdx = i;
        this.isNewDraft = false;
        //保存原稿
        this.currentOriginalDraft = data;
        this.currentDraftObj = Draft.deepClone(data);
        title = data.title;
        //假如是读取的draft 那么需要请求接口 ，如果是页面上刚上传的不需要请求接口
        if (this.currentDraftObj.attachment.length) {
          if (!this.currentDraftObj.attachmentFileList.length) {
            this.getDraftAttachmentInfoLst();
          }
        }
      }
    } else {
    }
    if (this.quillEditor) {
      //显示内容
      this.quillEditor.writeValue(this.currentDraftObj.content);
      //显示标题
      this.chatPostHeader.draftTitle = title;
    }
    //读取当前draft的share_id
    this.fetchShareToDetail()

  }


  /**
   * 处理成 draft列表显示所需要的数据
   * 初始化draft-list 计算更新时间
   */
  initDraftList(draftList: Array<any>): void {
    draftList.forEach((value, index, array) => {
      //根据时间算离最近一次修改相差的时间
      let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
      let updateTime = this.dateFormatService.utcDateFormat(new Date(parseInt(value.updated) * 1000).toUTCString(), this.dateFormatStr);
      let diffTime = this.dateDiff(currentDate, updateTime);
      //离最近一次修改的时间 前端显示用
      Object.assign(value, {
        attachmentFileList: [],
        draftCreateTime: diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime
      })
    });
  }


  /**
   * 请求draft list接口
   */
  fetchDraftList(): void {
    this.draftArr = [];
    let formData = {
      data: this.tplFilterData
    };
    this.chatModelService.requestDraftList(formData, (response: any) => {
      if (response.status === 1) {
        this.draftArr = this.draftArr.concat(response.data);
        this.initDraftList(this.draftArr);
      }
    });
  }


  /**
   * delete draft
   */
  deleteDraft(event: any, draftObj: Draft): void {
    event.stopPropagation();

    this.draftArr.forEach((value, index, array) => {
      if (value == draftObj) {
        array.splice(index, 1)
      }
    });
    this.requestDeleteDraft(draftObj.draft_id);
  }

  /**
   * request delete draft
   * @param draft_id
   * @param isOpenDialog
   */
  requestDeleteDraft(draft_id: any, isOpenDialog: boolean = true): void {
    this.chatModelService.deleteDraft({
      data: {
        post_id: draft_id
      }
    }, (response: any) => {
      if (response.status === 1) {
        this.resetPostData();
        if (isOpenDialog) {
          this.dialogService.openSuccess({
            simpleContent: 'delete draft success !'
          })
        }
      } else {
        this.dialogService.openError({
          simpleContent: 'delete draft failed!'
        })
      }
    })
  }


  /**
   *  open  shareTo dialog
   */
  openShareToDialog(callback?: any): void {
    this.dialogService.openConfirm({
      isSimpleContent: false,
      componentSelector: 'chat-share-post-dialog',
      componentData: this.typeService.clone({
        channelFormChat: this.channelFormChat,
      }),
    }, 'sendData');
    if (typeof callback === 'function') {
      callback();
    }
  }


  /**
   * upload chatPost
   */
  uploadChatPost(draftObj: any): void {
    let draftTitle = draftObj.title;
    let element = draftObj.element;
    //上传前先save 先保存成草稿
    this.saveIntoDraft(draftObj, () => {
      //假如有share直接upload
      if (this.currentDraftObj.shared_to.length || this.channelFormChat) {
        if (draftTitle && draftTitle !== 'Type your post name in here') {

          //判断currentForm是否存在,并赋值
          this.currentDraftObj.form = this.currentDraftObj.form ? this.currentDraftObj.form : this.channelFormChat.form.toString();

          if (this.currentDraftObj.content) {
            //上传的post 初始化
            let draftTplObj = ChatPost.init();
            let chatPostUpload: ChatPostUpload = ChatPostUpload.init();
            //将当前草稿赋值给上传的post
            this.typeService.bindData(draftTplObj, this.currentDraftObj);


            this.judgeCurrentFileType(draftTplObj);


            //判断是不是全局的post 并赋值channel和module_type
            this.judgeIsGlobalPost(chatPostUpload, draftTplObj)

            //初始化post的identity
            this.initPostIdentity(draftTplObj);

            this.typeService.bindData(chatPostUpload, draftTplObj);
            this.dialogService.openConfirm({
              simpleContent: 'Confirm to submit the post !'
            }, () => {
              //是否是直接上传
              if (this.currentDraftObj.draft_id) {//有草稿
                draftTplObj.post_id = this.currentDraftObj.draft_id;

                this.chatModelService.uploadChatPostByDraft({
                  data: {
                    post_id: this.currentDraftObj.draft_id,
                    form: this.currentDraftObj.form,
                    module_type: chatPostUpload.module_type
                  }
                }, (response: any) => {
                  if (response.status === 1) {
                    //成功，按钮添加对号，1秒后消失
                    this.renderer.setElementClass(element, 'but-success', true);
                    setTimeout(() => {
                      this.renderer.setElementClass(element, 'but-success', false);
                    },this.config.btnSuccessTime);
                    //初始化draftTplObj的detail
                    draftTplObj.fid = response.data.fid;
                    draftTplObj.detail.post_name = draftTplObj.title;

                    this.typeService.bindData(draftTplObj.detail, draftTplObj);
                    //从当前草稿箱内删除当前草稿
                    this.draftArr.forEach((value, index, array) => {
                      if (value.draft_id == this.currentDraftObj.draft_id) {
                        array.splice(index, 1);
                      }
                    });

                    //关闭post
                    this.displayChatPost(true);

                    //向IM发送post
                    this.sendPostToIM(draftTplObj);

                    //重置数据
                    this.resetPostData();
                  } else {
                    //失败，按钮添加叉号，错误提示，3秒后消失，
                    this.renderer.setElementClass(element, 'but-fail', true);
                    this.btnFail = {msg:response.message};
                    setTimeout(() => {
                      this.renderer.setElementClass(element, 'but-fail', false);
                    },this.config.btnFailTime);
                /*    this.dialogService.openError({
                      simpleContent: response.message
                    })*/
                  }
                  this.renderer.setElementClass(element, this.config.btnProgress, false);
                });
              }
            })


          } else {
           /* this.dialogService.openWarning({
              simpleContent: 'Please fill in the text !'
            })*/
            //失败，按钮添加叉号，错误提示，2秒后消失，
            this.renderer.setElementClass(element, 'but-fail', true);
            this.btnFail = {msg:'Please fill in the text !'};
            setTimeout(() => {
              this.renderer.setElementClass(element, 'but-fail', false);
            },this.config.btnFailTime);
          }


        } else {
         /* this.dialogService.openError({
            simpleContent: 'please type your post name!'
          })*/
          //失败，按钮添加叉号，错误提示，2秒后消失，
          this.renderer.setElementClass(element, 'but-fail', true);
          this.btnFail = {msg:'please type your post name!'};
          setTimeout(() => {
            this.renderer.setElementClass(element, 'but-fail', false);
          },this.config.btnFailTime);
          this.renderer.setElementClass(element, this.config.btnProgress, false);
        }
      } else {
        this.openShareToDialog();
      }
    });


  }


  /**
   * 请求share_to详情
   */
  fetchShareToDetail(): void {
    this.currentDraftObj.shareToDetailArr = [];
    if (this.currentDraftObj.shared_to.length) {
      this.currentDraftObj.shared_to.forEach((value) => {
        for (let i in this.currentGroupList) {
          if (this.currentGroupList.hasOwnProperty(i)) {
            let dataValue = this.currentGroupList[i];
            if (dataValue.gid === value) {
              this.currentDraftObj.shareToDetailArr.push(dataValue);
              break;
            }
          }
        }
      })
    }

  }


  /**
   * delete shareTo list
   */
  deleteShareTo(event: any, shareToObj: any) {
    event.stopPropagation();
    this.currentDraftObj.shareToDetailArr.forEach((value, index, array) => {
      if (value === shareToObj) {
        array.splice(index, 1);
      }
    });
    this.currentDraftObj.shared_to.forEach((value, index, array) => {
      if (value === shareToObj.gid) {
        array.splice(index, 1);
      }
    })


  }

  /**
   * uploadFile
   */
  uploadFile(filesObj: any): void {
    let fileList = [];
    for (let value of filesObj) {
      if (value.size > 5 * 1000 * 1024) {
        this.dialogService.openError({
          simpleContent: 'upload every file must less-than 5M !',
          buttons: [
            {
              type: 'ok'
            }
          ]
        });
        return;
      } else if (value.size === 0) {
        this.dialogService.openWarning({
          simpleContent: 'upload every file must more-than 0k !',
        });
        return;
      }
      else {
        fileList.push(value);
      }

    }
    this.initFileList(fileList);

  }

  /**
   * 处理成 后台所需要的数据
   */
  initFileList(fileList: Array<any>): void {
    //清空上传的列表
    // this.currentAttachmentList = [];
    fileList.forEach((value, index, array) => {
      //转化base64
      let reader: FileReader = new FileReader();
      reader.onload = function (oFREvent: any) {
        value.fileSrc = oFREvent.target.result;
        //等文件生成好后上传
        this.upLoadFilesToService(value, () => {
          let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
          let updateTime;
          if (value.lastModifiedDate) {
            updateTime = this.dateFormatService.utcDateFormat(new Date(value.lastModifiedDate).getTime(), this.dateFormatStr);
          } else {
            updateTime = this.dateFormatService.utcDateFormat(value.lastModified, this.dateFormatStr);
          }

          let diffTime = this.dateDiff(currentDate, updateTime);
          //离最近一次修改的时间 前端显示用
          value['fileUploadTime'] =
            diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime;
        });
      }.bind(this);
      //截取文件名 (去掉后缀名)
      let index1 = value.name.lastIndexOf(".");
      value.fileName = value.name.substring(0, index1);//后缀名
      value.fileSuffix = value.name.substring(index1 + 1, value.name.length);//后缀名
      //获取文件的大小
      value.fileSize = value.size;
      reader.readAsDataURL(value);
      //  判断当前文件的类型
      let fileType = value.type.split('/');
      if (fileType[0] === FolderConstant.FILE_TYPE_IMAGE) {
        value.isImage = true;
      } else {
        value.isImage = false;
        switch (value.type) {
          case FolderConstant.FILE_TYPE_EXCEL:
            value.fileType = 'excel';
            break;
          case FolderConstant.FILE_TYPE_WORD:
            value.fileType = 'word';
            break;
          case FolderConstant.FILE_TYPE_PPT:
            value.fileType = 'ppt';
            break;
          case FolderConstant.FILE_TYPE_PDF:
            value.fileType = 'pdf';
            break;
          default :
            value.fileType = 'other';
            break;
        }
      }
      value.whichFileType = {
        isExcel: value.fileType === 'excel',
        isWord: value.fileType === 'word',
        isPpt: value.fileType === 'ppt',
        isAcrobat: value.fileType === 'pdf',
        isOther: value.fileType === 'other',
      };
    });

  }

  /**
   * upLoadFiles to service
   */
  upLoadFilesToService(data: any, callback: any): void {
    let formData = {
      file: data,
      form: '',
      pdid: ''
    };
    formData['form'] = this.channelFormChat ? this.channelFormChat.form.toString() : '1';
    this.folderModelService.fileUpload(formData, (response: any) => {
      if (response.status === 1) {
        this.currentDraftObj.attachment.push(response.data.fid);
        data['thumb_s'] = response.data.thumb_s;
        data['path'] = response.data.path;
        data.ext_type = response.data.ext_type;
        this.currentDraftObj.attachmentFileList.push(data);
        if (typeof callback === 'function') {
          callback();
        }
        this.dialogService.openSuccess({
          simpleContent: 'upload success',
        })
      } else {
        this.dialogService.openError({
          simpleContent: 'upload draft failed!'
        })
      }
    })
  }

  /**
   * remove file list
   */
  removeFileList(event: any, fileObj: any): void {
    event.stopPropagation();

    this.currentDraftObj.attachmentFileList.forEach((value, index, array) => {
      if (value == fileObj) {
        array.splice(index, 1);
      }
    });
    this.currentDraftObj.attachment.forEach((value, index, array) => {
      if (value == fileObj.fid) {
        array.splice(index, 1);
      }
    });
  }


  /**
   * get draft attachment info lst
   */
  getDraftAttachmentInfoLst(): void {
    let formData = {
      data: {
        post_id: this.currentDraftObj.draft_id
      }
    };
    this.getAttachmentDetail(formData);

  }

  /**
   * get attachment detail api
   */
  getAttachmentDetail(formData): void {
    this.chatModelService.getDraftAttachmentInfo(formData, (response: any) => {
      if (response.status === 1) {
        if (response.data && response.data.hasOwnProperty('fileInfo')) {
          if (response.data.fileInfo.length) {
            this.currentDraftObj.attachmentFileList = response.data.fileInfo;
            //转化成模板所需要的数据
            this.initTplAttachmentModel(this.currentDraftObj.attachmentFileList);
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
    data.forEach((value, index, array) => {
      Object.assign(value, {
        whichFileType: {
          isExcel: value.fileType === 'excel',
          isWord: value.fileType === 'word',
          isPpt: value.fileType === 'ppt',
          isAcrobat: value.fileType === 'pdf',
          isOther: value.fileType === 'other',
        },
        isImage: value.ext_type === FolderConstant.FILE_TYPE_IMAGE
      });
      //根据时间算离最近一次修改相差的时间
      let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
      let updateTime = this.dateFormatService.utcDateFormat(value.created, this.dateFormatStr);
      let diffTime = this.dateDiff(currentDate, updateTime);
      //离最近一次修改的时间 前端显示用
      value['fileUploadTime'] =
        diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime;
    });
  }


  /**
   * 点击下载聊天文件
   */
  downloadAttachment(event: any, fileObj: any) {
    event.stopPropagation();
    let settings = {
      simpleContent: 'Are you sure download the attachment?',
    };
    this.dialogService.openConfirm(settings, () => {
      let formData = {
        form: fileObj.type,
        fid: fileObj.fid
      };
      this.downloadService.downloadFolderFile(formData);
    });
  }


  /**
   * 重置post 数据 上传后清空数据
   */
  public resetPostData() {
    //upload完后重置form
    this.isNewDraft = true;
    this.currDraftIdx = -1;
    //upload后重置 current shared_to
    //清空数据
    this.chatPostHeader.postNameValue = '';
    this.chatPostHeader.draftTitle = 'Type your post name in here';
    this.currentDraftObj = new Draft().init();
    let quill = this.quillEditor.quillEditor.clipboard.quill;
    quill.setContents([
      {insert: ''},
    ]);
  }

  /**
   * 判断是不是全局的post 定义module_type
   * @param chatPostUpload
   * @param draftTplObj
   */
  public judgeIsGlobalPost(chatPostUpload: ChatPostUpload, draftTplObj: ChatPost) {
    // 从chat传入 是否有channel
    if (this.channelFormChat) {
      if (this.channelFormChat.gid) {
        draftTplObj.channel = this.channelFormChat.gid.toString();
        draftTplObj.isFriend = false;
        chatPostUpload.module_type = '2';
        let groupName = '';
        for (let i = 0; i < this.currentGroupList.length; i++) {
          if (this.currentGroupList[i].gid === draftTplObj.channel) {
            groupName = this.currentGroupList[i].name;
            break;
          } else {
          }

        }
        draftTplObj.currentPostIdentity = ChatPost.initIdentity(this.currentDraftObj.form, draftTplObj.channel, groupName);

      } else if (this.channelFormChat.uid) {
        chatPostUpload.module_type = '3';
        draftTplObj.channel = this.channelFormChat.uid.toString();
        draftTplObj.isFriend = true;
        draftTplObj.currentPostIdentity = ChatPost.initFriendId(this.currentDraftObj.form, draftTplObj.channel, (this.currentDraftObj.form === '1') ? this.userDataService.getCurrentUUID() : this.userDataService.getCurrentCompanyPSID()).identity;
      }
    } else { //global has no channel
      draftTplObj.channel = '';
      chatPostUpload.module_type = '2';
    }

  }


  /**
   * 初始化上传的post的identity
   * @param draftTplObj
   */
  public initPostIdentity(draftTplObj: ChatPost) {
    //初始化identity
    draftTplObj.shareIdentity = [];
    if (draftTplObj.shared_to.length) {
      draftTplObj.shared_to.forEach((info: any) => {
        let groupName = '';
        for (let i = 0; i < this.currentGroupList.length; i++) {
          if (this.currentGroupList[i].gid === info) {
            groupName = this.currentGroupList[i].name;
            break;
          } else {
          }
        }
        let id = ChatPost.initIdentity(draftTplObj.form, info, groupName);
        draftTplObj.shareIdentity.push(id);
      });
    }
  }

  /**
   * 判断当前要上传的post的第一个附件的文件类型，是图片要发送给IM
   * @param draftTplObj
   */
  public judgeCurrentFileType(draftTplObj: ChatPost) {
    //  判断当前文件的类型 是图片要传送给IM
    if (this.currentDraftObj.attachmentFileList.length) {
      let fileType = this.currentDraftObj.attachmentFileList[0].ext_type;
      if (fileType === FolderConstant.FILE_TYPE_IMAGE) {
        let firstAttachmentObj: ChatPostFirstAttachment = ChatPostFirstAttachment.init();
        firstAttachmentObj.name = this.currentDraftObj.attachmentFileList[0].name;
        firstAttachmentObj.path = this.currentDraftObj.attachmentFileList[0].path;
        draftTplObj.detail.first_attachment = firstAttachmentObj;
        draftTplObj.detail.first_attachment.ext_type = FolderConstant.FILE_TYPE_IMAGE;
      }
    } else {
      draftTplObj.detail.first_attachment = null;
    }
  }

  /**
   * 向IM发送post
   * @param draftTplObj
   */
  public sendPostToIM(draftTplObj: ChatPost) {
    //向聊天发送文件
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_POST_SEND_POST,
      data: {
        draftTplObj: draftTplObj,
        msg: `${draftTplObj.title}.post`,
      }
    });
  }

  /**
   * 新建 draft
   * @param draftInterface
   * @param callback
   */
  public addDraft(draftInterface: DraftNewInterface,element:any, callback: any) {
    this.chatModelService.addPostDraftInfo({
      data: draftInterface
    }, (response: any) => {
      if (response.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
        },this.config.btnSuccessTime);
       /* this.dialogService.openSuccess({
          simpleContent: 'new draft success !'
        });*/

        this.currentDraftObj.draft_id = response.data.draft_id;
        this.currentDraftObj.updated = response.data.updated.toString();
        let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
        let updateTime = this.dateFormatService.utcDateFormat(parseInt(this.currentDraftObj.updated) * 1000, this.dateFormatStr);
        let diffTime = this.dateDiff(currentDate, updateTime);
        //离最近一次修改的时间 前端显示用
        this.currentDraftObj.draftCreateTime =
          diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime;
        //选中当前draft
        this.isNewDraft = false;
        this.currDraftIdx = 0;
        this.draftArr.unshift(this.currentDraftObj);

        if (typeof callback === 'function') {
          callback();
        }
      } else {
       /* this.dialogService.openError({
          simpleContent: response.message
        })*/
        //失败，按钮添加叉号，错误提示，2秒后消失，
        this.renderer.setElementClass(element, 'but-fail', true);
        this.btnFail={
          msg : response.message
        };
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail', false);
        },this.config.btnFailTime);
      }
      this.renderer.setElementClass(element, this.config.btnProgress, false);
    })
  }

  /**
   * 更新 draft
   * @param draftInterface
   * @param callback
   */
  public updateDraft(draftInterface: DraftNewInterface,element:any, callback: any) {
    Object.assign(draftInterface, {
      post_id: this.currentDraftObj.draft_id
    });
    this.chatModelService.updateDraft({
      data: draftInterface
    }, (response: any) => {
      if (response.status === 1) {
        //成功，按钮添加对号，1秒后消失
        this.renderer.setElementClass(element, 'but-success', true);
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-success', false);
        },this.config.btnSuccessTime);
        this.currentDraftObj.updated = response.data.updated.toString();
        let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
        let updateTime = this.dateFormatService.utcDateFormat(parseInt(this.currentDraftObj.updated) * 1000, this.dateFormatStr);
        let diffTime = this.dateDiff(currentDate, updateTime);
        //离最近一次修改的时间 前端显示用
        this.currentDraftObj.draftCreateTime =
          diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime;
        //将修改后的草稿赋值给原稿
        if(this.currentOriginalDraft){
          Object.assign(this.currentOriginalDraft, this.currentDraftObj)
        }
        if (typeof callback === 'function') {
          callback();
        }
      } else {
        //失败，按钮添加叉号，错误提示，2秒后消失，
        this.renderer.setElementClass(element, 'but-fail', true);
        this.btnFail={
          msg : response.message
        };
        setTimeout(() => {
          this.renderer.setElementClass(element, 'but-fail', false);
        },this.config.btnFailTime);
      }
      this.renderer.setElementClass(element, this.config.btnProgress, false);
    })
  }


  dealImportFile(data: any) {
    this.currentDraftObj.attachment.push(data.fid);
    data.whichFileType = {
      isExcel: data.ext_type === 'excel',
      isWord: data.ext_type === 'word',
      isPpt: data.ext_type === 'ppt',
      isAcrobat: data.ext_type === 'pdf',
      isOther: data.ext_type === 'other',
    };
    data.isImage = data.ext_type === FolderConstant.FILE_TYPE_IMAGE
    //根据时间算离最近一次修改相差的时间
    let currentDate = this.dateFormatService.nowDateFormat(this.dateFormatStr);
    let updateTime = this.dateFormatService.utcDateFormat(data.updated, this.dateFormatStr);
    let diffTime = this.dateDiff(currentDate, updateTime);
    //离最近一次修改的时间 前端显示用
    data['fileUploadTime'] =
      diffTime.diffUnit === 'minutes' ? `${diffTime.gapTime}  ${diffTime.diffUnit} ago` : diffTime.gapTime;
    this.currentDraftObj.attachmentFileList.push(data);
  }

}













