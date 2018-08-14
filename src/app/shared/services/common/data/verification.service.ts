import {Injectable, ViewChild, Renderer, OnInit, Inject} from '@angular/core';
const verificationMessage: any = {
  empty: 'can not be empty!',                            //inputName + 不可以为空
  email: 'The mailbox format is incorrect!',             //邮箱格式不正确
  phone: 'The phone is not in the right format!',        //电话格式不正确
  date: 'Date format is incorrect!',                     //日期格式不正确
  time: 'Time format is incorrect!',                     //时间格式不正确
  startTime: ' must select start time!',                 //选择开始时间
  endTime: 'must select end time!',                      //选择结束时间
  isNumber: 'This is not a number!',                     //这不是一个数字
  isInteger: 'This is not an integer!',                  //不是一个整数
  lessThan: 'The value must not be less than 0!',        //数字不可以小于 0
  strLength: 'must not be less than!'                    //字符串不可以小于 多少 (默认6字符串)
};

const verificationRegExp: any = {
  email: /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/,
  phone: /^1\d{10}$/,
  isNumber: /^[0-9]+$/,
  isCn: /[\u4E00-\u9FA5]|[·|！|@|#|￥|%|…|&|*|（|）|—|、|《|》|？|，|。|【|】|{|}]|[０｜１｜２｜３｜４｜５｜６｜７｜８｜９]|　/g,
  isEn: /[a-zA-Z0-9]|[`|!|@|#|$|%|^|&|*|(|)|_|+|{|}|<|>|?|,|.|/|[|]|'|;|:|"/g
};

@Injectable()
export class VerificationService implements OnInit {

  private el: Array<any> = [];
  private element: Array<any> = [];
  private timeElement: Array<any> = [];
  private inputName: string;
  private dataType: string;
  private currentValue: string;
  private contentEl: any;
  private errorEl: any;
  private isBool: boolean;
  private currentElement: any;

  @ViewChild('verificationList') private verificationList: any;

  constructor(@Inject('page.element') public pageElement: any,
              @Inject('bi-translate.service') public translate: any) {
  }

  ngOnInit() {
  }

  /**
   * 当前所有需要验证列表
   * @param el  input文本框
   * @param element input对应提示错误标签
   * @param timeElement
   */
  elementArr(el?: any, element?: any, timeElement?: any) {
    if (el && element) {
      this.el.push(el);
      this.element.push(element);
      this.timeElement.push(timeElement ? timeElement : '');
    }
  }

  /**
   * 清空数据
   */
  clearElementArr() {
    if(this.el && this.element) {
      this.el = [];
      this.element = [];
      this.timeElement = [];
    }
  }

  /**
   * 初始化input提示错误信息
   */
  initInputError() {
    if(this.el) {
      this.el.forEach((val, key) => {
        this.contentEl = val;
        this.errorEl = this.element[key];
        this.showErrorClass(true);
      })
    }
  }

  /**
   * 提交检测
   * @returns {boolean}
   */
  elementData(): boolean {
    for (let key in this.el) {
      let el: any = this.el[key].nativeElement;
      this.currentValue = el.value;
      this.inputName = this.pageElement.getElementAttrVal(el, 'name');
      this.dataType = this.pageElement.getElementAttrVal(el, 'data-type');
      this.contentEl = el;
      this.currentElement = this.timeElement[key].nativeElement;
      this.errorEl = this.element[key].nativeElement;
      this.inputFn();
    }

    for (let key in this.el) {
      let el: any = this.el[key].nativeElement;
      if (this.pageElement.getElementAttrVal(el, 'data-true') === 'true') {
        this.isBool = true;
        break;
      } else {
        this.isBool = false;
      }
    }
    return this.isBool;
  }

  /**
   * 鼠标移入/移出
   * @param isBool
   */
  inputElEvent(isBool: boolean = false) {
    this.isBool = true;
    this.inputFn(isBool);
  }

  /**
   * 设置 element 信息
   * @param isBool
   */
  inputFn(isBool: boolean = true) {
    this.currentValue = this.contentEl.value;
    if (!this.currentValue || (this.currentValue && this.currentValue.trim().length === 0)) {
      if (isBool) {
        this.showErrorClass();
      }
      this.showErrorMessage(true, 'empty');
    } else {
      this.showErrorMessage(isBool);
    }
  }

  /**
   * 当前input对象
   * @param contentEl
   * @param errorEl
   * @param inputName
   * @param dataType
   */
  setInputObj(contentEl: any, errorEl: any, inputName: string, dataType: string) {
    this.contentEl = contentEl;
    this.errorEl = errorEl;
    this.inputName = inputName ? inputName : '';
    this.dataType = dataType ? dataType : 'empty';
  }

  /**
   * 显示错误信息
   * @param isBool
   */
  showErrorClass(isBool: boolean = false) {
    if (isBool) {
      this.pageElement.setClass(this.dataType === 'time' ? this.currentElement : this.contentEl, '', 'g-show-input-error');
      this.pageElement.setClass(this.errorEl, '', 'g-show-error');
    } else {
      let dataIsBorder: string = this.contentEl.getAttribute('data-isBorder');
      if (!dataIsBorder) {
        this.pageElement.setClass(this.dataType === 'time' ? this.currentElement : this.contentEl, 'g-show-input-error', '');
      }
      this.pageElement.setClass(this.errorEl, 'g-show-error', '');
    }
  }

  /**
   * 匹配值
   * @param isBool
   * @param getType
   */
  showErrorMessage(isBool: boolean = true, getType?: string) {
    let type: string = getType ? getType : this.dataType;
    switch (type) {
      case 'empty':
        this.pageElement.setElementAttrVal(this.contentEl, 'data-true', 'true');
        let errorData = (this.inputName ? this.inputName + ' ' : this.inputName) + verificationMessage.empty;
        this.translate.manualTranslate(errorData);
        this.errorEl.innerHTML = this.translate.manualTranslate(errorData);
        break;
      case 'email':
        this.setElementMethod(isBool, 'email');
        break;
      case 'phone':
        this.setElementMethod(isBool, 'phone');
        break;
      case 'lessThan':
        this.setElementMethod(isBool, 'isNumber', () => {
          if (this.currentValue < '0') {
            let errorData = verificationMessage.lessThan;
            this.errorEl.innerHTML = this.translate.manualTranslate(errorData);
          } else {
            let errorData = verificationMessage.isNumber;
            this.errorEl.innerHTML = this.translate.manualTranslate(errorData);
          }
        });
        break;
      case 'time':
        this.pageElement.setElementAttrVal(this.contentEl, 'data-true', 'false');
        break;
      case 'strLength':
        break;
      case 'number':
        if(parseInt(this.currentValue) === 0) {
          this.pageElement.setElementAttrVal(this.contentEl, 'data-true', 'true');
          let errorData = verificationMessage['lessThan'];
          this.errorEl.innerHTML = this.translate.manualTranslate(errorData);
          this.showErrorClass();
        }else {
          this.setElementMethod(isBool, 'isNumber');
        }
        break;
    }
  }

  /**
   * 设置元素方法
   * @param isBool
   * @param name
   * @param callBack
   */
  setElementMethod(isBool: boolean, name: string, callBack?: any) {
    if (verificationRegExp[name].test(this.currentValue)) {
      this.pageElement.setElementAttrVal(this.contentEl, 'data-true', 'false');
      this.showErrorClass(true);
    } else if (isBool) {
      this.pageElement.setElementAttrVal(this.contentEl, 'data-true', 'true');
      if (callBack) {
        callBack();
      } else {
        let errorData = verificationMessage[name];
        this.errorEl.innerHTML = this.translate.manualTranslate(errorData);
      }
      this.showErrorClass();
    }
  }

}
