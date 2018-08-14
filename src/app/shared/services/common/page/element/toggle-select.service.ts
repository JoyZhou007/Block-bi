import {Injectable, Renderer} from '@angular/core';

@Injectable()
export class ToggleSelectService{

  private clickElement: any = '';
  private selectElement: any = '';
  private currClass: string;
  public i: number = 1;
  public getRenderer: Renderer;
  private callback: any;

  constructor() {}

  outRenderer(renderer) {
    if(renderer && !this.getRenderer) {
      this.getRenderer = renderer;
    }
  }

  /**
   * 记录当前点击的元素
   * @param clickElement
   * @param element
   * @param currClass
   */
  getElement(clickElement: any, element: any, currClass: string) {
    this.clickElement =  clickElement;
    this.selectElement = element;
    this.currClass = currClass;
    if(this.callback) {
      this.callback();
    }
  }

  /**
   * 清空元素
   */
  emptyElement() {
    this.clickElement = '';
    this.selectElement = '';
    this.currClass = '';
  }

  /**
   *
   * @returns {{clickElement: any, selectElement: any, currClass: string}}
   */
  backElement(): {
    clickElement: any,
    selectElement: any,
    currClass: string
  }  {
    return {
      clickElement: this.clickElement,
      selectElement: this.selectElement,
      currClass: this.currClass
    };
  }

  /**
   * 获取日历标签
   * @param callback
   */
  setCalendarElement(callback?: any) {
    if(callback) {
      this.callback = callback;
    }
  }

  /**
   * 关闭下拉菜单
   * @param callBack
   */
  closeElement(callBack?: any) {
    if(this.selectElement) {
      this.getRenderer.setElementClass(this.selectElement, 'hide', true);
    }
    if(this.currClass) {
      this.getRenderer.setElementClass(this.clickElement.parentElement, this.currClass, false);
    }
    this.emptyElement();
  }

}