import {Directive, ElementRef, Input, ContentChild, Renderer, AfterContentInit} from '@angular/core';

@Directive({
  selector: '[toggle-group]'
})
export class ToggleGroupDirective implements AfterContentInit {
  @ContentChild('toggleBtn') toggleBtn: any;
  @ContentChild('toggleList') toggleList: any;

  @ContentChild('toggleElement') toggleElement: any;

  @ContentChild('toggleStatus') toggleStatus: any;

  // style
  public isExpanded: boolean = true;

  public _toggleClass: string = "close";
  public _toggleHideClass: string = 'hide';
  public _removeToggleClass: string;
  public _toggleEvent: string = 'click';

  @Input() set toggleClass(value: string) {
    this._toggleClass = value;
  }

  @Input() set toggleHideClass(value: string) {
    this._toggleHideClass = value;
  }

  @Input() set toggleData(value: any) {
    this._toggleEvent = value.event ? value.event : this._toggleEvent;
    this._toggleClass = value.toggleClass ? value.toggleClass : this._toggleClass;
    this._toggleHideClass = value.toggleHideClass ? value.toggleHideClass : this._toggleHideClass;
    this._removeToggleClass = value.removeToggleClass ? value.removeToggleClass : this._removeToggleClass;

  }

  constructor(public el: ElementRef,
              public renderer: Renderer) {
  }

  //初始化页面后
  //ngOnInit() {
  //}
  //初始化页面后
  ngAfterContentInit() {
    this.toggleElement = this.toggleElement ? this.toggleElement : this.toggleBtn;
    this.toggleStatus = this.toggleStatus ? this.toggleStatus : this.toggleBtn;
    if (this.toggleElement) {
      this.toggleElement.nativeElement
        .addEventListener(this._toggleEvent, (event: any) => this.toggle(event));

      if (this._toggleEvent === 'mouseover') {
        this.toggleElement.nativeElement
          .addEventListener('mouseout', (event: any) => this.toggle(event));
      }
    }
  }

  public toggle(event: any) {
    event.stopPropagation();
    if (this.isExpanded) {
      setTimeout(() => {

        if (this.toggleBtn) {
          if (this._toggleClass) {
            this.renderer.setElementClass(
              this.toggleStatus.nativeElement, this._toggleClass, true
            );
          }

          //要移除的样式
          if (this._removeToggleClass) {
            this.renderer.setElementClass(
              this.toggleStatus.nativeElement, this._removeToggleClass, false
            );
          }

        }

        if (this.toggleList) {
          this.renderer.setElementClass(
            this.toggleList.nativeElement, this._toggleHideClass, true);
        }

      }, 4);
    } else {
      setTimeout(() => {
        if (this.toggleBtn) {
          if (this._toggleClass) {
            this.renderer.setElementClass(
              this.toggleStatus.nativeElement, this._toggleClass, false);
          }

          //要移除的样式
          if (this._removeToggleClass) {
            this.renderer.setElementClass(
              this.toggleStatus.nativeElement, this._removeToggleClass, true);
          }

        }
        if (this.toggleList) {
          this.renderer.setElementClass(
            this.toggleList.nativeElement, this._toggleHideClass, false);
        }
      }, 4);
    }
    this.isExpanded = !this.isExpanded;
  }
}
