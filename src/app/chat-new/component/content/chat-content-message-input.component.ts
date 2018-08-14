/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/30.
 */

import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output, Inject,
  ViewChild, Renderer
} from "@angular/core";
import {ChatConfig} from "../../../shared/config/chat.config";
import {ChatUserInfo} from "../../../shared/services/model/entity/chat-entity";
import * as FolderConstant from '../../../shared/config/folder.config';
import {Ng2DeviceService} from 'ng2-device-detector';
import {EmojiPickerAppleSheetLocator} from "../../../bi-emoji-panel/sheets/sheet_apple_map";
import {EmojiPickerOptions} from "../../../bi-emoji-panel/services/emoji-picker.service";
import {EmojiEvent} from "../../../bi-emoji-panel/lib/emoji-event";

@Component({
  selector: 'chat-content-message-input',
  templateUrl: '../../template/content/chat-content-message-input.component.html',
  providers: [
    Ng2DeviceService,
    EmojiPickerOptions
  ]
})

export class ChatContentMessageInputComponent implements OnInit {
  public chatConfig: ChatConfig = new ChatConfig();
  public messageData: string = '';
  public mapArr: Array<any> = [];
  public realMessageData: string = '';
  public textAreaRows: number = 1;
  public keyEnterList: any = [];
  public isNotInMail: boolean = true;
  public forbiddenAT: boolean = true;
  public atUserList: Array<ChatUserInfo> = [];
  public activeAtUserIdx: number = -1;
  public activeMinAtUserIdx: number = 0;
  @ViewChild('input') public inputTextarea: ElementRef;
  @ViewChild('textareaWarp') public textareaWarp: ElementRef;
  @ViewChild('atUserListElement') public atUserListElement: ElementRef;
  private currentItem: any;
  private isMiniDialog: boolean = false;
  public isChMsgSendCurrent: boolean = false;
  public textAreaDefaultHeight: number = 20;
  public openEmoji: boolean = false;
  public emojiPanelInit: boolean = false;
  private isMissionDialog: boolean = false;
  public errorMsg: string = '';

  @Input('setAtUserList')
  public set setAtUserList(data: Array<ChatUserInfo>) {
    this.atUserList = data;
  }

  @Input('setIsNotInMail')
  public set setIsNotInMail(data: boolean) {
    this.isNotInMail = data;
  }

  @Input('setForbiddenAT')
  public set setForbiddenAT(data: boolean) {
    this.forbiddenAT = data;
  }

  @Input()
  public  set setCurrentItem(data: any) {
    this.currentItem = data;
  }


  @Input()
  public  set setIsMiniDialog(data: any) {
    this.isMiniDialog = data;
  }

  @Input()
  public  set setIsMissionDialog(data: any) {
    this.isMissionDialog = data;
  }
  public showAtList: boolean = false;

  ngOnInit(): void {
    let cols = this.calculateCols();
    this.renderer.setElementAttribute(this.inputTextarea.nativeElement, 'cols', cols.toString());

  }

  @Output('outAtUser') outAtUser = new EventEmitter<any>();
  @Output('outSendMessage') outSendMessage = new EventEmitter<any>();
  @Output('outFileUpLoad') outFileUpLoad = new EventEmitter<any>();
  @Output('outChangeHeight') outChangeHeight = new EventEmitter<any>();

  constructor(@Inject('app.config') public appConfig: any,
              @Inject('type.service') public typeService: any,
              @Inject('string.service') public stringService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('notification.service') public notificationService: any,
              private emojiPickerOptions: EmojiPickerOptions,
              public renderer: Renderer,
  ) {
    if(this.emojiPickerOptions){
      this.emojiPickerOptions.setEmojiSheet({
        url: 'assets/images/sheet_apple_32.png',
        locator: EmojiPickerAppleSheetLocator
      });
    }
  }


  showEmoji(event: any) {
    event.stopPropagation();
    this.openEmoji = !this.openEmoji;
    this.emojiPanelInit = true;
  }

  ngAfterViewInit() {

  }

  focusToTextArea() {
    this.setInputFocus();
  }


  /**
   * focus/blur事件
   * @param type
   */
  textAreaEvent(type: string) {
    if (type === 'focus') {
      this.isChMsgSendCurrent = true;
    } else if (type === 'blur') {
      this.isChMsgSendCurrent = false;
    }
  }

  /**
   * 计算textarea高度
   */
  textAreaInput() {
    this.renderer.setElementStyle(this.inputTextarea.nativeElement, 'height', '0');
    let scrollHeight: number = this.inputTextarea.nativeElement.scrollHeight - 4;
    this.renderer.setElementStyle(this.inputTextarea.nativeElement, 'overflow-y', scrollHeight > 100 ? 'scroll' : 'hidden');
    this.renderer.setElementStyle(this.inputTextarea.nativeElement, 'height', (scrollHeight > 100 ? 100 : scrollHeight) + 'px');

  }

  /**
   * 粘贴事件，计算行高
   * @param event
   * @param input
   */
  pasteEvent(event: any, input: any) {
    let pasteData: any;
    if ((<any>window).clipboardData && (<any>window).clipboardData.setData) {
      // IE
      pasteData = (<any>window).clipboardData.getData('Text');
    } else {
      pasteData = (event.originalEvent || event).clipboardData.getData('text/plain');
    }
    let clipboardData = event.clipboardData || (<any>window).clipboardData;
    if (clipboardData.types && (clipboardData.types[0] === 'Files'
      || (clipboardData.types[1] && clipboardData.types[1].indexOf('image') !== -1))) {
      let items = (event.clipboardData || event.originalEvent.clipboardData).items;
      if (!items) {
        let settings = {
          title: 'Notice!',
          simpleContent: '当前浏览器不支持发送屏幕截图',
        };
        this.dialogService.openWarning(settings)
      } else {
        this.dealPrintScreen(items);
      }
    } else {
      let pasteCount = 0;
      let pos = pasteData.indexOf("\n");
      while (pos !== -1) {
        pasteCount++;
        pos = pasteData.indexOf("\n", pos + 1);
      }
      // 有选中的情况下
      if (input.selectionStart !== input.selectionEnd) {
        //全选复制，相当于替换
        if (this.messageData.length === (input.selectionEnd - input.selectionStart)) {
          this.textAreaRows = pasteCount + 1;
          //部分替换
        } else {
          let replaceText = this.messageData.substr(input.selectionStart, input.selectionEnd - input.selectionStart + 1);
          let replaceCount = 0;
          let pos = replaceText.indexOf("\n");
          while (pos !== -1) {
            replaceCount++;
            pos = replaceText.indexOf("\n", pos + 1);
          }
          this.textAreaRows = this.textAreaRows + pasteCount - replaceCount + 1;
        }
        // 纯增加
      } else {
        this.textAreaRows += pasteCount;
      }
      if (pasteData.slice(-1) === '@' && !this.forbiddenAT) {
        this.showAtList = true;
      }
    }
    this.setInputFocus();
  }

  /**
   * 键盘按下时检查是否要发送和匹配特殊规则
   * Key code @see https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
   * @param event
   * @param input HtmlObject
   */
  detectKeyDownChange(event: KeyboardEvent, input: any) {
    if (this.showAtList && (event.keyCode == 38 || event.keyCode == 40)) {
      event.preventDefault();
      this.changeAtUserIdx(event);
      return;
    }
  }

  /**
   *
   * @param event
   * @param input
   */
  detectKeyPressChange(event: KeyboardEvent, input: any) {
    if (!(this.keyEnterList && this.keyEnterList.indexOf(event.keyCode) !== -1)) {
      //TODO: 保留用户按键记录，支持以后的正则匹配
      this.keyEnterList.push(event.keyCode);
    }
    this.messageData = input.value;
    // 回车
    if (event.keyCode === 13 && !event.ctrlKey) {
      event.preventDefault();
      // 发送消息
      if (!this.showAtList) {
        if (this.messageData) {
          this.sendMessage();
          // 选中所选@用户
        }
      } else {
        this.changeAtUserIdx(event, this.activeAtUserIdx, input);
      }
    }
  }

  /**
   *
   * @param event
   * @param input
   */
  detectKeyUpChange(event: KeyboardEvent, input: any) {
    event.stopPropagation();
    this.textAreaInput();
    this.calculateLineNumber(event, input);
    if (this.showAtList) {
      this.detectCloseAtList(event, input);
    } else if (!this.forbiddenAT && !this.showAtList) {
      this.detectOpenAtList(event, input);
    }
  }

  detectOpenAtList(event: KeyboardEvent, input: any) {
    // 最后一个字符是@
    if (input.value.substring(input.selectionEnd, -1).slice(-1) === '@' && !this.forbiddenAT) {
      this.showAtList = true;
      this.activeAtUserIdx = 0;
    }
  }


  /**
   * 当@列表展开时候，如果用户输入的符合用户名列表，保持显示并过滤
   * 不然关闭
   * @param event
   * @param input
   */
  detectCloseAtList(event: KeyboardEvent, input: any) {
    // 上下移动，不用触发过滤
    if ((event.keyCode == 38 || event.keyCode == 40)) {
      return;
    }
    // 回退到了@符号
    if (input.value.substring(input.selectionEnd, -1).slice(-1) === '@') {
      if (event.keyCode === 8) {
        this.activeAtUserIdx = 0;
        this.activeMinAtUserIdx = 0;
      }

      this.atUserList.forEach((user: ChatUserInfo) => {
        user.filtered = false;
      });
      return;
    }
    let inputValueIdx = input.value.lastIndexOf('@', input.selectionEnd);
    let inputValue = '';

    if (inputValueIdx !== -1) {
      //搜索下拉菜单的文本值
      inputValue = input.value.substring(inputValueIdx + 1, input.selectionEnd);
    } else {
      this.closeAtList();
      return;
    }
    if (this.atUserList.length) {
      let close = true;
      this.atUserList.forEach((user: ChatUserInfo, index: number) => {
        if (inputValue) {
          let key = user.work_name.toLowerCase();
          let filter = inputValue.toLowerCase();
          user.filtered = (key.indexOf(filter) === -1);
          if (key.indexOf(filter) !== -1) {
            //只需要高亮找到的第一个
            if (close) {
              this.activeMinAtUserIdx = index;
              this.activeAtUserIdx = index;
            }
            close = false;
          }
        }
      });
      if (close) {
        this.closeAtList();
      }
    }
  }

  /**
   * 关闭@列表
   */
  closeAtList() {
    this.showAtList = false;
    this.activeAtUserIdx = -1;
    this.atUserList.forEach((user: ChatUserInfo) => {
      user.filtered = false;
    });
  }

  /**
   * 计算换行数
   * @param event
   * @param input
   */
  calculateLineNumber(event: KeyboardEvent, input: any) {
    let count = 1;
    if (input.value === '') {
      this.textAreaRows = count;
      return;
    }
    let inputTest: HTMLTextAreaElement = this.inputTextarea.nativeElement;
    //count = (inputTest.scrollHeight - 2 * 2) / 20;
    let cols = this.calculateCols();
    this.renderer.setElementAttribute(inputTest, 'cols', cols.toString());
    count = Math.floor(input.value.length / cols) + 1;
    let enterCount = 0;

    if (event.keyCode === 13 && event.ctrlKey) {
      this.messageData += "\n";
      enterCount++;
    }
    let pos = input.value.indexOf("\n");
    while (pos !== -1) {
      enterCount++;
      pos = input.value.indexOf("\n", pos + 1);
    }
    this.textAreaRows = count + enterCount;
    if (this.textareaWarp) {
      this.outChangeHeight.emit(this.textareaWarp.nativeElement.offsetHeight);
    }
    this.checkMessageIsValid();
  }

  calculateCols(): number {
    if (!this.textareaWarp) {
      return 99;
    }
    return Math.ceil((this.textareaWarp.nativeElement.offsetWidth - 62 ) / 6);
  }

  //new post
  createChatPost(event: any): void {
    event.stopPropagation();
    this.notificationService.postNotification({
      act: this.notificationService.config.ACT_COMPONENT_CHAT_CONTENT_MESSAGE_INPUT_NEW_POST,
      data: {
        showPost: true,
        currentItem: this.currentItem
      }
    })
  }

  clickSetAtUser(event: MouseEvent, i: number, input: any) {
    event.stopPropagation();
    this.changeAtUserIdx(event, i, input);
  }

  /**
   * emoji选中事件
   */
  handleEmojiSelection(event: EmojiEvent) {
    let input = this.inputTextarea.nativeElement;
    let oldStart = input.selectionStart === input.value.length ? input.selectionStart + 1 : input.selectionStart;
    if (input.selectionStart === 0) {
      oldStart = 0;
    }
    this.messageData = this.stringSplice(input.value, oldStart, input.selectionEnd - oldStart, ':' + event.label + ':');
    this.setInputFocus(oldStart + event.label.length + 3);
  }

  /**
   * 更改选中
   * @param event
   * @param idx
   * @param input
   */
  changeAtUserIdx(event: any, idx?: number, input?: any) {
    if (event instanceof KeyboardEvent) {
      switch (event.keyCode) {
        //↑
        case 38:
          if (this.activeAtUserIdx === -1) {
            this.activeAtUserIdx = 0;
          }
          if (this.activeAtUserIdx > this.activeMinAtUserIdx) {
            this.activeAtUserIdx--;
          }
          this.atUserListElement.nativeElement.scrollTop = this.activeAtUserIdx * 32;
          break;
        //↓
        case 40:
          if (this.activeAtUserIdx < this.atUserList.length - 1) {
            this.activeAtUserIdx++;
            this.atUserListElement.nativeElement.scrollTop = this.activeAtUserIdx * 32;
          }
          break;
        //回车
        case 13:
          if (idx === -1) {
            idx = 0;
          }
          let atUser = this.atUserList[idx];
          if (atUser) {
            let oldStart = input.selectionStart;
            let findAtPos = input.value.lastIndexOf('@', input.selectionEnd);
            let replaceStart = findAtPos !== -1 ? findAtPos : input.selectionStart;
            this.messageData = this.stringSplice(this.messageData, findAtPos + 1, input.selectionEnd - replaceStart, atUser.work_name + ' ');
            this.setInputFocus(oldStart + atUser.work_name.length + 1);
          }
          this.closeAtList();
          break;
      }
    } else if (event instanceof MouseEvent) {
      this.activeAtUserIdx = idx;
      let atUser = this.atUserList[this.activeAtUserIdx];
      // 选中字是替换, 不然是新增
      if (atUser) {
        let atUser = this.atUserList[idx];
        let oldStart = input.selectionStart;
        let findAtPos = input.value.lastIndexOf('@', input.selectionEnd);
        let replaceStart = findAtPos !== -1 ? findAtPos : input.selectionStart;
        this.messageData = this.stringSplice(input.value, findAtPos + 1, input.selectionEnd - replaceStart, atUser.work_name + ' ');
        this.setInputFocus(oldStart + atUser.work_name.length + 1);
      }
      this.closeAtList();
    }
  }

  public setInputFocus(startIdx?: number) {
    let inputEle: HTMLTextAreaElement = this.inputTextarea.nativeElement;
    setTimeout(() => {
      inputEle.focus();
      if (startIdx) {
        inputEle.selectionStart = inputEle.selectionEnd = startIdx;
      }
    }, 300);
  }

  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @param {String} str
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @returns {string}
   */
  stringSplice(str: string, start: number, delCount: number, newSubStr: string) {
    return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
  }

  /**
   * 验证字符串合法性
   * @return {boolean}
   */
  checkMessageIsValid(){
    let len = this.typeService.getStringLocaleLen(this.inputTextarea.nativeElement.value);
    let result =  len > 600;
    if (result) {
      this.errorMsg = 'Your message is too long, Maximum is 600';
    } else {
      this.errorMsg = '';
    }
    return !result;
  }
  sendMessage() {
    //如果发送成功，清空
    if (this.messageData) {
      if (!this.forbiddenAT && this.atUserList) {
        //是否要替换@用户
        this.atUserList.forEach((user: ChatUserInfo) => {
          let toFind = new RegExp('(@' + user.work_name + ') {1}', "g"); //注意work_name后的空格，如果去除，匹配中文结尾会有问题
          let replace = '<@USER|' + user.uid + '>  ';
          this.messageData = this.messageData.replace(toFind, replace);
        });
      }

      this.messageData = this.stringService.removeSpaces(this.messageData);
      // 检查长度
      if (this.checkMessageIsValid()) {
        if (this.textareaWarp) {
          this.outChangeHeight.emit(44);
        }
        this.outSendMessage.emit(this.messageData);
        this.keyEnterList = [];
        this.messageData = '';
        this.inputTextarea.nativeElement.value = '';
        this.realMessageData = '';
        this.textAreaRows = 1;
        this.setInputFocus(0);
      }
    }
  }

  /**
   *点击上传聊天文件或者图片
   */
  uploadChatFile(event: any, input: any) {
    event.stopPropagation();
    input.click();
  }

  /**
   * file input 框文件变化
   * @param event
   * @param ele
   */
  inputChangeEvent(ele: any, event?:any) {
    for (let i in ele.files) {
      if (ele.files[i].size === 0) {
        let settings = {
          title: 'Notice!',
          simpleContent: ele.files[i].name +  this.translateService.manualTranslate(' file size is 0, can not be uploaded.'),
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (ele.files[i].size > this.appConfig.uploadImgSize * 1024 * 1024) {
        this.dialogService.openWarning({
          simpleContent: ele.files[i].name + this.translateService.manualTranslate(' file size too large, limit is ') + this.appConfig.uploadImgSize + 'MB',
        });
        return false;
      }
    }
    if (event) {
      event.stopPropagation();
    }
    this.outFileUpLoad.emit(ele);
    // ele.value = null;
  }


  /**
   * 当用户点击@符号时调用
   * @param ownerName 别@的人名
   */
  manuallyInputAtUser(ownerName: string) {
    let input: HTMLTextAreaElement = this.inputTextarea.nativeElement;
    let oldStart = input.selectionStart === input.value.length ? input.selectionStart + 2 : input.selectionStart;
    if (input.selectionStart === 0) {
      oldStart = 0;
    }
    this.messageData = this.stringSplice(input.value, oldStart, input.selectionEnd - oldStart, '@' + ownerName + ' ');
    this.setInputFocus(input.selectionStart + ownerName.length + 2);
  }

  /**
   * 从bi导入文件
   */
  importFileFromBi(event: any) {
    event.stopPropagation();
    let optionData: any = {
      currentItem: this.currentItem,
      isMiniDialog:  (this.isMissionDialog || this.isMiniDialog),
    };
    this.dialogService.openNew({
      mode: '4',
      isSimpleContent: false,
      componentSelector: 'import-file',
      componentData: this.typeService.clone(optionData),
      buttons: [
        {type: 'cancel'},
        {
          type: 'send',
          btnText: 'IMPORT',
          btnEvent: 'importFileToChat'
        }
      ]
    })
  }

  dealPrintScreen(items: any) {
    let blob = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }
    if (blob !== null) {
      let reader = new FileReader();
      let self = this;
      reader.onload = function (event) {
        let result = event.target['result'];
        if (result) {
          let mimeString = result.split(',')[0].split(':')[1].split(';')[0]; // mime类型
          let byteString = atob(result.split(',')[1]); //base64 解码
          let arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
          let intArray = new Uint8Array(arrayBuffer); //创建视图
          for (let i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
          }
          let blob = new Blob([intArray], {type: mimeString}); //转成blob
          let ele = {
            file: {
              name: '屏幕截图.png',
              fileName: '屏幕截图',
              fileSize: blob.size,
              type: blob.type,
              fileSrc: result,
              lastUpdateTemplate: self.translateService.manualTranslate('less than one minute'),
              fileSuffix: 'png',
              isImage: true
            }
          };
          let optionData: any = {
            data: ele,
            form: self.currentItem.form,
            pdid: self.currentItem.isFriend ? self.currentItem.uid : self.currentItem.gid,
            module: self.currentItem.isFriend ? FolderConstant.MODULE_CHAT_FRIEND_TYPE : FolderConstant.MODULE_CHAT_GROUP_TYPE,
            isScreenCut: true,
            isChat: true,
            isMiniDialog: (self.isMissionDialog || self.isMiniDialog),
            currentMenuItem: self.currentItem
          };
          self.dialogService.openNew({
            mode: '1',
            title: 'UPLOAD FILE',
            isSimpleContent: false,
            componentSelector: 'folder-upload',
            componentData: optionData,
            buttons: [
              {
                type: 'cancel',
                btnEvent: () => {

                }
              },
              {
                type: 'send',
                btnText: 'UPLOAD',
                btnEvent: 'uploadScreenImg'
              }
            ]
          });
        }
      }
      reader.readAsDataURL(blob);
    }
  }


}