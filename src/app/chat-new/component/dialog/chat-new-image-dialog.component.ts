/**
 * Created by allen shan(allen.shan@blockbi.com)
 * on 2017/5/8.
 */
import {
  AfterViewInit,
  Component,
  Inject,
  Renderer,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  OnDestroy
} from "@angular/core";
import {ChatModelService} from "../../../shared/services/model/chat-model.service";
import {DownloadService}from '../../../shared/services/index.service';
import {DateService} from "../../../shared/services/common/data/date.service";
import * as MissionConstant from '../../../shared/config/mission.config';
import {Subscription} from "rxjs/Subscription";
import {ChatMessage} from '../../../shared/services/model/entity/chat-entity';

@Component({
  selector: 'chat-new-image-dialog',
  templateUrl: '../../template/dialog/chat-new-image-dialog.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ChatNewImageDialog implements AfterViewInit, OnDestroy {

  public messageData: any = {}; //消息对象
  public imageInfo: any = {};  //图片信息
  public imageOwner: any = {}; //图片拥有者信息
  public isChangeCursor: any; //是否更换鼠标样式
  public userData: any = {}; //用户信息
  public timer: any;  //鼠标按下的定时器
  public operationView: any = {}; //后端交互位置对象 横纵坐标
  public isTabShow: boolean = false; //是否显示编辑tab
  public isShowShortCut: boolean = false;
  public isTriggerClick: boolean = true;
  public isShortEdit: boolean = false;
  public imgTagSpec: string = '';  //编辑框的描述
  public imgTagUrl: string = ''; //编辑框的url
  public isEdit: boolean = false;
  public tagArr: Array<any> = [];  //tag的数组
  public clickTagInfo: any = {};
  public isShowCommentList: boolean = false;
  private currentCommentPage: number = 1;
  public sendCommentTxt: string = ''; //发送图片的信息
  public commentLists: Array<any> = [];
  private bindPagingEvent: boolean = false;
  public tplLoadingPagerClass: string = MissionConstant.MISSION_LOADING_PAGE_CLASS;
  public likeCount: number;  //点赞数量
  public isLiked: boolean;
  private isShowImage: boolean = false;
  public downLoadUrl: string = 'api/folder/download-file';


  @ViewChild('showImg') public showImg: any;
  @ViewChild('imgForm') public imgForm: any;
  @ViewChild('imageForm') public imageForm: any;
  @ViewChild('EditTab') public EditTab: any;
  @ViewChild('commentScroll') public commentScroll: any;
  private currentItem: any = {};
  private commentUsers: any = {};
  public isLoading: boolean = false;
  public loadEnd: boolean = false;

  public subscription: Subscription;
  //是否有 前后数据，没有不显示按钮
  public hasBeforeData: boolean = false;
  public hasAfterData: boolean = false;
  //显示的图片list
  public imgDataList: Array<ChatMessage> = [];
  private currentIdx: number;
  //正在加载图片
  private isLoadImg: boolean = false;
  //单方向是否有数据
  public isHasPrevData: boolean = true;
  public isHasNextData: boolean = true;
  private showImageSize: number;
  private loadTimer: any;
  private isNaturalWidth: boolean;
  private isFocusCommentInput: boolean;

  constructor(@Inject('notification.service') public notificationService: any,
              public _el: ElementRef,
              public renderer: Renderer,
              @Inject('date.service') public dateService: DateService,
              @Inject('dialog.service') public dialogService: any,
              @Inject('type.service') public typeService: any,
              @Inject('page.element') public pageElement: any,
              @Inject('file.service') public fileService: any,
              @Inject('user-data.service') public userDataService: any,
              public downloadService: DownloadService,
              public chatModelService: ChatModelService,
              @Inject('app.config') public appConfig: any) {
    _el.nativeElement.addEventListener('keydown', (event: any) => {
      if (event.keyCode === 13 && this.isShowCommentList && this.isFocusCommentInput) {
        this.sendImageComment();
      }
    });
    _el.nativeElement.addEventListener('click', this.closeTag);
    window.addEventListener('resize', (event: any) => {
      if (this.imageInfo && this.imageInfo.file_path && this.isShowImage) {
        let img = new Image();
        img.src = this.appConfig.resourceDomain + this.imageInfo.file_path;
        this.setDisplayImageWidth(img);
        this.setImagePosition();
      }
    })
  }

  closeTag() {
    for (let i in this.tagArr) {
      this.tagArr[i].isShowTagDetail = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    //接收消息
    this.subscription = this.notificationService.getNotification().subscribe(
      (message: any) => {
        this.dealMessage(message);
      });
  }

  ngOnInit() {
    this.operationView = {
      imgOffsetX: '',
      imgOffsetY: '',
      imgOffsetWidth: '',
      imgOffsetHeight: '',
      imgClickPercentX: '',
      imgClickPercentY: ''
    };
  }


  /**
   * 设置需要显示的图片的宽度
   */
  setDisplayImageWidth(img: any) {
    let reduceWidth: number;
    if (this.isShowCommentList) {
      reduceWidth = 120 + 400;
    } else {
      reduceWidth = 120;
    }
    if (img.naturalWidth > (window.innerWidth - reduceWidth) * 0.9) {
      this.showImageSize = (window.innerWidth - reduceWidth) * 0.9;
      this.isNaturalWidth = false;
    } else {
      this.showImageSize = img.naturalWidth;
      this.isNaturalWidth = true;
    }
  }


  /**
   * 对图片定位
   */
  setImagePosition() {
    let imgWidth = this.showImageSize ? this.showImageSize : 2000;
    this.renderer.setElementStyle(this.imgForm.nativeElement, 'width', imgWidth + 'px');
    this.renderer.setElementStyle(this.imgForm.nativeElement, 'left', '50%');
    this.renderer.setElementStyle(this.imgForm.nativeElement, 'marginLeft', -imgWidth / 2 + 'px');
    this.isShowImage = true;
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

  dealMessage(message: any) {
    switch (message.act) {
      case this.notificationService.config.ACT_COMPONENT_OPEN_IMAGE_DIALOG:
        this.clearInfo();
        this.currentItem = message.data.currentItem;
        this.messageData = message.data.messageData;
        this.isShowCommentList = message.data.isShowComment;
        //显示模板数据
        this.resetImgData();
        this.initTemplate()
        //查询Img前后的五条图片
        this.queryBeforeAndAfterImg()
        break;
      case this.notificationService.config.ACT_CHAT_MESSAGE_REVOKE:
        if (this.messageData && message.status == 1 && message.data.msg_id === this.messageData.msg_id) {
          this.closeImageDialog();
        }
        break;
      default:
        break;
    }
  }


  clearInfo() {
    this.isTabShow = false; //是否显示编辑tab
    this.isShowShortCut = false;
    this.isTriggerClick = true;
    this.isShortEdit = false;
    this.imgTagSpec = '';  //编辑框的描述
    this.imgTagUrl = ''; //编辑框的url
    this.isEdit = false;
    this.tagArr = [];  //tag的数组
    this.clickTagInfo = {};
    this.isShowCommentList = false;
    this.currentCommentPage = 1;
    this.sendCommentTxt = ''; //发送图片的信息
    this.commentLists = [];
    this.isLoading = false;
    this.loadEnd = false;
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
        this.fetchImgComment();
      }
    });
    //兼容火狐
    ele.addEventListener('DOMMouseScroll', (event: any) => {
      if (event.detail < 0 && this.commentScroll.nativeElement.scrollTop === 0 && !this.isLoading && !this.loadEnd) {
        this.currentCommentPage++;
        this.fetchImgComment();
      }
    });
    //兼容IE
    ele.addEventListener('onmousewheel', (event: any) => {
      if (event.wheelDelta > 0 && this.commentScroll.nativeElement.scrollTop === 0 && !this.isLoading && !this.loadEnd) {
        this.currentCommentPage++;
        this.fetchImgComment();
      }
    });
  }


  /**
   *光标聚焦tag input 框
   */
  focusInput(event: any) {
    if (this.imgTagUrl == '') {
      this.imgTagUrl = 'http://';
    }
  }


  /**
   * 获取图片上的tags
   */
  fetchChatImageTags() {
    if (this.imageInfo) {
      let data = {
        fid: this.imageInfo.fid
      };
      this.chatModelService.fetchChatImgTags({
        data
      }, (response: any) => {
        //获取成功
        if (response.status === 1) {
          this.tagArr = response.data.length ? response.data : [];
          for (let i in this.tagArr) {
            this.doFormatDate(this.tagArr[i], 2);
          }
        }
      });
    }
    this.isChangeCursor = false;
  }


  /**
   * 获取图片的like 数量
   */
  fetchImageLikes() {
    if (this.imageInfo) {
      let data = {
        fid: this.imageInfo.fid
      };
      this.chatModelService.fetchImageLike({
        data
      }, (response: any) => {
        //获取成功
        if (response.status === 1) {
          this.likeCount = response.data.likes;
          this.isLiked = response.data.has_liked !== 0;
        }
      });
    }
  }


  /**
   * 点击退出图片打tag页面
   */
  closeImageDialog() {
    this.isShowImage = false;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CLOSE_IMAGE_DIALOG,
      data: {}
    });
  }


  /**
   * 点击tag图片开始给图片打tag
   * @param event
   */
  startTag(event: any) {
    event.stopPropagation();
    this.isChangeCursor = !this.isChangeCursor;
    if (!this.isChangeCursor) {
      this.isTabShow = false;
    }
    this.isShowCommentList = false;
  }


  /**
   * 鼠标按下图片（右键取消）（左键长按 1.5s 出现编辑框）
   */
  showShortCut(event: any) {
    event.stopPropagation();
    if (event.button === 2) {
      event.preventDefault();
      this.isChangeCursor = false;
      this.isTabShow = false;
    } else {
      this.timer = setTimeout(() => {
        this.isTabShow = true;
        this.isChangeCursor = true;
        this.setEditDialogPosition(event);
      }, 1500);
    }
  }


  /**
   * 在选中tag的状态下点击图片 出现tag编辑框
   */
  showTagEditBox(event: any) {
    event.stopPropagation();
    for (let i in this.tagArr) {
      this.tagArr[i].isShowTagDetail = false;
    }
    this.setEditDialogPosition(event)
  }

  /**
   * 对编辑弹框定位
   */
  setEditDialogPosition(event: any, isEdit?: boolean) {
    if (this.isChangeCursor || isEdit) {
      this.isTabShow = true;
      let setLeftValue: number;
      if (event.clientX - 60 < window.innerWidth - 120 - 450) {
        setLeftValue = event.clientX - 60;
      } else {
        setLeftValue = event.clientX - 60 - 450;
      }
      this.renderer.setElementStyle(this.EditTab.nativeElement, 'left', setLeftValue + 'px');
      this.renderer.setElementStyle(this.EditTab.nativeElement, 'top', event.clientY - 146 + this.imageForm.nativeElement.scrollTop + 'PX');
      this.operationView.imgOffsetX = event.offsetX;
      this.operationView.imgOffsetY = event.offsetY;
      this.operationView.imgOffsetWidth = this.imgForm.nativeElement.offsetWidth;
      this.operationView.imgOffsetHeight = this.imgForm.nativeElement.Height;
      this.operationView.imgClickPercentX = ((this.operationView.imgOffsetX / this.operationView.imgOffsetWidth) * 100).toFixed(4);
      this.operationView.imgClickPercentY = ((this.operationView.imgOffsetY / this.imgForm.nativeElement.offsetHeight) * 100).toFixed(4);
    }
  }


  /**
   * 鼠标松开事件
   */
  cancelShortCut(event: any) {
    event.stopPropagation();
    clearTimeout(this.timer);
    this.isTriggerClick = !this.isShowShortCut;
  }


  /**
   * 点击upload按钮创建tag
   */
  createImgTag(event: any) {
    event.stopPropagation();
    if (!this.isEdit) {  //创建tag
      if (this.imgTagSpec === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The spec or url cannot be empty!'
        };
        this.dialogService.openWarning(settings);
      } else {
        //随机生成颜色
        let color = this.randomTagColor();
        let data = {
          fid: this.imageInfo.fid,
          width: this.operationView.imgClickPercentX,
          height: this.operationView.imgClickPercentY,
          spec: this.imgTagSpec,
          url: this.imgTagUrl,
          color: color,
          form: this.currentItem.form
        };
        this.chatModelService.chatImgTag({
          data
        }, (res: any) => {
          //获取成功
          if (res.status === 1) {
            this.tagArr.push(res.data);
            for (let i in this.tagArr) {
              this.doFormatDate(this.tagArr[i], 2);
            }
          } else {
            this.dialogService.openWarning({simpleContent: 'add tag failed!'})
          }
        });
        this.isTabShow = false;
        this.imgTagSpec = '';
        this.imgTagUrl = '';
        this.isEdit = false;
      }
    } else {  //更新tag updateImgTag
      if (this.imgTagSpec === '' || this.imgTagUrl === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The spec or url cannot be empty!'
        };
        this.dialogService.openWarning(settings);
      } else {
        let data = {
          fid: this.imageInfo.fid,
          width: this.clickTagInfo.width,
          height: this.clickTagInfo.height,
          spec: this.imgTagSpec,
          url: this.imgTagUrl,
          color: this.clickTagInfo.color,
          form: this.currentItem.form,
          id: this.clickTagInfo.id
        };
        this.chatModelService.updateImgTag({
          data
        }, (res: any) => {
          //获取成功
          if (res.status === 1) {
            this.fetchChatImageTags();
          } else {
            this.dialogService.openWarning({simpleContent: 'update tag failed!'});
          }
        });
        this.isTabShow = false;
        this.imgTagSpec = '';
        this.imgTagUrl = '';
        this.isEdit = false;
      }
    }
  }


  /**
   * 生成tag随机色 并转化为16进制字符串
   */
  randomTagColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    let color = "rgb(" + r + ',' + g + ',' + b + ")";
    let rgb = color.split(',');
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }


  /**
   * 点击关闭TAG编辑框
   */
  closeTagTab(event: any) {
    event.stopPropagation();
    this.isTabShow = false;
  }


  /**
   * 点击显示tag详情
   */
  showTagDetail(event: any, tagInfo: any, index: number) {
    event.stopPropagation();
    for (let i in this.tagArr) {
      this.tagArr[i].isShowTagDetail = false;
    }
    tagInfo.isShowTagDetail = true;
  }


  /**
   * deleteTheTag
   */
  deleteTheTag(event: any, tagInfo: any) {
    event.stopPropagation();
    let data = {
      id: tagInfo.id
    };
    this.chatModelService.deleteImgTag({
      data
    }, (res: any) => {
      //获取成功
      if (res.status === 1) {
        for (let i in this.tagArr) {
          if (this.tagArr[i].id === tagInfo.id) {
            this.tagArr.splice(parseInt(i), 1)
          }
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'delete tag failed!'});
      }
    });
  }

  /**
   * stopPropagation
   */
  stopPropagation(event: any) {
    event.stopPropagation();
  }


  /**
   * 编辑这个tag
   */
  editTheTag(event: any, tagInfo: any) {
    event.stopPropagation();
    this.isTabShow = true;
    this.clickTagInfo = tagInfo;
    this.imgTagUrl = tagInfo.url;
    this.imgTagSpec = tagInfo.spec;
    this.isEdit = true;
    this.setEditDialogPosition(event, true);
  }


  /**
   * 点击显示评论列表
   * @param event
   */
  showImgComment(event: any) {
    event.stopPropagation();
    this.isShowCommentList = !this.isShowCommentList;
    this.isChangeCursor = false;
    this.isTabShow = false;
    this.currentCommentPage = 1;
    if (this.isShowCommentList) {
      this.fetchImgComment();
      let img = new Image();
      img.src = this.appConfig.resourceDomain + this.imageInfo.file_path;
      this.setDisplayImageWidth(img);
      this.setImagePosition();
    }
  }


  /**
   * fetchComment
   */
  fetchImgComment() {
    if (this.currentCommentPage !== 1) {
      this.isLoading = true;
    }
    let data = {
      page: this.currentCommentPage,
      fid: this.imageInfo.fid,
    };
    this.chatModelService.fetchImageComment({
      data
    }, (res: any) => {
      //获取成功
      this.isLoading = false;
      if (res.status === 1) {
        if (!res.data.comments) {
          this.loadEnd = true;
        } else {
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
          this.dealImageComments();
        }
        if (this.currentCommentPage === 1) {
          this.pageElement.scrollBottom(this.commentScroll.nativeElement);
        }
      } else {
        this.dialogService.openWarning({simpleContent: 'fetch image comments failed!'});
      }
    });
  }

  /**
   * 处理评论的头像信息
   */
  dealImageComments() {
    for (let i in this.commentLists) {
      for (let key in  this.commentUsers) {
        if (this.commentLists[i].owner == key) {
          this.commentLists[i].userInfo = this.commentUsers[key];
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
      data.timeStr = new Date(parseInt(data.inserted));
    } else if (type === 2) {
      data.timeStr = new Date(data.inserted * 1000);
    }
    data.timeStr1 = this.dateService.formatLocal(data.timeStr);
    data['day'] = this.dateService.format(data.timeStr, 'ddS');
    data['month'] = this.dateService.format(data.timeStr, 'mmm');
    data['year'] = this.dateService.format(data.timeStr, 'yyyy');
    data['week'] = this.dateService.format(data.timeStr, 'dddd');
    data['hour'] = data.timeStr.getHours();
    data['minute'] = this.dateService.formatWithTimezone(data.timeStr, 'MM');
    data['ap'] = this.dateService.format(data.timeStr, 'tt');
  }


  /**
   * 发送图片评论  addImageComment
   */
  sendImageComment() {
    if (this.sendCommentTxt !== '') {
      let data = {
        fid: this.imageInfo.fid,
        content: this.sendCommentTxt
      };
      this.loadEnd = false;
      this.chatModelService.addImageComment({
        data
      }, (res: any) => {
        //获取成功
        if (res.status === 1) {
          this.notificationService.postNotification({
            act: this.notificationService.config.ACT_COMPONENT_IMAGE_COMMENT,
            data: {
              img: this.imageInfo,
              commentTxt: this.sendCommentTxt
            }
          });
          this.currentCommentPage = 1;
          this.sendCommentTxt = '';
          this.pageElement.scrollBottom(this.commentScroll.nativeElement);
          this.fetchImgComment();
        } else {
          this.dialogService.openWarning({simpleContent: 'send image comment failed'});
        }
      });
    } else {
      this.dialogService.openWarning({simpleContent: 'comment content can not be empty!'});
    }
  }

  /**
   * 删除这条评论
   */
  deleteTheImageComment(event: any, comment: any) {
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
              fid: this.imageInfo.fid,
              page: comment.page
            }
            this.chatModelService.removeImageComment({
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
                this.dialogService.openWarning({simpleContent: 'delete the comment failed!'});
              }
            });
          }
        }
      ]
    };
    this.dialogService.openNew(settings);
  }


  /**
   * 点击打pin按妞 pin 这个图片
   */

  pinTheImage(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_IMAGE_PIN,
      data: [
        event,
        this.messageData
      ]
    });
  }


  /**
   * 关闭评论框
   */
  closeImageComment(event: any) {
    event.stopPropagation();
    this.isShowCommentList = false;
  }

  /**
   * 获取用户信息
   */
  getUserIn() {
    this.userData = this.userDataService.getUserIn();
  }


  /**
   * 点击点赞或者取消点赞
   */
  doLikeTheImage() {
    let data = {fid: this.imageInfo.fid};
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_IMAGE_LIKE,
      data: data
    });
    this.isLiked = !this.isLiked;
    this.isLiked ? this.likeCount++ : this.likeCount--;
  }


  /**
   * openTagHref
   */
  openTagHref(event: any, data: any) {
    event.stopPropagation();
    window.open(data);
  }

  /**
   * 点击图片弹框里面的删除删除这条消息
   */
  deleteTheMessage(event: any) {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_IMAGE_DIALOG_REMOVE_MESSAGE,
      data: [event, this.messageData]
    });
  }

  /**
   * 文件的转发
   */
  forwardTheMessage(event: any, messageData: any) {
    event.stopPropagation();
    this.isChangeCursor = false;
    this.isShowCommentList = false;
    this.isTabShow = false;
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_IMAGE_DIALOG_FORWARD_MESSAGE,
      data: [event, this.messageData]
    });
  }

  /**
   * 取图片前后五条数据
   */
  public queryBeforeAndAfterImg(): void {
    let fid: string = '';
    if (this.messageData.hasOwnProperty('detail') && this.messageData.detail.hasOwnProperty('fid')) {
      fid = this.messageData.detail.fid;
    }

    this.chatModelService.findBeforeAndAfterImg({
      data: {
        fid: fid,
        channel: this.currentItem.isFriend ? this.currentItem.uid : this.currentItem.gid
      }
    }, (res: any) => {
      if (res.status === 1) {
        if (res.data.hasOwnProperty('before') && res.data.hasOwnProperty('after')) {
          this.imgDataList = [];
          if (res.data.before.hasOwnProperty('msg')) {
            this.hasBeforeData = res.data.before.msg.length !== 0;
            if (this.hasBeforeData) {
              let beforeList = this.typeService.bindDataList(new ChatMessage(), res.data.before.msg, false, (obj: ChatMessage) => {
                if (res.data.before.hasOwnProperty('users_info')) {
                  for (let k in res.data.before.users_info) {
                    if (k === obj.owner) {
                      obj.userInfo = res.data.before.users_info[k];
                    }
                  }
                }
              });
              this.imgDataList = this.imgDataList.concat(beforeList);
            }
          }
          this.imgDataList.push(this.messageData);
          this.currentIdx = this.imgDataList.length - 1;
          if (res.data.after.hasOwnProperty('msg')) {
            this.hasAfterData = res.data.after.msg.length !== 0;
            if (this.hasAfterData) {
              let afterList = this.typeService.bindDataList(new ChatMessage(), res.data.after.msg, false, (obj: ChatMessage) => {
                if (res.data.after.hasOwnProperty('users_info')) {
                  for (let k in res.data.after.users_info) {
                    if (k === obj.owner) {
                      obj.userInfo = res.data.after.users_info[k];
                    }
                  }
                }
              });
              this.imgDataList = this.imgDataList.concat(afterList);
            }
          }
        }
      }
    })
  }

  /**
   * 点击切换到上一个图片
   * @param {MouseEvent} event
   */
  public clickSwitchToBefore(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentIdx !== 0 && !this.isLoadImg) { //必须有before 有data ，并且不是第一张时才能点
      this.currentIdx--;
      this.messageData = this.imgDataList[this.currentIdx];
      this.initTemplate();
      //如果往前有数据，并且请求成功，那么往后也有数据了
      this.isHasNextData = true;
    } else if (this.currentIdx === 0 && !this.isLoadImg && this.isHasPrevData && this.hasBeforeData) { //请求单向接口
      this.requestBeforeOrEnd(0);

    }
  }

  /**
   * 点击切换到下一个图片
   * @param {MouseEvent} event
   */
  public clickSwitchToAfter(event: MouseEvent): void {
    event.stopPropagation();
    if (this.currentIdx !== this.imgDataList.length - 1 && !this.isLoadImg) { //必须有after 有data ，并且不是第最后张时才能点
      this.currentIdx++;
      this.messageData = this.imgDataList[this.currentIdx];
      this.initTemplate();
      //如果往后有数据，并且请求成功，那么往前也有数据了
      this.isHasPrevData = true;
    } else if (this.currentIdx === this.imgDataList.length - 1 && !this.isLoadImg && this.isHasNextData && this.hasAfterData) { //请求单向接口
      this.requestBeforeOrEnd(1);
    }
  }


  /**
   * 初始化模板数据
   */
  private initTemplate(): void {
    clearTimeout(this.loadTimer);
    this.isTabShow = false;
    this.isLoadImg = true;
    this.messageData.inserted = this.messageData.time ? this.messageData.time : new Date().getTime();
    this.doFormatDate(this.messageData, 1);
    this.imageInfo = this.messageData.detail.file_info ? this.messageData.detail.file_info : this.messageData.detail;
    let img = new Image();
    img.src = this.appConfig.resourceDomain + this.imageInfo.file_path;
    this.loadTimer = setTimeout(() => {
      this.setDisplayImageWidth(img);
      this.imageOwner = this.messageData.userInfo;
      if (this.messageData) {
        this.getUserIn();
        this.fetchChatImageTags();
        this.fetchImageLikes();
      }
      //如果是点开评论按钮展开默认展开图片
      if (this.isShowCommentList) {
        this.currentCommentPage = 1;
        this.commentLists = [];
        this.fetchImgComment();
      }
      let timer = setTimeout(() => {
        this.isLoadImg = false;
        this.setImagePosition();
        clearTimeout(timer);
      }, 300)
    }, 300);
  }

  /**
   * 单项请求  左边 还是 右边
   * @param number
   */
  private requestBeforeOrEnd(number: number): void {
    let fid: string = '';
    if (this.messageData.hasOwnProperty('detail') && this.messageData.detail.hasOwnProperty('fid')) {
      fid = this.messageData.detail.fid;
    }
    this.chatModelService.queryBeforeOrAfterImg({
        data: {
          fid: fid,
          position: number,
          channel: this.currentItem.isFriend ? this.currentItem.uid : this.currentItem.gid
        }
      }, (res: any) => {
        if (res.status === 1) {
          if (number === 0) {
            this.hasAfterData = true;
            this.buildPrevImgData(res);
          } else {
            this.hasBeforeData = true;
            this.buildNextImgData(res);
          }
        } else {
          this.dialogService.openError({
            simpleContent: 'get next image failed!'
          })
        }

      }
    )
  }

  /**
   * 初始化 单向方向切换图片的前面的数据
   * @param res
   */
  private buildPrevImgData(res: any) {
    //是否有msg,没有的话还是原来的imgList，要是有的话，重置imgList，当前这条是最后一条，其余的添加到前面，currentIdx是 msg的length-1
    if (res.data.hasOwnProperty('msg')) {
      this.isHasPrevData = res.data.msg.length !== 0;
      if (this.isHasPrevData) {
        this.imgDataList = [];
        let beforeList = this.typeService.bindDataList(new ChatMessage(), res.data.msg, false, (obj: ChatMessage) => {
          if (res.data.hasOwnProperty('users_info')) {
            for (let k in res.data.users_info) {
              if (k === obj.owner) {
                obj.userInfo = res.data.users_info[k];
              }
            }
          }
        });
        this.imgDataList = this.imgDataList.concat(beforeList);
        this.imgDataList.push(this.messageData);
        //要显示前一张
        this.currentIdx = this.imgDataList.length - 2;
        this.messageData = this.imgDataList[this.imgDataList.length - 2];
        this.initTemplate();
      }
    } else {
      this.isHasPrevData = false;
    }
  }

  /**
   * 初始化 单向方向切换图片的后面的数据
   * @param res
   */
  private buildNextImgData(res: any) {
    //是否有msg,没有的话还是原来的imgList，要是有的话，重置imgList，当前这条是第一条，其余的添加到后面，currentIdx是0
    if (res.data.hasOwnProperty('msg')) {
      this.isHasNextData = res.data.msg.length !== 0;
      if (this.isHasNextData) {
        this.imgDataList = [];
        let afterList = this.typeService.bindDataList(new ChatMessage(), res.data.msg, false, (obj: ChatMessage) => {
          if (res.data.hasOwnProperty('users_info')) {
            for (let k in res.data.users_info) {
              if (k === obj.owner) {
                obj.userInfo = res.data.users_info[k];
              }
            }
          }
        });
        this.imgDataList.push(this.messageData);
        this.imgDataList = this.imgDataList.concat(afterList);
        //要显示后一张
        this.currentIdx = 1;
        this.messageData = this.imgDataList[1];
        this.initTemplate();
      }
    } else {
      this.isHasPrevData = false;
    }
  }

  /**
   * 充值数据
   */
  private resetImgData(): void {
    this.imgDataList = [];
    this.isHasPrevData = true;
    this.isHasNextData = true;
  }

  focusCommentInput() {
    this.isFocusCommentInput = true;
  }

  blurCommentInput() {
    this.isFocusCommentInput = false;
  }

  /**
   * 将文件归档到云盘
   */
  archiveToFolder(event: any) {
    event.stopPropagation();
    if (!this.messageData || !this.currentItem) return;
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
   * 下载这张图片
   */
  downloadTheImage(event: any) {
    event.stopPropagation();
    if (!this.messageData || !this.currentItem) return;
    let sessionId = this.userDataService.getSessionId();
    let fileInfo= this.messageData.detail;
    this.downloadService.downloadTheFile(this.appConfig.resourceFolderDomain + this.downLoadUrl + '?form=' +
      this.currentItem.form + '&fid=' + fileInfo.fid + '&session_id=' + sessionId);
  }

}