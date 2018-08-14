import { Injectable } from "@angular/core";


@Injectable()
export class AnimationService {

  private transitionEndEvent: any;
  private animationEndEvent: any;

  private el: any;

  constructor() {
    this.el = document.createElement('fakeElement');
    this.whichTransitionEvent();
    this.whichAnimationEvent();
  }

  /**
   * 绑定事件
   * @param ele
   * @param transitionEndCallback
   * @param animationEndEventCallback
   */
  bindEvent(ele: any, transitionEndCallback: any, animationEndEventCallback: any) {
    ele.removeEventListener(this.transitionEndEvent);//销毁事件
    ele.removeEventListener(this.animationEndEvent);//销毁事件
    if (ele && transitionEndCallback) {
      ele.addEventListener(this.transitionEndEvent, transitionEndCallback);
    }
    if (ele && animationEndEventCallback) {
      ele.addEventListener(this.animationEndEvent, animationEndEventCallback);
    }
  }

  /**
   * 设置元素动画
   * @param nativeElement
   * @param cssClass
   * @param transitionEndCallback
   * @param animationEndEventCallback
   * @param removeClass
   */
  cssAnimate(nativeElement: any, cssClass: string, transitionEndCallback?: any, animationEndEventCallback?: any, removeClass?: string) {
    let addClass: boolean = true;
    this.bindEvent(nativeElement, transitionEndCallback, animationEndEventCallback);
    if (removeClass && removeClass !== '') {
      if (nativeElement.className.indexOf(removeClass) !== -1) {
        nativeElement.className = nativeElement.className.replace(removeClass, cssClass);
        addClass = false;
      }
    }
    if (nativeElement.className.indexOf(cssClass) !== -1) {
      addClass = false;
    }
    if (addClass) {
      nativeElement.className = nativeElement.className + ' ' + cssClass;
    }

  }

  /**
   * 检测浏览器css3动画事件
   * @returns {any}
   */
  whichTransitionEvent() {

    let transitions: any = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'//webkitAnimationEnd
    };

    for (let t in transitions) {
      if (typeof this.el.style[t] !== 'undefined') {
        this.transitionEndEvent = transitions[t];
      }
    }
  }

  /**
   *
   */
  whichAnimationEvent() {
    let transitions: any = {
      'animation': 'animationend',
      'MozAnimation': 'animationend',
      'WebkitAnimation': 'webkitAnimationEnd'//webkitAnimationEnd
    };

    for (let t in transitions) {

      if (typeof this.el.style[t] !== 'undefined') {
        this.animationEndEvent = transitions[t];
      }
    }
  }

}


