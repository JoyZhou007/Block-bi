import {Directive, ContentChild, OnInit, Renderer} from '@angular/core';

@Directive({
  selector: '[setElementTop]'
})

export class SetElementDirective implements OnInit {

  //获取要设置的元素
  @ContentChild('setMouseElement') public setMouseElement: any;

  //获取鼠标经过的元素
  @ContentChild('mouseElement') public mouseElement: any;

  public rangHeight: number = 0;

  constructor(
    public renderer: Renderer
  ) {}

  ngOnInit() {

    //鼠标经过元素
    this.hoverElement();

  }

  /**
   * 设置元素
   */
  hoverElement() {
    let height: string;
    let elementHeight: number;
    this.mouseElement.nativeElement.onmouseenter = (event: any) => {
      if(this.mouseElement.nativeElement.getAttribute('data-height')) {
        height = this.mouseElement.nativeElement.getAttribute('data-height');
        //设置需要减去的高度
        this.rangHeight = this.doRangHeight(height);
      }
      elementHeight = this.setMouseElement.nativeElement.offsetHeight;
      if((window.innerHeight - event.clientY - this.rangHeight) < elementHeight + 10) {
        let top: string = this.setMouseElement.nativeElement.getAttribute('data-top') ?
          this.setMouseElement.nativeElement.getAttribute('data-top') : 0;
        this.renderer.setElementStyle(
          this.setMouseElement.nativeElement,
          'top',
          -(elementHeight + parseInt(top)) + 'px'
        );
      }
    };
    this.mouseElement.nativeElement.onmouseleave = () => {
      this.setMouseElement.nativeElement.removeAttribute('style');
    }
  }

  /**
   * 获取需要减去的高度
   * @param height
   */
  doRangHeight(height: string): number {
    let h: number = 0;
    if(typeof height === 'string') {
      let arr:any;
      arr = height.split(',');
      for (let key in arr) {
        h += parseInt(arr[key]);
      }
    }
    return h;
  }

}