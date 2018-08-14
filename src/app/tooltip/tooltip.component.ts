
import {
  AfterContentChecked, AfterContentInit, Component, ElementRef, HostListener, Input,
  Renderer
} from "@angular/core";
import {PositionService} from "./position.service";
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/6/22.
 */


import {TooltipOptions} from "./tooltip-options";

@Component({
  selector: "tooltip",
  template: `
      <div class="inner text-center" [innerHtml]="content | translate">
      </div>
      <div class="arrow"></div>`,
  providers: [PositionService],
})
export class TooltipComponent implements AfterContentChecked {
  @HostListener('window:resize', ['$event']) onResize(event: any) {
    this.calculateWidth();
  }

  public content: string;
  public init: boolean = false;
  @Input() public parentEl: ElementRef;
  @Input() public tooltipOptions: TooltipOptions;

  constructor(private positionService: PositionService,
              public renderer: Renderer,
              public elementRef: ElementRef) {
  }

  private position() {
    // Class and style are added directly to the rendered components
    // to avoid issues with change detection (https://github.com/angular/angular/issues/6005)
    this.content = this.tooltipOptions.content;
    this.renderer.setElementClass(
      this.elementRef.nativeElement, this.tooltipOptions.position,
      true
    );
    this.renderer.setElementClass(
      this.elementRef.nativeElement, this.tooltipOptions.popupClass,
      true
    );


    // 为了拿到正确的offsetWidth与offsetHeight
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'visibility', 'hidden');
    setTimeout(() => {this.calculateWidth()}, 500);
    // 画完再计算一次

  }

  calculateWidth(time?: number){
    let position = this.positionService.positionElements(
      this.parentEl ? this.parentEl.nativeElement :  this.elementRef.nativeElement,
      this.elementRef.nativeElement,
      this.tooltipOptions.position,
      this.tooltipOptions.margin
    );
    this.renderer.setElementStyle(this.elementRef.nativeElement.children[0], 'max-width', this.tooltipOptions.maxWidth + "px");
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'top', position.top + "px");
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'left', position.left + "px");
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'visibility', 'visible');
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'position', 'fixed');
    this.renderer.setElementStyle(this.elementRef.nativeElement, 'z-index', '40');
    //对于在浏览器边缘，会有换行的tooltip, 需要重新绘制位置
    if (this.elementRef.nativeElement.offsetWidth !== position.width) {
      this.calculateWidth();
    }

  }

  ngAfterContentChecked(): void {
    if (!this.init) {
      this.position();
      this.init = true;
    }

  }
}