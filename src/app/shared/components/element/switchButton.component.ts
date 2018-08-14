import {Component, Input, EventEmitter, Output, Renderer, ViewChild, Inject} from '@angular/core';

@Component({
  selector: 'switch-button',
  template: '<div class="g-drag1" ' +
  '[class.g-set-but-left-style]="getObj.perm == 0" ' +
  '[class.g-set-but-right-style]="getObj.perm == 1"' +
  '#switchClass (click)="switchButSelEvent(switchClass)"> ' +
  '<em class="f4-f" *ngIf="setHtml">{{setHtml}}</em>' +
  '<span></span>' +
  '</div>'
})

/**
 * switchClass 要设置样式的标签
 * defaultWordEl 默认文字
 * acrossWordEl 划过后显示的文字
 * switchButEvent （预留的返回方法 可以不设置此返回方法）
 *
 * 使用方法：
 *
 * {
 *   perm: 1,                          【必填】
 *   defaultWord: '默认文字',          【可选参数】
 *   acrossWord: '划过后的文字',       【可选参数】
 *   bgColorClass: '改变默认背景颜色'  【可选参数】
 * }
 *
 */

export class SwitchButtonComponent {

  public isDefaultWord: boolean = false;
  public setHtml: string;
  public isCurrClass: boolean = true;
  public perm: number;
  public getObj: any = {};

  constructor(public renderer: Renderer,
              @Inject('bi-translate.service') public translate: any,
              @Inject('type.service') public typeService: any) {
  }

  @ViewChild('switchClass') public switchClass: any;
  @Output() public switchButEvent: EventEmitter<any> = new EventEmitter();

  /**
   * 初始化当前默认状态
   * @param initState
   */
  @Input() set initVal(initState: any) {
    if (initState) {
      this.getObj = this.typeService.clone(initState);

      // 默认状态文字
      let setHtml: any = this.getObj.perm == 0 ? this.getObj.defaultWord : this.getObj.acrossWord;
      if (setHtml) {
        this.setHtml = this.translate.manualTranslate(setHtml);
      }
      // 设置颜色
      if (this.getObj.perm == 1) {
        this.renderer.setElementClass(this.switchClass.nativeElement, this.getObj.bgColorClass, true);
      }
    }
  }

  /**
   * 动画检测
   */
  animateEnd(): boolean {
    let el: any = document.createElement('fakeelement');
    let transitions: any = {
      animation: 'animationend',
      webkitAnimation: 'webkitAnimationEnd',
      MSAnimation: 'MSAnimationEnd'
    };
    let res: boolean;
    for (let end in transitions) {
      if (el.style[end] !== 'undefined') {
        res = transitions[end];
        break;
      }
    }
    return res;
  }

  /**
   * 设置类名
   * @param element
   * @param isCurrNum
   */
  setClass(element: any, isCurrNum: number) {
    let _this = this;
    let className: string = '';
    let defaultClassName: string = '';
    let deleteClassName: string = '';
    let isNum: number = 1;
    let animate: any = this.animateEnd();
    let isBg: boolean;
    if (isCurrNum == 1) {
      className = 'g-set-but-drag';
      defaultClassName = 'g-set-but-right-style';
      deleteClassName = 'g-set-but-left-style';
      isBg = true;
    } else {
      className = 'g-remove-but-style';
      defaultClassName = 'g-set-but-left-style';
      deleteClassName = 'g-set-but-right-style';
      isBg = false;
    }
    _this.renderer.setElementClass(element, this.getObj.bgColorClass, isBg);

    this.renderer.setElementClass(element, className, this.isCurrClass);
    element.addEventListener(animate, function () {
      if (isNum == 1) {
        isNum = 2;
        //设置样式
        _this.renderer.setElementClass(element, className, false);
        _this.renderer.setElementClass(element, defaultClassName, true);
        _this.renderer.setElementClass(element, deleteClassName, false);
      }
    });
  }

  /**
   * 设置当前标签样式
   * @param element
   */
  switchButSelEvent(element: any) {

    if(this.getObj.hasOwnProperty('isEvent') && this.getObj.isEvent) return false;

    //设置当前选项权限  1 => 有权限  0 => 没有权限
    this.getObj.perm = this.getObj.perm == 1 ? 0 : 1;
    this.setHtml = (this.getObj.perm == 0) ? this.getObj.defaultWord : this.getObj.acrossWord;

    //设置类名
    this.setClass(element, this.getObj.perm);

    //返回值
    this.switchButEvent.emit(this.getObj);
  }

}
