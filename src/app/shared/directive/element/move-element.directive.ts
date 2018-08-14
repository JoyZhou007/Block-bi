import {Directive, ContentChild, OnInit, Renderer, Input} from '@angular/core';

@Directive({
  selector:'[moveGroup]'
})

/**
 *
 * #moveElement 移动的元素
 * #moveRightBut 右边按钮
 * #moveLeftBut 左边按钮
 * dataDiff 移动的距离 不传默认为 200
 * dataSteps 每次移动多少像素 不传默认为 5
 *
 */

export class MoveElementDirective implements OnInit {

  //左边按钮
  @ContentChild('moveLeftBut') public moveLeftBut: any;

  //左边按钮
  @ContentChild('moveRightBut') public moveRightBut: any;

  //移动元素
  @ContentChild('moveElement') public moveElement: any;

  //移动距离
  public _dataDiff: number = 200;

  //移动步数
  public _dataSteps: number = 5;

  private intervalObj : any;

  private flag: boolean = true;
  private scrollLeft: number;

  @Input() set dataDiff(value: number) {
    this._dataDiff = value ? value : this._dataDiff;
  }

  @Input() set dataSteps(value: number) {
    this._dataSteps = value ? value : this._dataSteps;
  }

  constructor(
    private renderer: Renderer
  ) {}

  ngOnInit() {
    //向左移动
    this.moveLeftBut.nativeElement.onclick = () => {
      if(this.flag) {
        this.moveAnimate('left');
      }
      this.flag= false;
    };

    //向右移动
    this.moveRightBut.nativeElement.onclick = () => {
      if(this.flag) {
        this.moveAnimate('right');
      }
      this.flag = false;
    }

  }

  /**
   * 执行移动
   */
  moveAnimate(param: string) {
    let scrollLeft: number = this.moveElement.nativeElement.scrollLeft;
    let diff: number = this._dataDiff;
    let steps: number = this._dataSteps;
    let scrollPos: number;
    if(param === 'left') {
      this.scrollLeft = this.moveElement.nativeElement.scrollLeft + diff;
    }else if(param === 'right') {
      this.scrollLeft = this.moveElement.nativeElement.scrollLeft - diff;
    }
    this.intervalObj = setInterval(() => {
      let currentScrollLeft: number = this.moveElement.nativeElement.scrollLeft;
      if(param === 'left') {
        if((currentScrollLeft >= scrollLeft + diff) || (scrollPos === currentScrollLeft)) {
          this.flag = true;
          clearInterval(this.intervalObj);
        } else {
          this.moveElement.nativeElement.scrollLeft += steps;
          scrollPos = currentScrollLeft;
        }
      }else if(param === 'right') {
        if((currentScrollLeft <= scrollLeft - diff) || (currentScrollLeft === 0)) {
          this.flag = true;
          clearInterval(this.intervalObj);
        } else {
          this.moveElement.nativeElement.scrollLeft -= steps;
        }
      }
      if(this.moveElement.nativeElement.scrollLeft === this.scrollLeft) {
        this.flag = true;
      }
    }, 5);
  }
}
