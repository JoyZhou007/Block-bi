import {
  Directive, Inject, ContentChild, Output, EventEmitter,
  OnInit, Renderer, HostListener, Input, AfterViewInit, AfterContentChecked
} from '@angular/core';

@Directive({
  selector: '[toggleSelectGroup]'
})

export class ToggleSelectDirective implements OnInit, AfterViewInit {
  private toggleSelectElement: any;
  private toggleSelectButElement: any;
  public isSelect: boolean = true;
  private isEventBool: boolean = false;
  public toggleElement: any;
  private selectHeight: number;
  private children: any;
  private getIsEnter: boolean = false;
  private inputClassName: string = 'g-readonly-input';

  constructor(
    public renderer: Renderer,
    @Inject('page.element') public element: any,
    @Inject('type.service') public typeService: any,
    @Inject('toggle-select.service') public toggleSelectService: any
  ) {}

  @ContentChild('toggleSelectBut') private toggleSelectBut: any;
  @ContentChild('toggleSelect') private toggleSelect: any;
  @ContentChild('toggleClose') private toggleClose: any;
  @ContentChild('toggleSelectContent') private toggleSelectContent: any;
  @ContentChild('toggleInput') private toggleInput: any;
  @Input('currClass') public currClass: string;
  @Input('calcHeight') public calcHeight: boolean;
  @Input('minusHeight') public minusHeight: number;
  @Input('isKeyEvent') public isKeyEvent: boolean;
  @Output() public outputHide = new EventEmitter(); //日期选择不合法

  @Input('setIsSelect') public set setIsSelect(data: boolean) {
    this.isSelect = data;
  }

  @Input('isEvent') set isEvent(data: boolean) {
    if(data) {
      this.isEventBool = !data;
    }
  }

  @Input() set isEnter(isBool: boolean) {
    if(isBool) {
      this.getIsEnter = isBool;
    }
  }

  @Output() public callBackData = new EventEmitter<any>();

  ngOnInit() {
    this.toggleSelectService.outRenderer(this.renderer);
  }

  ngAfterViewInit() {
    if(this.toggleSelect) {
      this.toggleSelectElement = this.toggleSelect.nativeElement;
    }
    if(this.toggleSelectBut) {
      this.toggleSelectButElement = this.toggleSelectBut.nativeElement;
    }
    if(this.calcHeight) {
      this.children = this.toggleSelect.nativeElement.children[0].children[0];
    }else {
      this.children = this.toggleSelectElement;
    }
    if(this.toggleSelectElement) {
      this.renderer.setElementClass(this.toggleSelectElement, 'hide', true);
      this.doToggleSelect();
    }
  }
  /**
   * 显示隐藏 select
   */
  doToggleSelect() {
    let showToggleSelect: boolean;
    if(this.isKeyEvent) {
      this.toggleSelectButElement.addEventListener('keypress', (event: any) => {
        let value: string = this.toggleSelectButElement.value;
        if (event.keyCode === 13 && value !== '' && !this.getIsEnter) {
          this.setElement(false, false);
          this.recordElement(showToggleSelect);

          //判断是否使用点击 列表 select 不隐藏
          if (this.toggleSelectContent) {
            this.doToggleSelectContent();
          }
        }
      })
    }else {
      if (!this.isSelect) return false;
      //显示隐藏 select
      if(this.toggleSelectButElement) {
        this.toggleSelectButElement.onclick = (event: any) => {
          event.stopPropagation();
          if(this.toggleInput && this.getClassNameElement(this.toggleInput.nativeElement)) {
            return false;
          }
          if(this.toggleSelectButElement && this.getClassNameElement(this.toggleSelectButElement)) {
            return false;
          }
          // if(this.toggleInput) {
          //   let isEvent: any = this.toggleInput.nativeElement.className;
          //   if (isEvent && /g-readonly-input/.test(isEvent)) {
          //     return false;
          //   }
          // }
          //
          // if(this.toggleSelectButElement && this.toggleSelectButElement.children[0]) {
          //   let isEvent: any = this.toggleSelectButElement.children[0].children[0];
          //   if (isEvent && /g-readonly-input/.test(isEvent.className)) {
          //     return false;
          //   }
          // }
          // if(this.toggleSelectButElement && this.toggleSelectButElement.children[1]) {
          //   let element: any = this.toggleSelectButElement.children[1];
          //   let isEvent: any = element.children[0] ? element.children[0] : element;
          //   if (isEvent && /g-readonly-input/.test(isEvent.className)) {
          //     return false;
          //   }
          // }
          showToggleSelect = !this.element.hasClass(this.toggleSelectElement, 'hide');
          if (this.callBackData) {
            this.callBackData.emit({
              toggleInput: this.toggleInput ? this.toggleInput.nativeElement : '',
              toggleSelectButElement: this.toggleSelectButElement,
              toggleSelectElement: this.toggleSelectElement
            });
          }
          this.setElement(showToggleSelect, !showToggleSelect);
          this.recordElement(showToggleSelect);

          //判断是否使用点击 列表 select 不隐藏
          if (this.toggleSelectContent) {
            this.doToggleSelectContent();
          }
          this.setElementPosition();
        };
      }
    }

    //点击 select 阻止事件冒泡
    this.toggleSelectElement.onclick = (event: any) => {
      event.stopPropagation();
    };

    //关闭按钮
    if (this.toggleClose) {
      this.toggleClose.nativeElement.onclick = (event: any) => {
        event.stopPropagation();
        this.setElement(true, false);
      }
    }
  }

  /**
   * 判断 元素上是否有 g-readonly-input 类
   * @param el
   */
  private getClassNameElement(el: any): boolean {
    let className = el.className;
    let isInput: boolean;
    if(new RegExp(this.inputClassName).test(className)) {
      isInput = true;
    }else {
      let children: any = el.children;
      for(let key in children) {
        if(children[key].nodeType === 1) {
          className = children[key].className;
          if(new RegExp(this.inputClassName).test(className)) {
            isInput = true;
            break;
          }
          this.getClassNameElement(children[key]);
        }
      }
    }

    return isInput;
  }

  /**
   * 回车记录当前元素
   * @param isBool
   */
  recordElement(isBool: boolean) {
    let getElement: any = this.toggleSelectService.backElement();
    if(isBool) {
      this.toggleSelectService.emptyElement();
    }else {
      //隐藏上一次点开的元素
      if (this.typeService.getDataLength(getElement.clickElement) !== 0 &&
        this.typeService.getDataLength(getElement.selectElement) !== 0) {
        this.renderer.setElementClass(getElement.selectElement, 'hide', true);
        if(getElement.currClass !== '') {
          this.renderer.setElementClass(getElement.clickElement.parentElement, getElement.currClass, false);
        }
      }
      //记录当前元素
      this.toggleSelectService.getElement(this.toggleSelectButElement, this.toggleSelectElement, this.currClass);
    }
  }

  /**
   * 设置元素位置
   */
  setElementPosition() {
    let winHeight: any = <any>window.innerHeight;
    let elementPosition: any = this.toggleSelectButElement ? this.toggleSelectButElement.getBoundingClientRect() : {};
    let elTop: number = elementPosition.top;
    let elBottom: number = elementPosition.bottom;
    let elHeight: number = elementPosition.height;
    let minusHeight: number = this.minusHeight ? this.minusHeight : 0;
    if(this.calcHeight) {
      this.selectHeight = this.children.clientHeight;
    }else {
      this.selectHeight = this.toggleSelectElement.clientHeight;
    }
    if(this.selectHeight > (winHeight - elTop - 10 - elHeight - minusHeight)) {
      this.renderer.setElementStyle(this.children, 'top', 'auto');
      if(this.selectHeight > elTop) {
        let bottom: number = this.selectHeight - elTop;
        this.renderer.setElementStyle(this.children, 'bottom', 'calc(100% - ' + (bottom + 5) + 'px)');
      }else {
        this.renderer.setElementStyle(this.children, 'bottom', '100%');
        this.renderer.setElementStyle(this.children, 'margin-bottom', '10px');
      }
    }else {
      this.renderer.setElementStyle(this.children, 'top', '');
      this.renderer.setElementStyle(this.children, 'bottom', '');
      this.renderer.setElementStyle(this.children, 'margin-bottom', '');
    }
  }

  /**
   * 选择内容
   */
  doToggleSelectContent(): any {
    let childrenEl: any = this.toggleSelectContent.nativeElement.children;
    let len: number = childrenEl.length;
    for (let i = 0; i < len; i++) {
      this.toggleSelectContent.nativeElement.children[i].addEventListener('click', () => {
        if (this.element.hasClass(this.toggleSelectContent.nativeElement.children[i], 'no-hide')) {
          return false;
        } else if (!this.element.hasClass(this.toggleSelectContent.nativeElement.children[i], 'd-opacity')) {
          this.setElement(true, false);
          this.toggleSelectService.emptyElement();
        }
      })
    }
  }

  /**
   * 设置元素
   * @param selectElement true 添加 'hide' class false 去除 'hide' class
   * @param parentElement
   */
  setElement(selectElement: boolean, parentElement?: boolean) {
    if(this.toggleSelectElement) {
      this.renderer.setElementClass(this.toggleSelectElement, 'hide', selectElement);
    }
    if (this.currClass) {
      this.renderer.setElementClass(this.toggleSelectButElement.parentElement, this.currClass, parentElement);
    }
    if(selectElement){
      this.outputHide.emit(true);
    }
  }
}
