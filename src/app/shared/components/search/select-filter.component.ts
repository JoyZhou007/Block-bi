/**
 * 2017.09.12
 * 过滤下拉菜单
 */

import {
  Component, ViewEncapsulation, Input, ViewChild,
  ElementRef, Output, EventEmitter, Renderer, AfterViewInit, Inject
} from '@angular/core';

export interface SelectOptions {
  isDefaultSelect?: true,   //true 为默认下拉菜单 || false 自定义下拉菜单
  defaultValue: string,     //默认选中值
  type: string,             //type类型
  data: Array<any>,         //展示数据
  id?:number,
}

@Component({
  selector: 'select-filter',
  template: `
      <div class="se-input" toggleSelectGroup [isEnter]="true" [currClass]="'se-input-selected'" (outputHide)="hideSelect($event)">
          <div #toggleSelectBut>
              <div class="se-input-select">
                  <span class="font-selectbutton-soildclose"></span>
              </div>
              <input class="g-input-box-shadow" [class.company-industry]="getSelectData && getSelectData.type=='company'" 
              [class.input-no-border]="getSelectData && getSelectData.type=='company'" type="text" name="defaultValue" autocomplete="off" 
              #selectInputElement (keyup)="onKeyUp($event)" (focus)="onFocus($event)" (blur)="onBlur($event)">
          </div>
          <div class="d-select" #toggleSelect style="overflow: hidden">
              <div class="g-height140 g-country-scroll" #scrollEle>
                  <ul class="g-max-height-inherit" #toggleSelectContent>
                      <li *ngFor = "let key of getData;let i=index" (click) = "selectCurrentValue($event, i)"
                      [class.g-background-current] = "i === currentIndex">
                          <span class="base">{{key}}</span>
                      </li>
                  </ul>
              </div>
          </div>
      </div>
  `,
  encapsulation: ViewEncapsulation.None
})

export class SelectFilterComponent implements AfterViewInit {

  private getSelectData: SelectOptions;
  private defaultValue: string;
  private getData: any;
  private currentIndex: number = 0;
  @ViewChild('selectInputElement') private selectInputElement: ElementRef;
  @ViewChild('toggleSelect') private toggleSelect: ElementRef;
  @ViewChild('scrollEle') private scrollEle: ElementRef;
  @Output() public outPutCurrentValue = new EventEmitter<any>();
  @Output() public blurEmpty = new EventEmitter<any>();
  private staticValue: any;
  private dataId: number = -1;

  constructor(@Inject('type.service') public typeService: any,
              private renderer: Renderer) {
  }

  @Input() set selectOption(data: any) {
    if (data) {
      this.getSelectData = data;
      this.staticValue = this.typeService.clone(this.getSelectData);
      this.getData = this.getSelectData.data;
      this.defaultValue = this.getSelectData.defaultValue;
      this.selectInputElement.nativeElement.value = this.defaultValue;
      if(this.getSelectData.hasOwnProperty('id')){
        this.dataId = this.getSelectData.id;
      }
    }
  }

  ngAfterViewInit() {
    this.selectInputElement.nativeElement.addEventListener('keydown', () => {
      this.renderer.setElementClass(this.toggleSelect.nativeElement, 'hide', false);
    })
  }

  /**
   * 选择当前值
   * @param event
   * @param i
   */
  selectCurrentValue(event: any, i: number) {
    this.selectInputElement.nativeElement.value = this.getData[i];
    this.outPutCurrentValue.emit({index: i, type: this.getSelectData.type,id:this.dataId});
  }


  /**
   * 索引列表
   * @param data
   * @param str
   * @param nameType 搜索匹配名
   * @param start true 是否从起始位值开始
   */
  regExpList(data: any, str: string, start?: boolean): any {
    str = str.replace(/\\/g, '\\');
    str = str.replace(/\[/g, '\\[');
    str = str.replace(/]/g, '\\]');
    str = str.replace(/\./g, '\.');
    let reg: any = start ? new RegExp('^' + str, 'i') : new RegExp(str, 'i');
    if (start && str === '#') {
      reg = /^[0-9|\u4E00-\u9FA5\uF900-\uFA2D]/;
    }
    let result: any[] = [];
    for (let list in data) {
      let value: string = data[list];
      if (reg.test(value)) {
        result.push(data[list]);
      }
    }
    return result;
  }

  /**
   * input 获得焦点事件
   * @param event
   */
  onFocus(event: any) {
    if (event) {
      event.stopPropagation();
    }
    this.getData = this.staticValue.data;
  }

  /**
   * 失去焦点
   * @param event
   */
  onBlur(event: any){
      if(event.target.value == ''){
        this.blurEmpty.emit(true);
      }else{
        this.blurEmpty.emit(false);
      }
  }
  /**
   * input键盘释放事件
   * @param event
   */
  onKeyUp(event: any) {
    if (event) {
      event.stopPropagation();
    }
    if (event.keyCode != 40 && event.keyCode != 38) {
      if (this.getSelectData) {
        let result: Array<any> = this.regExpList(this.staticValue.data, event.target.value, true);
        this.getData = result;
      }
    }
    //回车且只有一个符合，选中该值，隐藏下拉菜单
    if (event.keyCode == 13 && this.getData.length == 1) {
      this.selectInputElement.nativeElement.value = this.getData[0];
      this.outPutCurrentValue.emit({index: 0, type: this.getSelectData.type,id:this.dataId});
      this.renderer.setElementClass(this.toggleSelect.nativeElement, 'hide', true);
    } else {
      //点击向下箭头
      if (event.keyCode == 40) {
        this.dealDown();
      }
      //点击向上箭头
      if (event.keyCode == 38) {
        this.dealUp();
      }
      //点击回车，选中该值
      if (event.keyCode == 13) {
        if (this.currentIndex >= 0 && this.currentIndex <= this.getData.length - 1) {
          this.selectInputElement.nativeElement.value = this.getData[this.currentIndex];
          if(this.staticValue.data){
            for (let i = 0; i < this.staticValue.data.length; i++) {
                  if(this.staticValue.data[i] == this.getData[this.currentIndex]){
                    this.outPutCurrentValue.emit({index: i, type: this.getSelectData.type,id:this.dataId});
                    this.renderer.setElementClass(this.toggleSelect.nativeElement, 'hide', true);
                  }
                }
          }
        }
      }
    }


  }

  /**
   * 键盘向上
   */
  dealUp() {
    this.currentIndex--;
    if (this.currentIndex > 4) {
      this.scrollEle.nativeElement.scrollTop -= 23;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = this.getData.length - 1;
      this.scrollEle.nativeElement.scrollTop = (this.currentIndex - 5) * 23;
    }
  }

  /**
   * 键盘向下
   */
  dealDown() {
    this.currentIndex++;
    if (this.currentIndex == this.getData.length) {
      this.currentIndex = 0;
      this.scrollEle.nativeElement.scrollTop = 0;
    }
    if (this.currentIndex > 5) {
      this.scrollEle.nativeElement.scrollTop += 23;
    }
  }

  /**
   * 隐藏select时
   * @param event
   */
  hideSelect(event: any) {
    if (event) {
      this.currentIndex = 0;
      this.scrollEle.nativeElement.scrollTop = 0;
    }
  }
}