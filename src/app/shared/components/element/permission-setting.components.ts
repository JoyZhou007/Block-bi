import {
  Component, Input, ViewChild, OnInit, Inject,
  AfterViewInit, Renderer, EventEmitter, ElementRef, Output, OnDestroy, AfterViewChecked
} from '@angular/core';

@Component({
  selector: 'permission-setting',
  template: `
      <div>
          <div class="g-drag" [class.g-drag-type]="gDragType" #dragWarp>
              <i #dragBg></i>
              <em class="f9-f" #dragBut>{{showData[index]}}</em>
              <span *ngFor="let d of showData; let i = index"
                    [ngStyle]="{
        'left': i === 0 ? 10 + 'px' : i === showData.length - 1 ? 'auto' : (partialWidth * i) / dragWarpWidth * 100 + '%', 'right': i === showData.length - 1 ? '10px' : 'auto'}">{{d}}</span>
          </div>
      </div>`
})

export class PermissionSettingComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {

  private dragWarpWidth: number;
  private getData: any;
  private showData: Array<any> = [];
  private index: number;
  private currIndex: number;
  private gDragType: boolean = false;
  private permissionWidth: number = 10;
  private partialWidth: number;
  private partialWidthSmall: number;
  private bgColorArr: string[];
  private currWidth: number = 0;
  private childWidthArr: any[] = [];
  private childWidth: number = 0;
  private lastElWidth: number;
  public hasInit: boolean = false;
  private currentIndex: number = 0;
  private isEvent: boolean = false;

  @ViewChild('dragWarp') private dragWarp: any;
  @ViewChild('dragBut') private dragBut: any;
  @ViewChild('dragBg') private dragBg: any;

  @Input() set setData(data: any) {
    if(!data) return;
    if (data) {
      this.hasInit = false;
      this.getData = this.typeService.clone(data);
      //展示数据
      this.setDataShow();
    }
  }

  @Output() public outToggleBtnEvent = new EventEmitter<any>();
  @Output() public outToggleBtnUpEvent = new EventEmitter<any>();

  constructor(private renderer: Renderer,
              private elementRef: ElementRef,
              @Inject('type.service') public typeService: any,
              @Inject('page.element') public element: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('page-animation.service') public animationService: any) {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.showData = [];
  }

  ngAfterViewInit() {
    //this.initSettings();
  }

  initSettings() {

    //获取最后一个 span 宽度
    let el: any = this.dragWarp.nativeElement;
    this.permissionWidth += this.element.getElementVal(this.dragWarp.nativeElement.lastElementChild, 'width');

    this.calChildWidth();

    this.calcWidth();

    //获取鼠标位置
    this.getMousePos(el);

    //拖动按钮
    this.dragSetButPosition();

    //设置背景色
    this.setBgColor();

    this.setElePositionFn(this.currIndex);
  }

  setBgColor() {
    //背景颜色设置
    if (this.getData.bgColor) {
      //bgColor为字符串直接设为背景颜色
      if (typeof this.getData.bgColor === 'string') {
        this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', this.getData.bgColor);
        //bgColor是数组情况说明不同阶段要变化颜色 数组长度要与分阶长度一样
      } else if (Object.prototype.toString.call(this.getData.bgColor) === '[object Array]') {
        this.bgColorArr = this.getData.bgColor;
        this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', this.bgColorArr[this.index]);
        //bgColor为空设默认颜色
      } else {
        this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', '#7BE0AD');
      }
      //bgColor 不传设默认颜色
    } else {
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', '#7BE0AD');
    }
  }

  ngAfterViewChecked() {
    if (!this.hasInit && ((this.dragWarp.nativeElement.offsetWidth !== 0) && this.dragBut && this.dragBg) && this.getData) {
      this.initSettings();
      this.hasInit = true;
    }
  }

  /**
   * 计算非均分宽度
   */
  calChildWidth() {
    let childArr: any[] = this.element.getElementChildTag(this.dragWarp.nativeElement, 'span');
    for (let key = 0; key < childArr.length; key++) {
      if (key > 0 && key < childArr.length - 1) {
        this.childWidth += childArr[key].offsetWidth;
      }
      this.childWidthArr.push(childArr[key].offsetWidth);
    }
  }

  /**
   * 计算宽度
   */
  calcWidth() {
    this.lastElWidth = this.childWidthArr[this.childWidthArr.length - 1];
    this.dragWarpWidth = this.element.getElementVal(this.dragWarp.nativeElement, 'width');
    this.partialWidth = (this.dragWarpWidth - this.lastElWidth - 10) / (this.showData.length - 1);
    this.partialWidthSmall = this.partialWidth / 2;
  }

  /**
   * 拖动按钮
   */
  dragSetButPosition() {
    let butLeft: number;
    let currentLeft: number;
    this.dragBut.nativeElement.addEventListener('mousedown', (event: any) => {
      if(event.button === 2) return false;
      event.stopPropagation();
      event.preventDefault();
      this.calcWidth();
      let butWidth: number = this.element.getElementVal(this.dragBut.nativeElement, 'width');
      butLeft = event.clientX - this.element.getElementVal(this.dragBut.nativeElement, 'left');
      this.isEvent = false;
      document.onmousemove = (e: any) => {
        let w: number;
        let l: number;
        w = l = e.clientX - butLeft;
        currentLeft = this.element.getElementVal(this.dragBut.nativeElement, 'left');
        if(l < 0) {
          l = w = 0;
        }else if(l > (this.dragWarpWidth - butWidth)) {
          w = l = this.dragWarpWidth - butWidth;
        }
        w = w + butWidth * 0.5;
        this.setElPosition(currentLeft, false);
        this.setButElement(w, l);
      };
      document.onmouseup = () => {
        if(event.button === 2) return false;
        event.stopPropagation();
        event.preventDefault();
        this.isEvent = true;
        this.setElPosition(currentLeft, false);
        document.onmousemove = null;
        document.onmouseup = null;
        this.outToggleBtnUpEvent.emit(this.getData);
      }
    })
  }

  /**
   * 设置属性值
   * @param w
   * @param l
   */
  setButElement(w: number, l: number) {
    this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', w + 'px');
    this.renderer.setElementStyle(this.dragBut.nativeElement, 'left', l + 'px');
  }

  /**
   * 判断选中区段元素位置
   * @param objX
   * @param isFlag
   * @param type c => 点击获取位置
   */
  setElPosition(objX: number, isFlag?: boolean, type?: string) {
    for (let i = 1; i <= this.showData.length; i++) {
      let prevWidth: number = this.partialWidthSmall * (i + (i - 1) - 2);
      let nextWidth: number = this.partialWidthSmall * (i + (i - 1));
      if (objX > prevWidth && objX < nextWidth) {
        if (isFlag) {
          this.dragBut.nativeElement.innerHTML = this.showData[i - 1];
          if (Object.prototype.toString.call(this.getData.bgColor) === '[object Array]') {
            this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', this.bgColorArr[i - 1]);
          }
        } else {
          if (type === 'c') {
            let w: number = this.partialWidth * (i - 1) / this.dragWarpWidth * 100;
            if (this.currWidth !== w) {
              this.setElePositionFn(i);
            }
          } else {
            this.setElePositionFn(i);
          }
        }
        this.currentIndex = i;
        this.animatedEnd();
        break;
      }
    }
  }

  /**
   * 设置元素位置
   * @param i
   */
  setElePositionFn(i: number) {
    let butWidth: number = this.element.getElementVal(this.dragBut.nativeElement, 'width');
    let w: number;
    let l: number;
    w = l = this.partialWidth * (i - 1);
    if(i === this.showData.length) {
      w = this.dragWarpWidth - butWidth;
    }
    if(i !== 1 && i < this.showData.length) {
      w = w - butWidth * 0.4;
    }
    this.renderer.setElementStyle(this.dragBg.nativeElement, 'width', l + 'px');
    if (Object.prototype.toString.call(this.getData.bgColor) === '[object Array]') {
      this.renderer.setElementStyle(this.dragBg.nativeElement, 'backgroundColor', this.bgColorArr[i - 1]);
    }
    this.renderer.setElementStyle(this.dragBut.nativeElement, 'left', w + 'px');
    this.dragBut.nativeElement.innerHTML = this.showData[i - 1];
    if (this.gDragType) {
      this.getData.currPerm = i;
    } else {
      this.getData.currPerm = i - 1;
    }
    if(this.isEvent) {
      this.outToggleBtnEvent.emit(this.getData);
    }
    this.currWidth = w;
    this.currIndex = i;
  }

  /**
   * 获取鼠标位置
   * @param el
   */
  getMousePos(el: any) {
    this.dragWarp.nativeElement.onmousedown = (event: any) => {
      this.isEvent = true;
      this.calcWidth();
      let element: any = el.getBoundingClientRect();
      this.renderer.setElementClass(this.dragWarp.nativeElement, 'g-drag-animated', true);
      this.setElPosition(event.clientX - element.left, false, 'c');
      this.outToggleBtnUpEvent.emit(this.getData);
    };
  }

  /**
   * 动画运动完
   */
  animatedEnd() {
    this.animationService.cssAnimate(this.dragWarp.nativeElement, '', () => {
      this.renderer.setElementClass(this.dragWarp.nativeElement, 'g-drag-animated', false);
    });
  }

  /**
   * 设置展现数据
   */
  setDataShow() {
    this.showData = [];
    if (this.getData.data) {
      //data 存在使用data数据
      this.showData = this.getData.data;

    } else {
      //data 不存在设默认数据
      //默认数据 为 1 - 5
      for (let i = 1; i <= 5; i++) {
        this.showData.push(i);
      }
    }

    //是否要添加类
    this.gDragType = !!this.getData.butType;

    //start 为 true 权限从 0 开始
    this.index = this.getData.start ? this.getData.perm - 1 : this.getData.perm;
    this.currIndex = this.getData.perm;
    for (let i in this.showData) {
      if(isNaN(this.showData[i])) {
        this.showData[i] = this.translate.manualTranslate(this.showData[i]);
      }
    }
  }
}
