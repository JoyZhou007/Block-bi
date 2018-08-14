/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/6/22.
 */

import {
  ComponentFactoryResolver,
  ComponentRef, ContentChild, Directive, ElementRef, HostListener, Input, OnChanges, OnInit, Renderer, TemplateRef,
  ViewContainerRef, ViewChild
} from "@angular/core";
import {PositionService} from "./position.service";
import {TooltipComponent} from "./tooltip.component";
import {TooltipOptions} from "./tooltip-options";


@Directive({
  selector: "[tooltip]"
})

export class TooltipDirective implements OnInit, OnChanges {

  @HostListener('document:click', ["$event"]) onclick($event: any) {
    if (this.options.dismissable && this.tooltip) {
      this.hideTooltip();
    }
  }

  @Input("tooltip") public tooltipOptions: any;
  @ContentChild("tooltipTemplate") private tooltipTemplate: TemplateRef<Object>;
  @ViewChild('closeHelp') private closeHelp: any;
  private timer: any;
  private tooltip: ComponentRef<TooltipComponent>;
  private tooltipId: string;
  private _: any = window["_"];
  private defaultTooltipOptions: TooltipOptions = {
    position: "top",
    popupClass: "bi-tooltip",
    content: "",
    margin: 8,
    trigger: {
      on: "mouseover",
      off: "mouseout"
    },
    x: 0,
    y: 0,
    dismissable: true,
    active: true,
    viewContainer: '',
    maxWidth: 120,
    isCloseBut: false
  };
  constructor(private viewContainer: ViewContainerRef,
              public elementRef: ElementRef,
              public renderer: Renderer,
              private componentResolver: ComponentFactoryResolver,
              private position: PositionService) {
    this.tooltipId = this._.uniqueId("tooltip");
  }

  ngOnInit() {
    if (!this.options.trigger.off) {
      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.on, (event) => {
        event.stopPropagation();
        if (this.tooltip) {
          this.hideTooltip(event);
        } else if (this.options.active === true) {
          this.showTooltip(event);
        }
      });
    } else {
      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.on, (event) => {
        event.stopPropagation();
        if (!this.tooltip && this.options.active === true) {
          this.showTooltip(event);
        }
      });

      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.off, (event) => {
        event.stopPropagation();
        if (this.tooltip) {
          this.hideTooltip(event);
        }
      });
    }
  }

  ngOnChanges() {
    if (this.options.active === false && this.tooltip) {
      this.hideTooltip();
    }
  }

  /**
   * 获取关闭按钮
   * @param el
   */
  private getCloseElement(el: any) {
    let className = el.className;
    if(/di-close-but/.test(className)) return;
    let children: any = el.children;
    for(let key in children) {
      if(children[key].nodeType === 1) {
        className = children[key].className;
        if(/di-close-but/.test(className)) {
          children[key].addEventListener('click', (event: MouseEvent) => {
            this.hideTooltip(event);
          });
          return false;
        }
        this.getCloseElement(children[key]);
      }
    }
  }

  private showTooltip(event: MouseEvent) {
    let componentFactory = this.componentResolver.resolveComponentFactory(TooltipComponent);
    // 如果有指定的目标viewContainer 则生成在目标container中
    if (this.tooltipOptions.hasOwnProperty('viewContainer') && typeof this.tooltipOptions.viewContainer.createComponent === 'function') {
      this.tooltip = this.tooltipOptions.viewContainer.createComponent(componentFactory);
    } else {
      this.tooltip = this.viewContainer.createComponent(componentFactory);
    }
    // position param init
    this.tooltipOptions.x = event.clientX;
    this.tooltipOptions.y = event.clientY;

    this.tooltip.instance.parentEl = this.elementRef;
    this.tooltip.instance.tooltipOptions = this.options;
    this.tooltip.changeDetectorRef.detectChanges();
    if (this.options.dismissable) {
    }
    this.getCloseElement(this.tooltip.location.nativeElement);
  }

  private hideTooltip(event?: MouseEvent) {
    this.tooltip.destroy();
    this.timer = null;
    //this.$("html").off("click." + this.tooltipId);
    this.tooltip = undefined;
  }

  private get options(): TooltipOptions {
    return this._.defaults({}, this.tooltipOptions || {}, this.defaultTooltipOptions);
  }
}