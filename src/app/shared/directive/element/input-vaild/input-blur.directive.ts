import {Directive, ContentChild, Input, AfterViewInit, Inject} from '@angular/core';
import {VerificationService} from '../../../services/common/data/verification.service'

@Directive({
  selector: '[inputBlur]'
})

export class InputBlurDirective implements AfterViewInit {

  public contentElement: any;
  public errorElement: any;

  @ContentChild('inputContent') private inputContent: any;
  @ContentChild('inputError') private inputError: any;

  @ContentChild('verificationInput') private verificationInput: any;
  @ContentChild('errorMessage') private errorMessage: any;
  @ContentChild('verificationTime') private verificationTime: any;

  constructor(
    @Inject('page.element') public pageElement: any,
    @Inject('verification.service') public verificationService: any
  ) {}

  ngAfterViewInit() {
    if(this.verificationInput) {
      this.contentElement = this.verificationInput.nativeElement;
      this.errorElement = this.errorMessage.nativeElement;
      this.verificationService.elementArr(this.verificationInput, this.errorMessage, this.verificationTime);

      //鼠标离开/光标移入文本框
      this.mouseBlurInput();
    }else {
      let _this = this;
      let flag:number = 0;
      this.inputContent.nativeElement.onblur = function () {
        let inputClass = this.className;
        //值为空，全为空格
        if(inputClass.indexOf('g-show-input-error') != -1){
          flag = 1;
        }
        if ((this.value === '' || this.value.trim().length == 0 )) {
          if(!flag){
            this.setAttribute('class', inputClass + ' g-show-input-error');
            _this.inputError.nativeElement.setAttribute('class',' g-show-error');
          }
        } else {
          let inputClass = this.className;
          inputClass = inputClass.replace('g-show-input-error', '');
          this.setAttribute('class', inputClass);
          _this.inputError.nativeElement.setAttribute('class',' hide');
          flag = 0;
        }
      }
    }
  }

  /**
   * 鼠标离开/光标移入文本框
   */
  mouseBlurInput() {

    //鼠标移入
    this.contentElement.onfocus = () => {
      let inputName: string = this.pageElement.getElementAttrVal(this.contentElement, 'name');
      let dataType: string = this.pageElement.getElementAttrVal(this.contentElement, 'data-type');
      this.verificationService.setInputObj(this.contentElement, this.errorElement, inputName, dataType);
      this.contentElement.onkeyup = () => {
        this.verificationService.inputElEvent();
      }
    };

    //鼠标离开
    this.contentElement.onblur = () => {
      this.verificationService.inputElEvent(true);
    };
  }

}