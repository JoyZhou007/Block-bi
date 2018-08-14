import {Inject,Directive, ContentChild, OnInit, ElementRef, Input} from '@angular/core';

@Directive({
    selector:'[linkedOperation]'
})

export class LinkedOperationDirective implements OnInit {

    @ContentChild('mainElement') public mainElement: any;
    @ContentChild('linkedElement') public linkedElement: any;

    //主元素触发事件名称
    public linkedEvent : any = "click";

    /**
     * 关联元素出发反应的方案
     * {
     *  style : {
     *      width : 100px;
     *      ....
     *  }, //样式更改
     *  class : ''/{}, //样式class更改 直接字符串(添加的样式), 对象{add:'添加的样式', remove: '移除的样式'}
     *  toggleClass : [交替样式1,交替样式2],
     *  event : callBack(linkedElement)   //关联触发的事件
     *  setEvent : {
     *      {事件名(click) : callBack(linkedElement) }
     *  }
     * }
     *
     */
    public linkedProgram : any;

    /**
     * 设置关联信息
     * @param option
     * {
     *  linkedEvent : '',绑定一个事件
     *  linkedProgram : {} 可选,事件关键选项
     *  {}  *当以上两个选项不存在,option又是对象,默认为linkedProgram选项
     * }
     */
    @Input() set setOption(option : any) {
        if(!option.linkedEvent && !option.linkedProgram && typeof option === 'object') {
            this.linkedProgram = option;
        } else {
            if(option.linkedEvent) {
                this.linkedEvent = option.linkedEvent;
            }
            if(option.linkedProgram) {
                this.linkedProgram = option.linkedProgram;
            }
        }

        this.initLink();
    }

    constructor(
      public elementRef : ElementRef,
      @Inject('page.element') public element:any
    ) {
    }

    ngOnInit() {
    }

    //初始化link事件
    initLink() {
        if(this.linkedElement) {
            this.mainElement = this.mainElement ? this.mainElement : this.elementRef;
            this.mainElement.nativeElement
              .addEventListener(this.linkedEvent, () => {
                this.initLinkProgram();
              });
        }
    }

    //执行关联
    initLinkProgram() {
        if(this.linkedProgram) {
            for(let option in this.linkedProgram) {
                switch (option) {
                    case 'style':
                        this.setLinkedElementStyle(this.linkedProgram[option]);
                        break;
                    case 'class':
                        this.setLinkedElementClass(this.linkedProgram[option]);
                        break;
                    case 'toggleClass':
                        this.setLinkedElementToggleClass(this.linkedProgram[option]);
                        break;
                    case 'event':
                        this.excLinkedElementEvent(this.linkedProgram[option]);
                        break;
                    case 'setEvent':
                        this.setLinkedElementEvent(this.linkedProgram[option]);
                        break;
                    default:
                        break;
                }
            }

        }
    }

    /**
     * 设置linkedElement样式
     */
    setLinkedElementStyle(styleOption : any) {
        if(styleOption) {
            for(let styleName in styleOption) {
                this.linkedElement.nativeElement.style[styleName]
                  = styleOption[styleName];
            }
        }
    }

    /**
     * 设置linkedElement class 属性
     */
    setLinkedElementClass(classOption : any) {
        if(classOption) {
            let addClass : string = '';
            let removeClass : string = '';
            if(typeof classOption === 'string') {
                addClass = classOption;
            } else if(typeof classOption === 'object') {
                for (let classKey in classOption) {
                    if(classKey === 'add') {
                        addClass = classOption[classKey];
                    } else if(classKey === 'remove') {
                        removeClass = classOption[classKey];
                    }
                }
            }

            this.element.setClass(this.linkedElement.nativeElement, addClass, removeClass);
        }
    }

    /**
     * 设置交替样式
     */
    setLinkedElementToggleClass(classOption : Array<any>) {
        if(this.element.hasClass(this.linkedElement.nativeElement, classOption[0])) {
            this.element.setClass(this.linkedElement.nativeElement, classOption[1], classOption[0]);
        } else {
            this.element.setClass(this.linkedElement.nativeElement, classOption[0], classOption[1]);
        }

    }

    /**
     * 执行带linkedElement 参数的回调事件
     */
    excLinkedElementEvent(callBack : any) {
        if (typeof callBack === 'function') {
            callBack(this.linkedElement);
        }
    }

    /**
     * 设置linkedElement 事件
     */
    setLinkedElementEvent(eventOption : any) {
        if(typeof eventOption === 'object') {
            for(let eventName in eventOption) {
                if (typeof eventOption[eventName] === 'function') {
                    this.linkedElement.nativeElement
                      .addEventListener(eventName, () => {
                          eventOption[eventName](this.linkedElement);
                      });
                }
            }
        }
    }

}
